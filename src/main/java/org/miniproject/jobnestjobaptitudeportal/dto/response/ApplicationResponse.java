package org.miniproject.jobnestjobaptitudeportal.dto.response;

import java.time.Instant;
import org.miniproject.jobnestjobaptitudeportal.entity.Application;

public record ApplicationResponse(
        Long id,
        Long jobId,
        String jobTitle,
        String company,
        Long candidateUserId,
        String candidateName,
        String candidateEmail,
        String status,
        Instant appliedAt
) {
    /** Used for candidate's own application list (no candidate info needed). */
    public static ApplicationResponse forCandidate(Application app, String jobTitle, String company) {
        return new ApplicationResponse(
                app.getId(),
                app.getJobId(),
                jobTitle,
                company,
                app.getCandidateUserId(),
                null,
                null,
                app.getStatus(),
                app.getAppliedAt()
        );
    }

    /** Used for recruiter's applicant list (includes candidate name + email). */
    public static ApplicationResponse forRecruiter(Application app, String jobTitle, String company,
                                                    String candidateName, String candidateEmail) {
        return new ApplicationResponse(
                app.getId(),
                app.getJobId(),
                jobTitle,
                company,
                app.getCandidateUserId(),
                candidateName,
                candidateEmail,
                app.getStatus(),
                app.getAppliedAt()
        );
    }
}
