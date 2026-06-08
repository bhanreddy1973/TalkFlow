"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const dark = saved === "dark" || (!saved && prefersDark);
    setIsDark(dark);
    document.documentElement.classList.toggle("dark", dark);
  }, []);

  const toggle = () => {
    const newDark = !isDark;
    setIsDark(newDark);
    document.documentElement.classList.toggle("dark", newDark);
    localStorage.setItem("theme", newDark ? "dark" : "light");
  };

  return (
    <button
      onClick={toggle}
      className="relative w-14 h-7 rounded-full bg-gray-200 dark:bg-gray-700 transition-colors duration-300 flex items-center px-1 cursor-pointer"
      aria-label="Toggle dark mode"
    >
      <motion.div
        layout
        className="w-5 h-5 rounded-full bg-white shadow-md flex items-center justify-center"
        style={{ marginLeft: isDark ? "auto" : 0 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      >
        <span className="text-xs">{isDark ? "🌙" : "☀️"}</span>
      </motion.div>
    </button>
  );
}
