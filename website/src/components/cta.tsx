"use client";

import { motion } from "framer-motion";

export function CTA() {
  return (
    <section className="py-24 px-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="relative text-center"
        >
          {/* Liquid blob background */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="liquid-blob absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-indigo-300/20 dark:bg-indigo-500/10 blur-[80px]" />
          </div>

          <div className="relative z-10 glass rounded-[2rem] p-12 md:p-16">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
              Ready to type with your{" "}
              <span className="gradient-text">voice</span>?
            </h2>
            <p className="text-[var(--muted)] text-lg mb-10 max-w-lg mx-auto">
              Free. Open source. No account needed.
            </p>

            <a
              href="https://github.com/bhanreddy1973/TalkFlow"
              target="_blank"
              rel="noopener noreferrer"
              className="shimmer inline-block relative px-10 py-4 rounded-2xl font-semibold text-white text-lg bg-gradient-to-r from-indigo-500 to-purple-500 shadow-xl shadow-indigo-500/20 hover:shadow-indigo-500/30 transition-all duration-300 hover:-translate-y-1 hover:scale-105"
            >
              Get TalkFlow →
            </a>

            <p className="mt-6 text-[var(--muted)] text-sm">
              Requires macOS 13+ · Apple Silicon or Intel · Python 3.11+
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
