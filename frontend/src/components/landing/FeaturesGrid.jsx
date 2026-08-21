import React from "react";

const features = [
  {
    icon: "",
    title: "AI Resume & Skill Matcher",
    desc: "Our smart parsing engine analyzes your resume against recruiter job descriptions, giving instant match percentages and skill gap highlights.",
  },
  {
    icon: "",
    title: "Verified Aptitude Tests",
    desc: "Prove your analytical, quantitative, and verbal capabilities with industry-aligned aptitude assessments that recruiters trust.",
  },
  {
    icon: "",
    title: "Direct Recruiter Access",
    desc: "Get shortlisted faster. Recruiters search our candidate database filtered directly by verified aptitude scores and resume matches.",
  },
  {
    icon: "",
    title: "Skill Scorecards & Reports",
    desc: "Comprehensive performance scorecards detailing your strengths, percentile rank, and practice mock tests for interview readiness.",
  },
];

export default function FeaturesGrid() {
  return (
    <section className="landing-section" id="features">
      <div className="section-container">
        <div className="section-header-center">
          <h2>Why Top Talent & Recruiters Choose JobNest</h2>
          <p>Everything candidates and hiring teams need to connect based on real, verified skill metrics.</p>
        </div>

        <div className="features-grid-v2">
          {features.map((item, idx) => (
            <div key={idx} className="feature-card-v2">
              <div className="feature-icon-v2">{item.icon}</div>
              <h3>{item.title}</h3>
              <p>{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
