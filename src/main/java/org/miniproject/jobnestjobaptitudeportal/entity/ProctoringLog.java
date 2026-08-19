package org.miniproject.jobnestjobaptitudeportal.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import java.time.Instant;
import org.miniproject.jobnestjobaptitudeportal.enums.ProctorEvent;

@Entity
@Table(name = "proctoring_logs")
public class ProctoringLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long testAttemptId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ProctorEvent eventType;

    @Column(nullable = false, updatable = false)
    private Instant timestamp;

    @Column(nullable = false)
    private Integer warningNumber;

    private String details;

    public ProctoringLog() {
    }

    public ProctoringLog(Long testAttemptId, ProctorEvent eventType, Integer warningNumber, String details) {
        this.testAttemptId = testAttemptId;
        this.eventType = eventType;
        this.warningNumber = warningNumber;
        this.details = details;
    }

    @PrePersist
    void prePersist() {
        if (timestamp == null) {
            timestamp = Instant.now();
        }
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

    public ProctorEvent getEventType() {
        return eventType;
    }

    public void setEventType(ProctorEvent eventType) {
        this.eventType = eventType;
    }

    public Instant getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(Instant timestamp) {
        this.timestamp = timestamp;
    }

    public Integer getWarningNumber() {
        return warningNumber;
    }

    public void setWarningNumber(Integer warningNumber) {
        this.warningNumber = warningNumber;
    }

    public String getDetails() {
        return details;
    }

    public void setDetails(String details) {
        this.details = details;
    }
}
