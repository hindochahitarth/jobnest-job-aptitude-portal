import React from "react";

const links = [
  { label: "Home", href: "/" },
  { label: "Explore Jobs", href: "/jobs" },
  { label: "Aptitude Tests", href: "/#features" },
  { label: "For Employers", href: "/#how-it-works" },
  { label: "About", href: "/#about" },
];

export default function Navbar() {
  function navigate(href) {
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

  function handleLinkClick(e, href) {
    e.preventDefault();
    navigate(href);
  }

  return (
    <header className="jn-navbar">
      <div className="nav-inner">
        <a href="/" className="logo-brand" onClick={(e) => handleLinkClick(e, "/")}>
          <div className="logo-icon">JN</div>
          <span>JobNest</span>
        </a>

        <nav className="nav-links">
          {links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={(e) => handleLinkClick(e, link.href)}
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="nav-actions">
          <button className="btn btn-ghost" type="button" onClick={(e) => handleLinkClick(e, "/login")}>
            Sign In
          </button>
          <button className="btn btn-primary" type="button" onClick={(e) => handleLinkClick(e, "/signup")}>
            Register Free
          </button>
        </div>
      </div>
    </header>
  );
}
