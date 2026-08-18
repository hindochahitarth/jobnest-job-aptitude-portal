import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import Card from "../../components/ui/Card";
import * as api from "../../services/api";

export default function Shortlisted() {
  const { token } = useContext(AuthContext);
  const [shortlisted, setShortlisted] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [undoingId, setUndoingId] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await api.getRecruiterApplicants(token);
        if (!cancelled) {
          setShortlisted((data || []).filter((a) => a.status === "SHORTLISTED"));
        }
      } catch (err) {
        if (!cancelled) setError(err.message || "Failed to load shortlisted candidates");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    if (token) load();
    return () => { cancelled = true; };
  }, [token]);

  async function handleUndo(applicationId) {
    setUndoingId(applicationId);
    try {
      await api.updateApplicantStatus(applicationId, "APPLIED", token);
      setShortlisted((prev) => prev.filter((a) => a.id !== applicationId));
    } catch (err) {
      alert(err.message || "Failed to update status");
    } finally {
      setUndoingId(null);
    }
  }

  function getInitials(name) {
    if (!name) return "?";
    return name.split(" ").map((p) => p[0]).join("").toUpperCase().slice(0, 2);
  }

  function navigateTo(path) {
    window.history.pushState({}, "", path);
    window.dispatchEvent(new PopStateEvent("popstate"));
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <Card title="Shortlisted Candidates Pool" icon="⭐">
        <p style={{ color: "var(--text-muted)", fontSize: 14, marginBottom: 20 }}>
          Candidates approved for next-stage interview rounds and skill assessments.
        </p>

        {loading && (
          <div className="profile-loading">
            <div className="spinner" />
            <span style={{ fontSize: 14, color: "var(--text-muted)" }}>Loading shortlisted candidates...</span>
          </div>
        )}

        {error && !loading && (
          <div style={{ padding: 14, borderRadius: "var(--radius-md)", background: "var(--error-bg)", color: "var(--error)", border: "1px solid #fca5a5", fontSize: 13, fontWeight: 600 }}>
            ⚠️ {error}
          </div>
        )}

        {!loading && !error && shortlisted.length === 0 && (
          <div style={{ textAlign: "center", padding: "48px 20px" }}>
            <div style={{ fontSize: 44, marginBottom: 14 }}>⭐</div>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: "var(--text-main)", marginBottom: 8 }}>
              No Shortlisted Candidates Yet
            </h3>
            <p style={{ fontSize: 14, color: "var(--text-muted)", maxWidth: 400, margin: "0 auto 18px", lineHeight: 1.6 }}>
              Go to the Applicants page to review candidates who applied to your jobs and shortlist the best ones.
            </p>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => navigateTo("/dashboard/applicants")}
            >
              🔍 Review Applicants
            </button>
          </div>
        )}

        {!loading && !error && shortlisted.length > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
            {shortlisted.map((item) => (
              <div
                key={item.id}
                style={{
                  padding: 18,
                  background: "var(--bg-subtle)",
                  borderRadius: "var(--radius-md)",
                  border: "2px solid var(--success-border, #86efac)",
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                }}
              >
                {/* Header */}
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{
                    width: 46, height: 46, borderRadius: "50%", flexShrink: 0,
                    background: "linear-gradient(135deg, #059669, #34d399)",
                    color: "#fff", fontWeight: 800, fontSize: 15,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    {getInitials(item.candidateName)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <strong style={{ fontSize: 15, color: "var(--text-main)", display: "block" }}>
                      {item.candidateName || "Unknown"}
                    </strong>
                    <span style={{ fontSize: 12, color: "var(--text-subtle)" }}>
                      {item.candidateEmail}
                    </span>
                  </div>
                  <span className="badge-v2 success" style={{ flexShrink: 0 }}>Shortlisted</span>
                </div>

                {/* Applied for */}
                <div style={{ padding: "8px 12px", background: "var(--surface)", borderRadius: "var(--radius-sm)", border: "1px solid var(--surface-border)" }}>
                  <span style={{ fontSize: 11, color: "var(--text-subtle)", display: "block" }}>APPLIED FOR</span>
                  <strong style={{ fontSize: 13, color: "var(--text-main)" }}>{item.jobTitle}</strong>
                  <span style={{ fontSize: 12, color: "var(--text-subtle)" }}> · {item.company}</span>
                </div>

                {/* Headline */}
                {item.candidateHeadline && (
                  <p style={{ fontSize: 13, color: "var(--text-muted)", margin: 0, fontStyle: "italic" }}>
                    "{item.candidateHeadline}"
                  </p>
                )}

                {/* Tech Stack */}
                {item.candidateTechStack && item.candidateTechStack.length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                    {item.candidateTechStack.slice(0, 5).map((skill, i) => (
                      <span key={i} className="badge-v2 primary" style={{ fontSize: 11 }}>{skill}</span>
                    ))}
                    {item.candidateTechStack.length > 5 && (
                      <span className="badge-v2 neutral" style={{ fontSize: 11 }}>+{item.candidateTechStack.length - 5} more</span>
                    )}
                  </div>
                )}

                {/* Experience */}
                {item.candidateExperienceLevel && (
                  <div style={{ fontSize: 12.5, color: "var(--text-muted)" }}>
                    🏢 Experience: <strong>{item.candidateExperienceLevel} years</strong>
                  </div>
                )}

                {/* Action Buttons */}
                <div style={{ display: "flex", flexDirection: "column", gap: 7, marginTop: 4 }}>
                  {item.candidateResumeUrl && (
                    <a
                      href={item.candidateResumeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-primary btn-sm"
                      style={{ textDecoration: "none", textAlign: "center" }}
                    >
                      📄 View Resume
                    </a>
                  )}
                  {item.candidateGithubUrl && (
                    <a
                      href={item.candidateGithubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-secondary btn-sm"
                      style={{ textDecoration: "none", textAlign: "center" }}
                    >
                      🐙 GitHub
                    </a>
                  )}
                  {item.candidateLinkedinUrl && (
                    <a
                      href={item.candidateLinkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-secondary btn-sm"
                      style={{ textDecoration: "none", textAlign: "center" }}
                    >
                      🔗 LinkedIn
                    </a>
                  )}
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    style={{ color: "var(--text-subtle)" }}
                    disabled={undoingId === item.id}
                    onClick={() => handleUndo(item.id)}
                  >
                    {undoingId === item.id ? "Removing..." : "↩ Remove from Shortlist"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
