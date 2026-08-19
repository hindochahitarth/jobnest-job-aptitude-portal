CREATE TABLE IF NOT EXISTS questions (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    section VARCHAR(50) NOT NULL,
    category VARCHAR(100) NOT NULL,
    difficulty VARCHAR(50) NOT NULL,
    question_text TEXT NOT NULL,
    option_a TEXT NOT NULL,
    option_b TEXT NOT NULL,
    option_c TEXT NOT NULL,
    option_d TEXT NOT NULL,
    correct_option VARCHAR(10) NOT NULL,
    explanation TEXT
);

CREATE TABLE IF NOT EXISTS test_attempts (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    category VARCHAR(100) NOT NULL,
    difficulty VARCHAR(50) NOT NULL,
    total_questions INT NOT NULL,
    time_limit_minutes INT NOT NULL,
    score INT DEFAULT 0,
    total_marks INT DEFAULT 0,
    percentage DOUBLE DEFAULT 0.0,
    percentile DOUBLE DEFAULT 0.0,
    status VARCHAR(50) NOT NULL,
    started_at TIMESTAMP NOT NULL,
    submitted_at TIMESTAMP,
    proctor_warning_count INT DEFAULT 0,
    proctor_status VARCHAR(50) DEFAULT 'CLEAN'
);

