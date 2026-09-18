-- V6: AI Mock Interview Sessions table
-- Tracks freemium session state: max 5 questions OR 300 seconds per session

CREATE TABLE IF NOT EXISTS interview_sessions (
    id                    BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id               BIGINT        NOT NULL,
    target_role           VARCHAR(150)  NOT NULL,
    status                VARCHAR(20)   NOT NULL DEFAULT 'active',
    total_duration_seconds INT          NOT NULL DEFAULT 0,
    completed_count       INT           NOT NULL DEFAULT 0,
    questions_json        LONGTEXT,
    summary_feedback      TEXT,
    overall_score         INT,
    started_at            TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ended_at              TIMESTAMP     NULL,
    updated_at            TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_interview_sessions_user_id (user_id),
    INDEX idx_interview_sessions_status  (status)
);
