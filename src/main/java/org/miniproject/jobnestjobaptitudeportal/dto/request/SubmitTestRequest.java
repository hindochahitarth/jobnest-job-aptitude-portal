package org.miniproject.jobnestjobaptitudeportal.dto.request;

import java.util.List;

public record SubmitTestRequest(
        Long attemptId,
        List<AnswerItem> answers,
        List<ProctorItem> proctorLogs
) {
    public record AnswerItem(
            Long questionId,
            String selectedOption,
            Boolean isMarkedForReview,
            Integer timeSpentSeconds
    ) {}

    public record ProctorItem(
            String eventType,
            Integer warningNumber,
            String details
    ) {}
}
