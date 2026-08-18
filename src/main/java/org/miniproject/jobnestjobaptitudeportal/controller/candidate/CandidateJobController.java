package org.miniproject.jobnestjobaptitudeportal.controller.candidate;

import java.util.List;
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
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/candidate")
public class CandidateJobController {

    private final JobService jobService;
    private final UserRepository userRepository;

    public CandidateJobController(JobService jobService, UserRepository userRepository) {
        this.jobService = jobService;
        this.userRepository = userRepository;
    }

    @GetMapping("/jobs/recommended")
    public List<JobResponse> getRecommendedJobs(Authentication authentication) {
        Long userId = resolveUserId(authentication);
        return jobService.getRecommendedJobsForCandidate(userId);
    }

    @GetMapping("/jobs/all")
    public List<JobResponse> getAllJobs(
            Authentication authentication,
            @RequestParam(value = "search", required = false) String search,
            @RequestParam(value = "location", required = false) String location
    ) {
        Long userId = resolveUserId(authentication);
        return jobService.getAllJobs(search, location, userId);
    }

    /** POST /api/candidate/jobs/{jobId}/apply — candidate applies to a job */
    @PostMapping("/jobs/{jobId}/apply")
    public ApplicationResponse applyToJob(
            Authentication authentication,
            @PathVariable Long jobId
    ) {
        Long userId = resolveUserId(authentication);
        return jobService.applyToJob(userId, jobId);
    }

    /** GET /api/candidate/applications — candidate's own applied jobs */
    @GetMapping("/applications")
    public List<ApplicationResponse> getMyApplications(Authentication authentication) {
        Long userId = resolveUserId(authentication);
        return jobService.getApplicationsForCandidate(userId);
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
