package org.miniproject.jobnestjobaptitudeportal.repository;

import org.miniproject.jobnestjobaptitudeportal.entity.User;

public interface UserRepository {
    User findByEmail(String email);
}
