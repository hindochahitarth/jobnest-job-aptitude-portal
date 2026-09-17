package org.miniproject.jobnestjobaptitudeportal.service.resume;

import org.miniproject.jobnestjobaptitudeportal.dto.request.ResumeAiRequest;
import org.miniproject.jobnestjobaptitudeportal.dto.response.ResumeAiResponse;
import org.miniproject.jobnestjobaptitudeportal.service.ai.GroqApiClient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

/**
 * Uses Groq AI to assist candidates in writing professional resume content.
 * Every method falls back gracefully if the AI is unavailable.
 */
@Service
public class GroqResumeService {

    private static final Logger log = LoggerFactory.getLogger(GroqResumeService.class);

    private final GroqApiClient groqApiClient;

    public GroqResumeService(GroqApiClient groqApiClient) {
        this.groqApiClient = groqApiClient;
    }

    /**
     * Dispatches to the correct AI action based on request.action.
     */
    public ResumeAiResponse assist(ResumeAiRequest request) {
        if (request == null || request.action() == null) {
            return ResumeAiResponse.error("Invalid request: action is required.", "unknown");
        }

        String sanitizedRole = sanitize(request.role(), "Software Developer");
        String sanitizedText = sanitize(request.currentText(), "");
        String sanitizedContext = sanitize(request.context(), "");
        String action = request.action().trim().toLowerCase();

        try {
            return switch (action) {
                case "generate_summary" -> generateSummary(sanitizedRole, sanitizedContext);
                case "improve_experience" -> improveExperience(sanitizedText, sanitizedRole);
                case "suggest_skills" -> suggestSkills(sanitizedRole, sanitizedContext);
                case "improve_bullets" -> improveBullets(sanitizedText, sanitizedRole);
                case "improve_grammar" -> improveGrammar(sanitizedText);
                default -> ResumeAiResponse.error("Unknown action: " + action, action);
            };
        } catch (Exception ex) {
            log.error("GroqResumeService error for action={}: {}", action, ex.getMessage());
            return ResumeAiResponse.error("AI service temporarily unavailable. Please try again.", action);
        }
    }

    // -------------------------------------------------------------------------
    // Generate professional summary
    // -------------------------------------------------------------------------

    private ResumeAiResponse generateSummary(String role, String context) {
        String systemPrompt = """
                You are an expert resume writer specialising in ATS-optimised professional summaries.
                Write concise, impactful summaries that highlight value, not just duties.
                Never fabricate credentials, years of experience, or achievements not provided.
                """;

        String userMessage = String.format("""
                Write a professional resume summary for a candidate applying for a %s role.
                %s
                
                Requirements:
                - 3-4 sentences maximum
                - ATS-friendly with relevant keywords for the role
                - Focus on skills, value delivered, and career aspiration
                - Professional tone, first person implied (no "I")
                - Do NOT invent specific metrics, companies, or years unless provided
                
                Return ONLY the summary text, no labels, no JSON, no extra explanation.
                """,
                role,
                context.isBlank() ? "" : "Context about this candidate: " + context
        );

        String result = groqApiClient.chat(systemPrompt, userMessage);
        if (result == null || result.isBlank()) {
            return fallbackSummary(role);
        }
        return ResumeAiResponse.ok(cleanText(result), "generate_summary");
    }

    // -------------------------------------------------------------------------
    // Improve experience description
    // -------------------------------------------------------------------------

    private ResumeAiResponse improveExperience(String text, String role) {
        if (text.isBlank()) {
            return ResumeAiResponse.error("Please provide the experience description to improve.", "improve_experience");
        }

        String systemPrompt = """
                You are an expert resume writer. Improve work experience descriptions to be clear,
                impactful, and ATS-friendly. Use strong action verbs. Keep the content accurate —
                do not add metrics or achievements not present in the original text.
                """;

        String userMessage = String.format("""
                Improve this work experience description for a %s role resume.
                
                Original text:
                %s
                
                Requirements:
                - Start each bullet point with a strong action verb (e.g., Developed, Led, Designed, Optimized)
                - Make it ATS-friendly
                - Keep the factual content intact — do not invent numbers, percentages, or achievements
                - Return as plain text bullet points, one per line, each starting with a dash (-)
                - Maximum 5 bullet points
                - No labels, no explanation, just the improved bullet points
                """,
                role, text
        );

        String result = groqApiClient.chat(systemPrompt, userMessage);
        if (result == null || result.isBlank()) {
            return ResumeAiResponse.error("AI improvement unavailable. Please try again shortly.", "improve_experience");
        }
        return ResumeAiResponse.ok(cleanText(result), "improve_experience");
    }

    // -------------------------------------------------------------------------
    // Suggest relevant skills
    // -------------------------------------------------------------------------

    private ResumeAiResponse suggestSkills(String role, String context) {
        String systemPrompt = """
                You are a career counsellor with deep knowledge of technical and professional skills
                required for various roles. Suggest only realistic, commonly expected skills for the role.
                """;

        String userMessage = String.format("""
                Suggest relevant skills for a candidate applying for a %s role.
                %s
                
                Requirements:
                - List 10-15 skills commonly required for this role
                - Include both technical and soft skills
                - ATS-friendly terminology
                - Return as a comma-separated list on a single line
                - No labels, no explanation, just the skills
                """,
                role,
                context.isBlank() ? "" : "The candidate already has these skills: " + context
        );

        String result = groqApiClient.chat(systemPrompt, userMessage);
        if (result == null || result.isBlank()) {
            return fallbackSkills(role);
        }
        return ResumeAiResponse.ok(cleanText(result), "suggest_skills");
    }

