CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE problems (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    problem_constraints TEXT NOT NULL,
    examples TEXT NOT NULL,
    solution_code TEXT NOT NULL,  
    solution_language VARCHAR(20) NOT NULL,  
    author_id INT REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE test_cases (
    id SERIAL PRIMARY KEY,
    problem_id INT REFERENCES problems(id) ON DELETE CASCADE,
    input TEXT NOT NULL,          
    expected_output TEXT NOT NULL, 
    is_public BOOLEAN DEFAULT TRUE 
);
ALTER TABLE problems ADD COLUMN difficulty VARCHAR(20);

select * from problems;