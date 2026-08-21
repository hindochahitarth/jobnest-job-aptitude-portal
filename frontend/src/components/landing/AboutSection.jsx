import React from "react";

export default function AboutSection() {
  return (
    <section className="landing-section" id="about">
      <div className="section-container">
        <div className="section-header-center">
          <h2>About JobNest</h2>
          <p>Connecting ambition with opportunity through data-driven aptitude evaluations.</p>
        </div>

        <div style={{ background: "#ffffff", padding: 36, borderRadius: "var(--radius-lg)", border: "1px solid var(--surface-border)", boxShadow: "var(--shadow-sm)", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32, alignItems: "center" }}>
          <div>
            <h3 style={{ fontSize: 24, fontWeight: 800, marginBottom: 14, color: "var(--text-main)" }}>
              Bridging the gap between resumes and real talent
            </h3>
            <p style={{ color: "var(--text-muted)", fontSize: 15, lineHeight: 1.6, marginBottom: 20 }}>
              Traditional hiring relies heavily on keyword matching, missing out on talented candidates with high problem-solving potential. JobNest combines aptitude testing with intelligent job matching to make recruitment fair, fast, and transparent.
            </p>
            <div style={{ display: "flex", gap: 16 }}>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  window.history.pushState({}, "", "/signup");
                  window.dispatchEvent(new PopStateEvent("popstate"));
                }}
              >
                Join as Candidate
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  window.history.pushState({}, "", "/signup");
                  window.dispatchEvent(new PopStateEvent("popstate"));
                }}
              >
                Hire Top Talent
              </button>
            </div>
          </div>

          <div style={{ background: "var(--primary-light)", padding: 24, borderRadius: "var(--radius-md)", border: "1px solid var(--primary-soft)" }}>
            <h4 style={{ color: "var(--primary)", fontSize: 16, fontWeight: 700, marginBottom: 12 }}>Platform Highlights</h4>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 10, fontSize: 14, color: "var(--text-main)" }}>
              <li>- Verified Aptitude Certifications</li>
              <li>- Real-time Resume Parsing & Match Scoring</li>
              <li>- Recruiter Applicant Tracking System (ATS)</li>
              <li>- AI Guided Interview Readiness</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
