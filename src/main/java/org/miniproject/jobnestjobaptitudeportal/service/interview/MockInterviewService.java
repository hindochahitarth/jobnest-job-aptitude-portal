package org.miniproject.jobnestjobaptitudeportal.service.interview;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import org.miniproject.jobnestjobaptitudeportal.dto.request.AiInterviewGenerateRequest;
import org.miniproject.jobnestjobaptitudeportal.dto.request.EvaluateAnswerRequest;
import org.miniproject.jobnestjobaptitudeportal.dto.request.StartMockSessionRequest;
import org.miniproject.jobnestjobaptitudeportal.dto.request.SubmitMockAnswerRequest;
import org.miniproject.jobnestjobaptitudeportal.dto.request.VoiceReplyRequest;
import org.miniproject.jobnestjobaptitudeportal.dto.response.AnswerEvaluationResponse;
import org.miniproject.jobnestjobaptitudeportal.dto.response.InterviewQuestionDTO;
import org.miniproject.jobnestjobaptitudeportal.dto.response.MockSessionResponse;
import org.miniproject.jobnestjobaptitudeportal.dto.response.MockSessionResponse.MockQuestionEntry;
import org.miniproject.jobnestjobaptitudeportal.dto.response.MockSessionResponse.MockSessionSummary;
import org.miniproject.jobnestjobaptitudeportal.dto.response.MockSubmitResponse;
import org.miniproject.jobnestjobaptitudeportal.dto.response.VoiceReplyResponse;
import org.miniproject.jobnestjobaptitudeportal.entity.InterviewSession;
import org.miniproject.jobnestjobaptitudeportal.exception.ApiException;
import org.miniproject.jobnestjobaptitudeportal.repository.InterviewSessionRepository;
import org.miniproject.jobnestjobaptitudeportal.service.ai.GroqApiClient;
import org.miniproject.jobnestjobaptitudeportal.service.ai.InterviewQuestionGenerator;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Manages AI Mock Interview sessions with a freemium dual-trigger limit:
 *   - max 5 completed questions  OR
 *   - max 300 seconds elapsed
 * Whichever limit is reached first ends the session and synthesises a summary.
 */
@Service
public class MockInterviewService {

    private static final int MAX_QUESTIONS = 5;
    private static final int MAX_DURATION_SECONDS = 300;

    private static final Logger log = LoggerFactory.getLogger(MockInterviewService.class);

    private final InterviewSessionRepository sessionRepository;
    private final InterviewQuestionGenerator questionGenerator;
    private final GroqApiClient groqApiClient;
    private final ObjectMapper mapper = new ObjectMapper();

    public MockInterviewService(
            InterviewSessionRepository sessionRepository,
            InterviewQuestionGenerator questionGenerator,
            GroqApiClient groqApiClient) {
        this.sessionRepository = sessionRepository;
        this.questionGenerator = questionGenerator;
        this.groqApiClient = groqApiClient;
    }

    // -------------------------------------------------------------------------
    // Start Session
    // -------------------------------------------------------------------------

