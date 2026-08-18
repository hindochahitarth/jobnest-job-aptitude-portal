package org.miniproject.jobnestjobaptitudeportal.dto.response;

import java.time.Instant;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import org.miniproject.jobnestjobaptitudeportal.entity.Application;
import org.miniproject.jobnestjobaptitudeportal.entity.CandidateProfile;

public record ApplicationResponse(
        Long id,
        Long jobId,
        String jobTitle,
        String company,
        Long candidateUserId,
        String candidateName,
        String candidateEmail,
        // Candidate profile fields (populated for recruiter view)
        String candidateHeadline,
        String candidateBio,
        List<String> candidateTechStack,
        String candidateExperienceLevel,
        String candidateGithubUrl,
        String candidateLinkedinUrl,
        String candidateProfileImageUrl,
        String candidateResumeFileName,
        String candidateResumeUrl,
        String status,
        Instant appliedAt
) {
    /** Used for candidate's own application list (no PII from other parties needed). */
    public static ApplicationResponse forCandidate(Application app, String jobTitle, String company) {
        return new ApplicationResponse(
                app.getId(), app.getJobId(), jobTitle, company,
                app.getCandidateUserId(), null, null,
                null, null, Collections.emptyList(), null, null, null, null, null, null,
                app.getStatus(), app.getAppliedAt()
        );
    }

    /** Used for recruiter's ATS view — includes full candidate name, email, and profile snapshot. */
    public static ApplicationResponse forRecruiter(Application app, String jobTitle, String company,
                                                    String candidateName, String candidateEmail,
                                                    CandidateProfile profile, String baseUploadUrl) {
        String resumeFileName = null;
        String resumeUrl = null;
        String headline = null;
        String bio = null;
        List<String> techStack = Collections.emptyList();
        String expLevel = null;
        String github = null;
        String linkedin = null;
        String profileImageUrl = null;

        if (profile != null) {
            resumeFileName = profile.getResumeFileName();
            if (resumeFileName != null && !resumeFileName.isBlank()) {
                resumeUrl = baseUploadUrl + "/" + resumeFileName;
            }
            headline = profile.getHeadline();
            bio = profile.getBio();
            if (profile.getTechStack() != null && !profile.getTechStack().isBlank()) {
                techStack = Arrays.stream(profile.getTechStack().split(","))
                        .map(String::trim).filter(s -> !s.isEmpty()).toList();
            }
            expLevel = profile.getExperienceLevel();
            github = profile.getGithubUrl();
            linkedin = profile.getLinkedinUrl();
            profileImageUrl = profile.getProfileImageUrl();
        }

        return new ApplicationResponse(
                app.getId(), app.getJobId(), jobTitle, company,
                app.getCandidateUserId(), candidateName, candidateEmail,
                headline, bio, techStack, expLevel, github, linkedin, profileImageUrl,
                resumeFileName, resumeUrl,
                app.getStatus(), app.getAppliedAt()
        );
    }
}
