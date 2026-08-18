package org.miniproject.jobnestjobaptitudeportal.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import java.time.Instant;

@Entity
@Table(name = "applications")
public class Application {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long jobId;

    @Column(nullable = false)
    private Long candidateUserId;

    @Column(nullable = false)
    private String status; // APPLIED, SHORTLISTED, REJECTED

    @Column(nullable = false, updatable = false)
    private Instant appliedAt;

    public Application() {}

    public Application(Long jobId, Long candidateUserId) {
        this.jobId = jobId;
        this.candidateUserId = candidateUserId;
        this.status = "APPLIED";
    }

    @PrePersist
    void prePersist() {
        if (appliedAt == null) appliedAt = Instant.now();
        if (status == null) status = "APPLIED";
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getJobId() { return jobId; }
    public void setJobId(Long jobId) { this.jobId = jobId; }

    public Long getCandidateUserId() { return candidateUserId; }
    public void setCandidateUserId(Long candidateUserId) { this.candidateUserId = candidateUserId; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Instant getAppliedAt() { return appliedAt; }
    public void setAppliedAt(Instant appliedAt) { this.appliedAt = appliedAt; }
}
