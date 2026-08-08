CREATE TABLE briefs(
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category_id INT NOT NULL,
    budget DECIMAL(12, 4),
    deadline DATE,
    publish_date DATE
);