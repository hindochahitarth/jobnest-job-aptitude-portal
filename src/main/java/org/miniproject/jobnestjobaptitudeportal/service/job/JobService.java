package org.miniproject.jobnestjobaptitudeportal.service.job;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Optional;
import org.miniproject.jobnestjobaptitudeportal.dto.request.JobPostRequest;
import org.miniproject.jobnestjobaptitudeportal.dto.response.JobResponse;
import org.miniproject.jobnestjobaptitudeportal.entity.CandidateProfile;
import org.miniproject.jobnestjobaptitudeportal.entity.Job;
import org.miniproject.jobnestjobaptitudeportal.exception.ApiException;
import org.miniproject.jobnestjobaptitudeportal.repository.CandidateProfileRepository;
import org.miniproject.jobnestjobaptitudeportal.repository.JobRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class JobService {

    private final JobRepository jobRepository;
    private final CandidateProfileRepository profileRepository;

    public JobService(JobRepository jobRepository, CandidateProfileRepository profileRepository) {
        this.jobRepository = jobRepository;
        this.profileRepository = profileRepository;
    }

    public List<JobResponse> getAllJobs(String search, String location, Long candidateUserId) {
        List<Job> allJobs = jobRepository.findAllByOrderByCreatedAtDesc();
        List<String> candidateSkills = getCandidateSkills(candidateUserId);

        return allJobs.stream()
                .filter(job -> matchesFilter(job, search, location))
                .map(job -> buildJobResponse(job, candidateSkills))
                .toList();
    }

    public List<JobResponse> getRecommendedJobsForCandidate(Long candidateUserId) {
        List<String> candidateSkills = getCandidateSkills(candidateUserId);
        if (candidateSkills.isEmpty()) {
            return Collections.emptyList();
        }

        List<Job> allJobs = jobRepository.findAllByOrderByCreatedAtDesc();
        List<JobResponse> matchedList = new ArrayList<>();

        for (Job job : allJobs) {
            JobResponse response = buildJobResponse(job, candidateSkills);
            // Only include jobs that have at least one matching skill
            if (response.matchedSkills() != null && !response.matchedSkills().isEmpty()) {
                matchedList.add(response);
            }
        }

        // Sort by match score descending
        matchedList.sort(Comparator.comparingInt(JobResponse::matchScore).reversed());
        return matchedList;
    }

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

    public List<JobResponse> getJobsByRecruiter(Long recruiterId) {
        return jobRepository.findByRecruiterId(recruiterId).stream()
                .map(job -> JobResponse.from(job, null, Collections.emptyList(), Collections.emptyList()))
                .toList();
    }

    public JobResponse getJobById(Long id, Long candidateUserId) {
        Job job = jobRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Job not found with ID: " + id));
        List<String> candidateSkills = getCandidateSkills(candidateUserId);
        return buildJobResponse(job, candidateSkills);
    }

    private List<String> getCandidateSkills(Long candidateUserId) {
        if (candidateUserId == null) {
            return Collections.emptyList();
        }

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
            // Score ranges realistically from 60% up to 98%
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
            if (!matchTitle && !matchCompany && !matchSkills) {
                return false;
            }
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
