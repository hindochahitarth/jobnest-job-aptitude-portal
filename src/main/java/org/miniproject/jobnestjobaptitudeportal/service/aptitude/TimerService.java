package org.miniproject.jobnestjobaptitudeportal.service.aptitude;

import java.time.Duration;
import java.time.Instant;
import org.miniproject.jobnestjobaptitudeportal.entity.TestAttempt;
import org.miniproject.jobnestjobaptitudeportal.enums.AttemptStatus;
import org.springframework.stereotype.Service;

@Service
public class TimerService {

    public long calculateRemainingSeconds(TestAttempt attempt) {
        if (attempt.getStatus() != AttemptStatus.IN_PROGRESS) {
            return 0L;
        }

        long totalSecondsAllowed = attempt.getTimeLimitMinutes() * 60L;
        long secondsElapsed = Duration.between(attempt.getStartedAt(), Instant.now()).getSeconds();
        long remaining = totalSecondsAllowed - secondsElapsed;

        return Math.max(0L, remaining);
    }

    public boolean isExpired(TestAttempt attempt) {
        return calculateRemainingSeconds(attempt) <= 0;
    }
}
