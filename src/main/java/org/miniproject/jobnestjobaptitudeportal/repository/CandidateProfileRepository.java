package org.miniproject.jobnestjobaptitudeportal.repository;

import java.util.Optional;
import org.miniproject.jobnestjobaptitudeportal.entity.CandidateProfile;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CandidateProfileRepository extends JpaRepository<CandidateProfile, Long> {
    Optional<CandidateProfile> findByUserId(Long userId);
}
