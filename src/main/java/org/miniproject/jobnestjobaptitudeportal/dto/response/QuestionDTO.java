package org.miniproject.jobnestjobaptitudeportal.dto.response;

import java.util.List;
import org.miniproject.jobnestjobaptitudeportal.enums.Difficulty;
import org.miniproject.jobnestjobaptitudeportal.enums.TestSection;

public record QuestionDTO(
        Long id,
        TestSection section,
        String category,
        Difficulty difficulty,
        String questionText,
        List<OptionItem> options
) {
    public record OptionItem(String key, String text) {}
}