    @Transactional
    public MockSessionResponse startSession(Long userId, StartMockSessionRequest req) {
        // Expire any pre-existing active session for this user
        sessionRepository
                .findFirstByUserIdAndStatusOrderByStartedAtDesc(userId, "active")
                .ifPresent(existing -> {
                    existing.setStatus("limit_reached");
                    existing.setEndedAt(Instant.now());
                    sessionRepository.save(existing);
                });

        // Generate exactly 5 curated questions
        String role = nvl(req.targetRole(), "Software Developer");
        String subject = nvl(req.subject(), "Technical & Behavioral");
        String skills = nvl(req.candidateSkills(), "general software engineering");
        String jd = nvl(req.jobDescription(), "");

        List<InterviewQuestionDTO> aiQuestions = questionGenerator.generateQuestionsFromJd(
                new AiInterviewGenerateRequest(role, jd, skills, subject));

        // Build the question entries (no answers yet)
        List<MockQuestionEntry> entries = new ArrayList<>();
        for (int i = 0; i < Math.min(MAX_QUESTIONS, aiQuestions.size()); i++) {
            InterviewQuestionDTO q = aiQuestions.get(i);
            entries.add(new MockQuestionEntry(
                    i,
                    q.questionText(),
                    q.skill(),
                    q.difficulty(),
                    null, null, null,
                    List.of(), List.of(),
                    null, null));
        }
        // Pad to exactly 5 if needed (AI sometimes returns fewer)
        while (entries.size() < MAX_QUESTIONS) {
            int idx = entries.size();
            entries.add(new MockQuestionEntry(idx, "Describe a technical challenge you solved recently and the approach you took.",
                    "Problem Solving", "INTERMEDIATE",
                    null, null, null, List.of(), List.of(), null, null));
        }

        InterviewSession session = new InterviewSession();
        session.setUserId(userId);
        session.setTargetRole(role);
        session.setStatus("active");
        session.setQuestionsJson(toJson(entries));
        InterviewSession saved = sessionRepository.save(session);

        return buildSessionResponse(saved, entries, null);
    }

    // -------------------------------------------------------------------------
    // Submit Answer
    // -------------------------------------------------------------------------

    @Transactional
    public MockSubmitResponse submitAnswer(Long userId, SubmitMockAnswerRequest req) {
        InterviewSession session = sessionRepository.findById(req.sessionId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Session not found"));

        if (!session.getUserId().equals(userId)) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Session does not belong to this user");
        }
        if (!"active".equals(session.getStatus())) {
            throw new ApiException(HttpStatus.CONFLICT, "Session is already " + session.getStatus());
        }

        // Update elapsed time from client-reported elapsed seconds (bounded)
        int elapsed = Math.min(req.elapsedSeconds(), MAX_DURATION_SECONDS);
        session.setTotalDurationSeconds(elapsed);

        // Evaluate the answer via Groq
        AnswerEvaluationResponse eval = questionGenerator.evaluateAnswer(
                new EvaluateAnswerRequest(null, req.questionText(), req.candidateAnswer()));

        // Merge answer into questions list
        List<MockQuestionEntry> entries = fromJson(session.getQuestionsJson());
        int idx = req.questionIndex();
        if (idx >= 0 && idx < entries.size()) {
            entries.set(idx, new MockQuestionEntry(
                    idx,
                    entries.get(idx).questionText(),
                    entries.get(idx).skill(),
                    entries.get(idx).difficulty(),
                    req.candidateAnswer(),
                    eval.score(),
                    eval.grade(),
                    eval.strengths(),
                    eval.improvements(),
                    eval.modelAnswer(),
                    eval.starAdvice()
            ));
        }

        session.setCompletedCount(session.getCompletedCount() + 1);
        session.setQuestionsJson(toJson(entries));

        // Check both freemium limits
        boolean questionLimitHit = session.getCompletedCount() >= MAX_QUESTIONS;
        boolean timeLimitHit = session.getTotalDurationSeconds() >= MAX_DURATION_SECONDS;
        boolean limitReached = questionLimitHit || timeLimitHit;
        String limitReason = null;

        MockSessionSummary summary = null;
        if (limitReached) {
            limitReason = timeLimitHit && !questionLimitHit ? "time" : "questions";
            session.setStatus(session.getCompletedCount() >= MAX_QUESTIONS ? "completed" : "limit_reached");
            session.setEndedAt(Instant.now());

            // Synthesise aggregate summary
            summary = buildSummary(entries, limitReason);
            session.setSummaryFeedback(summary.summaryFeedback());
            session.setOverallScore(summary.overallScore());
        }

        sessionRepository.save(session);

        return new MockSubmitResponse(
                eval.score(), eval.grade(), eval.strengths(), eval.improvements(),
                eval.modelAnswer(), eval.starAdvice(),
                session.getId(), session.getStatus(),
                session.getCompletedCount(), session.getTotalDurationSeconds(),
                limitReached, limitReason, summary);
    }

