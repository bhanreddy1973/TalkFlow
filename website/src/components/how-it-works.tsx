"use client";

import { motion } from "framer-motion";

const steps = [
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
        <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
        <line x1="12" y1="19" x2="12" y2="23" />
        <line x1="8" y1="23" x2="16" y2="23" />
      </svg>
    ),
    title: "Hold & speak",
    description: "Press Ctrl + . anywhere. The overlay pops up, listening starts instantly.",
    tag: "START",
    tagColor: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-300",
    gradient: "from-indigo-500 to-blue-600",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="4 17 10 11 4 5" />
        <line x1="12" y1="19" x2="20" y2="19" />
      </svg>
    ),
    title: "Words appear live",
    description: "Every 1.5s, new words type at your cursor position. No waiting for the end.",
    tag: "STREAMING",
    tagColor: "bg-orange-500/10 text-orange-600 dark:text-orange-300",
    gradient: "from-orange-500 to-amber-600",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    ),
    title: "Release. Done.",
    description: "Final accuracy pass fills in any gaps. Text is already there, ready to send.",
    tag: "FINISH",
    tagColor: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-300",
    gradient: "from-emerald-500 to-green-600",
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
              className="group"
            >
              <div className="glass rounded-3xl p-6 md:p-8 flex items-start gap-5">
                {/* Icon with gradient background */}
                <div className={`flex-shrink-0 w-14 h-14 rounded-2xl bg-gradient-to-br ${step.gradient} flex items-center justify-center text-white shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                  {step.icon}
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1.5 flex-wrap">
                    <h3 className="text-lg font-bold text-[var(--foreground)]">
                      {step.title}
                    </h3>
                    <span className={`text-[10px] font-black tracking-widest px-2.5 py-1 rounded-full ${step.tagColor}`}>
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
