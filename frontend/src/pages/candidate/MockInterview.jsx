import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import { useInterviewSession } from "../../hooks/useInterviewSession";
import { useVoiceRecorder } from "../../hooks/useVoiceRecorder";
import { useAiSpeaker } from "../../hooks/useAiSpeaker";
import InterviewReport from "../../components/candidate/InterviewReport";

// ---- constants -------------------------------------------------------
const TRACKS = [
  "Data Structures & System Concepts",
  "React, Node.js & Practical Project Scenarios",
  "AI, Machine Learning & Data Science",
  "System Design",
  "DBMS",
  "Operating Systems",
  "Computer Networks",
  "Quantitative Estimation & Case Studies",
  "Electronics, Embedded & Hardware Systems",
];

// ---- helpers ---------------------------------------------------------
function pad(n) { return String(n).padStart(2, "0"); }
function formatTime(s) { return `${pad(Math.floor(s / 60))}:${pad(s % 60)}`; }

// Animated audio-level bars (pure CSS via inline style animation keyframes)
function SoundBars({ active }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height: 20 }}>
      {[0.6, 1, 0.75, 1, 0.5].map((h, i) => (
        <div
          key={i}
          style={{
            width: 4,
            height: active ? `${h * 100}%` : "25%",
            background: active ? "#22c55e" : "#94a3b8",
            borderRadius: 99,
            transition: `height ${0.15 + i * 0.07}s ease ${active ? `${i * 0.1}s` : "0s"}`,
            animation: active ? `soundbar${i} 0.7s ease-in-out infinite alternate` : "none",
          }}
        />
      ))}
      <style>{`
        @keyframes soundbar0 { from{height:40%} to{height:80%} }
        @keyframes soundbar1 { from{height:70%} to{height:100%} }
        @keyframes soundbar2 { from{height:50%} to{height:90%} }
        @keyframes soundbar3 { from{height:60%} to{height:100%} }
        @keyframes soundbar4 { from{height:30%} to{height:70%} }
      `}</style>
    </div>
  );
}

// Video tile for candidate camera
function CandidateCam({ stream, isCamOn, isMicOn }) {
  const videoRef = useRef(null);
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        aspectRatio: "16/9",
        background: "#0f172a",
        borderRadius: 12,
        overflow: "hidden",
        border: "2px solid #1e293b",
      }}
    >
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          display: isCamOn ? "block" : "none",
          transform: "scaleX(-1)", // mirror for candidate
        }}
      />
      {!isCamOn && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            color: "#64748b",
            gap: 8,
          }}
        >
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="12" cy="8" r="4"/>
            <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
            <line x1="2" y1="2" x2="22" y2="22" stroke="#ef4444" strokeWidth="2"/>
          </svg>
          <span style={{ fontSize: 12 }}>Camera off</span>
        </div>
      )}
      {/* Mic indicator */}
      <div
        style={{
          position: "absolute",
          bottom: 8,
          left: 8,
          background: isMicOn ? "rgba(34,197,94,0.85)" : "rgba(239,68,68,0.85)",
          borderRadius: 50,
          padding: "3px 8px",
          fontSize: 11,
          color: "#fff",
          fontWeight: 600,
          display: "flex",
          alignItems: "center",
          gap: 4,
        }}
      >
        {isMicOn ? "🎤 Live" : "🔇 Muted"}
      </div>
      <div
        style={{
          position: "absolute",
          bottom: 8,
          right: 8,
          background: "rgba(0,0,0,0.55)",
          borderRadius: 6,
          padding: "2px 8px",
          fontSize: 11,
          color: "#fff",
        }}
      >
        You
      </div>
    </div>
  );
}

