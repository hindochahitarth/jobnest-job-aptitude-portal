package org.miniproject.jobnestjobaptitudeportal.dto.response;

import java.time.Instant;
import java.util.List;
import org.miniproject.jobnestjobaptitudeportal.enums.AttemptStatus;

public record TestResultResponse(
        Long attemptId,
        String category,
        String difficulty,
        Integer score,
        Integer totalMarks,
        Double percentage,
        Double percentile,
        Integer correctCount,
        Integer incorrectCount,
        Integer skippedCount,
        AttemptStatus status,
        Integer proctorWarningCount,
        String proctorStatus,
        Instant startedAt,
        Instant submittedAt,
        List<SectionAccuracy> sectionBreakdown,
        List<ProctorLogSummary> proctorLogs
) {
    public record SectionAccuracy(String section, int correct, int total, double accuracyPercent) {}
    public record ProctorLogSummary(String eventType, String timestamp, int warningNumber, String details) {}
}
