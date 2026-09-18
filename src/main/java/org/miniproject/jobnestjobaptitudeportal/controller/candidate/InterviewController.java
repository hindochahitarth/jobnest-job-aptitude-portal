package org.miniproject.jobnestjobaptitudeportal.controller.candidate;

import java.util.List;
import org.miniproject.jobnestjobaptitudeportal.dto.request.AiInterviewGenerateRequest;
import org.miniproject.jobnestjobaptitudeportal.dto.request.EvaluateAnswerRequest;
import org.miniproject.jobnestjobaptitudeportal.dto.request.StartMockSessionRequest;
import org.miniproject.jobnestjobaptitudeportal.dto.request.SubmitMockAnswerRequest;
import org.miniproject.jobnestjobaptitudeportal.dto.request.VoiceReplyRequest;
import org.miniproject.jobnestjobaptitudeportal.dto.response.AnswerEvaluationResponse;
import org.miniproject.jobnestjobaptitudeportal.dto.response.InterviewQuestionDTO;
import org.miniproject.jobnestjobaptitudeportal.dto.response.MockSessionResponse;
import org.miniproject.jobnestjobaptitudeportal.dto.response.MockSubmitResponse;
import org.miniproject.jobnestjobaptitudeportal.dto.response.VoiceReplyResponse;
import org.miniproject.jobnestjobaptitudeportal.security.JwtUtil.JwtUser;
import org.miniproject.jobnestjobaptitudeportal.service.interview.InterviewService;
import org.miniproject.jobnestjobaptitudeportal.service.interview.MockInterviewService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/candidate/interview")
public class InterviewController {

    private final InterviewService interviewService;
    private final MockInterviewService mockInterviewService;

    public InterviewController(InterviewService interviewService, MockInterviewService mockInterviewService) {
        this.interviewService = interviewService;
        this.mockInterviewService = mockInterviewService;
    }

    @GetMapping("/questions")
    public ResponseEntity<List<InterviewQuestionDTO>> getQuestions(
            @RequestParam(required = false) String subject,
            @RequestParam(required = false) String role,
            @RequestParam(required = false) String difficulty) {
        return ResponseEntity.ok(interviewService.getQuestions(subject, role, difficulty));
    }

    @GetMapping("/subjects")
    public ResponseEntity<List<String>> getSubjects() {
        return ResponseEntity.ok(interviewService.getDistinctSubjects());
    }

    /**
     * Generate interview questions via Groq AI (or local template fallback).
     * Accepts an optional ?count parameter (default 5).
     */
    @PostMapping("/ai-generate")
    public ResponseEntity<List<InterviewQuestionDTO>> generateAiQuestions(
            @RequestBody AiInterviewGenerateRequest request,
            @RequestParam(defaultValue = "5") int count) {
        List<InterviewQuestionDTO> questions = interviewService.generateAiQuestions(request);
        // Return up to `count` questions; generate extra batches if needed
        return ResponseEntity.ok(questions.stream().limit(count).toList());
    }

    @PostMapping("/evaluate")
    public ResponseEntity<AnswerEvaluationResponse> evaluateAnswer(
            @RequestBody EvaluateAnswerRequest request) {
        return ResponseEntity.ok(interviewService.evaluateAnswer(request));
    }

    // -------------------------------------------------------------------------
    // AI Mock Interview — Freemium Session Endpoints
    // -------------------------------------------------------------------------

    /**
     * POST /api/candidate/interview/mock/start
     * Initialises a new mock interview session with 5 AI-curated questions.
     * Any existing active session for the user is expired automatically.
     */
    @PostMapping("/mock/start")
    public ResponseEntity<MockSessionResponse> startMockSession(
            @AuthenticationPrincipal JwtUser jwtUser,
            @RequestBody StartMockSessionRequest request) {
        return ResponseEntity.ok(mockInterviewService.startSession(jwtUser.userId(), request));
    }

    /**
     * POST /api/candidate/interview/mock/submit-answer
     * Evaluates the candidate's answer for one question, increments counters,
     * and checks both freemium limits. Returns aggregate summary when limit is hit.
     */
    @PostMapping("/mock/submit-answer")
    public ResponseEntity<MockSubmitResponse> submitMockAnswer(
            @AuthenticationPrincipal JwtUser jwtUser,
            @RequestBody SubmitMockAnswerRequest request) {
        return ResponseEntity.ok(mockInterviewService.submitAnswer(jwtUser.userId(), request));
    }

    /**
     * GET /api/candidate/interview/mock/session/{sessionId}
     * Retrieves the current state of a mock session (for resume/history).
     */
    @GetMapping("/mock/session/{sessionId}")
    public ResponseEntity<MockSessionResponse> getMockSession(
            @AuthenticationPrincipal JwtUser jwtUser,
            @PathVariable Long sessionId) {
        return ResponseEntity.ok(mockInterviewService.getSession(jwtUser.userId(), sessionId));
    }

    /**
     * POST /api/candidate/interview/mock/force-end/{sessionId}
     * Called by the frontend when the client-side countdown hits zero.
     * Marks session as limit_reached and synthesises the final summary.
     */
    @PostMapping("/mock/force-end/{sessionId}")
    public ResponseEntity<MockSessionResponse> forceEndMockSession(
            @AuthenticationPrincipal JwtUser jwtUser,
            @PathVariable Long sessionId,
            @RequestParam(defaultValue = "300") int elapsedSeconds) {
        return ResponseEntity.ok(mockInterviewService.forceEnd(jwtUser.userId(), sessionId, elapsedSeconds));
    }

    /**
     * POST /api/candidate/interview/mock/voice-reply
     * Interactive voice interview endpoint.
     * Receives spoken transcript, evaluates it, and returns:
     *   - spokenReply (natural-language sentence for TTS)
     *   - transition phrase (bridge to next question)
     *   - full structured evaluation + updated session counters
     */
    @PostMapping("/mock/voice-reply")
    public ResponseEntity<VoiceReplyResponse> voiceReply(
            @AuthenticationPrincipal JwtUser jwtUser,
            @RequestBody VoiceReplyRequest request) {
        return ResponseEntity.ok(mockInterviewService.voiceReply(jwtUser.userId(), request));
    }
}
