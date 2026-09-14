package org.miniproject.jobnestjobaptitudeportal.repository;

import java.util.List;
import org.miniproject.jobnestjobaptitudeportal.entity.InterviewQuestion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface InterviewQuestionRepository extends JpaRepository<InterviewQuestion, Long> {

    List<InterviewQuestion> findBySubjectIgnoreCase(String subject);

    List<InterviewQuestion> findByRoleIgnoreCase(String role);

    List<InterviewQuestion> findBySubjectIgnoreCaseAndDifficultyIgnoreCase(String subject, String difficulty);

    @Query("SELECT DISTINCT q.subject FROM InterviewQuestion q")
    List<String> findDistinctSubjects();
}
