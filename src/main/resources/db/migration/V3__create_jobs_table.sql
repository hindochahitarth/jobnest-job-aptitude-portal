CREATE TABLE jobs (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    recruiter_id BIGINT,
    title VARCHAR(255) NOT NULL,
    company VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    salary VARCHAR(100),
    exp_level VARCHAR(50),
    aptitude_cutoff INT DEFAULT 70,
    skills TEXT NOT NULL,
    description TEXT,
    deadline VARCHAR(50),
    created_at TIMESTAMP NOT NULL
);

INSERT INTO jobs (title, company, location, salary, exp_level, aptitude_cutoff, skills, description, deadline, created_at) VALUES
('Frontend React Engineer', 'Acme Corp', 'Remote / Bengaluru', '₹8 LPA - ₹12 LPA', '0-2', 80, 'React, JavaScript, CSS, HTML', 'Build responsive, high-performance web applications using modern React, state management, and reusable UI design systems.', '2026-12-31', CURRENT_TIMESTAMP),
('Full Stack Java Developer', 'Enterprise Scale', 'Pune / Hybrid', '₹10 LPA - ₹15 LPA', '1-3', 85, 'Java, Spring Boot, SQL, React', 'Design and implement robust enterprise backend microservices with Spring Boot, SQL databases, and integrate with modern frontend components.', '2026-12-31', CURRENT_TIMESTAMP),
('Backend Node.js Engineer', 'CloudScale Technologies', 'Hyderabad / Remote', '₹9 LPA - ₹14 LPA', '0-3', 80, 'Node.js, Express, JavaScript, PostgreSQL, SQL, REST API', 'Develop and scale high-throughput REST APIs, database schemas, and microservice architectures with Node.js and PostgreSQL.', '2026-12-31', CURRENT_TIMESTAMP),
('Python Data Analyst & ML Trainee', 'NexGen Analytics', 'Bengaluru', '₹10 LPA - ₹14 LPA', '0-2', 85, 'Python, SQL, Machine Learning, Pandas, Data Analysis', 'Analyze product and business datasets, write optimized SQL queries, and build predictive machine learning models and visualizations.', '2026-12-31', CURRENT_TIMESTAMP),
('Cloud & DevOps Engineer', 'InfraCore Systems', 'Noida / Remote', '₹11 LPA - ₹16 LPA', '1-4', 80, 'AWS, Docker, Kubernetes, Linux, CI/CD', 'Automate cloud infrastructure provisioning, containerization pipelines, and Kubernetes deployments on AWS with high availability.', '2026-12-31', CURRENT_TIMESTAMP),
('Software QA & Automation Engineer', 'QualityFirst Labs', 'Ahmedabad / Hybrid', '₹6 LPA - ₹9 LPA', '0-2', 75, 'Java, Selenium, Test Automation, Jest, SQL', 'Develop comprehensive test automation frameworks, execute integration tests, and ensure high code quality across release cycles.', '2026-12-31', CURRENT_TIMESTAMP),
('Mobile App Developer (Flutter / React Native)', 'Appify Studio', 'Mumbai / Remote', '₹8 LPA - ₹13 LPA', '0-3', 80, 'React Native, Flutter, JavaScript, Mobile Development', 'Create cross-platform mobile apps with engaging user experiences, offline storage, and seamless API integrations.', '2026-12-31', CURRENT_TIMESTAMP),
('Junior Software Engineer', 'TechStart Innovations', 'Chennai / Hybrid', '₹6 LPA - ₹8.5 LPA', '0-1', 70, 'Java, C++, Data Structures, Problem Solving, Algorithms, SQL', 'Participate in the full software lifecycle, solving foundational algorithmic problems and building core features.', '2026-12-31', CURRENT_TIMESTAMP);
