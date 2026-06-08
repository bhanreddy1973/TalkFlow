"""Audio recording module using sounddevice."""

import os
import threading
import tempfile
import numpy as np
import sounddevice as sd
from scipy.io.wavfile import write as write_wav
from pathlib import Path
from typing import Callable, Optional


class AudioRecorder:
    """Records audio from microphone with push-to-talk or toggle support."""

    # RMS threshold below which audio is considered silence (for silence detection)
    SILENCE_RMS_THRESHOLD = 0.01
    # If entire recording is below this average RMS, warn the user
    LOW_AUDIO_THRESHOLD = 0.005

    def __init__(
        self,
        sample_rate: int = 16000,
        channels: int = 1,
        dtype: str = "float32",
        device: Optional[int] = None,
        max_duration: float = 300.0,
        silence_timeout: float = 0.0,
        silence_threshold: float = 0.01,
    ):
        self.sample_rate = sample_rate
        self.channels = channels
        self.dtype = dtype
        self.device = device
        self.max_duration = max_duration  # Max recording duration in seconds
        self.silence_timeout = silence_timeout  # Seconds of silence before auto-stop (0 = disabled)
        self.silence_threshold = silence_threshold  # RMS below this = silence

        self._recording = False
        self._starting = False  # Prevents race condition during startup
        self._audio_chunks: list[np.ndarray] = []
        self._stream: Optional[sd.InputStream] = None
        self._state_lock = threading.Lock()  # Protects _recording and _starting
        self._chunks_lock = threading.Lock()  # Protects _audio_chunks
        self._max_duration_timer: Optional[threading.Timer] = None

        # Silence detection state
        self._silence_start: Optional[float] = None  # Timestamp when silence began
        self._has_had_speech: bool = False  # Only auto-stop after we've detected some speech first

        self._debug = os.environ.get("TALKFLOW_DEBUG", "0").lower() not in {"0", "false", "no", "off"}

        # Audio level monitoring
        self._current_rms: float = 0.0
        self._peak_rms: float = 0.0

        self.on_recording_start: Optional[Callable[[], None]] = None
        self.on_recording_stop: Optional[Callable[[str], None]] = None
        self.on_audio_level: Optional[Callable[[float], None]] = None  # Real-time audio level callback
        self.on_audio_chunk: Optional[Callable[[np.ndarray], None]] = None  # Raw audio chunk callback
        self.on_max_duration_reached: Optional[Callable[[], None]] = None
        self.on_silence_timeout: Optional[Callable[[], None]] = None  # Called when silence auto-stop triggers

    def _debug_log(self, msg: str) -> None:
        if self._debug:
            print(f"[debug][recorder] {msg}", flush=True)

    def _check_silence(self, rms: float) -> None:
        """Check if silence has lasted longer than the timeout threshold.

        Only triggers auto-stop if:
        1. silence_timeout is configured (> 0)
        2. We've detected speech at some point (prevents instant stop on quiet start)
        3. Silence duration exceeds the threshold
        """
        import time as _time

        if self.silence_timeout <= 0:
            return

        if rms >= self.silence_threshold:
            # Audio detected — reset silence counter and mark that we've had speech
            self._silence_start = None
            self._has_had_speech = True
            return

        # Below threshold (silence)
        if not self._has_had_speech:
            # Haven't heard any speech yet, don't trigger auto-stop
            return

        now = _time.time()
        if self._silence_start is None:
            self._silence_start = now
            return

        silence_duration = now - self._silence_start
        if silence_duration >= self.silence_timeout:
            self._debug_log(
                f"silence timeout reached ({silence_duration:.1f}s >= {self.silence_timeout}s)"
            )
            self._silence_start = None
            if self.on_silence_timeout:
                # Fire on a separate thread to avoid blocking the audio callback
                threading.Thread(target=self.on_silence_timeout, daemon=True).start()

    @property
    def is_recording(self) -> bool:
        """Check if currently recording."""
        with self._state_lock:
            return self._recording

    @property
    def is_active(self) -> bool:
        """Check if recording or about to record (for race condition handling)."""
        with self._state_lock:
            return self._recording or self._starting

    def _audio_callback(self, indata: np.ndarray, frames: int, time_info, status):
        """Callback for audio stream - stores audio chunks and monitors levels."""
        if status:
            self._debug_log(f"audio status: {status}")
        if self._recording:
            chunk = indata.copy()
            with self._chunks_lock:
                self._audio_chunks.append(chunk)

            # Calculate RMS for audio level monitoring
            rms = float(np.sqrt(np.mean(chunk ** 2)))
            self._current_rms = rms
            self._peak_rms = max(self._peak_rms, rms)

            if self.on_audio_level:
                try:
                    self.on_audio_level(rms)
                except Exception:
                    pass

            if self.on_audio_chunk:
                try:
                    self.on_audio_chunk(chunk)
                except Exception:
                    pass

            # Silence detection (only in toggle mode, controlled by silence_timeout > 0)
            self._check_silence(rms)

    def start_recording(self) -> bool:
        """Start recording audio.
        
        Returns:
            True if recording started, False if already recording or failed.
        """
        with self._state_lock:
            if self._recording or self._starting:
                self._debug_log("start_recording called but already recording/starting")
                return False
            self._starting = True

        self._debug_log("start_recording: initializing stream")

        try:
            with self._chunks_lock:
                self._audio_chunks = []

            self._current_rms = 0.0
            self._peak_rms = 0.0
            self._silence_start = None
            self._has_had_speech = False

            self._stream = sd.InputStream(
                samplerate=self.sample_rate,
                channels=self.channels,
                dtype=self.dtype,
                device=self.device,
                callback=self._audio_callback,
            )
            self._stream.start()

            with self._state_lock:
                self._recording = True
                self._starting = False

            # Start max duration safety timer
            if self.max_duration > 0:
                self._max_duration_timer = threading.Timer(
                    self.max_duration, self._on_max_duration
                )
                self._max_duration_timer.daemon = True
                self._max_duration_timer.start()

            self._debug_log("start_recording: stream started successfully")

            if self.on_recording_start:
                self.on_recording_start()

            return True

        except Exception as e:
            self._debug_log(f"start_recording failed: {e}")
            with self._state_lock:
                self._starting = False
                self._recording = False
            return False

    def _on_max_duration(self) -> None:
        """Called when max recording duration is reached."""
        self._debug_log(f"max duration ({self.max_duration}s) reached, auto-stopping")
        if self.on_max_duration_reached:
            self.on_max_duration_reached()

    def stop_recording(self) -> Optional[str]:
        """Stop recording and save to temporary WAV file.
        
        Returns:
            Path to the temporary WAV file, or None if no audio recorded.
        """
        # Cancel the max duration timer
        if self._max_duration_timer:
            self._max_duration_timer.cancel()
            self._max_duration_timer = None

        with self._state_lock:
            if not self._recording:
                self._debug_log("stop_recording called but not recording")
                return None
            self._recording = False

        self._debug_log("stop_recording: stopping stream")

        if self._stream:
            try:
                self._stream.stop()
                self._stream.close()
            except Exception as e:
                self._debug_log(f"error closing stream: {e}")
            self._stream = None

        with self._chunks_lock:
            if not self._audio_chunks:
                self._debug_log("stop_recording: no audio chunks captured")
                return None

            audio_data = np.concatenate(self._audio_chunks, axis=0)
            self._audio_chunks = []

        self._debug_log(f"stop_recording: captured {len(audio_data)} samples ({len(audio_data)/self.sample_rate:.2f}s)")

        if len(audio_data) < self.sample_rate * 0.3:  # At least 0.3 seconds
            self._debug_log("stop_recording: audio too short, discarding")
            return None

        # Check for low audio levels (potential mic issue)
        avg_rms = float(np.sqrt(np.mean(audio_data ** 2)))
        if avg_rms < self.LOW_AUDIO_THRESHOLD:
            self._debug_log(f"stop_recording: very low audio level (RMS={avg_rms:.6f}), mic may be muted")

        temp_file = tempfile.NamedTemporaryFile(
            suffix=".wav", delete=False, prefix="talkflow_"
        )
        temp_path = temp_file.name
        temp_file.close()

        audio_int16 = (audio_data * 32767).astype(np.int16)
        write_wav(temp_path, self.sample_rate, audio_int16)

        self._debug_log(f"stop_recording: saved to {temp_path} (avg_rms={avg_rms:.4f}, peak_rms={self._peak_rms:.4f})")

        if self.on_recording_stop:
            self.on_recording_stop(temp_path)

        return temp_path

    def toggle_recording(self) -> Optional[str]:
        """Toggle recording state. Returns audio path when stopping."""
        with self._state_lock:
            currently_recording = self._recording

        if currently_recording:
            return self.stop_recording()
        else:
            self.start_recording()
            return None

    def get_audio_devices(self) -> list[dict]:
        """Get list of available audio input devices."""
        devices = sd.query_devices()
        input_devices = []

        for i, device in enumerate(devices):
            if device["max_input_channels"] > 0:
                input_devices.append({
                    "id": i,
                    "name": device["name"],
                    "channels": device["max_input_channels"],
                    "sample_rate": device["default_samplerate"],
                })

        return input_devices

    def set_device(self, device_id: Optional[int]) -> None:
        """Set the audio input device."""
        self.device = device_id

    @property
    def current_audio_level(self) -> float:
        """Get the current audio RMS level (0.0 to 1.0 range approximately)."""
        return self._current_rms

    @property
    def peak_audio_level(self) -> float:
        """Get the peak audio RMS level recorded in the current session."""
        return self._peak_rms

    def cleanup(self) -> None:
        """Clean up resources."""
        self._debug_log("cleanup called")
        if self._max_duration_timer:
            self._max_duration_timer.cancel()
            self._max_duration_timer = None
        with self._state_lock:
            if self._recording:
                self._recording = False
        if self._stream:
            try:
                self._stream.stop()
                self._stream.close()
            except Exception:
                pass
            self._stream = None
