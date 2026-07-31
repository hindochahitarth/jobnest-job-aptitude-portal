import Card from "../../components/ui/Card";

const sections = [
  { title: "Summary", description: "Elevator pitch highlighting your strength." },
  { title: "Work experience", description: "Highlight your most relevant roles." },
  { title: "Skills", description: "List your technical and soft skills." },
  { title: "Projects", description: "Add results-driven examples." },
  { title: "Education", description: "Confirm degree and certifications." },
];

export default function ResumeBuilder() {
  return (
    <div className="dashboard-page resume-builder-page">
      <div className="resume-grid">
        <Card className="preview-card" title="Resume preview" icon="📝">
          <div className="resume-preview">
            <h3>John Doe</h3>
            <p>Frontend developer passionate about polished product UI, performance, and user-friendly dashboards.</p>
            <ul>
              <li>React, TypeScript, CSS, Figma</li>
              <li>Resume match score: 72%</li>
            </ul>
          </div>
        </Card>

        <Card className="section-card" title="Resume sections" icon="📂">
          <div className="section-list">
            {sections.map((section) => (
              <article key={section.title} className="section-item">
                <h4>{section.title}</h4>
                <p>{section.description}</p>
              </article>
            ))}
          </div>
        </Card>
      </div>

      <div className="resume-tips">
        <Card title="Edit recommendations" icon="✔️">
          <p>Focus on keywords from job descriptions, include measurable outcomes, and keep the layout clean for ATS scanning.</p>
        </Card>
      </div>
    </div>
  );
}
