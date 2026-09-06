
package org.miniproject.jobnestjobaptitudeportal.controller.aptitude;

import java.util.List;
import org.miniproject.jobnestjobaptitudeportal.dto.request.ProctorLogRequest;
import org.miniproject.jobnestjobaptitudeportal.dto.request.StartTestRequest;
import org.miniproject.jobnestjobaptitudeportal.dto.request.SubmitTestRequest;
import org.miniproject.jobnestjobaptitudeportal.dto.response.TestResultResponse;
import org.miniproject.jobnestjobaptitudeportal.dto.response.TestSessionResponse;
import org.miniproject.jobnestjobaptitudeportal.entity.User;
import org.miniproject.jobnestjobaptitudeportal.repository.UserRepository;
import org.miniproject.jobnestjobaptitudeportal.security.JwtUtil;
import org.miniproject.jobnestjobaptitudeportal.service.aptitude.TestEngineService;
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

    // Constructor injection for required services and repository.
    public AptitudeTestController(TestEngineService testEngineService, UserRepository userRepository) {
        this.testEngineService = testEngineService;
        this.userRepository = userRepository;
    }

    // Starts a new aptitude test session for the logged-in user.
    @PostMapping("/start")
    public TestSessionResponse startTest(
            Authentication authentication,
            @RequestBody(required = false) StartTestRequest request
    ) {
        // Get the user ID from the authenticated user.
        Long userId = resolveUserId(authentication);

        // Use the provided request or create default test settings.
        StartTestRequest req = request != null
                ? request
                : new StartTestRequest(null, null, 15, 20, true);

        // Start the test session using the service layer.
        return testEngineService.startTestSession(userId, req);
    }

    // Records a proctoring event generated while the user is taking the test.
    @PostMapping("/proctor-log")
    public void logProctoringEvent(
            Authentication authentication,
            @RequestBody ProctorLogRequest request
    ) {
        // Get the ID of the logged-in user.
        Long userId = resolveUserId(authentication);

        // Save the proctoring event through the service layer.
        testEngineService.recordProctorLog(userId, request);
    }

    // Submits the completed aptitude test and returns the result.
    @PostMapping("/submit")
    public TestResultResponse submitTest(
            Authentication authentication,
            @RequestBody SubmitTestRequest request
    ) {
        // Get the ID of the logged-in user.
        Long userId = resolveUserId(authentication);

        // Submit the test and calculate/process the result.
        return testEngineService.submitTestSession(userId, request);
    }

    // Returns the result of a specific test attempt.
    @GetMapping("/result/{attemptId}")
    public TestResultResponse getResult(
            Authentication authentication,
            @PathVariable Long attemptId
    ) {
        // Get the ID of the logged-in user.
        Long userId = resolveUserId(authentication);

        // Fetch the result for the given attempt.
        return testEngineService.getTestResult(userId, attemptId);
    }

    // Returns the complete test history of the logged-in user.
    @GetMapping("/history")
    public List<TestResultResponse> getHistory(Authentication authentication) {
        // Get the ID of the logged-in user.
        Long userId = resolveUserId(authentication);

        // Fetch all previous test results for the user.
        return testEngineService.getUserTestHistory(userId);
    }

    // Resolves the user ID from the current authentication object.
    private Long resolveUserId(Authentication authentication) {

        // If JWT authentication is available, directly get the user ID from the JWT.
        if (authentication != null
                && authentication.getPrincipal() instanceof JwtUtil.JwtUser jwtUser) {
            return jwtUser.userId();
        }

        // If JWT user information is not available, try finding the user by email.
        if (authentication != null && authentication.getName() != null) {
            String name = authentication.getName();

            return userRepository.findByEmail(name.trim())
                    .map(User::getId)

                    // Fallback: use the first available user ID if email is not found.
                    .orElseGet(() -> userRepository.findAll()
                            .stream()
                            .findFirst()
                            .map(User::getId)
                            .orElse(1L));
        }

        // Final fallback if there is no authentication information.
        return userRepository.findAll()
                .stream()
                .findFirst()
                .map(User::getId)
                .orElse(1L);
    }
}
