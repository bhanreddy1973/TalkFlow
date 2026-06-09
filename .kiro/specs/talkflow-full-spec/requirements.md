# TalkFlow — Full Specification

## Overview

TalkFlow is a macOS-native, 100% local voice-to-text dictation tool that runs as a menu bar application. It uses OpenAI's Whisper model (via `faster-whisper` / CTranslate2) to transcribe speech and streams text live at the cursor position in any application. The project also includes a Next.js marketing website.

---

## Part 1: Requirements

### R1 — Core Voice-to-Text Pipeline

| ID | Requirement | Priority |
|----|-------------|----------|
| R1.1 | Record audio from the system microphone at 16kHz mono float32 | Must |
| R1.2 | Transcribe recorded audio locally using faster-whisper (no network) | Must |
| R1.3 | Insert transcribed text at the current cursor position in any macOS application | Must |
| R1.4 | Stream partial transcription results every ~1.5s while recording | Should |
| R1.5 | Perform a final "accuracy pass" transcription on the full audio after recording stops | Must |
| R1.6 | Support Whisper models: tiny, base, small, medium, large-v3 | Must |
| R1.7 | Enforce a hard 120s timeout on transcription to prevent infinite hangs | Must |
| R1.8 | Disable Silero VAD for clips under 30s (prevents infinite hang on short clips) | Must |

### R2 — Hotkey & Recording Control

| ID | Requirement | Priority |
|----|-------------|----------|
| R2.1 | Global hotkey detection (default: Ctrl + .) via pynput Listener | Must |
| R2.2 | Push-to-talk mode: hold hotkey to record, release to stop and transcribe | Must |
| R2.3 | Toggle mode: press hotkey once to start, press again to stop | Should |
| R2.4 | Configurable hotkey string parsing (ctrl, alt, shift, cmd + any character/F-key) | Should |
| R2.5 | Prevent double-start race condition with `_is_active` flag + 500ms poll | Must |
| R2.6 | Normalize modifier keys (ctrl_l/ctrl_r → ctrl) for reliable matching | Must |

### R3 — Silence & Duration Safety

| ID | Requirement | Priority |
|----|-------------|----------|
| R3.1 | Auto-stop recording after configurable silence timeout (default 3s) | Should |
| R3.2 | Only trigger silence auto-stop after speech has been detected first | Must |
| R3.3 | Max recording duration safety limit (default 300s) with timer-based auto-stop | Must |
| R3.4 | Discard recordings shorter than 0.3s as "too short" | Should |
| R3.5 | RMS-based silence detection with configurable threshold (default 0.01) | Should |

### R4 — Text Processing (Spoken Commands)

| ID | Requirement | Priority |
|----|-------------|----------|
| R4.1 | Replace spoken punctuation words with actual characters (period → ., comma → ,) | Should |
| R4.2 | Replace formatting commands (new line → \n, new paragraph → \n\n, tab → \t) | Should |
| R4.3 | Capitalization commands: "capitalize X" → X, "all caps X" → X, "lowercase X" → x | Should |
| R4.4 | Clean spacing: remove doubles, capitalize after sentence endings, fix spacing around punctuation | Should |
| R4.5 | Processing can be disabled via config (`process_commands = false`) | Should |

### R5 — Text Insertion

| ID | Requirement | Priority |
|----|-------------|----------|
| R5.1 | Insert text via clipboard paste (Cmd+V) for universal compatibility | Must |
| R5.2 | Save original clipboard content before paste, restore after 350ms | Must |
| R5.3 | Optional trailing space after transcribed text | Should |
| R5.4 | Optional preview dialog (osascript) before pasting with 10s auto-dismiss | Could |

### R6 — User Interface

| ID | Requirement | Priority |
|----|-------------|----------|
| R6.1 | macOS native menu bar app with emoji status icons (🎤/🔴/⏳) | Must |
| R6.2 | Menu items: mode switch, model switch, paste last, settings, quit | Must |
| R6.3 | Floating overlay window showing real-time streaming transcription | Should |
| R6.4 | Overlay is click-through, stays on all Spaces, shows near screen bottom | Should |
| R6.5 | System sound feedback: Tink (start), Pop (stop), Glass (success), Basso (error) | Should |
| R6.6 | macOS notifications for state changes and errors | Should |

### R7 — Configuration & Persistence

