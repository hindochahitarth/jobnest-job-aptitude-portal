import React from "react";

const steps = [
  {
    num: "1",
    title: "Create Profile",
    desc: "Build your professional profile and upload your resume for instant AI analysis.",
  },
  {
    num: "2",
    title: "Take Aptitude Assessment",
    desc: "Complete standardized aptitude and skill assessments to earn verified score badges.",
  },
  {
    num: "3",
    title: "Get Matched & Shortlisted",
    desc: "Recruiters discover your verified profile and send direct interview invitations.",
  },
  {
    num: "4",
    title: "Land Your Role",
    desc: "Prepare with AI mock interview tools and secure your dream job with top companies.",
  },
];

export default function HowItWorks() {
  return (
    <section className="landing-section alt-bg" id="how-it-works">
      <div className="section-container">
        <div className="section-header-center">
          <h2>How JobNest Works</h2>
          <p>Four simple steps from building your profile to landing top offers.</p>
        </div>

        <div className="how-it-works-grid">
          {steps.map((step) => (
            <div key={step.num} className="step-card">
              <div className="step-number">{step.num}</div>
              <h4>{step.title}</h4>
              <p>{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
