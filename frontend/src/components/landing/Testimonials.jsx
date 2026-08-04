import React from "react";

const reviews = [
  {
    quote: "JobNest's aptitude test score gave me an edge! Recruiters noticed my 98th percentile score in quantitative reasoning and contacted me directly for interview rounds.",
    name: "Priya Sharma",
    role: "Software Development Engineer @ TechCorp",
    initial: "P",
  },
  {
    quote: "As a tech recruiter, JobNest saved us hundreds of screening hours. The pre-tested aptitude scores allow us to shortlist top engineering candidates with confidence.",
    name: "Rahul Verma",
    role: "Senior Talent Acquisition Manager",
    initial: "R",
  },
  {
    quote: "The AI match breakdown showed me exactly which skills were missing from my resume for frontend roles. After updating, my application response rate tripled!",
    name: "Aman Gupta",
    role: "Frontend Engineer",
    initial: "A",
  },
];

export default function Testimonials() {
  return (
    <section className="landing-section alt-bg">
      <div className="section-container">
        <div className="section-header-center">
          <h2>Trusted by Candidates & Recruiters Across India</h2>
          <p>Read how JobNest is accelerating careers and hiring pipelines.</p>
        </div>

        <div className="testimonials-grid">
          {reviews.map((rev, i) => (
            <div key={i} className="testimonial-card">
              <p className="testimonial-quote">"{rev.quote}"</p>
              <div className="testimonial-author">
                <div className="author-avatar">{rev.initial}</div>
                <div className="author-info">
                  <div className="name">{rev.name}</div>
                  <div className="role">{rev.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
