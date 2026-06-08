"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const phrases = [
  "Hello, this is TalkFlow typing as I speak.",
  "It works in any app — Slack, VS Code, Terminal.",
  "Everything runs locally. No cloud. Total privacy.",
  "Say period and it adds punctuation automatically.",
];

export function LiveDemo() {
  const [displayText, setDisplayText] = useState("");
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentPhrase = phrases[phraseIndex];
    let timeout: NodeJS.Timeout;

    if (!isDeleting) {
      timeout = setTimeout(() => {
        setDisplayText(currentPhrase.substring(0, charIndex + 1));
        setCharIndex((prev) => prev + 1);
        if (charIndex + 1 === currentPhrase.length) {
          setTimeout(() => setIsDeleting(true), 2200);
        }
      }, 40 + Math.random() * 30); // Variable speed for natural feel
    } else {
      timeout = setTimeout(() => {
        setDisplayText(currentPhrase.substring(0, charIndex - 1));
        setCharIndex((prev) => prev - 1);
        if (charIndex <= 1) {
          setIsDeleting(false);
          setPhraseIndex((prev) => (prev + 1) % phrases.length);
        }
      }, 20);
    }

    return () => clearTimeout(timeout);
  }, [charIndex, isDeleting, phraseIndex]);

  return (
    <section id="demo" className="py-28 px-6">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-3">
            See it{" "}
            <span className="tag-pop bg-[var(--accent-4)]/15 text-[var(--accent-4)]">
              breathe
            </span>
          </h2>
          <p className="text-[var(--muted)] font-light">
            A living demo of the typing experience.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {/* Apple-style display — like a floating screen */}
          <div className="relative">
            {/* Reflection/glow under the device */}
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-3/4 h-8 bg-[var(--primary)]/5 blur-xl rounded-full" />

            {/* Device frame */}
            <div className="glass rounded-[1.8rem] p-[3px] shadow-2xl shadow-black/5 dark:shadow-black/20">
              <div className="bg-[var(--background)] rounded-[1.6rem] overflow-hidden">
                {/* Title bar */}
                <div className="flex items-center px-5 py-3 border-b border-[var(--border)]">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
                    <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
                    <div className="w-3 h-3 rounded-full bg-[#28c840]" />
                  </div>
                  <div className="flex-1 text-center">
                    <span className="text-[11px] text-[var(--muted)] font-medium">
                      Notes — TalkFlow Active
                    </span>
                  </div>
                  <div className="w-14" />
                </div>

                {/* Content area */}
                <div className="p-8 md:p-10 min-h-[200px]">
                  <div className="font-mono text-base md:text-lg leading-relaxed">
                    <span className="text-[var(--foreground)]">{displayText}</span>
                    <motion.span
                      animate={{ opacity: [1, 0, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                      className="inline-block w-[2px] h-[1.2em] bg-[var(--primary)] ml-[1px] align-middle"
                    />
                  </div>
                </div>

                {/* Status bar */}
                <div className="px-5 py-2.5 border-t border-[var(--border)] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
                    </span>
                    <span className="text-[11px] text-red-500 dark:text-red-400 font-semibold">
                      REC
                    </span>
                  </div>
                  <span className="text-[11px] text-[var(--muted)]">
                    Model: base · en
                  </span>
                  <div className="flex items-center gap-1.5">
                    <kbd className="px-1.5 py-0.5 rounded text-[10px] bg-[var(--foreground)]/5 dark:bg-white/10 font-mono">⌃</kbd>
                    <kbd className="px-1.5 py-0.5 rounded text-[10px] bg-[var(--foreground)]/5 dark:bg-white/10 font-mono">.</kbd>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