    // -------------------------------------------------------------------------
    // Voice Reply  (used by the interactive voice interview)
    // -------------------------------------------------------------------------

    /**
     * Evaluates a spoken answer, generates a natural-language spoken reply
     * (to be read by TTS on the client), and returns the full structured evaluation
     * plus updated session state — all in one round-trip.
     */
    @Transactional
    public VoiceReplyResponse voiceReply(Long userId, VoiceReplyRequest req) {
        InterviewSession session = sessionRepository.findById(req.sessionId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Session not found"));

        if (!session.getUserId().equals(userId)) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Session does not belong to this user");
        }
        if (!"active".equals(session.getStatus())) {
            throw new ApiException(HttpStatus.CONFLICT, "Session is already " + session.getStatus());
        }

        // Bound elapsed time
        int elapsed = Math.min(req.elapsedSeconds(), MAX_DURATION_SECONDS);
        session.setTotalDurationSeconds(elapsed);

        // Evaluate via Groq
        AnswerEvaluationResponse eval = questionGenerator.evaluateAnswer(
                new EvaluateAnswerRequest(null, req.questionText(), req.spokenTranscript()));

        // Merge answer into questions list
        List<MockQuestionEntry> entries = fromJson(session.getQuestionsJson());
        int idx = req.questionIndex();
        if (idx >= 0 && idx < entries.size()) {
            entries.set(idx, new MockQuestionEntry(
                    idx,
                    entries.get(idx).questionText(),
                    entries.get(idx).skill(),
                    entries.get(idx).difficulty(),
                    req.spokenTranscript(),
                    eval.score(),
                    eval.grade(),
                    eval.strengths(),
                    eval.improvements(),
                    eval.modelAnswer(),
                    eval.starAdvice()
            ));
        }

        session.setCompletedCount(session.getCompletedCount() + 1);
        session.setQuestionsJson(toJson(entries));

        // Check limits
        boolean questionLimitHit = session.getCompletedCount() >= MAX_QUESTIONS;
        boolean timeLimitHit = session.getTotalDurationSeconds() >= MAX_DURATION_SECONDS;
        boolean limitReached = questionLimitHit || timeLimitHit;
        String limitReason = null;
        MockSessionSummary summary = null;

        if (limitReached) {
            limitReason = timeLimitHit && !questionLimitHit ? "time" : "questions";
            session.setStatus(session.getCompletedCount() >= MAX_QUESTIONS ? "completed" : "limit_reached");
            session.setEndedAt(Instant.now());
            summary = buildSummary(entries, limitReason);
            session.setSummaryFeedback(summary.summaryFeedback());
            session.setOverallScore(summary.overallScore());
        }

        sessionRepository.save(session);

        // Generate conversational spoken reply
        String spokenReply = buildSpokenReply(req.questionText(), req.spokenTranscript(), eval, limitReached);
        String transition = limitReached
                ? buildClosingTransition(summary)
                : buildNextTransition(session.getCompletedCount(), MAX_QUESTIONS);

        return new VoiceReplyResponse(
                spokenReply, transition,
                eval.score(), eval.grade(), eval.strengths(), eval.improvements(),
                eval.modelAnswer(), eval.starAdvice(),
                session.getId(), session.getStatus(),
                session.getCompletedCount(), session.getTotalDurationSeconds(),
                limitReached, limitReason, summary);
    }

