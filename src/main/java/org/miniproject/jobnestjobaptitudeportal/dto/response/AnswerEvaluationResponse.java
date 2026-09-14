package org.miniproject.jobnestjobaptitudeportal.dto.response;

import java.util.List;

public record AnswerEvaluationResponse(
        int score,
        String grade,
        List<String> strengths,
        List<String> improvements,
        String modelAnswer,
        String starAdvice
) {
}
