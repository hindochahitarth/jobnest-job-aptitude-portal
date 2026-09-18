package org.miniproject.jobnestjobaptitudeportal.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import java.time.Instant;

/**
 * Persists one freemium mock-interview session per candidate attempt.
 * Limits: max 5 completed questions OR max 300 seconds elapsed, whichever hits first.
 */
@Entity
@Table(name = "interview_sessions")
public class InterviewSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId;

    @Column(nullable = false, length = 150)
    private String targetRole;

    /**
     * 'active' | 'completed' | 'limit_reached'
     */
    @Column(nullable = false, length = 20)
    private String status = "active";

    /** Elapsed seconds tracked by the backend on every submit call. */
    @Column(nullable = false)
    private int totalDurationSeconds = 0;

    /** Number of questions that have been answered and evaluated. */
    @Column(nullable = false)
    private int completedCount = 0;

    /** JSON blob: serialized List<SessionQuestionEntry>. */
    @Lob
    @Column(columnDefinition = "LONGTEXT")
    private String questionsJson;

    /** AI-synthesized overall summary, populated when session ends. */
    @Lob
    @Column(columnDefinition = "TEXT")
    private String summaryFeedback;

    /** Average score across all evaluated answers. */
    @Column
    private Integer overallScore;

    @Column(nullable = false, updatable = false)
    private Instant startedAt;

    @Column
    private Instant endedAt;

    @Column(nullable = false)
    private Instant updatedAt;

    @PrePersist
    void prePersist() {
        startedAt = Instant.now();
        updatedAt = startedAt;
    }

    @PreUpdate
    void preUpdate() {
        updatedAt = Instant.now();
    }

    // ---- getters / setters -----------------------------------------------

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getTargetRole() { return targetRole; }
    public void setTargetRole(String targetRole) { this.targetRole = targetRole; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public int getTotalDurationSeconds() { return totalDurationSeconds; }
    public void setTotalDurationSeconds(int totalDurationSeconds) { this.totalDurationSeconds = totalDurationSeconds; }

    public int getCompletedCount() { return completedCount; }
    public void setCompletedCount(int completedCount) { this.completedCount = completedCount; }

    public String getQuestionsJson() { return questionsJson; }
    public void setQuestionsJson(String questionsJson) { this.questionsJson = questionsJson; }

    public String getSummaryFeedback() { return summaryFeedback; }
    public void setSummaryFeedback(String summaryFeedback) { this.summaryFeedback = summaryFeedback; }

    public Integer getOverallScore() { return overallScore; }
    public void setOverallScore(Integer overallScore) { this.overallScore = overallScore; }

    public Instant getStartedAt() { return startedAt; }
    public void setStartedAt(Instant startedAt) { this.startedAt = startedAt; }

    public Instant getEndedAt() { return endedAt; }
    public void setEndedAt(Instant endedAt) { this.endedAt = endedAt; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
