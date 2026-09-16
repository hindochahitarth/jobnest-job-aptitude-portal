package org.miniproject.jobnestjobaptitudeportal.service.ai;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.miniproject.jobnestjobaptitudeportal.dto.request.AiInterviewGenerateRequest;
import org.miniproject.jobnestjobaptitudeportal.dto.request.EvaluateAnswerRequest;
import org.miniproject.jobnestjobaptitudeportal.dto.response.AnswerEvaluationResponse;
import org.miniproject.jobnestjobaptitudeportal.dto.response.InterviewQuestionDTO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.atomic.AtomicLong;

/**
 * Generates interview questions and evaluates answers using the Groq AI API.
 * Falls back to built-in templates if the API is unavailable.
 */
@Service
public class InterviewQuestionGenerator {

    private static final Logger log = LoggerFactory.getLogger(InterviewQuestionGenerator.class);

    private final GroqApiClient groqApiClient;
    private final ObjectMapper mapper = new ObjectMapper();
    private final AtomicLong generatedIdSequence = new AtomicLong(2000L);

    public InterviewQuestionGenerator(GroqApiClient groqApiClient) {
        this.groqApiClient = groqApiClient;
    }

    // -------------------------------------------------------------------------
    // Question Generation
    // -------------------------------------------------------------------------

    public List<InterviewQuestionDTO> generateQuestionsFromJd(AiInterviewGenerateRequest request) {
        String role = nvl(request.targetRole(), "Software Developer");
        String subject = nvl(request.subject(), "Technical & Behavioral");
        String skills = nvl(request.candidateSkills(), "the required technical skills");
        String jd = nvl(request.jobDescription(), "");

        // Try Groq first
        List<InterviewQuestionDTO> groqResult = tryGroqGenerate(role, subject, skills, jd);
        if (groqResult != null && !groqResult.isEmpty()) {
            return groqResult;
        }

        // Fall back to local templates
        log.info("Groq unavailable — using local template fallback for subject={}", subject);
        return localTemplateFallback(role, subject, skills);
    }

    /**
     * Calls Groq to generate 5 unique, randomized interview questions.
     * Returns null on any parse / network failure so the caller can fall back.
     */
    private List<InterviewQuestionDTO> tryGroqGenerate(String role, String subject, String skills, String jd) {
        String systemPrompt = """
                You are an expert technical interviewer at a top technology company.
                Your job is to create original, thought-provoking interview questions.
                Every time you are called you MUST produce DIFFERENT questions — never repeat the same wording.
                Use varied difficulty levels, angles, and real-world contexts to keep candidates on their toes.
                """;

        String userMessage = String.format("""
                Generate exactly 5 interview questions for:
                - Target Role: %s
                - Subject/Track: %s
                - Candidate Skills: %s
                %s

                Requirements:
                1. Questions must be UNIQUE and RANDOM — vary the topic angle, difficulty, and scenario each time.
                2. Include a mix of conceptual, applied/practical, and system-design angles.
                3. Difficulty levels: BEGINNER, INTERMEDIATE, ADVANCED (mix them).
                4. Each question must have a concise model answer (2-4 sentences) and a short tip (1 sentence).

                Return ONLY valid JSON — an array of exactly 5 objects with this schema:
                [
                  {
                    "skill": "<specific skill or sub-topic>",
                    "difficulty": "<BEGINNER|INTERMEDIATE|ADVANCED>",
                    "questionText": "<the interview question>",
                    "sampleAnswer": "<concise model answer>",
                    "aiTips": "<one-sentence interviewer tip>"
                  }
                ]
                No markdown, no explanation, no extra text — raw JSON array only.
                """,
                role, subject, skills,
                jd.isBlank() ? "" : "- Job Description Notes: " + jd
        );

        String raw = groqApiClient.chat(systemPrompt, userMessage);
        if (raw == null || raw.isBlank()) return null;

        try {
            // Strip markdown code fences if the model wraps the JSON
            String json = raw.trim();
            if (json.startsWith("```")) {
                json = json.replaceFirst("```[a-zA-Z]*\\n?", "").replaceAll("```$", "").trim();
            }

            List<Map<String, String>> items = mapper.readValue(json, new TypeReference<>() {});
            List<InterviewQuestionDTO> result = new ArrayList<>();
            for (Map<String, String> item : items) {
                result.add(new InterviewQuestionDTO(
                        nextGeneratedId(),
                        role,
                        subject,
                        nvl(item.get("skill"), subject),
                        nvl(item.get("difficulty"), "INTERMEDIATE"),
                        nvl(item.get("questionText"), ""),
                        nvl(item.get("sampleAnswer"), ""),
                        nvl(item.get("aiTips"), "")
                ));
            }
            return result.isEmpty() ? null : result;
        } catch (Exception ex) {
            log.warn("Failed to parse Groq question JSON: {} — raw={}", ex.getMessage(), raw.substring(0, Math.min(200, raw.length())));
            return null;
        }
    }

