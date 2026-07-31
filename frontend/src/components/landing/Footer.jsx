import React from "react";

export default function Footer() {
  return (
    <footer className="landing-footer">
      <div className="section-inner footer-inner">
        <div className="brand-col">
          <div className="logo">JobNest</div>
          <p className="muted">Connecting talent with opportunities.</p>
        </div>

        <div className="links-col">
          <h4>Product</h4>
          <a href="#">Features</a>
          <a href="#">Jobs</a>
          <a href="#">Pricing</a>
        </div>

        <div className="links-col">
          <h4>Company</h4>
          <a href="#">About</a>
          <a href="#">Careers</a>
          <a href="#">Contact</a>
        </div>

        <div className="links-col">
          <h4>Follow</h4>
          <div className="socials">
            <a href="#">Twitter</a>
            <a href="#">LinkedIn</a>
            <a href="#">Instagram</a>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="section-inner">
          <small className="muted">© {new Date().getFullYear()} JobNest — All rights reserved</small>
        </div>
      </div>
    </footer>
  );
}
