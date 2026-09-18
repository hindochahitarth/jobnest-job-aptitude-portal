package org.miniproject.jobnestjobaptitudeportal.dto.response;

import java.util.List;

/**
 * Returned by submit-answer endpoint.
 * Carries the individual evaluation result plus updated session state.
 */
public record MockSubmitResponse(
        // individual answer evaluation
        int score,
        String grade,
        List<String> strengths,
        List<String> improvements,
        String modelAnswer,
        String starAdvice,
        // updated session state
        Long sessionId,
        String sessionStatus,
        int completedCount,
        int totalDurationSeconds,
        boolean limitReached,
        String limitReason,   // "questions" | "time" | null
        MockSessionResponse.MockSessionSummary summary  // non-null when limitReached
) {
}
