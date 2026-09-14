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

-- =========================================================================
-- TRACK 1: Tech Product Companies — Data Structures & System Concepts
-- =========================================================================
INSERT INTO interview_questions (role, subject, skill, difficulty, question_text, sample_answer, ai_tips) VALUES 
('Software Engineer', 'Data Structures & System Concepts', 'Arrays & Two Pointers', 'INTERMEDIATE',
'Given an array of integers, how do you find two numbers that sum up to a target value in O(N) time complexity?',
'Use a HashMap to store previously seen numbers and their indices. For each element num, compute complement = target - num. If complement exists in HashMap, return the index pair.',
'Mention time complexity O(N) and space complexity O(N). Contrast with O(N^2) brute force nested loops.'),

('Software Engineer', 'Data Structures & System Concepts', 'Graphs & Shortest Path', 'ADVANCED',
'Explain Dijkstra''s algorithm for finding the shortest path in a weighted graph. What is its time complexity using a Min-Heap?',
'Dijkstra uses a Min-Priority Queue to greedily select the unvisited vertex with the smallest distance, updating its neighbors'' distances. With a Binary Heap, time complexity is O((V + E) log V).',
'Note that Dijkstra does not work with negative edge weights; Bellman-Ford should be used instead.'),

('Backend Engineer', 'Data Structures & System Concepts', 'System Design - Rate Limiter', 'ADVANCED',
'How would you design a distributed Rate Limiter for an API gateway to prevent denial-of-service traffic?',
'Use the Token Bucket or Leaky Bucket algorithm backed by Redis. In Redis, maintain atomic counter increment with TTL using Lua scripts to prevent race conditions across multi-node servers.',
'Discuss sliding window log vs sliding window counter algorithms in distributed caching.'),

('Systems Architect', 'Data Structures & System Concepts', 'System Design - Message Queues', 'ADVANCED',
'Compare Apache Kafka and RabbitMQ. When would you choose Kafka over traditional message brokers?',
'Kafka is a distributed append-only commit log built for high throughput, event streaming, and replayable message logs. RabbitMQ is an AMQP broker optimized for complex routing, priority queues, and individual message acknowledgments.',
'Highlight log retention, offset management, and consumer group partitioning in Kafka.'),

('Software Engineer', 'Data Structures & System Concepts', 'Dynamic Programming', 'HARD',
'Explain the 0/1 Knapsack Problem and how DP table memoization optimizes the time complexity from exponential to pseudo-polynomial.',
'Brute force recursive choice tree takes O(2^N). Using a 2D DP table `dp[i][w]` storing max value with `i` items and `w` capacity reduces time complexity to O(N * W).',
'Explain space optimization from 2D matrix O(N*W) to 1D array O(W).'),

('Backend Developer', 'Data Structures & System Concepts', 'System Design - Distributed Caching', 'INTERMEDIATE',
'How do you prevent Cache Stampede (Thundering Herd Problem) in a multi-server environment?',
'Use Mutex Locking (distributed lock via Redis Redlock) so only one server queries the DB on cache miss while others wait, or use probabilistic early expiration / background async cache refresh.',
'Explain cache-aside pattern vs write-through caching.');


-- =========================================================================
-- TRACK 2: Consulting & Analytics — Quantitative Estimation & Case Studies
-- =========================================================================
INSERT INTO interview_questions (role, subject, skill, difficulty, question_text, sample_answer, ai_tips) VALUES 
('Data Analyst', 'Quantitative Estimation & Case Studies', 'SQL Window Functions', 'INTERMEDIATE',
'Write a SQL query using Window Functions to calculate the 7-day moving average of daily candidate applications.',
'SELECT apply_date, COUNT(*) AS daily_apps, AVG(COUNT(*)) OVER (ORDER BY apply_date ROWS BETWEEN 6 PRECEDING AND CURRENT ROW) AS 7_day_moving_avg FROM applications GROUP BY apply_date;',
'Highlight the difference between ROWS BETWEEN and RANGE BETWEEN in SQL windowing.'),

('Product Analyst', 'Quantitative Estimation & Case Studies', 'Market Sizing & Guesstimate', 'ADVANCED',
'Estimate the annual revenue of EV charging stations in a major metro city with 5 million residents.',
'Top-down approach: 5M residents -> ~1.5M vehicles -> 5% EV adoption (75,000 EVs). If each EV charges 40 kWh/week at ₹15/kWh, weekly revenue per EV = ₹600. Total annual market size = 75,000 * ₹600 * 52 = ₹2.34 Billion.',
'State assumptions clearly, break down into population -> vehicle ownership -> EV ratio -> charging frequency.'),

('Business Analyst', 'Quantitative Estimation & Case Studies', 'Root Cause Analysis Case Study', 'ADVANCED',
'Our job portal experienced a sudden 25% drop in candidate job applications yesterday. How would you investigate the root cause?',
'1) Segment by platform (Web vs Mobile app vs iOS). 2) Segment by traffic source (Organic vs Paid Ads). 3) Check technical funnel logs (API errors, payment gateway, authentication timeout). 4) Check external factors (holidays, competitor launch).',
'Structure analysis using MECE (Mutually Exclusive, Collectively Exhaustive) framework.'),

('Data Scientist', 'Quantitative Estimation & Case Studies', 'A/B Testing & Metrics', 'INTERMEDIATE',
'How do you determine if a 3% increase in candidate click-through-rate on a new Job Search layout is statistically significant?',
'Calculate the p-value using a Two-Sample Z-Test for proportions. If p-value < 0.05 (confidence level > 95%) and sample size satisfies minimum detectable effect (MDE) requirements, the lift is statistically significant.',
'Mention statistical power (1 - Beta), sample size estimation, and guardrail metrics.');


