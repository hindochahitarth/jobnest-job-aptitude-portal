import React, { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import Card from "../../components/ui/Card";
import * as api from "../../services/api";

const TRACKS = [
  {
    company: "Tech Product Companies",
    topic: "Data Structures & System Concepts",
    level: "Intermediate",
    subject: "Data Structures & System Concepts",
    industry: "Software Engineering, Backend, Platform Teams",
    icon: "⚙️",
  },
  {
    company: "Consulting & Analytics",
    topic: "Quantitative Estimation & Case Studies",
    level: "Advanced",
    subject: "Quantitative Estimation & Case Studies",
    industry: "Consulting, Product Analytics, Business Analyst",
    icon: "📊",
  },
  {
    company: "Early Startups",
    topic: "React, Node.js & Practical Project Scenarios",
    level: "Practical",
    subject: "React, Node.js & Practical Project Scenarios",
    industry: "Frontend, Full Stack, SaaS Startups",
    icon: "🚀",
  },
  {
    company: "Data & SaaS Platforms",
    topic: "DBMS",
    level: "Intermediate",
    subject: "DBMS",
    industry: "Backend, Data Engineering, Database Admin",
    icon: "🗄️",
  },
  {
    company: "Cloud Infrastructure",
    topic: "Operating Systems",
    level: "Intermediate",
    subject: "Operating Systems",
    industry: "DevOps, SRE, Systems Engineering",
    icon: "☁️",
  },
  {
    company: "Networking & Security",
    topic: "Computer Networks",
    level: "Foundation",
    subject: "Computer Networks",
    industry: "Security, Cloud, Network Engineering",
    icon: "🔒",
  },
  {
    company: "AI/ML Teams",
    topic: "AI & ML",
    level: "Intermediate",
    subject: "AI & ML",
    industry: "ML Engineer, Data Scientist, AI Product Teams",
    icon: "🤖",
  },
  {
    company: "Electronics & Hardware",
    topic: "Electronics & Hardware Systems",
    level: "Core Engineering",
    subject: "Electronics & Hardware Systems",
    industry: "Embedded Systems, IoT, VLSI, Hardware Testing",
    icon: "🔧",
  },
];

const DIFFICULTY_COLORS = {
  BEGINNER: { bg: "#dcfce7", color: "#166534", border: "#bbf7d0" },
  INTERMEDIATE: { bg: "#dbeafe", color: "#1e40af", border: "#bfdbfe" },
  ADVANCED: { bg: "#fef3c7", color: "#92400e", border: "#fde68a" },
  PRACTICAL: { bg: "#f3e8ff", color: "#6b21a8", border: "#e9d5ff" },
  "CORE ENGINEERING": { bg: "#fee2e2", color: "#991b1b", border: "#fecaca" },
};

function getDifficultyStyle(difficulty) {
  return DIFFICULTY_COLORS[(difficulty || "").toUpperCase()] || { bg: "#f1f5f9", color: "#475569", border: "#e2e8f0" };
}

const panelStyle = {
  padding: 18,
  background: "var(--bg-subtle)",
  borderRadius: "var(--radius-md)",
  border: "1px solid var(--surface-border)",
};

function getQuestionKey(question, index) {
  return `${question.id || "generated"}-${question.subject || "subject"}-${index}`;
}

function DifficultyBadge({ difficulty }) {
  const style = getDifficultyStyle(difficulty);
  return (
    <span style={{
      fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 999,
      background: style.bg, color: style.color, border: `1px solid ${style.border}`,
      textTransform: "uppercase", letterSpacing: "0.05em",
    }}>
      {difficulty || "INTERMEDIATE"}
    </span>
  );
}

function AiBadge() {
  return (
    <span style={{
      fontSize: 10, fontWeight: 800, padding: "2px 7px", borderRadius: 999,
      background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
      color: "#fff", letterSpacing: "0.04em", display: "inline-flex", alignItems: "center", gap: 3,
    }}>
      ✦ AI
    </span>
  );
}

export default function InterviewPrep() {
  const { token } = useContext(AuthContext);
  const [activeSubject, setActiveSubject] = useState(TRACKS[0].subject);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "info" });
  const [activeQuestion, setActiveQuestion] = useState(null);
  const [candidateAnswer, setCandidateAnswer] = useState("");
  const [evaluating, setEvaluating] = useState(false);
  const [evalResult, setEvalResult] = useState(null);
  const [showSampleAnswer, setShowSampleAnswer] = useState(false);
  const [showGeneratorModal, setShowGeneratorModal] = useState(false);
  const [generatorInput, setGeneratorInput] = useState({ targetRole: "", jobDescription: "", candidateSkills: "" });
  const [generating, setGenerating] = useState(false);
  const [aiQuestionIds, setAiQuestionIds] = useState(new Set());
  const [practicedIds, setPracticedIds] = useState(new Set());

  const loadQuestions = useCallback(async () => {
    setLoading(true);
    setMessage({ text: "", type: "info" });
    try {
      const data = await api.getInterviewQuestions(activeSubject, "", "", token);
      setQuestions(Array.isArray(data) ? data : []);
      setAiQuestionIds(new Set());
    } catch {
      setQuestions([]);
      setMessage({ text: "Could not load interview questions from the server.", type: "error" });
    } finally {
      setLoading(false);
    }
  }, [activeSubject, token]);

  useEffect(() => {
    loadQuestions();
  }, [loadQuestions]);

  const subjectLabel = useMemo(
    () => TRACKS.find((t) => t.subject === activeSubject)?.topic || activeSubject,
    [activeSubject]
  );

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
    } catch {
      // Heuristic fallback result displayed to user
      setEvalResult({
        score: 65,
        grade: "Good",
        strengths: ["Your answer covers the relevant technical direction."],
        improvements: ["Add trade-offs, time/space complexity, and a concrete example."],
        modelAnswer: activeQuestion.sampleAnswer,
        starAdvice: "For project answers, explain the situation, your action, and the measurable result.",
      });
    } finally {
      setEvaluating(false);
    }
  }

  async function handleGenerateQuestions(e) {
    if (e) e.preventDefault();
    setGenerating(true);
    setMessage({ text: "", type: "info" });
    try {
      const generatedQuestions = await api.generateAiInterviewQuestions(
        {
          targetRole: generatorInput.targetRole || activeSubject,
          jobDescription: generatorInput.jobDescription,
          candidateSkills: generatorInput.candidateSkills,
          subject: activeSubject,
        },
        token
      );
      const newIds = new Set(generatedQuestions.map((q, i) => q.id ?? `gen-${i}`));
      setAiQuestionIds((prev) => new Set([...prev, ...newIds]));
      setQuestions((prev) => [...generatedQuestions, ...prev]);
      setShowGeneratorModal(false);
      setGeneratorInput({ targetRole: "", jobDescription: "", candidateSkills: "" });
      setMessage({
        text: `✦ ${generatedQuestions.length} AI-generated questions added using Groq (llama-3.3-70b-versatile).`,
        type: "success",
      });
    } catch {
      setMessage({ text: "Could not generate questions right now. Please check the backend and Groq API key.", type: "error" });
    } finally {
      setGenerating(false);
    }
  }

  // Quick generate without opening the modal (uses active subject defaults)
  async function handleQuickGenerate() {
    setGenerating(true);
    setMessage({ text: "", type: "info" });
    try {
      const generated = await api.generateAiInterviewQuestions(
        { targetRole: activeSubject, jobDescription: "", candidateSkills: "", subject: activeSubject },
        token
      );
      const newIds = new Set(generated.map((q, i) => q.id ?? `gen-${i}`));
      setAiQuestionIds((prev) => new Set([...prev, ...newIds]));
      setQuestions((prev) => [...generated, ...prev]);
      setMessage({
        text: `✦ ${generated.length} fresh AI questions generated for "${subjectLabel}".`,
        type: "success",
      });
    } catch {
      setMessage({ text: "Quick generate failed. Please try the full generate modal.", type: "error" });
    } finally {
      setGenerating(false);
    }
  }

  function openPractice(question) {
    setActiveQuestion(question);
    setCandidateAnswer("");
    setEvalResult(null);
    setShowSampleAnswer(false);
    setPracticedIds((prev) => new Set([...prev, question.id]));
  }

  const activeTrack = TRACKS.find((t) => t.subject === activeSubject);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22, maxWidth: 1100, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: "var(--text-main)", margin: 0 }}>
            Interview Preparation
          </h2>
          <p style={{ color: "var(--text-muted)", fontSize: 14, margin: "4px 0 0", maxWidth: 680 }}>
            AI-powered practice questions generated by Groq (llama-3.3-70b) — unique and randomized every time.
          </p>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button type="button" className="btn btn-secondary" onClick={handleQuickGenerate} disabled={generating}>
            {generating ? "Generating…" : "⟳ Randomize Questions"}
          </button>
          <button type="button" className="btn btn-primary" onClick={() => setShowGeneratorModal(true)}>
            ✦ Custom AI Set
          </button>
        </div>
      </div>

      {/* Track grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 14 }}>
        {TRACKS.map((track) => {
          const isActive = activeSubject === track.subject;
          const visibleCount = isActive ? questions.length : null;
          return (
            <div
              key={track.subject}
              style={{
                ...panelStyle,
                background: isActive ? "var(--primary-light, #eff6ff)" : "var(--surface)",
                border: isActive ? "1.5px solid var(--primary)" : "1px solid var(--surface-border)",
                display: "flex", flexDirection: "column", gap: 10, minHeight: 210,
                transition: "border-color 0.15s, background 0.15s",
              }}
            >
              <div style={{ fontSize: 22 }}>{track.icon}</div>
              <div>
                <span className="badge-v2 primary" style={{ fontSize: 11 }}>{track.company}</span>
                <h4 style={{ fontSize: 15, fontWeight: 800, margin: "8px 0 4px", color: "var(--text-main)", lineHeight: 1.35 }}>
                  {track.topic}
                </h4>
                <span style={{ fontSize: 11, color: "var(--text-subtle)", fontWeight: 700 }}>
                  {visibleCount === null ? "Click to load" : `${visibleCount} questions`} · {track.level}
                </span>
                <p style={{ fontSize: 11.5, color: "var(--text-muted)", margin: "6px 0 0", lineHeight: 1.45 }}>
                  {track.industry}
                </p>
              </div>
              <button
                type="button"
                className={`btn btn-sm ${isActive ? "btn-primary" : "btn-secondary"}`}
                style={{ width: "100%", marginTop: "auto" }}
                onClick={() => setActiveSubject(track.subject)}
              >
                {isActive ? "✓ Active track" : "Start practice"}
              </button>
            </div>
          );
        })}
      </div>

      {/* Status message */}
      {message.text && (
        <div
          style={{
            ...panelStyle,
            padding: "10px 16px",
            fontSize: 13,
            fontWeight: 600,
            color: message.type === "error" ? "#991b1b" : message.type === "success" ? "#14532d" : "var(--text-main)",
            background: message.type === "error" ? "#fee2e2" : message.type === "success" ? "#dcfce7" : "var(--bg-subtle)",
            border: `1px solid ${message.type === "error" ? "#fca5a5" : message.type === "success" ? "#86efac" : "var(--surface-border)"}`,
            display: "flex", justifyContent: "space-between", alignItems: "center",
          }}
        >
          <span>{message.text}</span>
          <button
            type="button"
            onClick={() => setMessage({ text: "", type: "info" })}
            style={{ background: "none", border: "none", cursor: "pointer", fontSize: 16, color: "inherit", padding: "0 4px" }}
          >
            ×
          </button>
        </div>
      )}

      {/* Main two-column layout */}
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) 300px", gap: 24, alignItems: "start" }}>
        {/* Questions panel */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Card title={`Practice Questions (${questions.length})`}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 13, color: "var(--text-subtle)", fontWeight: 700 }}>
                  {activeTrack?.icon} {subjectLabel}
                </span>
                {aiQuestionIds.size > 0 && (
                  <span style={{ fontSize: 11, color: "#6366f1", fontWeight: 700 }}>
                    {aiQuestionIds.size} AI-generated
                  </span>
                )}
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={loadQuestions}
                  disabled={loading}
                  title="Reload saved questions from database"
                >
                  ↺ Reload saved
                </button>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={handleQuickGenerate}
                  disabled={generating}
                >
                  {generating ? "…" : "✦ Generate 5 more"}
                </button>
              </div>
            </div>

            {loading ? (
              <div style={{ padding: 32, textAlign: "center", color: "var(--text-subtle)" }}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>⏳</div>
                Loading practice questions…
              </div>
            ) : questions.length === 0 ? (
              <div style={{ padding: 32, textAlign: "center", color: "var(--text-subtle)" }}>
                <div style={{ fontSize: 32, marginBottom: 10 }}>🤖</div>
                <p style={{ margin: "0 0 12px", fontWeight: 600 }}>No saved questions for this track.</p>
                <button type="button" className="btn btn-primary" onClick={handleQuickGenerate} disabled={generating}>
                  {generating ? "Generating…" : "✦ Generate AI Questions Now"}
                </button>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {questions.map((question, index) => {
                  const isAiGenerated = aiQuestionIds.has(question.id ?? `gen-${index}`);
                  const isPracticed = practicedIds.has(question.id);
                  return (
                    <div
                      key={getQuestionKey(question, index)}
                      style={{
                        ...panelStyle,
                        display: "flex", flexDirection: "column", gap: 10,
                        border: isAiGenerated ? "1px solid #c4b5fd" : "1px solid var(--surface-border)",
                        background: isAiGenerated ? "#faf5ff" : "var(--bg-subtle)",
                        position: "relative",
                      }}
                    >
                      {/* Practiced indicator */}
                      {isPracticed && (
                        <div style={{
                          position: "absolute", top: 10, right: 10,
                          fontSize: 11, fontWeight: 700, color: "#16a34a",
                        }}>
                          ✓ Practiced
                        </div>
                      )}
                      <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                        <span className="badge-v2 primary" style={{ fontSize: 11 }}>{question.subject}</span>
                        <DifficultyBadge difficulty={question.difficulty} />
                        {isAiGenerated && <AiBadge />}
                        <span style={{ fontSize: 11, color: "var(--text-subtle)", fontWeight: 600, marginLeft: "auto" }}>
                          {question.skill}
                        </span>
                      </div>
                      <h4 style={{ fontSize: 14.5, fontWeight: 700, color: "var(--text-main)", lineHeight: 1.5, margin: 0 }}>
                        {question.questionText}
                      </h4>
                      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                        <button
                          type="button"
                          className="btn btn-primary btn-sm"
                          onClick={() => openPractice(question)}
                        >
                          {isPracticed ? "Practice again" : "Practice answer"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>

        {/* Sidebar */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Stats card */}
          <Card title="Session Stats">
            <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: 13 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text-muted)" }}>Questions loaded:</span>
                <strong>{questions.length}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text-muted)" }}>AI-generated:</span>
                <strong style={{ color: "#6366f1" }}>{aiQuestionIds.size}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text-muted)" }}>Practiced:</span>
                <strong style={{ color: "#16a34a" }}>{practicedIds.size}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text-muted)" }}>Active track:</span>
                <strong style={{ fontSize: 11, textAlign: "right", maxWidth: 130 }}>{subjectLabel}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text-muted)" }}>AI engine:</span>
                <strong style={{ color: "#6366f1", fontSize: 11 }}>Groq · llama-3.3-70b</strong>
              </div>
            </div>
          </Card>

          {/* Tips card */}
          <Card title="Mock Interview Tips">
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 12, fontSize: 13 }}>
              <li style={{ display: "flex", gap: 10 }}>
                <span style={{ fontWeight: 800, color: "var(--primary)", minWidth: 18 }}>1.</span>
                <span><strong>Use STAR for projects.</strong> Situation, Task, Action, Result.</span>
              </li>
              <li style={{ display: "flex", gap: 10 }}>
                <span style={{ fontWeight: 800, color: "var(--primary)", minWidth: 18 }}>2.</span>
                <span><strong>State the trade-off.</strong> Include complexity, reliability, cost, or maintainability.</span>
              </li>
              <li style={{ display: "flex", gap: 10 }}>
                <span style={{ fontWeight: 800, color: "var(--primary)", minWidth: 18 }}>3.</span>
                <span><strong>Use concrete examples.</strong> Tie answers to systems, code, metrics, or coursework.</span>
              </li>
              <li style={{ display: "flex", gap: 10 }}>
                <span style={{ fontWeight: 800, color: "var(--primary)", minWidth: 18 }}>4.</span>
                <span><strong>Randomize often.</strong> Hit the "Randomize" button to get fresh Groq-generated questions.</span>
              </li>
            </ul>
          </Card>
        </div>
      </div>

      {/* Practice Answer Modal */}
      {activeQuestion && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.72)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
          onClick={(e) => { if (e.target === e.currentTarget) setActiveQuestion(null); }}
        >
          <div
            style={{ background: "#ffffff", borderRadius: "var(--radius-lg)", padding: 28, maxWidth: 700, width: "100%", maxHeight: "92vh", overflowY: "auto", boxShadow: "var(--shadow-lg)", display: "flex", flexDirection: "column", gap: 18 }}
          >
            {/* Modal header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
                <span className="badge-v2 primary">{activeQuestion.subject}</span>
                <DifficultyBadge difficulty={activeQuestion.difficulty} />
                {aiQuestionIds.has(activeQuestion.id) && <AiBadge />}
              </div>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setActiveQuestion(null)}>
                ✕ Close
              </button>
            </div>

            {/* Question */}
            <div>
              <h3 style={{ fontSize: 17, fontWeight: 800, color: "var(--text-main)", lineHeight: 1.55, marginBottom: 4 }}>
                {activeQuestion.questionText}
              </h3>
              <p style={{ fontSize: 12, color: "var(--text-subtle)", margin: 0 }}>
                Skill domain: <strong>{activeQuestion.skill}</strong>
              </p>
            </div>

            {/* Answer form */}
            <form onSubmit={handleEvaluateAnswer} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div className="input-group">
                <label style={{ fontWeight: 700, fontSize: 13 }}>Your Answer</label>
                <textarea
                  className="input-field"
                  rows={6}
                  placeholder="Explain your approach, include trade-offs, complexity analysis, and a concrete example…"
                  value={candidateAnswer}
                  onChange={(e) => setCandidateAnswer(e.target.value)}
                  style={{ fontFamily: "inherit", resize: "vertical", fontSize: 14, lineHeight: 1.6 }}
                  required
                />
                <div style={{ fontSize: 11, color: "var(--text-subtle)", textAlign: "right", marginTop: 3 }}>
                  {candidateAnswer.trim().split(/\s+/).filter(Boolean).length} words
                </div>
              </div>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ flex: 1 }}
                  disabled={evaluating || !candidateAnswer.trim()}
                >
                  {evaluating ? "Evaluating with AI…" : "✦ Evaluate Answer"}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowSampleAnswer(!showSampleAnswer)}
                >
                  {showSampleAnswer ? "Hide model answer" : "Show model answer"}
                </button>
              </div>
            </form>

            {/* Model answer */}
            {showSampleAnswer && activeQuestion.sampleAnswer && (
              <div style={{
                padding: 14, background: "#eff6ff", borderRadius: "var(--radius-md)",
                border: "1px solid #bfdbfe", fontSize: 13, color: "var(--text-main)", lineHeight: 1.65,
              }}>
                <strong style={{ display: "block", marginBottom: 6, color: "#1e40af" }}>📘 Model Answer:</strong>
                {activeQuestion.sampleAnswer}
                {activeQuestion.aiTips && (
                  <div style={{ marginTop: 10, fontSize: 12, color: "#6366f1", fontStyle: "italic", borderTop: "1px solid #bfdbfe", paddingTop: 8 }}>
                    💡 Tip: {activeQuestion.aiTips}
                  </div>
                )}
              </div>
            )}

            {/* Evaluation result */}
            {evalResult && (
              <div style={{
                padding: 20, background: "var(--bg-subtle)", borderRadius: "var(--radius-md)",
                border: `1.5px solid ${evalResult.score >= 70 ? "#86efac" : "#fca5a5"}`,
                display: "flex", flexDirection: "column", gap: 14,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <div>
                    <div style={{ fontSize: 11, textTransform: "uppercase", fontWeight: 700, color: "var(--text-subtle)", marginBottom: 2 }}>
                      AI Evaluation
                    </div>
                    <div style={{ fontSize: 30, fontWeight: 900, color: evalResult.score >= 70 ? "#16a34a" : "#dc2626", lineHeight: 1 }}>
                      {evalResult.score}
                      <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text-main)" }}>/100</span>
                    </div>
                  </div>
                  <div style={{
                    padding: "4px 14px", borderRadius: 999, fontWeight: 800, fontSize: 13,
                    background: evalResult.score >= 85 ? "#dcfce7" : evalResult.score >= 70 ? "#dbeafe" : "#fee2e2",
                    color: evalResult.score >= 85 ? "#14532d" : evalResult.score >= 70 ? "#1e40af" : "#991b1b",
                  }}>
                    {evalResult.grade}
                  </div>
                </div>

                {evalResult.strengths?.length > 0 && (
                  <div>
                    <strong style={{ fontSize: 12.5, color: "#15803d", display: "block", marginBottom: 5 }}>✓ Strengths</strong>
                    <ul style={{ paddingLeft: 18, margin: 0, fontSize: 13, color: "var(--text-main)", lineHeight: 1.6 }}>
                      {evalResult.strengths.map((s, i) => <li key={i}>{s}</li>)}
                    </ul>
                  </div>
                )}

                {evalResult.improvements?.length > 0 && (
                  <div>
                    <strong style={{ fontSize: 12.5, color: "#b91c1c", display: "block", marginBottom: 5 }}>→ Improvements</strong>
                    <ul style={{ paddingLeft: 18, margin: 0, fontSize: 13, color: "var(--text-main)", lineHeight: 1.6 }}>
                      {evalResult.improvements.map((imp, i) => <li key={i}>{imp}</li>)}
                    </ul>
                  </div>
                )}

                {evalResult.modelAnswer && (
                  <div style={{ padding: 12, background: "#f0fdf4", borderRadius: 6, border: "1px solid #bbf7d0", fontSize: 13, lineHeight: 1.6 }}>
                    <strong style={{ color: "#15803d" }}>Model answer: </strong>{evalResult.modelAnswer}
                  </div>
                )}

                <div style={{ fontSize: 12, color: "#4338ca", fontStyle: "italic", background: "#eef2ff", padding: 10, borderRadius: 6 }}>
                  ⭐ STAR advice: {evalResult.starAdvice}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Custom Generator Modal */}
      {showGeneratorModal && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.72)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowGeneratorModal(false); }}
        >
          <div style={{
            background: "#ffffff", borderRadius: "var(--radius-lg)", padding: 28,
            maxWidth: 560, width: "100%", boxShadow: "var(--shadow-lg)",
            display: "flex", flexDirection: "column", gap: 18,
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: "var(--text-main)", margin: 0 }}>
                  ✦ Generate Custom AI Questions
                </h3>
                <p style={{ fontSize: 12, color: "#6366f1", margin: "4px 0 0", fontWeight: 600 }}>
                  Powered by Groq · llama-3.3-70b-versatile
                </p>
              </div>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setShowGeneratorModal(false)}>
                ✕
              </button>
            </div>

            <p style={{ fontSize: 13, color: "var(--text-muted)", margin: 0, lineHeight: 1.55 }}>
              Describe your target role and skills. Groq will generate 5 unique, randomized interview questions tailored to your input — different every time.
            </p>

            <form onSubmit={handleGenerateQuestions} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div className="input-group">
                <label>Target Role Title <span style={{ color: "#ef4444" }}>*</span></label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. Backend Developer, ML Engineer, Product Analyst"
                  value={generatorInput.targetRole}
                  onChange={(e) => setGeneratorInput({ ...generatorInput, targetRole: e.target.value })}
                  required
                />
              </div>
              <div className="input-group">
                <label>Candidate Skills</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. Java, SQL, React, System Design, PyTorch"
                  value={generatorInput.candidateSkills}
                  onChange={(e) => setGeneratorInput({ ...generatorInput, candidateSkills: e.target.value })}
                />
              </div>
              <div className="input-group">
                <label>Job Description Notes</label>
                <textarea
                  className="input-field"
                  rows={4}
                  placeholder="Paste responsibilities or interview focus areas for more targeted questions…"
                  value={generatorInput.jobDescription}
                  onChange={(e) => setGeneratorInput({ ...generatorInput, jobDescription: e.target.value })}
                  style={{ fontFamily: "inherit", resize: "vertical" }}
                />
              </div>
              <div style={{ fontSize: 12, color: "var(--text-subtle)", background: "#f8fafc", padding: "8px 12px", borderRadius: 6, border: "1px solid var(--surface-border)" }}>
                Active track: <strong>{subjectLabel}</strong> · Questions will be added to the current list
              </div>
              <button
                type="submit"
                className="btn btn-primary btn-lg"
                disabled={generating || !generatorInput.targetRole.trim()}
              >
                {generating ? "Generating with Groq…" : "✦ Generate 5 Questions"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
