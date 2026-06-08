# TalkFlow - Architecture

## Overview

TalkFlow is a 100% local, privacy-focused voice-to-text dictation tool for macOS. It uses OpenAI's Whisper model (via faster-whisper) to transcribe speech and paste it at the cursor position in any application.

---

## 1. End-to-End Flow (Push-to-Talk)

```mermaid
sequenceDiagram
    participant U as User
    participant HK as HotkeyManager
    participant AR as AudioRecorder
    participant WE as WhisperEngine
    participant TP as TextProcessor
    participant TI as TextInserter
    participant MB as MenuBarApp
    participant H as History

    U->>HK: Press Ctrl+.
    HK->>HK: Normalize keys, check match
    HK->>AR: on_hotkey_press → start_recording()
    AR->>AR: Open InputStream, start timer
    AR->>MB: set_recording_state(true)
    MB->>MB: Show 🔴 icon
    Note over AR: 🔊 afplay Tink.aiff

    loop Audio Capture
        AR->>AR: _audio_callback(chunk)
        AR->>AR: Calculate RMS, check silence
    end

    U->>HK: Release Ctrl+.
    HK->>AR: on_hotkey_release → stop_recording()
    AR->>AR: Close stream, concat chunks
    AR->>AR: Save WAV to temp file
    Note over AR: 🔊 afplay Pop.aiff
    AR->>MB: set_recording_state(false)

    AR-->>WE: audio_path (background thread)
    MB->>MB: Show ⏳ icon
    WE->>WE: Load model if needed
    WE->>WE: transcribe(audio_path)
    WE-->>TP: raw text

    TP->>TP: Apply spoken commands
    TP->>TP: Replace punctuation
    TP->>TP: Apply formatting
    TP->>TP: Clean spacing

    alt Preview enabled
        TP-->>U: Show osascript dialog
        U-->>TP: Confirm or Cancel
    end

    TP-->>TI: processed text
    TI->>TI: Save clipboard
    TI->>TI: Copy text → Cmd+V paste
    TI->>TI: Wait 350ms, restore clipboard
    Note over TI: 🔊 afplay Glass.aiff

    TP-->>H: Save to history.json
    MB->>MB: Show 🎤 idle
```

---

## 2. Silence Auto-Stop Flow (Toggle Mode)

```mermaid
flowchart TD
    A[User presses hotkey] --> B[Recording starts]
    B --> C{Audio callback}
    C -->|RMS >= threshold| D[Reset silence timer]
    D --> E[Mark has_had_speech = true]
    E --> C
    C -->|RMS < threshold| F{has_had_speech?}
    F -->|No| C
    F -->|Yes| G{silence_start set?}
    G -->|No| H[Set silence_start = now]
    H --> C
    G -->|Yes| I{Duration >= timeout?}
    I -->|No| C
    I -->|Yes| J[🤫 Fire on_silence_timeout]
    J --> K[Auto-stop recording]
    K --> L[Transcribe & paste]
```

---

## 3. Text Processing Pipeline

```mermaid
flowchart LR
    A[Raw Whisper Text] --> B[Capitalization Commands]
    B --> C[Formatting Commands]
    C --> D[Punctuation Replacement]
    D --> E[Spacing Cleanup]
    E --> F[Final Text]

    subgraph B[Capitalization]
        B1["'all caps hello' → 'HELLO'"]
        B2["'capitalize world' → 'World'"]
    end

    subgraph C[Formatting]
        C1["'new line' → \\n"]
        C2["'new paragraph' → \\n\\n"]
    end

    subgraph D[Punctuation]
        D1["'period' → '.'"]
        D2["'comma' → ','"]
        D3["'question mark' → '?'"]
    end

    subgraph E[Cleanup]
        E1[Remove double spaces]
        E2[Capitalize after . ! ?]
        E3[Fix spacing around punct]
    end
```

---

## 4. Application Startup

```mermaid
flowchart TD
    A[run.py] --> B[Write PID file]
    B --> C[Add src/ to sys.path]
    C --> D[Import main.py]
    D --> E[Config.load from TOML]
    E --> F[Create AudioRecorder]
    E --> G[Create WhisperEngine]
    E --> H[Create TextInserter]
    E --> I[Create TextProcessor]
    E --> J[Create HotkeyManager]
    F --> K[Wire callbacks]
    G --> K
    H --> K
    J --> K
    K --> L[Start hotkey listener thread]
    L --> M[Preload model in background thread]
    M --> N[Create MenuBarApp]
    N --> O[rumps.App.run - main thread blocks]
```

---

## 5. Component Class Diagram

