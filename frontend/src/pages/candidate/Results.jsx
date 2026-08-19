import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import Card from "../../components/ui/Card";
import * as api from "../../services/api";

const SECTION_LABELS = {
  QUANT: "Quantitative Aptitude",
  LOGICAL: "Logical Reasoning",
  VERBAL: "Verbal Ability",
  TECHNICAL: "Technical Aptitude",
};

function getPerformanceLevel(percentage = 0) {
  if (percentage >= 85) return "Excellent";
  if (percentage >= 70) return "Strong";
  if (percentage >= 50) return "Developing";
  return "Needs Practice";
}

function getLocalResults() {
  try {
    return JSON.parse(localStorage.getItem("jobnestAptitudeResults") || "[]");
  } catch {
    return [];
  }
}

function mergeResults(serverResults, localResults) {
  const byId = new Map();
  [...serverResults, ...localResults].forEach((result) => {
    if (result?.attemptId) byId.set(result.attemptId, result);
  });
  return Array.from(byId.values()).sort((a, b) => new Date(b.submittedAt || b.startedAt || 0) - new Date(a.submittedAt || a.startedAt || 0));
}

function downloadScorecard(result, candidateName = "Candidate") {
  const rows = (result.sectionBreakdown || []).map((item) => `<tr><td>${item.section}</td><td>${item.correct}/${item.total}</td><td>${item.accuracyPercent}%</td></tr>`).join("");
  const logs = (result.proctorLogs || []).map((log) => `<li>Warning ${log.warningNumber}: ${log.details || log.eventType}</li>`).join("") || "<li>No proctoring violations recorded.</li>";
  const html = `<!doctype html><html><head><meta charset="utf-8"><title>JobNest Scorecard</title><style>body{font-family:Arial,sans-serif;margin:32px;color:#111827}.cert{border:2px solid #0a66c2;padding:28px;max-width:820px;margin:auto}h1{color:#0a66c2}table{width:100%;border-collapse:collapse;margin-top:18px}td,th{border:1px solid #d1d5db;padding:10px;text-align:left}.score{font-size:32px;font-weight:800}</style></head><body><main class="cert"><h1>JobNest Aptitude Result Form</h1><p>Candidate: <strong>${candidateName}</strong></p><p>Assessment: <strong>${SECTION_LABELS[result.category] || result.category}</strong> (${result.difficulty})</p><p class="score">${result.percentage}% - ${result.score}/${result.totalMarks}</p><p>Correct: ${result.correctCount} | Incorrect: ${result.incorrectCount} | Skipped: ${result.skippedCount}</p><p>Performance Level: <strong>${getPerformanceLevel(result.percentage)}</strong></p><p>Proctor Status: <strong>${result.proctorStatus || "CLEAN"}</strong></p><table><thead><tr><th>Topic</th><th>Correct</th><th>Accuracy</th></tr></thead><tbody>${rows}</tbody></table><h3>Proctoring Report</h3><ul>${logs}</ul><p>Attempt ID: ${result.attemptId}</p><p>Completed: ${result.submittedAt || result.startedAt || new Date().toISOString()}</p></main></body></html>`;
  const blob = new Blob([html], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `jobnest-scorecard-${result.attemptId}.html`;
  link.click();
  URL.revokeObjectURL(url);
}

export default function Results() {
  const { token, user } = useContext(AuthContext);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function loadResults() {
      setLoading(true);
      setErrorMessage("");
      const localResults = getLocalResults();
      try {
        const serverResults = token ? await api.getHistoricalResults(token) : [];
        if (!cancelled) setResults(mergeResults(serverResults, localResults));
      } catch (err) {
        if (!cancelled) {
          setResults(localResults);
          setErrorMessage("Could not load server history. Showing locally saved scorecards.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadResults();
    return () => { cancelled = true; };
  }, [token]);

  const bestScore = results.length ? Math.max(...results.map((item) => Number(item.percentage) || 0)) : 0;

  return (
    <div className="dashboard-grid two-col">
      <div className="main-col">
        <Card title="Your Test Scorecards & Certificates" icon="%">
          <p style={{ color: "var(--text-muted)", fontSize: 14, marginBottom: 16 }}>Saved aptitude attempts appear here with downloadable JobNest result forms.</p>
          {errorMessage && <div className="alert warning" style={{ marginBottom: 14 }}>{errorMessage}</div>}
          {loading ? <p style={{ color: "var(--text-subtle)", fontSize: 13 }}>Loading scorecards...</p> : null}
          {!loading && results.length === 0 ? <p style={{ color: "var(--text-subtle)", fontSize: 13 }}>No aptitude attempts yet. Start a proctored assessment to generate your first scorecard.</p> : null}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {results.map((res) => (
              <div key={res.attemptId} style={{ padding: 16, background: "var(--bg-subtle)", borderRadius: "var(--radius-md)", border: "1px solid var(--surface-border)", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
                <div>
                  <h4 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-main)" }}>{SECTION_LABELS[res.category] || res.category} - {res.difficulty}</h4>
                  <p style={{ fontSize: 13, color: "var(--text-subtle)", marginTop: 2 }}>Score: {res.percentage}% ({res.score}/{res.totalMarks}) | Correct: {res.correctCount} | Incorrect: {res.incorrectCount} | Skipped: {res.skippedCount}</p>
                  <p style={{ fontSize: 12, color: "var(--text-subtle)", marginTop: 2 }}>Completed: {res.submittedAt ? new Date(res.submittedAt).toLocaleString() : "In progress"} | Proctor: {res.proctorStatus || "CLEAN"}</p>
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <span className={`badge-v2 ${res.percentage >= 60 ? "success" : "warning"}`}>{getPerformanceLevel(res.percentage)}</span>
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => downloadScorecard(res, user?.name)}>Result Form</button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="side-col">
        <Card title="Recruiter Badge Status" icon="ID">
          <div style={{ padding: 12, background: "var(--primary-light)", borderRadius: "var(--radius-sm)", border: "1px solid var(--primary-soft)" }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: "var(--primary)" }}>{results.length ? `${getPerformanceLevel(bestScore)} Aptitude Badge` : "No Badge Yet"}</span>
            <p style={{ fontSize: 13, color: "var(--text-main)", marginTop: 6, lineHeight: 1.5 }}>{results.length ? `Best score: ${bestScore}%. Downloadable certificates are available from each saved attempt.` : "Complete an aptitude test to unlock verified scorecards."}</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
