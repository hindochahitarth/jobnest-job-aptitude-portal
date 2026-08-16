package org.miniproject.jobnestjobaptitudeportal.dto.request;

import java.util.List;

public record ProfileUpdateRequest(
        String headline,
        String location,
        String bio,
        List<String> techStack,
        String experienceLevel,
        String githubUrl,
        String linkedinUrl
) {
}
