import React, { useState } from "react";

// ---- helpers ----------------------------------------------------------------
function scoreColor(s) {
  return s >= 85 ? "#16a34a" : s >= 70 ? "#0a66c2" : s >= 50 ? "#d97706" : "#dc2626";
}
function scoreBg(s) {
  return s >= 85 ? "#ecfdf5" : s >= 70 ? "#eff6ff" : s >= 50 ? "#fffbeb" : "#fef2f2";
}
function scoreBorder(s) {
  return s >= 85 ? "#a7f3d0" : s >= 70 ? "#bfdbfe" : s >= 50 ? "#fde68a" : "#fecaca";
}
function gradeLabel(s) {
  return s >= 85 ? "Excellent" : s >= 70 ? "Good" : s >= 50 ? "Needs Work" : "Poor";
}
function pad(n) { return String(n).padStart(2, "0"); }

// Circular SVG score ring
function ScoreRing({ score, size = 110 }) {
  const r = (size - 14) / 2;
  const circ = 2 * Math.PI * r;
  const fill = Math.min(score / 100, 1) * circ;
  const c = scoreColor(score);
  return (
    <svg width={size} height={size} style={{ display: "block" }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke="#e2e8f0" strokeWidth={7} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke={c} strokeWidth={7}
        strokeDasharray={`${fill} ${circ}`}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      <text x={size / 2} y={size / 2 - 4} textAnchor="middle"
        fill={c} fontSize={size * 0.2} fontWeight={800}>{score}</text>
      <text x={size / 2} y={size / 2 + 13} textAnchor="middle"
        fill="#64748b" fontSize={size * 0.09}>out of 100</text>
    </svg>
  );
}

// Horizontal score bar — light theme
function ScoreBar({ score }) {
  const c = scoreColor(score);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{ flex: 1, height: 6, background: "#e2e8f0",
        borderRadius: 99, overflow: "hidden" }}>
        <div style={{ width: `${score}%`, height: "100%", background: c,
          borderRadius: 99, transition: "width 0.7s ease" }} />
      </div>
      <span style={{ fontSize: 12, fontWeight: 700, color: c, minWidth: 32, textAlign: "right" }}>
        {score}
      </span>
    </div>
  );
}

