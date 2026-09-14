package org.miniproject.jobnestjobaptitudeportal.dto.request;

public record AiInterviewGenerateRequest(
        String targetRole,
        String jobDescription,
        String candidateSkills,
        String subject
) {
}
