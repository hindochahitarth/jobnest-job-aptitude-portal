package org.miniproject.jobnestjobaptitudeportal.repository;

import java.util.List;
import org.miniproject.jobnestjobaptitudeportal.entity.Answer;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AnswerRepository extends JpaRepository<Answer, Long> {
    List<Answer> findByTestAttemptId(Long testAttemptId);
    void deleteByTestAttemptId(Long testAttemptId);
}
