package org.miniproject.jobnestjobaptitudeportal.dto.request;

public record SubmitMockAnswerRequest(
        Long sessionId,
        int questionIndex,
        String questionText,
        String candidateAnswer,
        int elapsedSeconds
) {
}
