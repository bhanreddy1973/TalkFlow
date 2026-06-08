export function Footer() {
  return (
    <footer className="border-t border-[var(--border)] py-10 px-6">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <span className="text-sm font-black tracking-tight gradient-text">
          talkflow
        </span>
        <p className="text-[var(--muted)] text-xs">
          Open source voice typing · Built with ❤️ on macOS
        </p>
        <a
          href="https://github.com/bhanreddy1973/TalkFlow"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-[var(--muted)] hover:text-[var(--foreground)] transition-colors font-medium"
        >
          github.com/bhanreddy1973/TalkFlow ↗
        </a>
      </div>
    </footer>
  );
}
