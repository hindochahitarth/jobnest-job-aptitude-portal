package org.miniproject.jobnestjobaptitudeportal.controller.aptitude;

import java.util.List;
import org.miniproject.jobnestjobaptitudeportal.dto.request.ProctorLogRequest;
import org.miniproject.jobnestjobaptitudeportal.dto.request.StartTestRequest;
import org.miniproject.jobnestjobaptitudeportal.dto.request.SubmitTestRequest;
import org.miniproject.jobnestjobaptitudeportal.dto.response.TestResultResponse;
import org.miniproject.jobnestjobaptitudeportal.dto.response.TestSessionResponse;
import org.miniproject.jobnestjobaptitudeportal.entity.User;
import org.miniproject.jobnestjobaptitudeportal.exception.ApiException;
import org.miniproject.jobnestjobaptitudeportal.repository.UserRepository;
import org.miniproject.jobnestjobaptitudeportal.security.JwtUtil;
import org.miniproject.jobnestjobaptitudeportal.service.aptitude.TestEngineService;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/aptitude")
public class AptitudeTestController {

    private final TestEngineService testEngineService;
    private final UserRepository userRepository;

    public AptitudeTestController(TestEngineService testEngineService, UserRepository userRepository) {
        this.testEngineService = testEngineService;
        this.userRepository = userRepository;
    }

    @PostMapping("/start")
    public TestSessionResponse startTest(
            Authentication authentication,
            @RequestBody(required = false) StartTestRequest request
    ) {
        Long userId = resolveUserId(authentication);
        StartTestRequest req = request != null ? request : new StartTestRequest(null, null, 15, 20, true);
        return testEngineService.startTestSession(userId, req);
    }

    @PostMapping("/proctor-log")
    public void logProctoringEvent(
            Authentication authentication,
            @RequestBody ProctorLogRequest request
    ) {
        Long userId = resolveUserId(authentication);
        testEngineService.recordProctorLog(userId, request);
    }

    @PostMapping("/submit")
    public TestResultResponse submitTest(
            Authentication authentication,
            @RequestBody SubmitTestRequest request
    ) {
        Long userId = resolveUserId(authentication);
        return testEngineService.submitTestSession(userId, request);
    }

    @GetMapping("/result/{attemptId}")
    public TestResultResponse getResult(
            Authentication authentication,
            @PathVariable Long attemptId
    ) {
        Long userId = resolveUserId(authentication);
        return testEngineService.getTestResult(userId, attemptId);
    }

    @GetMapping("/history")
    public List<TestResultResponse> getHistory(Authentication authentication) {
        Long userId = resolveUserId(authentication);
        return testEngineService.getUserTestHistory(userId);
    }

    private Long resolveUserId(Authentication authentication) {
        if (authentication != null && authentication.getPrincipal() instanceof JwtUtil.JwtUser jwtUser) {
            return jwtUser.userId();
        }

        if (authentication != null && authentication.getName() != null) {
            String name = authentication.getName();
            return userRepository.findByEmail(name.trim())
                    .map(User::getId)
                    .orElseGet(() -> userRepository.findAll().stream().findFirst().map(User::getId).orElse(1L));
        }

        return userRepository.findAll().stream().findFirst().map(User::getId).orElse(1L);
    }
}
