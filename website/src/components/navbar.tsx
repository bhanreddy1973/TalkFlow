"use client";

import { motion } from "framer-motion";

export function Navbar() {
  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 w-full z-50 px-6 py-4 backdrop-blur-xl bg-[#030014]/80 border-b border-white/5"
    >
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <a href="#" className="text-xl font-bold gradient-text">
          TalkFlow
        </a>
        <ul className="hidden md:flex items-center gap-8">
          {["Features", "How It Works", "Demo"].map((item) => (
            <li key={item}>
              <a
                href={`#${item.toLowerCase().replace(/\s+/g, "-")}`}
                className="text-sm text-gray-400 hover:text-white transition-colors duration-200"
              >
                {item}
              </a>
            </li>
          ))}
          <li>
            <a
              href="https://github.com/bhanreddy1973/TalkFlow"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm px-4 py-2 rounded-full border border-white/10 text-gray-300 hover:border-indigo-500/50 hover:text-white transition-all duration-200"
            >
              GitHub
            </a>
          </li>
        </ul>
      </div>
    </motion.nav>
  );
}