    // -------------------------------------------------------------------------
    // Answer Evaluation
    // -------------------------------------------------------------------------

    public AnswerEvaluationResponse evaluateAnswer(EvaluateAnswerRequest request) {
        String answer = request.candidateAnswer() != null ? request.candidateAnswer().trim() : "";
        String questionText = nvl(request.questionText(), "");

        // Try Groq evaluation first
        AnswerEvaluationResponse groqResult = tryGroqEvaluate(questionText, answer);
        if (groqResult != null) {
            return groqResult;
        }

        // Heuristic fallback
        return heuristicEvaluate(answer);
    }

    private AnswerEvaluationResponse tryGroqEvaluate(String questionText, String answer) {
        if (answer.isBlank() || questionText.isBlank()) return null;

        String systemPrompt = """
                You are a rigorous but fair technical interview evaluator.
                Score the candidate's answer honestly based on accuracy, depth, clarity, and structure.
                Be specific in your feedback — vague praise or generic criticism is not helpful.
                """;

        String userMessage = String.format("""
                Evaluate this interview answer.

                Question: %s

                Candidate's Answer: %s

                Score the answer out of 100. Be honest and fair.

                Return ONLY valid JSON with this exact schema:
                {
                  "score": <integer 0-100>,
                  "grade": "<Excellent|Good|Needs Review>",
                  "strengths": ["<specific strength 1>", "<specific strength 2>"],
                  "improvements": ["<specific improvement 1>", "<specific improvement 2>"],
                  "modelAnswer": "<A 2-3 sentence ideal answer>",
                  "starAdvice": "<One sentence STAR method tip tailored to this question>"
                }
                No markdown, no extra text — raw JSON only.
                """,
                questionText, answer
        );

        String raw = groqApiClient.chat(systemPrompt, userMessage);
        if (raw == null || raw.isBlank()) return null;

        try {
            String json = raw.trim();
            if (json.startsWith("```")) {
                json = json.replaceFirst("```[a-zA-Z]*\\n?", "").replaceAll("```$", "").trim();
            }

            Map<String, Object> parsed = mapper.readValue(json, new TypeReference<>() {});

            int score = Math.min(100, Math.max(0, toInt(parsed.get("score"), 60)));
            String grade = nvl((String) parsed.get("grade"), score >= 85 ? "Excellent" : score >= 70 ? "Good" : "Needs Review");
            List<String> strengths = toStringList(parsed.get("strengths"));
            List<String> improvements = toStringList(parsed.get("improvements"));
            String modelAnswer = nvl((String) parsed.get("modelAnswer"), "");
            String starAdvice = nvl((String) parsed.get("starAdvice"), "Structure your answer using Situation, Task, Action, and Result.");

            return new AnswerEvaluationResponse(score, grade, strengths, improvements, modelAnswer, starAdvice);
        } catch (Exception ex) {
            log.warn("Failed to parse Groq evaluation JSON: {}", ex.getMessage());
            return null;
        }
    }

    // -------------------------------------------------------------------------
    // Local template fallback (original logic preserved)
    // -------------------------------------------------------------------------

