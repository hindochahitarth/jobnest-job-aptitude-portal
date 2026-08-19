package org.miniproject.jobnestjobaptitudeportal.service.aptitude;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import org.miniproject.jobnestjobaptitudeportal.dto.request.ProctorLogRequest;
import org.miniproject.jobnestjobaptitudeportal.dto.request.StartTestRequest;
import org.miniproject.jobnestjobaptitudeportal.dto.request.SubmitTestRequest;
import org.miniproject.jobnestjobaptitudeportal.dto.response.QuestionDTO;
import org.miniproject.jobnestjobaptitudeportal.dto.response.TestResultResponse;
import org.miniproject.jobnestjobaptitudeportal.dto.response.TestSessionResponse;
import org.miniproject.jobnestjobaptitudeportal.entity.Answer;
import org.miniproject.jobnestjobaptitudeportal.entity.ProctoringLog;
import org.miniproject.jobnestjobaptitudeportal.entity.Question;
import org.miniproject.jobnestjobaptitudeportal.entity.TestAttempt;
import org.miniproject.jobnestjobaptitudeportal.enums.AttemptStatus;
import org.miniproject.jobnestjobaptitudeportal.enums.Difficulty;
import org.miniproject.jobnestjobaptitudeportal.enums.TestSection;
import org.miniproject.jobnestjobaptitudeportal.exception.ApiException;
import org.miniproject.jobnestjobaptitudeportal.repository.AnswerRepository;
import org.miniproject.jobnestjobaptitudeportal.repository.ProctoringLogRepository;
import org.miniproject.jobnestjobaptitudeportal.repository.QuestionRepository;
import org.miniproject.jobnestjobaptitudeportal.repository.TestAttemptRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class TestEngineService {

    private final QuestionRepository questionRepository;
    private final TestAttemptRepository testAttemptRepository;
    private final AnswerRepository answerRepository;
    private final ProctoringLogRepository proctoringLogRepository;
    private final TimerService timerService;
    private final EvaluationService evaluationService;

    public TestEngineService(QuestionRepository questionRepository,
                             TestAttemptRepository testAttemptRepository,
                             AnswerRepository answerRepository,
                             ProctoringLogRepository proctoringLogRepository,
                             TimerService timerService,
                             EvaluationService evaluationService) {
        this.questionRepository = questionRepository;
        this.testAttemptRepository = testAttemptRepository;
        this.answerRepository = answerRepository;
        this.proctoringLogRepository = proctoringLogRepository;
        this.timerService = timerService;
        this.evaluationService = evaluationService;
    }

    @Transactional
    public TestSessionResponse startTestSession(Long userId, StartTestRequest request) {
        int count = request.questionCount() != null ? Math.min(50, Math.max(20, request.questionCount())) : 20;
        int timeLimit = request.timeLimitMinutes() != null ? Math.min(180, Math.max(5, request.timeLimitMinutes())) : 30;

        TestSection section = request.section() != null ? request.section() : TestSection.QUANT;
        Difficulty difficulty = request.difficulty() != null ? request.difficulty() : Difficulty.MEDIUM;

        ensureQuestionSupply(section, difficulty, count);
        List<Question> drawnQuestions = drawQuestionPaper(section, difficulty, count);

        TestAttempt attempt = new TestAttempt(userId, section.name(), difficulty, drawnQuestions.size(), timeLimit);
        attempt = testAttemptRepository.save(attempt);

        List<QuestionDTO> questionDTOs = new ArrayList<>();
        for (Question q : drawnQuestions) {
            Answer answer = new Answer(attempt.getId(), q.getId(), null, null, false, 0);
            answerRepository.save(answer);

            List<QuestionDTO.OptionItem> options = new ArrayList<>();
            options.add(new QuestionDTO.OptionItem("A", q.getOptionA()));
            options.add(new QuestionDTO.OptionItem("B", q.getOptionB()));
            options.add(new QuestionDTO.OptionItem("C", q.getOptionC()));
            options.add(new QuestionDTO.OptionItem("D", q.getOptionD()));
            Collections.shuffle(options);

            questionDTOs.add(new QuestionDTO(
                    q.getId(),
                    q.getSection(),
                    q.getCategory(),
                    q.getDifficulty(),
                    q.getQuestionText(),
                    options
            ));
        }

        long remainingSeconds = timerService.calculateRemainingSeconds(attempt);
        return new TestSessionResponse(
                attempt.getId(),
                attempt.getCategory(),
                attempt.getDifficulty(),
                attempt.getTotalQuestions(),
                attempt.getTimeLimitMinutes(),
                remainingSeconds,
                attempt.getStartedAt(),
                questionDTOs
        );
    }

    private void ensureQuestionSupply(TestSection section, Difficulty difficulty, int count) {
        List<Question> existing = questionRepository.findBySection(section);
        if (existing.size() >= count) {
            return;
        }

        Set<String> existingTexts = new HashSet<>();
        for (Question question : existing) {
            existingTexts.add(question.getQuestionText());
        }

        int needed = count - existing.size();
        List<Question> generated = new ArrayList<>();
        int variant = 1;
        while (generated.size() < needed) {
            Question question = buildSupplementalQuestion(section, difficulty, variant++);
            if (existingTexts.add(question.getQuestionText())) {
                generated.add(question);
            }
        }
        questionRepository.saveAll(generated);
    }

    private List<Question> drawQuestionPaper(TestSection section, Difficulty difficulty, int count) {
        List<Question> paper = new ArrayList<>();
        Set<Long> usedIds = new HashSet<>();

        addUniqueQuestions(paper, usedIds, questionRepository.findRandomQuestionsBySectionAndDifficulty(section, difficulty, count), count);
        if (paper.size() < count) {
            addUniqueQuestions(paper, usedIds, questionRepository.findRandomQuestionsBySection(section, count), count);
        }
        if (paper.size() < count) {
            addUniqueQuestions(paper, usedIds, questionRepository.findRandomQuestions(count), count);
        }

        Collections.shuffle(paper);
        return paper.size() > count ? paper.subList(0, count) : paper;
    }

    private void addUniqueQuestions(List<Question> paper, Set<Long> usedIds, List<Question> candidates, int count) {
        for (Question candidate : candidates) {
            if (paper.size() >= count) {
                return;
            }
            if (candidate.getId() != null && usedIds.add(candidate.getId())) {
                paper.add(candidate);
            }
        }
    }

    private Question buildSupplementalQuestion(TestSection section, Difficulty difficulty, int variant) {
        int base = 10 + variant;
        Map<TestSection, String> displayNames = new HashMap<>();
        displayNames.put(TestSection.QUANT, "Quantitative Aptitude");
        displayNames.put(TestSection.LOGICAL, "Logical Reasoning");
        displayNames.put(TestSection.VERBAL, "Verbal Ability");
        displayNames.put(TestSection.TECHNICAL, "Technical Aptitude");

        return switch (section) {
            case QUANT -> {
                int cost = 100 + base * 5;
                int profit = 20 + variant;
                int selling = cost + profit;
                double percentage = (double) profit / cost * 100.0;
                yield new Question(section, "Generated Arithmetic", difficulty,
                        "Practice " + difficulty.name() + " Q" + variant + ": An item costs Rs." + cost + " and is sold for Rs." + selling + ". What is the approximate profit percentage?",
                        String.format("%.1f%%", percentage),
                        String.format("%.1f%%", percentage + 2),
                        String.format("%.1f%%", Math.max(0, percentage - 2)),
                        String.format("%.1f%%", percentage + 5),
                        "A",
                        "Profit percentage is profit divided by cost multiplied by 100.");
            }
            case LOGICAL -> {
                int first = variant;
                int second = first + 3;
                int third = second + 5;
                int fourth = third + 7;
                int answer = fourth + 9;
                yield new Question(section, "Generated Series", difficulty,
                        "Practice " + difficulty.name() + " Q" + variant + ": Find the next number in the series: " + first + ", " + second + ", " + third + ", " + fourth + ", ?",
                        String.valueOf(answer),
                        String.valueOf(answer + 2),
                        String.valueOf(answer - 2),
                        String.valueOf(answer + 4),
                        "A",
                        "The differences are consecutive odd numbers: 3, 5, 7, then 9.");
            }
            case VERBAL -> {
                String word = variant % 2 == 0 ? "brief" : "rapid";
                String synonym = variant % 2 == 0 ? "concise" : "swift";
                yield new Question(section, "Generated Vocabulary", difficulty,
                        "Practice " + difficulty.name() + " Q" + variant + ": Choose the closest meaning of \"" + word + "\".",
                        synonym,
                        "unclear",
                        "delayed",
                        "careless",
                        "A",
                        "The correct option is the nearest synonym in the given context.");
            }
            case TECHNICAL -> {
                String structure = variant % 2 == 0 ? "queue" : "stack";
                String principle = variant % 2 == 0 ? "FIFO" : "LIFO";
                yield new Question(section, "Generated CS Fundamentals", difficulty,
                        "Practice " + difficulty.name() + " Q" + variant + ": Which access principle best describes a " + structure + "?",
                        principle,
                        "Binary search",
                        "Hash collision",
                        "Round robin",
                        "A",
                        displayNames.get(section) + " fundamentals require knowing core data-structure behavior.");
            }
        };
    }

    @Transactional
    public void recordProctorLog(Long userId, ProctorLogRequest request) {
        TestAttempt attempt = testAttemptRepository.findById(request.attemptId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Test attempt not found"));

        ProctoringLog log = new ProctoringLog(
                attempt.getId(),
                request.eventType(),
                request.warningNumber(),
                request.details()
        );
        proctoringLogRepository.save(log);

        attempt.setProctorWarningCount(Math.max(attempt.getProctorWarningCount(), request.warningNumber()));
        if (request.warningNumber() >= 3) {
            attempt.setProctorStatus("TERMINATED_HIGH_RISK");
            attempt.setStatus(AttemptStatus.TERMINATED_PROCTOR);
            attempt.setSubmittedAt(Instant.now());
        } else if (request.warningNumber() > 0) {
            attempt.setProctorStatus("WARNING_ISSUED");
        }
        testAttemptRepository.save(attempt);
    }

    @Transactional
    public TestResultResponse submitTestSession(Long userId, SubmitTestRequest request) {
        TestAttempt attempt = testAttemptRepository.findById(request.attemptId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Test attempt not found"));

        if (attempt.getStatus() == AttemptStatus.SUBMITTED) {
            return evaluationService.evaluateAttempt(attempt);
        }

        if (request.answers() != null) {
            List<Answer> answers = answerRepository.findByTestAttemptId(attempt.getId());
            for (SubmitTestRequest.AnswerItem item : request.answers()) {
                Answer target = answers.stream()
                        .filter(a -> a.getQuestionId().equals(item.questionId()))
                        .findFirst()
                        .orElse(null);

                if (target != null) {
                    target.setSelectedOption(item.selectedOption());
                    target.setIsMarkedForReview(Boolean.TRUE.equals(item.isMarkedForReview()));
                    target.setTimeSpentSeconds(item.timeSpentSeconds() != null ? item.timeSpentSeconds() : 0);
                    answerRepository.save(target);
                }
            }
        }

        if (request.proctorLogs() != null) {
            for (SubmitTestRequest.ProctorItem pItem : request.proctorLogs()) {
                ProctorLogRequest pReq = new ProctorLogRequest(
                        attempt.getId(),
                        org.miniproject.jobnestjobaptitudeportal.enums.ProctorEvent.valueOf(pItem.eventType()),
                        pItem.warningNumber(),
                        pItem.details()
                );
                recordProctorLog(userId, pReq);
            }
        }

        attempt.setSubmittedAt(Instant.now());
        if (attempt.getStatus() == AttemptStatus.IN_PROGRESS) {
            attempt.setStatus(AttemptStatus.SUBMITTED);
        }
        testAttemptRepository.save(attempt);

        return evaluationService.evaluateAttempt(attempt);
    }

    public TestResultResponse getTestResult(Long userId, Long attemptId) {
        TestAttempt attempt = testAttemptRepository.findById(attemptId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Test attempt not found"));
        return evaluationService.evaluateAttempt(attempt);
    }

    public List<TestResultResponse> getUserTestHistory(Long userId) {
        List<TestAttempt> attempts = testAttemptRepository.findByUserIdOrderByStartedAtDesc(userId);
        return attempts.stream().map(evaluationService::evaluateAttempt).toList();
    }
}
