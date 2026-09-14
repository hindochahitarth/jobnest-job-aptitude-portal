package org.miniproject.jobnestjobaptitudeportal.dto.response;

public record InterviewQuestionDTO(
        Long id,
        String role,
        String subject,
        String skill,
        String difficulty,
        String questionText,
        String sampleAnswer,
        String aiTips
) {
}
