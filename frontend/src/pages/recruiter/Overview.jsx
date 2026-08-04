import Card from "../../components/ui/Card";
import ChartCard from "../../components/ui/ChartCard";
import Table from "../../components/ui/Table";
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

const stats = [
  { label: "Active Open Roles", value: "12", icon: "💼" },
  { label: "Total Candidates", value: "438", icon: "👥" },
  { label: "Aptitude Screened", value: "312", icon: "🧠" },
  { label: "Shortlisted", value: "46", icon: "⭐" },
];

const hiresData = [
  { name: "Week 1", applicants: 45, hires: 3 },
  { name: "Week 2", applicants: 78, hires: 5 },
  { name: "Week 3", applicants: 110, hires: 8 },
  { name: "Week 4", applicants: 95, hires: 6 },
];

const openJobs = [
  { id: 1, title: "Frontend Engineer (React)", applicants: 142, testCutoff: "> 85%", status: "Active" },
  { id: 2, title: "Data Analyst Trainee", applicants: 89, testCutoff: "> 80%", status: "Active" },
  { id: 3, title: "Full Stack SDE", applicants: 116, testCutoff: "> 90%", status: "Active" },
  { id: 4, title: "DevOps Engineer", applicants: 91, testCutoff: "> 75%", status: "Reviewing" },
];

export default function Overview() {
  function navigateTo(path) {
    window.history.pushState({}, "", path);
    window.dispatchEvent(new PopStateEvent("popstate"));
  }

  const jobColumns = [
    { key: "title", label: "Job Title", render: (r) => <strong style={{ color: "var(--text-main)", fontSize: 13.5 }}>{r.title}</strong> },
    { key: "applicants", label: "Total Applicants", accessor: "applicants" },
    { key: "testCutoff", label: "Aptitude Cutoff", render: (r) => <span className="badge-v2 primary">{r.testCutoff}</span> },
    { key: "status", label: "Status", render: (r) => <span className="badge-v2 success">{r.status}</span> },
    {
      key: "action",
      label: "Action",
      render: () => (
        <button className="btn btn-secondary btn-sm" onClick={() => navigateTo("/dashboard/applicants")}>
          View ATS
        </button>
      ),
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Top Banner & Action Header */}
      <div className="page-header-block">
        <div>
          <h2>Hiring Intelligence Dashboard</h2>
          <p>Manage job postings, review aptitude-screened talent, and accelerate candidate shortlists.</p>
        </div>
        <div className="page-header-actions">
          <button type="button" className="btn btn-secondary" onClick={() => navigateTo("/dashboard/applicants")}>
            🔍 Search Talent Pool
          </button>
          <button type="button" className="btn btn-primary" onClick={() => navigateTo("/dashboard/post-job")}>
            + Post New Job
          </button>
        </div>
      </div>

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
          <ChartCard title="Recruitment & Hiring Pipeline Velocity" subtitle="Applications vs Hires over recent weeks">
            <div style={{ width: "100%", height: 230, paddingTop: 10 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={hiresData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="name" tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: "#0f172a", borderRadius: 10, color: "#fff", border: "none" }} />
                  <Bar dataKey="applicants" fill="#0a66c2" radius={[6, 6, 0, 0]} name="Applicants" />
                  <Bar dataKey="hires" fill="#059669" radius={[6, 6, 0, 0]} name="Hired" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>

          <Card title="Active Open Job Postings" icon="💼">
            <Table columns={jobColumns} data={openJobs} />
          </Card>
        </div>

        {/* Side Column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <Card title="Top Aptitude-Matched Candidates" icon="⭐">
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ padding: 12, background: "var(--bg-subtle)", borderRadius: "var(--radius-sm)", border: "1px solid var(--surface-border)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <strong style={{ fontSize: 13.5 }}>Aditi Sharma</strong>
                  <span className="badge-v2 success">98th %ile</span>
                </div>
                <div style={{ fontSize: 11.5, color: "var(--text-subtle)", marginTop: 2 }}>Applied for: Frontend Engineer</div>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  style={{ marginTop: 8, width: "100%" }}
                  onClick={() => navigateTo("/dashboard/applicants")}
                >
                  Review Application
                </button>
              </div>

              <div style={{ padding: 12, background: "var(--bg-subtle)", borderRadius: "var(--radius-sm)", border: "1px solid var(--surface-border)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <strong style={{ fontSize: 13.5 }}>Rohan Patel</strong>
                  <span className="badge-v2 success">94th %ile</span>
                </div>
                <div style={{ fontSize: 11.5, color: "var(--text-subtle)", marginTop: 2 }}>Applied for: Data Analyst</div>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  style={{ marginTop: 8, width: "100%" }}
                  onClick={() => navigateTo("/dashboard/applicants")}
                >
                  Review Application
                </button>
              </div>
            </div>
          </Card>

          <Card title="Quick AI Actions" icon="🤖">
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                style={{ width: "100%" }}
                onClick={() => navigateTo("/dashboard/ai-tools")}
              >
                Generate AI Job Description
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                style={{ width: "100%" }}
                onClick={() => navigateTo("/dashboard/ai-tools")}
              >
                Screen Resumes with AI
              </button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
