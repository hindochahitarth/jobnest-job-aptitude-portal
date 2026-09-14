package org.miniproject.jobnestjobaptitudeportal.service.ai;

import java.util.ArrayList;
import java.util.List;
import org.miniproject.jobnestjobaptitudeportal.dto.request.AiInterviewGenerateRequest;
import org.miniproject.jobnestjobaptitudeportal.dto.request.EvaluateAnswerRequest;
import org.miniproject.jobnestjobaptitudeportal.dto.response.AnswerEvaluationResponse;
import org.miniproject.jobnestjobaptitudeportal.dto.response.InterviewQuestionDTO;
import org.springframework.stereotype.Service;

@Service
public class InterviewQuestionGenerator {

    public List<InterviewQuestionDTO> generateQuestionsFromJd(AiInterviewGenerateRequest request) {
        String role = request.targetRole() != null && !request.targetRole().isBlank() ? request.targetRole() : "Software Developer";
        String subject = request.subject() != null && !request.subject().isBlank() ? request.subject() : "Technical & Behavioral";

        List<InterviewQuestionDTO> generated = new ArrayList<>();

        generated.add(new InterviewQuestionDTO(
                1001L,
                role,
                subject,
                "System Architecture & Resilience",
                "INTERMEDIATE",
                "Given your background in " + role + ", how do you design resilient microservices when external dependencies experience latent response times?",
                "Use the Circuit Breaker pattern (Resilience4j/Hystrix) with fast fallbacks, set explicit connection timeouts, and implement rate limiting.",
                "Structure your answer using STAR: Describe a real outage scenario, your architectural fix, and the latency reduction achieved."
        ));

        generated.add(new InterviewQuestionDTO(
                1002L,
                role,
                subject,
                "Data Persistence & Query Performance",
                "ADVANCED",
                "In a target role like " + role + ", how would you diagnose and optimize slow SQL queries handling millions of transaction logs?",
                "Analyze query execution plan (EXPLAIN), check index usage, eliminate N+1 queries, introduce read replicas, and partition high-volume tables.",
                "Mention indexed columns, covering indexes, and avoiding SELECT * queries."
        ));

        generated.add(new InterviewQuestionDTO(
                1003L,
                role,
                subject,
                "Behavioral & Project Ownership",
                "EASY",
                "Describe a situation where a critical bug slipped into production right before a sprint demo. How did you handle stakeholder communication and technical remediation?",
                "Immediately communicated the bug scope to team leads, initiated a hotfix branch, added regression unit tests, deployed patch, and held a blameless post-mortem.",
                "Highlight calm leadership, clear communication, and preventative CI/CD pipeline automated checks."
        ));

        return generated;
    }

    public AnswerEvaluationResponse evaluateAnswer(EvaluateAnswerRequest request) {
        String answer = request.candidateAnswer() != null ? request.candidateAnswer().trim() : "";
        int wordCount = answer.isEmpty() ? 0 : answer.split("\\s+").length;

        int score = 50;
        List<String> strengths = new ArrayList<>();
        List<String> improvements = new ArrayList<>();

        if (wordCount > 30) {
            score += 20;
            strengths.add("Provided a thorough, well-articulated explanation with good length.");
        } else if (wordCount > 10) {
            score += 10;
            strengths.add("Good concise response covering core concepts.");
        } else {
            improvements.add("Elaborate further with concrete technical examples and architecture details.");
        }

        String lower = answer.toLowerCase();
        if (lower.contains("star") || lower.contains("result") || lower.contains("action") || lower.contains("impact")) {
            score += 15;
            strengths.add("Applied STAR methodology (Situation, Task, Action, Result) effectively.");
        } else {
            improvements.add("Structure response using STAR: Situation -> Task -> Action -> Result.");
        }

        if (lower.contains("index") || lower.contains("thread") || lower.contains("cache") || lower.contains("api") || lower.contains("test")) {
            score += 15;
            strengths.add("Used relevant domain terminology and key technical concepts.");
        } else {
            improvements.add("Incorporate core Computer Science terminology (e.g. latency, time complexity, scaling).");
        }

        score = Math.min(100, Math.max(35, score));
        String grade = score >= 85 ? "Excellent (Pass)" : score >= 70 ? "Good (Proficient)" : "Needs Review";

        String modelAnswer = "A strong response directly addresses the core technical problem, provides a concrete scenario, explains trade-offs, and quantifies final metrics or system improvements.";
        String starAdvice = "Always frame your answer as: 1) What was the challenge? 2) What specific actions did YOU take? 3) What measurable results were achieved?";

        return new AnswerEvaluationResponse(score, grade, strengths, improvements, modelAnswer, starAdvice);
    }
}
