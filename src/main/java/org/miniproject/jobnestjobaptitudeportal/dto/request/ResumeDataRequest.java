package org.miniproject.jobnestjobaptitudeportal.dto.request;

import java.util.List;

/**
 * Complete resume data submitted from the frontend builder.
 * All fields are optional to support partial saves and incremental building.
 */
public record ResumeDataRequest(
        String templateId,

        // Personal info
        String fullName,
        String email,
        String phone,
        String location,
        String linkedIn,
        String portfolio,
        String headline,
        String summary,

        // Sections
        List<ExperienceEntry> experience,
        List<EducationEntry> education,
        List<String> skills,
        List<SkillCategory> skillCategories,
        List<ProjectEntry> projects,
        List<CertificationEntry> certifications,
        List<String> achievements
) {

    public record ExperienceEntry(
            String title,
            String company,
            String location,
            String startDate,
            String endDate,
            String description,
            List<String> bullets
    ) {}

    public record EducationEntry(
            String degree,
            String field,
            String institution,
            String location,
            String startDate,
            String endDate,
            String gpa,
            String honors
    ) {}

    public record SkillCategory(
            String category,
            String items,
            List<String> itemList
    ) {}

    public record ProjectEntry(
            String name,
            String techStack,
            String date,
            String description,
            List<String> bullets
    ) {}

    public record CertificationEntry(
            String name,
            String issuer,
            String date
    ) {}
}
