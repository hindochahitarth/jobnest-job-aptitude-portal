
import React, { useContext, useEffect, useRef, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import Card from "../../components/ui/Card";
import * as api from "../../services/api";

const SECTION_LABELS = {
  QUANT: "Quantitative Aptitude",
  LOGICAL: "Logical Reasoning",
  VERBAL: "Verbal Ability",
  TECHNICAL: "Technical Aptitude",
};

const DEFAULT_CONFIG = {
  section: "QUANT",
  difficulty: "MEDIUM",
  questionCount: 20,
  timeLimitMinutes: 30,
  proctored: true,
};

function createLocalQuestions({ section, difficulty, questionCount }) {
  return Array.from({ length: questionCount }, (_, index) => {
    const n = index + 1;
    if (section === "LOGICAL") {
      const a = n, b = a + 3, c = b + 5, d = c + 7, answer = d + 9;
      return { id: 900000 + n, section, category: "Series", difficulty, questionText: `Find the next number in the series: ${a}, ${b}, ${c}, ${d}, ?`, options: [{ key: "A", text: String(answer) }, { key: "B", text: String(answer + 2) }, { key: "C", text: String(answer - 2) }, { key: "D", text: String(answer + 4) }], correctOption: "A" };
    }
    if (section === "VERBAL") {
      const word = n % 2 === 0 ? "brief" : "rapid";
      const synonym = n % 2 === 0 ? "concise" : "swift";
      return { id: 910000 + n, section, category: "Vocabulary", difficulty, questionText: `Choose the closest meaning of "${word}".`, options: [{ key: "A", text: synonym }, { key: "B", text: "unclear" }, { key: "C", text: "delayed" }, { key: "D", text: "careless" }], correctOption: "A" };
    }
    if (section === "TECHNICAL") {
      const structure = n % 2 === 0 ? "queue" : "stack";
      const principle = n % 2 === 0 ? "FIFO" : "LIFO";
      return { id: 920000 + n, section, category: "CS Fundamentals", difficulty, questionText: `Which access principle best describes a ${structure}?`, options: [{ key: "A", text: principle }, { key: "B", text: "Binary search" }, { key: "C", text: "Hash collision" }, { key: "D", text: "Round robin" }], correctOption: "A" };
    }
    const cost = 150 + n * 5;
    const profit = 20 + n;
    const selling = cost + profit;
    const percentage = ((profit / cost) * 100).toFixed(1);
    return { id: 930000 + n, section, category: "Arithmetic", difficulty, questionText: `An item costs Rs.${cost} and is sold for Rs.${selling}. What is the approximate profit percentage?`, options: [{ key: "A", text: `${percentage}%` }, { key: "B", text: `${(Number(percentage) + 2).toFixed(1)}%` }, { key: "C", text: `${Math.max(0, Number(percentage) - 2).toFixed(1)}%` }, { key: "D", text: `${(Number(percentage) + 5).toFixed(1)}%` }], correctOption: "A" };
  });
}

function saveLocalResult(result) {
  const existing = JSON.parse(localStorage.getItem("jobnestAptitudeResults") || "[]");
  const filtered = existing.filter((item) => item.attemptId !== result.attemptId);
  localStorage.setItem("jobnestAptitudeResults", JSON.stringify([result, ...filtered].slice(0, 25)));
}

function getPerformanceLevel(percentage = 0) {
  if (percentage >= 85) return "Excellent";
  if (percentage >= 70) return "Strong";
  if (percentage >= 50) return "Developing";
  return "Needs Practice";
}

function downloadScorecard(result, candidateName = "Candidate") {
  const rows = (result.sectionBreakdown || []).map((item) => `<tr><td>${item.section}</td><td>${item.correct}/${item.total}</td><td>${item.accuracyPercent}%</td></tr>`).join("");
  const logs = (result.proctorLogs || []).map((log) => `<li>Warning ${log.warningNumber}: ${log.details || log.eventType}</li>`).join("") || "<li>No proctoring violations recorded.</li>";
  const html = `<!doctype html><html><head><meta charset="utf-8"><title>JobNest Scorecard</title><style>body{font-family:Arial,sans-serif;margin:32px;color:#111827}.cert{border:2px solid #0a66c2;padding:28px;max-width:820px;margin:auto}h1{color:#0a66c2}table{width:100%;border-collapse:collapse;margin-top:18px}td,th{border:1px solid #d1d5db;padding:10px;text-align:left}.score{font-size:32px;font-weight:800}</style></head><body><main class="cert"><h1>JobNest Aptitude Result Form</h1><p>Candidate: <strong>${candidateName}</strong></p><p>Assessment: <strong>${SECTION_LABELS[result.category] || result.category}</strong> (${result.difficulty})</p><p class="score">${result.percentage}% - ${result.score}/${result.totalMarks}</p><p>Correct: ${result.correctCount} | Incorrect: ${result.incorrectCount} | Skipped: ${result.skippedCount}</p><p>Performance Level: <strong>${getPerformanceLevel(result.percentage)}</strong></p><p>Proctor Status: <strong>${result.proctorStatus || "CLEAN"}</strong></p><table><thead><tr><th>Topic</th><th>Correct</th><th>Accuracy</th></tr></thead><tbody>${rows}</tbody></table><h3>Proctoring Report</h3><ul>${logs}</ul><p>Attempt ID: ${result.attemptId}</p><p>Completed: ${result.submittedAt || new Date().toISOString()}</p></main></body></html>`;
  const blob = new Blob([html], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `jobnest-scorecard-${result.attemptId}.html`;
  link.click();
  URL.revokeObjectURL(url);
}
export default function AptitudeTest() {
  const { token, user } = useContext(AuthContext);
  const preset = (() => { try { return JSON.parse(sessionStorage.getItem("jobnestTestPreset") || "null"); } catch { return null; } })();
  const [phase, setPhase] = useState("SETUP");
  const [testConfig, setTestConfig] = useState({ ...DEFAULT_CONFIG, ...(preset || {}) });
  const [attemptId, setAttemptId] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [remainingSeconds, setRemainingSeconds] = useState((preset?.timeLimitMinutes || DEFAULT_CONFIG.timeLimitMinutes) * 60);
  const [cameraStream, setCameraStream] = useState(null);
  const [warningCount, setWarningCount] = useState(0);
  const [activeWarningModal, setActiveWarningModal] = useState(null);
  const [proctorLogs, setProctorLogs] = useState([]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const videoRef = useRef(null);
  const answersRef = useRef({});
  const currentQuestionIdRef = useRef(null);
  const questionStartedAtRef = useRef(Date.now());
  const submittedRef = useRef(false);

  useEffect(() => { answersRef.current = userAnswers; }, [userAnswers]);

  function initializeAnswers(questionList) {
    const initialAnswers = {};
    questionList.forEach((q) => { initialAnswers[q.id] = { option: null, marked: false, timeSpent: 0 }; });
    answersRef.current = initialAnswers;
    setUserAnswers(initialAnswers);
    currentQuestionIdRef.current = questionList[0]?.id || null;
    questionStartedAtRef.current = Date.now();
  }

  function commitCurrentQuestionTime() {
    const qId = currentQuestionIdRef.current;
    if (!qId) return answersRef.current;
    const elapsed = Math.max(1, Math.round((Date.now() - questionStartedAtRef.current) / 1000));
    const previous = answersRef.current[qId] || { option: null, marked: false, timeSpent: 0 };
    const next = { ...answersRef.current, [qId]: { ...previous, timeSpent: (previous.timeSpent || 0) + elapsed } };
    answersRef.current = next;
    setUserAnswers(next);
    questionStartedAtRef.current = Date.now();
    return next;
  }

  async function handleStartSession() {
    setLoading(true);
    setErrorMessage("");
    submittedRef.current = false;
    const normalizedConfig = { ...testConfig, questionCount: Math.min(50, Math.max(20, Number(testConfig.questionCount) || 20)), timeLimitMinutes: Math.max(5, Number(testConfig.timeLimitMinutes) || 30) };
    try {
      setTestConfig(normalizedConfig);
      const data = await api.startAptitudeTest(normalizedConfig, token);
      if (!data.questions || data.questions.length === 0) throw new Error("No questions were returned for this test.");
      setAttemptId(data.attemptId);
      setQuestions(data.questions);
      setCurrentIndex(0);
      setRemainingSeconds(data.remainingSeconds || normalizedConfig.timeLimitMinutes * 60);
      initializeAnswers(data.questions);
      setPhase(normalizedConfig.proctored ? "PROCTOR_CHECK" : "EXAM");
    } catch (err) {
      const localQuestions = createLocalQuestions(normalizedConfig);
      const localAttemptId = Date.now();
      setAttemptId(localAttemptId);
      setQuestions(localQuestions);
      setCurrentIndex(0);
      setRemainingSeconds(normalizedConfig.timeLimitMinutes * 60);
      initializeAnswers(localQuestions);
      setErrorMessage(`Backend session unavailable, running local practice mode: ${err.message}`);
      setPhase(normalizedConfig.proctored ? "PROCTOR_CHECK" : "EXAM");
    } finally {
      setLoading(false);
    }
  }

  async function requestCameraPermission() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setCameraStream(stream);
      if (videoRef.current) videoRef.current.srcObject = stream;
      enterFullscreen();
      setPhase("EXAM");
    } catch {
      setErrorMessage("Camera and microphone permissions were not granted. A proctoring warning has been recorded.");
      triggerSecurityViolation("CAMERA_BLOCKED", "Camera or microphone permission was denied.");
      setPhase("EXAM");
    }
  }

  function enterFullscreen() {
    if (document.documentElement.requestFullscreen) document.documentElement.requestFullscreen().catch(() => {});
  }

  useEffect(() => {
    if (phase !== "EXAM") return undefined;
    const timer = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleAutoSubmit("Timer Expired");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [phase]);

  useEffect(() => {
    if (phase === "EXAM" && cameraStream && videoRef.current) videoRef.current.srcObject = cameraStream;
  }, [phase, cameraStream]);

  useEffect(() => {
    if (phase !== "EXAM" || !testConfig.proctored) return undefined;
    function handleVisibilityChange() { if (document.hidden) triggerSecurityViolation("TAB_SWITCH", "Tab or window switch detected."); }
    function handleBlur() { triggerSecurityViolation("WINDOW_SWITCH", "Window lost focus during the test."); }
    function handleFullscreenChange() { if (!document.fullscreenElement) triggerSecurityViolation("FULLSCREEN_EXIT", "Full-screen mode was exited."); }
    function handleContextMenu(e) { e.preventDefault(); triggerSecurityViolation("RIGHT_CLICK_ATTEMPT", "Right-click context menu was blocked."); }
    function handleCopyPaste(e) { e.preventDefault(); triggerSecurityViolation("COPY_PASTE_ATTEMPT", "Copy or paste was blocked during the exam."); }
    document.addEventListener("visibilitychange", handleVisibilityChange);
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    window.addEventListener("blur", handleBlur);
    window.addEventListener("contextmenu", handleContextMenu);
    window.addEventListener("copy", handleCopyPaste);
    window.addEventListener("paste", handleCopyPaste);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      window.removeEventListener("blur", handleBlur);
      window.removeEventListener("contextmenu", handleContextMenu);
      window.removeEventListener("copy", handleCopyPaste);
      window.removeEventListener("paste", handleCopyPaste);
    };
  }, [phase, testConfig.proctored, warningCount]);

  function triggerSecurityViolation(eventType, details) {
    if (submittedRef.current) return;
    const nextCount = warningCount + 1;
    setWarningCount(nextCount);
    const logEntry = { eventType, warningNumber: nextCount, details, timestamp: new Date().toLocaleTimeString() };
    setProctorLogs((prev) => [...prev, logEntry]);
    if (token && attemptId) api.logProctorEvent({ attemptId, eventType, warningNumber: nextCount, details }, token);
    if (nextCount >= 3) {
      setActiveWarningModal({ title: "Exam Auto-Submitted", message: "Maximum proctoring warnings reached. The test has been submitted for evaluation.", isFinal: true });
      handleAutoSubmit("Proctor Termination");
    } else {
      setActiveWarningModal({ title: `Warning ${nextCount} of 3`, message: `${details} A third violation will auto-submit the test.`, isFinal: false });
    }
  }
  function handleSelectOption(qId, key) {
    const current = answersRef.current[qId] || { option: null, marked: false, timeSpent: 0 };
    const next = { ...answersRef.current, [qId]: { ...current, option: key } };
    answersRef.current = next;
    setUserAnswers(next);
  }

  function handleToggleMarkForReview(qId) {
    const current = answersRef.current[qId] || { option: null, marked: false, timeSpent: 0 };
    const next = { ...answersRef.current, [qId]: { ...current, marked: !current.marked } };
    answersRef.current = next;
    setUserAnswers(next);
  }

  function handleClearOption(qId) {
    const current = answersRef.current[qId] || { option: null, marked: false, timeSpent: 0 };
    const next = { ...answersRef.current, [qId]: { ...current, option: null } };
    answersRef.current = next;
    setUserAnswers(next);
  }

  function goToQuestion(index) {
    commitCurrentQuestionTime();
    setCurrentIndex(index);
    currentQuestionIdRef.current = questions[index]?.id || null;
    questionStartedAtRef.current = Date.now();
  }

  async function handleAutoSubmit(reason = "User Submission") {
    if (submittedRef.current) return;
    submittedRef.current = true;
    const finalAnswers = commitCurrentQuestionTime();
    if (cameraStream) cameraStream.getTracks().forEach((t) => t.stop());
    setLoading(true);

    const formattedAnswers = Object.keys(finalAnswers).map((qId) => ({
      questionId: Number(qId),
      selectedOption: finalAnswers[qId]?.option || null,
      isMarkedForReview: !!finalAnswers[qId]?.marked,
      timeSpentSeconds: finalAnswers[qId]?.timeSpent || 0,
    }));
    const payload = { attemptId, answers: formattedAnswers, proctorLogs };

    try {
      const data = await api.submitAptitudeTest(payload, token);
      setResult(data);
      saveLocalResult(data);
    } catch {
      let score = 0, correctCount = 0, incorrectCount = 0, skippedCount = 0;
      const sectionStats = {};
      questions.forEach((q) => {
        const selected = finalAnswers[q.id]?.option;
        sectionStats[q.category] = sectionStats[q.category] || { section: q.category, correct: 0, total: 0, accuracyPercent: 0 };
        sectionStats[q.category].total += 1;
        if (!selected) skippedCount += 1;
        else if (selected === q.correctOption) {
          score += 4;
          correctCount += 1;
          sectionStats[q.category].correct += 1;
        } else {
          score = Math.max(0, score - 1);
          incorrectCount += 1;
        }
      });
      const totalMarks = questions.length * 4;
      const sectionBreakdown = Object.values(sectionStats).map((item) => ({ ...item, accuracyPercent: item.total ? Math.round((item.correct / item.total) * 1000) / 10 : 0 }));
      const localResult = {
        attemptId: attemptId || Date.now(), category: testConfig.section, difficulty: testConfig.difficulty,
        score, totalMarks, percentage: totalMarks ? Math.round((score / totalMarks) * 1000) / 10 : 0, percentile: 0,
        correctCount, incorrectCount, skippedCount, status: warningCount >= 3 ? "TERMINATED_PROCTOR" : "SUBMITTED",
        proctorWarningCount: warningCount, proctorStatus: warningCount >= 3 ? "TERMINATED_HIGH_RISK" : warningCount > 0 ? "WARNING_ISSUED" : "CLEAN",
        startedAt: new Date(Date.now() - testConfig.timeLimitMinutes * 60000 + remainingSeconds * 1000).toISOString(),
        submittedAt: new Date().toISOString(), sectionBreakdown, proctorLogs, submissionReason: reason,
      };
      setResult(localResult);
      saveLocalResult(localResult);
    } finally {
      setLoading(false);
      setPhase("RESULT");
    }
  }

  function formatTimer(totalSecs) {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  }

  if (phase === "SETUP") {
    return (
      <div style={{ maxWidth: 880, margin: "0 auto", display: "flex", flexDirection: "column", gap: 20 }}>
        <div className="page-header-block"><div><h2>Proctored Aptitude Test Engine</h2><p>Choose category, difficulty, paper size, and time limit before launching a randomized assessment.</p></div></div>
        {errorMessage && <div className="alert error">{errorMessage}</div>}
        <Card title="Configure Test Parameters" icon="SET">
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div className="input-group"><label>Select Test Category</label><select className="input-field" value={testConfig.section} onChange={(e) => setTestConfig({ ...testConfig, section: e.target.value })}><option value="QUANT">Quantitative Aptitude</option><option value="LOGICAL">Logical Reasoning</option><option value="VERBAL">Verbal Ability</option><option value="TECHNICAL">Technical and Coding</option></select></div>
            <div className="input-group"><label>Difficulty Level</label><select className="input-field" value={testConfig.difficulty} onChange={(e) => setTestConfig({ ...testConfig, difficulty: e.target.value })}><option value="EASY">Easy</option><option value="MEDIUM">Medium</option><option value="HARD">Hard</option></select></div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
              <div className="input-group"><label>Number of MCQs</label><select className="input-field" value={testConfig.questionCount} onChange={(e) => setTestConfig({ ...testConfig, questionCount: Number(e.target.value) })}><option value={20}>20 Questions</option><option value={30}>30 Questions</option><option value={40}>40 Questions</option><option value={50}>50 Questions</option></select></div>
              <div className="input-group"><label>Time Limit</label><select className="input-field" value={testConfig.timeLimitMinutes} onChange={(e) => setTestConfig({ ...testConfig, timeLimitMinutes: Number(e.target.value) })}><option value={20}>20 Minutes</option><option value={30}>30 Minutes</option><option value={45}>45 Minutes</option><option value={60}>60 Minutes</option></select></div>
            </div>
            <label style={{ display: "flex", alignItems: "center", gap: 12, padding: 14, background: "var(--bg-subtle)", borderRadius: "var(--radius-md)", border: "1px solid var(--surface-border)", cursor: "pointer" }}><input type="checkbox" checked={testConfig.proctored} onChange={(e) => setTestConfig({ ...testConfig, proctored: e.target.checked })} style={{ width: 18, height: 18 }} /><span><strong>Enable proctoring and anti-cheating controls</strong></span></label>
            <button type="button" className="btn btn-primary btn-lg" style={{ width: "100%" }} disabled={loading} onClick={handleStartSession}>{loading ? "Generating Question Paper..." : "Launch Assessment Session"}</button>
          </div>
        </Card>
      </div>
    );
  }

  if (phase === "PROCTOR_CHECK") {
    return <div style={{ maxWidth: 650, margin: "40px auto" }}><Card title="Proctoring & System Check" icon="CAM"><div style={{ textAlign: "center", display: "flex", flexDirection: "column", gap: 20 }}>{errorMessage && <div className="alert warning">{errorMessage}</div>}<p style={{ fontSize: 14, color: "var(--text-muted)", lineHeight: 1.6 }}>Allow camera and microphone permissions, then remain in full-screen mode throughout the exam.</p><div style={{ width: 320, height: 220, borderRadius: "var(--radius-md)", background: "#000", margin: "0 auto", overflow: "hidden", border: "2px solid var(--primary)", display: "flex", alignItems: "center", justifyContent: "center" }}><video ref={videoRef} autoPlay playsInline muted style={{ width: "100%", height: "100%", objectFit: "cover" }} /></div><button type="button" className="btn btn-primary btn-lg" onClick={requestCameraPermission}>Allow Permission & Start Full-Screen Exam</button></div></Card></div>;
  }
  if (phase === "EXAM") {
    const currentQ = questions[currentIndex] || questions[0];
    const userSel = userAnswers[currentQ?.id]?.option;
    const isMarked = !!userAnswers[currentQ?.id]?.marked;
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {errorMessage && <div className="alert warning">{errorMessage}</div>}
        <div style={{ position: "sticky", top: 70, zIndex: 30, background: "var(--surface)", border: "1px solid var(--surface-border)", borderRadius: "var(--radius-md)", padding: "12px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "var(--shadow-md)", gap: 12, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}><span className="badge-v2 primary">{SECTION_LABELS[testConfig.section]}</span><span className="badge-v2 neutral">{testConfig.difficulty}</span><span style={{ fontSize: 13, fontWeight: 700 }}>Question {currentIndex + 1} of {questions.length}</span></div>
          <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>{testConfig.proctored && <span className="badge-v2 success">Proctored: {warningCount}/3 warnings</span>}<div style={{ padding: "6px 14px", borderRadius: "var(--radius-full)", background: remainingSeconds < 300 ? "var(--error-bg)" : "var(--primary-light)", color: remainingSeconds < 300 ? "var(--error)" : "var(--primary)", fontWeight: 800, fontSize: 16 }}>{formatTimer(remainingSeconds)}</div><button type="button" className="btn btn-primary btn-sm" onClick={() => handleAutoSubmit("Manual Submit")} disabled={loading}>Finish & Submit</button></div>
        </div>

        {activeWarningModal && <div style={{ position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.85)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}><div style={{ background: "#ffffff", borderRadius: "var(--radius-lg)", padding: 32, maxWidth: 500, width: "100%", textAlign: "center", boxShadow: "var(--shadow-lg)" }}><h3 style={{ fontSize: 20, color: "var(--error)", marginBottom: 12 }}>{activeWarningModal.title}</h3><p style={{ fontSize: 14, color: "var(--text-muted)", lineHeight: 1.6, marginBottom: 20 }}>{activeWarningModal.message}</p>{!activeWarningModal.isFinal && <button type="button" className="btn btn-primary btn-lg" onClick={() => { setActiveWarningModal(null); enterFullscreen(); }}>Return to Exam</button>}</div></div>}

        <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) 300px", gap: 20 }}>
          <Card title={`Topic: ${currentQ?.category || "General"}`}>
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text-main)", lineHeight: 1.5 }}>{currentQ?.questionText}</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>{currentQ?.options.map((opt) => <label key={opt.key} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderRadius: "var(--radius-md)", border: userSel === opt.key ? "2px solid var(--primary)" : "1px solid var(--surface-border-strong)", background: userSel === opt.key ? "var(--primary-light)" : "var(--surface)", cursor: "pointer", marginBottom: 0 }}><input type="radio" name={`q_${currentQ.id}`} checked={userSel === opt.key} onChange={() => handleSelectOption(currentQ.id, opt.key)} style={{ width: 18, height: 18 }} /><strong style={{ fontSize: 14, width: 24, color: "var(--primary)" }}>{opt.key}.</strong><span style={{ fontSize: 14, color: "var(--text-main)" }}>{opt.text}</span></label>)}</div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 14, borderTop: "1px solid var(--surface-border)", gap: 12, flexWrap: "wrap" }}><button type="button" className="btn btn-ghost btn-sm" onClick={() => handleToggleMarkForReview(currentQ.id)} style={{ color: isMarked ? "var(--warning)" : "var(--text-subtle)" }}>{isMarked ? "Marked for Review" : "Mark for Review"}</button><div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}><button type="button" className="btn btn-secondary btn-sm" onClick={() => handleClearOption(currentQ.id)}>Clear</button><button type="button" className="btn btn-secondary btn-sm" disabled={currentIndex === 0} onClick={() => goToQuestion(Math.max(0, currentIndex - 1))}>Previous</button><button type="button" className="btn btn-primary btn-sm" disabled={currentIndex === questions.length - 1} onClick={() => goToQuestion(Math.min(questions.length - 1, currentIndex + 1))}>Next</button></div></div>
            </div>
          </Card>

          <Card title="Question Palette" icon="Q">
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8 }}>{questions.map((q, idx) => { const ans = userAnswers[q.id]; const isAns = !!ans?.option; const isM = !!ans?.marked; const isCur = idx === currentIndex; const style = isCur ? { background: "var(--primary-light)", color: "var(--primary)", border: "2px solid var(--primary)" } : isM ? { background: "var(--warning-bg)", color: "var(--warning)", border: "1px solid var(--warning-border)" } : isAns ? { background: "var(--success-bg)", color: "var(--success)", border: "1px solid var(--success-border)" } : { background: "var(--bg-subtle)", color: "var(--text-main)", border: "1px solid var(--surface-border)" }; return <button key={q.id} type="button" onClick={() => goToQuestion(idx)} style={{ height: 38, borderRadius: "var(--radius-md)", fontWeight: 700, fontSize: 13, cursor: "pointer", ...style }}>{idx + 1}</button>; })}</div>
              <div style={{ fontSize: 12, color: "var(--text-subtle)", lineHeight: 1.8 }}>Answered: {Object.values(userAnswers).filter((a) => a.option).length}<br />Marked: {Object.values(userAnswers).filter((a) => a.marked).length}<br />Unanswered: {questions.length - Object.values(userAnswers).filter((a) => a.option).length}</div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (phase === "RESULT" && result) {
    return (
      <div style={{ maxWidth: 900, margin: "0 auto", display: "flex", flexDirection: "column", gap: 24 }}>
        <div className="page-header-block"><div><h2>Test Scorecard & Performance Analytics</h2><p>Your score has been saved with answer analytics and proctoring audit details.</p></div></div>
        <div style={{ background: "linear-gradient(135deg, #0a66c2 0%, #004182 100%)", color: "#ffffff", borderRadius: "var(--radius-lg)", padding: 32, display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 24, alignItems: "center", boxShadow: "var(--shadow-lg)" }}>
          <div><span className="badge-v2 primary" style={{ background: "rgba(255,255,255,0.2)", color: "#fff" }}>{SECTION_LABELS[result.category] || result.category} | {result.difficulty}</span><h1 style={{ fontSize: 36, fontWeight: 800, margin: "12px 0 6px" }}>{result.percentage}% <span style={{ fontSize: 20, fontWeight: 500 }}>({result.score} / {result.totalMarks})</span></h1><p style={{ fontSize: 15, color: "rgba(255,255,255,0.85)" }}>Performance Level: <strong>{getPerformanceLevel(result.percentage)}</strong></p></div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, background: "rgba(255,255,255,0.1)", padding: 20, borderRadius: "var(--radius-md)" }}><div style={{ textAlign: "center" }}><div style={{ fontSize: 24, fontWeight: 800, color: "#10b981" }}>{result.correctCount}</div><div style={{ fontSize: 11 }}>Correct</div></div><div style={{ textAlign: "center" }}><div style={{ fontSize: 24, fontWeight: 800, color: "#ef4444" }}>{result.incorrectCount}</div><div style={{ fontSize: 11 }}>Incorrect</div></div><div style={{ textAlign: "center" }}><div style={{ fontSize: 24, fontWeight: 800, color: "#f59e0b" }}>{result.skippedCount}</div><div style={{ fontSize: 11 }}>Skipped</div></div><div style={{ textAlign: "center" }}><div style={{ fontSize: 24, fontWeight: 800, color: "#93c5fd" }}>{result.proctorWarningCount}</div><div style={{ fontSize: 11 }}>Warnings</div></div></div>
        </div>
        <Card title="Topic-Wise Accuracy Breakdown" icon="%"><div style={{ display: "flex", flexDirection: "column", gap: 16 }}>{(result.sectionBreakdown || []).map((sb, idx) => <div key={idx}><div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, fontWeight: 700 }}><span>{sb.section}</span><span>{sb.correct} / {sb.total} ({sb.accuracyPercent}%)</span></div><div className="meter-bar"><div className="meter-fill" style={{ width: `${sb.accuracyPercent}%` }} /></div></div>)}</div></Card>
        <Card title="Proctoring Violation Report" icon="!"><p style={{ fontSize: 13, color: "var(--text-subtle)", marginBottom: 12 }}>Status: <strong>{result.proctorStatus || "CLEAN"}</strong></p>{(result.proctorLogs || []).length > 0 ? <ul style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 12.5 }}>{result.proctorLogs.map((log, idx) => <li key={idx}>Warning {log.warningNumber}: {log.details || log.eventType}</li>)}</ul> : <p style={{ fontSize: 13, color: "var(--text-subtle)" }}>No security violations detected.</p>}</Card>
        <div style={{ display: "flex", gap: 14 }}><button type="button" className="btn btn-primary" style={{ flex: 1 }} onClick={() => setPhase("SETUP")}>Take Another Test</button><button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => downloadScorecard(result, user?.name)}>Download Result Form</button></div>
      </div>
    );
  }

  return null;
}
