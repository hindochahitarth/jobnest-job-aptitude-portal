import React from "react";
import { motion } from "framer-motion";

const steps = [
  "Signup",
  "Upload Resume",
  "Get Match Score",
  "Take Test",
  "Get Results",
];

const container = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const stepVariant = { hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } };

export default function HowItWorks() {
  return (
    <section className="landing-steps">
      <div className="section-inner">
        <motion.h2 initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.04 }}>
          How it works
        </motion.h2>
        <motion.p className="muted" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.08 }}>
          A simple flow to get you interview-ready.
        </motion.p>

        <motion.div className="steps-row" variants={container} initial="hidden" animate="show">
          {steps.map((s, i) => (
            <motion.div key={s} className="step" variants={stepVariant}>
              <div className="step-index">{i + 1}</div>
              <div className="step-title">{s}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
