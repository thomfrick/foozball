-- Database initialization script for Foosball ELO Tracker
-- This script runs when the PostgreSQL container first starts

-- Create extensions we'll need
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create test database for testing
CREATE DATABASE foosball_test;

-- Grant permissions to test database
GRANT ALL PRIVILEGES ON DATABASE foosball_test TO foosball_user;

-- Create a test connection to verify everything works
SELECT 'Database initialized successfully!' as status;
