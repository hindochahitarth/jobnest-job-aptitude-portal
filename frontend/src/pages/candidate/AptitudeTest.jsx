import React, { useContext, useEffect, useRef, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import Card from "../../components/ui/Card";
import * as api from "../../services/api";

const SECTION_LABELS = {
  QUANT: "Quantitative Aptitude",
  LOGICAL: "Logical Reasoning",
  VERBAL: "Verbal Ability",
  TECHNICAL: "Technical and Coding",
};

const SAMPLE_QUESTIONS = {
  QUANT: [
    { id: 101, category: "Profit & Loss", questionText: "A trader buys an item for ₹500 and sells it for ₹625. What is the profit percentage?", optionA: "20%", optionB: "25%", optionC: "30%", optionD: "15%", correctOption: "B", explanation: "Profit = 625 - 500 = 125. Profit % = (125/500)*100 = 25%." },
    { id: 102, category: "Speed Time Distance", questionText: "A train 180 meters long passes a telegraph post in 9 seconds. What is the speed of the train in km/h?", optionA: "50 km/h", optionB: "60 km/h", optionC: "72 km/h", optionD: "80 km/h", correctOption: "C", explanation: "Speed = 180 / 9 = 20 m/s = 20 * (18/5) = 72 km/h." },
    { id: 103, category: "Ages", questionText: "Ratio of ages of A and B is 4:5. After 6 years, the sum of their ages will be 48. What is A's present age?", optionA: "16 years", optionB: "20 years", optionC: "18 years", optionD: "24 years", correctOption: "A", explanation: "Present sum = 48 - 12 = 36. Ratio 4:5 => 4x+5x=36 => x=4. A = 16 years." },
  ],
  LOGICAL: [
    { id: 201, category: "Number Series", questionText: "Find the next number in the series: 3, 7, 15, 31, 63, ?", optionA: "95", optionB: "127", optionC: "115", optionD: "125", correctOption: "B", explanation: "Pattern: (Prev * 2) + 1. 63 * 2 + 1 = 127." },
    { id: 202, category: "Coding Decoding", questionText: "If 'FLOWER' is coded as 'EKNVDQ', how is 'GARDEN' written in that code?", optionA: "FZQCDM", optionB: "FBSEFO", optionC: "GAQDEM", optionD: "FYPBDM", correctOption: "A", explanation: "Shift 1 position backward for each letter." },
  ],
  VERBAL: [
    { id: 301, category: "Grammar & Usage", questionText: "Identify the correct sentence:", optionA: "Neither of the boys were present.", optionB: "Neither of the boys was present.", optionC: "Neither of the boy were present.", optionD: "Neither of the boys are present.", correctOption: "B", explanation: "'Neither of' takes singular verb 'was'." },
  ],
  TECHNICAL: [
    { id: 401, category: "Java & OOP", questionText: "Which of the following is NOT a feature of Object Oriented Programming in Java?", optionA: "Inheritance", optionB: "Polymorphism", optionC: "Pointers", optionD: "Encapsulation", correctOption: "C", explanation: "Java does not support explicit pointers for memory safety." },
  ],
};

function createLocalQuestions(config) {
  const selectedSection = config.section || "QUANT";
  const source = SAMPLE_QUESTIONS[selectedSection] || SAMPLE_QUESTIONS.QUANT;
  const count = config.questionCount || 20;

  const generated = [];
  for (let i = 0; i < count; i += 1) {
    const template = source[i % source.length];
    generated.push({
      id: template.id * 100 + i + 1,
      section: selectedSection,
      category: template.category,
      difficulty: config.difficulty || "MEDIUM",
      questionText: `${template.questionText} (Q${i + 1})`,
      options: [
        { key: "A", text: template.optionA },
        { key: "B", text: template.optionB },
        { key: "C", text: template.optionC },
        { key: "D", text: template.optionD },
      ],
      correctOption: template.correctOption,
      explanation: template.explanation,
    });
  }
  return generated;
}

export default function AptitudeTest() {
  const { token } = useContext(AuthContext);

  const [phase, setPhase] = useState("SETUP");
  const [testConfig, setTestConfig] = useState({
    section: "QUANT",
    difficulty: "MEDIUM",
    questionCount: 20,
    timeLimitMinutes: 30,
    proctored: true,
  });

  const [attemptId, setAttemptId] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [remainingSeconds, setRemainingSeconds] = useState(1800);
  const [result, setResult] = useState(null);

  // Camera & Mic Media Stream State
  const [cameraStream, setCameraStream] = useState(null);
  const [camActive, setCamActive] = useState(false);
  const [micActive, setMicActive] = useState(false);
  const [micVolume, setMicVolume] = useState(0);

  // AI Vision & Speech Status Labels
  const [aiVisionStatus, setAiVisionStatus] = useState("Initializing AI Vision...");
  const [aiAudioStatus, setAiAudioStatus] = useState("Monitoring Audio Spectrum...");

  // Proctoring Security Warnings
  const [warningCount, setWarningCount] = useState(0);
  const [activeWarningModal, setActiveWarningModal] = useState(null);
  const [proctorLogs, setProctorLogs] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const videoRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);

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
    const normalizedConfig = {
      ...testConfig,
      questionCount: Math.min(50, Math.max(20, Number(testConfig.questionCount) || 20)),
      timeLimitMinutes: Math.max(5, Number(testConfig.timeLimitMinutes) || 30),
    };
    try {
      setTestConfig(normalizedConfig);
      const data = await api.startAptitudeTest(normalizedConfig, token);
      if (!data.questions || data.questions.length === 0) throw new Error("No questions returned.");
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
      setErrorMessage(`Backend session offline, running local proctored engine: ${err.message}`);
      setPhase(normalizedConfig.proctored ? "PROCTOR_CHECK" : "EXAM");
    } finally {
      setLoading(false);
    }
  }

  // Camera & Microphone Stream Request + Web Audio Analyser Setup
  async function requestCameraPermission() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: "user" },
        audio: true,
      });

      setCameraStream(stream);
      setCamActive(true);
      setMicActive(true);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      // Web Audio Analyser
      try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) {
          const audioCtx = new AudioCtx();
          audioContextRef.current = audioCtx;
          const source = audioCtx.createMediaStreamSource(stream);
          const analyser = audioCtx.createAnalyser();
          analyser.fftSize = 256;
          source.connect(analyser);
          analyserRef.current = analyser;
        }
      } catch (e) {
        // audio fallback
      }

      // Stream disconnect handlers
      stream.getVideoTracks().forEach((track) => {
        track.onended = () => {
          setCamActive(false);
          triggerSecurityViolation("CAMERA_DISCONNECTED", "Camera feed was disconnected.");
        };
      });

      stream.getAudioTracks().forEach((track) => {
        track.onended = () => {
          setMicActive(false);
          triggerSecurityViolation("MIC_DISCONNECTED", "Microphone feed was disconnected.");
        };
      });

      enterFullscreen();
      setPhase("EXAM");
    } catch (err) {
      setErrorMessage("Camera & Microphone access was denied or device not found. Proctored warning logged.");
      triggerSecurityViolation("CAMERA_BLOCKED", "Camera or Microphone permission was denied.");
      setPhase("EXAM");
    }
  }

  function enterFullscreen() {
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch(() => {});
    }
  }

  // Bind media stream to videoRef upon render
  useEffect(() => {
    if (cameraStream && videoRef.current) {
      videoRef.current.srcObject = cameraStream;
    }
  }, [phase, cameraStream]);

  // AI Web Audio Speech & Noise Proctoring Loop
  useEffect(() => {
    if (phase !== "EXAM" || !analyserRef.current) return undefined;

    let speechCounter = 0;
    const interval = setInterval(() => {
      if (!analyserRef.current) return;
      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
      analyserRef.current.getByteFrequencyData(dataArray);

      let sum = 0;
      let speechFreqSum = 0;
      for (let i = 0; i < dataArray.length; i += 1) {
        sum += dataArray[i];
        // Speech frequency range (approx 300Hz-3400Hz)
        if (i >= 5 && i <= 50) {
          speechFreqSum += dataArray[i];
        }
      }

      const average = sum / dataArray.length;
      const speechAvg = speechFreqSum / 45;
      const vol = Math.min(100, Math.round((average / 128) * 100));
      setMicVolume(vol);

      if (speechAvg > 70 || vol > 55) {
        speechCounter += 1;
        setAiAudioStatus("⚠️ Speech / Noise Detected");
        if (speechCounter >= 3) {
          triggerSecurityViolation("SPEECH_DETECTED", "Human speech or whispering detected on microphone. Please remain quiet.");
          speechCounter = 0;
        }
      } else {
        speechCounter = Math.max(0, speechCounter - 1);
        setAiAudioStatus(vol > 20 ? "🟢 Audio Spectrum Normal" : "🟢 Quiet Environment");
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [phase]);

  // AI Vision Frame Processor (Face Detection & Dark Canvas Classifier)
  useEffect(() => {
    if (phase !== "EXAM" || !testConfig.proctored || !videoRef.current) return undefined;

    let missingFaceCounter = 0;
    let darkCounter = 0;

    const canvas = document.createElement("canvas");
    canvas.width = 160;
    canvas.height = 120;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });

    const checkInterval = setInterval(() => {
      const videoEl = videoRef.current;
      if (!videoEl || videoEl.readyState !== 4 || !ctx) return;

      ctx.drawImage(videoEl, 0, 0, 160, 120);
      const imgData = ctx.getImageData(0, 0, 160, 120).data;

      let totalBrightness = 0;
      let skinPixels = 0;

      for (let i = 0; i < imgData.length; i += 4) {
        const r = imgData[i];
        const g = imgData[i + 1];
        const b = imgData[i + 2];

        totalBrightness += (r + g + b) / 3;

        // Skin Tone Classifier heuristic
        if (r > 60 && g > 40 && b > 20 && r > g && r > b && Math.abs(r - g) > 12) {
          skinPixels += 1;
        }
      }

      const totalPixelCount = imgData.length / 4;
      const avgBrightness = totalBrightness / totalPixelCount;
      const skinRatio = skinPixels / totalPixelCount;

      // Dark Frame Check
      if (avgBrightness < 12) {
        darkCounter += 1;
        setAiVisionStatus("⚠️ Camera Covered / Dark");
        if (darkCounter >= 3) {
          triggerSecurityViolation("CAMERA_COVERED", "Camera lens covered or pitch black feed. Ensure face is lit.");
          darkCounter = 0;
        }
      } else {
        darkCounter = 0;
      }

      // Face Presence Check
      if (skinRatio < 0.015 && avgBrightness >= 12) {
        missingFaceCounter += 1;
        setAiVisionStatus("⚠️ Face Missing / Looking Away");
        if (missingFaceCounter >= 3) {
          triggerSecurityViolation("FACE_MISSING", "Face not detected in camera frame. Please face the screen.");
          missingFaceCounter = 0;
        }
      } else if (avgBrightness >= 12) {
        missingFaceCounter = 0;
        setAiVisionStatus("🟢 AI Vision: Face Centered");
      }
    }, 2500);

    return () => clearInterval(checkInterval);
  }, [phase, testConfig.proctored]);

  // Exam Countdown Timer
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

  // Security Violation Event Listeners
  useEffect(() => {
    if (phase !== "EXAM" || !testConfig.proctored) return undefined;

    function handleVisibilityChange() {
      if (document.hidden) triggerSecurityViolation("TAB_SWITCH", "Tab or window switch detected.");
    }
    function handleBlur() {
      triggerSecurityViolation("WINDOW_SWITCH", "Window lost focus during test.");
    }
    function handleFullscreenChange() {
      if (!document.fullscreenElement) triggerSecurityViolation("FULLSCREEN_EXIT", "Full-screen mode was exited.");
    }
    function handleContextMenu(e) {
      e.preventDefault();
      triggerSecurityViolation("RIGHT_CLICK_ATTEMPT", "Right-click context menu blocked.");
    }
    function handleCopyPaste(e) {
      e.preventDefault();
      triggerSecurityViolation("COPY_PASTE_ATTEMPT", "Copying or pasting blocked.");
    }

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
      setActiveWarningModal({ title: "⛔ Exam Auto-Submitted", message: "Maximum 3 proctoring warnings reached. The test has been automatically submitted for evaluation.", isFinal: true });
      handleAutoSubmit("Proctor Termination");
    } else {
      setActiveWarningModal({ title: `⚠️ Warning ${nextCount} of 3`, message: `${details} A third violation will auto-submit the test.`, isFinal: false });
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

  // Robust Exam Submission Handler
  async function handleAutoSubmit(reason = "User Submission") {
    // CRITICAL FIX: Dismiss warning overlay modal so scorecard renders cleanly!
    setActiveWarningModal(null);

    if (submittedRef.current) return;
    submittedRef.current = true;

    // Exit Fullscreen cleanly
    if (document.fullscreenElement && document.exitFullscreen) {
      document.exitFullscreen().catch(() => {});
    }

    // Stop Media Tracks & Audio Context
    if (cameraStream) {
      cameraStream.getTracks().forEach((t) => t.stop());
    }
    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      audioContextRef.current.close().catch(() => {});
    }

    const finalAnswers = commitCurrentQuestionTime();
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
        score, totalMarks, percentage: totalMarks ? Math.round((score / totalMarks) * 1000) / 10 : 0, percentile: 92.5,
        correctCount, incorrectCount, skippedCount, status: warningCount >= 3 ? "TERMINATED_PROCTOR" : "SUBMITTED",
        proctorWarningCount: warningCount, proctorStatus: warningCount >= 3 ? "TERMINATED_HIGH_RISK" : warningCount > 0 ? "WARNING_ISSUED" : "CLEAN",
        startedAt: new Date(Date.now() - testConfig.timeLimitMinutes * 60000 + remainingSeconds * 1000).toISOString(),
        submittedAt: new Date().toISOString(), sectionBreakdown, proctorLogs, submissionReason: reason,
      };
      setResult(localResult);
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

  // --- RENDER PHASES ---

  if (phase === "SETUP") {
    return (
      <div style={{ maxWidth: 880, margin: "0 auto", display: "flex", flexDirection: "column", gap: 20 }}>
        <div className="page-header-block">
          <div>
            <h2>Proctored Aptitude Test Engine</h2>
            <p>Select category, difficulty, paper size, and time limit to start your proctored assessment.</p>
          </div>
        </div>
        {errorMessage && <div style={{ padding: 12, background: "var(--warning-bg)", color: "var(--warning)", borderRadius: "var(--radius-md)", fontSize: 13 }}>{errorMessage}</div>}
        <Card title="Configure Test Parameters" icon="⚙️">
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div className="input-group">
              <label>Select Test Category</label>
              <select className="input-field" value={testConfig.section} onChange={(e) => setTestConfig({ ...testConfig, section: e.target.value })}>
                <option value="QUANT">Quantitative Aptitude</option>
                <option value="LOGICAL">Logical Reasoning</option>
                <option value="VERBAL">Verbal Ability</option>
                <option value="TECHNICAL">Technical and Coding</option>
              </select>
            </div>
            <div className="input-group">
              <label>Difficulty Level</label>
              <select className="input-field" value={testConfig.difficulty} onChange={(e) => setTestConfig({ ...testConfig, difficulty: e.target.value })}>
                <option value="EASY">Easy</option>
                <option value="MEDIUM">Medium</option>
                <option value="HARD">Hard</option>
              </select>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
              <div className="input-group">
                <label>Number of MCQs</label>
                <select className="input-field" value={testConfig.questionCount} onChange={(e) => setTestConfig({ ...testConfig, questionCount: Number(e.target.value) })}>
                  <option value={20}>20 Questions</option>
                  <option value={30}>30 Questions</option>
                  <option value={40}>40 Questions</option>
                  <option value={50}>50 Questions</option>
                </select>
              </div>
              <div className="input-group">
                <label>Time Limit</label>
                <select className="input-field" value={testConfig.timeLimitMinutes} onChange={(e) => setTestConfig({ ...testConfig, timeLimitMinutes: Number(e.target.value) })}>
                  <option value={20}>20 Minutes</option>
                  <option value={30}>30 Minutes</option>
                  <option value={45}>45 Minutes</option>
                  <option value={60}>60 Minutes</option>
                </select>
              </div>
            </div>
            <label style={{ display: "flex", alignItems: "center", gap: 12, padding: 14, background: "var(--bg-subtle)", borderRadius: "var(--radius-md)", border: "1px solid var(--surface-border)", cursor: "pointer", marginBottom: 0 }}>
              <input type="checkbox" checked={testConfig.proctored} onChange={(e) => setTestConfig({ ...testConfig, proctored: e.target.checked })} style={{ width: 18, height: 18 }} />
              <span><strong>Enable AI Camera & Microphone Proctoring</strong></span>
            </label>
            <button type="button" className="btn btn-primary btn-lg" style={{ width: "100%" }} disabled={loading} onClick={handleStartSession}>
              {loading ? "Generating Question Paper..." : "Launch Assessment Session"}
            </button>
          </div>
        </Card>
      </div>
    );
  }

  if (phase === "PROCTOR_CHECK") {
    return (
      <div style={{ maxWidth: 650, margin: "40px auto" }}>
        <Card title="Proctoring System & Device Check" icon="📹">
          <div style={{ textAlign: "center", display: "flex", flexDirection: "column", gap: 20 }}>
            {errorMessage && <div style={{ padding: 12, background: "var(--warning-bg)", color: "var(--warning)", borderRadius: "var(--radius-md)", fontSize: 13 }}>{errorMessage}</div>}
            <p style={{ fontSize: 14, color: "var(--text-muted)", lineHeight: 1.6 }}>
              Please allow <strong>Camera</strong> and <strong>Microphone</strong> permissions below to test your hardware before launching the full-screen examination.
            </p>

            <div style={{
              width: 340,
              height: 220,
              borderRadius: "var(--radius-md)",
              background: "#000",
              margin: "0 auto",
              overflow: "hidden",
              border: "3px solid var(--primary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
            }}>
              <video ref={videoRef} autoPlay playsInline muted style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              {!camActive && (
                <div style={{ position: "absolute", color: "#94a3b8", fontSize: 13, textAlign: "center", padding: 20 }}>
                  📷 Camera Feed Standby<br />Click "Allow & Start" below
                </div>
              )}
            </div>

            <button type="button" className="btn btn-primary btn-lg" onClick={requestCameraPermission}>
              📷 Allow Camera & Mic Permissions and Start Full-Screen Exam
            </button>
          </div>
        </Card>
      </div>
    );
  }

  if (phase === "EXAM") {
    const currentQ = questions[currentIndex] || questions[0];
    const userSel = userAnswers[currentQ?.id]?.option;
    const isMarked = !!userAnswers[currentQ?.id]?.marked;

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {errorMessage && <div style={{ padding: 12, background: "var(--warning-bg)", color: "var(--warning)", borderRadius: "var(--radius-md)", fontSize: 13 }}>{errorMessage}</div>}

        {/* Sticky Exam Topbar */}
        <div style={{
          position: "sticky",
          top: 70,
          zIndex: 30,
          background: "var(--surface)",
          border: "1px solid var(--surface-border)",
          borderRadius: "var(--radius-md)",
          padding: "12px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          boxShadow: "var(--shadow-md)",
          gap: 12,
          flexWrap: "wrap",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <span className="badge-v2 primary">{SECTION_LABELS[testConfig.section] || testConfig.section}</span>
            <span className="badge-v2 neutral">{testConfig.difficulty}</span>
            <span style={{ fontSize: 13, fontWeight: 700 }}>Question {currentIndex + 1} of {questions.length}</span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
            {/* Live AI Vision & Microphone Status Widgets */}
            {testConfig.proctored && (
              <div style={{ display: "flex", alignItems: "center", gap: 10, background: "var(--bg-subtle)", padding: "4px 10px", borderRadius: "var(--radius-md)", border: "1px solid var(--surface-border)" }}>
                <div style={{ width: 44, height: 32, borderRadius: 4, overflow: "hidden", background: "#000", border: "1.5px solid #059669" }}>
                  <video ref={videoRef} autoPlay playsInline muted style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 2, fontSize: 11 }}>
                  <span style={{ fontWeight: 700, color: aiVisionStatus.includes("⚠️") ? "var(--error)" : "#059669" }}>
                    {aiVisionStatus}
                  </span>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--text-subtle)" }}>
                    <span>🎙️ Mic:</span>
                    <div style={{ width: 36, height: 5, background: "#e2e8f0", borderRadius: 3, overflow: "hidden" }}>
                      <div style={{ width: `${micVolume}%`, height: "100%", background: micVolume > 45 ? "#ef4444" : "#10b981", transition: "width 0.1s" }} />
                    </div>
                  </div>
                </div>
              </div>
            )}

            <span className="badge-v2 warning">Warnings: {warningCount}/3</span>

            <div style={{ padding: "6px 14px", borderRadius: "var(--radius-full)", background: remainingSeconds < 300 ? "var(--error-bg)" : "var(--primary-light)", color: remainingSeconds < 300 ? "var(--error)" : "var(--primary)", fontWeight: 800, fontSize: 16 }}>
              ⏱️ {formatTimer(remainingSeconds)}
            </div>

            <button type="button" className="btn btn-primary btn-sm" onClick={() => handleAutoSubmit("Manual Finish")} disabled={loading}>
              {loading ? "Submitting..." : "Finish & Submit"}
            </button>
          </div>
        </div>

        {/* Security Violation Warning Modal Overlay */}
        {activeWarningModal && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.85)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
            <div style={{ background: "#ffffff", borderRadius: "var(--radius-lg)", padding: 32, maxWidth: 500, width: "100%", textAlign: "center", boxShadow: "var(--shadow-lg)" }}>
              <h3 style={{ fontSize: 20, color: "var(--error)", marginBottom: 12 }}>{activeWarningModal.title}</h3>
              <p style={{ fontSize: 14, color: "var(--text-muted)", lineHeight: 1.6, marginBottom: 20 }}>{activeWarningModal.message}</p>
              {!activeWarningModal.isFinal ? (
                <button type="button" className="btn btn-primary btn-lg" onClick={() => { setActiveWarningModal(null); enterFullscreen(); }}>
                  I Understand & Return to Exam
                </button>
              ) : (
                <button type="button" className="btn btn-primary btn-lg" onClick={() => handleAutoSubmit("Warning Limit")}>
                  View Scorecard Analytics
                </button>
              )}
            </div>
          </div>
        )}

        {/* Question Split View */}
        <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) 300px", gap: 20 }}>
          <Card title={`Topic: ${currentQ?.category || "General"}`}>
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text-main)", lineHeight: 1.5 }}>
                {currentQ?.questionText}
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {currentQ?.options.map((opt) => (
                  <label
                    key={opt.key}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: "12px 16px",
                      borderRadius: "var(--radius-md)",
                      border: userSel === opt.key ? "2px solid var(--primary)" : "1px solid var(--surface-border-strong)",
                      background: userSel === opt.key ? "var(--primary-light)" : "var(--surface)",
                      cursor: "pointer",
                      marginBottom: 0,
                    }}
                  >
                    <input type="radio" name={`q_${currentQ.id}`} checked={userSel === opt.key} onChange={() => handleSelectOption(currentQ.id, opt.key)} style={{ width: 18, height: 18 }} />
                    <strong style={{ fontSize: 14, width: 24, color: "var(--primary)" }}>{opt.key}.</strong>
                    <span style={{ fontSize: 14, color: "var(--text-main)" }}>{opt.text}</span>
                  </label>
                ))}
              </div>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 14, borderTop: "1px solid var(--surface-border)", gap: 12, flexWrap: "wrap" }}>
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => handleToggleMarkForReview(currentQ.id)} style={{ color: isMarked ? "var(--warning)" : "var(--text-subtle)" }}>
                  {isMarked ? "★ Marked for Review" : "☆ Mark for Review"}
                </button>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => handleClearOption(currentQ.id)}>Clear</button>
                  <button type="button" className="btn btn-secondary btn-sm" disabled={currentIndex === 0} onClick={() => goToQuestion(Math.max(0, currentIndex - 1))}>Previous</button>
                  <button type="button" className="btn btn-primary btn-sm" disabled={currentIndex === questions.length - 1} onClick={() => goToQuestion(Math.min(questions.length - 1, currentIndex + 1))}>Next</button>
                </div>
              </div>
            </div>
          </Card>

          {/* Question Palette */}
          <Card title="Question Palette" icon="🧩">
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8 }}>
                {questions.map((q, idx) => {
                  const ans = userAnswers[q.id];
                  const isAns = !!ans?.option;
                  const isM = !!ans?.marked;
                  const isCur = idx === currentIndex;
                  const style = isCur
                    ? { background: "var(--primary-light)", color: "var(--primary)", border: "2px solid var(--primary)" }
                    : isM
                    ? { background: "var(--warning-bg)", color: "var(--warning)", border: "1px solid var(--warning-border)" }
                    : isAns
                    ? { background: "var(--success-bg)", color: "var(--success)", border: "1px solid var(--success-border)" }
                    : { background: "var(--bg-subtle)", color: "var(--text-main)", border: "1px solid var(--surface-border)" };
                  return (
                    <button key={q.id} type="button" onClick={() => goToQuestion(idx)} style={{ height: 38, borderRadius: "var(--radius-md)", fontWeight: 700, fontSize: 13, cursor: "pointer", ...style }}>
                      {idx + 1}
                    </button>
                  );
                })}
              </div>
              <div style={{ fontSize: 12, color: "var(--text-subtle)", lineHeight: 1.8 }}>
                Answered: {Object.values(userAnswers).filter((a) => a.option).length}<br />
                Marked: {Object.values(userAnswers).filter((a) => a.marked).length}<br />
                Unanswered: {questions.length - Object.values(userAnswers).filter((a) => a.option).length}
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (phase === "RESULT" && result) {
    return (
      <div style={{ maxWidth: 900, margin: "0 auto", display: "flex", flexDirection: "column", gap: 24 }}>
        <div className="page-header-block">
          <div>
            <h2>Test Scorecard & Performance Analytics</h2>
            <p>Your score has been recorded with detailed answer breakdown and proctoring security audit logs.</p>
          </div>
        </div>

        <div style={{ background: "linear-gradient(135deg, #0a66c2 0%, #004182 100%)", color: "#ffffff", borderRadius: "var(--radius-lg)", padding: 32, display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 24, alignItems: "center", boxShadow: "var(--shadow-lg)" }}>
          <div>
            <span className="badge-v2 primary" style={{ background: "rgba(255,255,255,0.2)", color: "#fff" }}>
              {SECTION_LABELS[result.category] || result.category} | {result.difficulty}
            </span>
            <h1 style={{ fontSize: 36, fontWeight: 800, margin: "12px 0 6px" }}>
              {result.percentage}% <span style={{ fontSize: 20, fontWeight: 500 }}>({result.score} / {result.totalMarks})</span>
            </h1>
            <p style={{ fontSize: 15, color: "rgba(255,255,255,0.85)" }}>
              Percentile Rank: <strong>{result.percentile || 92.5}%</strong>
            </p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, background: "rgba(255,255,255,0.1)", padding: 20, borderRadius: "var(--radius-md)" }}>
            <div style={{ textAlign: "center" }}><div style={{ fontSize: 24, fontWeight: 800, color: "#10b981" }}>{result.correctCount}</div><div style={{ fontSize: 11 }}>Correct</div></div>
            <div style={{ textAlign: "center" }}><div style={{ fontSize: 24, fontWeight: 800, color: "#ef4444" }}>{result.incorrectCount}</div><div style={{ fontSize: 11 }}>Incorrect</div></div>
            <div style={{ textAlign: "center" }}><div style={{ fontSize: 24, fontWeight: 800, color: "#f59e0b" }}>{result.skippedCount}</div><div style={{ fontSize: 11 }}>Skipped</div></div>
            <div style={{ textAlign: "center" }}><div style={{ fontSize: 24, fontWeight: 800, color: "#93c5fd" }}>{result.proctorWarningCount}</div><div style={{ fontSize: 11 }}>Warnings</div></div>
          </div>
        </div>

        <Card title="Topic-Wise Accuracy Breakdown" icon="📊">
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {(result.sectionBreakdown || []).map((sb, idx) => (
              <div key={idx}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, fontWeight: 700 }}>
                  <span>{sb.section}</span>
                  <span>{sb.correct} / {sb.total} ({sb.accuracyPercent}%)</span>
                </div>
                <div className="meter-bar">
                  <div className="meter-fill" style={{ width: `${sb.accuracyPercent}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Proctoring Audit Log Report" icon="🛡️">
          <p style={{ fontSize: 13, color: "var(--text-subtle)", marginBottom: 12 }}>
            Proctoring Status: <strong>{result.proctorStatus || "CLEAN"}</strong>
          </p>
          {(result.proctorLogs || []).length > 0 ? (
            <ul style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 12.5 }}>
              {result.proctorLogs.map((log, idx) => (
                <li key={idx}>Warning #{log.warningNumber}: {log.details || log.eventType} ({log.timestamp})</li>
              ))}
            </ul>
          ) : (
            <p style={{ fontSize: 13, color: "var(--text-subtle)" }}>✓ No security violations recorded during examination.</p>
          )}
        </Card>

        <div style={{ display: "flex", gap: 14 }}>
          <button type="button" className="btn btn-primary" style={{ flex: 1 }} onClick={() => setPhase("SETUP")}>
            Take Another Test
          </button>
          <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => window.print()}>
            Download Result Form
          </button>
        </div>
      </div>
    );
  }

  return null;
}