// AI interviewer avatar tile
function AiAvatar({ isSpeaking }) {
  return (
    <div
      style={{
        width: "100%",
        aspectRatio: "16/9",
        background: "linear-gradient(135deg, #1e3a8a 0%, #312e81 100%)",
        borderRadius: 12,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        border: isSpeaking ? "2px solid #818cf8" : "2px solid #1e293b",
        boxShadow: isSpeaking ? "0 0 20px rgba(129,140,248,0.4)" : "none",
        transition: "border-color 0.3s, box-shadow 0.3s",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Ripple when speaking */}
      {isSpeaking && (
        <>
          <div style={{ position: "absolute", width: 120, height: 120, borderRadius: "50%",
            border: "2px solid rgba(129,140,248,0.3)", animation: "ripple 1.5s linear infinite" }} />
          <div style={{ position: "absolute", width: 160, height: 160, borderRadius: "50%",
            border: "2px solid rgba(129,140,248,0.2)", animation: "ripple 1.5s linear 0.5s infinite" }} />
          <style>{`
            @keyframes ripple { from{transform:scale(0.8);opacity:1} to{transform:scale(1.6);opacity:0} }
          `}</style>
        </>
      )}

      {/* Avatar icon */}
      <div
        style={{
          width: 72,
          height: 72,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.12)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 32,
          marginBottom: 10,
          border: "2px solid rgba(255,255,255,0.2)",
        }}
      >
        🤖
      </div>

      <div style={{ color: "#e0e7ff", fontWeight: 700, fontSize: 14 }}>AI Interviewer</div>
      <div style={{ marginTop: 8 }}>
        <SoundBars active={isSpeaking} />
      </div>
      {isSpeaking && (
        <div style={{ marginTop: 8, color: "#a5b4fc", fontSize: 12, animation: "pulse 1s ease-in-out infinite" }}>
          Speaking…
          <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>
        </div>
      )}

      <div
        style={{
          position: "absolute",
          bottom: 8,
          right: 8,
          background: "rgba(0,0,0,0.4)",
          borderRadius: 6,
          padding: "2px 8px",
          fontSize: 11,
          color: "#e0e7ff",
        }}
      >
        JobNest AI
      </div>
    </div>
  );
}

// Dual progress pill bar
function DualProgress({ answered, maxQ, elapsed, maxSecs }) {
  const tPct = Math.min(100, (elapsed / maxSecs) * 100);
  const tColor = tPct > 80 ? "#ef4444" : tPct > 60 ? "#f59e0b" : "#22c55e";
  return (
    <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
      {/* Q pill */}
      <div style={{
        display:"flex",alignItems:"center",gap:8,
        background:"rgba(255,255,255,0.07)",border:"1px solid rgba(255,255,255,0.1)",
        borderRadius:50,padding:"5px 14px",fontSize:13,fontWeight:600,color:"#e2e8f0"
      }}>
        <span>📋</span>
        <span>Q {answered}/{maxQ}</span>
        <div style={{width:48,height:5,background:"rgba(255,255,255,0.15)",borderRadius:99,overflow:"hidden"}}>
          <div style={{width:`${(answered/maxQ)*100}%`,height:"100%",background:"#60a5fa",borderRadius:99,transition:"width 0.3s"}}/>
        </div>
      </div>
      {/* Time pill */}
      <div style={{
        display:"flex",alignItems:"center",gap:8,
        background: tPct>80?"rgba(239,68,68,0.15)":"rgba(255,255,255,0.07)",
        border:`1px solid ${tPct>80?"rgba(239,68,68,0.4)":"rgba(255,255,255,0.1)"}`,
        borderRadius:50,padding:"5px 14px",fontSize:13,fontWeight:600,
        color: tPct>80?"#fca5a5":"#e2e8f0"
      }}>
        <span>{tPct>80?"⚠️":"⏱"}</span>
        <span>{formatTime(maxSecs - elapsed)} / {formatTime(maxSecs)}</span>
        <div style={{width:48,height:5,background:"rgba(255,255,255,0.15)",borderRadius:99,overflow:"hidden"}}>
          <div style={{width:`${tPct}%`,height:"100%",background:tColor,borderRadius:99,transition:"width 0.5s"}}/>
        </div>
      </div>
    </div>
  );
}

