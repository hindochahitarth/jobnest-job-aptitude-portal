import { useCallback, useEffect, useRef, useState } from "react";
import * as api from "../services/api";

const MAX_QUESTIONS = 5;
const MAX_DURATION_SECONDS = 300;

/**
 * Dual-trigger freemium session state machine.
 * Supports both text-based and voice-based (spoken transcript) answer submission.
 *
 * Triggers:
 *   1. completedCount >= MAX_QUESTIONS  (5 questions)
 *   2. elapsedSeconds >= MAX_DURATION_SECONDS  (300 s / 5 min)
 *
 * Phases:
 *   idle -> starting -> active -> submitting -> speaking -> (limit_reached | completed) -> ended
 */
export function useInterviewSession(token) {
  const [phase, setPhase] = useState("idle");
  const [session, setSession] = useState(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answer, setAnswer] = useState("");
  const [lastEval, setLastEval] = useState(null);
  const [lastSpokenReply, setLastSpokenReply] = useState(null); // { spokenReply, transition }
  const [limitReached, setLimitReached] = useState(false);
  const [limitReason, setLimitReason] = useState(null);
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const timerRef = useRef(null);
  const elapsedRef = useRef(0);
  const isListeningTimerRef = useRef(false);

  // ------------------------------------------------------------------
  // Timer
  // ------------------------------------------------------------------
  const stopTimer = useCallback(() => {
    isListeningTimerRef.current = false;
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startTimer = useCallback((sessionObj) => {
    stopTimer();
    elapsedRef.current = sessionObj?.totalDurationSeconds ?? 0;
    setElapsedSeconds(elapsedRef.current);
    isListeningTimerRef.current = true;

    timerRef.current = setInterval(() => {
      elapsedRef.current += 1;
      setElapsedSeconds(elapsedRef.current);

      if (elapsedRef.current >= MAX_DURATION_SECONDS) {
        stopTimer();
        setLimitReached(true);
        setLimitReason("time");
        setPhase("ended");
        if (sessionObj?.sessionId) {
          api.forceEndMockSession(sessionObj.sessionId, elapsedRef.current, token)
            .then((res) => {
              setSession(res);
              if (res.summary) setSummary(res.summary);
            })
            .catch(() => {});
        }
      }
    }, 1000);
  }, [stopTimer, token]);

  useEffect(() => () => stopTimer(), [stopTimer]);

  // ------------------------------------------------------------------
  // Start session
  // ------------------------------------------------------------------
  const startSession = useCallback(async (setupPayload) => {
    setError(null);
    setPhase("starting");
    setLimitReached(false);
    setLimitReason(null);
    setSummary(null);
    setLastEval(null);
    setLastSpokenReply(null);
    setCurrentIdx(0);
    setAnswer("");

    try {
      const res = await api.startMockSession(setupPayload, token);
      setSession(res);
      setElapsedSeconds(res.totalDurationSeconds ?? 0);
      elapsedRef.current = res.totalDurationSeconds ?? 0;
      setPhase("active");
      startTimer(res);
    } catch (err) {
      setError(err.message);
      setPhase("idle");
    }
  }, [token, startTimer]);

  // ------------------------------------------------------------------
  // Submit a voice (spoken transcript) answer — returns spoken reply
  // ------------------------------------------------------------------
  const submitVoiceAnswer = useCallback(async (transcript) => {
    if (!session || phase !== "active" || !transcript?.trim()) return null;

    setError(null);
    setPhase("submitting");

    const question = session.questions?.[currentIdx];
    if (!question) { setPhase("active"); return null; }

    try {
      const res = await api.submitVoiceReply(
        {
          sessionId: session.sessionId,
          questionIndex: currentIdx,
          questionText: question.questionText,
          spokenTranscript: transcript.trim(),
          elapsedSeconds: elapsedRef.current,
        },
        token
      );

      // Merge into local session state
      setSession((prev) => {
        if (!prev) return prev;
        const updatedQuestions = [...prev.questions];
        updatedQuestions[currentIdx] = {
          ...updatedQuestions[currentIdx],
          candidateAnswer: transcript.trim(),
          score: res.score,
          grade: res.grade,
          strengths: res.strengths,
          improvements: res.improvements,
          modelAnswer: res.modelAnswer,
          starAdvice: res.starAdvice,
        };
        return {
          ...prev,
          completedCount: res.completedCount,
          totalDurationSeconds: res.totalDurationSeconds,
          status: res.sessionStatus,
          questions: updatedQuestions,
        };
      });

      setLastEval(res);
      setLastSpokenReply({ spokenReply: res.spokenReply, transition: res.transition });
      setAnswer("");

      // Phase moves to "speaking" — caller will advance to "active" after TTS finishes
      setPhase("speaking");

      if (res.limitReached) {
        stopTimer();
        setLimitReached(true);
        setLimitReason(res.limitReason);
        setSummary(res.summary);
        // phase will become "ended" after TTS finishes (caller calls advanceAfterSpeech)
      } else {
        setCurrentIdx((i) => i + 1);
      }

      return res;
    } catch (err) {
      setError(err.message);
      setPhase("active");
      return null;
    }
  }, [session, phase, currentIdx, token, stopTimer]);

  // ------------------------------------------------------------------
  // Submit a plain text answer (fallback / typed mode)
  // ------------------------------------------------------------------
  const submitAnswer = useCallback(async () => {
    if (!session || phase !== "active" || !answer.trim()) return;
    setError(null);
    setPhase("submitting");

    const question = session.questions?.[currentIdx];
    if (!question) { setPhase("active"); return; }

    try {
      const res = await api.submitMockAnswer(
        {
          sessionId: session.sessionId,
          questionIndex: currentIdx,
          questionText: question.questionText,
          candidateAnswer: answer.trim(),
          elapsedSeconds: elapsedRef.current,
        },
        token
      );

      setSession((prev) => {
        if (!prev) return prev;
        const updatedQuestions = [...prev.questions];
        updatedQuestions[currentIdx] = {
          ...updatedQuestions[currentIdx],
          candidateAnswer: answer.trim(),
          score: res.score, grade: res.grade,
          strengths: res.strengths, improvements: res.improvements,
          modelAnswer: res.modelAnswer, starAdvice: res.starAdvice,
        };
        return { ...prev, completedCount: res.completedCount,
          totalDurationSeconds: res.totalDurationSeconds,
          status: res.sessionStatus, questions: updatedQuestions };
      });

      setLastEval(res);
      setAnswer("");

      if (res.limitReached) {
        stopTimer();
        setLimitReached(true);
        setLimitReason(res.limitReason);
        setSummary(res.summary);
        setPhase("ended");
      } else {
        setCurrentIdx((i) => i + 1);
        setPhase("active");
      }
    } catch (err) {
      setError(err.message);
      setPhase("active");
    }
  }, [session, phase, answer, currentIdx, token, stopTimer]);

  // Called by the voice room after TTS finishes speaking the reply
  const advanceAfterSpeech = useCallback(() => {
    if (limitReached) {
      setPhase("ended");
    } else {
      setPhase("active");
    }
  }, [limitReached]);

  // ------------------------------------------------------------------
  // Force-end immediately (user presses End button mid-session)
  // Goes to "ended" with whatever answers were collected so far.
  // ------------------------------------------------------------------
  const endSession = useCallback(async () => {
    stopTimer();
    setLimitReached(true);
    setLimitReason("manual");
    setPhase("ended");
    // If session has no backend summary yet, build a client-side one from answered Qs
    if (session) {
      const answeredQs = (session.questions || []).filter(q => q.score != null);
      if (answeredQs.length > 0 && !summary) {
        const avg = Math.round(
          answeredQs.reduce((a, q) => a + (q.score ?? 0), 0) / answeredQs.length
        );
        setSummary({
          overallScore: avg,
          summaryFeedback:
            `You answered ${answeredQs.length} question${answeredQs.length !== 1 ? "s" : ""} ` +
            `with an average score of ${avg}/100. ` +
            (avg >= 75
              ? "Solid performance — review the individual question feedback below to sharpen your answers."
              : "Keep practising — focus on the improvement tips for each question below."),
          limitReason: "manual",
        });
      } else if (answeredQs.length === 0 && !summary) {
        setSummary({
          overallScore: 0,
          summaryFeedback: "The session was ended before any answers were submitted.",
          limitReason: "manual",
        });
      }
      // Also notify backend to close the session
      if (session.sessionId) {
        api.forceEndMockSession(session.sessionId, elapsedRef.current, token).catch(() => {});
      }
    }
  }, [stopTimer, session, summary, token]);

  // ------------------------------------------------------------------
  // Reset
  // ------------------------------------------------------------------
  const reset = useCallback(() => {
    stopTimer();
    setPhase("idle");
    setSession(null);
    setCurrentIdx(0);
    setAnswer("");
    setLastEval(null);
    setLastSpokenReply(null);
    setLimitReached(false);
    setLimitReason(null);
    setSummary(null);
    setError(null);
    setElapsedSeconds(0);
    elapsedRef.current = 0;
  }, [stopTimer]);

  // ------------------------------------------------------------------
  // Derived
  // ------------------------------------------------------------------
  const timeRemaining = Math.max(0, MAX_DURATION_SECONDS - elapsedSeconds);
  const currentQuestion = session?.questions?.[currentIdx] ?? null;
  const answeredCount = session?.completedCount ?? 0;

  return {
    phase,
    session,
    currentQuestion,
    currentIdx,
    answer,
    setAnswer,
    lastEval,
    lastSpokenReply,
    limitReached,
    limitReason,
    summary,
    error,
    elapsedSeconds,
    timeRemaining,
    answeredCount,
    maxQuestions: MAX_QUESTIONS,
    maxDurationSeconds: MAX_DURATION_SECONDS,
    startSession,
    submitVoiceAnswer,
    submitAnswer,
    advanceAfterSpeech,
    endSession,
    reset,
  };
}
