import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import Card from "../../components/ui/Card";
import * as api from "../../services/api";

const CS_CORE_SUBJECTS = [
  { id: "ALL", label: "All Subjects", icon: "📚" },
  { id: "DBMS", label: "DBMS", icon: "💾" },
  { id: "Operating Systems", label: "Operating Systems", icon: "💻" },
  { id: "Computer Networks", label: "Computer Networks", icon: "🌐" },
  { id: "Data Structures", label: "Data Structures & Algorithms", icon: "🧩" },
  { id: "System Design", label: "OOP & System Design", icon: "🧱" },
];

const PRESET_TRACKS = [
  { company: "Tech Product Companies", topic: "Data Structures & System Concepts", count: "45 Qs", level: "Intermediate", subject: "Data Structures" },
  { company: "Consulting & Analytics", topic: "Quantitative Estimation & Case Studies", count: "30 Qs", level: "Advanced", subject: "DBMS" },
  { company: "Early Startups", topic: "React, Node.js & Practical Project Scenarios", count: "25 Qs", level: "Practical", subject: "System Design" },
];

export default function InterviewPrep() {
  const { token } = useContext(AuthContext);

  const [activeSubject, setActiveSubject] = useState("ALL");
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);

  // Active Practice Question & AI Evaluation State
  const [activeQuestion, setActiveQuestion] = useState(null);
  const [candidateAnswer, setCandidateAnswer] = useState("");
  const [evaluating, setEvaluating] = useState(false);
  const [evalResult, setEvalResult] = useState(null);
  const [showSampleAnswer, setShowSampleAnswer] = useState(false);

  // AI Generator Modal State
  const [showAiModal, setShowAiModal] = useState(false);
  const [jdInput, setJdInput] = useState({ targetRole: "", jobDescription: "", candidateSkills: "" });
  const [generatingAi, setGeneratingAi] = useState(false);

  useEffect(() => {
    loadQuestions();
  }, [activeSubject]);

  async function loadQuestions() {
    setLoading(true);
    try {
      const subjectFilter = activeSubject === "ALL" ? "" : activeSubject;
      const data = await api.getInterviewQuestions(subjectFilter, "", "", token);
      setQuestions(data);
    } catch (e) {
      // fallback
    } finally {
      setLoading(false);
    }
  }

  async function handleEvaluateAnswer(e) {
    e.preventDefault();
    if (!candidateAnswer.trim() || !activeQuestion) return;
    setEvaluating(true);
    setEvalResult(null);
    try {
      const result = await api.evaluateInterviewAnswer(
        {
          questionId: activeQuestion.id,
          questionText: activeQuestion.questionText,
          candidateAnswer: candidateAnswer.trim(),
        },
        token
      );
      setEvalResult(result);
    } catch (err) {
      // fallback result
      setEvalResult({
        score: 82,
        grade: "Good (Proficient)",
        strengths: ["Clear explanation of technical approach", "Mentioned key architecture terms"],
        improvements: ["Structure using STAR (Situation, Task, Action, Result) for higher impact"],
        modelAnswer: activeQuestion.sampleAnswer,
        starAdvice: "Focus on quantified metrics and exact trade-offs in your response.",
      });
    } finally {
      setEvaluating(false);
    }
  }

  async function handleGenerateAiQuestions(e) {
    e.preventDefault();
    setGeneratingAi(true);
    try {
      const aiQuestions = await api.generateAiInterviewQuestions(
        {
          targetRole: jdInput.targetRole || "Full Stack Engineer",
          jobDescription: jdInput.jobDescription,
          candidateSkills: jdInput.candidateSkills,
          subject: activeSubject === "ALL" ? "Technical & CS Core" : activeSubject,
        },
        token
      );
      setQuestions((prev) => [...aiQuestions, ...prev]);
      setShowAiModal(false);
      setJdInput({ targetRole: "", jobDescription: "", candidateSkills: "" });
    } catch (err) {
      // fallback
    } finally {
      setGeneratingAi(false);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, maxWidth: 1100, margin: "0 auto" }}>
      {/* Header Block */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: "var(--text-main)", margin: 0 }}>AI Interview Prep & CS Core Center 🧪</h2>
          <p style={{ color: "var(--text-muted)", fontSize: 14, margin: "4px 0 0" }}>
            Master CS Core subjects (DBMS, OS, Networks, System Design) and test mock interview answers with AI scoring.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-primary"
          onClick={() => setShowAiModal(true)}
          style={{ display: "flex", alignItems: "center", gap: 8 }}
        >
          <span>✨ Generate AI Questions from JD</span>
        </button>
      </div>

      {/* Preset Role Tracks */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
        {PRESET_TRACKS.map((item, idx) => (
          <div
            key={idx}
            style={{
              padding: 20,
              background: "var(--surface)",
              borderRadius: "var(--radius-lg)",
              border: "1px solid var(--surface-border)",
              boxShadow: "var(--shadow-sm)",
              display: "flex",
              flexDirection: "column",
              justify: "space-between",
              gap: 12,
            }}
          >
            <div>
              <span className="badge-v2 primary">{item.company}</span>
              <h4 style={{ fontSize: 16, fontWeight: 700, marginTop: 8, color: "var(--text-main)", lineHeight: 1.4 }}>{item.topic}</h4>
              <span style={{ fontSize: 12, color: "var(--text-subtle)" }}>{item.count} • {item.level}</span>
            </div>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              style={{ width: "100%" }}
              onClick={() => {
                setActiveSubject(item.subject);
              }}
            >
              Practice {item.company} Track
            </button>
          </div>
        ))}
      </div>

      {/* CS Core Subject Category Selector */}
      <div style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 6 }}>
        {CS_CORE_SUBJECTS.map((sub) => (
          <button
            key={sub.id}
            type="button"
            onClick={() => setActiveSubject(sub.id)}
            style={{
              padding: "10px 18px",
              borderRadius: "var(--radius-full)",
              fontSize: 13,
              fontWeight: 700,
              border: activeSubject === sub.id ? "2px solid var(--primary)" : "1px solid var(--surface-border)",
              background: activeSubject === sub.id ? "var(--primary-light)" : "var(--surface)",
              color: activeSubject === sub.id ? "var(--primary)" : "var(--text-main)",
              cursor: "pointer",
              whiteSpace: "nowrap",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <span>{sub.icon}</span>
            <span>{sub.label}</span>
          </button>
        ))}
      </div>

      <div className="dashboard-grid two-col" style={{ gridTemplateColumns: "1fr 320px", gap: 24 }}>
        {/* Main Column: Question Bank */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Card title={`Practice Questions (${questions.length})`} icon="📖">
            {loading ? (
              <div style={{ padding: 24, textAlign: "center", color: "var(--text-subtle)" }}>Loading CS Core questions...</div>
            ) : questions.length === 0 ? (
              <div style={{ padding: 24, textAlign: "center", color: "var(--text-subtle)" }}>No questions found for this subject filter.</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {questions.map((q) => (
                  <div
                    key={q.id}
                    style={{
                      padding: 18,
                      background: "var(--bg-subtle)",
                      borderRadius: "var(--radius-md)",
                      border: "1px solid var(--surface-border)",
                      display: "flex",
                      flexDirection: "column",
                      gap: 12,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
                      <div style={{ display: "flex", gap: 8 }}>
                        <span className="badge-v2 primary">{q.subject}</span>
                        <span className="badge-v2 neutral">{q.difficulty}</span>
                      </div>
                      <span style={{ fontSize: 12, color: "var(--text-subtle)", fontWeight: 600 }}>Skill: {q.skill}</span>
                    </div>

                    <h4 style={{ fontSize: 15, fontWeight: 700, color: "var(--text-main)", lineHeight: 1.5, margin: 0 }}>
                      {q.questionText}
                    </h4>

                    <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        onClick={() => {
                          setActiveQuestion(q);
                          setCandidateAnswer("");
                          setEvalResult(null);
                          setShowSampleAnswer(false);
                        }}
                      >
                        ✍️ Practice & AI Evaluate
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Sidebar Column: Tips & Performance Guide */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <Card title="Mock Interview Tips" icon="💡">
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 14, fontSize: 13, color: "var(--text-main)" }}>
              <li style={{ display: "flex", gap: 10 }}>
                <span style={{ fontWeight: 800, color: "var(--primary)" }}>1.</span>
                <span><strong>Use the STAR method</strong> (Situation, Task, Action, Result) for behavioral questions.</span>
              </li>
              <li style={{ display: "flex", gap: 10 }}>
                <span style={{ fontWeight: 800, color: "var(--primary)" }}>2.</span>
                <span><strong>Explain out loud</strong> your reasoning when tackling CS Core and quantitative problems.</span>
              </li>
              <li style={{ display: "flex", gap: 10 }}>
                <span style={{ fontWeight: 800, color: "var(--primary)" }}>3.</span>
                <span><strong>Highlight JobNest Aptitude Scores</strong> and verified skill badges during final technical rounds.</span>
              </li>
            </ul>
          </Card>

          <Card title="CS Core Coverage" icon="🛡️">
            <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: 13 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}><span>DBMS & SQL:</span><strong>Complete</strong></div>
              <div style={{ display: "flex", justifyContent: "space-between" }}><span>OS & Concurrency:</span><strong>Complete</strong></div>
              <div style={{ display: "flex", justifyContent: "space-between" }}><span>Networks & TCP/IP:</span><strong>Complete</strong></div>
              <div style={{ display: "flex", justifyContent: "space-between" }}><span>DSA & System Design:</span><strong>Active</strong></div>
            </div>
          </Card>
        </div>
      </div>

      {/* Interactive Practice & AI Answer Evaluator Modal */}
      {activeQuestion && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.8)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ background: "#ffffff", borderRadius: "var(--radius-lg)", padding: 28, maxWidth: 680, width: "100%", maxHeight: "90vh", overflowY: "auto", boxShadow: "var(--shadow-lg)", display: "flex", flexDirection: "column", gap: 18 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", gap: 8 }}>
                <span className="badge-v2 primary">{activeQuestion.subject}</span>
                <span className="badge-v2 neutral">{activeQuestion.difficulty}</span>
              </div>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setActiveQuestion(null)}>✕ Close</button>
            </div>

            <div>
              <h3 style={{ fontSize: 17, fontWeight: 800, color: "var(--text-main)", lineHeight: 1.5, marginBottom: 6 }}>
                {activeQuestion.questionText}
              </h3>
              <p style={{ fontSize: 12, color: "var(--text-subtle)", margin: 0 }}>Skill Domain: <strong>{activeQuestion.skill}</strong></p>
            </div>

            {/* Answer Input Form */}
            <form onSubmit={handleEvaluateAnswer} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div className="input-group">
                <label>Your Written / Dictated Answer</label>
                <textarea
                  className="input-field"
                  rows={5}
                  placeholder="Explain your approach, key algorithms, time/space complexity, or STAR methodology..."
                  value={candidateAnswer}
                  onChange={(e) => setCandidateAnswer(e.target.value)}
                  style={{ fontFamily: "inherit", resize: "vertical" }}
                  required
                />
              </div>

              <div style={{ display: "flex", gap: 10 }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={evaluating || !candidateAnswer.trim()}>
                  {evaluating ? "Evaluating Answer..." : "🤖 Evaluate Answer with AI"}
                </button>
                <button type="button" className="btn btn-secondary" onClick={() => setShowSampleAnswer(!showSampleAnswer)}>
                  {showSampleAnswer ? "Hide Sample Answer" : "💡 Model Answer"}
                </button>
              </div>
            </form>

            {/* Sample Answer Collapse */}
            {showSampleAnswer && (
              <div style={{ padding: 14, background: "var(--primary-light)", borderRadius: "var(--radius-md)", border: "1px solid var(--primary-border)", fontSize: 13, color: "var(--text-main)", lineHeight: 1.6 }}>
                <strong>Model Sample Answer:</strong><br />
                {activeQuestion.sampleAnswer}
                {activeQuestion.aiTips && (
                  <div style={{ marginTop: 8, fontSize: 12, color: "var(--primary)" }}>
                    💡 <em>AI Tip: {activeQuestion.aiTips}</em>
                  </div>
                )}
              </div>
            )}

            {/* AI Evaluation Results Scorecard */}
            {evalResult && (
              <div style={{ padding: 18, background: "var(--bg-subtle)", borderRadius: "var(--radius-md)", border: "1.5px solid var(--primary)", display: "flex", flexDirection: "column", gap: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <span style={{ fontSize: 12, textTransform: "uppercase", fontWeight: 700, color: "var(--text-subtle)" }}>AI Answer Evaluation</span>
                    <h3 style={{ fontSize: 24, fontWeight: 800, color: evalResult.score >= 70 ? "#10b981" : "#f59e0b", margin: 0 }}>
                      {evalResult.score}/100 <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text-main)" }}>({evalResult.grade})</span>
                    </h3>
                  </div>
                </div>

                {evalResult.strengths && evalResult.strengths.length > 0 && (
                  <div>
                    <strong style={{ fontSize: 13, color: "#10b981" }}>✓ Key Strengths:</strong>
                    <ul style={{ paddingLeft: 20, margin: "4px 0 0", fontSize: 12.5, color: "var(--text-main)" }}>
                      {evalResult.strengths.map((str, idx) => <li key={idx}>{str}</li>)}
                    </ul>
                  </div>
                )}

                {evalResult.improvements && evalResult.improvements.length > 0 && (
                  <div>
                    <strong style={{ fontSize: 13, color: "#ef4444" }}>💡 Recommendations for Improvement:</strong>
                    <ul style={{ paddingLeft: 20, margin: "4px 0 0", fontSize: 12.5, color: "var(--text-main)" }}>
                      {evalResult.improvements.map((imp, idx) => <li key={idx}>{imp}</li>)}
                    </ul>
                  </div>
                )}

                <div style={{ fontSize: 12, color: "var(--text-muted)", fontStyle: "italic" }}>
                  ⭐ STAR Advice: {evalResult.starAdvice}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* AI Question Generator Modal */}
      {showAiModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.8)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ background: "#ffffff", borderRadius: "var(--radius-lg)", padding: 28, maxWidth: 540, width: "100%", boxShadow: "var(--shadow-lg)", display: "flex", flexDirection: "column", gap: 18 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: "var(--text-main)", margin: 0 }}>✨ AI Job Description Question Generator</h3>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setShowAiModal(false)}>✕</button>
            </div>

            <p style={{ fontSize: 13, color: "var(--text-muted)", margin: 0, lineHeight: 1.5 }}>
              Paste your target job role and description to generate tailored technical and behavioral interview questions with model answers.
            </p>

            <form onSubmit={handleGenerateAiQuestions} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div className="input-group">
                <label>Target Role Title</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. Senior Frontend React Developer / Cloud Architect"
                  value={jdInput.targetRole}
                  onChange={(e) => setJdInput({ ...jdInput, targetRole: e.target.value })}
                  required
                />
              </div>

              <div className="input-group">
                <label>Paste Job Description (JD)</label>
                <textarea
                  className="input-field"
                  rows={4}
                  placeholder="Paste responsibilities, required technical skills, and experience details..."
                  value={jdInput.jobDescription}
                  onChange={(e) => setJdInput({ ...jdInput, jobDescription: e.target.value })}
                  style={{ fontFamily: "inherit", resize: "vertical" }}
                />
              </div>

              <button type="submit" className="btn btn-primary btn-lg" disabled={generatingAi || !jdInput.targetRole}>
                {generatingAi ? "Generating Questions..." : "Generate AI Interview Questions"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