    /**
     * Asks Groq to produce a short, natural spoken reply (2-3 sentences max)
     * that the TTS will read back to the candidate immediately after their answer.
     */
    private String buildSpokenReply(String question, String answer, AnswerEvaluationResponse eval, boolean isLast) {
        String systemPrompt = """
                You are a friendly but professional AI interviewer conducting a live spoken interview.
                You just heard the candidate's answer. Give a brief, encouraging spoken response — 2 sentences max.
                Acknowledge one strength and one area to improve. Do NOT repeat the question.
                Use natural spoken language, no lists, no asterisks, no markdown.
                """;

        String userMsg = String.format("""
                Question asked: %s
                Candidate's spoken answer: %s
                Score: %d/100 — %s

                Write a 2-sentence spoken acknowledgement. Keep it warm, direct, spoken-style.
                %s
                """,
                question,
                answer,
                eval.score(),
                eval.grade(),
                isLast ? "End with: 'That completes your free session. Well done for completing the mock interview!'"
                       : "End with a brief encouragement to prepare for the next question."
        );

        try {
            String raw = groqApiClient.chat(systemPrompt, userMsg);
            if (raw != null && !raw.isBlank()) return raw.trim();
        } catch (Exception e) {
            log.warn("Groq spoken reply failed: {}", e.getMessage());
        }

        // Heuristic fallback
        String tone = eval.score() >= 80 ? "Great answer!" : eval.score() >= 60 ? "Good effort!" : "Thanks for your answer.";
        String tip = eval.improvements() != null && !eval.improvements().isEmpty()
                ? " One thing to work on: " + eval.improvements().get(0).toLowerCase() + "."
                : "";
        return tone + tip + (isLast ? " That completes your free session!" : " Let's continue to the next question.");
    }

    private String buildNextTransition(int completedCount, int maxQuestions) {
        int next = completedCount + 1;
        return switch (completedCount % 3) {
            case 0 -> String.format("Moving to question %d of %d.", next, maxQuestions);
            case 1 -> String.format("Here's question %d.", next);
            default -> String.format("Next up, question %d of %d.", next, maxQuestions);
        };
    }

    private String buildClosingTransition(MockSessionSummary summary) {
        if (summary == null) return "Your free session is now complete. Thank you!";
        return String.format(
                "You scored an average of %d out of 100. %s Upgrade to Pro for unlimited sessions and deeper coaching.",
                summary.overallScore(),
                summary.overallScore() >= 75
                        ? "That's a solid performance — well done!"
                        : "Keep practising and you'll improve quickly."
        );
    }

    // -------------------------------------------------------------------------
    // Get Session
    // -------------------------------------------------------------------------