-- =========================================================================
-- TRACK 3: Early Startups — React, Node.js & Practical Project Scenarios
-- =========================================================================
INSERT INTO interview_questions (role, subject, skill, difficulty, question_text, sample_answer, ai_tips) VALUES 
('Full Stack Developer', 'React, Node.js & Practical Project Scenarios', 'React Hooks & State Management', 'PRACTICAL',
'Explain how React''s useEffect cleanup function prevents memory leaks when subscribing to WebSocket events or interval timers.',
'When a component unmounts or re-renders with changed dependencies, React executes the returned cleanup function. This closes open WebSocket connections (`socket.close()`) or clears intervals (`clearInterval()`) to prevent state updates on unmounted components.',
'Mention stale closures and why dependency arrays must include referenced state variables.'),

('Node.js Backend Engineer', 'React, Node.js & Practical Project Scenarios', 'Node.js Event Loop', 'INTERMEDIATE',
'Explain the phases of the Node.js Event Loop and why non-blocking asynchronous I/O allows Node.js to handle high concurrent HTTP traffic.',
'The Event Loop has 6 phases: Timers (setTimeout), Pending I/O, Idle/Prepare, Poll (incoming connections), Check (setImmediate), and Close callbacks. Offloading I/O to libuv worker pool threads allows the single main JS thread to remain unblocked.',
'Explain process.nextTick() microtask queue priority over setImmediate macro-tasks.'),

('Full Stack Engineer', 'React, Node.js & Practical Project Scenarios', 'REST API vs WebSockets', 'PRACTICAL',
'When building a real-time collaborative code editor or live chat feature in a startup app, when would you choose WebSockets over REST or Server-Sent Events (SSE)?',
'Use WebSockets for bi-directional, low-latency full-duplex communication where both client and server continuously push updates. Use SSE for server-to-client streaming (e.g. live stock ticker/AI response streaming). Use REST for standard stateless CRUD.',
'Discuss connection overhead, heartbeat ping/pong, and scaling WebSockets behind NGINX / Redis PubSub.'),

('Security & Full Stack Engineer', 'React, Node.js & Practical Project Scenarios', 'JWT & Security Best Practices', 'PRACTICAL',
'How do you securely store JWT access tokens and refresh tokens in a Single Page Application (SPA) to prevent XSS and CSRF attacks?',
'Store short-lived Access Tokens in memory (React state) and long-lived Refresh Tokens in HttpOnly, SameSite=Strict, Secure cookies. This prevents JavaScript from reading tokens via XSS (`document.cookie`) and blocks cross-origin CSRF forgery.',
'Explain CSRF tokens and SameSite cookie attribute protections.');


-- =========================================================================
-- CS Core Subject 1: Database Management Systems (DBMS)
-- =========================================================================
INSERT INTO interview_questions (role, subject, skill, difficulty, question_text, sample_answer, ai_tips) VALUES 
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


-- =========================================================================
-- CS Core Subject 2: Operating Systems (OS)
-- =========================================================================
INSERT INTO interview_questions (role, subject, skill, difficulty, question_text, sample_answer, ai_tips) VALUES 
('Systems Engineer', 'Operating Systems', 'Process & Threads', 'EASY', 
'What is the fundamental difference between a Process and a Thread? How does Context Switching differ between them?', 
'A process is an independent executing program with its own isolated virtual memory address space. A thread is a lightweight execution segment within a process sharing heap memory and file descriptors. Process context switching requires invalidating CPU caches (TLB), whereas thread context switching within the same process is faster.', 
'Highlight TLB (Translation Lookaside Buffer) flushing and memory space isolation.'),

('Backend Engineer', 'Operating Systems', 'Deadlock & Concurrency', 'INTERMEDIATE', 
'Define Deadlock. What are the four Coffman conditions necessary for a deadlock to occur?', 
'Deadlock occurs when processes are blocked indefinitely waiting for resources held by each other. The four conditions are: 1) Mutual Exclusion, 2) Hold and Wait, 3) No Preemption, and 4) Circular Wait.', 
'Reference Banker''s algorithm or resource ordering to break the Circular Wait condition.');


-- =========================================================================
-- CS Core Subject 3: Computer Networks (CN)
-- =========================================================================
INSERT INTO interview_questions (role, subject, skill, difficulty, question_text, sample_answer, ai_tips) VALUES 
('Network / Backend Engineer', 'Computer Networks', 'TCP 3-Way Handshake', 'INTERMEDIATE', 
'Explain the TCP 3-Way Handshake mechanism and how connection termination (4-way handshake) works.', 
'Connection setup involves SYN (Client -> Server with random SEQ number), SYN-ACK (Server acknowledges SYN + sends own SEQ), and ACK (Client acknowledges Server SEQ). Connection termination uses FIN/ACK flags from both sides to close bidirectional streams.', 
'Mention SYN flood attacks and SYN cookies as security hardening context.'),

('Full Stack Engineer', 'Computer Networks', 'HTTP/S & TLS', 'EASY', 
'What happens step-by-step when you type https://jobnest.com into your browser address bar?', 
'1) DNS resolution gets IP address. 2) TCP 3-way handshake established on port 443. 3) TLS handshake negotiates encryption key. 4) HTTP GET request sent. 5) Server returns HTML/JS bundle. 6) Browser renders DOM tree.', 
'Mention DNS caching hierarchy (Browser -> OS -> Local Router -> ISP DNS).');
