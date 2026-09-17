package org.miniproject.jobnestjobaptitudeportal.dto.request;

/**
 * Request to Groq AI for resume assistance.
 */
public record ResumeAiRequest(
        String action,      // "generate_summary" | "improve_experience" | "suggest_skills" | "improve_bullets" | "improve_grammar"
        String role,        // target job role
        String currentText, // text to improve (if applicable)
        String context      // additional context (e.g. company, industry, years of experience)
) {}
