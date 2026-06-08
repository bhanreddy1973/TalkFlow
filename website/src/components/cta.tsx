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
          {/* Background glow */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-indigo-500/10 rounded-full blur-[100px]" />
          </div>

          <div className="relative z-10">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
              Ready to type with your{" "}
              <span className="gradient-text">voice</span>?
            </h2>
            <p className="text-gray-400 text-lg mb-10 max-w-lg mx-auto">
              Free. Open source. No account needed.
            </p>

            <div className="flex flex-wrap justify-center gap-4 mb-8">
              <a
                href="https://github.com/bhanreddy1973/TalkFlow"
                target="_blank"
                rel="noopener noreferrer"
                className="group relative px-10 py-4 rounded-xl font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 shadow-xl shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all duration-300 hover:-translate-y-0.5 text-lg"
              >
                Get TalkFlow
              </a>
            </div>

            <p className="text-gray-500 text-sm">
              Requires macOS 13+ · Apple Silicon or Intel · Python 3.11+
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
