import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";

export default function DashboardTopbar({ title, subtitle }) {
  const { user, logout } = useContext(AuthContext);

  return (
    <div className="dashboard-topbar">
      <div className="topbar-copy">
        <div className="topbar-title-row">
          <h2>{title}</h2>
          {subtitle && <span className="topbar-badge">{subtitle}</span>}
        </div>
        <p className="topbar-description">Keep your hiring and job search workflow connected in one place.</p>
      </div>
      <div className="topbar-actions">
        <button type="button" className="btn btn-ghost">
          🔔
        </button>
        <div className="profile-chip">
          <span>{(user?.name || "User").split(" ")[0]}</span>
        </div>
        <button type="button" className="btn btn-ghost" onClick={logout}>
          Sign out
        </button>
      </div>
    </div>
  );
}
