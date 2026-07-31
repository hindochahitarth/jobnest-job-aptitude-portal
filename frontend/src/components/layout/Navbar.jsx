import React, { useState } from "react";
import { motion } from "framer-motion";

const links = [
  { label: "Home", href: "/" },
  { label: "Features", href: "/#features" },
  { label: "Jobs", href: "/jobs" },
  { label: "About", href: "/#about" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  function navigate(href) {
    window.history.pushState({}, "", href);
    window.dispatchEvent(new PopStateEvent("popstate"));
    setOpen(false);

    const hashIndex = href.indexOf("#");
    if (hashIndex > -1) {
      const targetId = href.slice(hashIndex);
      const target = document.querySelector(targetId);
      if (target) {
        setTimeout(() => target.scrollIntoView({ behavior: "smooth", block: "start" }), 60);
      }
    }
  }

  function handleLinkClick(e, href) {
    e.preventDefault();
    navigate(href);
  }

  return (
    <nav className="jn-navbar">
      <div className="container nav-inner">
        <a href="/" className="logo" onClick={(e) => handleLinkClick(e, "/")}>JobNest</a>

        <button
          className="nav-toggle"
          onClick={() => setOpen((s) => !s)}
          aria-label="Toggle menu"
          type="button"
        >
          <span className="hamburger" />
        </button>

        <div className={`nav-links ${open ? "open" : ""}`}>
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(e) => handleLinkClick(e, link.href)}
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="nav-cta">
          <button className="btn btn-ghost" type="button" onClick={(e) => handleLinkClick(e, "/login")}>Login</button>
          <button className="btn btn-primary" type="button" onClick={(e) => handleLinkClick(e, "/signup")}>Get Started</button>
        </div>
      </div>

      <motion.div
        initial={{ height: 0 }}
        animate={{ height: open ? "auto" : 0 }}
        transition={{ duration: 0.22 }}
        className="mobile-nav"
      />
    </nav>
  );
}