```mermaid
classDiagram
    class TalkFlowApp {
        -Config config
        -AudioRecorder audio_recorder
        -WhisperEngine whisper_engine
        -TextInserter text_inserter
        -TextProcessor text_processor
        -HotkeyManager hotkey_manager
        -TranscriptionHistory history
        -MenuBarApp menu_app
        -bool _is_processing
        -int _total_transcriptions
        +run()
        +get_stats() dict
        -_on_hotkey_press()
        -_on_hotkey_release()
        -_stop_and_transcribe()
        -_transcribe_and_insert(path)
        -_play_sound(type)
        -_show_preview(text) bool
        -_on_silence_timeout()
    }

    class AudioRecorder {
        -int sample_rate
        -float max_duration
        -float silence_timeout
        -float silence_threshold
        -bool _recording
        -list _audio_chunks
        -float _current_rms
        -bool _has_had_speech
        +start_recording() bool
        +stop_recording() Optional~str~
        +cleanup()
        -_audio_callback(indata)
        -_check_silence(rms)
    }

    class WhisperEngine {
        -str model_name
        -str device
        -WhisperModel _model
        +load_model()
        +transcribe(path) TranscriptionResult
        +change_model(name)
        +unload_model()
    }

    class TextProcessor {
        -bool enabled
        -Pattern _command_pattern
        +process(text) str
        -_apply_capitalization(text) str
        -_apply_formatting(text) str
        -_apply_punctuation(text) str
        -_clean_spacing(text) str
    }

    class TextInserter {
        -Controller _keyboard
        +insert_text(text) bool
        -_insert_via_clipboard(text) bool
    }

    class HotkeyManager {
        -Set _hotkey
        -Set _current_keys
        -str _mode
        +start()
        +stop()
        +set_hotkey(keys)
        +set_mode(mode)
        +parse_hotkey_string(str)$ Set
    }

    class TranscriptionHistory {
        -list _entries
        +add(text, lang, dur, model)
        +get_last(n) list
        +get_last_text() Optional~str~
        +clear()
    }

    class MenuBarApp {
        +set_recording_state(bool)
        +set_processing_state(bool)
        +show_notification(title, msg)
        +show_error(msg)
        +run()
    }

    class Config {
        +AudioConfig audio
        +WhisperConfig whisper
        +HotkeyConfig hotkey
        +OutputConfig output
        +AppConfig app
        +load()$ Config
        +save()
    }

    TalkFlowApp --> AudioRecorder
    TalkFlowApp --> WhisperEngine
    TalkFlowApp --> TextInserter
    TalkFlowApp --> TextProcessor
    TalkFlowApp --> HotkeyManager
    TalkFlowApp --> TranscriptionHistory
    TalkFlowApp --> MenuBarApp
    TalkFlowApp --> Config
```

---

## 6. State Machine

```mermaid
stateDiagram-v2
    [*] --> Idle

    Idle --> Recording: Hotkey Pressed
    Recording --> Saving: Hotkey Released
    Recording --> Saving: Silence Timeout
    Recording --> Saving: Max Duration
    Recording --> Idle: Audio < 0.3s
    Saving --> Processing: WAV saved
    Processing --> TextProcessing: Raw text ready
    TextProcessing --> Preview: preview_before_paste = true
    TextProcessing --> Inserting: preview disabled
    Preview --> Inserting: User confirms
    Preview --> Idle: User cancels
    Processing --> Idle: No speech / Error
    Inserting --> Idle: Text pasted

    state Recording {
        [*] --> Capturing
        Capturing --> Capturing: Chunk received
        Capturing --> SilenceDetected: RMS < threshold
        SilenceDetected --> Capturing: Speech resumes
        SilenceDetected --> AutoStop: Timeout exceeded
    }
```

---

## 7. Threading Model

```mermaid
flowchart TD
    subgraph Main["Main Thread (rumps CFRunLoop)"]
        A[MenuBarApp.run]
        B[Handle menu clicks]
        C[Update UI state]
    end

    subgraph Listener["pynput Listener Thread"]
        D[keyboard.Listener]
        E[_on_press / _on_release]
    end

    subgraph Workers["Daemon Worker Threads"]
        F[hotkey_press handler]
        G[hotkey_release handler]
        H[_transcribe_and_insert]
        I[preload_model]
        J[_play_sound subprocess]
        K[silence_timeout handler]
    end

    subgraph Audio["sounddevice Audio Thread"]
        L[InputStream callback]
        M[RMS calculation]
        N[Silence check]
    end

    E -->|Thread| F
    E -->|Thread| G
    G --> H
    L --> M --> N
    N -->|Thread| K
```

---

## 8. Data Flow

