package org.miniproject.jobnestjobaptitudeportal.dto.response;

import java.time.Instant;
import java.util.List;
import org.miniproject.jobnestjobaptitudeportal.enums.Difficulty;

public record TestSessionResponse(
        Long attemptId,
        String category,
        Difficulty difficulty,
        Integer totalQuestions,
        Integer timeLimitMinutes,
        Long remainingSeconds,
        Instant startedAt,
        List<QuestionDTO> questions
) {
}
