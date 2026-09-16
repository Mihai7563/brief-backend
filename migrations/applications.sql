CREATE TABLE applications (
    id INT AUTO_INCREMENT PRIMARY KEY,

    user_id INT UNSIGNED NOT NULL,
    brief_id INT UNSIGNED NOT NULL,

    application_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    demo VARCHAR(500) NULL,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE,

    FOREIGN KEY (brief_id) REFERENCES briefs(id)
        ON DELETE CASCADE,

    UNIQUE (user_id, brief_id)
);