"use client";

import { motion } from "framer-motion";

const technologies = [
  { name: "faster-whisper", category: "AI" },
  { name: "CTranslate2", category: "AI" },
  { name: "Python", category: "Core" },
  { name: "Apple Silicon (int8)", category: "Hardware" },
  { name: "sounddevice", category: "Audio" },
  { name: "pynput", category: "Input" },
  { name: "rumps", category: "UI" },
  { name: "AppKit", category: "UI" },
  { name: "PyObjC", category: "macOS" },
];

export function TechStack() {
  return (
    <section className="py-24 px-6">
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
          <p className="text-gray-400 text-lg mb-12">
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
              key={tech.name}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              whileHover={{ scale: 1.05, y: -2 }}
              className="px-5 py-2.5 rounded-full border border-white/10 bg-white/5 text-sm text-gray-300 font-medium hover:border-indigo-500/40 hover:bg-indigo-500/5 transition-colors duration-200 cursor-default"
            >
              {tech.name}
            </motion.span>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