// Expandable per-question card — light theme matching portal
function QuestionCard({ q, index }) {
  const [open, setOpen] = useState(false);
  const answered = q.score != null;
  const c = answered ? scoreColor(q.score) : "#94a3b8";
  const bg = answered ? scoreBg(q.score) : "#f8fafc";
  const border = answered ? scoreBorder(q.score) : "#e2e8f0";

  return (
    <div style={{
      background: "#fff",
      border: `1px solid ${open ? "#0a66c2" : "#e2e8f0"}`,
      borderRadius: 12, overflow: "hidden",
      boxShadow: open ? "0 2px 12px rgba(10,102,194,0.08)" : "0 1px 3px rgba(15,23,42,0.04)",
      transition: "border-color 0.15s, box-shadow 0.15s",
    }}>
      {/* Header row */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: "100%", display: "flex", alignItems: "center", gap: 12,
          padding: "13px 16px", background: "none", border: "none",
          cursor: "pointer", textAlign: "left",
        }}
      >
        {/* Number badge */}
        <div style={{
          width: 30, height: 30, borderRadius: "50%",
          background: bg, border: `1.5px solid ${border}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 12, fontWeight: 700, color: c, flexShrink: 0,
        }}>
          {index + 1}
        </div>

        {/* Question snippet */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#0f172a",
            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {q.questionText}
          </div>
          <div style={{ display: "flex", gap: 6, marginTop: 3, flexWrap: "wrap" }}>
            {q.skill && (
              <span style={{ fontSize: 11, color: "#475569",
                background: "#f1f5f9", borderRadius: 4, padding: "1px 7px",
                border: "1px solid #e2e8f0" }}>
                {q.skill}
              </span>
            )}
            {q.difficulty && (
              <span style={{ fontSize: 11, fontWeight: 600, borderRadius: 4, padding: "1px 7px",
                color: q.difficulty === "ADVANCED" ? "#b91c1c"
                  : q.difficulty === "INTERMEDIATE" ? "#92400e" : "#166534",
                background: q.difficulty === "ADVANCED" ? "#fef2f2"
                  : q.difficulty === "INTERMEDIATE" ? "#fffbeb" : "#f0fdf4",
                border: `1px solid ${q.difficulty === "ADVANCED" ? "#fecaca"
                  : q.difficulty === "INTERMEDIATE" ? "#fde68a" : "#bbf7d0"}`,
              }}>
                {q.difficulty}
              </span>
            )}
          </div>
        </div>

        {/* Score + chevron */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
          {answered ? (
            <span style={{ fontSize: 13, fontWeight: 700, color: c,
              background: bg, border: `1px solid ${border}`,
              borderRadius: 6, padding: "2px 10px" }}>
              {q.score}/100
            </span>
          ) : (
            <span style={{ fontSize: 12, color: "#94a3b8", fontStyle: "italic" }}>
              Not answered
            </span>
          )}
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
            stroke="#94a3b8" strokeWidth="2">
            <polyline points={open ? "18 15 12 9 6 15" : "6 9 12 15 18 9"} />
          </svg>
        </div>
      </button>

      {/* Expanded detail */}
      {open && (
        <div style={{ borderTop: "1px solid #f1f5f9",
          padding: "16px 18px 18px", display: "flex", flexDirection: "column", gap: 14,
          background: "#fafafa" }}>

          {answered && (
            <div>
              <ScoreBar score={q.score} />
              <div style={{ marginTop: 4, fontSize: 12, color: "#64748b" }}>
                Grade: <strong style={{ color: c }}>{q.grade || gradeLabel(q.score)}</strong>
              </div>
            </div>
          )}

          {q.candidateAnswer && (
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: "#64748b",
                textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 6 }}>
                Your Answer
              </div>
              <div style={{ fontSize: 13, color: "#334155", lineHeight: 1.65,
                background: "#fff", borderRadius: 8, padding: "10px 14px",
                border: "1px solid #e2e8f0", borderLeft: "3px solid #94a3b8" }}>
                {q.candidateAnswer}
              </div>
            </div>
          )}

          {q.strengths?.length > 0 && (
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: "#059669",
                textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 6 }}>
                ✓ Strengths
              </div>
              <ul style={{ margin: 0, paddingLeft: 18, display: "flex", flexDirection: "column", gap: 4 }}>
                {q.strengths.map((s, i) => (
                  <li key={i} style={{ fontSize: 13, color: "#166534" }}>{s}</li>
                ))}
              </ul>
            </div>
          )}

          {q.improvements?.length > 0 && (
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: "#d97706",
                textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 6 }}>
                △ Areas to Improve
              </div>
              <ul style={{ margin: 0, paddingLeft: 18, display: "flex", flexDirection: "column", gap: 4 }}>
                {q.improvements.map((s, i) => (
                  <li key={i} style={{ fontSize: 13, color: "#92400e" }}>{s}</li>
                ))}
              </ul>
            </div>
          )}

          {q.modelAnswer && (
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: "#0a66c2",
                textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 6 }}>
                💡 Model Answer
              </div>
              <div style={{ fontSize: 13, color: "#1e3a8a", lineHeight: 1.65,
                background: "#eff6ff", borderRadius: 8, padding: "10px 14px",
                border: "1px solid #bfdbfe", borderLeft: "3px solid #2563eb" }}>
                {q.modelAnswer}
              </div>
            </div>
          )}

          {q.starAdvice && (
            <div style={{ fontSize: 12, color: "#7c3aed", fontStyle: "italic",
              background: "#f5f3ff", borderRadius: 8,
              padding: "8px 12px", border: "1px solid #ddd6fe",
              borderLeft: "3px solid #7c3aed" }}>
              ⭐ STAR: {q.starAdvice}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================================
// INTERVIEW REPORT
// Renders inline inside dashboard-content — no fixed/full-screen takeover.
// ============================================================
export default function InterviewReport({
  open,
  session,
  summary,
  limitReason,
  answeredCount = 0,
  maxQuestions = 5,
  onRetry,
}) {
  const [activeTab, setActiveTab] = useState("overview");

  if (!open) return null;

  const overallScore = summary?.overallScore ?? 0;
  const grade = gradeLabel(overallScore);
  const color = scoreColor(overallScore);
  const questions = session?.questions ?? [];
  const answeredQs = questions.filter(q => q.score != null);
  const totalSecs = session?.totalDurationSeconds ?? 0;
  const isTimeTrigger = limitReason === "time";
  const isManual = limitReason === "manual";

  // Per-difficulty breakdown
  const avgByDifficulty = { BEGINNER: [], INTERMEDIATE: [], ADVANCED: [] };
  answeredQs.forEach(q => {
    const d = (q.difficulty || "INTERMEDIATE").toUpperCase();
    if (avgByDifficulty[d]) avgByDifficulty[d].push(q.score);
  });
  const diffStats = Object.entries(avgByDifficulty)
    .filter(([, scores]) => scores.length > 0)
    .map(([d, scores]) => ({
      label: d,
      avg: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
      count: scores.length,
    }));

  const Tab = ({ id, label }) => (
    <button
      onClick={() => setActiveTab(id)}
      style={{
        padding: "8px 18px", border: "none", cursor: "pointer",
        background: activeTab === id ? "#fff" : "transparent",
        color: activeTab === id ? "#0a66c2" : "#64748b",
        borderRadius: "8px 8px 0 0",
        borderBottom: activeTab === id ? "2px solid #0a66c2" : "2px solid transparent",
        fontWeight: activeTab === id ? 700 : 400,
        fontSize: 14, transition: "all 0.15s",
      }}
    >
      {label}
    </button>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>

      {/* ---- Page header with back button ---- */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        flexWrap: "wrap", gap: 12, marginBottom: 20,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          {/* Back to setup */}
          <button
            onClick={onRetry}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "7px 14px", background: "#fff",
              border: "1px solid #e2e8f0", borderRadius: 8,
              color: "#475569", fontSize: 13, fontWeight: 600,
              cursor: "pointer", boxShadow: "0 1px 3px rgba(15,23,42,0.06)",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.5">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            New Interview
          </button>

          <div>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "#0f172a" }}>
              Interview Report
            </h2>
            <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>
              {session?.targetRole || "AI Mock Interview"} · {answeredCount}/{maxQuestions} questions ·{" "}
              {pad(Math.floor(totalSecs / 60))}:{pad(totalSecs % 60)} used
            </div>
          </div>
        </div>

        {/* End reason badge */}
        <div style={{
          background: isManual ? "#f8fafc" : isTimeTrigger ? "#fffbeb" : "#f0fdf4",
          border: `1px solid ${isManual ? "#e2e8f0" : isTimeTrigger ? "#fde68a" : "#bbf7d0"}`,
          borderRadius: 8, padding: "6px 14px", fontSize: 12, fontWeight: 600,
          color: isManual ? "#475569" : isTimeTrigger ? "#92400e" : "#166534",
        }}>
          {isManual ? "⏹ Session ended" : isTimeTrigger ? "⏱ Time limit reached" : "🎯 All questions completed"}
        </div>
      </div>

      {/* ---- Score hero row ---- */}
      <div style={{
        background: "#fff", border: "1px solid #e2e8f0", borderRadius: 14,
        padding: "24px 28px", marginBottom: 16,
        display: "flex", gap: 32, alignItems: "center", flexWrap: "wrap",
        boxShadow: "0 1px 4px rgba(15,23,42,0.06)",
      }}>
        {/* Ring */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
          <ScoreRing score={overallScore} size={110} />
          <div style={{ fontSize: 13, fontWeight: 700, color }}>
            {grade}
          </div>
        </div>

        {/* Divider */}
        <div style={{ width: 1, height: 80, background: "#e2e8f0", flexShrink: 0 }} />

        {/* Stats row */}
        <div style={{ display: "flex", gap: 28, flexWrap: "wrap", flex: 1 }}>
          {[
            { label: "Questions Answered", value: answeredCount },
            { label: "Time Used", value: `${pad(Math.floor(totalSecs/60))}:${pad(totalSecs%60)}` },
            { label: "Avg Score", value: answeredQs.length > 0
                ? Math.round(answeredQs.reduce((a,q) => a + (q.score ?? 0), 0) / answeredQs.length)
                : 0 },
            { label: "Scored ≥ 70", value: answeredQs.filter(q => (q.score ?? 0) >= 70).length },
          ].map(({ label, value }) => (
            <div key={label} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: "#0f172a" }}>{value}</div>
              <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Difficulty bars */}
        {diffStats.length > 0 && (
          <>
            <div style={{ width: 1, height: 80, background: "#e2e8f0", flexShrink: 0 }} />
            <div style={{ display: "flex", flexDirection: "column", gap: 8, minWidth: 180 }}>
              {diffStats.map(d => (
                <div key={d.label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 11, color: "#64748b", minWidth: 96, fontWeight: 500 }}>
                    {d.label} ×{d.count}
                  </span>
                  <div style={{ flex: 1 }}>
                    <ScoreBar score={d.avg} />
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* ---- Tab bar ---- */}
      <div style={{
        display: "flex", gap: 0, borderBottom: "1px solid #e2e8f0",
        marginBottom: 16, background: "#f8fafc", borderRadius: "10px 10px 0 0",
        padding: "0 4px",
      }}>
        <Tab id="overview" label="📊 Overview & Feedback" />
        <Tab id="questions" label={`📝 Questions (${answeredQs.length})`} />
      </div>

      {/* ---- Tab content ---- */}
      <div>

        {/* OVERVIEW TAB */}
        {activeTab === "overview" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            {/* AI Feedback narrative */}
            {summary?.summaryFeedback && (
              <div style={{
                background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12,
                padding: "18px 20px",
                boxShadow: "0 1px 3px rgba(15,23,42,0.04)",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                  <span style={{ fontSize: 16 }}>🤖</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>
                    AI Interviewer Feedback
                  </span>
                </div>
                <p style={{ margin: 0, fontSize: 14, lineHeight: 1.75, color: "#334155" }}>
                  {summary.summaryFeedback}
                </p>
              </div>
            )}

            {/* Score per question */}
            {answeredQs.length > 0 && (
              <div style={{
                background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12,
                padding: "18px 20px", boxShadow: "0 1px 3px rgba(15,23,42,0.04)",
              }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", marginBottom: 14 }}>
                  Score per Question
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {answeredQs.map((q, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{
                        width: 24, height: 24, borderRadius: "50%",
                        background: scoreBg(q.score), border: `1.5px solid ${scoreBorder(q.score)}`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 11, fontWeight: 700, color: scoreColor(q.score), flexShrink: 0,
                      }}>{i + 1}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 12, color: "#64748b", marginBottom: 4,
                          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {q.questionText}
                        </div>
                        <ScoreBar score={q.score} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Strengths & Improvements grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div style={{
                background: "#fff", border: "1px solid #a7f3d0",
                borderRadius: 12, padding: "16px 18px",
                boxShadow: "0 1px 3px rgba(15,23,42,0.04)",
              }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#059669", marginBottom: 10 }}>
                  ✓ What You Did Well
                </div>
                {answeredQs.flatMap(q => q.strengths ?? []).length > 0 ? (
                  <ul style={{ margin: 0, paddingLeft: 16, display: "flex", flexDirection: "column", gap: 6 }}>
                    {answeredQs.flatMap(q => q.strengths ?? []).slice(0, 5).map((s, i) => (
                      <li key={i} style={{ fontSize: 13, color: "#166534", lineHeight: 1.5 }}>{s}</li>
                    ))}
                  </ul>
                ) : (
                  <p style={{ margin: 0, fontSize: 13, color: "#94a3b8", fontStyle: "italic" }}>
                    Answer questions to see strengths
                  </p>
                )}
              </div>

              <div style={{
                background: "#fff", border: "1px solid #fde68a",
                borderRadius: 12, padding: "16px 18px",
                boxShadow: "0 1px 3px rgba(15,23,42,0.04)",
              }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#d97706", marginBottom: 10 }}>
                  △ Areas to Improve
                </div>
                {answeredQs.flatMap(q => q.improvements ?? []).length > 0 ? (
                  <ul style={{ margin: 0, paddingLeft: 16, display: "flex", flexDirection: "column", gap: 6 }}>
                    {answeredQs.flatMap(q => q.improvements ?? []).slice(0, 5).map((s, i) => (
                      <li key={i} style={{ fontSize: 13, color: "#92400e", lineHeight: 1.5 }}>{s}</li>
                    ))}
                  </ul>
                ) : (
                  <p style={{ margin: 0, fontSize: 13, color: "#94a3b8", fontStyle: "italic" }}>
                    Answer questions to see improvements
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* QUESTIONS TAB */}
        {activeTab === "questions" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <p style={{ margin: "0 0 8px", fontSize: 13, color: "#64748b" }}>
              Click any question to expand the full evaluation, your answer, model answer, and STAR advice.
            </p>
            {questions.map((q, i) => (
              <QuestionCard key={i} q={q} index={i} />
            ))}
            {questions.length === 0 && (
              <div style={{ color: "#94a3b8", textAlign: "center", padding: "40px 0", fontSize: 14 }}>
                No questions were loaded for this session.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