    // -------------------------------------------------------------------------
    // Improve bullet points
    // -------------------------------------------------------------------------

    private ResumeAiResponse improveBullets(String text, String role) {
        if (text.isBlank()) {
            return ResumeAiResponse.error("Please provide the bullet points to improve.", "improve_bullets");
        }

        String systemPrompt = """
                You are a professional resume editor. Transform weak or generic bullet points into
                strong, specific, ATS-optimised ones. Use strong action verbs.
                Never fabricate metrics or results not present in the original.
                """;

        String userMessage = String.format("""
                Improve these resume bullet points for a %s role:
                
                %s
                
                Rules:
                - Use strong action verbs
                - Be specific about technologies, methods, or outcomes already mentioned
                - Do not add numbers, percentages, or achievements that are not in the original
                - Return improved bullet points, one per line, each starting with a dash (-)
                - No extra text or explanation
                """,
                role, text
        );

        String result = groqApiClient.chat(systemPrompt, userMessage);
        if (result == null || result.isBlank()) {
            return ResumeAiResponse.error("AI unavailable. Please try again shortly.", "improve_bullets");
        }
        return ResumeAiResponse.ok(cleanText(result), "improve_bullets");
    }

    // -------------------------------------------------------------------------
    // Improve grammar and wording
    // -------------------------------------------------------------------------

    private ResumeAiResponse improveGrammar(String text) {
        if (text.isBlank()) {
            return ResumeAiResponse.error("Please provide text to improve.", "improve_grammar");
        }

        String systemPrompt = """
                You are a professional editor. Fix grammar, spelling, and phrasing in resume text
                to sound polished and professional. Preserve the original meaning and facts exactly.
                """;

        String userMessage = String.format("""
                Improve the grammar and professional wording of this resume text.
                Do NOT change the facts, add information, or remove key points.
                
                Text:
                %s
                
                Return only the improved text, no labels or explanation.
                """,
                text
        );

        String result = groqApiClient.chat(systemPrompt, userMessage);
        if (result == null || result.isBlank()) {
            return ResumeAiResponse.error("AI grammar check unavailable. Please try again shortly.", "improve_grammar");
        }
        return ResumeAiResponse.ok(cleanText(result), "improve_grammar");
    }

    // -------------------------------------------------------------------------
    // Fallbacks
    // -------------------------------------------------------------------------

    private ResumeAiResponse fallbackSummary(String role) {
        String summary = String.format(
                "Results-driven %s with a strong foundation in technical problem-solving, " +
                "collaborative teamwork, and continuous learning. Experienced in delivering " +
                "high-quality solutions aligned with business objectives. Passionate about " +
                "contributing expertise to innovative projects and growing within a dynamic organisation.",
                role
        );
        return ResumeAiResponse.ok(summary, "generate_summary");
    }

    private ResumeAiResponse fallbackSkills(String role) {
        String lower = role.toLowerCase();
        String skills;
        if (lower.contains("react") || lower.contains("frontend") || lower.contains("front-end")) {
            skills = "React.js, JavaScript, TypeScript, HTML5, CSS3, REST APIs, Git, Webpack, Responsive Design, Jest, Agile, Communication";
        } else if (lower.contains("java") || lower.contains("backend") || lower.contains("spring")) {
            skills = "Java, Spring Boot, REST API, SQL, MySQL, Git, JUnit, Maven, Microservices, Docker, Problem Solving, Teamwork";
        } else if (lower.contains("full") || lower.contains("stack")) {
            skills = "React.js, Java, Spring Boot, Node.js, SQL, REST APIs, Git, Docker, Agile, Problem Solving, Communication";
        } else if (lower.contains("data") || lower.contains("analyst")) {
            skills = "Python, SQL, Excel, Power BI, Tableau, Data Visualization, Statistics, Communication, Critical Thinking, Problem Solving";
        } else {
            skills = "Problem Solving, Communication, Teamwork, Analytical Thinking, Adaptability, Time Management, Attention to Detail, Leadership";
        }
        return ResumeAiResponse.ok(skills, "suggest_skills");
    }

    // -------------------------------------------------------------------------
    // Utilities
    // -------------------------------------------------------------------------

    /**
     * Sanitizes user input to prevent prompt injection and trims whitespace.
     * Truncates very long input to avoid token abuse.
     */
    private static String sanitize(String value, String fallback) {
        if (value == null || value.isBlank()) return fallback;
        String trimmed = value.trim();
        // Truncate to 2000 characters to control token usage
        return trimmed.length() > 2000 ? trimmed.substring(0, 2000) : trimmed;
    }

    /**
     * Strips markdown fences and trims whitespace from AI output.
     */
    private static String cleanText(String text) {
        if (text == null) return "";
        String cleaned = text.trim();
        if (cleaned.startsWith("```")) {
            cleaned = cleaned.replaceFirst("```[a-zA-Z]*\\n?", "").replaceAll("```$", "").trim();
        }
        return cleaned;
    }
}
