"""Streaming transcription - transcribes audio in chunks while recording."""

import os
import threading
import tempfile
import time
import numpy as np
from scipy.io.wavfile import write as write_wav
from typing import Callable, Optional


class StreamingTranscriber:
    """Transcribes audio in real-time by processing buffered chunks periodically.
    
    Uses a sliding window approach: every N seconds of audio, run Whisper on
    the accumulated buffer and emit partial results to a callback.
    """

    # How often to run transcription on buffered audio (seconds)
    CHUNK_INTERVAL = 2.5
    # Minimum audio length to attempt transcription (seconds)
    MIN_AUDIO_LENGTH = 1.0

    def __init__(
        self,
        whisper_engine,
        sample_rate: int = 16000,
        on_partial_text: Optional[Callable[[str], None]] = None,
    ):
        """Initialize streaming transcriber.
        
        Args:
            whisper_engine: WhisperEngine instance (must be loaded).
            sample_rate: Audio sample rate.
            on_partial_text: Callback fired with partial transcription text.
        """
        self._engine = whisper_engine
        self._sample_rate = sample_rate
        self.on_partial_text = on_partial_text

        self._audio_buffer: list[np.ndarray] = []
        self._buffer_lock = threading.Lock()
        self._running = False
        self._thread: Optional[threading.Thread] = None
        self._last_text = ""
        self._debug = os.environ.get("TALKFLOW_DEBUG", "0").lower() not in {"0", "false", "no", "off"}

    def _debug_log(self, msg: str) -> None:
        if self._debug:
            print(f"[debug][streaming] {msg}", flush=True)

    def start(self) -> None:
        """Start the streaming transcription loop."""
        if self._running:
            return
        self._running = True
        self._audio_buffer = []
        self._last_text = ""
        self._thread = threading.Thread(target=self._transcription_loop, daemon=True)
        self._thread.start()
        self._debug_log("streaming transcription started")

    def stop(self) -> str:
        """Stop streaming and return the last partial text."""
        self._running = False
        if self._thread:
            self._thread.join(timeout=5.0)
            self._thread = None
        self._debug_log(f"streaming transcription stopped; last_text='{self._last_text[:50]}'")
        return self._last_text

    def feed_audio(self, chunk: np.ndarray) -> None:
        """Feed an audio chunk from the recorder callback."""
        with self._buffer_lock:
            self._audio_buffer.append(chunk.copy())

    def _transcription_loop(self) -> None:
        """Periodically transcribe the accumulated audio buffer."""
        while self._running:
            time.sleep(self.CHUNK_INTERVAL)
            if not self._running:
                break

            # Get current buffer
            with self._buffer_lock:
                if not self._audio_buffer:
                    continue
                audio_data = np.concatenate(self._audio_buffer, axis=0)

            # Check minimum length
            duration = len(audio_data) / self._sample_rate
            if duration < self.MIN_AUDIO_LENGTH:
                continue

            # Transcribe the buffer
            try:
                text = self._transcribe_buffer(audio_data)
                if text and text != self._last_text:
                    self._last_text = text
                    self._debug_log(f"partial: '{text[:80]}'")
                    if self.on_partial_text:
                        self.on_partial_text(text)
            except Exception as e:
                self._debug_log(f"streaming transcription error: {e}")

    def _transcribe_buffer(self, audio_data: np.ndarray) -> str:
        """Transcribe an audio buffer using the whisper engine."""
        # Ensure model is loaded
        if not self._engine.is_loaded:
            return ""

        # Write to temporary WAV file
        tmp = tempfile.NamedTemporaryFile(suffix=".wav", delete=False, prefix="talkflow_stream_")
        tmp_path = tmp.name
        tmp.close()

        try:
            # Convert float32 to int16
            if audio_data.dtype == np.float32:
                audio_int16 = (audio_data * 32767).astype(np.int16)
            else:
                audio_int16 = audio_data

            # Flatten if needed (mono)
            if audio_int16.ndim > 1:
                audio_int16 = audio_int16.flatten()

            write_wav(tmp_path, self._sample_rate, audio_int16)

            # Use the engine's model directly for faster partial transcription
            segments_gen, info = self._engine._model.transcribe(
                tmp_path,
                language=self._engine.language,
                beam_size=1,
                best_of=1,
                patience=1,
                vad_filter=False,
                condition_on_previous_text=False,
                temperature=0.0,
                no_speech_threshold=0.6,
            )

            text_parts = []
            for segment in segments_gen:
                text_parts.append(segment.text.strip())

            return " ".join(text_parts).strip()

        finally:
            try:
                os.unlink(tmp_path)
            except Exception:
                pass
