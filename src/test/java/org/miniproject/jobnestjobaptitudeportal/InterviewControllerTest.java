package org.miniproject.jobnestjobaptitudeportal;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
class InterviewControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    @WithMockUser(roles = "CANDIDATE")
    void testGetQuestionsAndSubjects() throws Exception {
        mockMvc.perform(get("/api/candidate/interview/subjects"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());

        mockMvc.perform(get("/api/candidate/interview/questions?subject=DBMS"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    @WithMockUser(roles = "CANDIDATE")
    void testEvaluateAnswer() throws Exception {
        String jsonPayload = """
                {
                    "questionId": 1,
                    "questionText": "Explain Database Normalization",
                    "candidateAnswer": "Database normalization reduces redundancy using 1NF 2NF and 3NF to organize tables efficiently."
                }
                """;

        mockMvc.perform(post("/api/candidate/interview/evaluate")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonPayload))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.score").exists())
                .andExpect(jsonPath("$.grade").exists());
    }
}