    private List<InterviewQuestionDTO> localTemplateFallback(String role, String subject, String skills) {
        List<InterviewQuestionDTO> generated = new ArrayList<>();
        String lowerSubject = subject.toLowerCase();
        String lowerRole = role.toLowerCase();

        if (lowerSubject.contains("struct") || lowerSubject.contains("system") || lowerRole.contains("product")) {
            generated.add(make(role, subject, "System Architecture & Resilience", "INTERMEDIATE",
                    "For a " + role + " role, how would you design resilient services when a downstream API becomes slow or unavailable?",
                    "Set timeouts, retries with backoff, circuit breakers, rate limits, bulkheads, and graceful fallbacks. Add observability so latency, errors, and saturation can be detected quickly.",
                    "Mention both prevention and recovery: timeout budgets, fallback behavior, alerts, and post-incident learning."));
            generated.add(make(role, subject, "Trees & Binary Search", "INTERMEDIATE",
                    "How do you validate whether a binary tree is a valid Binary Search Tree in linear time?",
                    "Use recursion with min and max bounds for every node, or do an in-order traversal and verify values are strictly increasing. Time is O(N), space is O(H).",
                    "Explain why checking only the immediate left and right children is insufficient."));
            generated.add(make(role, subject, "Data Persistence & Query Performance", "ADVANCED",
                    "How would you diagnose and optimize slow SQL queries over millions of rows?",
                    "Start with EXPLAIN or the query plan, check index usage, remove N+1 patterns, reduce selected columns, add covering indexes, and consider partitioning or read replicas.",
                    "Tie each optimization to a measurable effect such as latency or reduced database load."));
        } else if (lowerSubject.contains("quant") || lowerSubject.contains("consult") || lowerSubject.contains("case")) {
            generated.add(make(role, subject, "Market Sizing", "ADVANCED",
                    "Estimate the daily coffee consumption in a business district with 500,000 office workers.",
                    "Segment workers into likely coffee drinkers, estimate cups per day, multiply by attendance. State assumptions clearly.",
                    "Use population → segment → consumption structure instead of jumping to a final number."));
            generated.add(make(role, subject, "SQL Analytics", "INTERMEDIATE",
                    "How would you rank candidates by assessment score within each job category using SQL?",
                    "Use DENSE_RANK() OVER (PARTITION BY category ORDER BY score DESC). DENSE_RANK keeps tied candidates at the same rank without gaps.",
                    "Compare RANK, DENSE_RANK, and ROW_NUMBER to show judgment."));
            generated.add(make(role, subject, "Metric Trade-offs", "INTERMEDIATE",
                    "A dashboard metric improves by 12%, but user complaints increase. How would you decide whether the change should remain live?",
                    "Review primary, secondary, and guardrail metrics. Segment affected users, inspect complaint themes, confirm statistical significance.",
                    "Make your decision criteria explicit before recommending ship, rollback, or iterate."));
        } else if (lowerSubject.contains("ai") || lowerSubject.contains("machine") || lowerSubject.contains("learning") || lowerRole.contains("ml")) {
            generated.add(make(role, subject, "Model Evaluation", "INTERMEDIATE",
                    "How would you decide whether a classification model is good enough for production?",
                    "Review precision, recall, F1, ROC-AUC, calibration, and error examples. Validate on unseen data and monitor drift after deployment.",
                    "Connect the metric choice to the cost of false positives and false negatives."));
            generated.add(make(role, subject, "Feature Engineering", "INTERMEDIATE",
                    "What steps would you take when a model performs well in training but poorly on validation data?",
                    "Check for overfitting, data leakage, train-validation split issues, class imbalance, or noisy labels. Use regularization, cross-validation, or more representative data.",
                    "Mention leakage and validation strategy before jumping to model tuning."));
            generated.add(make(role, subject, "ML System Design", "ADVANCED",
                    "How would you design an ML pipeline that retrains and serves recommendations for a job portal?",
                    "Collect interaction data, build offline features, train and validate, register versions, deploy via API, run A/B tests, and monitor latency and drift.",
                    "Cover both model quality and production reliability."));
        } else if (lowerSubject.contains("electronics") || lowerSubject.contains("embedded") || lowerSubject.contains("hardware")) {
            generated.add(make(role, subject, "Embedded Systems", "INTERMEDIATE",
                    "How do interrupts differ from polling in an embedded system, and when would you choose each?",
                    "Interrupts let hardware notify the CPU only when needed, reducing wasted cycles. Polling is simpler for low-frequency or deterministic checks.",
                    "Discuss latency, CPU usage, complexity, and debugging trade-offs."));
            generated.add(make(role, subject, "Digital Electronics", "INTERMEDIATE",
                    "Explain setup time and hold time in flip-flops. What happens if either constraint is violated?",
                    "Setup time is minimum stable time before the clock edge; hold time is minimum stable time after. Violations can cause metastability.",
                    "Mention clock skew, timing closure, and why synchronizers are used across clock domains."));
            generated.add(make(role, subject, "Hardware Debugging", "PRACTICAL",
                    "A microcontroller board powers on but does not communicate over UART. How would you debug it?",
                    "Verify power rails, check baud rate and UART settings, confirm TX/RX wiring, inspect logic levels with an oscilloscope, and test firmware with a minimal transmit program.",
                    "Move from physical layer checks to firmware configuration then protocol-level validation."));
        } else if (lowerSubject.contains("react") || lowerSubject.contains("node") || lowerSubject.contains("startup")) {
            generated.add(make(role, subject, "React Rendering", "PRACTICAL",
                    "How does React reconciliation reduce DOM updates when rendering large lists?",
                    "React compares virtual trees and uses keys to match list items. Stable keys help preserve existing DOM nodes and component state instead of recreating unchanged elements.",
                    "Explain why array index keys can cause bugs when items are inserted, removed, or reordered."));
            generated.add(make(role, subject, "Node.js Event Loop", "INTERMEDIATE",
                    "Why can a CPU-heavy synchronous loop block all HTTP requests in Node.js, and how would you fix it?",
                    "Node.js runs JavaScript on a single main thread. CPU-heavy work blocks the event loop and should be moved to Worker Threads or a job queue.",
                    "Mention that async I/O helps I/O waits but does not make CPU work free."));
            generated.add(make(role, subject, "API Error Handling", "PRACTICAL",
                    "How would you prevent duplicate submissions in a checkout or job-application flow?",
                    "Use idempotency keys on the backend, disable repeated submit while requests are pending, retry only safe operations, and show clear recoverable error states.",
                    "Cover both frontend experience and backend consistency."));
        } else {
            generated.add(make(role, subject, "Core Technical Concepts", "INTERMEDIATE",
                    "What strategies would you use when scaling an application from 1,000 to 1,000,000 daily active users?",
                    "Add CDN caching, application caching, load balancing, horizontal scaling, optimize database queries, and split services only when boundaries are clear.",
                    "Explain the order of changes and why each step solves a bottleneck."));
            generated.add(make(role, subject, "Role-specific Skills", "INTERMEDIATE",
                    "Based on skills like " + skills + ", which technical area would you expect interviewers to probe most deeply and why?",
                    "Identify the most job-critical skill, connect it to business responsibilities, and prepare examples that show depth, trade-offs, and debugging experience.",
                    "Make the answer specific to the target role rather than listing every skill equally."));
            generated.add(make(role, subject, "Technical Communication", "INTERMEDIATE",
                    "How do you explain a complex technical trade-off to a non-technical stakeholder?",
                    "Translate implementation choices into impact on users, delivery time, reliability, and cost. Give a recommendation with risks and a fallback plan.",
                    "Avoid jargon and end with a clear decision."));
        }

        return generated;
    }

