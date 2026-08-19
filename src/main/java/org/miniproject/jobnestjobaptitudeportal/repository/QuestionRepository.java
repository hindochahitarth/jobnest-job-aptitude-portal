package org.miniproject.jobnestjobaptitudeportal.repository;

import java.util.List;
import org.miniproject.jobnestjobaptitudeportal.entity.Question;
import org.miniproject.jobnestjobaptitudeportal.enums.Difficulty;
import org.miniproject.jobnestjobaptitudeportal.enums.TestSection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface QuestionRepository extends JpaRepository<Question, Long> {

    List<Question> findBySection(TestSection section);

    List<Question> findBySectionAndDifficulty(TestSection section, Difficulty difficulty);

    @Query(value = "SELECT * FROM questions ORDER BY RAND() LIMIT :limit", nativeQuery = true)
    List<Question> findRandomQuestions(@Param("limit") int limit);

    @Query(value = "SELECT * FROM questions WHERE section = :#{#section?.name()} ORDER BY RAND() LIMIT :limit", nativeQuery = true)
    List<Question> findRandomQuestionsBySection(@Param("section") TestSection section, @Param("limit") int limit);

    @Query(value = "SELECT * FROM questions WHERE section = :#{#section?.name()} AND difficulty = :#{#difficulty?.name()} ORDER BY RAND() LIMIT :limit", nativeQuery = true)
    List<Question> findRandomQuestionsBySectionAndDifficulty(@Param("section") TestSection section, @Param("difficulty") Difficulty difficulty, @Param("limit") int limit);
}
