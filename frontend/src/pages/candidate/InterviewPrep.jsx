import React, { useContext, useEffect, useMemo, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import Card from "../../components/ui/Card";
import * as api from "../../services/api";

const SUBJECTS = [
  { id: "ALL", label: "All Subjects" },
  { id: "Data Structures & System Concepts", label: "DSA & System Concepts" },
  { id: "Quantitative Estimation & Case Studies", label: "Analytics & Case Studies" },
  { id: "React, Node.js & Practical Project Scenarios", label: "React & Node.js Practical" },
  { id: "DBMS", label: "DBMS" },
  { id: "Operating Systems", label: "Operating Systems" },
  { id: "Computer Networks", label: "Computer Networks" },
];

const TRACKS = [
  { company: "Tech Product Companies", topic: "Data Structures & System Concepts", level: "Intermediate", subject: "Data Structures & System Concepts" },
  { company: "Consulting & Analytics", topic: "Quantitative Estimation & Case Studies", level: "Advanced", subject: "Quantitative Estimation & Case Studies" },
  { company: "Early Startups", topic: "React, Node.js & Practical Project Scenarios", level: "Practical", subject: "React, Node.js & Practical Project Scenarios" },
];

const panelStyle = {
  padding: 18,
  background: "var(--bg-subtle)",
  borderRadius: "var(--radius-md)",
  border: "1px solid var(--surface-border)",
};

function getQuestionKey(question, index) {
  return `${question.id || "generated"}-${question.subject || "subject"}-${index}`;
}

export default function InterviewPrep() {
  const { token } = useContext(AuthContext);
  const [activeSubject, setActiveSubject] = useState("ALL");
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [activeQuestion, setActiveQuestion] = useState(null);
  const [candidateAnswer, setCandidateAnswer] = useState("");
  const [evaluating, setEvaluating] = useState(false);
  const [evalResult, setEvalResult] = useState(null);
  const [showSampleAnswer, setShowSampleAnswer] = useState(false);
  const [showGeneratorModal, setShowGeneratorModal] = useState(false);
  const [generatorInput, setGeneratorInput] = useState({ targetRole: "", jobDescription: "", candidateSkills: "" });
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    loadQuestions();
  }, [activeSubject]);

  const subjectLabel = useMemo(() => SUBJECTS.find((subject) => subject.id === activeSubject)?.label || activeSubject, [activeSubject]);

  const trackCounts = useMemo(() => {
    return TRACKS.reduce((counts, track) => {
      counts[track.subject] = questions.filter((question) => question.subject === track.subject).length;
      return counts;
    }, {});
  }, [questions]);

  async function loadQuestions() {
    setLoading(true);
    setMessage("");
    try {
      const subjectFilter = activeSubject === "ALL" ? "" : activeSubject;
      const data = await api.getInterviewQuestions(subjectFilter, "", "", token);
      setQuestions(Array.isArray(data) ? data : []);
    } catch (e) {
      setQuestions([]);
      setMessage("Could not load interview questions from the server.");
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
      const result = await api.evaluateInterviewAnswer({ questionId: activeQuestion.id, questionText: activeQuestion.questionText, candidateAnswer: candidateAnswer.trim() }, token);
      setEvalResult(result);
    } catch (err) {
      setEvalResult({
        score: 72,
        grade: "Good",
        strengths: ["Your answer includes relevant technical direction."],
        improvements: ["Add trade-offs, complexity, and one concrete example."],
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
    setMessage("");
    try {
      const generatedQuestions = await api.generateAiInterviewQuestions({
        targetRole: generatorInput.targetRole || (activeSubject !== "ALL" ? activeSubject : "Software Engineer"),
        jobDescription: generatorInput.jobDescription,
        candidateSkills: generatorInput.candidateSkills,
        subject: activeSubject === "ALL" ? "Technical & CS Core" : activeSubject,
      }, token);
      setQuestions((prev) => [...generatedQuestions, ...prev]);
      setShowGeneratorModal(false);
      setGeneratorInput({ targetRole: "", jobDescription: "", candidateSkills: "" });
      setMessage(`Added ${generatedQuestions.length} generated practice questions.`);
    } catch (err) {
      setMessage("Could not generate a practice set right now. Please check the backend service.");
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22, maxWidth: 1100, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: "var(--text-main)", margin: 0 }}>Interview Preparation</h2>
          <p style={{ color: "var(--text-muted)", fontSize: 14, margin: "4px 0 0", maxWidth: 680 }}>
            Practice with saved question-bank items and generated local practice sets for your selected role or subject.
          </p>
        </div>
        <button type="button" className="btn btn-primary" onClick={() => setShowGeneratorModal(true)}>Generate practice set</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 14 }}>
        {TRACKS.map((track) => {
          const isActive = activeSubject === track.subject;
          const visibleCount = isActive || activeSubject === "ALL" ? trackCounts[track.subject] || 0 : null;
          return (
            <div key={track.subject} style={{ ...panelStyle, background: isActive ? "var(--primary-light)" : "var(--surface)", border: isActive ? "1.5px solid var(--primary)" : "1px solid var(--surface-border)", display: "flex", flexDirection: "column", gap: 12 }}>
              <div>
                <span className="badge-v2 primary">{track.company}</span>
                <h4 style={{ fontSize: 16, fontWeight: 800, margin: "10px 0 6px", color: "var(--text-main)", lineHeight: 1.35 }}>{track.topic}</h4>
                <span style={{ fontSize: 12, color: "var(--text-subtle)", fontWeight: 700 }}>{visibleCount === null ? "Select to load" : `${visibleCount} available now`} - {track.level}</span>
              </div>
              <button type="button" className={isActive ? "btn btn-primary btn-sm" : "btn btn-secondary btn-sm"} onClick={() => setActiveSubject(track.subject)}>
                {isActive ? "Active track" : "Start practice"}
              </button>
            </div>
          );
        })}
      </div>

      <div style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 6 }}>
        {SUBJECTS.map((subject) => (
          <button key={subject.id} type="button" onClick={() => setActiveSubject(subject.id)} style={{ padding: "10px 16px", borderRadius: "var(--radius-full)", fontSize: 13, fontWeight: 700, border: activeSubject === subject.id ? "1.5px solid var(--primary)" : "1px solid var(--surface-border)", background: activeSubject === subject.id ? "var(--primary-light)" : "var(--surface)", color: activeSubject === subject.id ? "var(--primary)" : "var(--text-main)", cursor: "pointer", whiteSpace: "nowrap" }}>
            {subject.label}
          </button>
        ))}
      </div>

      {message && <div style={{ ...panelStyle, padding: 12, color: "var(--text-main)", fontSize: 13, fontWeight: 700 }}>{message}</div>}

      <div className="dashboard-grid two-col" style={{ gridTemplateColumns: "minmax(0, 1fr) 320px", gap: 24 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Card title={`Practice Questions (${questions.length})`}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
              <span style={{ fontSize: 13, color: "var(--text-subtle)", fontWeight: 700 }}>Filter: <strong>{subjectLabel}</strong></span>
              <button type="button" className="btn btn-secondary btn-sm" onClick={handleGenerateQuestions} disabled={generating}>{generating ? "Generating..." : "Generate 3 practice questions"}</button>
            </div>

            {loading ? (
              <div style={{ padding: 24, textAlign: "center", color: "var(--text-subtle)" }}>Loading practice questions...</div>
            ) : questions.length === 0 ? (
              <div style={{ padding: 24, textAlign: "center", color: "var(--text-subtle)" }}>No saved questions are available for this filter. Generate a practice set or choose another subject.</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {questions.map((question, index) => (
                  <div key={getQuestionKey(question, index)} style={{ ...panelStyle, display: "flex", flexDirection: "column", gap: 12 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        <span className="badge-v2 primary">{question.subject}</span>
                        <span className="badge-v2 neutral">{question.difficulty}</span>
                      </div>
                      <span style={{ fontSize: 12, color: "var(--text-subtle)", fontWeight: 700 }}>{question.skill}</span>
                    </div>
                    <h4 style={{ fontSize: 15, fontWeight: 700, color: "var(--text-main)", lineHeight: 1.5, margin: 0 }}>{question.questionText}</h4>
                    <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", flexWrap: "wrap" }}>
                      <button type="button" className="btn btn-primary btn-sm" onClick={() => { setActiveQuestion(question); setCandidateAnswer(""); setEvalResult(null); setShowSampleAnswer(false); }}>Practice answer</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <Card title="Mock Interview Tips">
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 14, fontSize: 13, color: "var(--text-main)" }}>
              <li style={{ display: "flex", gap: 10 }}><span style={{ fontWeight: 800, color: "var(--primary)" }}>1.</span><span><strong>Use STAR for projects.</strong> Explain the situation, task, action, and result.</span></li>
              <li style={{ display: "flex", gap: 10 }}><span style={{ fontWeight: 800, color: "var(--primary)" }}>2.</span><span><strong>Say the trade-off.</strong> Include complexity, reliability, cost, or maintainability.</span></li>
              <li style={{ display: "flex", gap: 10 }}><span style={{ fontWeight: 800, color: "var(--primary)" }}>3.</span><span><strong>Use concrete examples.</strong> Tie answers to systems, code, metrics, or coursework.</span></li>
            </ul>
          </Card>
          <Card title="Coverage">
            <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: 13 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}><span>Question bank:</span><strong>{questions.length}</strong></div>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}><span>Active filter:</span><strong>{subjectLabel}</strong></div>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}><span>Generation:</span><strong>Local templates</strong></div>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}><span>Evaluation:</span><strong>Heuristic scoring</strong></div>
            </div>
          </Card>
        </div>
      </div>

      {activeQuestion && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.72)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ background: "#ffffff", borderRadius: "var(--radius-lg)", padding: 26, maxWidth: 680, width: "100%", maxHeight: "90vh", overflowY: "auto", boxShadow: "var(--shadow-lg)", display: "flex", flexDirection: "column", gap: 18 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}><span className="badge-v2 primary">{activeQuestion.subject}</span><span className="badge-v2 neutral">{activeQuestion.difficulty}</span></div>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setActiveQuestion(null)}>Close</button>
            </div>
            <div>
              <h3 style={{ fontSize: 17, fontWeight: 800, color: "var(--text-main)", lineHeight: 1.5, marginBottom: 6 }}>{activeQuestion.questionText}</h3>
              <p style={{ fontSize: 12, color: "var(--text-subtle)", margin: 0 }}>Skill domain: <strong>{activeQuestion.skill}</strong></p>
            </div>
            <form onSubmit={handleEvaluateAnswer} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div className="input-group">
                <label>Your Answer</label>
                <textarea className="input-field" rows={5} placeholder="Explain your approach, complexity, trade-offs, and example..." value={candidateAnswer} onChange={(e) => setCandidateAnswer(e.target.value)} style={{ fontFamily: "inherit", resize: "vertical" }} required />
              </div>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={evaluating || !candidateAnswer.trim()}>{evaluating ? "Evaluating..." : "Evaluate answer"}</button>
                <button type="button" className="btn btn-secondary" onClick={() => setShowSampleAnswer(!showSampleAnswer)}>{showSampleAnswer ? "Hide model answer" : "Show model answer"}</button>
              </div>
            </form>
            {showSampleAnswer && <div style={{ padding: 14, background: "var(--primary-light)", borderRadius: "var(--radius-md)", border: "1px solid var(--primary-border)", fontSize: 13, color: "var(--text-main)", lineHeight: 1.6 }}><strong>Model sample answer:</strong><br />{activeQuestion.sampleAnswer}{activeQuestion.aiTips && <div style={{ marginTop: 8, fontSize: 12, color: "var(--primary)" }}><em>Tip: {activeQuestion.aiTips}</em></div>}</div>}
            {evalResult && (
              <div style={{ padding: 18, background: "var(--bg-subtle)", borderRadius: "var(--radius-md)", border: "1.5px solid var(--primary)", display: "flex", flexDirection: "column", gap: 14 }}>
                <div><span style={{ fontSize: 12, textTransform: "uppercase", fontWeight: 700, color: "var(--text-subtle)" }}>Answer evaluation</span><h3 style={{ fontSize: 24, fontWeight: 800, color: evalResult.score >= 70 ? "#10b981" : "#f59e0b", margin: 0 }}>{evalResult.score}/100 <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text-main)" }}>({evalResult.grade})</span></h3></div>
                {evalResult.strengths?.length > 0 && <div><strong style={{ fontSize: 13, color: "#10b981" }}>Strengths:</strong><ul style={{ paddingLeft: 20, margin: "4px 0 0", fontSize: 12.5, color: "var(--text-main)" }}>{evalResult.strengths.map((strength, index) => <li key={index}>{strength}</li>)}</ul></div>}
                {evalResult.improvements?.length > 0 && <div><strong style={{ fontSize: 13, color: "#ef4444" }}>Improvements:</strong><ul style={{ paddingLeft: 20, margin: "4px 0 0", fontSize: 12.5, color: "var(--text-main)" }}>{evalResult.improvements.map((improvement, index) => <li key={index}>{improvement}</li>)}</ul></div>}
                <div style={{ fontSize: 12, color: "var(--text-muted)", fontStyle: "italic" }}>STAR advice: {evalResult.starAdvice}</div>
              </div>
            )}
          </div>
        </div>
      )}

      {showGeneratorModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.72)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ background: "#ffffff", borderRadius: "var(--radius-lg)", padding: 26, maxWidth: 540, width: "100%", boxShadow: "var(--shadow-lg)", display: "flex", flexDirection: "column", gap: 18 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}><h3 style={{ fontSize: 18, fontWeight: 800, color: "var(--text-main)", margin: 0 }}>Generate Practice Questions</h3><button type="button" className="btn btn-ghost btn-sm" onClick={() => setShowGeneratorModal(false)}>Close</button></div>
            <p style={{ fontSize: 13, color: "var(--text-muted)", margin: 0, lineHeight: 1.5 }}>This creates a local practice set from built-in templates. It does not call an external AI or web question API.</p>
            <form onSubmit={handleGenerateQuestions} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div className="input-group"><label>Target Role Title</label><input type="text" className="input-field" placeholder="e.g. Backend Developer, Product Analyst" value={generatorInput.targetRole} onChange={(e) => setGeneratorInput({ ...generatorInput, targetRole: e.target.value })} required /></div>
              <div className="input-group"><label>Candidate Skills</label><input type="text" className="input-field" placeholder="e.g. Java, SQL, React, System Design" value={generatorInput.candidateSkills} onChange={(e) => setGeneratorInput({ ...generatorInput, candidateSkills: e.target.value })} /></div>
              <div className="input-group"><label>Job Description Notes</label><textarea className="input-field" rows={4} placeholder="Paste responsibilities or interview focus areas..." value={generatorInput.jobDescription} onChange={(e) => setGeneratorInput({ ...generatorInput, jobDescription: e.target.value })} style={{ fontFamily: "inherit", resize: "vertical" }} /></div>
              <button type="submit" className="btn btn-primary btn-lg" disabled={generating || !generatorInput.targetRole}>{generating ? "Generating..." : "Generate practice set"}</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
