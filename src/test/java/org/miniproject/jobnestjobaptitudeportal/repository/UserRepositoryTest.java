package org.miniproject.jobnestjobaptitudeportal.repository;

import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.Test;
import org.miniproject.jobnestjobaptitudeportal.entity.User;
import org.miniproject.jobnestjobaptitudeportal.enums.Role;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

@DataJpaTest
class UserRepositoryTest {
    @Autowired
    private UserRepository userRepository;

    @Test
    void savesAndFindsUserByEmail() {
        User user = new User("Jane Doe", "jane@example.com", "encoded-password", Role.CANDIDATE);

        userRepository.saveAndFlush(user);

        assertTrue(userRepository.findByEmail("jane@example.com").isPresent());
    }
}
