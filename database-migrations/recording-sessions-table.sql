-- Recording Sessions table for managing recording sessions
-- This will be created in Supabase alongside the recordings table

CREATE TABLE IF NOT EXISTS recording_sessions (
  id VARCHAR(255) PRIMARY KEY,
  study_id VARCHAR(255) NOT NULL,
  participant_id VARCHAR(255),
  researcher_id VARCHAR(255),
  status VARCHAR(50) DEFAULT 'active', -- 'active', 'completed', 'cancelled', 'failed'
  session_name VARCHAR(255),
  session_description TEXT,
  recording_settings JSONB, -- Screen recording configuration
  metadata JSONB, -- Additional session metadata
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_recording_sessions_study_id ON recording_sessions(study_id);
CREATE INDEX IF NOT EXISTS idx_recording_sessions_participant_id ON recording_sessions(participant_id);
CREATE INDEX IF NOT EXISTS idx_recording_sessions_researcher_id ON recording_sessions(researcher_id);
CREATE INDEX IF NOT EXISTS idx_recording_sessions_status ON recording_sessions(status);
CREATE INDEX IF NOT EXISTS idx_recording_sessions_created_at ON recording_sessions(created_at);

-- Row Level Security (RLS) policies
ALTER TABLE recording_sessions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own sessions or sessions for their studies
CREATE POLICY "Users can view their recording sessions" ON recording_sessions
  FOR SELECT USING (
    participant_id = auth.uid()::text OR
    researcher_id = auth.uid()::text OR
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

-- Policy: Users can only create sessions for themselves or their studies
CREATE POLICY "Users can create recording sessions" ON recording_sessions
  FOR INSERT WITH CHECK (
    participant_id = auth.uid()::text OR
    researcher_id = auth.uid()::text OR
    -- Researchers can create sessions for their studies
    study_id IN (
      SELECT id FROM studies WHERE created_by = auth.uid()::text
    )
  );

-- Policy: Users can only update their own sessions
CREATE POLICY "Users can update their recording sessions" ON recording_sessions
  FOR UPDATE USING (
    participant_id = auth.uid()::text OR
    researcher_id = auth.uid()::text OR
    -- Researchers can update sessions for their studies
    study_id IN (
      SELECT id FROM studies WHERE created_by = auth.uid()::text
    ) OR
    -- Admins can update all sessions
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Policy: Users can only delete their own sessions
CREATE POLICY "Users can delete their recording sessions" ON recording_sessions
  FOR DELETE USING (
    participant_id = auth.uid()::text OR
    researcher_id = auth.uid()::text OR
    -- Researchers can delete sessions for their studies
    study_id IN (
      SELECT id FROM studies WHERE created_by = auth.uid()::text
    ) OR
    -- Admins can delete all sessions
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Create trigger to automatically update updated_at for recording_sessions
DROP TRIGGER IF EXISTS update_recording_sessions_updated_at ON recording_sessions;
CREATE TRIGGER update_recording_sessions_updated_at
    BEFORE UPDATE ON recording_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert sample recording session for testing (optional)
INSERT INTO recording_sessions (
  id,
  study_id,
  participant_id,
  status,
  session_name,
  session_description,
  recording_settings,
  created_at,
  updated_at
) VALUES (
  'session_sample_001',
  'study_001',
  'participant_001',
  'active',
  'Sample Recording Session',
  'Test recording session for development',
  '{"screen": true, "audio": false, "quality": "medium", "fps": 30}',
  NOW(),
  NOW()
) ON CONFLICT (id) DO NOTHING;
