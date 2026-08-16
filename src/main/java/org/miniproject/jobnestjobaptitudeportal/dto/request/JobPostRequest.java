package org.miniproject.jobnestjobaptitudeportal.dto.request;

import jakarta.validation.constraints.NotBlank;

public record JobPostRequest(
        @NotBlank(message = "Job title is required")
        String title,

        @NotBlank(message = "Company name is required")
        String company,

        @NotBlank(message = "Location is required")
        String location,

        String salary,
        String expLevel,
        Integer aptitudeCutoff,

        @NotBlank(message = "Required skills are required")
        String skills,

        String description,
        String deadline
) {
}
