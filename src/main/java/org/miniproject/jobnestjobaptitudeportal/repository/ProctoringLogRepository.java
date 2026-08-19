package org.miniproject.jobnestjobaptitudeportal.repository;

import java.util.List;
import org.miniproject.jobnestjobaptitudeportal.entity.ProctoringLog;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProctoringLogRepository extends JpaRepository<ProctoringLog, Long> {
    List<ProctoringLog> findByTestAttemptIdOrderByTimestampAsc(Long testAttemptId);
}
