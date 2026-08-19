package org.miniproject.jobnestjobaptitudeportal.dto.request;

import org.miniproject.jobnestjobaptitudeportal.enums.Difficulty;
import org.miniproject.jobnestjobaptitudeportal.enums.TestSection;

public record StartTestRequest(
        TestSection section,
        Difficulty difficulty,
        Integer questionCount,
        Integer timeLimitMinutes,
        Boolean proctored
) {
}
