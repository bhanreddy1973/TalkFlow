export function Footer() {
  return (
    <footer className="border-t border-white/5 py-12 px-6">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold gradient-text">TalkFlow</span>
          <span className="text-gray-500 text-sm">
            · Open Source Voice Typing
          </span>
        </div>
        <div className="flex items-center gap-6 text-sm text-gray-500">
          <a
            href="https://github.com/bhanreddy1973/TalkFlow"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition-colors"
          >
            GitHub
          </a>
          <span>Built with ❤️ on macOS</span>
        </div>
      </div>
    </footer>
  );
}
