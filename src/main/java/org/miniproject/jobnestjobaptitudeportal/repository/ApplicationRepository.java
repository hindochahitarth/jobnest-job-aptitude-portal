package org.miniproject.jobnestjobaptitudeportal.repository;

import java.util.List;
import org.miniproject.jobnestjobaptitudeportal.entity.Application;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ApplicationRepository extends JpaRepository<Application, Long> {

    boolean existsByJobIdAndCandidateUserId(Long jobId, Long candidateUserId);

    List<Application> findByJobId(Long jobId);

    List<Application> findByJobIdIn(List<Long> jobIds);

    List<Application> findByCandidateUserId(Long candidateUserId);
}
