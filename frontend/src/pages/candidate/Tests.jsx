import Card from "../../components/ui/Card";

const testSuite = [
  { id: 1, title: "Quantitative Aptitude Challenge", duration: "30 mins", questions: 25, difficulty: "Medium", badge: "Highest Priority", category: "Math & Analytics" },
  { id: 2, title: "Logical & Diagrammatic Reasoning", duration: "25 mins", questions: 20, difficulty: "Easy-Medium", badge: "Popular", category: "Problem Solving" },
  { id: 3, title: "Verbal Ability & Comprehension", duration: "20 mins", questions: 20, difficulty: "Easy", badge: "Recommended", category: "Communication" },
  { id: 4, title: "Data Structures & Algorithmic Aptitude", duration: "45 mins", questions: 15, difficulty: "Hard", badge: "Tech Roles", category: "Coding & Logic" },
];

export default function Tests() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: "var(--text-main)" }}>Aptitude Assessment Center</h2>
          <p style={{ fontSize: 14, color: "var(--text-muted)", marginTop: 2 }}>
            Complete standardized tests to earn verified skill badges visible to thousands of top recruiters.
          </p>
        </div>
      </div>

      <div className="stat-cards-grid">
        <div className="stat-card-v2">
          <div className="stat-icon-wrap">🏆</div>
          <div className="stat-info">
            <div className="stat-value">94th</div>
            <div className="stat-label">Overall Percentile</div>
          </div>
        </div>
        <div className="stat-card-v2">
          <div className="stat-icon-wrap">✅</div>
          <div className="stat-info">
            <div className="stat-value">6 / 8</div>
            <div className="stat-label">Tests Passed</div>
          </div>
        </div>
        <div className="stat-card-v2">
          <div className="stat-icon-wrap">⭐</div>
          <div className="stat-info">
            <div className="stat-value">Certified</div>
            <div className="stat-label">Recruiter Verified</div>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
        {testSuite.map((test) => (
          <Card key={test.id}>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <span className="badge-v2 primary">{test.category}</span>
                <span className="badge-v2 success">{test.badge}</span>
              </div>

              <h3 style={{ fontSize: 17, fontWeight: 700, color: "var(--text-main)" }}>{test.title}</h3>

              <div style={{ display: "flex", gap: 16, fontSize: 13, color: "var(--text-muted)" }}>
                <span>⏱️ {test.duration}</span>
                <span>❓ {test.questions} Qs</span>
                <span>📊 {test.difficulty}</span>
              </div>

              <button
                type="button"
                className="btn btn-primary"
                style={{ marginTop: 8 }}
                onClick={() => alert(`Starting test: ${test.title}`)}
              >
                Start Assessment
              </button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
