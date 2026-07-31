package org.miniproject.jobnestjobaptitudeportal.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.miniproject.jobnestjobaptitudeportal.controller.auth.AuthController;
import org.miniproject.jobnestjobaptitudeportal.dto.response.AuthResponse;
import org.miniproject.jobnestjobaptitudeportal.enums.Role;
import org.miniproject.jobnestjobaptitudeportal.service.auth.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(AuthController.class)
@AutoConfigureMockMvc(addFilters = false)
@Import(org.miniproject.jobnestjobaptitudeportal.security.JwtUtil.class)
class AuthControllerTest {
    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private AuthService authService;

    @Test
    void signupEndpointReturnsAuthResponse() throws Exception {
        when(authService.signup(any())).thenReturn(new AuthResponse(
                "jwt-token",
                new AuthResponse.UserResponse(1L, "Jane Doe", "jane@example.com", Role.CANDIDATE)
        ));

        mockMvc.perform(post("/api/auth/signup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"Jane Doe\",\"email\":\"jane@example.com\",\"password\":\"secret123\",\"role\":\"CANDIDATE\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("jwt-token"))
                .andExpect(jsonPath("$.user.email").value("jane@example.com"));
    }
}
