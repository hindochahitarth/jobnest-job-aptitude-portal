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
@Table(name = "jobs")
public class Job {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long recruiterId;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String company;

    @Column(nullable = false)
    private String location;

    private String salary;
    private String expLevel;
    private Integer aptitudeCutoff = 70;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String skills;

    @Column(columnDefinition = "TEXT")
    private String description;

    private String deadline;

    @Column(nullable = false)
    private String status = "ACTIVE";

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    public Job() {
    }

    public Job(Long recruiterId, String title, String company, String location, String salary, String expLevel, Integer aptitudeCutoff, String skills, String description, String deadline) {
        this.recruiterId = recruiterId;
        this.title = title;
        this.company = company;
        this.location = location;
        this.salary = salary;
        this.expLevel = expLevel;
        this.aptitudeCutoff = aptitudeCutoff != null ? aptitudeCutoff : 70;
        this.skills = skills;
        this.description = description;
        this.deadline = deadline;
    }

    @PrePersist
    void prePersist() {
        if (createdAt == null) {
            createdAt = Instant.now();
        }
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getRecruiterId() {
        return recruiterId;
    }

    public void setRecruiterId(Long recruiterId) {
        this.recruiterId = recruiterId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getCompany() {
        return company;
    }

    public void setCompany(String company) {
        this.company = company;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getSalary() {
        return salary;
    }

    public void setSalary(String salary) {
        this.salary = salary;
    }

    public String getExpLevel() {
        return expLevel;
    }

    public void setExpLevel(String expLevel) {
        this.expLevel = expLevel;
    }

    public Integer getAptitudeCutoff() {
        return aptitudeCutoff;
    }

    public void setAptitudeCutoff(Integer aptitudeCutoff) {
        this.aptitudeCutoff = aptitudeCutoff;
    }

    public String getSkills() {
        return skills;
    }

    public void setSkills(String skills) {
        this.skills = skills;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getDeadline() {
        return deadline;
    }

    public void setDeadline(String deadline) {
        this.deadline = deadline;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
