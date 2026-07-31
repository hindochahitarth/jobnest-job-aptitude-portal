import Card from "../../components/ui/Card";

const tools = [
  { title: "AI JD Matcher", description: "Compare candidate resumes to job descriptions in seconds." },
  { title: "Shortlist assistant", description: "Sort applicants by match score and skill fit." },
  { title: "Interview guide", description: "Generate interviewer questions based on role priorities." },
];

export default function AITools() {
  return (
    <div className="dashboard-page ai-tools-page">
      <Card title="AI recruiter toolkit" icon="🤖">
        <p>Use AI-powered hiring tools to reduce screening time and focus on the strongest candidates.</p>
      </Card>
      <div className="tools-grid">
        {tools.map((tool) => (
          <Card key={tool.title} className="tool-card" title={tool.title}>
            <p>{tool.description}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
