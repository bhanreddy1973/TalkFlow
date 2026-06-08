"""TalkFlow - Main application entry point."""

import os
import sys
import threading
import time
import json
from pathlib import Path
from datetime import datetime
from typing import Optional
from dataclasses import dataclass, asdict

from core.audio_recorder import AudioRecorder
from core.whisper_engine import WhisperEngine
from core.text_inserter import TextInserter
from core.text_processor import TextProcessor
from core.hotkey_manager import HotkeyManager
from core.streaming_transcriber import StreamingTranscriber
from utils.config import Config
from ui.menu_bar import MenuBarApp


@dataclass
class TranscriptionEntry:
    """A single entry in transcription history."""
    text: str
    language: str
    duration: float
    timestamp: str
    model: str


class TranscriptionHistory:
    """Manages transcription history for re-use and review."""

    MAX_ENTRIES = 50

    def __init__(self):
        self._entries: list[TranscriptionEntry] = []
        self._history_path = Path.home() / ".config" / "talkflow" / "history.json"
        self._lock = threading.Lock()
        self._load()

    def _load(self) -> None:
        """Load history from disk."""
        try:
            if self._history_path.exists():
                data = json.loads(self._history_path.read_text())
                self._entries = [TranscriptionEntry(**e) for e in data[-self.MAX_ENTRIES:]]
        except Exception:
            self._entries = []

    def _save(self) -> None:
        """Persist history to disk."""
        try:
            self._history_path.parent.mkdir(parents=True, exist_ok=True)
            data = [asdict(e) for e in self._entries[-self.MAX_ENTRIES:]]
            self._history_path.write_text(json.dumps(data, indent=2))
        except Exception:
            pass

    def add(self, text: str, language: str, duration: float, model: str) -> None:
        """Add a new transcription to history."""
        with self._lock:
            entry = TranscriptionEntry(
                text=text,
                language=language,
                duration=duration,
                timestamp=datetime.now().isoformat(),
                model=model,
            )
            self._entries.append(entry)
            if len(self._entries) > self.MAX_ENTRIES:
                self._entries = self._entries[-self.MAX_ENTRIES:]
            self._save()

    def get_last(self, n: int = 10) -> list[TranscriptionEntry]:
        """Get the last N transcription entries."""
        with self._lock:
            return list(self._entries[-n:])

    def get_last_text(self) -> Optional[str]:
        """Get just the text of the most recent transcription."""
        with self._lock:
            return self._entries[-1].text if self._entries else None

    def clear(self) -> None:
        """Clear all history."""
        with self._lock:
            self._entries = []
            self._save()


