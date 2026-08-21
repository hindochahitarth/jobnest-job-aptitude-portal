import React from "react";

export default function Footer() {
  function handleLinkClick(e, href) {
    e.preventDefault();
    window.history.pushState({}, "", href);
    window.dispatchEvent(new PopStateEvent("popstate"));

    const hashIndex = href.indexOf("#");
    if (hashIndex > -1) {
      const targetId = href.slice(hashIndex);
      const target = document.querySelector(targetId);
      if (target) {
        setTimeout(() => target.scrollIntoView({ behavior: "smooth", block: "start" }), 60);
      }
    }
  }

  function NavLink({ href, children }) {
    return (
      <a href={href} onClick={(e) => handleLinkClick(e, href)}>
        {children}
      </a>
    );
  }

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
              <li><NavLink href="/jobs">Browse Jobs</NavLink></li>
              <li><NavLink href="/#features">Aptitude Tests</NavLink></li>
              <li><NavLink href="/dashboard/resume">Resume AI Builder</NavLink></li>
              <li><NavLink href="/dashboard/interview">Interview Prep</NavLink></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>For Employers</h4>
            <ul>
              <li><NavLink href="/dashboard/post-job">Post a Job</NavLink></li>
              <li><NavLink href="/dashboard/applicants">Candidate Search</NavLink></li>
              <li><NavLink href="/dashboard/ai-tools">AI Screening Tools</NavLink></li>
              <li><NavLink href="/#how-it-works">Pricing Plans</NavLink></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Company</h4>
            <ul>
              <li><NavLink href="/#about">About Us</NavLink></li>
              <li><NavLink href="/#features">Features</NavLink></li>
              <li><NavLink href="/#privacy">Privacy Policy</NavLink></li>
              <li><NavLink href="/#terms">Terms of Service</NavLink></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} JobNest Inc. All rights reserved.</span>
          <span>Designed with Corporate UX</span>
        </div>
      </div>
    </footer>
  );
}
