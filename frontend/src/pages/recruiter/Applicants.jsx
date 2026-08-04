import { useState } from "react";
import Table from "../../components/ui/Table";
import Card from "../../components/ui/Card";

const initialApplicants = [
  { id: 1, name: "Aditi Sharma", role: "Frontend Engineer", score: "92%", aptitude: "98th %ile", resume: "Aditi_Resume.pdf", status: "Applied" },
  { id: 2, name: "Rohan Patel", role: "Data Analyst", score: "86%", aptitude: "94th %ile", resume: "Rohan_CV.pdf", status: "Applied" },
  { id: 3, name: "Mira Das", role: "Full Stack SDE", score: "84%", aptitude: "91st %ile", resume: "Mira_Profile.pdf", status: "Shortlisted" },
  { id: 4, name: "Vikram Malhotra", role: "DevOps Engineer", score: "78%", aptitude: "84th %ile", resume: "Vikram_CV.pdf", status: "Applied" },
];

export default function Applicants() {
  const [data, setData] = useState(initialApplicants);

  function handleAction(id, action) {
    setData((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: action } : item))
    );
  }

  const columns = [
    {
      key: "name",
      label: "Candidate Name",
      render: (r) => (
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 34,
            height: 34,
            borderRadius: "50%",
            background: "#0a66c2",
            color: "#fff",
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 13
          }}>
            {r.name.charAt(0)}
          </div>
          <div>
            <strong style={{ display: "block" }}>{r.name}</strong>
            <span style={{ fontSize: 11, color: "var(--text-subtle)" }}>{r.role}</span>
          </div>
        </div>
      ),
    },
    {
      key: "score",
      label: "AI Match Score",
      render: (r) => <span className="badge-v2 primary">{r.score} Match</span>,
    },
    {
      key: "aptitude",
      label: "Verified Aptitude",
      render: (r) => <span className="badge-v2 success">{r.aptitude}</span>,
    },
    {
      key: "status",
      label: "Pipeline Stage",
      render: (r) => <span className="badge-v2 neutral">{r.status}</span>,
    },
    {
      key: "actions",
      label: "Recruiter Actions",
      render: (r) => (
        <div style={{ display: "flex", gap: 6 }}>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => alert(`Viewing Resume for ${r.name}`)}
          >
            📄 Resume
          </button>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => handleAction(r.id, "Shortlisted")}
          >
            ⭐ Shortlist
          </button>
        </div>
      ),
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <Card title="Applicant Tracking System (ATS)" icon="🧾">
        <p style={{ color: "var(--text-muted)", fontSize: 14, marginBottom: 16 }}>
          Filter and evaluate applicants sorted by verified aptitude score and AI match accuracy.
        </p>
        <Table columns={columns} data={data} />
      </Card>
    </div>
  );
}
