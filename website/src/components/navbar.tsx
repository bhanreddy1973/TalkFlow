"use client";

import { motion } from "framer-motion";
import { ThemeToggle } from "./theme-toggle";

export function Navbar() {
  return (
    <motion.nav
      initial={{ y: -30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
      className="fixed top-5 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-3xl"
    >
      <div className="glass rounded-full px-6 py-2.5 flex items-center justify-between">
        <a href="#" className="text-lg font-black tracking-tight gradient-text">
          talkflow
        </a>
        <ul className="hidden md:flex items-center gap-5">
          {["Features", "How It Works", "Demo"].map((item) => (
            <li key={item}>
              <a
                href={`#${item.toLowerCase().replace(/\s+/g, "-")}`}
                className="text-[13px] text-[var(--muted)] hover:text-[var(--foreground)] transition-colors duration-200 font-medium"
              >
                {item}
              </a>
            </li>
          ))}
        </ul>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <a
            href="https://github.com/bhanreddy1973/TalkFlow"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[13px] px-4 py-1.5 rounded-full bg-[var(--foreground)] text-[var(--background)] font-semibold hover:opacity-80 transition-opacity duration-200"
          >
            Star on GitHub ★
          </a>
        </div>
      </div>
    </motion.nav>
  );
}
