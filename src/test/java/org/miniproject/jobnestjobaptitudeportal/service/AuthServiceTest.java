package org.miniproject.jobnestjobaptitudeportal.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.miniproject.jobnestjobaptitudeportal.dto.request.LoginRequest;
import org.miniproject.jobnestjobaptitudeportal.dto.request.SignupRequest;
import org.miniproject.jobnestjobaptitudeportal.entity.User;
import org.miniproject.jobnestjobaptitudeportal.enums.Role;
import org.miniproject.jobnestjobaptitudeportal.exception.ApiException;
import org.miniproject.jobnestjobaptitudeportal.repository.UserRepository;
import org.miniproject.jobnestjobaptitudeportal.security.JwtUtil;
import org.miniproject.jobnestjobaptitudeportal.service.auth.AuthService;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {
    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtUtil jwtUtil;

    @InjectMocks
    private AuthService authService;

    @Test
    void signupCreatesUserAndReturnsToken() {
        SignupRequest request = new SignupRequest("Jane Doe", "jane@example.com", "secret123", Role.CANDIDATE);
        when(userRepository.existsByEmail("jane@example.com")).thenReturn(false);
        when(passwordEncoder.encode("secret123")).thenReturn("encoded-password");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User user = invocation.getArgument(0);
            user.setId(42L);
            return user;
        });
        when(jwtUtil.generateToken(any(User.class))).thenReturn("jwt-token");

        var response = authService.signup(request);

        assertEquals("jwt-token", response.token());
        assertEquals("jane@example.com", response.user().email());
        assertEquals(Role.CANDIDATE, response.user().role());
        verify(userRepository).save(any(User.class));
    }

    @Test
    void loginReturnsTokenForValidCredentials() {
        User user = new User("Jane Doe", "jane@example.com", "encoded-password", Role.CANDIDATE);
        user.setId(7L);
        when(userRepository.findByEmail("jane@example.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("secret123", "encoded-password")).thenReturn(true);
        when(jwtUtil.generateToken(user)).thenReturn("jwt-token");

        var response = authService.login(new LoginRequest("jane@example.com", "secret123"));

        assertEquals("jwt-token", response.token());
        assertEquals("jane@example.com", response.user().email());
    }

    @Test
    void loginRejectsInvalidPassword() {
        User user = new User("Jane Doe", "jane@example.com", "encoded-password", Role.CANDIDATE);
        when(userRepository.findByEmail("jane@example.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("wrong-password", "encoded-password")).thenReturn(false);

        ApiException exception = assertThrows(ApiException.class,
                () -> authService.login(new LoginRequest("jane@example.com", "wrong-password")));

        assertEquals(HttpStatus.UNAUTHORIZED, exception.getStatus());
    }
}
