import { useContext, useState, useEffect } from "react";
import { AuthContext } from "../../context/AuthContext";
import JobCard from "../../components/job/JobCard";
import Card from "../../components/ui/Card";
import ChartCard from "../../components/ui/ChartCard";
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import * as api from "../../services/api";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8080/api";
const BACKEND_BASE = API_BASE.replace("/api", "");

const performance = [
  { name: "Week 1", score: 64 },
  { name: "Week 2", score: 72 },
  { name: "Week 3", score: 78 },
  { name: "Week 4", score: 85 },
];

export default function Overview() {
  const { user, token } = useContext(AuthContext);
  const userName = user?.name || "Candidate User";
  const userInitial = userName.charAt(0).toUpperCase();

  const [profile, setProfile] = useState(null);
  const [recommendedJobs, setRecommendedJobs] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(true);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;

    // Fetch profile and matching jobs
    api.getProfile(token)
      .then((data) => { if (!cancelled) setProfile(data); })
      .catch(() => {});

    api.getRecommendedJobs(token)
      .then(async (jobs) => {
        if (cancelled) return;
        if (jobs && jobs.length > 0) {
          setRecommendedJobs(jobs.slice(0, 3));
        } else {
          // If no matching jobs yet, fetch latest general open jobs
          const all = await api.getCandidateAllJobs(token).catch(() => []);
          if (!cancelled) setRecommendedJobs(all.slice(0, 3));
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoadingJobs(false);
      });

    return () => { cancelled = true; };
  }, [token]);

  const completionPct = profile?.completionPercentage ?? 0;
  const profileImageSrc = profile?.profileImageUrl
    ? `${BACKEND_BASE}${profile.profileImageUrl}`
    : null;
  const headline = profile?.headline || "Complete your profile to stand out";

  const stats = [
    { label: "Profile Completion", value: `${completionPct}%`, icon: "⚡" },
    { label: "Applications Sent", value: "14", icon: "📩" },
    { label: "Average Match", value: recommendedJobs[0]?.matchScore ? `${recommendedJobs[0].matchScore}%` : "78%", icon: "🎯" },
    { label: "Aptitude Tests", value: "6 Completed", icon: "🧠" },
  ];

  function navigateTo(path) {
    window.history.pushState({}, "", path);
    window.dispatchEvent(new PopStateEvent("popstate"));
  }

  function handleApply(job) {
    alert(`Successfully applied to ${job.title} at ${job.company}!`);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* 4 Stat Cards Grid Across Top */}
      <div className="stat-cards-grid-top">
        {stats.map((st) => (
          <div key={st.label} className="stat-card-v2">
            <div className="stat-icon-wrap">{st.icon}</div>
            <div className="stat-info">
              <div className="stat-value">{st.value}</div>
              <div className="stat-label">{st.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Main 2-Column Split Grid */}
      <div className="dashboard-grid-split">
        {/* Main Column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Match Score Trend */}
          <ChartCard title="Aptitude & Match Trend" subtitle="Weekly performance progression based on test scores">
            <div style={{ width: "100%", height: 230, paddingTop: 10 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={performance} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="name" tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: "#0f172a", borderRadius: 10, color: "#fff", border: "none" }} />
                  <Area type="monotone" dataKey="score" stroke="#0a66c2" fill="rgba(10, 102, 194, 0.15)" strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>

          {/* Recommended Roles Feed — Now Dynamic */}
          <Card
            title="Recommended Roles for You"
            icon="💼"
            footer={
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                style={{ width: "100%", color: "var(--primary)", fontWeight: 700 }}
                onClick={() => navigateTo("/dashboard/jobs")}
              >
                Explore All Matching Jobs →
              </button>
            }
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {loadingJobs ? (
                <div style={{ textAlign: "center", padding: "20px 0", color: "var(--text-subtle)", fontSize: 13 }}>
                  Loading skill-matched jobs...
                </div>
              ) : recommendedJobs.length > 0 ? (
                recommendedJobs.map((j) => (
                  <JobCard key={j.id} job={j} onApply={handleApply} />
                ))
              ) : (
                <div style={{ textAlign: "center", padding: 20, color: "var(--text-subtle)", fontSize: 13 }}>
                  Add your skills in Profile to unlock personalized job recommendations!
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Side Column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Profile Card Widget — Dynamic */}
          <div className="profile-card-widget">
            <div className="profile-card-banner" />
            <div className="profile-card-avatar-wrap">
              {profileImageSrc ? (
                <img
                  src={profileImageSrc}
                  alt={userName}
                  className="profile-card-avatar"
                  style={{ objectFit: "cover", borderRadius: "50%", width: 56, height: 56, border: "3px solid var(--surface)" }}
                  onError={(e) => {
                    e.target.style.display = "none";
                    e.target.nextSibling && (e.target.nextSibling.style.display = "flex");
                  }}
                />
              ) : null}
              <div
                className="profile-card-avatar"
                style={{ display: profileImageSrc ? "none" : "flex" }}
              >
                {userInitial}
              </div>
            </div>
            <div className="profile-card-content">
              <div className="profile-card-name">{userName}</div>
              <div className="profile-card-headline">
                {headline}
              </div>

              <div className="profile-meter-box">
                <div className="meter-header">
                  <span>Profile Strength</span>
                  <span>{completionPct}%</span>
                </div>
                <div className="meter-bar">
                  <div className="meter-fill" style={{ width: `${completionPct}%` }} />
                </div>
                <div className="meter-subtext">
                  {completionPct === 100
                    ? "🎉 Your profile is 100% complete!"
                    : "Complete your profile to boost visibility"}
                </div>
              </div>

              <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 8 }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  style={{ width: "100%" }}
                  onClick={() => navigateTo("/dashboard/profile")}
                >
                  View Full Profile
                </button>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  style={{ width: "100%" }}
                  onClick={() => navigateTo("/dashboard/tests")}
                >
                  Take Aptitude Test
                </button>
              </div>
            </div>
          </div>

          <Card title="Upcoming Aptitude Tests" icon="🧠">
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ padding: 12, background: "var(--bg-subtle)", borderRadius: "var(--radius-sm)", border: "1px solid var(--surface-border)" }}>
                <strong style={{ fontSize: 13.5, display: "block" }}>Quantitative Reasoning Mock</strong>
                <span style={{ fontSize: 11.5, color: "var(--text-subtle)" }}>30 Mins • 25 Questions</span>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  style={{ marginTop: 8, width: "100%" }}
                  onClick={() => navigateTo("/dashboard/tests")}
                >
                  Start Test Now
                </button>
              </div>

              <div style={{ padding: 12, background: "var(--bg-subtle)", borderRadius: "var(--radius-sm)", border: "1px solid var(--surface-border)" }}>
                <strong style={{ fontSize: 13.5, display: "block" }}>Logical Assessment</strong>
                <span style={{ fontSize: 11.5, color: "var(--text-subtle)" }}>20 Mins • 20 Questions</span>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  style={{ marginTop: 8, width: "100%" }}
                  onClick={() => navigateTo("/dashboard/tests")}
                >
                  Practice
                </button>
              </div>
            </div>
          </Card>

          <Card title="Hiring Companies" icon="🏢">
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 10, fontSize: 13 }}>
              <li style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>Acme Corp</span>
                <span className="badge-v2 primary">12 Openings</span>
              </li>
              <li style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>NexGen Tech</span>
                <span className="badge-v2 primary">8 Openings</span>
              </li>
              <li style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>CloudOps Ltd</span>
                <span className="badge-v2 primary">5 Openings</span>
              </li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}
