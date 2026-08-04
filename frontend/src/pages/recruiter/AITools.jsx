import { useState } from "react";
import Card from "../../components/ui/Card";

export default function AITools() {
  const [roleTitle, setRoleTitle] = useState("");
  const [generatedJD, setGeneratedJD] = useState("");

  function handleGenerate(e) {
    e.preventDefault();
    setGeneratedJD(
      `Job Title: ${roleTitle || "Software Engineer"}\nLocation: Remote / India\n\nKey Responsibilities:\n- Build scalable frontend components and backend services.\n- Collaborate with product management and design teams.\n\nQualifications & Aptitude Requirements:\n- Bachelor's degree in CS/IT or equivalent experience.\n- JobNest Aptitude Assessment score > 80%.\n- Proficiency in JavaScript, React, and Database design.`
    );
  }

  return (
    <div className="dashboard-grid two-col">
      <div className="main-col">
        <Card title="AI Job Description & Requirement Generator" icon="🤖">
          <form onSubmit={handleGenerate} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div className="input-group">
              <label>Enter Role Title</label>
              <input
                className="input-field"
                placeholder="e.g. Senior Frontend Engineer"
                value={roleTitle}
                onChange={(e) => setRoleTitle(e.target.value)}
              />
            </div>
            <button type="submit" className="btn btn-primary">
              Generate Optimized Job Specification
            </button>
          </form>

          {generatedJD && (
            <div style={{ marginTop: 20, padding: 16, background: "var(--bg-subtle)", borderRadius: "var(--radius-md)", border: "1px solid var(--surface-border)" }}>
              <h4 style={{ fontSize: 15, fontWeight: 700, marginBottom: 8, color: "var(--primary)" }}>AI Generated Job Spec</h4>
              <pre style={{ whiteSpace: "pre-wrap", fontFamily: "inherit", fontSize: 13, color: "var(--text-main)", lineHeight: 1.6 }}>
                {generatedJD}
              </pre>
            </div>
          )}
        </Card>
      </div>

      <div className="side-col">
        <Card title="AI Recruiter Tools" icon="⚡">
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <button type="button" className="btn btn-secondary btn-sm" style={{ width: "100%" }} onClick={() => alert("Bulk Resume Parsing activated")}>
              📄 Bulk Resume Parser
            </button>
            <button type="button" className="btn btn-secondary btn-sm" style={{ width: "100%" }} onClick={() => alert("Custom Aptitude Creator opened")}>
              🧠 Custom Aptitude Test Builder
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
}
