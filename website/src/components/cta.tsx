"use client";

import { motion } from "framer-motion";

export function CTA() {
  return (
    <section className="py-28 px-6">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="relative text-center"
        >
          {/* Background blob */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="liquid-blob absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[250px] bg-[var(--primary)]/8 blur-[60px]" />
          </div>

          <div className="relative z-10">
            <h2 className="text-4xl md:text-6xl font-black tracking-tight mb-5 leading-tight">
              Your voice.{" "}
              <br className="hidden md:block" />
              <span className="font-light italic text-[var(--muted)]">Your Mac.</span>{" "}
              <span className="gradient-text">Your words.</span>
            </h2>

            <p className="text-[var(--muted)] text-lg mb-10 font-light">
              Free forever. No signup. No tracking. Just talk.
            </p>

            <motion.a
              href="https://github.com/bhanreddy1973/TalkFlow"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.05, y: -3 }}
              whileTap={{ scale: 0.97 }}
              className="btn-magnetic inline-block px-10 py-5 rounded-full font-bold text-white text-lg bg-[var(--foreground)] dark:bg-white dark:text-[#1c1c1e] shadow-2xl shadow-black/10 dark:shadow-white/5"
            >
              Get TalkFlow — it&apos;s free →
            </motion.a>

            <p className="mt-6 text-[var(--muted)] text-xs tracking-wide">
              macOS 13+ · Apple Silicon or Intel · Python 3.11+
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
