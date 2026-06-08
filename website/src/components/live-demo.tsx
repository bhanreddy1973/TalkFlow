"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const phrases = [
  "Hello, this is TalkFlow typing as I speak.",
  "It works in any app — Slack, VS Code, Terminal.",
  "Everything runs locally on my Mac. No cloud needed.",
  "Say period and it adds punctuation automatically.",
  "The text just appears in real-time. Like magic.",
];

export function LiveDemo() {
  const [displayText, setDisplayText] = useState("");
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentPhrase = phrases[phraseIndex];

    const timeout = setTimeout(
      () => {
        if (!isDeleting) {
          setDisplayText(currentPhrase.substring(0, charIndex + 1));
          setCharIndex((prev) => prev + 1);

          if (charIndex + 1 === currentPhrase.length) {
            setTimeout(() => setIsDeleting(true), 2000);
          }
        } else {
          setDisplayText(currentPhrase.substring(0, charIndex - 1));
          setCharIndex((prev) => prev - 1);

          if (charIndex <= 1) {
            setIsDeleting(false);
            setPhraseIndex((prev) => (prev + 1) % phrases.length);
          }
        }
      },
      isDeleting ? 25 : 45
    );

    return () => clearTimeout(timeout);
  }, [charIndex, isDeleting, phraseIndex]);

  return (
    <section id="demo" className="py-24 px-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
        >
          {/* Apple-style device frame */}
          <div className="glass rounded-[2rem] p-2 shadow-2xl shadow-indigo-500/5">
            <div className="bg-[var(--background)] rounded-[1.5rem] p-8 md:p-12 text-center relative overflow-hidden">
              {/* Liquid background inside */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="liquid-blob absolute -top-20 -right-20 w-[300px] h-[300px] bg-indigo-400/10 dark:bg-indigo-500/5 blur-[60px]" />
                <div className="liquid-blob absolute -bottom-20 -left-20 w-[250px] h-[250px] bg-purple-400/10 dark:bg-purple-500/5 blur-[50px]" style={{ animationDelay: "-4s" }} />
              </div>

              <div className="relative z-10">
                <h2 className="text-3xl md:text-4xl font-bold mb-3">
                  Live Typing <span className="gradient-text">Demo</span>
                </h2>
                <p className="text-[var(--muted)] mb-8">
                  This is what it looks like when TalkFlow is active.
                </p>

                {/* Apple-style display panel */}
                <div className="glass rounded-2xl p-6 md:p-8 text-left max-w-2xl mx-auto">
                  {/* Window chrome */}
                  <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[var(--border)]">
                    <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
                    <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
                    <div className="w-3 h-3 rounded-full bg-[#28c840]" />
                    <span className="ml-3 text-xs text-[var(--muted)] font-mono">
                      TalkFlow — Recording...
                    </span>
                  </div>

                  {/* Typing area */}
                  <div className="font-mono text-base md:text-lg min-h-[60px] flex items-center">
                    <span className="text-[var(--foreground)]">{displayText}</span>
                    <motion.span
                      animate={{ opacity: [1, 0] }}
                      transition={{ duration: 0.8, repeat: Infinity }}
                      className="inline-block w-[2px] h-5 bg-indigo-500 ml-0.5"
                    />
                  </div>
                </div>

                {/* Recording indicator */}
                <motion.div
                  animate={{ scale: [1, 1.02, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20"
                >
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
                  </span>
                  <span className="text-sm text-red-600 dark:text-red-300 font-medium">
                    Recording · Ctrl + .
                  </span>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
