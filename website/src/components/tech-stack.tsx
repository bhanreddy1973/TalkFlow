"use client";

import { motion } from "framer-motion";

const technologies = [
  "faster-whisper",
  "CTranslate2",
  "Python",
  "Apple Silicon",
  "sounddevice",
  "pynput",
  "rumps",
  "AppKit",
  "PyObjC",
];

export function TechStack() {
  return (
    <section className="py-24 px-6 dot-pattern">
      <div className="max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Built <span className="gradient-text">With</span>
          </h2>
          <p className="text-[var(--muted)] text-lg mb-12">
            Open-source tools you can trust.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-wrap justify-center gap-3"
        >
          {technologies.map((tech, index) => (
            <motion.span
              key={tech}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              whileHover={{ scale: 1.08, y: -3 }}
              className="glass px-5 py-2.5 rounded-full text-sm text-[var(--foreground)] font-medium cursor-default"
            >
              {tech}
            </motion.span>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