    public MockSessionResponse getSession(Long userId, Long sessionId) {
        InterviewSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Session not found"));
        if (!session.getUserId().equals(userId)) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Session does not belong to this user");
        }
        List<MockQuestionEntry> entries = fromJson(session.getQuestionsJson());
        MockSessionSummary summary = null;
        if (!"active".equals(session.getStatus()) && session.getSummaryFeedback() != null) {
            summary = new MockSessionSummary(
                    session.getOverallScore() != null ? session.getOverallScore() : 0,
                    session.getSummaryFeedback(),
                    "completed".equals(session.getStatus()) ? "questions" : "time");
        }
        return buildSessionResponse(session, entries, summary);
    }

    // -------------------------------------------------------------------------
    // Force-end session (timer expired client-side)
    // -------------------------------------------------------------------------

    @Transactional
    public MockSessionResponse forceEnd(Long userId, Long sessionId, int elapsedSeconds) {
        InterviewSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Session not found"));
        if (!session.getUserId().equals(userId)) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Session does not belong to this user");
        }
        if (!"active".equals(session.getStatus())) {
            // Already ended — just return current state
            List<MockQuestionEntry> entries = fromJson(session.getQuestionsJson());
            MockSessionSummary existingSummary = session.getSummaryFeedback() != null
                    ? new MockSessionSummary(
                            session.getOverallScore() != null ? session.getOverallScore() : 0,
                            session.getSummaryFeedback(), "time")
                    : null;
            return buildSessionResponse(session, entries, existingSummary);
        }

        session.setTotalDurationSeconds(Math.min(elapsedSeconds, MAX_DURATION_SECONDS));
        session.setStatus("limit_reached");
        session.setEndedAt(Instant.now());

        List<MockQuestionEntry> entries = fromJson(session.getQuestionsJson());
        MockSessionSummary summary = buildSummary(entries, "time");
        session.setSummaryFeedback(summary.summaryFeedback());
        session.setOverallScore(summary.overallScore());
        sessionRepository.save(session);

        return buildSessionResponse(session, entries, summary);
    }

    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------

    private MockSessionResponse buildSessionResponse(
            InterviewSession session,
            List<MockQuestionEntry> entries,
            MockSessionSummary summary) {
        return new MockSessionResponse(
                session.getId(),
                session.getStatus(),
                session.getTargetRole(),
                session.getCompletedCount(),
                session.getTotalDurationSeconds(),
                MAX_QUESTIONS,
                MAX_DURATION_SECONDS,
                entries,
                summary);
    }

    /**
     * Calls Groq to synthesise a holistic feedback summary across all evaluated answers.
     * Falls back to a heuristic summary if Groq is unavailable.
     */
    private MockSessionSummary buildSummary(List<MockQuestionEntry> entries, String limitReason) {
        List<MockQuestionEntry> answered = entries.stream()
                .filter(e -> e.score() != null)
                .toList();

        int overallScore = answered.isEmpty() ? 0
                : (int) answered.stream().mapToInt(MockQuestionEntry::score).average().orElse(0);

        String feedbackText = tryGroqSummary(answered, overallScore);
        if (feedbackText == null) {
            feedbackText = heuristicSummary(answered, overallScore);
        }

        return new MockSessionSummary(overallScore, feedbackText, limitReason);
    }

    private String tryGroqSummary(List<MockQuestionEntry> answered, int avgScore) {
        if (answered.isEmpty()) return null;

        StringBuilder qa = new StringBuilder();
        for (MockQuestionEntry e : answered) {
            qa.append("Q: ").append(e.questionText()).append("\n");
            qa.append("A: ").append(nvl(e.candidateAnswer(), "(no answer)")).append("\n");
            qa.append("Score: ").append(e.score()).append("/100\n\n");
        }

        String systemPrompt = "You are a senior technical interview coach. Write concise, actionable feedback.";
        String userMessage = String.format("""
                The candidate completed a mock interview session with an average score of %d/100.

                Here are the questions and answers:
                %s

                Write a 3-4 sentence overall performance summary. Be specific about what went well,
                what the biggest gap was, and one concrete next step to improve before the real interview.
                Return plain text only, no headings or bullet points.
                """, avgScore, qa);

        try {
            String raw = groqApiClient.chat(systemPrompt, userMessage);
            return (raw != null && !raw.isBlank()) ? raw.trim() : null;
        } catch (Exception e) {
            log.warn("Groq summary failed: {}", e.getMessage());
            return null;
        }
    }

    private String heuristicSummary(List<MockQuestionEntry> answered, int avgScore) {
        String grade = avgScore >= 85 ? "excellent" : avgScore >= 70 ? "good" : "needs improvement";
        int count = answered.size();
        return String.format(
                "You answered %d question%s with an average score of %d/100 — %s performance. "
                + "Focus on structuring answers using the STAR method (Situation, Task, Action, Result) "
                + "and backing claims with concrete examples. "
                + "Upgrade to Pro for unlimited mock interviews with deeper AI coaching.",
                count, count == 1 ? "" : "s", avgScore, grade);
    }

    private String toJson(List<MockQuestionEntry> entries) {
        try {
            return mapper.writeValueAsString(entries);
        } catch (Exception e) {
            log.error("Failed to serialize questions", e);
            return "[]";
        }
    }

    private List<MockQuestionEntry> fromJson(String json) {
        if (json == null || json.isBlank()) return new ArrayList<>();
        try {
            return mapper.readValue(json, new TypeReference<List<MockQuestionEntry>>() {});
        } catch (Exception e) {
            log.error("Failed to deserialize questions", e);
            return new ArrayList<>();
        }
    }

    private static String nvl(String value, String fallback) {
        return (value != null && !value.isBlank()) ? value : fallback;
    }
}
