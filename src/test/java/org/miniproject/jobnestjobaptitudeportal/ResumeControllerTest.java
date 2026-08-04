package org.miniproject.jobnestjobaptitudeportal;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.miniproject.jobnestjobaptitudeportal.entity.User;
import org.miniproject.jobnestjobaptitudeportal.enums.Role;
import org.miniproject.jobnestjobaptitudeportal.repository.UserRepository;
import org.miniproject.jobnestjobaptitudeportal.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class ResumeControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    private String candidateToken;

    @BeforeEach
    void setUp() {
        userRepository.deleteAll();
        User candidate = userRepository.save(new User("Candidate One", "candidate1@example.com", passwordEncoder.encode("password123"), Role.CANDIDATE));
        candidateToken = jwtUtil.generateToken(candidate);
    }

    @Test
    void testResumeUploadAndParsing() throws Exception {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "sample_resume.pdf",
                "application/pdf",
                "John Doe Resume Java React SQL Spring Boot Quantitative Aptitude".getBytes()
        );

        mockMvc.perform(multipart("/api/candidate/resume/upload")
                        .file(file)
                        .header("Authorization", "Bearer " + candidateToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.fileName").value("sample_resume.pdf"))
                .andExpect(jsonPath("$.atsScore").exists())
                .andExpect(jsonPath("$.skills").isArray());
    }
}
