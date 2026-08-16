package org.miniproject.jobnestjobaptitudeportal.dto.response;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import org.miniproject.jobnestjobaptitudeportal.entity.CandidateProfile;
import org.miniproject.jobnestjobaptitudeportal.entity.User;

public record CandidateProfileResponse(
        Long id,
        Long userId,
        String name,
        String email,
        String headline,
        String location,
        String bio,
        List<String> techStack,
        String experienceLevel,
        String githubUrl,
        String linkedinUrl,
        String profileImageUrl,
        String resumeFileName,
        boolean profileCompleted,
        int completionPercentage
) {
    public static CandidateProfileResponse from(CandidateProfile profile, User user) {
        List<String> skills = Collections.emptyList();
        if (profile.getTechStack() != null && !profile.getTechStack().isBlank()) {
            skills = Arrays.stream(profile.getTechStack().split(","))
                    .map(String::trim)
                    .filter(s -> !s.isEmpty())
                    .toList();
        }

        int completion = calculateCompletion(profile);

        return new CandidateProfileResponse(
                profile.getId(),
                profile.getUserId(),
                user.getName(),
                user.getEmail(),
                profile.getHeadline(),
                profile.getLocation(),
                profile.getBio(),
                skills,
                profile.getExperienceLevel(),
                profile.getGithubUrl(),
                profile.getLinkedinUrl(),
                profile.getProfileImageUrl(),
                profile.getResumeFileName(),
                profile.isProfileCompleted(),
                completion
        );
    }

    private static int calculateCompletion(CandidateProfile p) {
        int total = 0;
        int filled = 0;

        // 7 fields contribute to completion
        total += 1; if (p.getHeadline() != null && !p.getHeadline().isBlank()) filled++;
        total += 1; if (p.getLocation() != null && !p.getLocation().isBlank()) filled++;
        total += 1; if (p.getBio() != null && !p.getBio().isBlank()) filled++;
        total += 1; if (p.getTechStack() != null && !p.getTechStack().isBlank()) filled++;
        total += 1; if (p.getExperienceLevel() != null && !p.getExperienceLevel().isBlank()) filled++;
        total += 1; if (p.getGithubUrl() != null && !p.getGithubUrl().isBlank()) filled++;
        total += 1; if (p.getLinkedinUrl() != null && !p.getLinkedinUrl().isBlank()) filled++;
        total += 1; if (p.getProfileImageUrl() != null && !p.getProfileImageUrl().isBlank()) filled++;
        total += 1; if (p.getResumeFileName() != null && !p.getResumeFileName().isBlank()) filled++;

        return total == 0 ? 0 : (int) Math.round((double) filled / total * 100);
    }
}
