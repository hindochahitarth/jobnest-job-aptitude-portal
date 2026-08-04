package org.miniproject.jobnestjobaptitudeportal;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class AuthIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void testCandidateSignupAndLogin() throws Exception {
        String signupPayload = """
                {
                    "name": "Jane Candidate",
                    "email": "jane.candidate@example.com",
                    "password": "password123",
                    "role": "CANDIDATE"
                }
                """;

        mockMvc.perform(post("/api/auth/signup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(signupPayload))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").exists())
                .andExpect(jsonPath("$.user.email").value("jane.candidate@example.com"))
                .andExpect(jsonPath("$.user.role").value("CANDIDATE"));

        String loginPayload = """
                {
                    "email": "jane.candidate@example.com",
                    "password": "password123"
                }
                """;

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(loginPayload))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").exists())
                .andExpect(jsonPath("$.user.role").value("CANDIDATE"));
    }

    @Test
    void testRecruiterSignupAndLogin() throws Exception {
        String signupPayload = """
                {
                    "name": "Robert Recruiter",
                    "email": "robert.recruiter@example.com",
                    "password": "password123",
                    "role": "RECRUITER"
                }
                """;

        mockMvc.perform(post("/api/auth/signup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(signupPayload))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").exists())
                .andExpect(jsonPath("$.user.email").value("robert.recruiter@example.com"))
                .andExpect(jsonPath("$.user.role").value("RECRUITER"));
    }
}
