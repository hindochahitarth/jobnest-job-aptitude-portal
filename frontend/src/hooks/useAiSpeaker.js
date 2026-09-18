import { useCallback, useEffect, useRef, useState } from "react";

/**
 * useAiSpeaker
 *
 * Wraps the browser's Web Speech Synthesis API so the AI interviewer
 * can speak questions, feedback, and transitions aloud.
 *
 * Returns:
 *   speak(text, opts?)  — speak a string; cancels any current utterance first
 *   stop()              — immediately cancel current speech
 *   isSpeaking          — boolean
 *   supported           — boolean
 *   voiceName           — name of the selected voice
 */
export function useAiSpeaker() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceName, setVoiceName] = useState("");
  const utteranceRef = useRef(null);
  const pendingRef = useRef(null);

  const supported =
    typeof window !== "undefined" && "speechSynthesis" in window;

  // ------------------------------------------------------------------
  // Pick the best English voice once voices are loaded
  // ------------------------------------------------------------------
  useEffect(() => {
    if (!supported) return;

    const pickVoice = () => {
      const voices = window.speechSynthesis.getVoices();
      // Prefer a female en-US voice for the "AI interviewer" persona
      const preferred = voices.find(
        (v) =>
          v.lang.startsWith("en") &&
          (v.name.includes("Female") ||
            v.name.toLowerCase().includes("samantha") ||
            v.name.toLowerCase().includes("zira") ||
            v.name.toLowerCase().includes("google us english") ||
            v.name.toLowerCase().includes("karen"))
      );
      const fallback = voices.find((v) => v.lang.startsWith("en"));
      const chosen = preferred || fallback;
      if (chosen) setVoiceName(chosen.name);
    };

    pickVoice();
    window.speechSynthesis.addEventListener("voiceschanged", pickVoice);
    return () =>
      window.speechSynthesis.removeEventListener("voiceschanged", pickVoice);
  }, [supported]);

  // ------------------------------------------------------------------
  // stop
  // ------------------------------------------------------------------
  const stop = useCallback(() => {
    if (!supported) return;
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    pendingRef.current = null;
  }, [supported]);

  // ------------------------------------------------------------------
  // speak
  // ------------------------------------------------------------------
  const speak = useCallback(
    (text, { rate = 0.95, pitch = 1.0, volume = 1.0 } = {}) => {
      if (!supported || !text) return;
      stop();

      const voices = window.speechSynthesis.getVoices();
      const voice =
        voices.find((v) => v.name === voiceName) ||
        voices.find((v) => v.lang.startsWith("en")) ||
        null;

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.voice = voice;
      utterance.rate = rate;
      utterance.pitch = pitch;
      utterance.volume = volume;
      utterance.lang = "en-US";

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      utteranceRef.current = utterance;

      // Chrome bug: speechSynthesis stops speaking after ~15s when page is
      // not focused. Workaround: resume every 10s while speaking.
      const keepAlive = setInterval(() => {
        if (window.speechSynthesis.speaking) {
          window.speechSynthesis.pause();
          window.speechSynthesis.resume();
        } else {
          clearInterval(keepAlive);
        }
      }, 10000);

      utterance.onend = () => {
        setIsSpeaking(false);
        clearInterval(keepAlive);
      };
      utterance.onerror = () => {
        setIsSpeaking(false);
        clearInterval(keepAlive);
      };

      window.speechSynthesis.speak(utterance);
    },
    [supported, voiceName, stop]
  );

  // Cleanup on unmount
  useEffect(() => () => stop(), [stop]);

  return { speak, stop, isSpeaking, supported, voiceName };
}
