#!/usr/bin/env python3
"""Test script - records for 5 seconds and transcribes (no hotkey needed)."""

import sys
import time
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent / "src"))

from utils.config import Config
from core.audio_recorder import AudioRecorder
from core.whisper_engine import WhisperEngine
from core.text_processor import TextProcessor

def main():
    config = Config.load()
    
    # Test 1: Check microphone access
    print("=" * 50)
    print("  TalkFlow Test Mode")
    print("=" * 50)
    print()
    
    # Test 2: Record audio
    print("🎤 Recording for 10 seconds... SPEAK NOW!")
    print()
    
    recorder = AudioRecorder(
        sample_rate=config.audio.sample_rate,
        channels=config.audio.channels,
        device=config.audio.device_id,
        max_duration=config.audio.max_duration,
        silence_timeout=0,  # Disable silence auto-stop for test
        silence_threshold=config.audio.silence_threshold,
    )
    recorder.start_recording()
    
    time.sleep(10)
    
    audio_path = recorder.stop_recording()
    
    if not audio_path:
        print("❌ No audio captured. Check microphone permissions.")
        print("   Go to: System Settings → Privacy & Security → Microphone")
        print("   Add Cursor.app")
        return
    
    print(f"✅ Audio saved: {audio_path}")
    print()
    
    # Test 3: Transcribe
    print("🔄 Transcribing...")
    engine = WhisperEngine(
        model_name=config.whisper.model,
        device=config.whisper.device,
        compute_type=config.whisper.compute_type,
        language=config.whisper.language,
    )
    result = engine.transcribe(audio_path)
    
    if not result or not result.text.strip():
        print("❌ No transcription result (empty). Whisper returned nothing.")
        return
    
    raw_text = result.text.strip()
    print(f"✅ Raw transcription: \"{raw_text}\"")
    print(f"   Language: {result.language}, Duration: {result.duration:.1f}s")
    print()
    
    # Test 4: Text processing
    processor = TextProcessor(enabled=config.output.process_commands)
    processed = processor.process(raw_text)
    print(f"✅ Processed text: \"{processed}\"")
    print()
    
    # Test 5: Clipboard paste
    print("📋 Copying to clipboard...")
    import pyperclip
    pyperclip.copy(processed)
    print(f"✅ Text copied to clipboard! Paste with ⌘+V to verify.")
    print()
    print("=" * 50)
    print("  ALL TESTS PASSED ✅")
    print("=" * 50)

if __name__ == "__main__":
    main()
