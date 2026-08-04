import React from "react";

export default function Footer() {
  return (
    <footer className="landing-footer">
      <div className="footer-container">
        <div className="footer-grid">
          <div className="footer-brand">
            <h3>JobNest</h3>
            <p>India's leading career acceleration and aptitude-verified job matching portal for students, candidates, and hiring managers.</p>
          </div>

          <div className="footer-col">
            <h4>For Candidates</h4>
            <ul>
              <li><a href="/jobs">Browse Jobs</a></li>
              <li><a href="/#features">Aptitude Tests</a></li>
              <li><a href="/dashboard/resume">Resume AI Builder</a></li>
              <li><a href="/dashboard/interview">Interview Prep</a></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>For Employers</h4>
            <ul>
              <li><a href="/dashboard/post-job">Post a Job</a></li>
              <li><a href="/dashboard/applicants">Candidate Search</a></li>
              <li><a href="/dashboard/ai-tools">AI Screening Tools</a></li>
              <li><a href="/#how-it-works">Pricing Plans</a></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Company</h4>
            <ul>
              <li><a href="/#about">About Us</a></li>
              <li><a href="/#features">Features</a></li>
              <li><a href="/#privacy">Privacy Policy</a></li>
              <li><a href="/#terms">Terms of Service</a></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} JobNest Inc. All rights reserved.</span>
          <span>Designed with LinkedIn & Naukri Inspired Corporate UX</span>
        </div>
      </div>
    </footer>
  );
}
