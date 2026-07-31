import React from "react";
import { motion } from "framer-motion";

export default function JobCard({ job = {}, onApply }) {
  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
      className="job-card card"
    >
      <div className="job-top">
        <div>
          <h3 className="job-title">{job.title}</h3>
          <div className="job-meta">
            <span className="company">{job.company}</span> • <span>{job.location}</span>
          </div>
        </div>

        <div className="job-score">
          <div className="score-badge">{job.match ?? 0}%</div>
        </div>
      </div>

      <p className="job-snippet">{job.snippet}</p>

      <div className="job-actions">
        <button className="btn btn-primary" onClick={() => onApply?.(job)}>
          Apply
        </button>
        <a
          href="/jobs"
          className="btn btn-ghost"
          onClick={(e) => {
            e.preventDefault();
            window.history.pushState({}, "", "/jobs");
            window.dispatchEvent(new PopStateEvent("popstate"));
          }}
        >
          Details
        </a>
      </div>
    </motion.article>
  );
}
