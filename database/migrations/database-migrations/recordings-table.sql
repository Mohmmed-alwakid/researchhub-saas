-- Recordings table for storing screen recording metadata and data
-- This will be created in Supabase

CREATE TABLE IF NOT EXISTS recordings (
  id VARCHAR(255) PRIMARY KEY,
  session_id VARCHAR(255) NOT NULL,
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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_recordings_session_id ON recordings(session_id);
CREATE INDEX IF NOT EXISTS idx_recordings_study_id ON recordings(study_id);
CREATE INDEX IF NOT EXISTS idx_recordings_participant_id ON recordings(participant_id);
CREATE INDEX IF NOT EXISTS idx_recordings_status ON recordings(status);
CREATE INDEX IF NOT EXISTS idx_recordings_created_at ON recordings(created_at);

-- Row Level Security (RLS) policies
ALTER TABLE recordings ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see recordings for their own sessions
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

-- Policy: Users can only insert recordings for their own sessions
CREATE POLICY "Users can create recordings for their sessions" ON recordings
  FOR INSERT WITH CHECK (
    participant_id = auth.uid()::text OR
    -- Researchers can create recordings for their studies
    study_id IN (
      SELECT id FROM studies WHERE created_by = auth.uid()::text
    )
  );

-- Policy: Users can only update their own recordings
CREATE POLICY "Users can update their own recordings" ON recordings
  FOR UPDATE USING (
    participant_id = auth.uid()::text OR
    -- Researchers can update recordings for their studies
    study_id IN (
      SELECT id FROM studies WHERE created_by = auth.uid()::text
    ) OR
    -- Admins can update all recordings
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Policy: Users can only delete their own recordings
CREATE POLICY "Users can delete their own recordings" ON recordings
  FOR DELETE USING (
    participant_id = auth.uid()::text OR
    -- Researchers can delete recordings for their studies
    study_id IN (
      SELECT id FROM studies WHERE created_by = auth.uid()::text
    ) OR
    -- Admins can delete all recordings
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_recordings_updated_at ON recordings;
CREATE TRIGGER update_recordings_updated_at
    BEFORE UPDATE ON recordings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert sample recording for testing (optional)
INSERT INTO recordings (
  id,
  session_id,
  study_id,
  participant_id,
  status,
  duration,
  mime_type,
  recording_options,
  created_at,
  updated_at
) VALUES (
  'rec_sample_001',
  'session_001',
  'study_001',
  'participant_001',
  'completed',
  120,
  'video/webm',
  '{"screen": true, "audio": false, "quality": "medium"}',
  NOW(),
  NOW()
) ON CONFLICT (id) DO NOTHING;
