package org.miniproject.jobnestjobaptitudeportal.security;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.Test;
import org.miniproject.jobnestjobaptitudeportal.entity.User;
import org.miniproject.jobnestjobaptitudeportal.enums.Role;

class JwtUtilTest {
    @Test
    void generatesAndValidatesToken() {
        JwtUtil jwtUtil = new JwtUtil("test-secret-test-secret", 3600);
        User user = new User("Jane Doe", "jane@example.com", "encoded-password", Role.CANDIDATE);
        user.setId(1L);

        String token = jwtUtil.generateToken(user);
        var jwtUser = jwtUtil.validateToken(token);

        assertTrue(jwtUser.isPresent());
        assertEquals("jane@example.com", jwtUser.get().email());
        assertEquals(Role.CANDIDATE, jwtUser.get().role());
    }
}