CREATE TABLE IF NOT EXISTS test_answers (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    test_attempt_id BIGINT NOT NULL,
    question_id BIGINT NOT NULL,
    selected_option VARCHAR(10),
    is_correct BOOLEAN,
    is_marked_for_review BOOLEAN DEFAULT FALSE,
    time_spent_seconds INT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS proctoring_logs (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    test_attempt_id BIGINT NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    timestamp TIMESTAMP NOT NULL,
    warning_number INT NOT NULL,
    details VARCHAR(255)
);

-- Seed Initial Question Bank across QUANT, LOGICAL, VERBAL, TECHNICAL topics
INSERT INTO questions (section, category, difficulty, question_text, option_a, option_b, option_c, option_d, correct_option, explanation) VALUES
-- QUANTITATIVE APTITUDE
('QUANT', 'Profit & Loss', 'EASY', 'A trader buys an item for ₹500 and sells it for ₹625. What is the profit percentage?', '20%', '25%', '30%', '15%', 'B', 'Profit = 625 - 500 = 125. Profit % = (125 / 500) * 100 = 25%.'),
('QUANT', 'Speed Time Distance', 'MEDIUM', 'A train 180 meters long passes a telegraph post in 9 seconds. What is the speed of the train in km/h?', '50 km/h', '60 km/h', '72 km/h', '80 km/h', 'C', 'Speed = 180 / 9 = 20 m/s. In km/h = 20 * (18 / 5) = 72 km/h.'),
('QUANT', 'Ages', 'EASY', 'The ratio of ages of A and B is 4:5. After 6 years, the sum of their ages will be 48. What is A''s present age?', '16 years', '20 years', '18 years', '24 years', 'A', 'Present age sum = 48 - 12 = 36. Ratio 4:5 => 4x + 5x = 36 => 9x = 36 => x = 4. A''s age = 16 years.'),
('QUANT', 'Pipes & Cisterns', 'MEDIUM', 'Pipe A can fill a tank in 12 hours and Pipe B can fill it in 18 hours. If both operate together, how long will it take to fill the tank?', '6.2 hours', '7.2 hours', '8 hours', '9.5 hours', 'B', '1/A + 1/B = 1/12 + 1/18 = (3 + 2)/36 = 5/36. Time = 36/5 = 7.2 hours.'),
('QUANT', 'Simple Interest', 'HARD', 'A sum of money doubles itself at simple interest in 10 years. In how many years will it triple itself at the same rate of interest?', '15 years', '20 years', '25 years', '30 years', 'B', 'SI = P in 10 years => Rate = 100/10 = 10%. To triple, SI = 2P => Time = (2P * 100)/(P * 10) = 20 years.'),
('QUANT', 'Permutations & Combinations', 'HARD', 'In how many different ways can the letters of the word "LEADING" be arranged such that vowels always come together?', '360', '720', '5040', '1440', 'B', 'Vowels: E, A, I (3 vowels treated as 1 block). Total units = 4 consonants + 1 block = 5 units (5! = 120). Vowels arrange in 3! = 6 ways. Total = 120 * 6 = 720.'),

-- LOGICAL REASONING
('LOGICAL', 'Number Series', 'EASY', 'Find the next number in the series: 3, 7, 15, 31, 63, ?', '95', '127', '115', '125', 'B', 'Pattern: (Previous x 2) + 1. 63 x 2 + 1 = 127.'),
('LOGICAL', 'Coding Decoding', 'EASY', 'If "FLOWER" is coded as "EKNVDQ", how is "GARDEN" written in that code?', 'FZQCDM', 'FBSEFO', 'GAQDEM', 'FYPBDM', 'A', 'Each letter is shifted 1 position backward (-1). G->F, A->Z, R->Q, D->C, E->D, N->M.'),
('LOGICAL', 'Blood Relations', 'MEDIUM', 'Pointing to a photograph, a man said "I have no brother or sister but that man''s father is my father''s son." Whose photograph was it?', 'His own', 'His son''s', 'His father''s', 'His nephew''s', 'B', 'My father''s son = the speaker himself. So "that man''s father is me". The photo is of his son.'),
('LOGICAL', 'Syllogisms', 'MEDIUM', 'Statements: All dogs are cats. All cats are lions. Conclusion I: All dogs are lions. Conclusion II: Some lions are dogs.', 'Only I follows', 'Only II follows', 'Both I and II follow', 'Neither follows', 'C', 'Venn diagram: Dogs inside Cats inside Lions. Both conclusions follow logically.'),
('LOGICAL', 'Direction Sense', 'HARD', 'A person walks 10 km North, then 6 km South, then 3 km East. How far and in which direction is he from his starting point?', '5 km North-East', '5 km South-East', '7 km North-West', '10 km North-East', 'A', 'Net North = 10 - 6 = 4 km. Net East = 3 km. Distance = sqrt(4^2 + 3^2) = 5 km North-East.'),

-- VERBAL ABILITY
('VERBAL', 'Grammar & Usage', 'EASY', 'Identify the correct sentence:', 'Neither of the boys were present.', 'Neither of the boys was present.', 'Neither of the boy were present.', 'Neither of the boys are present.', 'B', '"Neither of" takes a singular verb "was".'),
('VERBAL', 'Synonyms', 'EASY', 'Choose the word nearest in meaning to "CANDID":', 'Secretive', 'Frank', 'Arrogant', 'Deceitful', 'B', 'Candid means truthful, straightforward, or frank.'),
('VERBAL', 'Antonyms', 'MEDIUM', 'Choose the word opposite in meaning to "METICULOUS":', 'Careful', 'Sloppy', 'Punctual', 'Methodical', 'B', 'Meticulous means showing great attention to detail. Opposite is sloppy/careless.'),
('VERBAL', 'Sentence Improvement', 'MEDIUM', 'He is one of the men who (has worked) hard for the company. Replace the bracketed part:', 'have worked', 'has work', 'having worked', 'No improvement required', 'A', 'Relative pronoun "who" refers to plural antecedent "men", requiring plural verb "have worked".'),

-- TECHNICAL & CODING
('TECHNICAL', 'Java & OOP', 'EASY', 'Which of the following is NOT a feature of Object Oriented Programming in Java?', 'Inheritance', 'Polymorphism', 'Pointers', 'Encapsulation', 'C', 'Java does not support explicit pointers for memory safety.'),
('TECHNICAL', 'Data Structures', 'MEDIUM', 'What is the average time complexity for searching an element in a balanced Binary Search Tree (BST)?', 'O(1)', 'O(n)', 'O(log n)', 'O(n log n)', 'C', 'Searching in a balanced BST splits the search space in half at each step, giving O(log n).'),
('TECHNICAL', 'React & Web', 'EASY', 'In React, what hook is used to perform side effects in functional components?', 'useState', 'useEffect', 'useContext', 'useReducer', 'B', 'useEffect handles lifecycle side-effects in functional components.'),
('TECHNICAL', 'SQL & Databases', 'MEDIUM', 'Which SQL clause is used to filter aggregate records grouped by a GROUP BY clause?', 'WHERE', 'HAVING', 'ORDER BY', 'JOIN', 'B', 'HAVING filters aggregated groups, whereas WHERE filters individual rows before grouping.');
