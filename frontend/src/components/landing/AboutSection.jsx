import React from "react";
import { motion } from "framer-motion";

const cards = [
  {
    id: 1,
    title: "Smart Match Scores",
    description: "AI-powered resume and JD matching helps you apply to the right roles faster.",
  },
  {
    id: 2,
    title: "Test-First Preparation",
    description: "Practice section-wise aptitude tests for quant, logic, verbal, and coding confidence.",
  },
  {
    id: 3,
    title: "Dashboard for Growth",
    description: "Track your applications, test progress, and match performance in one unified hub.",
  },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
};

export default function AboutSection() {
  return (
    <section className="landing-about" id="about">
      <div className="section-inner">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 }}>
          <h2>Why JobNest?</h2>
          <p className="muted">
            Designed for ambitious candidates and hiring teams, JobNest blends modern UX with a focused job search workflow.
          </p>
        </motion.div>

        <motion.div className="about-grid" variants={container} initial="hidden" animate="show">
          {cards.map((card) => (
            <motion.article key={card.id} className="about-card" variants={item}>
              <h4>{card.title}</h4>
              <p>{card.description}</p>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
