import React from "react";

export default function JobCard({ job, onApply }) {
  const companyInitial = (job.company || "C").charAt(0).toUpperCase();

  return (
    <div className="job-card-v2">
      <div className="job-card-header">
        <div className="company-logo-placeholder">{companyInitial}</div>
        <div className="job-meta-main">
          <h3 className="job-title-v2">{job.title}</h3>
          <p className="company-name-v2">{job.company} • {job.location || "Remote"}</p>
        </div>
        {job.match && (
          <div className="match-badge-v2">
            🎯 {job.match}% Match
          </div>
        )}
      </div>

      {job.snippet && (
        <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.5 }}>
          {job.snippet}
        </p>
      )}

      <div className="job-tags-row">
        <span className="job-tag">Full-Time</span>
        <span className="job-tag">Aptitude Screened</span>
        {job.skills ? (
          job.skills.split(",").map((s, i) => (
            <span key={i} className="job-tag">{s.trim()}</span>
          ))
        ) : (
          <span className="job-tag">React / Tech</span>
        )}
      </div>

      <div className="job-card-footer">
        <div className="salary-text">{job.salary || "₹8 LPA - ₹12 LPA"}</div>
        <button
          type="button"
          className="btn btn-primary btn-sm"
          onClick={() => onApply && onApply(job)}
        >
          Easy Apply
        </button>
      </div>
    </div>
  );
}
