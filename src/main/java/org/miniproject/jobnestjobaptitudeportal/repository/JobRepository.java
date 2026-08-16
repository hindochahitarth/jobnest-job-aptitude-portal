package org.miniproject.jobnestjobaptitudeportal.repository;

import java.util.List;
import org.miniproject.jobnestjobaptitudeportal.entity.Job;
import org.springframework.data.jpa.repository.JpaRepository;

public interface JobRepository extends JpaRepository<Job, Long> {
    List<Job> findByRecruiterId(Long recruiterId);
    List<Job> findAllByOrderByCreatedAtDesc();
}
