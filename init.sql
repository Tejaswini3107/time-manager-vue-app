-- Time Manager Database Initialization Script

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create clocks table
CREATE TABLE IF NOT EXISTS clocks (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status BOOLEAN NOT NULL DEFAULT false,
    time TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create working_times table
CREATE TABLE IF NOT EXISTS working_times (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    start TIMESTAMP WITH TIME ZONE NOT NULL,
    end TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_clocks_user_id ON clocks(user_id);
CREATE INDEX IF NOT EXISTS idx_clocks_time ON clocks(time);
CREATE INDEX IF NOT EXISTS idx_working_times_user_id ON working_times(user_id);
CREATE INDEX IF NOT EXISTS idx_working_times_start ON working_times(start);
CREATE INDEX IF NOT EXISTS idx_working_times_end ON working_times(end);

-- Insert sample data
INSERT INTO users (username, email) VALUES 
    ('testuser', 'test@example.com'),
    ('testuser4', 'test4@example.com'),
    ('hiotrjgjho11', 'hdcsuhf@gmail.com'),
    ('testuser5', 'test5@example.com'),
    ('apitest', 'apitest@example.com')
ON CONFLICT (username) DO NOTHING;

-- Insert sample clock data
INSERT INTO clocks (user_id, status, time) VALUES 
    (1, true, NOW() - INTERVAL '2 hours'),
    (1, false, NOW() - INTERVAL '1 hour'),
    (7, true, NOW() - INTERVAL '30 minutes')
ON CONFLICT DO NOTHING;

-- Insert sample working time data
INSERT INTO working_times (user_id, start, end) VALUES 
    (1, NOW() - INTERVAL '8 hours', NOW() - INTERVAL '1 hour'),
    (7, NOW() - INTERVAL '6 hours', NOW() - INTERVAL '30 minutes')
ON CONFLICT DO NOTHING;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_working_times_updated_at BEFORE UPDATE ON working_times
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
