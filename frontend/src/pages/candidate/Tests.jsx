import Card from "../../components/ui/Card";

const sections = [
  { title: "Quantitative", time: "10 min", status: "Ready" },
  { title: "Logical", time: "12 min", status: "Ready" },
  { title: "Verbal", time: "8 min", status: "Ready" },
  { title: "Coding", time: "15 min", status: "Pending" },
];

export default function Tests() {
  return (
    <div className="dashboard-page tests-page">
      <div className="tests-grid">
        <Card title="Upcoming aptitude sections" icon="⏱️">
          <div className="section-tiles">
            {sections.map((section) => (
              <article key={section.title} className="section-card">
                <div>
                  <h4>{section.title}</h4>
                  <p>{section.time} • {section.status}</p>
                </div>
                <button className="btn btn-primary">Start</button>
              </article>
            ))}
          </div>
        </Card>

        <Card title="Test strategy" icon="🧭">
          <p>Focus on one section at a time, answer high-confidence questions first, then revisit challenging items with any remaining time.</p>
        </Card>
      </div>
    </div>
  );
}
