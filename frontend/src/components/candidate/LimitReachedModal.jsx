import React from "react";

const DIFFICULTY_COLOR = {
  EXCELLENT: "#16a34a",
  GOOD: "#2563eb",
  "NEEDS REVIEW": "#d97706",
};

function gradeColor(grade) {
  return DIFFICULTY_COLOR[(grade || "").toUpperCase()] || "#64748b";
}

function ScoreBadge({ score, grade }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        background: "#f1f5f9",
        border: "1px solid #e2e8f0",
        borderRadius: 8,
        padding: "3px 10px",
        fontSize: 13,
        fontWeight: 600,
        color: gradeColor(grade),
      }}
    >
      {score}/100 &middot; {grade}
    </span>
  );
}

/**
 * LimitReachedModal
 *
 * Shown when the freemium dual-trigger limit fires (5 questions OR 5 minutes).
 * Displays per-question scores, AI summary feedback, overall score, and a
 * "Upgrade to Pro" CTA.
 *
 * Props:
 *   open          — boolean, controls visibility
 *   limitReason   — "questions" | "time"
 *   summary       — { overallScore, summaryFeedback, limitReason }
 *   questions     — array of MockQuestionEntry (with answers/scores)
 *   answeredCount — number of questions answered
 *   maxQuestions  — 5
 *   onClose       — called when user dismisses / starts new session
 *   onUpgrade     — called when user clicks Upgrade CTA
 */
export default function LimitReachedModal({
  open,
  limitReason,
  summary,
  questions = [],
  answeredCount = 0,
  maxQuestions = 5,
  onClose,
  onUpgrade,
}) {
  if (!open) return null;

  const isTimeTrigger = limitReason === "time";
  const overallScore = summary?.overallScore ?? 0;
  const scoreGrade = overallScore >= 85 ? "Excellent" : overallScore >= 70 ? "Good" : "Needs Review";
  const answeredQuestions = questions.filter((q) => q.score != null);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "rgba(15,23,42,0.65)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
      onClick={(e) => e.target === e.currentTarget && onClose?.()}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 16,
          boxShadow: "0 20px 60px rgba(0,0,0,0.22)",
          width: "100%",
          maxWidth: 640,
          maxHeight: "90vh",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header */}
        <div
          style={{
            background: "linear-gradient(135deg, #1e40af 0%, #7c3aed 100%)",
            borderRadius: "16px 16px 0 0",
            padding: "28px 28px 20px",
            color: "#fff",
          }}
        >
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontSize: 13, opacity: 0.8, marginBottom: 6, textTransform: "uppercase", letterSpacing: 1 }}>
                Free Trial Complete
              </div>
              <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>
                {isTimeTrigger
                  ? "⏱ 5-Minute Free Cap Reached"
                  : "🎯 5 Questions Completed"}
              </h2>
              <p style={{ margin: "8px 0 0", opacity: 0.85, fontSize: 14 }}>
                {isTimeTrigger
                  ? `You hit the 5-minute free trial limit after answering ${answeredCount}/${maxQuestions} question${answeredCount !== 1 ? "s" : ""}.`
                  : `You answered all ${maxQuestions} free mock interview questions.`}
              </p>
            </div>
            <button
              onClick={onClose}
              style={{
                background: "rgba(255,255,255,0.15)",
                border: "none",
                borderRadius: 8,
                color: "#fff",
                cursor: "pointer",
                fontSize: 18,
                lineHeight: 1,
                padding: "6px 10px",
                marginLeft: 12,
              }}
              aria-label="Close"
            >
              ✕
            </button>
          </div>

          {/* Overall score pill */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              marginTop: 16,
              background: "rgba(255,255,255,0.15)",
              borderRadius: 50,
              padding: "6px 18px",
              fontSize: 15,
              fontWeight: 600,
            }}
          >
            <span>Overall Score:</span>
            <span style={{ fontSize: 20 }}>{overallScore}/100</span>
            <span style={{ opacity: 0.8, fontSize: 13 }}>({scoreGrade})</span>
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: "24px 28px", flex: 1 }}>
          {/* AI Summary feedback */}
          {summary?.summaryFeedback && (
            <div
              style={{
                background: "#f8fafc",
                border: "1px solid #e2e8f0",
                borderRadius: 10,
                padding: "14px 16px",
                marginBottom: 20,
                fontSize: 14,
                lineHeight: 1.7,
                color: "#334155",
              }}
            >
              <div style={{ fontWeight: 600, color: "#1e293b", marginBottom: 6, fontSize: 13 }}>
                AI Feedback Summary
              </div>
              {summary.summaryFeedback}
            </div>
          )}

          {/* Per-question breakdown */}
          {answeredQuestions.length > 0 && (
            <div>
              <div style={{ fontWeight: 600, color: "#1e293b", marginBottom: 12, fontSize: 14 }}>
                Question Breakdown ({answeredQuestions.length}/{maxQuestions})
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {answeredQuestions.map((q, i) => (
                  <div
                    key={i}
                    style={{
                      border: "1px solid #e2e8f0",
                      borderRadius: 10,
                      padding: "12px 14px",
                      background: "#fafafa",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        gap: 8,
                        marginBottom: q.improvements?.length > 0 ? 8 : 0,
                      }}
                    >
                      <div style={{ fontSize: 13, color: "#475569", flex: 1 }}>
                        <span style={{ fontWeight: 600, color: "#1e293b" }}>Q{i + 1}. </span>
                        {q.questionText}
                      </div>
                      <ScoreBadge score={q.score} grade={q.grade} />
                    </div>
                    {q.improvements?.length > 0 && (
                      <div style={{ fontSize: 12, color: "#64748b", paddingLeft: 14, borderLeft: "2px solid #e2e8f0" }}>
                        <strong>Tip: </strong>{q.improvements[0]}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Unanswered indicator */}
          {answeredCount < maxQuestions && (
            <div
              style={{
                marginTop: 14,
                fontSize: 13,
                color: "#94a3b8",
                textAlign: "center",
              }}
            >
              {maxQuestions - answeredCount} question{maxQuestions - answeredCount !== 1 ? "s" : ""} not reached in the free session.
            </div>
          )}
        </div>

        {/* Footer — Upgrade CTA */}
        <div
          style={{
            padding: "20px 28px 24px",
            borderTop: "1px solid #f1f5f9",
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          <div
            style={{
              background: "#fffbeb",
              border: "1px solid #fde68a",
              borderRadius: 10,
              padding: "12px 16px",
              fontSize: 13,
              color: "#92400e",
              display: "flex",
              gap: 10,
              alignItems: "flex-start",
            }}
          >
            <span style={{ fontSize: 16 }}>⭐</span>
            <div>
              <strong>Upgrade to Pro</strong> for unlimited mock interviews, deep AI coaching after every answer,
              custom question packs by role, and performance trend tracking across sessions.
            </div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button
              onClick={onUpgrade}
              style={{
                flex: 1,
                padding: "11px 0",
                background: "linear-gradient(135deg, #1e40af, #7c3aed)",
                color: "#fff",
                border: "none",
                borderRadius: 10,
                fontWeight: 700,
                fontSize: 15,
                cursor: "pointer",
                letterSpacing: 0.3,
              }}
            >
              Upgrade to Pro — Unlimited Interviews
            </button>
            <button
              onClick={onClose}
              style={{
                padding: "11px 20px",
                background: "#f1f5f9",
                color: "#475569",
                border: "1px solid #e2e8f0",
                borderRadius: 10,
                fontWeight: 600,
                fontSize: 14,
                cursor: "pointer",
              }}
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
