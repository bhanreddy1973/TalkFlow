"use client";

import { motion } from "framer-motion";

const technologies = [
  { name: "faster-whisper", emoji: "🧠" },
  { name: "Python", emoji: "🐍" },
  { name: "Apple Silicon", emoji: "🍎" },
  { name: "sounddevice", emoji: "🎵" },
  { name: "pynput", emoji: "⌨️" },
  { name: "rumps", emoji: "📊" },
  { name: "AppKit", emoji: "🖼️" },
  { name: "CTranslate2", emoji: "⚙️" },
  { name: "PyObjC", emoji: "🔗" },
];

export function TechStack() {
  return (
    <section className="py-20 px-6 overflow-hidden">
      <div className="max-w-5xl mx-auto text-center mb-10">
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
        <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-[var(--background)] to-transparent z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-[var(--background)] to-transparent z-10" />

        <div className="flex overflow-hidden">
          <div className="animate-marquee flex gap-4 pr-4">
            {[...technologies, ...technologies].map((tech, index) => (
              <div
                key={`${tech.name}-${index}`}
                className="flex-shrink-0 glass px-5 py-3 rounded-2xl flex items-center gap-2.5 hover:scale-105 transition-transform duration-200"
              >
                <span className="text-xl">{tech.emoji}</span>
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
