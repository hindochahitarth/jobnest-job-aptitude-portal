import React from "react";
import { motion } from "framer-motion";

const features = [
  { id: 1, title: "Resume Parsing", desc: "Extract sections & skills from your resume" },
  { id: 2, title: "JD Matching", desc: "AI-powered job-description to resume matching" },
  { id: 3, title: "Resume Builder", desc: "Templates and smart suggestions" },
  { id: 4, title: "Aptitude Tests", desc: "Timed, section-wise practice tests" },
  { id: 5, title: "AI Interview Prep", desc: "Mock Q&A, feedback & suggestions" },
];

const container = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } };

export default function FeaturesGrid() {
  return (
    <section className="landing-features" id="features">
      <div className="section-inner">
        <motion.h2 initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.04 }}>
          Powerful tools to help you get hired
        </motion.h2>
        <motion.p className="muted" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.08 }}>
          From parsing to interview prep — everything in one place.
        </motion.p>

        <motion.div className="features-grid" variants={container} initial="hidden" animate="show">
          {features.map((f) => (
            <motion.article key={f.id} className="feature-card" variants={item}>
              <div className="feature-icon">{"🟣"}</div>
              <h4>{f.title}</h4>
              <p className="muted">{f.desc}</p>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
