import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import JobCard from "../../components/job/JobCard";
import Card from "../../components/ui/Card";
import ChartCard from "../../components/ui/ChartCard";
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

const stats = [
  { label: "Profile Completion", value: "84%", icon: "⚡" },
  { label: "Applications Sent", value: "14", icon: "📩" },
  { label: "Average Match", value: "78%", icon: "🎯" },
  { label: "Aptitude Tests", value: "6 Completed", icon: "🧠" },
];

const performance = [
  { name: "Week 1", score: 64 },
  { name: "Week 2", score: 72 },
  { name: "Week 3", score: 78 },
  { name: "Week 4", score: 85 },
];

const jobs = [
  { id: 1, title: "Frontend React Developer", company: "Acme Tech", location: "Remote / Bengaluru", match: 92, snippet: "Build high-performance web interfaces and component design systems.", salary: "₹8 LPA - ₹12 LPA" },
  { id: 2, title: "Product Analyst", company: "NexGen Analytics", location: "Bengaluru", match: 84, snippet: "Analyze product metrics, candidate funnels, and data visualizations.", salary: "₹10 LPA - ₹14 LPA" },
  { id: 3, title: "Software Engineer Trainee", company: "ScaleUp Systems", location: "Hyderabad", match: 76, snippet: "Support core API services and write automated unit tests.", salary: "₹6 LPA - ₹9 LPA" },
];

export default function Overview() {
  const { user } = useContext(AuthContext);
  const userName = user?.name || "Candidate User";
  const userInitial = userName.charAt(0).toUpperCase();

  function navigateTo(path) {
    window.history.pushState({}, "", path);
    window.dispatchEvent(new PopStateEvent("popstate"));
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

          {/* Recommended Roles Feed */}
          <Card title="Recommended Roles for You" icon="💼">
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {jobs.map((j) => (
                <JobCard key={j.id} job={j} onApply={(job) => alert(`Applied to ${job.title} at ${job.company}`)} />
              ))}
            </div>
          </Card>
        </div>

        {/* Side Column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Left Profile Card Widget moved cleanly into Side Column */}
          <div className="profile-card-widget">
            <div className="profile-card-banner" />
            <div className="profile-card-avatar-wrap">
              <div className="profile-card-avatar">{userInitial}</div>
            </div>
            <div className="profile-card-content">
              <div className="profile-card-name">{userName}</div>
              <div className="profile-card-headline">
                Computer Science Aspirant | React & Web Dev Enthusiast
              </div>

              <div className="profile-meter-box">
                <div className="meter-header">
                  <span>Profile Strength</span>
                  <span>84%</span>
                </div>
                <div className="meter-bar">
                  <div className="meter-fill" style={{ width: "84%" }} />
                </div>
                <div className="meter-subtext">Add 1 project to reach 100% complete!</div>
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
