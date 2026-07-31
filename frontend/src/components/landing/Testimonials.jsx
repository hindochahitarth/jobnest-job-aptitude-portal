import React from "react";
import { motion } from "framer-motion";

const testimonials = [
  { id: 1, text: "Landed my first internship thanks to JobNest's resume tips!", author: "Asha, Student" },
  { id: 2, text: "The aptitude tests are short and to-the-point — great practice.", author: "Rohan, Grad" },
];

const container = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 6 }, show: { opacity: 1, y: 0 } };

export default function Testimonials() {
  return (
    <section className="landing-testimonials">
      <div className="section-inner">
        <motion.h2 initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.04 }}>
          Trusted by learners & recruiters
        </motion.h2>
        <motion.div className="testimonials-row" variants={container} initial="hidden" animate="show">
          {testimonials.map((t) => (
            <motion.blockquote key={t.id} className="testimonial" variants={item}>
              <p>“{t.text}”</p>
              <cite>{t.author}</cite>
            </motion.blockquote>
          ))}
        </motion.div>

        <motion.div className="landing-stats" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.14 }}>
          <div className="stat">
            <div className="stat-value">120k+</div>
            <div className="stat-label muted">Resumes parsed</div>
          </div>
          <div className="stat">
            <div className="stat-value">35k+</div>
            <div className="stat-label muted">Aptitude tests taken</div>
          </div>
          <div className="stat">
            <div className="stat-value">18k+</div>
            <div className="stat-label muted">Candidates placed</div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
