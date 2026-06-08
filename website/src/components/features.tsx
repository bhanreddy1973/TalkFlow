"use client";

import { motion } from "framer-motion";

const features = [
  {
    icon: "⚡",
    title: "Live Streaming",
    description:
      "Text appears at your cursor as you speak — no waiting. Real-time transcription every 1.5 seconds.",
    gradient: "from-amber-400 to-orange-500",
  },
  {
    icon: "🔒",
    title: "100% On-Device",
    description:
      "Your audio never leaves your Mac. Whisper runs locally on Apple Silicon. Complete privacy.",
    gradient: "from-emerald-400 to-teal-500",
  },
  {
    icon: "🌍",
    title: "Works Everywhere",
    description:
      "Cursor-aware typing. Works in Slack, VS Code, Notion, Terminal, Mail — anywhere you can type.",
    gradient: "from-blue-400 to-indigo-500",
  },
  {
    icon: "🎯",
    title: "Smart Punctuation",
    description:
      'Say "period", "comma", "new line" and TalkFlow inserts actual punctuation. Natural dictation.',
    gradient: "from-pink-400 to-rose-500",
  },
  {
    icon: "📊",
    title: "Live Overlay",
    description:
      "A floating overlay shows what's being transcribed in real-time. See your words as you speak.",
    gradient: "from-violet-400 to-purple-500",
  },
  {
    icon: "⌨️",
    title: "Simple Hotkey",
    description:
      "Hold Ctrl + . to record, release to finish. Or toggle mode — press once to start, again to stop.",
    gradient: "from-cyan-400 to-blue-500",
  },
];

export function Features() {
  return (
    <section id="features" className="py-24 px-6 dot-pattern">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Why <span className="gradient-text">TalkFlow</span>?
          </h2>
          <p className="text-[var(--muted)] text-lg max-w-xl mx-auto">
            Voice typing that actually works — fast, private, and universal.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="group"
            >
              <div className="glass rounded-3xl p-6 h-full hover:scale-[1.02] transition-all duration-300">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center text-xl mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold mb-2 text-[var(--foreground)]">
                  {feature.title}
                </h3>
                <p className="text-[var(--muted)] text-sm leading-relaxed">
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