| ID | Requirement | Priority |
|----|-------------|----------|
| R7.1 | TOML-based config at `~/.config/talkflow/config.toml` | Must |
| R7.2 | Type-safe config via Python dataclasses with sensible defaults | Must |
| R7.3 | Auto-migration of deprecated hotkey values on load | Should |
| R7.4 | Transcription history (last 50) persisted to `~/.config/talkflow/history.json` | Should |
| R7.5 | Re-paste last transcription from menu bar | Should |

### R8 — Installation & Process Management

| ID | Requirement | Priority |
|----|-------------|----------|
| R8.1 | One-command install script creating venv, installing deps, verifying packages | Must |
| R8.2 | start.sh / stop.sh scripts with PID file management | Must |
| R8.3 | Auto-start at login via macOS Launch Agent plist | Could |
| R8.4 | Permission checker script detecting host app (Cursor/Terminal/iTerm) | Should |
| R8.5 | Guide user through Accessibility + Input Monitoring + Microphone permissions | Should |

### R9 — Website (Landing Page)

| ID | Requirement | Priority |
|----|-------------|----------|
| R9.1 | Next.js 16 + React 19 single-page marketing site | Should |
| R9.2 | Responsive design with Tailwind CSS v4, dark/light theme toggle | Should |
| R9.3 | Framer Motion animations throughout | Should |
| R9.4 | Live typing demo simulation | Should |
| R9.5 | Deployable to Vercel with root directory set to `website/` | Should |

---

## Part 2: Design

### D1 — Architecture Overview

TalkFlow follows a **component-based orchestrator pattern**:

```
run.py → TalkFlowApp (orchestrator)
              ├── AudioRecorder (sounddevice)
              ├── WhisperEngine (faster-whisper)
              ├── StreamingTranscriber (chunked live transcription)
              ├── TextProcessor (spoken commands → punctuation)
              ├── TextInserter (clipboard + Cmd+V)
              ├── HotkeyManager (pynput listener)
              ├── MenuBarApp (rumps)
              ├── TranscriptionOverlay (AppKit NSWindow)
              ├── TranscriptionHistory (JSON persistence)
              └── Config (TOML dataclasses)
```

The main thread is consumed by `rumps.App.run()` which runs the macOS CFRunLoop. All other work happens on daemon threads.

### D2 — Threading Model

| Thread | Purpose | Lifecycle |
|--------|---------|-----------|
| Main thread | rumps CFRunLoop (menu bar UI) | Blocks for app lifetime |
| pynput Listener | Global keyboard monitoring | Started once, runs forever |
| Audio callback thread | sounddevice InputStream | Active during recording |
| Hotkey press/release handlers | Spawned per event | Short-lived daemon threads |
| Transcription worker | WhisperEngine.transcribe() | One per recording session |
| Model preload | Background load on startup | One-shot |
| Streaming transcriber loop | Polls buffer every 1.5s | Active during recording |
| Sound playback | subprocess afplay | Fire-and-forget |
| Silence timeout | Timer callback | Active during recording |

**Key synchronization**:
- `_state_lock` on AudioRecorder protects `_recording` and `_starting`
- `_chunks_lock` protects `_audio_chunks` list
- `_lock` on TalkFlowApp protects `_is_processing`
- `_lock` on HotkeyManager protects `_current_keys` and `_hotkey_active`

### D3 — Data Flow

```
Microphone → sounddevice (float32 16kHz) → numpy chunks → AudioRecorder buffer
                                                              ↓
                                              StreamingTranscriber (every 1.5s)
                                                              ↓
                                              faster-whisper (tiny/base model)
                                                              ↓
                                              TextInserter (live Cmd+V increments)
                                              + Overlay (display)

On stop:
AudioRecorder → concatenate chunks → int16 WAV → WhisperEngine (full audio)
                                                        ↓
                                              TextProcessor (commands → punctuation)
                                                        ↓
                                              TextInserter (remaining text via Cmd+V)
                                              + TranscriptionHistory (JSON)
```

### D4 — Key Design Decisions

1. **Clipboard-only insertion** — Cmd+V ensures compatibility with all text fields (web apps, Electron, native). Direct key-typing via pynput fails in many modern apps.

2. **Clipboard save/restore with 350ms delay** — Preserves user clipboard content. The 350ms accommodates slow paste handlers (Slack, Notion).

3. **VAD disabled for short clips** — Silero VAD (used by faster-whisper) can stall on 2-30s recordings. Only enabled for recordings >30s.

4. **Thread-per-transcription with 120s timeout** — Uses `concurrent.futures.ThreadPoolExecutor` with a hard timeout. Prevents UI freeze if model gets stuck.

