"use client";

import { motion } from "framer-motion";

const features = [
  {
    icon: "⚡",
    title: "Live Streaming",
    description:
      "Text appears at your cursor as you speak — no waiting. Real-time transcription every 1.5 seconds.",
  },
  {
    icon: "🔒",
    title: "100% On-Device",
    description:
      "Your audio never leaves your Mac. Whisper runs locally on Apple Silicon. Complete privacy.",
  },
  {
    icon: "🌍",
    title: "Works Everywhere",
    description:
      "Cursor-aware typing. Works in Slack, VS Code, Notion, Terminal, Mail — anywhere you can type.",
  },
  {
    icon: "🎯",
    title: "Smart Punctuation",
    description:
      'Say "period", "comma", "new line" and TalkFlow inserts actual punctuation. Natural dictation.',
  },
  {
    icon: "📊",
    title: "Live Overlay",
    description:
      "A floating overlay shows what's being transcribed in real-time. See your words as you speak.",
  },
  {
    icon: "⌨️",
    title: "Simple Hotkey",
    description:
      "Hold Ctrl + . to record, release to finish. Or toggle mode — press once to start, again to stop.",
  },
];

export function Features() {
  return (
    <section id="features" className="py-24 px-6">
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
          <p className="text-gray-400 text-lg max-w-xl mx-auto">
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
              className="border-gradient group"
            >
              <div className="relative bg-[#0a0a18] rounded-2xl p-6 h-full hover:bg-[#0f0f22] transition-colors duration-300">
                <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold mb-2 text-white">
                  {feature.title}
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed">
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