class TalkFlowApp:
    """Main TalkFlow application orchestrating all components."""

    def __init__(self, config: Optional[Config] = None):
        self.config = config or Config.load()
        self._debug_enabled = os.environ.get("TALKFLOW_DEBUG", "0").lower() not in {
            "0",
            "false",
            "no",
            "off",
        }
        self._debug_log("initializing app components")

        self.audio_recorder = AudioRecorder(
            sample_rate=self.config.audio.sample_rate,
            channels=self.config.audio.channels,
            device=self.config.audio.device_id,
            max_duration=self.config.audio.max_duration,
            silence_timeout=self.config.audio.silence_timeout,
            silence_threshold=self.config.audio.silence_threshold,
        )

        self.whisper_engine = WhisperEngine(
            model_name=self.config.whisper.model,
            device=self.config.whisper.device,
            compute_type=self.config.whisper.compute_type,
            language=self.config.whisper.language,
        )

        self.text_inserter = TextInserter(
            use_clipboard=True,
        )

        self.text_processor = TextProcessor(
            enabled=self.config.output.process_commands,
        )

        self.hotkey_manager = HotkeyManager()
        self.hotkey_manager.set_hotkey(
            HotkeyManager.parse_hotkey_string(self.config.hotkey.hotkey)
        )
        self.hotkey_manager.set_mode(self.config.hotkey.mode)

        self.history = TranscriptionHistory()

        self.menu_app: Optional[MenuBarApp] = None

        # Streaming transcription overlay
        self._overlay = None
        self._streaming_transcriber = None
        try:
            from ui.overlay import TranscriptionOverlay
            self._overlay = TranscriptionOverlay()
            self._streaming_transcriber = StreamingTranscriber(
                whisper_engine=self.whisper_engine,
                sample_rate=self.config.audio.sample_rate,
                on_partial_text=self._on_partial_transcription,
            )
            self._debug_log("streaming overlay initialized")
        except Exception as e:
            self._debug_log(f"overlay not available: {e}")

        self._setup_callbacks()

        self._is_processing = False
        self._lock = threading.Lock()

        # Statistics
        self._total_transcriptions = 0
        self._total_audio_seconds = 0.0
        self._session_start = datetime.now()

        self._debug_log("app initialized")

    def _debug_log(self, message: str) -> None:
        """Print a debug message when debug logging is enabled."""
        if self._debug_enabled:
            print(f"[debug][app] {message}", flush=True)

    def _setup_callbacks(self) -> None:
        """Set up callbacks between components."""
        self.hotkey_manager.on_hotkey_press = self._on_hotkey_press
        self.hotkey_manager.on_hotkey_release = self._on_hotkey_release

        self.audio_recorder.on_recording_start = self._on_recording_start
        self.audio_recorder.on_recording_stop = self._on_recording_stop
        self.audio_recorder.on_max_duration_reached = self._on_max_duration_reached
        self.audio_recorder.on_silence_timeout = self._on_silence_timeout

        # Feed audio to streaming transcriber
        if self._streaming_transcriber:
            self.audio_recorder.on_audio_chunk = self._on_audio_chunk

    def _on_audio_chunk(self, chunk) -> None:
        """Feed audio chunks to the streaming transcriber."""
        if self._streaming_transcriber and self._streaming_transcriber._running:
            self._streaming_transcriber.feed_audio(chunk)

    def _on_partial_transcription(self, text: str) -> None:
        """Called when streaming transcriber produces partial text."""
        self._debug_log(f"partial transcription: '{text[:60]}'")
        if self._overlay:
            self._overlay.update_text(text)

    def _play_sound(self, sound_type: str) -> None:
        """Play a system sound for audio feedback."""
        if not self.config.app.play_sounds:
            return
        try:
            import subprocess
            sound_map = {
                "start": "/System/Library/Sounds/Tink.aiff",
                "stop": "/System/Library/Sounds/Pop.aiff",
                "success": "/System/Library/Sounds/Glass.aiff",
                "error": "/System/Library/Sounds/Basso.aiff",
            }
            sound_file = sound_map.get(sound_type)
            if sound_file and Path(sound_file).exists():
                subprocess.Popen(
                    ["afplay", sound_file],
                    stdout=subprocess.DEVNULL,
                    stderr=subprocess.DEVNULL,
                )
        except Exception:
            pass

    def _on_max_duration_reached(self) -> None:
        """Called when recording hits the max duration limit."""
        self._debug_log("max duration reached, auto-stopping recording")
        print("⏱️  Max recording duration reached, auto-stopping...")
        self._stop_and_transcribe()

    def _on_silence_timeout(self) -> None:
        """Called when silence exceeds the configured timeout (auto-stop)."""
        self._debug_log("silence timeout reached, auto-stopping recording")
        print("🤫 Silence detected, auto-stopping...")
        if self.menu_app:
            self.menu_app.show_notification("TalkFlow", "Auto-stopped: silence detected")
        self._stop_and_transcribe()

    def _on_hotkey_press(self) -> None:
        """Called when hotkey is pressed."""
        self._debug_log("hotkey press callback received")
        
        with self._lock:
            if self._is_processing:
                self._debug_log("hotkey press ignored because transcription is processing")
                return
            if self.audio_recorder.is_active:
                self._debug_log("hotkey press ignored because recorder is already active")
                return

        if self.hotkey_manager.mode == "toggle":
            if self.audio_recorder.is_recording:
                self._debug_log("toggle mode: hotkey pressed while recording; stopping")
                self._stop_and_transcribe()
            else:
                self._debug_log("toggle mode: hotkey pressed while idle; starting recording")
                self.audio_recorder.start_recording()
        else:
            self._debug_log("push-to-talk mode: starting recording")
            self.audio_recorder.start_recording()

    def _on_hotkey_release(self) -> None:
        """Called when hotkey is released (push-to-talk mode)."""
        self._debug_log("hotkey release callback received")
        if self.hotkey_manager.mode == "push_to_talk":
            # Wait briefly for recording to actually start (race condition fix)
            for _ in range(10):
                if self.audio_recorder.is_recording:
                    break
                time.sleep(0.05)
            
            if self.audio_recorder.is_recording:
                self._debug_log("push-to-talk mode: stopping recording after release")
                self._stop_and_transcribe()
            else:
                self._debug_log("release ignored because recorder is not active")

    def _stop_and_transcribe(self) -> None:
        """Stop recording and start transcription."""
        self._debug_log("stop requested; saving recorded audio")
        audio_path = self.audio_recorder.stop_recording()
        if audio_path:
            self._debug_log(f"audio captured at {audio_path}; starting processing thread")
            threading.Thread(
                target=self._transcribe_and_insert,
                args=(audio_path,),
                daemon=True,
            ).start()
        else:
            self._debug_log("no audio file produced; skipping transcription")

    def _on_recording_start(self) -> None:
        """Called when recording starts."""
        self._debug_log("recorder state changed: recording started")
        print("🎤 Recording started...")
        self._play_sound("start")
        if self.menu_app:
            self.menu_app.set_recording_state(True)
        # Start streaming transcription + show overlay
        if self._overlay:
            self._overlay.show("🎤 Listening...")
        if self._streaming_transcriber and self.whisper_engine.is_loaded:
            self._streaming_transcriber.start()

    def _on_recording_stop(self, audio_path: str) -> None:
        """Called when recording stops."""
        self._debug_log(f"recorder state changed: recording stopped; file={audio_path}")
        print(f"⏹️  Recording stopped: {audio_path}")
        self._play_sound("stop")
        if self.menu_app:
            self.menu_app.set_recording_state(False)
        # Stop streaming transcription
        if self._streaming_transcriber:
            self._streaming_transcriber.stop()
        # Update overlay to show "Transcribing..."
        if self._overlay:
            self._overlay.update_text("⏳ Transcribing...")

    def _transcribe_and_insert(self, audio_path: str) -> None:
        """Transcribe audio and insert text at cursor."""
        with self._lock:
            if self._is_processing:
                self._debug_log("processing request ignored because another one is active")
                return
            self._is_processing = True

        try:
            self._debug_log("processing now: transcribing audio")
            if self.menu_app:
                self.menu_app.set_processing_state(True)

            print("🔄 Transcribing...")
            result = self.whisper_engine.transcribe(audio_path)
            self._debug_log(
                f"transcription finished: language={result.language}, "
                f"duration={result.duration:.2f}s, chars={len(result.text)}"
            )

            if result.text:
                text = result.text.strip()

                # Apply spoken command processing (punctuation, formatting)
                text = self.text_processor.process(text)

                if self.config.output.add_trailing_space:
                    text += " "

                print(f"📝 Transcribed: {text}")

                # Save to history
                self.history.add(
                    text=text.strip(),
                    language=result.language,
                    duration=result.duration,
                    model=self.config.whisper.model,
                )

                # Update stats
                self._total_transcriptions += 1
                self._total_audio_seconds += result.duration

                # Preview before paste (if enabled)
                if self.config.output.preview_before_paste:
                    should_paste = self._show_preview(text.strip())
                    if not should_paste:
                        self._debug_log("user cancelled paste from preview")
                        print("🚫 Paste cancelled by user")
                        return

                time.sleep(0.1)

                self._debug_log("inserting transcribed text at current cursor")
                success = self.text_inserter.insert_text(text)
                if success:
                    self._debug_log("text insertion succeeded")
                    self._play_sound("success")
                    print("✅ Text inserted at cursor")
                    # Show final text on overlay then auto-hide
                    if self._overlay:
                        self._overlay.show_final(text.strip(), auto_hide_delay=2.0)
                else:
                    self._debug_log("text insertion failed")
                    self._play_sound("error")
                    print("❌ Failed to insert text")
                    if self._overlay:
                        self._overlay.hide(delay=0)
                    if self.menu_app:
                        self.menu_app.show_error("Failed to insert text")
            else:
                self._debug_log("transcription returned empty text")
                print("⚠️  No speech detected")
                if self._overlay:
                    self._overlay.hide(delay=0)
                if self.menu_app:
                    self.menu_app.show_notification("TalkFlow", "No speech detected")

        except Exception as e:
            self._debug_log(f"error during processing: {e}")
            self._play_sound("error")
            print(f"❌ Error: {e}")
            if self._overlay:
                self._overlay.hide(delay=0)
            if self.menu_app:
                self.menu_app.show_error(str(e))

        finally:
            self._debug_log("processing complete; cleaning up temp audio")
            self._is_processing = False
            if self.menu_app:
                self.menu_app.set_processing_state(False)

            try:
                os.unlink(audio_path)
            except Exception:
                pass

    def _on_mode_change(self, mode: str) -> None:
        """Called when mode is changed from menu."""
        self._debug_log(f"mode changed from menu: {mode}")
        self.hotkey_manager.set_mode(mode)
        self.config.hotkey.mode = mode
        print(f"Mode changed to: {mode}")

    def _on_model_change(self, model: str) -> None:
        """Called when model is changed from menu."""
        self._debug_log(f"model changed from menu: {model}")
        self.whisper_engine.change_model(model)
        self.config.whisper.model = model
        print(f"Model changed to: {model}")

        if self.menu_app:
            self.menu_app.show_notification("TalkFlow", f"Switching to '{model}' model...")

        threading.Thread(
            target=self.whisper_engine.load_model,
            daemon=True,
        ).start()

    def _on_paste_last(self) -> None:
        """Re-paste the last transcription at cursor."""
        last_text = self.history.get_last_text()
        if last_text:
            self._debug_log(f"re-pasting last transcription: {last_text[:50]}...")
            success = self.text_inserter.insert_text(last_text + " ")
            if success:
                print(f"📋 Re-pasted: {last_text}")
            else:
                print("❌ Failed to re-paste")
        else:
            print("⚠️  No transcription history to paste")
            if self.menu_app:
                self.menu_app.show_notification("TalkFlow", "No transcription history")

    def _show_preview(self, text: str) -> bool:
        """Show a preview notification and ask the user to confirm paste.

        Args:
            text: The transcribed text to preview.

        Returns:
            True if user confirms (or preview disabled), False to cancel.
        """
        import subprocess

        self._debug_log(f"showing preview: {text[:80]}...")

        # Use osascript to show a dialog with OK/Cancel
        # Truncate display text for the dialog if very long
        display_text = text if len(text) <= 200 else text[:197] + "..."
        display_text = display_text.replace('"', '\\"').replace('\n', '\\n')

        script = (
            f'display dialog "Paste this text?\\n\\n{display_text}" '
            f'with title "TalkFlow Preview" '
            f'buttons {{"Cancel", "Paste"}} default button "Paste" '
            f'giving up after 10'
        )

        try:
            result = subprocess.run(
                ["osascript", "-e", script],
                capture_output=True,
                text=True,
                timeout=15,
            )
            # osascript returns 0 if user clicked a button, non-zero if cancelled
            if result.returncode != 0:
                return False
            # Check if "Cancel" was pressed
            if "Cancel" in result.stdout:
                return False
            return True
        except (subprocess.TimeoutExpired, Exception) as e:
            self._debug_log(f"preview dialog error: {e}, defaulting to paste")
            # If dialog fails/times out, just paste anyway
            return True

    def _on_quit(self) -> None:
        """Called when app is quit."""
        self._debug_log("quit requested; stopping listeners and saving config")
        print("Shutting down TalkFlow...")
        self.hotkey_manager.stop()
        self.audio_recorder.cleanup()
        self.config.save()
        self._remove_pid_file()

        # Print session stats
        stats = self.get_stats()
        print(f"\n📊 Session stats: {stats['total_transcriptions']} transcriptions, "
              f"{stats['total_audio_seconds']}s audio, uptime {stats['session_uptime']}")

    @staticmethod
    def _remove_pid_file() -> None:
        """Remove PID file on shutdown."""
        pid_file = Path(__file__).resolve().parent.parent / ".talkflow.pid"
        try:
            pid_file.unlink(missing_ok=True)
        except OSError:
            pass

    def preload_model(self) -> None:
        """Preload the Whisper model in background."""
        def load():
            self._debug_log("model preload started")
            print(f"Preloading Whisper model '{self.config.whisper.model}'...")
            self.whisper_engine.load_model()
            self._debug_log("model preload finished")
            print("Model ready!")

        threading.Thread(target=load, daemon=True).start()

    def get_stats(self) -> dict:
        """Get session statistics."""
        uptime = datetime.now() - self._session_start
        return {
            "total_transcriptions": self._total_transcriptions,
            "total_audio_seconds": round(self._total_audio_seconds, 1),
            "session_uptime": str(uptime).split(".")[0],
            "model": self.config.whisper.model,
            "mode": self.config.hotkey.mode,
        }

    def run(self) -> None:
        """Run the application."""
        hotkey_label = HotkeyManager.format_hotkey_label(self.config.hotkey.hotkey)

        print("=" * 50)
        print("  TalkFlow - Voice Typing")
        print("=" * 50)
        print(f"  Hotkey: {hotkey_label}")
        print(f"  Mode: {self.config.hotkey.mode}")
        print(f"  Model: {self.config.whisper.model}")
        print(f"  Language: {self.config.whisper.language or 'auto'}")
        print(f"  Max recording: {self.config.audio.max_duration}s")
        print(f"  Silence auto-stop: {self.config.audio.silence_timeout}s" if self.config.audio.silence_timeout > 0 else "  Silence auto-stop: disabled")
        print(f"  Spoken commands: {'on' if self.config.output.process_commands else 'off'}")
        print(f"  Preview before paste: {'on' if self.config.output.preview_before_paste else 'off'}")
        print("=" * 50)

        self.hotkey_manager.start()
        self._debug_log("started listening for global hotkey")
        print("✓ Hotkey listener started")

        self.preload_model()

        self.menu_app = MenuBarApp(
            hotkey_label=hotkey_label,
            on_quit=self._on_quit,
            on_toggle_mode=self._on_mode_change,
            on_model_change=self._on_model_change,
            on_paste_last=self._on_paste_last,
        )
        self.menu_app.set_mode(self.config.hotkey.mode)
        self.menu_app.set_model(self.config.whisper.model)

        print("✓ Menu bar app started")
        print(f"\nTalkFlow is ready! Press {hotkey_label} to start recording.\n")

        self.menu_app.run()


def main():
    """Main entry point."""
    config = Config.load()
    
    app = TalkFlowApp(config)
    
    try:
        app.run()
    except KeyboardInterrupt:
        print("\nShutting down...")
        app._on_quit()


if __name__ == "__main__":
    main()