5. **Streaming uses same model (not tiny)** — `use_fast_model=False` in StreamingTranscriber means it reuses the loaded base model for consistency. A dedicated tiny model would be faster but doubles memory.

6. **Live typing tracks "already typed" text** — `_live_typed_text` attribute tracks what was incrementally pasted. Final pass only inserts the delta. This avoids double-typing but can't undo if Whisper revises earlier text.

7. **rumps for menu bar** — Lightweight, pure-Python macOS menu bar framework. Alternatives (py2app, pyobjc-only) are heavier for this use case.

8. **TOML config with dataclass defaults** — Every field has a sensible default. Config file is auto-created on first run. Auto-migrates deprecated hotkeys.

9. **PID file process management** — `run.py` writes `.talkflow.pid`, `start.sh` checks it before launching, `stop.sh` reads it to kill. Simple and POSIX-portable.

10. **macOS Launch Agent for auto-start** — Standard plist in `~/Library/LaunchAgents/` with `KeepAlive` on unsuccessful exit.

### D5 — Potential Weaknesses & Honest Assessment

#### Architectural Issues

1. **Live typing revision problem** — If Whisper revises earlier text during streaming (common), the already-typed text at the cursor is wrong and can't be un-done. The code tries to only append new text, but if the transcription changes fundamentally, the user sees incorrect partial text followed by correct final text.

2. **No mutex between streaming and final transcription** — Both can theoretically call `model.transcribe()` concurrently. The StreamingTranscriber stops before the final pass starts, but there's a race window.

3. **Single-threaded model access** — faster-whisper models aren't thread-safe. The streaming transcriber accesses `self._engine._model` directly (a private attribute), breaking encapsulation.

4. **Clipboard race condition** — If the user copies something to clipboard in the 350ms between TalkFlow's paste and restore, their copy is overwritten with the old content.

5. **No error recovery on transcription failure** — If transcription raises an exception, the overlay stays visible showing "⏳ Transcribing..." until the next recording.

#### Code Quality Issues

6. **Debug logging via environment variable** — Every component independently reads `TALKFLOW_DEBUG`. A centralized logger would be cleaner.

7. **Mixed callback patterns** — Some callbacks are attributes (`on_hotkey_press`), some are constructor args (`on_quit`). Inconsistent interface.

8. **Overlay `_perform_on_main` fallback** — If `PyObjCTools.AppHelper` isn't available, it just runs the block on the current thread, which could crash AppKit if called from a background thread.

9. **History saved on every transcription** — JSON serialization of up to 50 entries on every single transcription. Should batch or debounce writes.

10. **No unit tests** — Only a manual `test_record.py` that requires a microphone. No automated testing whatsoever.

#### Security/Privacy Considerations

11. **Temp WAV files** — Audio is written to `/tmp/talkflow_*.wav`. If the process crashes mid-transcription, these files persist. No cleanup on startup.

12. **Input Monitoring permission** — While TalkFlow only processes Ctrl+., the pynput Listener receives ALL key events. The code correctly ignores non-hotkey events, but this is a trust boundary.

### D6 — AI-Generated Patterns (Telltale Signs)

Having reviewed the entire codebase, several patterns suggest significant AI assistance in authoring:

1. **Comprehensive docstrings on every class/method** — Consistent format with Args/Returns sections, even for trivial methods. Human code typically has sparser documentation.

2. **Overly defensive parameter handling** — `use_clipboard` parameter in TextInserter is accepted but ignored (always True). `typing_delay` setter exists but does nothing. These are "compatibility stubs" that AI often generates when refactoring.

3. **Perfect README with Mermaid diagrams** — The README has 8+ Mermaid diagrams, a troubleshooting table, a spoken commands reference — more thorough than most human-authored READMEs.

4. **Uniform error handling pattern** — Every component uses the same try/except/print pattern. Human code typically has more varied error strategies.

5. **Dataclass-heavy configuration** — The config system with 5 nested dataclasses for a relatively simple app is a pattern AI tends to produce for "type safety."

6. **The ARCHITECTURE.md** — A separate, extremely detailed architecture document with class diagrams is unusual for a personal project. This reads like AI-generated documentation.

7. **Website component structure** — The landing page follows a textbook "modern Next.js marketing page" template: Hero → Features → HowItWorks → LiveDemo → TechStack → CTA → Footer.

### D7 — Clever Parts Worth Highlighting

