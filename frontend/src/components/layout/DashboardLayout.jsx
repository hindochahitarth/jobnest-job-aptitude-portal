import React, { useState } from "react";
import Sidebar from "./Sidebar";
import DashboardTopbar from "./DashboardTopbar";

export default function DashboardLayout({ children, items = [], title = "Dashboard", subtitle }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="dashboard-shell">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} items={items} />
      <main className={`dashboard-main ${collapsed ? "nav-collapsed" : ""}`}>
        <DashboardTopbar title={title} subtitle={subtitle} />
        <div className="dashboard-content">{children}</div>
      </main>
    </div>
  );
}
