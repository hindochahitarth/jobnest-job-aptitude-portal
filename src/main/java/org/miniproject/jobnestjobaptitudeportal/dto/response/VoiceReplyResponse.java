package org.miniproject.jobnestjobaptitudeportal.dto.response;

import java.util.List;

/**
 * Full response for the voice/conversational interview submit.
 * Contains both:
 *  - spokenReply: a natural-language sentence the AI "says" back to the candidate
 *  - All structured evaluation fields (same as MockSubmitResponse) so the UI
 *    can display the card and update session state in one round-trip.
 */
public record VoiceReplyResponse(
        // ---- spoken response (fed to TTS) ----
        String spokenReply,
        String transition,       // short bridging phrase to next question, e.g. "Let's move on…"
        // ---- structured evaluation ----
        int score,
        String grade,
        List<String> strengths,
        List<String> improvements,
        String modelAnswer,
        String starAdvice,
        // ---- updated session state ----
        Long sessionId,
        String sessionStatus,
        int completedCount,
        int totalDurationSeconds,
        boolean limitReached,
        String limitReason,
        MockSessionResponse.MockSessionSummary summary
) {
}
