package org.miniproject.jobnestjobaptitudeportal.repository;

import java.util.List;
import java.util.Optional;
import org.miniproject.jobnestjobaptitudeportal.entity.InterviewSession;
import org.springframework.data.jpa.repository.JpaRepository;

public interface InterviewSessionRepository extends JpaRepository<InterviewSession, Long> {

    /** Find the most recent active session for a user (at most one should exist). */
    Optional<InterviewSession> findFirstByUserIdAndStatusOrderByStartedAtDesc(Long userId, String status);

    /** All sessions for a user, newest first. */
    List<InterviewSession> findByUserIdOrderByStartedAtDesc(Long userId);
}
