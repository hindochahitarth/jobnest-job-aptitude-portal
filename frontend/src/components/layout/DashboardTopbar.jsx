import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";

export default function DashboardTopbar({ title, subtitle }) {
  const { user, logout } = useContext(AuthContext);
  const userName = user?.name || "Candidate";
  const userInitial = userName.charAt(0).toUpperCase();

  return (
    <div className="dashboard-topbar">
      <div className="topbar-left">
        <div className="topbar-search">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search jobs, skills, candidates, or tests..."
          />
        </div>
      </div>

      <div className="topbar-right">
        <button type="button" className="topbar-icon-btn" title="Notifications">
          🔔
          <span className="dot-indicator" />
        </button>

        <div className="user-profile-badge" onClick={() => {
          const target = user?.role === "RECRUITER" ? "/dashboard/post-job" : "/dashboard/profile";
          window.history.pushState({}, "", target);
          window.dispatchEvent(new PopStateEvent("popstate"));
        }}>
          <div className="user-avatar">{userInitial}</div>
          <div className="user-info">
            <span className="user-name">{userName}</span>
            <span className="user-role">{user?.role === "RECRUITER" ? "Recruiter" : "Candidate"}</span>
          </div>
        </div>

        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={logout}
          style={{ borderColor: "#fca5a5", color: "#dc2626", background: "#fef2f2" }}
        >
          Logout
        </button>
      </div>
    </div>
  );
}
