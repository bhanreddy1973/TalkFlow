"use client";

import { motion } from "framer-motion";
import { ThemeToggle } from "./theme-toggle";

export function Navbar() {
  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-4xl"
    >
      <div className="glass rounded-2xl px-6 py-3 flex items-center justify-between">
        <a href="#" className="text-xl font-bold gradient-text">
          TalkFlow
        </a>
        <ul className="hidden md:flex items-center gap-6">
          {["Features", "How It Works", "Demo"].map((item) => (
            <li key={item}>
              <a
                href={`#${item.toLowerCase().replace(/\s+/g, "-")}`}
                className="text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition-colors duration-200 font-medium"
              >
                {item}
              </a>
            </li>
          ))}
        </ul>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <a
            href="https://github.com/bhanreddy1973/TalkFlow"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm px-4 py-2 rounded-full glass font-medium text-[var(--foreground)] hover:scale-105 transition-transform duration-200"
          >
            GitHub ↗
          </a>
        </div>
      </div>
    </motion.nav>
  );
}
