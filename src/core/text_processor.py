"""Post-processing for transcribed text — handles spoken punctuation and formatting commands."""

import re
from typing import Optional


class TextProcessor:
    """Processes raw transcription text to apply spoken commands for punctuation and formatting.

    Converts natural voice commands like "period", "new line", "comma" into
    their actual characters. Also handles capitalization commands.
    """

    # Spoken punctuation → actual character
    PUNCTUATION_MAP = {
        "period": ".",
        "full stop": ".",
        "dot": ".",
        "comma": ",",
        "exclamation mark": "!",
        "exclamation point": "!",
        "question mark": "?",
        "colon": ":",
        "semicolon": ";",
        "semi colon": ";",
        "dash": "—",
        "hyphen": "-",
        "ellipsis": "...",
        "open quote": '"',
        "close quote": '"',
        "open paren": "(",
        "close paren": ")",
        "open bracket": "[",
        "close bracket": "]",
        "slash": "/",
        "backslash": "\\",
        "ampersand": "&",
        "at sign": "@",
        "hashtag": "#",
        "hash": "#",
        "dollar sign": "$",
        "percent": "%",
        "asterisk": "*",
        "plus sign": "+",
        "equals sign": "=",
        "underscore": "_",
        "tilde": "~",
        "pipe": "|",
    }

    # Formatting commands that produce whitespace or structural changes
    FORMATTING_COMMANDS = {
        "new line": "\n",
        "newline": "\n",
        "new paragraph": "\n\n",
        "tab": "\t",
        "space": " ",
    }

    # Commands that affect the next word's capitalization
    CAPITALIZATION_COMMANDS = {
        "capitalize",
        "cap",
        "all caps",
        "uppercase",
        "lowercase",
    }

    # Commands that remove trailing space
    NO_SPACE_AFTER = {".", ",", "!", "?", ":", ";", "—", "-", "...", "\n", "\n\n", "\t"}

    def __init__(self, enabled: bool = True):
        """Initialize the text processor.

        Args:
            enabled: Whether to apply spoken command processing.
        """
        self.enabled = enabled
        # Build a regex pattern that matches any spoken command (longest first to avoid partial matches)
        all_commands = list(self.PUNCTUATION_MAP.keys()) + list(self.FORMATTING_COMMANDS.keys())
        all_commands.sort(key=len, reverse=True)  # Longest first for greedy matching
        escaped = [re.escape(cmd) for cmd in all_commands]
        self._command_pattern = re.compile(
            r'\b(' + '|'.join(escaped) + r')\b',
            re.IGNORECASE,
        )
        # Capitalization pattern
        cap_commands = sorted(self.CAPITALIZATION_COMMANDS, key=len, reverse=True)
        self._cap_pattern = re.compile(
            r'\b(' + '|'.join(re.escape(c) for c in cap_commands) + r')\b',
            re.IGNORECASE,
        )

    def process(self, text: str) -> str:
        """Process transcribed text, replacing spoken commands with their actual characters.

        Args:
            text: Raw transcription text from Whisper.

        Returns:
            Processed text with punctuation and formatting applied.
        """
        if not self.enabled or not text:
            return text

        result = text

        # Handle capitalization commands first
        result = self._apply_capitalization(result)

        # Replace formatting commands (before punctuation to handle "new line" before "period")
        result = self._apply_formatting(result)

        # Replace spoken punctuation
        result = self._apply_punctuation(result)

        # Clean up spacing around punctuation
        result = self._clean_spacing(result)

        return result

    def _apply_capitalization(self, text: str) -> str:
        """Apply capitalization commands to the following word."""
        result = text

        # "capitalize <word>" or "cap <word>"
        def cap_replacer(match):
            cmd = match.group(1).lower()
            # Find the next word after this match
            after = result[match.end():]
            space_match = re.match(r'\s+(\S+)', after)
            if not space_match:
                return ""  # No word follows, just remove the command
            return ""  # We'll handle this in a second pass

        # All caps: "all caps <word>"
        result = re.sub(
            r'\b(?:all caps|uppercase)\s+(\w+)\b',
            lambda m: m.group(1).upper(),
            result,
            flags=re.IGNORECASE,
        )

        # Lowercase: "lowercase <word>"
        result = re.sub(
            r'\b(?:lowercase)\s+(\w+)\b',
            lambda m: m.group(1).lower(),
            result,
            flags=re.IGNORECASE,
        )

        # Capitalize: "capitalize <word>" or "cap <word>"
        result = re.sub(
            r'\b(?:capitalize|cap)\s+(\w+)\b',
            lambda m: m.group(1).capitalize(),
            result,
            flags=re.IGNORECASE,
        )

        return result

    def _apply_formatting(self, text: str) -> str:
        """Replace spoken formatting commands with actual formatting."""
        result = text
        # Sort by length (longest first) so "new paragraph" matches before "new line"
        for command in sorted(self.FORMATTING_COMMANDS.keys(), key=len, reverse=True):
            replacement = self.FORMATTING_COMMANDS[command]
            # Match the command with optional surrounding spaces
            pattern = re.compile(r'\s*\b' + re.escape(command) + r'\b\s*', re.IGNORECASE)
            result = pattern.sub(lambda m: replacement, result)
        return result

    def _apply_punctuation(self, text: str) -> str:
        """Replace spoken punctuation with actual punctuation characters."""
        result = text
        for command in sorted(self.PUNCTUATION_MAP.keys(), key=len, reverse=True):
            replacement = self.PUNCTUATION_MAP[command]
            # Match command with optional space before (attach to previous word)
            pattern = re.compile(r'\s*\b' + re.escape(command) + r'\b', re.IGNORECASE)
            # Use a lambda to return the replacement literally (avoids re.sub interpreting backslashes)
            result = pattern.sub(lambda m: replacement, result)
        return result

    def _clean_spacing(self, text: str) -> str:
        """Clean up spacing artifacts after command replacement."""
        # Remove double spaces
        text = re.sub(r' {2,}', ' ', text)

        # Capitalize after sentence-ending punctuation
        text = re.sub(
            r'([.!?])\s+([a-z])',
            lambda m: m.group(1) + ' ' + m.group(2).upper(),
            text,
        )

        # Capitalize first character
        if text and text[0].islower():
            text = text[0].upper() + text[1:]

        # Remove space before punctuation that got left behind
        text = re.sub(r'\s+([.,!?;:])', r'\1', text)

        # Ensure space after punctuation (except newlines and end of string)
        text = re.sub(r'([.,!?;:])([A-Za-z])', r'\1 \2', text)

        return text.strip()
