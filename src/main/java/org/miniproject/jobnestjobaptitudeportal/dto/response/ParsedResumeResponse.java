package org.miniproject.jobnestjobaptitudeportal.dto.response;

import java.time.Instant;
import java.util.List;

public record ParsedResumeResponse(
        Long resumeId,
        String fileName,
        String name,
        String email,
        String headline,
        String summary,
        List<String> skills,
        List<String> experience,
        List<String> education,
        int atsScore,
        Instant uploadedAt
) {
}
