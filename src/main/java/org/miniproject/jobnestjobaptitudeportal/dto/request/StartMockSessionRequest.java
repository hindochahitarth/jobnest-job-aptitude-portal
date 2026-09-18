package org.miniproject.jobnestjobaptitudeportal.dto.request;

public record StartMockSessionRequest(
        String targetRole,
        String subject,
        String candidateSkills,
        String jobDescription
) {
}
