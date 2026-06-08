"use client";

import { motion } from "framer-motion";

const steps = [
  {
    number: "01",
    title: "Hold the hotkey and speak",
    description:
      "Press and hold Ctrl + . anywhere on your Mac. The menu bar icon turns red and the floating overlay appears.",
    color: "from-indigo-500 to-blue-500",
  },
  {
    number: "02",
    title: "Watch text appear live",
    description:
      "As you speak, text is transcribed and typed directly at your cursor in real-time. The overlay shows what's being recognized.",
    color: "from-purple-500 to-pink-500",
  },
  {
    number: "03",
    title: "Release — done",
    description:
      "Let go of the hotkey. A final accuracy pass polishes the text. Your words are already typed, ready to send.",
    color: "from-emerald-500 to-teal-500",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 px-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            How It <span className="gradient-text">Works</span>
          </h2>
          <p className="text-[var(--muted)] text-lg">
            Three simple steps to voice typing.
          </p>
        </motion.div>

        <div className="space-y-8">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              className="group"
            >
              <div className="glass rounded-3xl p-8 flex gap-6 items-start hover:scale-[1.01] transition-all duration-300">
                {/* Step number */}
                <div className={`flex-shrink-0 w-16 h-16 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center shadow-lg`}>
                  <span className="text-xl font-bold text-white">
                    {step.number}
                  </span>
                </div>

                {/* Content */}
                <div className="flex-1 pt-1">
                  <h3 className="text-xl md:text-2xl font-semibold mb-2 text-[var(--foreground)]">
                    {step.title}
                  </h3>
                  <p className="text-[var(--muted)] leading-relaxed">
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
