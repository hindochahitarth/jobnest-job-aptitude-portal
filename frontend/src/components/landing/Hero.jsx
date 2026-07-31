import React from "react";
import { motion } from "framer-motion";

function navigateTo(path) {
  window.history.pushState({}, "", path);
  window.dispatchEvent(new PopStateEvent("popstate"));
}

export default function Hero() {
  return (
    <section className="landing-hero">
      <div className="hero-background" aria-hidden="true" />
      <div className="section-inner hero-inner">
        <div className="hero-copy">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08, duration: 0.56 }}
            className="hero-badge"
          >
            <span>Built for Gen Z job hunters and early-career talent</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12, duration: 0.6 }}
          >
            Find the right job. Prove your skills. Land your next role with confidence.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18, duration: 0.55 }}
          >
            JobNest brings AI resume matching, aptitude tests, and career-ready feedback together in one polished candidate experience.
          </motion.p>

          <motion.div
            className="hero-ctas"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.22, duration: 0.4 }}
          >
            <button className="btn btn-primary" type="button" onClick={() => navigateTo("/signup")}>Get Started</button>
            <button className="btn btn-ghost" type="button" onClick={() => navigateTo("/jobs")}>Explore Jobs</button>
          </motion.div>

          <motion.div
            className="hero-stat-grid"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.28, duration: 0.45 }}
          >
            <div className="hero-stat">
              <strong>98%</strong>
              <span>Resume match confidence boosted</span>
            </div>
            <div className="hero-stat">
              <strong>25k+</strong>
              <span>Students who practiced aptitude tests</span>
            </div>
            <div className="hero-stat">
              <strong>4.9/5</strong>
              <span>Candidate satisfaction rating</span>
            </div>
          </motion.div>
        </div>

        <motion.div
          className="hero-visual"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.18, duration: 0.62 }}
        >
          <div className="illustration" aria-hidden>
            <svg viewBox="0 0 900 600" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="lg1" x1="0" x2="1">
                  <stop offset="0%" stopColor="#7c3aed" />
                  <stop offset="100%" stopColor="#2563eb" />
                </linearGradient>
                <linearGradient id="lg2" x1="0" x2="1">
                  <stop offset="0%" stopColor="#22c1c3" />
                  <stop offset="100%" stopColor="#7c3aed" />
                </linearGradient>
                <filter id="f1" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="22" result="g" />
                </filter>
              </defs>

              <rect x="0" y="0" width="900" height="600" rx="34" fill="url(#lg1)" opacity="0.08" />
              <circle cx="720" cy="120" r="56" fill="#fff" opacity="0.12" />
              <circle cx="180" cy="460" r="52" fill="#fff" opacity="0.08" />
              <rect x="60" y="80" width="260" height="146" rx="24" fill="#fff" opacity="0.08" />
              <rect x="110" y="110" width="160" height="18" rx="9" fill="#fff" opacity="0.18" />
              <rect x="110" y="150" width="110" height="12" rx="6" fill="#fff" opacity="0.14" />
              <rect x="420" y="32" width="384" height="204" rx="26" fill="#fff" opacity="0.05" />
              <rect x="440" y="58" width="130" height="12" rx="6" fill="#fff" opacity="0.18" />
              <rect x="440" y="92" width="240" height="14" rx="7" fill="#fff" opacity="0.14" />
              <rect x="440" y="130" width="120" height="12" rx="6" fill="#fff" opacity="0.14" />
              <rect x="440" y="168" width="260" height="12" rx="6" fill="#fff" opacity="0.12" />
              <rect x="520" y="250" width="280" height="160" rx="20" fill="#fff" opacity="0.06" />
              <rect x="540" y="282" width="110" height="14" rx="7" fill="#fff" opacity="0.18" />
              <rect x="540" y="314" width="180" height="12" rx="6" fill="#fff" opacity="0.12" />
              <circle cx="790" cy="380" r="18" fill="#fff" opacity="0.15" />
              <circle cx="750" cy="430" r="34" fill="#fff" opacity="0.08" />
              <ellipse cx="660" cy="520" rx="170" ry="80" fill="url(#lg2)" opacity="0.08" filter="url(#f1)" />
            </svg>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
