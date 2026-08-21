import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import Card from "../../components/ui/Card";
import ChartCard from "../../components/ui/ChartCard";
import Table from "../../components/ui/Table";
import * as api from "../../services/api";
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

// Static chart data (activity trend — decorative)
const hiresData = [
  { name: "Week 1", applicants: 0, hires: 0 },
  { name: "Week 2", applicants: 0, hires: 0 },
  { name: "Week 3", applicants: 0, hires: 0 },
  { name: "Week 4", applicants: 0, hires: 0 },
];

export default function Overview() {
  const { token } = useContext(AuthContext);

  const [jobs, setJobs] = useState([]);
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);

  function navigateTo(path) {
    window.history.pushState({}, "", path);
    window.dispatchEvent(new PopStateEvent("popstate"));
  }

  useEffect(() => {
    let cancelled = false;
    async function loadData() {
      setLoading(true);
      try {
        const [jobsData, applicantsData] = await Promise.all([
          api.getRecruiterJobs(token).catch(() => []),
          api.getRecruiterApplicants(token).catch(() => []),
        ]);
        if (cancelled) return;
        setJobs(jobsData);
        setApplicants(applicantsData);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    if (token) loadData();
    return () => { cancelled = true; };
  }, [token]);

  async function handleDeleteJob(jobId) {
    if (!window.confirm("Are you sure you want to delete this job?")) return;
    try {
      await api.deleteRecruiterJob(jobId, token);
      setJobs((prev) => prev.filter((j) => j.id !== jobId));
    } catch (err) {
      alert("Failed to delete job: " + err.message);
    }
  }

  async function handleUpdateJobStatus(jobId, newStatus) {
    try {
      const updatedJob = await api.updateRecruiterJobStatus(jobId, newStatus, token);
      setJobs((prev) => prev.map((j) => (j.id === jobId ? { ...j, status: updatedJob.status } : j)));
    } catch (err) {
      alert("Failed to update status: " + err.message);
    }
  }

  // Derive stats from real data
  const totalApplicants = applicants.length;
  const shortlisted = applicants.filter((a) => a.status === "SHORTLISTED").length;

  // Build per-job applicant count map
  const applicantCountByJob = {};
  applicants.forEach((app) => {
    applicantCountByJob[app.jobId] = (applicantCountByJob[app.jobId] || 0) + 1;
  });

  const stats = [
    { label: "Active Open Roles", value: loading ? "—" : String(jobs.length), icon: "💼" },
    { label: "Total Applicants", value: loading ? "—" : String(totalApplicants), icon: "👥" },
    { label: "Aptitude Screened", value: loading ? "—" : String(totalApplicants), icon: "🧠" },
    { label: "Shortlisted", value: loading ? "—" : String(shortlisted), icon: "⭐" },
  ];

  const jobColumns = [
    {
      key: "title",
      label: "Job Title",
      render: (r) => <strong style={{ color: "var(--text-main)", fontSize: 13.5 }}>{r.title}</strong>,
    },
    {
      key: "applicants",
      label: "Total Applicants",
      render: (r) => <span>{applicantCountByJob[r.id] || 0}</span>,
    },
    {
      key: "aptitudeCutoff",
      label: "Aptitude Cutoff",
      render: (r) => <span className="badge-v2 primary">≥ {r.aptitudeCutoff}%</span>,
    },
    {
      key: "status",
      label: "Status",
      render: (r) => {
        const status = r.status || "ACTIVE";
        const badgeClass = status === "ACTIVE" ? "success" : "neutral";
        return <span className={`badge-v2 ${badgeClass}`}>{status}</span>;
      },
    },
    {
      key: "action",
      label: "Action",
      render: (r) => {
        const isActive = (r.status || "ACTIVE") === "ACTIVE";
        return (
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <button className="btn btn-secondary btn-sm" onClick={() => navigateTo("/dashboard/applicants")}>
              View ATS
            </button>
            {isActive && (
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => handleUpdateJobStatus(r.id, "FILLED")}
                style={{ borderColor: "var(--success)", color: "var(--success)" }}
              >
                Mark Filled
              </button>
            )}
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => handleDeleteJob(r.id)}
              style={{ color: "var(--error)", padding: "4px 8px" }}
            >
              Delete
            </button>
          </div>
        );
      },
    },
  ];

  // Top 3 shortlisted candidates for the sidebar card
  const topCandidates = applicants
    .filter((a) => a.status === "SHORTLISTED")
    .slice(0, 3);

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
            {loading ? (
              <div style={{ textAlign: "center", padding: 24, color: "var(--text-muted)", fontSize: 14 }}>
                <div className="spinner" style={{ margin: "0 auto 10px" }} />
                Loading your job postings...
              </div>
            ) : jobs.length === 0 ? (
              <div style={{ textAlign: "center", padding: 32 }}>
                <div style={{ fontSize: 36, marginBottom: 10 }}>📋</div>
                <p style={{ color: "var(--text-muted)", fontSize: 14, marginBottom: 14 }}>
                  You haven't posted any jobs yet.
                </p>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => navigateTo("/dashboard/post-job")}
                >
                  + Post Your First Job
                </button>
              </div>
            ) : (
              <Table columns={jobColumns} data={jobs} />
            )}
          </Card>
        </div>

        {/* Side Column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <Card title="Top Shortlisted Candidates" icon="⭐">
            {loading ? (
              <div style={{ textAlign: "center", padding: 20, color: "var(--text-muted)", fontSize: 13 }}>Loading...</div>
            ) : topCandidates.length === 0 ? (
              <div style={{ textAlign: "center", padding: 24 }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>🔍</div>
                <p style={{ color: "var(--text-muted)", fontSize: 13 }}>
                  No shortlisted candidates yet.<br />
                  Go to Applicants to review and shortlist.
                </p>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  style={{ marginTop: 10 }}
                  onClick={() => navigateTo("/dashboard/applicants")}
                >
                  View Applicants
                </button>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {topCandidates.map((app) => (
                  <div
                    key={app.id}
                    style={{
                      padding: 12,
                      background: "var(--bg-subtle)",
                      borderRadius: "var(--radius-sm)",
                      border: "1px solid var(--surface-border)",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <strong style={{ fontSize: 13.5 }}>{app.candidateName}</strong>
                      <span className="badge-v2 success">Shortlisted</span>
                    </div>
                    <div style={{ fontSize: 11.5, color: "var(--text-subtle)", marginTop: 2 }}>
                      Applied for: {app.jobTitle}
                    </div>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      style={{ marginTop: 8, width: "100%" }}
                      onClick={() => navigateTo("/dashboard/applicants")}
                    >
                      Review Application
                    </button>
                  </div>
                ))}
              </div>
            )}
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
