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
      <div className="sidebar-brand">
        {!collapsed && (
          <div className="sidebar-logo">
            <span>JobNest</span>
            <span className="badge">PRO</span>
          </div>
        )}
        <button className="collapse-btn" onClick={onToggle} aria-label="Toggle sidebar">
          {collapsed ? "➡️" : "⬅️"}
        </button>
      </div>

      <nav className="sidebar-nav">
        {items.map((item) => {
          const isActive = currentPath === item.href || (currentPath === "/dashboard" && item.href === "/dashboard");
          return (
            <a
              key={item.key}
              href={item.href}
              onClick={(e) => navigate(e, item.href)}
              className={`sidebar-item ${isActive ? "active" : ""}`}
              title={item.label}
            >
              <span className="icon">{item.icon}</span>
              {!collapsed && <span className="label">{item.label}</span>}
              {!collapsed && item.badge && <span className="badge-count">{item.badge}</span>}
            </a>
          );
        })}
      </nav>
    </aside>
  );
}
