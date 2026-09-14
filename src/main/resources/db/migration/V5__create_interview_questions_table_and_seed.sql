CREATE TABLE IF NOT EXISTS interview_questions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    role VARCHAR(100) NOT NULL,
    subject VARCHAR(100) NOT NULL,
    skill VARCHAR(100) NOT NULL,
    difficulty VARCHAR(50) NOT NULL,
    question_text TEXT NOT NULL,
    sample_answer TEXT NOT NULL,
    ai_tips TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed CS Core Subject: Database Management Systems (DBMS)
INSERT INTO interview_questions (role, subject, skill, difficulty, question_text, sample_answer, ai_tips)
VALUES 
('Software Engineer', 'DBMS', 'Indexing & B-Trees', 'INTERMEDIATE', 
'Explain how B-Tree indexes improve database query performance and why indexing high-cardinality columns is preferred.', 
'B-Trees keep data sorted and allow search, sequential access, insertions, and deletions in logarithmic time O(log N). Indexing high-cardinality columns (like user_id or email) narrows down row selection efficiently compared to low-cardinality columns (like gender).', 
'Mention composite indexes and write amplification tradeoffs during frequent UPDATEs/INSERTs.'),

('Database Administrator', 'DBMS', 'ACID & Transactions', 'ADVANCED', 
'What are ACID properties in relational databases? How do Isolation Levels prevent Dirty Reads and Phantom Reads?', 
'ACID stands for Atomicity, Consistency, Isolation, and Durability. Isolation levels (Read Uncommitted, Read Committed, Repeatable Read, Serializable) use locks or Multi-Version Concurrency Control (MVCC) to ensure concurrent transactions do not read uncommitted writes or inconsistent snapshots.', 
'Explain MVCC and Read Committed vs Repeatable Read isolation levels.'),

('Backend Developer', 'DBMS', 'Database Normalization', 'EASY', 
'What is Database Normalization? Explain the difference between 1NF, 2NF, and 3NF.', 
'Normalization minimizes data redundancy. 1NF requires atomic values and unique records. 2NF removes partial dependencies where non-key attributes depend on part of a composite primary key. 3NF removes transitive dependencies where non-key attributes depend on another non-key attribute.', 
'Use a candidate/order table example to demonstrate reducing duplicate data.');

-- Seed CS Core Subject: Operating Systems (OS)
INSERT INTO interview_questions (role, subject, skill, difficulty, question_text, sample_answer, ai_tips)
VALUES 
('Systems Engineer', 'Operating Systems', 'Process & Threads', 'EASY', 
'What is the fundamental difference between a Process and a Thread? How does Context Switching differ between them?', 
'A process is an independent executing program with its own isolated virtual memory address space. A thread is a lightweight execution segment within a process sharing heap memory and file descriptors. Process context switching requires invalidating CPU caches (TLB), whereas thread context switching within the same process is faster.', 
'Highlight TLB (Translation Lookaside Buffer) flushing and memory space isolation.'),

('Backend Engineer', 'Operating Systems', 'Deadlock & Concurrency', 'INTERMEDIATE', 
'Define Deadlock. What are the four Coffman conditions necessary for a deadlock to occur?', 
'Deadlock occurs when processes are blocked indefinitely waiting for resources held by each other. The four conditions are: 1) Mutual Exclusion, 2) Hold and Wait, 3) No Preemption, and 4) Circular Wait.', 
'Reference Banker''s algorithm or resource ordering to break the Circular Wait condition.');

-- Seed CS Core Subject: Computer Networks (CN)
INSERT INTO interview_questions (role, subject, skill, difficulty, question_text, sample_answer, ai_tips)
VALUES 
('Network / Backend Engineer', 'Computer Networks', 'TCP 3-Way Handshake', 'INTERMEDIATE', 
'Explain the TCP 3-Way Handshake mechanism and how connection termination (4-way handshake) works.', 
'Connection setup involves SYN (Client -> Server with random SEQ number), SYN-ACK (Server acknowledges SYN + sends own SEQ), and ACK (Client acknowledges Server SEQ). Connection termination uses FIN/ACK flags from both sides to close bidirectional streams.', 
'Mention SYN flood attacks and SYN cookies as security hardening context.'),

('Full Stack Engineer', 'Computer Networks', 'HTTP/S & TLS', 'EASY', 
'What happens step-by-step when you type https://jobnest.com into your browser address bar?', 
'1) DNS resolution gets IP address. 2) TCP 3-way handshake established on port 443. 3) TLS handshake negotiates encryption key. 4) HTTP GET request sent. 5) Server returns HTML/JS bundle. 6) Browser renders DOM tree.', 
'Mention DNS caching hierarchy (Browser -> OS -> Local Router -> ISP DNS).');

-- Seed CS Core Subject: Data Structures & Algorithms (DSA)
INSERT INTO interview_questions (role, subject, skill, difficulty, question_text, sample_answer, ai_tips)
VALUES 
('Software Engineer', 'Data Structures', 'Graphs & Trees', 'INTERMEDIATE', 
'Compare Depth First Search (DFS) and Breadth First Search (BFS) graph traversals. When would you prefer BFS over DFS?', 
'BFS traverses level-by-level using a Queue and guarantees finding the shortest path in unweighted graphs. DFS explores paths deeply using a Stack or recursion, useful for topological sorting, cycle detection, and maze solutions.', 
'Explain memory complexity: BFS uses O(V) queue memory for wide trees; DFS uses O(H) call stack memory.');

-- Seed CS Core Subject: Object-Oriented Programming & System Design
INSERT INTO interview_questions (role, subject, skill, difficulty, question_text, sample_answer, ai_tips)
VALUES 
('Senior Full Stack Developer', 'System Design', 'Caching & Scalability', 'ADVANCED', 
'How would you design a distributed caching layer using Redis for a high-traffic job portal?', 
'Implement Cache-Aside pattern: Read from Redis cache first; on cache miss, query MySQL database, update cache with TTL, and return payload. Use Redis Sentinel/Cluster for high availability and consistent hashing for partition key distribution.', 
'Discuss cache invalidation strategies (TTL vs event-driven purge) and cache stampede prevention.');
