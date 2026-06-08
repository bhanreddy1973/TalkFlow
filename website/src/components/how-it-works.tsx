"use client";

import { motion } from "framer-motion";

const steps = [
  {
    emoji: "🎙️",
    title: "Hold & speak",
    description: "Press Ctrl + . anywhere. The overlay pops up, listening starts.",
    tag: "START",
    tagColor: "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300",
  },
  {
    emoji: "⚡",
    title: "Words appear live",
    description: "Every 1.5s, new words type at your cursor. No waiting.",
    tag: "STREAMING",
    tagColor: "bg-orange-100 text-orange-700 dark:bg-orange-500/10 dark:text-orange-300",
  },
  {
    emoji: "✋",
    title: "Release. Done.",
    description: "Final accuracy pass fills in any gaps. Text is already there.",
    tag: "FINISH",
    tagColor: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-28 px-6 mesh-bg">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
            <span className="font-light italic text-[var(--muted)]">Three</span>{" "}
            steps.{" "}
            <span className="gradient-text">Zero</span> friction.
          </h2>
        </motion.div>

        <div className="space-y-5">
          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: index * 0.12 }}
            >
              <div className="glass rounded-3xl p-6 md:p-8 flex items-start gap-5">
                {/* Emoji with squircle background */}
                <div className="flex-shrink-0 w-14 h-14 squircle bg-[var(--foreground)]/5 dark:bg-white/5 flex items-center justify-center text-2xl">
                  {step.emoji}
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1.5">
                    <h3 className="text-lg font-bold text-[var(--foreground)]">
                      {step.title}
                    </h3>
                    <span className={`text-[10px] font-black tracking-widest px-2 py-0.5 rounded-full ${step.tagColor}`}>
                      {step.tag}
                    </span>
                  </div>
                  <p className="text-[var(--muted)] text-[15px] leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
