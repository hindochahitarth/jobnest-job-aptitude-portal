import { useContext, useState, useEffect } from "react";
import { AuthContext } from "../../context/AuthContext";
import * as api from "../../services/api";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8080/api";
const BACKEND_BASE = API_BASE.replace("/api", "");

export default function DashboardTopbar({ title, subtitle }) {
  const { user, token, logout } = useContext(AuthContext);
  const userName = user?.name || "Candidate";
  const userInitial = userName.charAt(0).toUpperCase();

  const [profile, setProfile] = useState(null);

  useEffect(() => {
    if (!token || user?.role === "RECRUITER") return;
    let cancelled = false;
    api.getProfile(token)
      .then((data) => { if (!cancelled) setProfile(data); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [token, user?.role]);

  const profileImageSrc = profile?.profileImageUrl
    ? `${BACKEND_BASE}${profile.profileImageUrl}`
    : null;

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
          {profileImageSrc ? (
            <img
              src={profileImageSrc}
              alt={userName}
              className="user-avatar"
              style={{ objectFit: "cover" }}
              onError={(e) => {
                e.target.style.display = "none";
                e.target.nextSibling && (e.target.nextSibling.style.display = "flex");
              }}
            />
          ) : null}
          <div
            className="user-avatar"
            style={{ display: profileImageSrc ? "none" : "flex" }}
          >
            {userInitial}
          </div>
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
