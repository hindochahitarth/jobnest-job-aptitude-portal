package org.miniproject.jobnestjobaptitudeportal.dto.request;

public record EvaluateAnswerRequest(
        Long questionId,
        String questionText,
        String candidateAnswer
) {
}
