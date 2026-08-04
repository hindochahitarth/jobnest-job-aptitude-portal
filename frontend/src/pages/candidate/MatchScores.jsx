import Card from "../../components/ui/Card";

const breakdown = [
  { category: "Skill Keyword Match", score: 92, status: "Excellent" },
  { category: "Verified Aptitude Percentile", score: 94, status: "Top 5%" },
  { category: "Work Experience Alignment", score: 75, status: "Good" },
  { category: "Education Cutoff", score: 100, status: "Perfect" },
];

export default function MatchScores() {
  return (
    <div className="dashboard-grid two-col">
      <div className="main-col">
        <Card title="Candidate Job Match Breakdown" icon="🎯">
          <p style={{ color: "var(--text-muted)", fontSize: 14, marginBottom: 20 }}>
            JobNest calculates your overall match index using verified aptitude scores, technical keyword alignment, and experience depth.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {breakdown.map((item, idx) => (
              <div key={idx} style={{ padding: 16, background: "var(--bg-subtle)", borderRadius: "var(--radius-md)", border: "1px solid var(--surface-border)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontSize: 15, fontWeight: 700, color: "var(--text-main)" }}>{item.category}</span>
                  <span className="badge-v2 success">{item.score}% ({item.status})</span>
                </div>
                <div className="meter-bar">
                  <div className="meter-fill" style={{ width: `${item.score}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="side-col">
        <Card title="How to Boost Your Score" icon="💡">
          <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 12, fontSize: 13 }}>
            <li style={{ padding: 10, background: "var(--bg-subtle)", borderRadius: "var(--radius-sm)" }}>
              <strong>Take Logical Reasoning Test</strong>
              <div style={{ color: "var(--text-subtle)", marginTop: 2 }}>Increase overall match index by +6%</div>
            </li>
            <li style={{ padding: 10, background: "var(--bg-subtle)", borderRadius: "var(--radius-sm)" }}>
              <strong>Add System Design Keywords</strong>
              <div style={{ color: "var(--text-subtle)", marginTop: 2 }}>Unlock senior software engineer roles</div>
            </li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