```mermaid
flowchart LR
    subgraph Input
        MIC[🎙️ Microphone]
        KB[⌨️ Keyboard]
    end

    subgraph Processing
        WAV[📁 Temp WAV]
        MODEL[🧠 Whisper int8]
        PROC[✏️ TextProcessor]
    end

    subgraph Output
        CLIP[📋 Clipboard]
        CURSOR[📝 Text Field]
        DIALOG[💬 Preview Dialog]
    end

    subgraph Storage
        CONFIG[⚙️ config.toml]
        HIST[📜 history.json]
    end

    MIC -->|sounddevice| WAV
    KB -->|pynput| WAV
    WAV -->|faster-whisper| MODEL
    MODEL --> PROC
    PROC -->|optional| DIALOG
    PROC --> CLIP
    CLIP -->|Cmd+V| CURSOR
    MODEL --> HIST
    CONFIG --> MODEL
```

---

## Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Audio Capture | sounddevice + numpy | Real-time mic recording at 16kHz float32 |
| Audio Storage | scipy write_wav | float32 → int16 PCM WAV conversion |
| Speech-to-Text | faster-whisper (CTranslate2) | Local Whisper inference, int8 on CPU |
| Text Processing | regex | Spoken command → punctuation/formatting |
| Text Insertion | pynput + pyperclip | Clipboard paste via Cmd+V with save/restore |
| Hotkey Detection | pynput keyboard.Listener | Global keyboard monitoring |
| Menu Bar UI | rumps | macOS native menu bar app |
| Configuration | toml + dataclasses | Type-safe config with auto-migration |
| History | json | Last 50 transcriptions persisted |
| Sound Feedback | subprocess afplay | System sounds for states |
| Preview Dialog | osascript | Native macOS dialog for confirmation |

---

## File Structure

```
TalkFlow/
├── run.py                          # Entry point (PID, path setup)
├── config/
│   └── settings.toml               # Default config template
├── src/
│   ├── main.py                     # TalkFlowApp orchestrator + History
│   ├── core/
│   │   ├── audio_recorder.py       # Recording, silence detection, levels
│   │   ├── whisper_engine.py       # Transcription with 120s timeout
│   │   ├── text_inserter.py        # Clipboard paste with restore
│   │   ├── text_processor.py       # Spoken commands → punctuation
│   │   └── hotkey_manager.py       # Global hotkey + key normalization
│   ├── ui/
│   │   └── menu_bar.py             # rumps menu bar (state + controls)
│   └── utils/
│       └── config.py               # TOML config with dataclasses
├── scripts/
│   ├── install.sh                  # One-command setup
│   ├── start.sh / stop.sh          # Process management
│   ├── autostart.sh                # Login item management
│   └── check_permissions.py        # macOS permission helper
├── requirements.txt
├── ARCHITECTURE.md                 # This file
└── README.md
```

---

## Key Design Decisions

1. **Clipboard-only insertion** — Cmd+V ensures compatibility with all text fields including web apps with custom input handling.

2. **VAD disabled for short clips** — Silero VAD hangs on clips under 30s. Only enabled for longer recordings.

3. **Thread-per-transcription** — Each transcription runs in a daemon thread with a 120s timeout to prevent UI freezes.

4. **Max duration safety** — Configurable timer (default 300s) auto-stops to prevent resource exhaustion.

5. **Sound feedback** — System sounds (Tink/Pop/Glass/Basso) provide non-visual cues.

6. **Transcription history** — Last 50 transcriptions persisted for re-pasting.

7. **Race condition handling** — `_is_active` flag plus 500ms poll prevent double-start races.

8. **Clipboard restore** — Original clipboard saved before paste and restored after 350ms.

9. **Silence auto-stop** — Auto-stops after configured silence timeout, but only after speech has been detected first.

10. **Spoken command processing** — "period", "comma", "new line" etc. become actual punctuation/formatting.

11. **Preview before paste** — Optional native dialog shows text before pasting with 10s auto-dismiss.

---

## Spoken Commands Reference

| Say this | Gets replaced with |
|----------|-------------------|
| "period" / "full stop" | `.` |
| "comma" | `,` |
| "question mark" | `?` |
| "exclamation mark" | `!` |
| "colon" | `:` |
| "semicolon" | `;` |
| "dash" | `—` |
| "hyphen" | `-` |
| "ellipsis" | `...` |
| "new line" | line break |
| "new paragraph" | double line break |
| "tab" | tab character |
| "open quote" / "close quote" | `"` |
| "open paren" / "close paren" | `(` / `)` |
| "hashtag" / "hash" | `#` |
| "at sign" | `@` |
| "capitalize [word]" | Capitalizes next word |
| "all caps [word]" | UPPERCASES next word |
| "lowercase [word]" | lowercases next word |
