import Card from "../../components/ui/Card";

const results = [
  { test: "Quantitative Reasoning Test", score: "94%", percentile: "98th Percentile", status: "Passed & Verified", date: "Aug 2026" },
  { test: "Logical Assessment", score: "88%", percentile: "91st Percentile", status: "Passed & Verified", date: "Jul 2026" },
  { test: "Verbal Comprehension", score: "82%", percentile: "85th Percentile", status: "Passed", date: "Jul 2026" },
];

export default function Results() {
  return (
    <div className="dashboard-grid two-col">
      <div className="main-col">
        <Card title="Your Test Scorecards & Certificates" icon="📊">
          <p style={{ color: "var(--text-muted)", fontSize: 14, marginBottom: 16 }}>
            Verified certificates are directly linked to your candidate profile and visible to recruiters on JobNest.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {results.map((res, i) => (
              <div key={i} style={{ padding: 16, background: "var(--bg-subtle)", borderRadius: "var(--radius-md)", border: "1px solid var(--surface-border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <h4 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-main)" }}>{res.test}</h4>
                  <p style={{ fontSize: 13, color: "var(--text-subtle)", marginTop: 2 }}>
                    Score: {res.score} • {res.percentile} • Completed: {res.date}
                  </p>
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <span className="badge-v2 success">{res.status}</span>
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => alert(`Downloading Certificate for ${res.test}`)}>
                    📜 Certificate
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="side-col">
        <Card title="Recruiter Badge Status" icon="🛡️">
          <div style={{ padding: 12, background: "var(--primary-light)", borderRadius: "var(--radius-sm)", border: "1px solid var(--primary-soft)" }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: "var(--primary)" }}>✓ Gold Aptitude Badge Earned</span>
            <p style={{ fontSize: 13, color: "var(--text-main)", marginTop: 6, lineHeight: 1.5 }}>
              Your scores place you in the top 5% of candidates nationwide.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
