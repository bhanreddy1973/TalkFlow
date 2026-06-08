"use client";

import { motion } from "framer-motion";

export function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 pt-28 pb-20 overflow-hidden mesh-bg">
      {/* Liquid background blobs — soft in light, subtle in dark */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="liquid-blob absolute top-[15%] left-[10%] w-[420px] h-[420px] bg-[#5856d6]/10 dark:bg-[#5856d6]/5 blur-[80px]" />
        <div className="liquid-blob absolute top-[25%] right-[15%] w-[350px] h-[350px] bg-[#ff2d55]/8 dark:bg-[#ff2d55]/4 blur-[70px]" style={{ animationDelay: "-3s" }} />
        <div className="liquid-blob absolute bottom-[20%] left-[30%] w-[300px] h-[300px] bg-[#af52de]/8 dark:bg-[#af52de]/4 blur-[60px]" style={{ animationDelay: "-6s" }} />
      </div>

      {/* Badge */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="relative z-10 glass inline-flex items-center gap-2.5 px-5 py-2 rounded-full mb-10"
      >
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
        </span>
        <span className="text-[13px] font-semibold text-[var(--muted)] tracking-wide uppercase">
          100% Local · Private · Open Source
        </span>
      </motion.div>

      {/* Heading with mixed text styles */}
      <motion.h1
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.2 }}
        className="relative z-10 text-[3.2rem] md:text-[5.5rem] lg:text-[7rem] font-black tracking-tight leading-[0.95] mb-8"
      >
        <span className="font-light italic text-[var(--muted)]">Speak.</span>{" "}
        <span className="gradient-text">It types.</span>
        <br />
        <span className="relative inline-block">
          <span className="tag-pop bg-[var(--accent-3)]/15 text-[var(--accent-5)] dark:bg-[var(--accent-3)]/10">Live</span>
        </span>{" "}
        <span className="font-extralight text-[var(--muted)] text-[0.6em]">as you talk.</span>
      </motion.h1>

      {/* Subtitle */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.35 }}
        className="relative z-10 text-lg md:text-[1.35rem] text-[var(--muted)] max-w-xl mb-12 leading-relaxed font-light"
      >
        Voice-to-text that <span className="fancy-underline font-medium text-[var(--foreground)]">types at your cursor</span> while 
        you speak. Works in <em>every</em> app. Whisper runs on your Mac.
      </motion.p>

      {/* CTA Buttons — asymmetric and playful */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.45 }}
        className="relative z-10 flex flex-wrap gap-4 justify-center items-center"
      >
        <a
          href="#how-it-works"
          className="btn-magnetic relative px-8 py-4 rounded-full font-bold text-white bg-[var(--foreground)] dark:bg-white dark:text-[#1c1c1e] shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 text-[15px]"
        >
          See how it works ↓
        </a>
        <a
          href="https://github.com/bhanreddy1973/TalkFlow"
          target="_blank"
          rel="noopener noreferrer"
          className="group px-7 py-4 rounded-full font-semibold text-[var(--foreground)] border-2 border-[var(--border)] hover:border-[var(--primary)] transition-all duration-300 hover:-translate-y-1 text-[15px] flex items-center gap-2"
        >
          <span>GitHub</span>
          <motion.span
            animate={{ x: [0, 3, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            →
          </motion.span>
        </a>
      </motion.div>

      {/* Floating keyboard shortcut hint */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10"
      >
        <div className="glass px-4 py-2 rounded-xl flex items-center gap-2">
          <kbd className="px-2 py-0.5 rounded-md bg-[var(--foreground)]/5 dark:bg-white/10 text-xs font-mono font-bold">Ctrl</kbd>
          <span className="text-[var(--muted)] text-xs">+</span>
          <kbd className="px-2 py-0.5 rounded-md bg-[var(--foreground)]/5 dark:bg-white/10 text-xs font-mono font-bold">.</kbd>
          <span className="text-xs text-[var(--muted)] ml-1">to start</span>
        </div>
      </motion.div>
    </section>
  );
}
