package org.miniproject.jobnestjobaptitudeportal.controller.candidate;

import java.util.List;
import org.miniproject.jobnestjobaptitudeportal.dto.request.AiInterviewGenerateRequest;
import org.miniproject.jobnestjobaptitudeportal.dto.request.EvaluateAnswerRequest;
import org.miniproject.jobnestjobaptitudeportal.dto.response.AnswerEvaluationResponse;
import org.miniproject.jobnestjobaptitudeportal.dto.response.InterviewQuestionDTO;
import org.miniproject.jobnestjobaptitudeportal.service.interview.InterviewService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/candidate/interview")
public class InterviewController {

    private final InterviewService interviewService;

    public InterviewController(InterviewService interviewService) {
        this.interviewService = interviewService;
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
}
