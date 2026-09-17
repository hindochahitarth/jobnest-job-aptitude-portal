package org.miniproject.jobnestjobaptitudeportal.dto.response;

import java.util.List;

/**
 * Metadata about an available resume template.
 */
public record ResumeTemplateInfo(
        String id,
        String name,
        String description,
        String previewStyle   // "classic" | "modern" | "executive"
) {}
