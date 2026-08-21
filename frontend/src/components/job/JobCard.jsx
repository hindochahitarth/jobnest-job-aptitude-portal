import React from "react";

export default function JobCard({ job, onApply, showApply = true, isSelected = false }) {
  const companyInitial = (job.company || "C").charAt(0).toUpperCase();
  const match = job.matchScore ?? job.match;
  const description = job.description || job.snippet;

  return (
    <div className={`job-card-v2 ${isSelected ? "selected-job-card" : ""}`}>
      <div className="job-card-header">
        <div className="company-logo-placeholder">{companyInitial}</div>
        <div className="job-meta-main">
          <h3 className="job-title-v2">{job.title}</h3>
          <p className="company-name-v2">{job.company} • {job.location || "Remote"}</p>
        </div>
        {showApply && match != null && (
          <div className="match-badge-v2">
            {match}% Match
          </div>
        )}
      </div>

      {description && (
        <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
          {description}
        </p>
      )}

      <div className="job-tags-row">
        <span className="job-tag">Full-Time</span>
        {job.expLevel && <span className="job-tag">Exp: {job.expLevel} yrs</span>}
        {job.aptitudeCutoff && <span className="job-tag">Cutoff: {job.aptitudeCutoff}%</span>}
        {showApply && job.matchedSkills && job.matchedSkills.length > 0 ? (
          job.matchedSkills.slice(0, 3).map((s, i) => (
            <span key={i} className="job-tag" style={{ background: "var(--success-bg)", color: "var(--success)", borderColor: "var(--success-border)", fontWeight: 600 }}>
               {s}
            </span>
          ))
        ) : job.skills ? (
          job.skills.split(",").slice(0, 4).map((s, i) => (
            <span key={i} className="job-tag">{s.trim()}</span>
          ))
        ) : null}
      </div>

      <div className="job-card-footer">
        <div className="salary-text">{job.salary || "₹8 LPA - ₹12 LPA"}</div>
        <button
          type="button"
          className="btn btn-primary btn-sm"
          onClick={(e) => {
            e.stopPropagation();
            onApply && onApply(job);
          }}
        >
          {showApply ? "Easy Apply" : "Login to Apply"}
        </button>
      </div>
    </div>
  );
}
