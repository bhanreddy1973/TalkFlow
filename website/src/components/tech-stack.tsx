"use client";

import { motion } from "framer-motion";

const technologies = [
  { name: "faster-whisper", color: "from-purple-500 to-indigo-600" },
  { name: "Python", color: "from-yellow-500 to-amber-600" },
  { name: "Apple Silicon", color: "from-gray-600 to-gray-900 dark:from-gray-300 dark:to-gray-100" },
  { name: "sounddevice", color: "from-pink-500 to-rose-600" },
  { name: "pynput", color: "from-blue-500 to-cyan-600" },
  { name: "rumps", color: "from-emerald-500 to-teal-600" },
  { name: "AppKit", color: "from-orange-500 to-red-600" },
  { name: "CTranslate2", color: "from-violet-500 to-purple-600" },
  { name: "PyObjC", color: "from-sky-500 to-blue-600" },
];

export function TechStack() {
  return (
    <section className="py-20 px-6 overflow-hidden">
      <div className="max-w-5xl mx-auto text-center mb-12">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-3xl md:text-4xl font-black tracking-tight"
        >
          Powered by{" "}
          <span className="font-light italic text-[var(--muted)]">open source</span>
        </motion.h2>
      </div>

      {/* Marquee-style infinite scroll */}
      <div className="relative">
        <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-[var(--background)] to-transparent z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[var(--background)] to-transparent z-10" />

        <div className="flex overflow-hidden">
          <div className="animate-marquee flex gap-4 pr-4">
            {[...technologies, ...technologies].map((tech, index) => (
              <div
                key={`${tech.name}-${index}`}
                className="flex-shrink-0 glass px-6 py-3.5 rounded-2xl flex items-center gap-3 hover:scale-105 transition-transform duration-200 group"
              >
                {/* Small gradient dot instead of emoji */}
                <div className={`w-3 h-3 rounded-full bg-gradient-to-br ${tech.color} group-hover:scale-150 transition-transform duration-300`} />
                <span className="text-sm font-semibold text-[var(--foreground)] whitespace-nowrap">
                  {tech.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