// Full-width AI speech caption bubble
function AiCaption({ text, isSpeaking }) {
  if (!text) return null;
  return (
    <div
      style={{
        background: "rgba(99,102,241,0.15)",
        border: "1px solid rgba(99,102,241,0.3)",
        borderRadius: 12,
        padding: "14px 18px",
        color: "#e0e7ff",
        fontSize: 15,
        lineHeight: 1.6,
        position: "relative",
        minHeight: 52,
      }}
    >
      <div style={{ position: "absolute", top: -1, left: 16, background: "#312e81",
        padding: "0 6px", fontSize: 11, color: "#a5b4fc", fontWeight: 600,
        borderRadius: "4px 4px 0 0", transform: "translateY(-100%)" }}>
        AI Interviewer {isSpeaking ? "🔊" : ""}
      </div>
      {text}
    </div>
  );
}

// Live transcript bubble
function TranscriptBubble({ text, interim, isListening }) {
  const combined = text + (interim ? ` ${interim}` : "");
  return (
    <div
      style={{
        background: "rgba(30,58,138,0.2)",
        border: `1px solid ${isListening ? "rgba(34,197,94,0.5)" : "rgba(255,255,255,0.1)"}`,
        borderRadius: 12,
        padding: "12px 16px",
        color: "#e2e8f0",
        fontSize: 14,
        lineHeight: 1.6,
        minHeight: 52,
        position: "relative",
      }}
    >
      <div style={{ position: "absolute", top: -1, left: 16, background: "#0f172a",
        padding: "0 6px", fontSize: 11, fontWeight: 600,
        color: isListening ? "#4ade80" : "#94a3b8",
        borderRadius: "4px 4px 0 0", transform: "translateY(-100%)" }}>
        {isListening ? "🎤 Recording…" : "Your Answer"}
      </div>
      {combined
        ? <span>{text}<span style={{ color: "#94a3b8", fontStyle: "italic" }}>{interim ? ` ${interim}` : ""}</span></span>
        : <span style={{ color: "#475569", fontStyle: "italic" }}>
            {isListening ? "Speak now — your words appear here in real time…" : "Press the microphone to start speaking"}
          </span>
      }
    </div>
  );
}

// Evaluation result card shown on screen after AI speaks
function EvalResultCard({ eval: ev }) {
  if (!ev) return null;
  const color = ev.score >= 85 ? "#4ade80" : ev.score >= 70 ? "#60a5fa" : "#fbbf24";
  return (
    <div style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.1)",
      borderRadius:12, padding:"16px 18px" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
        <span style={{ color:"#94a3b8", fontSize:13, fontWeight:600 }}>Answer Result</span>
        <span style={{ color, fontWeight:700, fontSize:15, background:"rgba(255,255,255,0.07)",
          border:`1px solid ${color}`, borderRadius:8, padding:"3px 12px" }}>
          {ev.score}/100 · {ev.grade}
        </span>
      </div>
      {/* Score bar */}
      <div style={{ height:5, background:"rgba(255,255,255,0.1)", borderRadius:99, overflow:"hidden", marginBottom:12 }}>
        <div style={{ width:`${ev.score}%`, height:"100%", background:color, borderRadius:99, transition:"width 0.6s" }} />
      </div>
      {ev.strengths?.length > 0 && (
        <div style={{ marginBottom:8 }}>
          <div style={{ fontSize:12, color:"#4ade80", fontWeight:600, marginBottom:4 }}>✓ Strength</div>
          <div style={{ fontSize:13, color:"#d1fae5" }}>{ev.strengths[0]}</div>
        </div>
      )}
      {ev.improvements?.length > 0 && (
        <div style={{ marginBottom:8 }}>
          <div style={{ fontSize:12, color:"#fbbf24", fontWeight:600, marginBottom:4 }}>△ Improve</div>
          <div style={{ fontSize:13, color:"#fef3c7" }}>{ev.improvements[0]}</div>
        </div>
      )}
      {ev.starAdvice && (
        <div style={{ fontSize:12, color:"#a5b4fc", fontStyle:"italic", marginTop:6 }}>
          💡 {ev.starAdvice}
        </div>
      )}
    </div>
  );
}

