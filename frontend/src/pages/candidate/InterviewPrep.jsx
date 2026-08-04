import Card from "../../components/ui/Card";

const prepTopics = [
  { company: "Tech Product Companies", topic: "Data Structures & System Concepts", count: "45 Qs", level: "Intermediate" },
  { company: "Consulting & Analytics", topic: "Quantitative Estimation & Case Studies", count: "30 Qs", level: "Advanced" },
  { company: "Early Startups", topic: "React, Node.js & Practical Project Scenarios", count: "25 Qs", level: "Practical" },
];

export default function InterviewPrep() {
  return (
    <div className="dashboard-grid two-col">
      <div className="main-col">
        <Card title="AI Interview Prep Center" icon="🧪">
          <p style={{ color: "var(--text-muted)", fontSize: 14, marginBottom: 20 }}>
            Practice mock interview questions tailored to your target job roles and review AI answer suggestions.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {prepTopics.map((item, idx) => (
              <div key={idx} style={{ padding: 16, background: "var(--bg-subtle)", borderRadius: "var(--radius-md)", border: "1px solid var(--surface-border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <span className="badge-v2 primary">{item.company}</span>
                  <h4 style={{ fontSize: 16, fontWeight: 700, marginTop: 6, color: "var(--text-main)" }}>{item.topic}</h4>
                  <span style={{ fontSize: 12, color: "var(--text-subtle)" }}>{item.count} • {item.level}</span>
                </div>
                <button type="button" className="btn btn-primary btn-sm" onClick={() => alert(`Starting AI Practice for ${item.topic}`)}>
                  Start Practice
                </button>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="side-col">
        <Card title="Mock Interview Tips" icon="💡">
          <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 10, fontSize: 13, color: "var(--text-main)" }}>
            <li>1. Use the STAR method (Situation, Task, Action, Result) for behavioral questions.</li>
            <li>2. Explain your reasoning out loud when tackling quantitative problems.</li>
            <li>3. Highlight your verified JobNest aptitude scores during final interviews.</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
