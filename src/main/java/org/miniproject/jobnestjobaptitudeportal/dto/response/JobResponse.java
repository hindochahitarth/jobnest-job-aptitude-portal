package org.miniproject.jobnestjobaptitudeportal.dto.response;

import java.time.Instant;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import org.miniproject.jobnestjobaptitudeportal.entity.Job;

public record JobResponse(
        Long id,
        Long recruiterId,
        String title,
        String company,
        String location,
        String salary,
        String expLevel,
        Integer aptitudeCutoff,
        String skills,
        List<String> skillList,
        String description,
        String deadline,
        Instant createdAt,
        Integer matchScore,
        List<String> matchedSkills,
        List<String> missingSkills,
        String status
) {
    public static JobResponse from(Job job, Integer matchScore, List<String> matchedSkills, List<String> missingSkills) {
        List<String> parsedSkills = Collections.emptyList();
        if (job.getSkills() != null && !job.getSkills().isBlank()) {
            parsedSkills = Arrays.stream(job.getSkills().split(","))
                    .map(String::trim)
                    .filter(s -> !s.isEmpty())
                    .toList();
        }

        return new JobResponse(
                job.getId(),
                job.getRecruiterId(),
                job.getTitle(),
                job.getCompany(),
                job.getLocation(),
                job.getSalary(),
                job.getExpLevel(),
                job.getAptitudeCutoff(),
                job.getSkills(),
                parsedSkills,
                job.getDescription(),
                job.getDeadline(),
                job.getCreatedAt(),
                matchScore,
                matchedSkills != null ? matchedSkills : Collections.emptyList(),
                missingSkills != null ? missingSkills : Collections.emptyList(),
                job.getStatus()
        );
    }
}
