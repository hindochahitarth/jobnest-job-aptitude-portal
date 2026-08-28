package org.miniproject.jobnestjobaptitudeportal.service.job;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.function.Function;
import java.util.stream.Collectors;
import org.miniproject.jobnestjobaptitudeportal.dto.request.JobPostRequest;
import org.miniproject.jobnestjobaptitudeportal.dto.response.ApplicationResponse;
import org.miniproject.jobnestjobaptitudeportal.dto.response.JobResponse;
import org.miniproject.jobnestjobaptitudeportal.entity.Application;
import org.miniproject.jobnestjobaptitudeportal.entity.CandidateProfile;
import org.miniproject.jobnestjobaptitudeportal.entity.Job;
import org.miniproject.jobnestjobaptitudeportal.entity.User;
import org.miniproject.jobnestjobaptitudeportal.exception.ApiException;
import org.miniproject.jobnestjobaptitudeportal.repository.ApplicationRepository;
import org.miniproject.jobnestjobaptitudeportal.repository.CandidateProfileRepository;
import org.miniproject.jobnestjobaptitudeportal.repository.JobRepository;
import org.miniproject.jobnestjobaptitudeportal.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class JobService {

    private static final String BASE_UPLOAD_URL = "http://localhost:8080/uploads";

    private final JobRepository jobRepository;
    private final CandidateProfileRepository profileRepository;
    private final ApplicationRepository applicationRepository;
    private final UserRepository userRepository;

    public JobService(JobRepository jobRepository,
                      CandidateProfileRepository profileRepository,
                      ApplicationRepository applicationRepository,
                      UserRepository userRepository) {
        this.jobRepository = jobRepository;
        this.profileRepository = profileRepository;
        this.applicationRepository = applicationRepository;
        this.userRepository = userRepository;
    }

    // ── Job Queries ───────────────────────────────────────────────────────────

    public List<JobResponse> getAllJobs(String search, String location, Long candidateUserId) {
        List<Job> allJobs = jobRepository.findAllByOrderByCreatedAtDesc();
        List<String> candidateSkills = getCandidateSkills(candidateUserId);

        return allJobs.stream()
                .filter(job -> "ACTIVE".equalsIgnoreCase(job.getStatus()))
                .filter(job -> matchesFilter(job, search, location))
                .map(job -> buildJobResponse(job, candidateSkills))
                .toList();
    }
    // Get recommended jobs for candidates
    public List<JobResponse> getRecommendedJobsForCandidate(Long candidateUserId) {
        List<String> candidateSkills = getCandidateSkills(candidateUserId);
        if (candidateSkills.isEmpty()) {
            return Collections.emptyList();
        }

        List<Job> allJobs = jobRepository.findAllByOrderByCreatedAtDesc();
        List<JobResponse> matchedList = new ArrayList<>();

        for (Job job : allJobs) {
            if (!"ACTIVE".equalsIgnoreCase(job.getStatus())) continue;

            JobResponse response = buildJobResponse(job, candidateSkills);
            if (response.matchedSkills() != null && !response.matchedSkills().isEmpty()) {
                matchedList.add(response);
            }
        }

        matchedList.sort(Comparator.comparingInt(JobResponse::matchScore).reversed());
        return matchedList;
    }
    //create job
    @Transactional
    public JobResponse createJob(Long recruiterId, JobPostRequest request) {
        Job job = new Job(
                recruiterId,
                request.title().trim(),
                request.company().trim(),
                request.location().trim(),
                request.salary() != null ? request.salary().trim() : "Best in Industry",
                request.expLevel() != null ? request.expLevel().trim() : "0-2",
                request.aptitudeCutoff() != null ? request.aptitudeCutoff() : 70,
                request.skills().trim(),
                request.description() != null ? request.description().trim() : "",
                request.deadline() != null ? request.deadline().trim() : ""
        );

        Job saved = jobRepository.save(job);
        return JobResponse.from(saved, null, Collections.emptyList(), Collections.emptyList());
    }
    //get jobs by recruiter
    public List<JobResponse> getJobsByRecruiter(Long recruiterId) {
        return jobRepository.findByRecruiterId(recruiterId).stream()
                .map(job -> JobResponse.from(job, null, Collections.emptyList(), Collections.emptyList()))
                .toList();
    }

    //get jobs by id
    public JobResponse getJobById(Long id, Long candidateUserId) {
        Job job = jobRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Job not found with ID: " + id));
        List<String> candidateSkills = getCandidateSkills(candidateUserId);
        return buildJobResponse(job, candidateSkills);
    }

    @Transactional
    public void deleteJob(Long jobId, Long recruiterId) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Job not found"));
        if (!job.getRecruiterId().equals(recruiterId)) {
            throw new ApiException(HttpStatus.FORBIDDEN, "You can only manage your own jobs");
        }
        jobRepository.delete(job);
    }

    @Transactional
    public JobResponse updateJobStatus(Long jobId, String status, Long recruiterId) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Job not found"));
        if (!job.getRecruiterId().equals(recruiterId)) {
            throw new ApiException(HttpStatus.FORBIDDEN, "You can only manage your own jobs");
        }
        String normalized = status != null ? status.toUpperCase(Locale.ROOT) : "ACTIVE";
        job.setStatus(normalized);
        Job saved = jobRepository.save(job);
        return JobResponse.from(saved, null, Collections.emptyList(), Collections.emptyList());
    }

    // ── Application: Candidate ────────────────────────────────────────────────

    @Transactional
    public ApplicationResponse applyToJob(Long candidateUserId, Long jobId) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Job not found"));

        if (applicationRepository.existsByJobIdAndCandidateUserId(jobId, candidateUserId)) {
            throw new ApiException(HttpStatus.CONFLICT, "You have already applied to this job");
        }

        Application application = new Application(jobId, candidateUserId);
        Application saved = applicationRepository.save(application);
        return ApplicationResponse.forCandidate(saved, job.getTitle(), job.getCompany());
    }

    public List<ApplicationResponse> getApplicationsForCandidate(Long candidateUserId) {
        List<Application> applications = applicationRepository.findByCandidateUserId(candidateUserId);
        if (applications.isEmpty()) return Collections.emptyList();

        List<Long> jobIds = applications.stream().map(Application::getJobId).toList();
        Map<Long, Job> jobMap = jobRepository.findAllById(jobIds).stream()
                .collect(Collectors.toMap(Job::getId, Function.identity()));

        return applications.stream()
                .map(app -> {
                    Job job = jobMap.get(app.getJobId());
                    String title = job != null ? job.getTitle() : "Unknown Job";
                    String company = job != null ? job.getCompany() : "";
                    return ApplicationResponse.forCandidate(app, title, company);
                })
                .toList();
    }

    // ── Application: Recruiter ────────────────────────────────────────────────

    public List<ApplicationResponse> getApplicationsByRecruiter(Long recruiterId) {
        List<Job> myJobs = jobRepository.findByRecruiterId(recruiterId);
        if (myJobs.isEmpty()) return Collections.emptyList();

        List<Long> myJobIds = myJobs.stream().map(Job::getId).toList();
        Map<Long, Job> jobMap = myJobs.stream()
                .collect(Collectors.toMap(Job::getId, Function.identity()));

        List<Application> applications = applicationRepository.findByJobIdIn(myJobIds);
        if (applications.isEmpty()) return Collections.emptyList();

        List<Long> candidateIds = applications.stream()
                .map(Application::getCandidateUserId).distinct().toList();
        Map<Long, User> userMap = userRepository.findAllById(candidateIds).stream()
                .collect(Collectors.toMap(User::getId, Function.identity()));

        // Also fetch candidate profiles for rich profile display
        Map<Long, CandidateProfile> profileMap = profileRepository.findAllByUserIdIn(candidateIds).stream()
                .collect(Collectors.toMap(CandidateProfile::getUserId, Function.identity()));

        return applications.stream()
                .map(app -> {
                    Job job = jobMap.get(app.getJobId());
                    User user = userMap.get(app.getCandidateUserId());
                    CandidateProfile profile = profileMap.get(app.getCandidateUserId());
                    String title = job != null ? job.getTitle() : "Unknown Job";
                    String company = job != null ? job.getCompany() : "";
                    String name = user != null ? user.getName() : "Unknown";
                    String email = user != null ? user.getEmail() : "";
                    return ApplicationResponse.forRecruiter(app, title, company, name, email, profile, BASE_UPLOAD_URL);
                })
                .toList();
    }

    @Transactional
    public ApplicationResponse updateApplicationStatus(Long applicationId, String status, Long recruiterId) {
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Application not found"));

        // Verify this application belongs to one of the recruiter's jobs
        Job job = jobRepository.findById(application.getJobId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Job not found"));

        if (!job.getRecruiterId().equals(recruiterId)) {
            throw new ApiException(HttpStatus.FORBIDDEN, "You can only manage applications for your own jobs");
        }

        String normalized = status.toUpperCase(Locale.ROOT);
        if (!normalized.equals("APPLIED") && !normalized.equals("SHORTLISTED") && !normalized.equals("REJECTED")) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Invalid status. Allowed: APPLIED, SHORTLISTED, REJECTED");
        }

        application.setStatus(normalized);
        Application saved = applicationRepository.save(application);

        User candidate = userRepository.findById(saved.getCandidateUserId()).orElse(null);
        CandidateProfile profile = profileRepository.findByUserId(saved.getCandidateUserId()).orElse(null);
        return ApplicationResponse.forRecruiter(saved, job.getTitle(), job.getCompany(),
                candidate != null ? candidate.getName() : "Unknown",
                candidate != null ? candidate.getEmail() : "",
                profile, BASE_UPLOAD_URL);
    }

    // ── Private Helpers ───────────────────────────────────────────────────────

    private List<String> getCandidateSkills(Long candidateUserId) {
        if (candidateUserId == null) return Collections.emptyList();

        Optional<CandidateProfile> profileOpt = profileRepository.findByUserId(candidateUserId);
        if (profileOpt.isEmpty() || profileOpt.get().getTechStack() == null || profileOpt.get().getTechStack().isBlank()) {
            return Collections.emptyList();
        }

        return Arrays.stream(profileOpt.get().getTechStack().split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .toList();
    }

    private JobResponse buildJobResponse(Job job, List<String> candidateSkills) {
        if (candidateSkills.isEmpty() || job.getSkills() == null || job.getSkills().isBlank()) {
            return JobResponse.from(job, null, Collections.emptyList(), Collections.emptyList());
        }

        List<String> requiredSkills = Arrays.stream(job.getSkills().split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .toList();

        List<String> matched = new ArrayList<>();
        List<String> missing = new ArrayList<>();

        for (String req : requiredSkills) {
            if (isSkillMatched(req, candidateSkills)) {
                matched.add(req);
            } else {
                missing.add(req);
            }
        }

        Integer matchScore = null;
        if (!matched.isEmpty() && !requiredSkills.isEmpty()) {
            double ratio = (double) matched.size() / requiredSkills.size();
            matchScore = (int) Math.round(55 + (ratio * 43));
            if (matchScore > 98) matchScore = 98;
        }

        return JobResponse.from(job, matchScore, matched, missing);
    }

    private boolean isSkillMatched(String requiredSkill, List<String> candidateSkills) {
        String reqNorm = normalizeSkill(requiredSkill);
        for (String candidateSkill : candidateSkills) {
            String candNorm = normalizeSkill(candidateSkill);
            if (reqNorm.equals(candNorm) || reqNorm.contains(candNorm) || candNorm.contains(reqNorm)) {
                return true;
            }
        }
        return false;
    }

    private String normalizeSkill(String skill) {
        return skill.toLowerCase(Locale.ROOT)
                .replaceAll("\\.js$", "")
                .replaceAll("[^a-z0-9+#]", "")
                .trim();
    }

    private boolean matchesFilter(Job job, String search, String location) {
        if (search != null && !search.isBlank()) {
            String q = search.toLowerCase(Locale.ROOT).trim();
            boolean matchTitle = job.getTitle().toLowerCase(Locale.ROOT).contains(q);
            boolean matchCompany = job.getCompany().toLowerCase(Locale.ROOT).contains(q);
            boolean matchSkills = job.getSkills() != null && job.getSkills().toLowerCase(Locale.ROOT).contains(q);
            if (!matchTitle && !matchCompany && !matchSkills) return false;
        }

        if (location != null && !location.isBlank()) {
            String loc = location.toLowerCase(Locale.ROOT).trim();
            if (job.getLocation() == null || !job.getLocation().toLowerCase(Locale.ROOT).contains(loc)) {
                return false;
            }
        }

        return true;
    }
}
