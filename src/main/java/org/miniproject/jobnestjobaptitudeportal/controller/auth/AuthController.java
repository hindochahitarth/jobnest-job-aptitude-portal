package org.miniproject.jobnestjobaptitudeportal.controller.auth;

import jakarta.validation.Valid;
import org.miniproject.jobnestjobaptitudeportal.dto.request.LoginRequest;
import org.miniproject.jobnestjobaptitudeportal.dto.request.SignupRequest;
import org.miniproject.jobnestjobaptitudeportal.dto.response.AuthResponse;
import org.miniproject.jobnestjobaptitudeportal.service.auth.AuthService;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
// created author for signup and login
@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/signup")
    public AuthResponse signup(@Valid @RequestBody SignupRequest request) {
        return authService.signup(request);
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }
}