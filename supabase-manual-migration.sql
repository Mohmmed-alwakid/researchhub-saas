-- Manual Database Migration Script for Supabase Dashboard
-- Copy and paste this SQL into Supabase SQL Editor
-- URL: https://supabase.com/dashboard/project/wxpwxzdgdvinlbtnbgdf/sql

-- Step 1: Create recording_sessions table first (referenced by recordings)
CREATE TABLE IF NOT EXISTS recording_sessions (
  id VARCHAR(255) PRIMARY KEY,
  study_id VARCHAR(255) NOT NULL,
  participant_id VARCHAR(255),
  status VARCHAR(50) DEFAULT 'active', -- 'active', 'completed', 'stopped'
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 2: Create recordings table
CREATE TABLE IF NOT EXISTS recordings (
  id VARCHAR(255) PRIMARY KEY,
  session_id VARCHAR(255) NOT NULL REFERENCES recording_sessions(id) ON DELETE CASCADE,
  study_id VARCHAR(255),
  participant_id VARCHAR(255),
  recording_data TEXT, -- Base64 encoded video data (temporary solution)
  mime_type VARCHAR(100) DEFAULT 'video/webm',
  status VARCHAR(50) DEFAULT 'recording', -- 'recording', 'completed', 'failed', 'processing'
  duration INTEGER DEFAULT 0, -- Duration in seconds
  file_size BIGINT DEFAULT 0, -- File size in bytes
  recording_options JSONB, -- Recording configuration options
  cloud_provider VARCHAR(50), -- 'aws-s3', 'gcp-storage', 'local', etc.
  cloud_path TEXT, -- Path in cloud storage
  cloud_url TEXT, -- Public URL for playback
  video_properties JSONB, -- Width, height, framerate, etc.
  audio_properties JSONB, -- Sample rate, bitrate, etc.
  started_at TIMESTAMP WITH TIME ZONE,
  ended_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 3: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_recording_sessions_study_id ON recording_sessions(study_id);
CREATE INDEX IF NOT EXISTS idx_recording_sessions_participant_id ON recording_sessions(participant_id);
CREATE INDEX IF NOT EXISTS idx_recording_sessions_status ON recording_sessions(status);

CREATE INDEX IF NOT EXISTS idx_recordings_session_id ON recordings(session_id);
CREATE INDEX IF NOT EXISTS idx_recordings_study_id ON recordings(study_id);
CREATE INDEX IF NOT EXISTS idx_recordings_participant_id ON recordings(participant_id);
CREATE INDEX IF NOT EXISTS idx_recordings_status ON recordings(status);
CREATE INDEX IF NOT EXISTS idx_recordings_created_at ON recordings(created_at);

-- Step 4: Enable Row Level Security (RLS)
ALTER TABLE recording_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE recordings ENABLE ROW LEVEL SECURITY;

-- Step 5: Create RLS policies for recording_sessions
CREATE POLICY "Users can view their own recording sessions" ON recording_sessions
  FOR SELECT USING (
    participant_id = auth.uid()::text OR
    -- Researchers can see sessions for their studies
    study_id IN (
      SELECT id FROM studies WHERE created_by = auth.uid()::text
    ) OR
    -- Admins can see all sessions
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

CREATE POLICY "Users can create recording sessions" ON recording_sessions
  FOR INSERT WITH CHECK (
    -- Participants can create sessions for themselves
    participant_id = auth.uid()::text OR
    -- Researchers can create sessions for their studies
    study_id IN (
      SELECT id FROM studies WHERE created_by = auth.uid()::text
    ) OR
    -- Admins can create any session
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

CREATE POLICY "Users can update their own recording sessions" ON recording_sessions
  FOR UPDATE USING (
    participant_id = auth.uid()::text OR
    study_id IN (
      SELECT id FROM studies WHERE created_by = auth.uid()::text
    ) OR
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Step 6: Create RLS policies for recordings
CREATE POLICY "Users can view their own recordings" ON recordings
  FOR SELECT USING (
    participant_id = auth.uid()::text OR
    -- Researchers can see recordings for their studies
    study_id IN (
      SELECT id FROM studies WHERE created_by = auth.uid()::text
    ) OR
    -- Admins can see all recordings
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

CREATE POLICY "Users can create recordings" ON recordings
  FOR INSERT WITH CHECK (
    participant_id = auth.uid()::text OR
    study_id IN (
      SELECT id FROM studies WHERE created_by = auth.uid()::text
    ) OR
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

CREATE POLICY "Users can update their own recordings" ON recordings
  FOR UPDATE USING (
    participant_id = auth.uid()::text OR
    study_id IN (
      SELECT id FROM studies WHERE created_by = auth.uid()::text
    ) OR
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Step 7: Insert test data (optional)
INSERT INTO recording_sessions (id, study_id, participant_id, status) 
VALUES ('test-session-001', 'test-study-123', 'test-participant-456', 'active')
ON CONFLICT (id) DO NOTHING;

-- Verification queries (run these to check if everything worked)
SELECT 'recording_sessions' as table_name, count(*) as row_count FROM recording_sessions
UNION ALL
SELECT 'recordings' as table_name, count(*) as row_count FROM recordings;

-- Show table structure
SELECT table_name, column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name IN ('recording_sessions', 'recordings')
ORDER BY table_name, ordinal_position;
