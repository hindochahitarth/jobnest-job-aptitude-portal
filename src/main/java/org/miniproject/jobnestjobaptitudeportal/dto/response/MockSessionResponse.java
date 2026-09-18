package org.miniproject.jobnestjobaptitudeportal.dto.response;

import java.util.List;

/**
 * Returned by start-session and get-session endpoints.
 * Contains the full question list and current session state.
 */
public record MockSessionResponse(
        Long sessionId,
        String status,
        String targetRole,
        int completedCount,
        int totalDurationSeconds,
        int maxQuestions,
        int maxDurationSeconds,
        List<MockQuestionEntry> questions,
        MockSessionSummary summary   // non-null when session has ended
) {

    public record MockQuestionEntry(
            int index,
            String questionText,
            String skill,
            String difficulty,
            // filled after the answer is evaluated
            String candidateAnswer,
            Integer score,
            String grade,
            java.util.List<String> strengths,
            java.util.List<String> improvements,
            String modelAnswer,
            String starAdvice
    ) {}

    public record MockSessionSummary(
            int overallScore,
            String summaryFeedback,
            String limitReason  // "questions" | "time" | "completed"
    ) {}
}
