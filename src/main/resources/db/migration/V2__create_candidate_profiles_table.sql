CREATE TABLE candidate_profiles (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL UNIQUE,
    headline VARCHAR(255),
    location VARCHAR(255),
    bio TEXT,
    tech_stack TEXT,
    experience_level VARCHAR(50),
    github_url VARCHAR(500),
    linkedin_url VARCHAR(500),
    profile_image_url VARCHAR(500),
    resume_file_name VARCHAR(255),
    profile_completed BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_candidate_profile_user FOREIGN KEY (user_id) REFERENCES users(id)
);
