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
          <div className="border-gradient">
            <div className="relative bg-[#0a0a18] rounded-2xl p-8 md:p-12 text-center overflow-hidden">
              {/* Background glow */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[200px] bg-indigo-500/5 rounded-full blur-[80px]" />
              </div>

              <div className="relative z-10">
                <h2 className="text-3xl md:text-4xl font-bold mb-3">
                  Live Typing <span className="gradient-text">Demo</span>
                </h2>
                <p className="text-gray-400 mb-8">
                  This is what it looks like when TalkFlow is active.
                </p>

                {/* Terminal-like demo box */}
                <div className="bg-[#030014] border border-white/10 rounded-xl p-6 md:p-8 text-left max-w-2xl mx-auto">
                  {/* Terminal header */}
                  <div className="flex items-center gap-2 mb-4 pb-3 border-b border-white/5">
                    <div className="w-3 h-3 rounded-full bg-red-500/80" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                    <div className="w-3 h-3 rounded-full bg-green-500/80" />
                    <span className="ml-3 text-xs text-gray-500 font-mono">
                      TalkFlow — Recording...
                    </span>
                  </div>

                  {/* Typing area */}
                  <div className="font-mono text-base md:text-lg min-h-[60px] flex items-center">
                    <span className="text-indigo-300">{displayText}</span>
                    <span className="inline-block w-[2px] h-5 bg-indigo-400 ml-0.5 animate-pulse" />
                  </div>
                </div>

                {/* Recording indicator */}
                <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 border border-red-500/20">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
                  </span>
                  <span className="text-sm text-red-300 font-medium">
                    Recording · Ctrl + .
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
