import React from "react";

export default function Sidebar({ collapsed, onToggle, items = [] }) {
  const currentPath = window.location.pathname;

  function navigate(e, href) {
    e.preventDefault();
    window.history.pushState({}, "", href);
    window.dispatchEvent(new PopStateEvent("popstate"));
  }

  return (
    <aside className={`jn-sidebar ${collapsed ? "collapsed" : ""}`}>
      <div className="sidebar-top">
        <button className="collapse-btn" onClick={onToggle} aria-label="Toggle sidebar">
          {collapsed ? "☰" : "«"}
        </button>
      </div>

      <nav className="sidebar-nav">
        {items.map((item) => {
          const isActive = currentPath === item.href;
          return (
            <a
              key={item.key}
              href={item.href}
              onClick={(e) => navigate(e, item.href)}
              className={`sidebar-item ${isActive ? "active" : ""}`}
            >
              <span className="icon">{item.icon}</span>
              {!collapsed && <span className="label">{item.label}</span>}
              {item.badge && <span className="badge">{item.badge}</span>}
            </a>
          );
        })}
      </nav>
    </aside>
  );
}