// Custom track picker — avoids the native <select> dark-mode option rendering bug
function TrackPicker({ value, onChange }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ position: "relative", userSelect: "none" }}>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        style={{
          width: "100%", padding: "10px 12px",
          background: "#1e293b", border: "1px solid rgba(255,255,255,0.18)",
          borderRadius: 8, fontSize: 14, color: "#f1f5f9",
          textAlign: "left", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          outline: "none",
        }}
      >
        <span>{value}</span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2">
          <polyline points={open ? "18 15 12 9 6 15" : "6 9 12 15 18 9"} />
        </svg>
      </button>
      {/* Dropdown */}
      {open && (
        <div style={{
          position: "absolute", zIndex: 200, top: "calc(100% + 4px)", left: 0, right: 0,
          background: "#1e293b", border: "1px solid rgba(255,255,255,0.15)",
          borderRadius: 10, overflow: "hidden",
          boxShadow: "0 12px 40px rgba(0,0,0,0.6)",
          maxHeight: 280, overflowY: "auto",
        }}>
          {TRACKS.map(t => (
            <button
              key={t}
              type="button"
              onClick={() => { onChange(t); setOpen(false); }}
              style={{
                display: "block", width: "100%", padding: "11px 14px",
                background: t === value ? "rgba(99,102,241,0.25)" : "transparent",
                border: "none", borderBottom: "1px solid rgba(255,255,255,0.06)",
                color: t === value ? "#a5b4fc" : "#e2e8f0",
                fontSize: 13, textAlign: "left", cursor: "pointer",
                fontWeight: t === value ? 600 : 400,
              }}
              onMouseEnter={e => { if (t !== value) e.currentTarget.style.background = "rgba(255,255,255,0.06)"; }}
              onMouseLeave={e => { if (t !== value) e.currentTarget.style.background = "transparent"; }}
            >
              {t === value && <span style={{ marginRight: 8, fontSize: 11 }}>✓</span>}
              {t}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Setup screen
function SetupPanel({ onStart, onRequestMedia, loading }) {
  const [form, setForm] = useState({
    targetRole: "",
    subject: TRACKS[0],
    candidateSkills: "",
    jobDescription: "",
  });

  const inp = {
    width: "100%", padding: "10px 12px",
    background: "#1e293b", border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: 8, fontSize: 14, color: "#f1f5f9", outline: "none",
    boxSizing: "border-box",
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0f172a", display: "flex",
      alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ maxWidth: 520, width: "100%", background: "#111827",
        border: "1px solid rgba(255,255,255,0.08)", borderRadius: 20,
        padding: "36px 40px", boxShadow: "0 20px 60px rgba(0,0,0,0.5)" }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ fontSize: 48, marginBottom: 14 }}>🎙️</div>
          <h2 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: "#f1f5f9" }}>
            AI Voice Interview
          </h2>
          <p style={{ margin: "10px 0 0", color: "#94a3b8", fontSize: 14 }}>
            Speak your answers — the AI interviewer listens, evaluates,<br/>
            and replies back to you in real time.
          </p>
          <div style={{ display: "inline-flex", gap: 10, marginTop: 14,
            background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.3)",
            borderRadius: 50, padding: "6px 18px", fontSize: 12, color: "#a5b4fc" }}>
            <span>🎤 Voice STT</span><span>·</span>
            <span>🔊 AI TTS</span><span>·</span>
            <span>📹 Live Camera</span><span>·</span>
            <span>🆓 5Q / 5min free</span>
          </div>
        </div>
        <form onSubmit={(e) => {
          e.preventDefault();
          if (form.targetRole.trim()) {
            onRequestMedia();   // acquire camera/mic NOW, right before session starts
            onStart(form);
          }
        }}
          style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label style={{ fontSize: 12, color: "#94a3b8", fontWeight: 600,
              display: "block", marginBottom: 5 }}>
              Target Role <span style={{ color: "#ef4444" }}>*</span>
            </label>
            <input style={inp} value={form.targetRole} required
              onChange={e => setForm({ ...form, targetRole: e.target.value })}
              placeholder="e.g. Software Engineer, Data Analyst" />
          </div>
          <div>
            <label style={{ fontSize: 12, color: "#94a3b8", fontWeight: 600,
              display: "block", marginBottom: 5 }}>Interview Track</label>
            {/* Custom dropdown — avoids native <option> dark-bg rendering bug */}
            <TrackPicker
              value={form.subject}
              onChange={subject => setForm({ ...form, subject })}
            />
          </div>
          <div>
            <label style={{ fontSize: 12, color: "#94a3b8", fontWeight: 600,
              display: "block", marginBottom: 5 }}>Your Key Skills</label>
            <input style={inp} value={form.candidateSkills}
              onChange={e => setForm({ ...form, candidateSkills: e.target.value })}
              placeholder="e.g. React, Node.js, SQL, System Design" />
          </div>
          <button type="submit" disabled={loading || !form.targetRole.trim()}
            style={{ marginTop: 8, padding: "13px 0",
              background: loading ? "#374151" : "linear-gradient(135deg,#6366f1,#8b5cf6)",
              color: "#fff", border: "none", borderRadius: 10, fontWeight: 700,
              fontSize: 16, cursor: loading ? "not-allowed" : "pointer", letterSpacing: 0.3 }}>
            {loading ? "Setting up your interview…" : "Start AI Voice Interview →"}
          </button>
        </form>
      </div>
    </div>
  );
}

