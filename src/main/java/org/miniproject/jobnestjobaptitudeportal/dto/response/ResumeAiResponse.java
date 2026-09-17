package org.miniproject.jobnestjobaptitudeportal.dto.response;

/**
 * Response containing AI-generated or AI-improved text for resume sections.
 */
public record ResumeAiResponse(
        boolean success,
        String result,
        String action,
        String message
) {
    public static ResumeAiResponse ok(String result, String action) {
        return new ResumeAiResponse(true, result, action, null);
    }

    public static ResumeAiResponse error(String message, String action) {
        return new ResumeAiResponse(false, null, action, message);
    }
}
