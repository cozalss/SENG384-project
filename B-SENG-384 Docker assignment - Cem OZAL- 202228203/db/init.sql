CREATE TABLE IF NOT EXISTS people (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed data (optional)
INSERT INTO people (full_name, email) VALUES 
('Cem Özal', 'cemmozal@gmail.com')
ON CONFLICT (email) DO NOTHING;
