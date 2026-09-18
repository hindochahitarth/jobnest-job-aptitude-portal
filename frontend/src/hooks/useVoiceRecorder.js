import { useCallback, useEffect, useRef, useState } from "react";

/**
 * useVoiceRecorder
 *
 * Wraps the browser's Web Speech API (SpeechRecognition) for live
 * speech-to-text transcription AND MediaStream for camera/mic feed.
 *
 * IMPORTANT: Does NOT auto-acquire media on mount.
 * Call requestMedia() explicitly only when the interview actually starts.
 * Call releaseMedia() explicitly to stop tracks immediately (e.g. on End,
 * navigate away, or session reset) — do not wait for component unmount.
 *
 * Returns:
 *   stream          — MediaStream (for <video> element), null until requestMedia()
 *   transcript      — live cumulative transcript string
 *   interimText     — in-progress (not yet confirmed) words
 *   isListening     — boolean
 *   isMicOn         — boolean (can toggle mute)
 *   isCamOn         — boolean (can toggle camera)
 *   supported       — boolean (browser supports SpeechRecognition)
 *   permissionError — string | null
 *   startListening  — fn()
 *   stopListening   — fn()
 *   resetTranscript — fn()
 *   toggleMic       — fn()
 *   toggleCam       — fn()
 *   requestMedia    — fn() — call when interview starts
 *   releaseMedia    — fn() — call when interview ends / user navigates away
 */
export function useVoiceRecorder() {
  const [stream, setStream] = useState(null);
  const [transcript, setTranscript] = useState("");
  const [interimText, setInterimText] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCamOn, setIsCamOn] = useState(true);
  const [permissionError, setPermissionError] = useState(null);

  const recognitionRef = useRef(null);
  const streamRef = useRef(null);
  const transcriptRef = useRef("");

  // ------------------------------------------------------------------
  // Browser support check
  // ------------------------------------------------------------------
  const SpeechRecognition =
    typeof window !== "undefined"
      ? window.SpeechRecognition || window.webkitSpeechRecognition
      : null;
  const supported = Boolean(SpeechRecognition);

  // ------------------------------------------------------------------
  // releaseMedia — stop ALL tracks and speech recognition immediately.
  // Call this whenever you want the camera/mic indicator to turn off NOW.
  // ------------------------------------------------------------------
  const releaseMedia = useCallback(() => {
    // Stop speech recognition first
    try { recognitionRef.current?.stop(); } catch (_) {}
    recognitionRef.current = null;
    isListeningRef.current = false;
    setIsListening(false);
    setInterimText("");
    // Stop every media track — this turns off the camera/mic OS indicator
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setStream(null);
    setIsMicOn(true);
    setIsCamOn(true);
  }, []);

  // ------------------------------------------------------------------
  // Acquire camera + microphone (called explicitly, never on mount)
  // ------------------------------------------------------------------
  const requestMedia = useCallback(async () => {
    // Release any existing stream before requesting a new one
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setPermissionError(null);
    try {
      const ms = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: "user" },
        audio: true,
      });
      streamRef.current = ms;
      setStream(ms);
      setIsMicOn(true);
      setIsCamOn(true);
    } catch (err) {
      const msg =
        err.name === "NotAllowedError"
          ? "Camera/microphone permission denied. Please allow access and reload."
          : err.name === "NotFoundError"
          ? "No camera or microphone found."
          : `Media error: ${err.message}`;
      setPermissionError(msg);
    }
  }, []);

  // ------------------------------------------------------------------
  // Safety net: release on unmount in case caller forgot to call releaseMedia
  // ------------------------------------------------------------------
  useEffect(() => {
    return () => {
      try { recognitionRef.current?.stop(); } catch (_) {}
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  // ------------------------------------------------------------------
  // Speech Recognition setup
  // ------------------------------------------------------------------
  const buildRecognition = useCallback(() => {
    if (!SpeechRecognition) return null;
    const r = new SpeechRecognition();
    r.continuous = true;
    r.interimResults = true;
    r.lang = "en-US";
    r.maxAlternatives = 1;

    r.onresult = (event) => {
      let interim = "";
      let finalChunk = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const text = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalChunk += text + " ";
        } else {
          interim += text;
        }
      }
      if (finalChunk) {
        transcriptRef.current = (transcriptRef.current + finalChunk).trimStart();
        setTranscript(transcriptRef.current);
      }
      setInterimText(interim);
    };

    r.onerror = (e) => {
      // "no-speech" is benign — just restart; others we surface
      if (e.error !== "no-speech" && e.error !== "aborted") {
        setPermissionError(`Speech recognition error: ${e.error}`);
        setIsListening(false);
      }
    };

    r.onend = () => {
      // Auto-restart when continuous recognition drops (browser quirk)
      if (recognitionRef.current && isListeningRef.current) {
        try { recognitionRef.current.start(); } catch (_) {}
      }
    };

    return r;
  }, [SpeechRecognition]); // eslint-disable-line

  // keep a ref so onend closure can read it
  const isListeningRef = useRef(false);

  const startListening = useCallback(() => {
    if (!supported) return;
    resetTranscript();
    const r = buildRecognition();
    recognitionRef.current = r;
    isListeningRef.current = true;
    setIsListening(true);
    try { r.start(); } catch (_) {}
  }, [supported, buildRecognition]); // eslint-disable-line

  const stopListening = useCallback(() => {
    isListeningRef.current = false;
    setIsListening(false);
    setInterimText("");
    try { recognitionRef.current?.stop(); } catch (_) {}
    recognitionRef.current = null;
  }, []);

  const resetTranscript = useCallback(() => {
    transcriptRef.current = "";
    setTranscript("");
    setInterimText("");
  }, []);

  // ------------------------------------------------------------------
  // Toggle mic / cam
  // ------------------------------------------------------------------
  const toggleMic = useCallback(() => {
    const ms = streamRef.current;
    if (!ms) return;
    ms.getAudioTracks().forEach((t) => {
      t.enabled = !t.enabled;
    });
    setIsMicOn((v) => !v);
  }, []);

  const toggleCam = useCallback(() => {
    const ms = streamRef.current;
    if (!ms) return;
    ms.getVideoTracks().forEach((t) => {
      t.enabled = !t.enabled;
    });
    setIsCamOn((v) => !v);
  }, []);

  return {
    stream,
    transcript,
    interimText,
    isListening,
    isMicOn,
    isCamOn,
    supported,
    permissionError,
    startListening,
    stopListening,
    resetTranscript,
    toggleMic,
    toggleCam,
    requestMedia,
    releaseMedia,
  };
}
