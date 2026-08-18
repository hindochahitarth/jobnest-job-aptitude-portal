import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import Card from "../../components/ui/Card";
import * as api from "../../services/api";

export default function Applicants() {
  const { token } = useContext(AuthContext);
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [expandedId, setExpandedId] = useState(null); // Which applicant card is expanded

  useEffect(() => {
    let cancelled = false;
    async function load() {
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
    if (token) load();
    return () => { cancelled = true; };
  }, [token]);

  async function handleStatusChange(applicationId, newStatus) {
    setUpdatingId(applicationId);
    try {
      const updated = await api.updateApplicantStatus(applicationId, newStatus, token);
      setApplicants((prev) =>
        prev.map((app) => (app.id === updated.id ? { ...app, ...updated } : app))
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

  function getInitials(name) {
    if (!name) return "?";
    return name.split(" ").map((p) => p[0]).join("").toUpperCase().slice(0, 2);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <Card title="Applicant Tracking System (ATS)" icon="🧾">
        <p style={{ color: "var(--text-muted)", fontSize: 14, marginBottom: 20 }}>
          All candidates who applied to your job postings. Click a card to expand profile, view resume, and manage pipeline stage.
        </p>

        {loading && (
          <div className="profile-loading">
            <div className="spinner" />
            <span style={{ fontSize: 14, color: "var(--text-muted)" }}>Loading applicants...</span>
          </div>
        )}

        {error && !loading && (
          <div style={{ padding: 14, borderRadius: "var(--radius-md)", background: "var(--error-bg)", color: "var(--error)", border: "1px solid #fca5a5", fontSize: 13, fontWeight: 600 }}>
            ⚠️ {error}
          </div>
        )}

        {!loading && !error && applicants.length === 0 && (
          <div style={{ textAlign: "center", padding: "40px 20px" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
            <h3 style={{ fontSize: 17, fontWeight: 700, color: "var(--text-main)", marginBottom: 8 }}>No Applicants Yet</h3>
            <p style={{ fontSize: 14, color: "var(--text-muted)", maxWidth: 380, margin: "0 auto" }}>
              When candidates apply to your job postings, they will appear here.
            </p>
          </div>
        )}

        {!loading && !error && applicants.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {applicants.map((app) => {
              const isExpanded = expandedId === app.id;
              const isUpdating = updatingId === app.id;

              return (
                <div
                  key={app.id}
                  style={{
                    border: isExpanded ? "2px solid var(--primary)" : "1px solid var(--surface-border)",
                    borderRadius: "var(--radius-md)",
                    background: "var(--surface)",
                    overflow: "hidden",
                    transition: "border-color 0.2s ease",
                  }}
                >
                  {/* ── Summary Row (always visible) ── */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 14,
                      padding: "14px 18px",
                      cursor: "pointer",
                    }}
                    onClick={() => setExpandedId(isExpanded ? null : app.id)}
                  >
                    {/* Avatar */}
                    <div style={{
                      width: 42, height: 42, borderRadius: "50%", flexShrink: 0,
                      background: "linear-gradient(135deg, #0a66c2, #5b8dee)",
                      color: "#fff", fontWeight: 800, fontSize: 14,
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      {getInitials(app.candidateName)}
                    </div>

                    {/* Name + Role */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <strong style={{ fontSize: 14, color: "var(--text-main)", display: "block" }}>
                        {app.candidateName || "Unknown Candidate"}
                      </strong>
                      <span style={{ fontSize: 12, color: "var(--text-subtle)" }}>
                        {app.candidateEmail} · Applied for: <strong>{app.jobTitle}</strong>
                      </span>
                    </div>

                    {/* Status Badge */}
                    <span className={getStatusBadgeClass(app.status)} style={{ flexShrink: 0 }}>
                      {app.status}
                    </span>

                    {/* Action Buttons */}
                    <div style={{ display: "flex", gap: 6, flexShrink: 0 }} onClick={(e) => e.stopPropagation()}>
                      {app.status !== "SHORTLISTED" && (
                        <button
                          className="btn btn-primary btn-sm"
                          disabled={isUpdating}
                          onClick={() => handleStatusChange(app.id, "SHORTLISTED")}
                        >
                          {isUpdating ? "..." : "⭐ Shortlist"}
                        </button>
                      )}
                      {app.status !== "REJECTED" && (
                        <button
                          className="btn btn-secondary btn-sm"
                          disabled={isUpdating}
                          style={{ color: "var(--error)" }}
                          onClick={() => handleStatusChange(app.id, "REJECTED")}
                        >
                          {isUpdating ? "..." : "✕ Reject"}
                        </button>
                      )}
                      {app.status === "SHORTLISTED" && (
                        <button
                          className="btn btn-ghost btn-sm"
                          disabled={isUpdating}
                          onClick={() => handleStatusChange(app.id, "APPLIED")}
                        >
                          ↩ Undo
                        </button>
                      )}
                    </div>

                    {/* Expand chevron */}
                    <span style={{ color: "var(--text-subtle)", fontSize: 12, flexShrink: 0 }}>
                      {isExpanded ? "▲" : "▼"}
                    </span>
                  </div>

                  {/* ── Expanded Profile Panel ── */}
                  {isExpanded && (
                    <div style={{
                      borderTop: "1px solid var(--surface-border)",
                      padding: "18px 22px",
                      background: "var(--bg-subtle)",
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 20,
                    }}>
                      {/* Left: Profile Info */}
                      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                        {app.candidateHeadline && (
                          <div>
                            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text-subtle)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Headline</span>
                            <p style={{ fontSize: 13.5, color: "var(--text-main)", marginTop: 2 }}>{app.candidateHeadline}</p>
                          </div>
                        )}

                        {app.candidateExperienceLevel && (
                          <div>
                            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text-subtle)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Experience</span>
                            <p style={{ fontSize: 13.5, color: "var(--text-main)", marginTop: 2 }}>{app.candidateExperienceLevel} Years</p>
                          </div>
                        )}

                        {app.candidateTechStack && app.candidateTechStack.length > 0 && (
                          <div>
                            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text-subtle)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Tech Stack</span>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginTop: 5 }}>
                              {app.candidateTechStack.map((skill, i) => (
                                <span key={i} className="badge-v2 primary" style={{ fontSize: 11 }}>{skill}</span>
                              ))}
                            </div>
                          </div>
                        )}

                        {app.candidateBio && (
                          <div>
                            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text-subtle)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Bio</span>
                            <p style={{ fontSize: 12.5, color: "var(--text-muted)", marginTop: 2, lineHeight: 1.5 }}>{app.candidateBio}</p>
                          </div>
                        )}

                        {!app.candidateHeadline && !app.candidateTechStack?.length && !app.candidateBio && (
                          <p style={{ fontSize: 13, color: "var(--text-subtle)", fontStyle: "italic" }}>
                            This candidate hasn't completed their profile yet.
                          </p>
                        )}
                      </div>

                      {/* Right: Links & Resume */}
                      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                        {app.candidateResumeUrl ? (
                          <a
                            href={app.candidateResumeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-primary btn-sm"
                            style={{ textDecoration: "none", textAlign: "center" }}
                          >
                            📄 View / Download Resume
                          </a>
                        ) : (
                          <div style={{ padding: "10px 14px", background: "var(--surface)", borderRadius: "var(--radius-sm)", border: "1px solid var(--surface-border)", fontSize: 13, color: "var(--text-subtle)" }}>
                            📄 No resume uploaded by candidate
                          </div>
                        )}

                        {app.candidateGithubUrl && (
                          <a href={app.candidateGithubUrl} target="_blank" rel="noopener noreferrer"
                            className="btn btn-secondary btn-sm" style={{ textDecoration: "none", textAlign: "center" }}>
                            🐙 GitHub Profile
                          </a>
                        )}

                        {app.candidateLinkedinUrl && (
                          <a href={app.candidateLinkedinUrl} target="_blank" rel="noopener noreferrer"
                            className="btn btn-secondary btn-sm" style={{ textDecoration: "none", textAlign: "center" }}>
                            🔗 LinkedIn Profile
                          </a>
                        )}

                        <div style={{ fontSize: 11.5, color: "var(--text-subtle)", marginTop: 4 }}>
                          Applied: {app.appliedAt ? new Date(app.appliedAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) : "—"}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
