package org.miniproject.jobnestjobaptitudeportal.dto.response;

import org.miniproject.jobnestjobaptitudeportal.entity.User;
import org.miniproject.jobnestjobaptitudeportal.enums.Role;

public record AuthResponse(String token, UserResponse user) {
    public static AuthResponse from(String token, User user) {
        return new AuthResponse(
                token,
                new UserResponse(user.getId(), user.getName(), user.getEmail(), user.getRole())
        );
    }

    public record UserResponse(Long id, String name, String email, Role role) {
    }
}