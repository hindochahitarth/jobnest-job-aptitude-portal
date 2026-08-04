package org.miniproject.jobnestjobaptitudeportal.repository;

import java.util.List;
import java.util.Optional;
import org.miniproject.jobnestjobaptitudeportal.entity.Resume;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ResumeRepository extends JpaRepository<Resume, Long> {
    Optional<Resume> findTopByUserIdOrderByUploadedAtDesc(Long userId);

    List<Resume> findByUserIdOrderByUploadedAtDesc(Long userId);
}
