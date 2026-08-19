package org.miniproject.jobnestjobaptitudeportal.service.aptitude;

import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.miniproject.jobnestjobaptitudeportal.dto.response.TestResultResponse;
import org.miniproject.jobnestjobaptitudeportal.entity.Answer;
import org.miniproject.jobnestjobaptitudeportal.entity.ProctoringLog;
import org.miniproject.jobnestjobaptitudeportal.entity.Question;
import org.miniproject.jobnestjobaptitudeportal.entity.TestAttempt;
import org.miniproject.jobnestjobaptitudeportal.repository.AnswerRepository;
import org.miniproject.jobnestjobaptitudeportal.repository.ProctoringLogRepository;
import org.miniproject.jobnestjobaptitudeportal.repository.QuestionRepository;
import org.miniproject.jobnestjobaptitudeportal.repository.TestAttemptRepository;
import org.springframework.stereotype.Service;

@Service
public class EvaluationService {

    private final QuestionRepository questionRepository;
    private final AnswerRepository answerRepository;
    private final ProctoringLogRepository proctoringLogRepository;
    private final TestAttemptRepository testAttemptRepository;

    public EvaluationService(QuestionRepository questionRepository,
                             AnswerRepository answerRepository,
                             ProctoringLogRepository proctoringLogRepository,
                             TestAttemptRepository testAttemptRepository) {
        this.questionRepository = questionRepository;
        this.answerRepository = answerRepository;
        this.proctoringLogRepository = proctoringLogRepository;
        this.testAttemptRepository = testAttemptRepository;
    }

    public TestResultResponse evaluateAttempt(TestAttempt attempt) {
        List<Answer> answers = answerRepository.findByTestAttemptId(attempt.getId());
        List<ProctoringLog> logs = proctoringLogRepository.findByTestAttemptIdOrderByTimestampAsc(attempt.getId());

        int score = 0;
        int correctCount = 0;
        int incorrectCount = 0;
        int skippedCount = 0;

        Map<String, int[]> sectionStats = new HashMap<>();

        for (Answer ans : answers) {
            Optional<Question> qOpt = questionRepository.findById(ans.getQuestionId());
            if (qOpt.isEmpty()) continue;

            Question q = qOpt.get();
            String sectionName = q.getSection().name();
            sectionStats.putIfAbsent(sectionName, new int[]{0, 0}); // [correct, total]
            sectionStats.get(sectionName)[1]++;

            if (ans.getSelectedOption() == null || ans.getSelectedOption().isBlank()) {
                ans.setIsCorrect(false);
                skippedCount++;
            } else if (ans.getSelectedOption().trim().equalsIgnoreCase(q.getCorrectOption().trim())) {
                ans.setIsCorrect(true);
                score += 4; // +4 for correct
                correctCount++;
                sectionStats.get(sectionName)[0]++;
            } else {
                ans.setIsCorrect(false);
                score = Math.max(0, score - 1); // -1 penalty for incorrect
                incorrectCount++;
            }
            answerRepository.save(ans);
        }

        int totalMarks = attempt.getTotalQuestions() * 4;
        double percentage = totalMarks > 0 ? (double) score / totalMarks * 100.0 : 0.0;

        // Calculate percentile approximation based on history
        final int finalScore = score;
        List<TestAttempt> allAttempts = testAttemptRepository.findAll();
        long lowerScores = allAttempts.stream().filter(a -> a.getScore() != null && a.getScore() < finalScore).count();
        double percentile = allAttempts.size() > 1 ? (double) lowerScores / (allAttempts.size() - 1) * 100.0 : 92.5;

        attempt.setScore(score);
        attempt.setTotalMarks(totalMarks);
        attempt.setPercentage(Math.round(percentage * 10.0) / 10.0);
        attempt.setPercentile(Math.round(percentile * 10.0) / 10.0);
        testAttemptRepository.save(attempt);

        List<TestResultResponse.SectionAccuracy> sectionBreakdown = new ArrayList<>();
        for (Map.Entry<String, int[]> entry : sectionStats.entrySet()) {
            int correct = entry.getValue()[0];
            int total = entry.getValue()[1];
            double accuracy = total > 0 ? (double) correct / total * 100.0 : 0.0;
            sectionBreakdown.add(new TestResultResponse.SectionAccuracy(
                    entry.getKey(), correct, total, Math.round(accuracy * 10.0) / 10.0
            ));
        }

        DateTimeFormatter formatter = DateTimeFormatter.ISO_INSTANT;
        List<TestResultResponse.ProctorLogSummary> logSummaries = logs.stream()
                .map(l -> new TestResultResponse.ProctorLogSummary(
                        l.getEventType().name(),
                        l.getTimestamp() != null ? formatter.format(l.getTimestamp()) : "",
                        l.getWarningNumber(),
                        l.getDetails()
                ))
                .toList();

        return new TestResultResponse(
                attempt.getId(),
                attempt.getCategory(),
                attempt.getDifficulty().name(),
                attempt.getScore(),
                attempt.getTotalMarks(),
                attempt.getPercentage(),
                attempt.getPercentile(),
                correctCount,
                incorrectCount,
                skippedCount,
                attempt.getStatus(),
                attempt.getProctorWarningCount(),
                attempt.getProctorStatus(),
                attempt.getStartedAt(),
                attempt.getSubmittedAt(),
                sectionBreakdown,
                logSummaries
        );
    }
}
