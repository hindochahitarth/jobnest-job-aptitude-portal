import Card from "../../components/ui/Card";

const topics = [
  { title: "Mock interview questions", description: "Practice common frontend and behavioral interview prompts." },
  { title: "CV star bullets", description: "Convert achievements into impact-focused lines." },
  { title: "Soft skills", description: "Prepare stories around collaboration, ownership, and learning." },
];

export default function InterviewPrep() {
  return (
    <div className="dashboard-page interview-prep-page">
      <Card title="Interview prep dashboard" icon="🎤">
        <p>Use these quick wins to feel confident before your next recruiter conversation.</p>
      </Card>

      <div className="prep-grid">
        {topics.map((topic) => (
          <Card key={topic.title} className="prep-card" title={topic.title}>
            <p>{topic.description}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
