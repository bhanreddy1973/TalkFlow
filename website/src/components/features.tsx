"use client";

import { motion } from "framer-motion";

const features = [
  {
    icon: "⚡",
    title: "Live Streaming",
    highlight: "1.5s",
    description: "Text at your cursor as you speak. Chunks transcribed every",
    bg: "bg-amber-50 dark:bg-amber-500/5",
    accent: "text-amber-600 dark:text-amber-400",
    border: "border-amber-200/60 dark:border-amber-500/10",
  },
  {
    icon: "🔐",
    title: "On-Device",
    highlight: "0 bytes",
    description: "sent to the cloud. Whisper runs locally on your Apple Silicon.",
    bg: "bg-emerald-50 dark:bg-emerald-500/5",
    accent: "text-emerald-600 dark:text-emerald-400",
    border: "border-emerald-200/60 dark:border-emerald-500/10",
  },
  {
    icon: "✨",
    title: "Any App",
    highlight: "Everywhere",
    description: "works. Slack, VS Code, Notion, Terminal — if you can type there.",
    bg: "bg-blue-50 dark:bg-blue-500/5",
    accent: "text-blue-600 dark:text-blue-400",
    border: "border-blue-200/60 dark:border-blue-500/10",
  },
  {
    icon: "💬",
    title: "Say It",
    highlight: '"period"',
    description: 'becomes . — spoken punctuation that just works naturally.',
    bg: "bg-pink-50 dark:bg-pink-500/5",
    accent: "text-pink-600 dark:text-pink-400",
    border: "border-pink-200/60 dark:border-pink-500/10",
  },
  {
    icon: "👁️",
    title: "Overlay",
    highlight: "Floating",
    description: "window shows your words appearing in real-time as you speak.",
    bg: "bg-violet-50 dark:bg-violet-500/5",
    accent: "text-violet-600 dark:text-violet-400",
    border: "border-violet-200/60 dark:border-violet-500/10",
  },
  {
    icon: "🎹",
    title: "One Key",
    highlight: "Ctrl + .",
    description: "— hold to talk, release to done. That's the entire UX.",
    bg: "bg-cyan-50 dark:bg-cyan-500/5",
    accent: "text-cyan-600 dark:text-cyan-400",
    border: "border-cyan-200/60 dark:border-cyan-500/10",
  },
];

export function Features() {
  return (
    <section id="features" className="py-28 px-6">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
            Not your average{" "}
            <span className="italic font-light text-[var(--muted)]">voice app</span>
          </h2>
          <p className="text-[var(--muted)] text-lg max-w-md mx-auto font-light">
            Built different. Here&apos;s what makes it click.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.45, delay: index * 0.08 }}
            >
              <div className={`${feature.bg} border ${feature.border} rounded-3xl p-6 h-full hover:scale-[1.03] transition-all duration-300 cursor-default`}>
                <span className="text-3xl mb-3 block">{feature.icon}</span>
                <h3 className="text-base font-bold mb-1 text-[var(--foreground)]">
                  {feature.title}{" "}
                  <span className={`${feature.accent} font-black`}>
                    {feature.highlight}
                  </span>
                </h3>
                <p className="text-[var(--muted)] text-[13px] leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