    private AnswerEvaluationResponse heuristicEvaluate(String answer) {
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
            strengths.add("Applied STAR methodology effectively.");
        } else {
            improvements.add("Structure response using STAR: Situation, Task, Action, Result.");
        }

        if (lower.contains("index") || lower.contains("thread") || lower.contains("cache") || lower.contains("api")
                || lower.contains("test") || lower.contains("sql") || lower.contains("react")) {
            score += 15;
            strengths.add("Used relevant domain terminology and key technical concepts.");
        } else {
            improvements.add("Incorporate core technical terms such as latency, time complexity, scaling, consistency, or reliability.");
        }

        score = Math.min(100, Math.max(35, score));
        String grade = score >= 85 ? "Excellent" : score >= 70 ? "Good" : "Needs Review";
        return new AnswerEvaluationResponse(score, grade, strengths, improvements,
                "A strong response directly addresses the technical problem, provides a concrete scenario, explains trade-offs, and quantifies the outcome where possible.",
                "Frame project answers around the challenge, your specific action, and the measurable result.");
    }

    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------

    private InterviewQuestionDTO make(String role, String subject, String skill, String difficulty,
                                      String question, String answer, String tip) {
        return new InterviewQuestionDTO(nextGeneratedId(), role, subject, skill, difficulty, question, answer, tip);
    }

    private long nextGeneratedId() {
        return generatedIdSequence.incrementAndGet();
    }

    private static String nvl(String value, String fallback) {
        return (value != null && !value.isBlank()) ? value : fallback;
    }

    @SuppressWarnings("unchecked")
    private static List<String> toStringList(Object obj) {
        if (obj instanceof List<?> list) {
            List<String> result = new ArrayList<>();
            for (Object item : list) {
                if (item != null) result.add(item.toString());
            }
            return result;
        }
        return new ArrayList<>();
    }

    private static int toInt(Object obj, int fallback) {
        if (obj == null) return fallback;
        try {
            return ((Number) obj).intValue();
        } catch (ClassCastException e) {
            try {
                return Integer.parseInt(obj.toString());
            } catch (NumberFormatException ex) {
                return fallback;
            }
        }
    }
}
