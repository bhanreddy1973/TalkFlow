"""Floating overlay window that shows real-time streaming transcription."""

import threading
from typing import Optional

import AppKit
import objc
from Foundation import NSMakeRect, NSTimer


class TranscriptionOverlay:
    """A small floating overlay window that displays streaming transcription text.
    
    Shows a dark semi-transparent popup near the bottom-center of the screen
    that updates in real-time as audio is being transcribed.
    """

    WINDOW_WIDTH = 500
    WINDOW_HEIGHT = 80
    PADDING = 16
    FONT_SIZE = 16
    CORNER_RADIUS = 12

    def __init__(self):
        self._window: Optional[AppKit.NSWindow] = None
        self._text_field: Optional[AppKit.NSTextField] = None
        self._current_text = ""
        self._lock = threading.Lock()
        self._visible = False
        self._hide_timer: Optional[NSTimer] = None

    def _ensure_window(self) -> None:
        """Create the overlay window if it doesn't exist (must be called on main thread)."""
        if self._window is not None:
            return

        # Position at bottom center of main screen
        screen = AppKit.NSScreen.mainScreen()
        screen_frame = screen.frame()
        x = (screen_frame.size.width - self.WINDOW_WIDTH) / 2
        y = screen_frame.size.height * 0.15  # 15% from bottom

        frame = NSMakeRect(x, y, self.WINDOW_WIDTH, self.WINDOW_HEIGHT)

        # Create borderless, floating window
        self._window = AppKit.NSWindow.alloc().initWithContentRect_styleMask_backing_defer_(
            frame,
            AppKit.NSWindowStyleMaskBorderless,
            AppKit.NSBackingStoreBuffered,
            False,
        )

        # Window properties
        self._window.setLevel_(AppKit.NSFloatingWindowLevel)
        self._window.setOpaque_(False)
        self._window.setBackgroundColor_(AppKit.NSColor.clearColor())
        self._window.setAlphaValue_(0.92)
        self._window.setHasShadow_(True)
        self._window.setIgnoresMouseEvents_(True)  # Click-through
        self._window.setCollectionBehavior_(
            AppKit.NSWindowCollectionBehaviorCanJoinAllSpaces
            | AppKit.NSWindowCollectionBehaviorStationary
        )

        # Create visual effect view (dark blur background)
        content_view = AppKit.NSVisualEffectView.alloc().initWithFrame_(
            NSMakeRect(0, 0, self.WINDOW_WIDTH, self.WINDOW_HEIGHT)
        )
        content_view.setMaterial_(AppKit.NSVisualEffectMaterialHUDWindow)
        content_view.setBlendingMode_(AppKit.NSVisualEffectBlendingModeBehindWindow)
        content_view.setState_(AppKit.NSVisualEffectStateActive)
        content_view.setWantsLayer_(True)
        content_view.layer().setCornerRadius_(self.CORNER_RADIUS)
        content_view.layer().setMasksToBounds_(True)

        self._window.setContentView_(content_view)

        # Create text field
        text_frame = NSMakeRect(
            self.PADDING, self.PADDING,
            self.WINDOW_WIDTH - 2 * self.PADDING,
            self.WINDOW_HEIGHT - 2 * self.PADDING,
        )
        self._text_field = AppKit.NSTextField.alloc().initWithFrame_(text_frame)
        self._text_field.setEditable_(False)
        self._text_field.setSelectable_(False)
        self._text_field.setBezeled_(False)
        self._text_field.setDrawsBackground_(False)
        self._text_field.setTextColor_(AppKit.NSColor.whiteColor())
        self._text_field.setFont_(
            AppKit.NSFont.systemFontOfSize_weight_(self.FONT_SIZE, AppKit.NSFontWeightMedium)
        )
        self._text_field.setAlignment_(AppKit.NSTextAlignmentCenter)
        self._text_field.setLineBreakMode_(AppKit.NSLineBreakByTruncatingTail)
        self._text_field.setMaximumNumberOfLines_(2)
        self._text_field.setStringValue_("🎤 Listening...")

        content_view.addSubview_(self._text_field)

    def show(self, initial_text: str = "🎤 Listening...") -> None:
        """Show the overlay window with initial text."""
        def _show_on_main():
            self._ensure_window()
            self._text_field.setStringValue_(initial_text)
            self._window.orderFrontRegardless()
            self._visible = True
            # Cancel any pending hide timer
            if self._hide_timer:
                self._hide_timer.invalidate()
                self._hide_timer = None

        self._perform_on_main(_show_on_main)

    def update_text(self, text: str) -> None:
        """Update the displayed transcription text."""
        with self._lock:
            self._current_text = text

        def _update_on_main():
            if self._text_field and self._visible:
                display = text if text else "🎤 Listening..."
                self._text_field.setStringValue_(display)

        self._perform_on_main(_update_on_main)

    def hide(self, delay: float = 2.0) -> None:
        """Hide the overlay, optionally after a delay."""
        def _hide_on_main():
            if delay > 0:
                # Show final text briefly before hiding
                if self._hide_timer:
                    self._hide_timer.invalidate()
                self._hide_timer = NSTimer.scheduledTimerWithTimeInterval_target_selector_userInfo_repeats_(
                    delay, self._window, objc.selector(lambda self, timer: None, signature=b'v@:@'), None, False
                )
                # Use a simpler approach - just hide after delay
                threading.Timer(delay, self._do_hide).start()
            else:
                self._do_hide_on_main()

        self._perform_on_main(_hide_on_main)

    def _do_hide(self) -> None:
        """Actually hide (called from timer thread)."""
        self._perform_on_main(self._do_hide_on_main)

    def _do_hide_on_main(self) -> None:
        """Hide window on main thread."""
        if self._window:
            self._window.orderOut_(None)
        self._visible = False

    def show_final(self, text: str, auto_hide_delay: float = 2.0) -> None:
        """Show the final transcription result, then auto-hide."""
        def _show_final_on_main():
            if self._text_field and self._window:
                self._text_field.setStringValue_(f"✅ {text}")
                if not self._visible:
                    self._window.orderFrontRegardless()
                    self._visible = True
                threading.Timer(auto_hide_delay, self._do_hide).start()

        self._perform_on_main(_show_final_on_main)

    def _perform_on_main(self, block) -> None:
        """Execute a block on the main thread."""
        if threading.current_thread() is threading.main_thread():
            block()
        else:
            try:
                from PyObjCTools import AppHelper
                AppHelper.callAfter(block)
            except Exception:
                # Fallback: just run directly
                block()
