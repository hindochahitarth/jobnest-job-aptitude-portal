import Card from "../../components/ui/Card";

const shortlisted = [
  { id: 1, name: "Aditi Sharma", role: "Frontend Engineer", match: "92%", aptitude: "98th %ile", status: "Interview Scheduled" },
  { id: 2, name: "Mira Das", role: "Full Stack SDE", match: "84%", aptitude: "91st %ile", status: "Aptitude Verified" },
];

export default function Shortlisted() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <Card title="Shortlisted Candidates Pool" icon="⭐">
        <p style={{ color: "var(--text-muted)", fontSize: 14, marginBottom: 16 }}>
          Candidates approved for next-stage interview rounds and skill assessments.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
          {shortlisted.map((item) => (
            <div key={item.id} style={{ padding: 16, background: "var(--bg-subtle)", borderRadius: "var(--radius-md)", border: "1px solid var(--surface-border)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <strong style={{ fontSize: 16, color: "var(--text-main)" }}>{item.name}</strong>
                <span className="badge-v2 success">{item.aptitude}</span>
              </div>
              <p style={{ fontSize: 13, color: "var(--text-subtle)", marginTop: 4 }}>{item.role} • {item.match} AI Match</p>
              <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
                <button type="button" className="btn btn-primary btn-sm" style={{ width: "100%" }} onClick={() => alert(`Scheduling interview with ${item.name}`)}>
                  📅 Schedule Interview
                </button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
