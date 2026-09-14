package org.miniproject.jobnestjobaptitudeportal.service.interview;

import java.util.ArrayList;
import java.util.List;
import org.miniproject.jobnestjobaptitudeportal.dto.request.AiInterviewGenerateRequest;
import org.miniproject.jobnestjobaptitudeportal.dto.request.EvaluateAnswerRequest;
import org.miniproject.jobnestjobaptitudeportal.dto.response.AnswerEvaluationResponse;
import org.miniproject.jobnestjobaptitudeportal.dto.response.InterviewQuestionDTO;
import org.miniproject.jobnestjobaptitudeportal.entity.InterviewQuestion;
import org.miniproject.jobnestjobaptitudeportal.repository.InterviewQuestionRepository;
import org.miniproject.jobnestjobaptitudeportal.service.ai.InterviewQuestionGenerator;
import org.springframework.stereotype.Service;

@Service
public class InterviewService {

    private final InterviewQuestionRepository questionRepository;
    private final InterviewQuestionGenerator aiGenerator;

    public InterviewService(InterviewQuestionRepository questionRepository, InterviewQuestionGenerator aiGenerator) {
        this.questionRepository = questionRepository;
        this.aiGenerator = aiGenerator;
    }

    public List<InterviewQuestionDTO> getQuestions(String subject, String role, String difficulty) {
        List<InterviewQuestion> questions;
        if (subject != null && !subject.isBlank() && difficulty != null && !difficulty.isBlank()) {
            questions = questionRepository.findBySubjectIgnoreCaseAndDifficultyIgnoreCase(subject, difficulty);
        } else if (subject != null && !subject.isBlank()) {
            questions = questionRepository.findBySubjectIgnoreCase(subject);
        } else if (role != null && !role.isBlank()) {
            questions = questionRepository.findByRoleIgnoreCase(role);
        } else {
            questions = questionRepository.findAll();
        }

        List<InterviewQuestionDTO> dtos = new ArrayList<>(questions.stream()
                .map(q -> new InterviewQuestionDTO(
                        q.getId(),
                        q.getRole(),
                        q.getSubject(),
                        q.getSkill(),
                        q.getDifficulty(),
                        q.getQuestionText(),
                        q.getSampleAnswer(),
                        q.getAiTips()
                ))
                .toList());

        // Dynamic AI Generation Fallback if fewer than 2 questions exist for the subject/track
        if (dtos.size() < 2 && subject != null && !subject.isBlank()) {
            List<InterviewQuestionDTO> aiGenerated = aiGenerator.generateQuestionsFromJd(
                    new AiInterviewGenerateRequest(role != null ? role : "Software Candidate", "", "", subject)
            );
            dtos.addAll(aiGenerated);
        }

        return dtos;
    }

    public List<String> getDistinctSubjects() {
        List<String> subjects = questionRepository.findDistinctSubjects();
        if (subjects.isEmpty()) {
            return List.of("Data Structures & System Concepts", "Quantitative Estimation & Case Studies", "React, Node.js & Practical Project Scenarios", "DBMS", "Operating Systems", "Computer Networks", "AI, Machine Learning & Data Science", "Electronics, Embedded & Hardware Systems", "System Design");
        }
        return subjects;
    }

    public List<InterviewQuestionDTO> generateAiQuestions(AiInterviewGenerateRequest request) {
        return aiGenerator.generateQuestionsFromJd(request);
    }

    public AnswerEvaluationResponse evaluateAnswer(EvaluateAnswerRequest request) {
        return aiGenerator.evaluateAnswer(request);
    }
}
