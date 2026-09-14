package org.miniproject.jobnestjobaptitudeportal.service.ai;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.atomic.AtomicLong;
import org.miniproject.jobnestjobaptitudeportal.dto.request.AiInterviewGenerateRequest;
import org.miniproject.jobnestjobaptitudeportal.dto.request.EvaluateAnswerRequest;
import org.miniproject.jobnestjobaptitudeportal.dto.response.AnswerEvaluationResponse;
import org.miniproject.jobnestjobaptitudeportal.dto.response.InterviewQuestionDTO;
import org.springframework.stereotype.Service;

@Service
public class InterviewQuestionGenerator {

    private final AtomicLong generatedIdSequence = new AtomicLong(2000L);

    public List<InterviewQuestionDTO> generateQuestionsFromJd(AiInterviewGenerateRequest request) {
        String role = request.targetRole() != null && !request.targetRole().isBlank() ? request.targetRole() : "Software Developer";
        String subject = request.subject() != null && !request.subject().isBlank() ? request.subject() : "Technical & Behavioral";
        String skills = request.candidateSkills() != null && !request.candidateSkills().isBlank() ? request.candidateSkills() : "the required technical skills";

        List<InterviewQuestionDTO> generated = new ArrayList<>();
        String lowerSubject = subject.toLowerCase();
        String lowerRole = role.toLowerCase();

        if (lowerSubject.contains("struct") || lowerSubject.contains("system") || lowerRole.contains("product")) {
            generated.add(new InterviewQuestionDTO(
                    nextGeneratedId(), role, subject, "System Architecture & Resilience", "INTERMEDIATE",
                    "For a " + role + " role, how would you design resilient services when a downstream API becomes slow or unavailable?",
                    "Set timeouts, retries with backoff, circuit breakers, rate limits, bulkheads, and graceful fallbacks. Add observability so latency, errors, and saturation can be detected quickly.",
                    "Mention both prevention and recovery: timeout budgets, fallback behavior, alerts, and post-incident learning."
            ));
            generated.add(new InterviewQuestionDTO(
                    nextGeneratedId(), role, subject, "Trees & Binary Search", "INTERMEDIATE",
                    "How do you validate whether a binary tree is a valid Binary Search Tree in linear time?",
                    "Use recursion with min and max bounds for every node, or do an in-order traversal and verify values are strictly increasing. Time is O(N), and space is O(H) for recursion stack.",
                    "Explain why checking only the immediate left and right children is not enough."
            ));
            generated.add(new InterviewQuestionDTO(
                    nextGeneratedId(), role, subject, "Data Persistence & Query Performance", "ADVANCED",
                    "How would you diagnose and optimize slow SQL queries over millions of rows?",
                    "Start with EXPLAIN or the query plan, check index usage, remove N+1 patterns, reduce selected columns, add covering indexes where useful, and consider partitioning or read replicas for high volume reads.",
                    "Tie each optimization to a measurable effect such as latency, throughput, or reduced database load."
            ));
        } else if (lowerSubject.contains("quant") || lowerSubject.contains("consult") || lowerSubject.contains("case")) {
            generated.add(new InterviewQuestionDTO(
                    nextGeneratedId(), role, subject, "Market Sizing Guesstimate", "ADVANCED",
                    "Estimate the daily coffee consumption in a business district with 500,000 office workers.",
                    "Segment workers into likely coffee drinkers, estimate cups per drinker per day, then multiply by working-day attendance. State assumptions clearly and sanity-check the result.",
                    "Use a clean population to segment to consumption structure instead of jumping to a final number."
            ));
            generated.add(new InterviewQuestionDTO(
                    nextGeneratedId(), role, subject, "SQL Analytics Window Functions", "INTERMEDIATE",
                    "How would you rank candidates by assessment score within each job category using SQL?",
                    "Use DENSE_RANK() OVER (PARTITION BY category ORDER BY score DESC). DENSE_RANK keeps tied candidates at the same rank without leaving gaps in the next rank.",
                    "Compare RANK, DENSE_RANK, and ROW_NUMBER to show judgment."
            ));
            generated.add(new InterviewQuestionDTO(
                    nextGeneratedId(), role, subject, "Metric Trade-offs", "INTERMEDIATE",
                    "A dashboard metric improves by 12%, but user complaints increase. How would you decide whether the change should remain live?",
                    "Review primary, secondary, and guardrail metrics. Segment affected users, inspect complaint themes, confirm statistical significance, and decide using business impact plus user trust.",
                    "Make your decision criteria explicit before recommending ship, rollback, or iterate."
            ));
        } else if (lowerSubject.contains("ai") || lowerSubject.contains("machine") || lowerSubject.contains("learning") || lowerSubject.contains("data science") || lowerRole.contains("ml") || lowerRole.contains("data scientist")) {
            generated.add(new InterviewQuestionDTO(
                    nextGeneratedId(), role, subject, "Model Evaluation", "INTERMEDIATE",
                    "How would you decide whether a classification model is good enough for production?",
                    "Start with the business goal, then review precision, recall, F1 score, ROC-AUC, confusion matrix, calibration, and error examples. Validate on unseen data and monitor drift after deployment.",
                    "Connect the metric choice to the cost of false positives and false negatives."
            ));
            generated.add(new InterviewQuestionDTO(
                    nextGeneratedId(), role, subject, "Feature Engineering", "INTERMEDIATE",
                    "What steps would you take when a model performs well in training but poorly on validation data?",
                    "Check for overfitting, data leakage, train-validation split issues, class imbalance, noisy labels, and high variance. Use regularization, simpler models, better features, cross-validation, or more representative data.",
                    "Mention leakage and validation strategy before jumping to model tuning."
            ));
            generated.add(new InterviewQuestionDTO(
                    nextGeneratedId(), role, subject, "ML System Design", "ADVANCED",
                    "How would you design an ML pipeline that retrains and serves recommendations for a job portal?",
                    "Collect interaction data, build offline features, train and validate models, register versions, deploy through a serving API, run A/B tests, and monitor latency, drift, and business metrics.",
                    "Cover both model quality and production reliability."
            ));
        } else if (lowerSubject.contains("electronics") || lowerSubject.contains("embedded") || lowerSubject.contains("hardware") || lowerSubject.contains("vlsi") || lowerRole.contains("embedded") || lowerRole.contains("hardware")) {
            generated.add(new InterviewQuestionDTO(
                    nextGeneratedId(), role, subject, "Embedded Systems", "INTERMEDIATE",
                    "How do interrupts differ from polling in an embedded system, and when would you choose each?",
                    "Interrupts let hardware notify the CPU only when attention is needed, reducing wasted cycles and improving responsiveness. Polling is simpler and can work for low-frequency or deterministic checks where timing is easy to control.",
                    "Discuss latency, CPU usage, complexity, and debugging trade-offs."
            ));
            generated.add(new InterviewQuestionDTO(
                    nextGeneratedId(), role, subject, "Digital Electronics", "INTERMEDIATE",
                    "Explain setup time and hold time in flip-flops. What happens if either constraint is violated?",
                    "Setup time is the minimum time data must be stable before the clock edge, and hold time is the minimum time it must remain stable after the clock edge. Violations can cause metastability and unreliable circuit behavior.",
                    "Mention clock skew, timing closure, and why synchronizers are used across clock domains."
            ));
            generated.add(new InterviewQuestionDTO(
                    nextGeneratedId(), role, subject, "Hardware Debugging", "PRACTICAL",
                    "A microcontroller board powers on but does not communicate over UART. How would you debug it?",
                    "Verify power rails and ground, check baud rate and UART settings, confirm TX/RX wiring, inspect logic levels with an oscilloscope or logic analyzer, and test firmware with a minimal transmit program.",
                    "Move from physical layer checks to firmware configuration and then protocol-level validation."
            ));        } else if (lowerSubject.contains("react") || lowerSubject.contains("node") || lowerSubject.contains("startup")) {
            generated.add(new InterviewQuestionDTO(
                    nextGeneratedId(), role, subject, "React Rendering", "PRACTICAL",
                    "How does React reconciliation reduce DOM updates when rendering large lists?",
                    "React compares virtual trees and uses keys to match list items between renders. Stable keys help React preserve existing DOM nodes and component state instead of recreating unchanged elements.",
                    "Explain why array index keys can cause bugs when items are inserted, removed, or reordered."
            ));
            generated.add(new InterviewQuestionDTO(
                    nextGeneratedId(), role, subject, "Node.js Event Loop", "INTERMEDIATE",
                    "Why can a CPU-heavy synchronous loop block all HTTP requests in Node.js, and how would you fix it?",
                    "Node.js runs JavaScript on a single main thread. CPU-heavy work blocks the event loop, so it should be moved to Worker Threads, a job queue, or a separate service.",
                    "Mention that async I/O helps I/O waits, but it does not make CPU work free."
            ));
            generated.add(new InterviewQuestionDTO(
                    nextGeneratedId(), role, subject, "API Error Handling", "PRACTICAL",
                    "How would you prevent duplicate submissions in a checkout or job-application flow?",
                    "Use idempotency keys on the backend, disable repeated submit actions while requests are pending, retry only safe operations, and show clear recoverable error states.",
                    "Cover both frontend experience and backend consistency."
            ));
        } else {
            generated.add(new InterviewQuestionDTO(
                    nextGeneratedId(), role, subject, "Core Technical Concepts", "INTERMEDIATE",
                    "What strategies would you use when scaling an application from 1,000 to 1,000,000 daily active users?",
                    "Add CDN caching for static assets, use application caching, introduce load balancing and horizontal scaling, optimize database queries, and split services only when boundaries are clear.",
                    "Explain the order of changes and why each step solves a bottleneck."
            ));
            generated.add(new InterviewQuestionDTO(
                    nextGeneratedId(), role, subject, "Role-specific Skills", "INTERMEDIATE",
                    "Based on skills like " + skills + ", which technical area would you expect interviewers to probe most deeply and why?",
                    "Identify the most job-critical skill, connect it to business responsibilities, and prepare examples that show depth, trade-offs, and debugging experience.",
                    "Make the answer specific to the target role rather than listing every skill equally."
            ));
            generated.add(new InterviewQuestionDTO(
                    nextGeneratedId(), role, subject, "Technical Communication", "INTERMEDIATE",
                    "How do you explain a complex technical trade-off to a non-technical stakeholder?",
                    "Translate implementation choices into impact on users, delivery time, reliability, and cost. Give a recommendation with risks and a fallback plan.",
                    "Avoid jargon and end with a clear decision."
            ));
        }

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
            strengths.add("Applied STAR methodology effectively.");
        } else {
            improvements.add("Structure response using STAR: Situation, Task, Action, Result.");
        }

        if (lower.contains("index") || lower.contains("thread") || lower.contains("cache") || lower.contains("api") || lower.contains("test") || lower.contains("sql") || lower.contains("react")) {
            score += 15;
            strengths.add("Used relevant domain terminology and key technical concepts.");
        } else {
            improvements.add("Incorporate core technical terms such as latency, time complexity, scaling, consistency, or reliability.");
        }

        score = Math.min(100, Math.max(35, score));
        String grade = score >= 85 ? "Excellent" : score >= 70 ? "Good" : "Needs Review";

        String modelAnswer = "A strong response directly addresses the technical problem, provides a concrete scenario, explains trade-offs, and quantifies the outcome where possible.";
        String starAdvice = "Frame project answers around the challenge, your specific action, and the measurable result.";

        return new AnswerEvaluationResponse(score, grade, strengths, improvements, modelAnswer, starAdvice);
    }

    private long nextGeneratedId() {
        return generatedIdSequence.incrementAndGet();
    }
}