// ============================================================
// MAIN COMPONENT
// ============================================================
export default function MockInterview() {
  const { token } = useContext(AuthContext);

  const session = useInterviewSession(token);
  const voice = useVoiceRecorder();
  const speaker = useAiSpeaker();

  const [aiCaption, setAiCaption] = useState("");  // what AI is currently saying (shown on screen)
  const [showEval, setShowEval] = useState(false); // show eval card after AI finishes speaking

  // Whether the candidate can speak (active + AI not talking + not submitting)
  const canSpeak = session.phase === "active" && !speaker.isSpeaking;
  const isProcessing = session.phase === "submitting" || session.phase === "speaking";

  // ---- speak a string and call back when done --------------------------------
  const speakAndThen = useCallback((text, onDone) => {
    setAiCaption(text);
    speaker.speak(text);
    // Poll until speaking finishes
    const check = setInterval(() => {
      if (!window.speechSynthesis.speaking) {
        clearInterval(check);
        onDone?.();
      }
    }, 300);
    // Safety timeout (30s max)
    const timeout = setTimeout(() => { clearInterval(check); onDone?.(); }, 30000);
    return () => { clearInterval(check); clearTimeout(timeout); };
  }, [speaker]);

  // ---- On session start: AI speaks the first question -----------------------
  useEffect(() => {
    if (session.phase === "active" && session.currentQuestion && !session.lastSpokenReply) {
      const intro = session.currentIdx === 0
        ? `Welcome! I'm your AI interviewer for today. Let's begin. Question 1: ${session.currentQuestion.questionText}`
        : `Question ${session.currentIdx + 1}: ${session.currentQuestion.questionText}`;
      setAiCaption(intro);
      setShowEval(false);
      speaker.speak(intro);
    }
  }, [session.phase, session.currentQuestion?.questionText]); // eslint-disable-line

  // ---- After submitting voice answer: AI speaks reply then shows eval -------
  useEffect(() => {
    if (session.phase === "speaking" && session.lastSpokenReply) {
      const { spokenReply, transition } = session.lastSpokenReply;
      const fullText = spokenReply + (transition ? " " + transition : "");
      setAiCaption(fullText);
      setShowEval(false);

      speakAndThen(fullText, () => {
        setShowEval(true);
        // After 3s of showing eval card, advance to next question (or end)
        setTimeout(() => {
          setShowEval(false);
          session.advanceAfterSpeech();
          // If not ended, next question will be spoken via the useEffect above
        }, 3500);
      });
    }
  }, [session.phase, session.lastSpokenReply]); // eslint-disable-line

  // ---- Handle stop-recording & submit ---------------------------------------
  const handleStopAndSubmit = useCallback(() => {
    const transcript = voice.transcript.trim();
    voice.stopListening();

    if (!transcript) {
      setAiCaption("I didn't catch that. Please try speaking again.");
      speaker.speak("I didn't catch that. Please try speaking again.");
      return;
    }

    session.submitVoiceAnswer(transcript);
  }, [voice, session, speaker]);

  // ---- Release media whenever session ends (timer, question limit, or End btn)
  useEffect(() => {
    if (session.phase === "ended") {
      voice.stopListening();
      voice.releaseMedia();
      speaker.stop();
    }
  }, [session.phase]); // eslint-disable-line

  // ---- Mic button toggle ----------------------------------------------------
  const handleMicButton = useCallback(() => {
    if (voice.isListening) {
      handleStopAndSubmit();
    } else if (canSpeak) {
      voice.resetTranscript();
      voice.startListening();
    }
  }, [voice, canSpeak, handleStopAndSubmit]);

  // ---- Shared cleanup: stop camera/mic + TTS + session ----------------------
  const stopMediaAndReset = useCallback(() => {
    voice.stopListening();
    voice.releaseMedia();
    speaker.stop();
    session.reset();
  }, [voice, speaker, session]);

  const stopMediaAndEnd = useCallback(() => {
    voice.stopListening();
    voice.releaseMedia();
    speaker.stop();
    session.endSession();
  }, [voice, speaker, session]);

  // ============================================================
  // RENDER
  // ============================================================

  // Setup screen — no camera until user explicitly starts
  if (session.phase === "idle" || session.phase === "starting") {
    return (
      <SetupPanel
        onStart={(form) => session.startSession(form)}
        onRequestMedia={voice.requestMedia}
        loading={session.phase === "starting"}
      />
    );
  }

  const { currentQuestion, currentIdx, answeredCount, maxQuestions,
    elapsedSeconds, maxDurationSeconds, timeRemaining, lastEval,
    limitReached, limitReason, summary, error, phase } = session;

  // ---- Interview Report when session ends (any trigger) ----
  if (phase === "ended") {
    return (
      <InterviewReport
        open
        session={session.session}
        summary={summary}
        limitReason={limitReason}
        answeredCount={answeredCount}
        maxQuestions={maxQuestions}
        onRetry={stopMediaAndReset}
      />
    );
  }

  const timeWarning = timeRemaining <= 60 && timeRemaining > 0 && phase === "active";

  return (
    <div style={{ background: "#0f172a", minHeight: "100vh", color: "#f1f5f9",
      display: "flex", flexDirection: "column" }}>

      {/* ---- Header bar ---- */}
      <div style={{ borderBottom: "1px solid rgba(255,255,255,0.06)",
        padding: "10px 20px", display: "flex", alignItems: "center",
        justifyContent: "space-between", flexWrap: "wrap", gap: 10,
        background: "rgba(0,0,0,0.3)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 20 }}>🎙️</span>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700 }}>AI Voice Interview</div>
            <div style={{ fontSize: 12, color: "#64748b" }}>{session.session?.targetRole || ""}</div>
          </div>
          {/* Live badge */}
          {phase === "active" && (
            <span style={{ background: "#ef4444", color: "#fff", fontSize: 10,
              fontWeight: 700, borderRadius: 4, padding: "2px 8px",
              animation: "pulse 2s ease-in-out infinite",
              letterSpacing: 1 }}>
              LIVE
            </span>
          )}
        </div>

        <DualProgress answered={answeredCount} maxQ={maxQuestions}
          elapsed={elapsedSeconds} maxSecs={maxDurationSeconds} />

        <button onClick={stopMediaAndEnd}
          style={{ background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)",
            color: "#fca5a5", borderRadius: 8, padding: "6px 14px", fontSize: 13,
            fontWeight: 600, cursor: "pointer" }}>
          ✕ End Interview
        </button>
      </div>

      {/* ---- Main interview room ---- */}
      <div style={{ flex: 1, padding: "16px 20px", display: "flex",
        flexDirection: "column", gap: 14, maxWidth: 960, margin: "0 auto", width: "100%" }}>

        {/* Error banner */}
        {error && (
          <div style={{ background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)",
            borderRadius: 8, padding: "10px 14px", color: "#fca5a5", fontSize: 13 }}>
            {error}
          </div>
        )}

        {/* Time warning */}
        {timeWarning && (
          <div style={{ background: "rgba(245,158,11,0.15)", border: "1px solid rgba(245,158,11,0.3)",
            borderRadius: 8, padding: "10px 14px", color: "#fbbf24", fontSize: 13, fontWeight: 600 }}>
            ⚠️ Less than {timeRemaining}s remaining in your free session!
          </div>
        )}

        {/* Video tiles — 2-column on wide, stacked on narrow */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <AiAvatar isSpeaking={speaker.isSpeaking} />
          <CandidateCam stream={voice.stream} isCamOn={voice.isCamOn} isMicOn={voice.isMicOn} />
        </div>

        {/* AI caption / speech transcript */}
        <AiCaption text={aiCaption} isSpeaking={speaker.isSpeaking} />

        {/* Current question text card */}
        {currentQuestion && (phase === "active" || isProcessing) && (
          <div style={{ background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "16px 20px" }}>
            <div style={{ display: "flex", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
              <span style={{ background: "rgba(99,102,241,0.2)", color: "#a5b4fc",
                borderRadius: 6, padding: "2px 10px", fontSize: 12, fontWeight: 600 }}>
                Question {currentIdx + 1} / {maxQuestions}
              </span>
              <span style={{ background: "rgba(255,255,255,0.07)", color: "#94a3b8",
                borderRadius: 6, padding: "2px 10px", fontSize: 12 }}>
                {currentQuestion.skill}
              </span>
              <span style={{
                background: currentQuestion.difficulty === "ADVANCED" ? "rgba(239,68,68,0.2)" :
                  currentQuestion.difficulty === "INTERMEDIATE" ? "rgba(245,158,11,0.2)" : "rgba(34,197,94,0.2)",
                color: currentQuestion.difficulty === "ADVANCED" ? "#fca5a5" :
                  currentQuestion.difficulty === "INTERMEDIATE" ? "#fde68a" : "#bbf7d0",
                borderRadius: 6, padding: "2px 10px", fontSize: 12, fontWeight: 600 }}>
                {currentQuestion.difficulty}
              </span>
            </div>
            <p style={{ margin: 0, fontSize: 16, lineHeight: 1.7, color: "#f1f5f9", fontWeight: 500 }}>
              {currentQuestion.questionText}
            </p>
          </div>
        )}

        {/* Live transcript */}
        {(phase === "active" || voice.isListening) && (
          <TranscriptBubble
            text={voice.transcript}
            interim={voice.interimText}
            isListening={voice.isListening}
          />
        )}

        {/* Eval result card (shown briefly after AI speaks the reply) */}
        {showEval && lastEval && <EvalResultCard eval={lastEval} />}

        {/* Processing indicator */}
        {isProcessing && !showEval && (
          <div style={{ display: "flex", alignItems: "center", gap: 12,
            color: "#94a3b8", fontSize: 14, padding: "10px 0" }}>
            <div style={{ width: 20, height: 20, border: "2px solid #6366f1",
              borderTopColor: "transparent", borderRadius: "50%",
              animation: "spin 0.8s linear infinite" }} />
            {session.phase === "submitting" ? "Evaluating your answer…" : "AI is composing a reply…"}
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          </div>
        )}

        {/* Microphone + controls row */}
        {(phase === "active" || voice.isListening) && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center",
            gap: 16, padding: "10px 0" }}>
            {/* Main mic button */}
            <button
              onClick={handleMicButton}
              disabled={(!canSpeak && !voice.isListening) || isProcessing || speaker.isSpeaking}
              style={{
                width: 70, height: 70, borderRadius: "50%", border: "none",
                background: voice.isListening
                  ? "linear-gradient(135deg,#ef4444,#dc2626)"
                  : canSpeak && !isProcessing && !speaker.isSpeaking
                    ? "linear-gradient(135deg,#6366f1,#8b5cf6)"
                    : "rgba(100,116,139,0.4)",
                cursor: (canSpeak || voice.isListening) && !isProcessing && !speaker.isSpeaking
                  ? "pointer" : "not-allowed",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 26,
                boxShadow: voice.isListening ? "0 0 20px rgba(239,68,68,0.5)" :
                  canSpeak ? "0 0 20px rgba(99,102,241,0.4)" : "none",
                transition: "all 0.2s",
                animation: voice.isListening ? "micPulse 1s ease-in-out infinite" : "none",
              }}
            >
              {voice.isListening ? "⏹" : "🎤"}
            </button>
            <style>{`
              @keyframes micPulse{0%,100%{box-shadow:0 0 20px rgba(239,68,68,0.5)}
              50%{box-shadow:0 0 36px rgba(239,68,68,0.9)}}
            `}</style>

            <div style={{ fontSize: 13, color: "#64748b", textAlign: "center", maxWidth: 160 }}>
              {voice.isListening
                ? "Tap ⏹ to stop and submit"
                : speaker.isSpeaking
                  ? "Wait for AI to finish…"
                  : isProcessing
                    ? "Processing…"
                    : "Tap 🎤 to answer"}
            </div>

            {/* Cam toggle */}
            <button onClick={voice.toggleCam}
              style={{ width: 44, height: 44, borderRadius: "50%", border: "none",
                background: voice.isCamOn ? "rgba(255,255,255,0.08)" : "rgba(239,68,68,0.2)",
                color: voice.isCamOn ? "#94a3b8" : "#fca5a5",
                cursor: "pointer", fontSize: 18, display: "flex",
                alignItems: "center", justifyContent: "center" }}
              title={voice.isCamOn ? "Turn off camera" : "Turn on camera"}>
              {voice.isCamOn ? "📹" : "🚫"}
            </button>

            {/* Mic mute toggle */}
            <button onClick={voice.toggleMic}
              style={{ width: 44, height: 44, borderRadius: "50%", border: "none",
                background: voice.isMicOn ? "rgba(255,255,255,0.08)" : "rgba(239,68,68,0.2)",
                color: voice.isMicOn ? "#94a3b8" : "#fca5a5",
                cursor: "pointer", fontSize: 18, display: "flex",
                alignItems: "center", justifyContent: "center" }}
              title={voice.isMicOn ? "Mute mic" : "Unmute mic"}>
              {voice.isMicOn ? "🎙️" : "🔇"}
            </button>
          </div>
        )}

        {/* Permission error */}
        {voice.permissionError && (
          <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)",
            borderRadius: 8, padding: "12px 16px", color: "#fca5a5", fontSize: 13 }}>
            ⚠️ {voice.permissionError}
          </div>
        )}

        {/* STT not supported fallback notice */}
        {!voice.supported && phase === "active" && (
          <div style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.3)",
            borderRadius: 10, padding: "14px 18px", color: "#fde68a", fontSize: 13 }}>
            <strong>Speech recognition not supported</strong> in this browser.
            Use Chrome or Edge for the full voice experience.
            You can still type your answers below:
            <textarea
              value={session.answer}
              onChange={e => session.setAnswer(e.target.value)}
              disabled={phase !== "active"}
              placeholder="Type your answer here…"
              style={{ marginTop: 10, width: "100%", minHeight: 80, padding: "10px 12px",
                background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 8, color: "#e2e8f0", fontSize: 14, resize: "vertical",
                fontFamily: "inherit", outline: "none", boxSizing: "border-box" }}
            />
            <button onClick={session.submitAnswer} disabled={!session.answer.trim() || phase !== "active"}
              style={{ marginTop: 8, padding: "8px 22px",
                background: session.answer.trim() ? "#6366f1" : "rgba(100,116,139,0.4)",
                color: "#fff", border: "none", borderRadius: 8, fontWeight: 600,
                cursor: session.answer.trim() ? "pointer" : "not-allowed", fontSize: 14 }}>
              Submit Answer
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}
      `}</style>
    </div>
  );
}
