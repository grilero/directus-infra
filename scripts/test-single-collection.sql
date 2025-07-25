-- Test creating a single collection directly in PostgreSQL
-- This will test if Directus can discover tables created outside of its API

-- Create the test table
CREATE TABLE IF NOT EXISTS test (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255)
);

-- Insert a test record
INSERT INTO test (name) VALUES ('Test record created via SQL') 
ON CONFLICT DO NOTHING;