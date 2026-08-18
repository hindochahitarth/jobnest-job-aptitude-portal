import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import Table from "../../components/ui/Table";
import Card from "../../components/ui/Card";
import * as api from "../../services/api";

export default function Applicants() {
  const { token } = useContext(AuthContext);
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function loadApplicants() {
      setLoading(true);
      setError(null);
      try {
        const data = await api.getRecruiterApplicants(token);
        if (!cancelled) setApplicants(data || []);
      } catch (err) {
        if (!cancelled) setError(err.message || "Failed to load applicants");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    if (token) loadApplicants();
    return () => { cancelled = true; };
  }, [token]);

  async function handleStatusChange(applicationId, newStatus) {
    setUpdatingId(applicationId);
    try {
      const updated = await api.updateApplicantStatus(applicationId, newStatus, token);
      setApplicants((prev) =>
        prev.map((app) => (app.id === updated.id ? { ...app, status: updated.status } : app))
      );
    } catch (err) {
      alert(err.message || "Failed to update status");
    } finally {
      setUpdatingId(null);
    }
  }

  function getStatusBadgeClass(status) {
    if (status === "SHORTLISTED") return "badge-v2 success";
    if (status === "REJECTED") return "badge-v2 danger";
    return "badge-v2 neutral";
  }

  const columns = [
    {
      key: "name",
      label: "Candidate",
      render: (r) => (
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #0a66c2, #5b8dee)",
              color: "#fff",
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 13,
              flexShrink: 0,
            }}
          >
            {(r.candidateName || "?").charAt(0).toUpperCase()}
          </div>
          <div>
            <strong style={{ display: "block", fontSize: 13.5 }}>{r.candidateName || "Unknown"}</strong>
            <span style={{ fontSize: 11, color: "var(--text-subtle)" }}>{r.candidateEmail || ""}</span>
          </div>
        </div>
      ),
    },
    {
      key: "jobTitle",
      label: "Applied For",
      render: (r) => (
        <div>
          <strong style={{ fontSize: 13 }}>{r.jobTitle}</strong>
          <span style={{ display: "block", fontSize: 11, color: "var(--text-subtle)" }}>{r.company}</span>
        </div>
      ),
    },
    {
      key: "appliedAt",
      label: "Applied On",
      render: (r) => (
        <span style={{ fontSize: 12.5, color: "var(--text-muted)" }}>
          {r.appliedAt ? new Date(r.appliedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—"}
        </span>
      ),
    },
    {
      key: "status",
      label: "Pipeline Stage",
      render: (r) => <span className={getStatusBadgeClass(r.status)}>{r.status}</span>,
    },
    {
      key: "actions",
      label: "Recruiter Actions",
      render: (r) => (
        <div style={{ display: "flex", gap: 6 }}>
          {r.status !== "SHORTLISTED" && (
            <button
              className="btn btn-primary btn-sm"
              disabled={updatingId === r.id}
              onClick={() => handleStatusChange(r.id, "SHORTLISTED")}
            >
              {updatingId === r.id ? "..." : "⭐ Shortlist"}
            </button>
          )}
          {r.status !== "REJECTED" && (
            <button
              className="btn btn-secondary btn-sm"
              disabled={updatingId === r.id}
              onClick={() => handleStatusChange(r.id, "REJECTED")}
              style={{ color: "var(--error)" }}
            >
              {updatingId === r.id ? "..." : "✕ Reject"}
            </button>
          )}
          {r.status === "SHORTLISTED" && (
            <button
              className="btn btn-ghost btn-sm"
              disabled={updatingId === r.id}
              onClick={() => handleStatusChange(r.id, "APPLIED")}
            >
              ↩ Undo
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <Card title="Applicant Tracking System (ATS)" icon="🧾">
        <p style={{ color: "var(--text-muted)", fontSize: 14, marginBottom: 16 }}>
          All candidates who applied to your job postings. Shortlist or reject to manage your pipeline.
        </p>

        {loading && (
          <div className="profile-loading">
            <div className="spinner" />
            <span style={{ fontSize: 14, color: "var(--text-muted)" }}>Loading applicants...</span>
          </div>
        )}

        {error && !loading && (
          <div style={{
            padding: 14, borderRadius: "var(--radius-md)",
            background: "var(--error-bg)", color: "var(--error)",
            border: "1px solid #fca5a5", fontSize: 13, fontWeight: 600,
          }}>
            ⚠️ {error}
          </div>
        )}

        {!loading && !error && applicants.length === 0 && (
          <div style={{ textAlign: "center", padding: "40px 20px" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
            <h3 style={{ fontSize: 17, fontWeight: 700, color: "var(--text-main)", marginBottom: 8 }}>
              No Applicants Yet
            </h3>
            <p style={{ fontSize: 14, color: "var(--text-muted)", maxWidth: 380, margin: "0 auto" }}>
              When candidates apply to your job postings, they will appear here for you to review.
            </p>
          </div>
        )}

        {!loading && !error && applicants.length > 0 && (
          <Table columns={columns} data={applicants} />
        )}
      </Card>
    </div>
  );
}
