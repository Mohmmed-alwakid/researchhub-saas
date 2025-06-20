-- Complete Screen Recording Database Migration
-- Apply this script in Supabase SQL Editor
-- This creates all necessary tables, indexes, RLS policies, and triggers for screen recording functionality

-- =============================================================================
-- 1. CREATE RECORDING SESSIONS TABLE
-- =============================================================================

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

-- =============================================================================
-- 2. CREATE RECORDINGS TABLE
-- =============================================================================

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

-- =============================================================================
-- 3. CREATE INDEXES FOR PERFORMANCE
-- =============================================================================

-- Recording Sessions Indexes
CREATE INDEX IF NOT EXISTS idx_recording_sessions_study_id ON recording_sessions(study_id);
CREATE INDEX IF NOT EXISTS idx_recording_sessions_participant_id ON recording_sessions(participant_id);
CREATE INDEX IF NOT EXISTS idx_recording_sessions_researcher_id ON recording_sessions(researcher_id);
CREATE INDEX IF NOT EXISTS idx_recording_sessions_status ON recording_sessions(status);
CREATE INDEX IF NOT EXISTS idx_recording_sessions_created_at ON recording_sessions(created_at);

-- Recordings Indexes
CREATE INDEX IF NOT EXISTS idx_recordings_session_id ON recordings(session_id);
CREATE INDEX IF NOT EXISTS idx_recordings_study_id ON recordings(study_id);
CREATE INDEX IF NOT EXISTS idx_recordings_participant_id ON recordings(participant_id);
CREATE INDEX IF NOT EXISTS idx_recordings_status ON recordings(status);
CREATE INDEX IF NOT EXISTS idx_recordings_created_at ON recordings(created_at);

-- =============================================================================
-- 4. CREATE TIMESTAMP UPDATE FUNCTION (if not exists)
-- =============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- =============================================================================
-- 5. CREATE TRIGGERS FOR AUTOMATIC TIMESTAMP UPDATES
-- =============================================================================

-- Recording Sessions Trigger
DROP TRIGGER IF EXISTS update_recording_sessions_updated_at ON recording_sessions;
CREATE TRIGGER update_recording_sessions_updated_at
    BEFORE UPDATE ON recording_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Recordings Trigger
DROP TRIGGER IF EXISTS update_recordings_updated_at ON recordings;
CREATE TRIGGER update_recordings_updated_at
    BEFORE UPDATE ON recordings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- 6. ENABLE ROW LEVEL SECURITY (RLS)
-- =============================================================================

ALTER TABLE recording_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE recordings ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- 7. CREATE RLS POLICIES FOR RECORDING SESSIONS
-- =============================================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their recording sessions" ON recording_sessions;
DROP POLICY IF EXISTS "Users can create recording sessions" ON recording_sessions;
DROP POLICY IF EXISTS "Users can update their recording sessions" ON recording_sessions;
DROP POLICY IF EXISTS "Users can delete their recording sessions" ON recording_sessions;

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

-- =============================================================================
-- 8. CREATE RLS POLICIES FOR RECORDINGS
-- =============================================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own recordings" ON recordings;
DROP POLICY IF EXISTS "Users can create recordings for their sessions" ON recordings;
DROP POLICY IF EXISTS "Users can update their own recordings" ON recordings;
DROP POLICY IF EXISTS "Users can delete their own recordings" ON recordings;

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

-- =============================================================================
-- 9. INSERT SAMPLE DATA FOR TESTING (Optional)
-- =============================================================================

-- Sample recording session
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
  'session_test_001',
  'study_test_001',
  'participant_test_001',
  'active',
  'Test Recording Session',
  'Sample recording session for testing screen recording functionality',
  '{"screen": true, "audio": false, "quality": "medium", "fps": 30}',
  NOW(),
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- Sample recording
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
  'rec_test_001',
  'session_test_001',
  'study_test_001',
  'participant_test_001',
  'completed',
  120,
  'video/webm',
  '{"screen": true, "audio": false, "quality": "medium"}',
  NOW(),
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- 10. VERIFICATION QUERIES
-- =============================================================================

-- Verify tables were created
SELECT 'recording_sessions' as table_name, COUNT(*) as row_count FROM recording_sessions
UNION ALL
SELECT 'recordings' as table_name, COUNT(*) as row_count FROM recordings;

-- =============================================================================
-- MIGRATION COMPLETE
-- =============================================================================
-- 
-- Tables created:
-- - recording_sessions: Manages recording session lifecycle
-- - recordings: Stores actual recording data and metadata
--
-- Features implemented:
-- - Row Level Security (RLS) for data access control
-- - Automatic timestamp updates via triggers
-- - Performance indexes for common queries
-- - Sample data for testing
--
-- Next steps:
-- 1. Test the API endpoints with real database
-- 2. Verify recording upload and retrieval functionality
-- 3. Test RLS policies with different user roles
-- =============================================================================
