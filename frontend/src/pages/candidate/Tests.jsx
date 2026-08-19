import Card from "../../components/ui/Card";

const testSuite = [
  { id: 1, title: "Quantitative Aptitude Challenge", duration: "30 mins", questions: 25, difficulty: "MEDIUM", badge: "Highest Priority", category: "Math & Analytics", section: "QUANT" },
  { id: 2, title: "Logical & Diagrammatic Reasoning", duration: "30 mins", questions: 20, difficulty: "EASY", badge: "Popular", category: "Problem Solving", section: "LOGICAL" },
  { id: 3, title: "Verbal Ability & Comprehension", duration: "25 mins", questions: 20, difficulty: "EASY", badge: "Recommended", category: "Communication", section: "VERBAL" },
  { id: 4, title: "Data Structures & Algorithmic Aptitude", duration: "45 mins", questions: 30, difficulty: "HARD", badge: "Tech Roles", category: "Coding & Logic", section: "TECHNICAL" },
];

export default function Tests() {
  function startTest(test) {
    if (test) {
      sessionStorage.setItem("jobnestTestPreset", JSON.stringify({
        section: test.section,
        difficulty: test.difficulty,
        questionCount: test.questions,
        timeLimitMinutes: Number.parseInt(test.duration, 10) || 30,
        proctored: true,
      }));
    } else {
      sessionStorage.removeItem("jobnestTestPreset");
    }
    window.history.pushState({}, "", "/dashboard/test-session");
    window.dispatchEvent(new PopStateEvent("popstate"));
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div className="page-header-block">
        <div>
          <h2>Aptitude Assessment Center</h2>
          <p>Complete randomized proctored MCQ tests and save verified scorecards for recruiters.</p>
        </div>
        <div className="page-header-actions">
          <button type="button" className="btn btn-primary" onClick={() => startTest()}>
            Configure Custom Proctored Test
          </button>
        </div>
      </div>

      <div className="stat-cards-grid-top">
        <div className="stat-card-v2">
          <div className="stat-icon-wrap">#</div>
          <div className="stat-info">
            <div className="stat-value">20-50</div>
            <div className="stat-label">Random MCQs</div>
          </div>
        </div>
        <div className="stat-card-v2">
          <div className="stat-icon-wrap">%</div>
          <div className="stat-info">
            <div className="stat-value">Stored</div>
            <div className="stat-label">Score History</div>
          </div>
        </div>
        <div className="stat-card-v2">
          <div className="stat-icon-wrap">ID</div>
          <div className="stat-info">
            <div className="stat-value">Certified</div>
            <div className="stat-label">Result Forms</div>
          </div>
        </div>
        <div className="stat-card-v2">
          <div className="stat-icon-wrap">!</div>
          <div className="stat-info">
            <div className="stat-value">Proctored</div>
            <div className="stat-label">Violation Logs</div>
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

              <div style={{ display: "flex", gap: 16, fontSize: 13, color: "var(--text-muted)", flexWrap: "wrap" }}>
                <span>{test.duration}</span>
                <span>{test.questions} Qs</span>
                <span>{test.difficulty}</span>
              </div>

              <button
                type="button"
                className="btn btn-primary"
                style={{ marginTop: 8 }}
                onClick={() => startTest(test)}
              >
                Start Proctored Assessment
              </button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