1. **Silence detection with speech-first guard** — The `_has_had_speech` flag prevents immediate auto-stop on quiet environments. Only after detecting actual speech does silence monitoring kick in.

2. **Key normalization in HotkeyManager** — Mapping all variants (ctrl_l, ctrl_r, ctrl) to a single canonical key solves a real cross-keyboard compatibility issue.

3. **Config auto-migration** — Automatically replacing deprecated hotkeys that conflict with common apps (Raycast, etc.) is a nice UX touch.

4. **Race condition handling in push-to-talk** — The 500ms polling loop in `_on_hotkey_release` waits for recording to actually start before stopping. This handles the case where release fires before the recording thread begins.

5. **The check_permissions.py script** — Walking the process tree to detect the host app (Cursor vs Terminal vs iTerm) is genuinely useful for macOS developers.

6. **TranscriptionOverlay using NSVisualEffectView** — Creates a proper macOS blur effect ("HUD window" material) rather than a plain black rectangle.

7. **Concurrent futures timeout on transcription** — Elegant solution to prevent UI hangs from model stalls.

---

## Part 3: Implementation Tasks

### Task 1: Core Audio Pipeline
- [x] Implement AudioRecorder with sounddevice InputStream
- [x] Float32 → int16 WAV conversion via scipy
- [x] RMS level monitoring and callbacks
- [x] Silence detection with speech-first guard
- [x] Max duration timer with auto-stop
- [x] State locking (`_state_lock`, `_chunks_lock`)

### Task 2: Whisper Transcription Engine
- [x] faster-whisper model loading with device/compute auto-detection
- [x] 120s timeout via concurrent.futures.ThreadPoolExecutor
- [x] VAD disabled for clips < 30s
- [x] Model switching and unloading
- [x] CPU thread count auto-detection (half of cores, min 4)

### Task 3: Streaming Transcription
- [x] StreamingTranscriber with 1.5s chunk interval
- [x] Audio buffer management with lock
- [x] Partial text callback for live typing
- [x] Optional fast model (tiny) for lower latency
- [x] Temp WAV cleanup in finally block

### Task 4: Text Processing Pipeline
- [x] Punctuation map (30+ spoken words → characters)
- [x] Formatting commands (new line, new paragraph, tab)
- [x] Capitalization commands with regex
- [x] Spacing cleanup and auto-capitalization
- [x] Longest-first matching to avoid partial hits

### Task 5: Text Insertion
- [x] Clipboard save → copy → Cmd+V paste → 350ms wait → restore
- [x] pynput Controller for keyboard simulation
- [x] Error handling for clipboard failures

### Task 6: Hotkey Management
- [x] pynput keyboard.Listener with press/release handlers
- [x] Key normalization (modifier variants → canonical)
- [x] Hotkey string parser ("ctrl+." → Key set)
- [x] Push-to-talk and toggle mode support
- [x] Thread-safe state with lock

### Task 7: Menu Bar UI
- [x] rumps.App with dynamic title (emoji icons)
- [x] Mode submenu with checkmarks
- [x] Model submenu with checkmarks
- [x] Paste Last / Settings / Quit actions
- [x] State methods (set_recording_state, set_processing_state)

### Task 8: Overlay Window
- [x] AppKit NSWindow (borderless, floating, click-through)
- [x] NSVisualEffectView with HUD blur material
- [x] Main-thread execution via AppHelper.callAfter
- [x] Auto-hide with configurable delay
- [x] Multi-Space support

### Task 9: Configuration
- [x] TOML load/save with toml library
- [x] Dataclass-based config sections (Audio, Whisper, Hotkey, Output, App)
- [x] Auto-create default config on first run
- [x] Auto-migrate deprecated hotkeys
- [x] Force English language to avoid misdetection

### Task 10: History & Persistence
- [x] TranscriptionHistory class with max 50 entries
- [x] JSON serialization/deserialization
- [x] Thread-safe access with lock
- [x] get_last_text() for re-paste feature

### Task 11: Process Management Scripts
- [x] install.sh: venv creation, dependency install, package verification
- [x] start.sh: PID check, background launch, 15s startup wait
- [x] stop.sh: PID-based kill with fallback pgrep
- [x] autostart.sh: Launch Agent plist management
- [x] check_permissions.py: Host app detection, permission verification

### Task 12: Orchestration (main.py)
- [x] TalkFlowApp wiring all components via callbacks
- [x] Live typing delta tracking (`_live_typed_text`)
- [x] Final pass inserts only remaining text
- [x] Sound feedback via subprocess afplay
- [x] Preview dialog via osascript
- [x] Session statistics tracking
- [x] Graceful shutdown with cleanup

