package org.miniproject.jobnestjobaptitudeportal.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "test_answers")
public class Answer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long testAttemptId;

    @Column(nullable = false)
    private Long questionId;

    private String selectedOption;
    private Boolean isCorrect;
    private Boolean isMarkedForReview = false;
    private Integer timeSpentSeconds = 0;

    public Answer() {
    }

    public Answer(Long testAttemptId, Long questionId, String selectedOption, Boolean isCorrect, Boolean isMarkedForReview, Integer timeSpentSeconds) {
        this.testAttemptId = testAttemptId;
        this.questionId = questionId;
        this.selectedOption = selectedOption;
        this.isCorrect = isCorrect;
        this.isMarkedForReview = isMarkedForReview;
        this.timeSpentSeconds = timeSpentSeconds;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getTestAttemptId() {
        return testAttemptId;
    }

    public void setTestAttemptId(Long testAttemptId) {
        this.testAttemptId = testAttemptId;
    }

    public Long getQuestionId() {
        return questionId;
    }

    public void setQuestionId(Long questionId) {
        this.questionId = questionId;
    }

    public String getSelectedOption() {
        return selectedOption;
    }

    public void setSelectedOption(String selectedOption) {
        this.selectedOption = selectedOption;
    }

    public Boolean getIsCorrect() {
        return isCorrect;
    }

    public void setIsCorrect(Boolean isCorrect) {
        this.isCorrect = isCorrect;
    }

    public Boolean getIsMarkedForReview() {
        return isMarkedForReview;
    }

    public void setIsMarkedForReview(Boolean isMarkedForReview) {
        this.isMarkedForReview = isMarkedForReview;
    }

    public Integer getTimeSpentSeconds() {
        return timeSpentSeconds;
    }

    public void setTimeSpentSeconds(Integer timeSpentSeconds) {
        this.timeSpentSeconds = timeSpentSeconds;
    }
}
