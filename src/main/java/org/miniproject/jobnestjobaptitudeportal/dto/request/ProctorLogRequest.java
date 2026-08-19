package org.miniproject.jobnestjobaptitudeportal.dto.request;

import org.miniproject.jobnestjobaptitudeportal.enums.ProctorEvent;

public record ProctorLogRequest(
        Long attemptId,
        ProctorEvent eventType,
        Integer warningNumber,
        String details
) {
}