### Task 13: Website
- [x] Next.js 16 App Router setup with TypeScript
- [x] Tailwind CSS v4 with custom CSS variables (light/dark)
- [x] Component library: Navbar, Hero, Features, HowItWorks, LiveDemo, TechStack, CTA, Footer
- [x] Framer Motion animations (scroll-triggered, staggered)
- [x] Typewriter demo effect with phrase cycling
- [x] Theme toggle with localStorage persistence
- [x] Glass morphism, liquid blobs, gradient text, marquee animations

---

## Part 4: How Everything Connects

### Startup Sequence
```
run.py
  → writes PID file
  → adds src/ to sys.path
  → calls main()
    → Config.load() from TOML
    → creates all component instances
    → wires callbacks between components
    → HotkeyManager.start() (listener thread)
    → preload_model() (background thread)
    → MenuBarApp.run() (blocks main thread on CFRunLoop)
```

### Recording Flow
```
User holds Ctrl+.
  → pynput on_press fires
  → HotkeyManager normalizes, checks match
  → spawns thread calling on_hotkey_press
  → TalkFlowApp._on_hotkey_press()
    → AudioRecorder.start_recording()
      → opens sounddevice.InputStream
      → starts max_duration timer
      → fires on_recording_start callback
    → shows overlay "🎤 Listening..."
    → starts StreamingTranscriber
    
Every 1.5s while recording:
  → audio_callback stores chunks
  → StreamingTranscriber concatenates buffer → temp WAV → whisper.transcribe()
  → partial text callback → TextInserter pastes new words live
  → overlay updates displayed text

User releases Ctrl+.
  → pynput on_release fires
  → HotkeyManager checks push_to_talk, hotkey no longer held
  → spawns thread calling on_hotkey_release
  → TalkFlowApp._on_hotkey_release()
    → polls for recording active (race fix)
    → _stop_and_transcribe()
      → AudioRecorder.stop_recording() → saves WAV, fires on_recording_stop
      → StreamingTranscriber.stop()
      → overlay shows "⏳ Transcribing..."
      → spawns transcription thread
        → WhisperEngine.transcribe(full_audio)
        → TextProcessor.process(raw_text)
        → compares with _live_typed_text
        → TextInserter.insert_text(remaining)
        → history.add()
        → overlay.show_final() → auto-hides
```

### Configuration Flow
```
First run:
  → Config.load() → file doesn't exist → creates default → saves to disk

Subsequent runs:
  → Config.load() → reads TOML → parses into dataclasses
  → auto-migrates deprecated hotkeys
  → forces English language if None

Menu bar model change:
  → _on_model_change(model) → whisper_engine.change_model() → unloads
  → spawns thread → whisper_engine.load_model() → downloads if needed

Quit:
  → config.save() → persists any runtime changes
```

---

## Part 5: Summary Assessment

### What This Project Is
A well-crafted personal tool that solves a real problem (local voice typing on macOS) with thoughtful UX touches (sound feedback, live overlay, silence detection, clipboard restore). The code is clean, well-documented, and production-usable for a single-user desktop app.

### What It Does Well
- **Solves a genuine pain point** with minimal friction (one hotkey)
- **Privacy-first architecture** — truly zero network calls
- **Robust edge-case handling** — silence detection, race conditions, timeout safety
- **Excellent macOS integration** — native menu bar, AppKit overlay, system sounds, Launch Agent
- **Good separation of concerns** — each module has one job

### What Could Be Improved
- **No automated tests** — the only test file requires a physical microphone
- **Live typing revision problem** — fundamental limitation with no clean solution in current architecture
- **Memory usage** — keeping two Whisper models loaded (if fast_model were enabled) would be expensive
- **No logging framework** — debug print statements instead of proper structured logging
- **No graceful handling of model download** — first run on a new model blocks silently
- **Leftover temp files on crash** — no cleanup of `/tmp/talkflow_*.wav` on startup
- **Website has no connection to the app** — purely static marketing page, no download automation

### Verdict
This is a **solid v0.1 personal tool** that punches above its weight in UX polish. The AI-generated documentation and boilerplate is well-integrated and the actual logic (silence detection, streaming delta, timeout safety) shows genuine engineering thought. Ready for personal daily use; would need tests, logging, and the streaming revision problem solved before wider distribution.
