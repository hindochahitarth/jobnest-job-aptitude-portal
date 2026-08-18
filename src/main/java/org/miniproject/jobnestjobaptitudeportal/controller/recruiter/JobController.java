package org.miniproject.jobnestjobaptitudeportal.controller.recruiter;

import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;
import org.miniproject.jobnestjobaptitudeportal.dto.request.JobPostRequest;
import org.miniproject.jobnestjobaptitudeportal.dto.response.ApplicationResponse;
import org.miniproject.jobnestjobaptitudeportal.dto.response.JobResponse;
import org.miniproject.jobnestjobaptitudeportal.entity.User;
import org.miniproject.jobnestjobaptitudeportal.exception.ApiException;
import org.miniproject.jobnestjobaptitudeportal.repository.UserRepository;
import org.miniproject.jobnestjobaptitudeportal.security.JwtUtil;
import org.miniproject.jobnestjobaptitudeportal.service.job.JobService;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/recruiter")
public class JobController {

    private final JobService jobService;
    private final UserRepository userRepository;

    public JobController(JobService jobService, UserRepository userRepository) {
        this.jobService = jobService;
        this.userRepository = userRepository;
    }

    /** POST /api/recruiter/jobs — post a new job */
    @PostMapping("/jobs")
    public JobResponse postJob(
            Authentication authentication,
            @Valid @RequestBody JobPostRequest request
    ) {
        Long recruiterId = resolveUserId(authentication);
        return jobService.createJob(recruiterId, request);
    }

    /** GET /api/recruiter/jobs — all jobs posted by this recruiter */
    @GetMapping("/jobs")
    public List<JobResponse> getMyJobs(Authentication authentication) {
        Long recruiterId = resolveUserId(authentication);
        return jobService.getJobsByRecruiter(recruiterId);
    }

    /** GET /api/recruiter/applicants — all candidates who applied to this recruiter's jobs */
    @GetMapping("/applicants")
    public List<ApplicationResponse> getApplicants(Authentication authentication) {
        Long recruiterId = resolveUserId(authentication);
        return jobService.getApplicationsByRecruiter(recruiterId);
    }

    /** PATCH /api/recruiter/applicants/{id}/status — shortlist or reject a candidate */
    @PatchMapping("/applicants/{id}/status")
    public ApplicationResponse updateStatus(
            Authentication authentication,
            @PathVariable Long id,
            @RequestBody Map<String, String> body
    ) {
        Long recruiterId = resolveUserId(authentication);
        String status = body.getOrDefault("status", "APPLIED");
        return jobService.updateApplicationStatus(id, status, recruiterId);
    }

    private Long resolveUserId(Authentication authentication) {
        if (authentication != null && authentication.getPrincipal() instanceof JwtUtil.JwtUser jwtUser) {
            return jwtUser.userId();
        }
        if (authentication != null && authentication.getName() != null) {
            String name = authentication.getName();
            return userRepository.findByEmail(name.trim())
                    .map(User::getId)
                    .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "User not found"));
        }
        throw new ApiException(HttpStatus.UNAUTHORIZED, "Authentication required");
    }
}
