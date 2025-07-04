-- User Interactions and Analytics Database Migration
-- Apply this script in Supabase SQL Editor
-- This creates tables for storing user interactions and processed analytics

-- =============================================================================
-- 1. CREATE USER INTERACTIONS TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS user_interactions (
  id VARCHAR(255) PRIMARY KEY,
  session_id VARCHAR(255) NOT NULL,
  interaction_type VARCHAR(100) NOT NULL, -- 'mouse_move', 'click', 'scroll', 'keypress', etc.
  timestamp INTEGER NOT NULL, -- Milliseconds since recording start
  data JSONB NOT NULL, -- Interaction-specific data (coordinates, target, etc.)
  url TEXT, -- Page URL when interaction occurred
  user_agent TEXT, -- Browser user agent
  recorded_at TIMESTAMP WITH TIME ZONE, -- When the interaction was recorded
  uploaded_at TIMESTAMP WITH TIME ZONE, -- When the interaction was uploaded
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- 2. CREATE SESSION ANALYTICS TABLE (Processed Data)
-- =============================================================================

CREATE TABLE IF NOT EXISTS session_analytics (
  id SERIAL PRIMARY KEY,
  session_id VARCHAR(255) NOT NULL UNIQUE,
  heatmap_data JSONB, -- Processed heatmap coordinates
  click_path JSONB, -- Sequential click data
  scroll_data JSONB, -- Scroll behavior analysis
  metrics JSONB, -- Session metrics (duration, interaction counts, etc.)
  processed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- 3. CREATE STUDY ANALYTICS TABLE (Aggregated Data)
-- =============================================================================

CREATE TABLE IF NOT EXISTS study_analytics (
  id SERIAL PRIMARY KEY,
  study_id VARCHAR(255) NOT NULL UNIQUE,
  aggregated_heatmap JSONB, -- Combined heatmap data from all sessions
  common_click_paths JSONB, -- Most common user paths
  average_metrics JSONB, -- Average session duration, clicks, etc.
  participant_count INTEGER DEFAULT 0,
  session_count INTEGER DEFAULT 0,
  last_processed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- 4. CREATE INDEXES FOR PERFORMANCE
-- =============================================================================

-- User Interactions Indexes
CREATE INDEX IF NOT EXISTS idx_user_interactions_session_id ON user_interactions(session_id);
CREATE INDEX IF NOT EXISTS idx_user_interactions_type ON user_interactions(interaction_type);
CREATE INDEX IF NOT EXISTS idx_user_interactions_timestamp ON user_interactions(timestamp);
CREATE INDEX IF NOT EXISTS idx_user_interactions_created_at ON user_interactions(created_at);

-- Session Analytics Indexes
CREATE INDEX IF NOT EXISTS idx_session_analytics_session_id ON session_analytics(session_id);
CREATE INDEX IF NOT EXISTS idx_session_analytics_processed_at ON session_analytics(processed_at);

-- Study Analytics Indexes
CREATE INDEX IF NOT EXISTS idx_study_analytics_study_id ON study_analytics(study_id);
CREATE INDEX IF NOT EXISTS idx_study_analytics_processed_at ON study_analytics(last_processed_at);

-- =============================================================================
-- 5. CREATE TRIGGERS FOR AUTOMATIC TIMESTAMP UPDATES
-- =============================================================================

-- User Interactions Trigger
DROP TRIGGER IF EXISTS update_user_interactions_updated_at ON user_interactions;
CREATE TRIGGER update_user_interactions_updated_at
    BEFORE UPDATE ON user_interactions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Session Analytics Trigger
DROP TRIGGER IF EXISTS update_session_analytics_updated_at ON session_analytics;
CREATE TRIGGER update_session_analytics_updated_at
    BEFORE UPDATE ON session_analytics
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Study Analytics Trigger
DROP TRIGGER IF EXISTS update_study_analytics_updated_at ON study_analytics;
CREATE TRIGGER update_study_analytics_updated_at
    BEFORE UPDATE ON study_analytics
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- 6. ENABLE ROW LEVEL SECURITY (RLS)
-- =============================================================================

ALTER TABLE user_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_analytics ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- 7. CREATE RLS POLICIES FOR USER INTERACTIONS
-- =============================================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their interaction data" ON user_interactions;
DROP POLICY IF EXISTS "Users can create interaction data" ON user_interactions;
DROP POLICY IF EXISTS "Users can update their interaction data" ON user_interactions;
DROP POLICY IF EXISTS "Users can delete their interaction data" ON user_interactions;

-- Policy: Users can only see interactions for their sessions
CREATE POLICY "Users can view their interaction data" ON user_interactions
  FOR SELECT USING (
    session_id IN (
      SELECT id FROM recording_sessions 
      WHERE participant_id = auth.uid()::text 
      OR researcher_id = auth.uid()::text
      OR study_id IN (
        SELECT id FROM studies WHERE created_by = auth.uid()::text
      )
    ) OR
    -- Admins can see all interactions
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Policy: Users can only create interactions for their sessions
CREATE POLICY "Users can create interaction data" ON user_interactions
  FOR INSERT WITH CHECK (
    session_id IN (
      SELECT id FROM recording_sessions 
      WHERE participant_id = auth.uid()::text 
      OR researcher_id = auth.uid()::text
    )
  );

-- Policy: Users can only update their own interactions (limited use case)
CREATE POLICY "Users can update their interaction data" ON user_interactions
  FOR UPDATE USING (
    session_id IN (
      SELECT id FROM recording_sessions 
      WHERE participant_id = auth.uid()::text 
      OR researcher_id = auth.uid()::text
    ) OR
    -- Admins can update all interactions
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Policy: Users can only delete their own interactions
CREATE POLICY "Users can delete their interaction data" ON user_interactions
  FOR DELETE USING (
    session_id IN (
      SELECT id FROM recording_sessions 
      WHERE participant_id = auth.uid()::text 
      OR researcher_id = auth.uid()::text
    ) OR
    -- Admins can delete all interactions
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- =============================================================================
-- 8. CREATE RLS POLICIES FOR SESSION ANALYTICS
-- =============================================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view session analytics" ON session_analytics;
DROP POLICY IF EXISTS "Users can create session analytics" ON session_analytics;
DROP POLICY IF EXISTS "Users can update session analytics" ON session_analytics;
DROP POLICY IF EXISTS "Users can delete session analytics" ON session_analytics;

-- Policy: Users can only see analytics for their sessions
CREATE POLICY "Users can view session analytics" ON session_analytics
  FOR SELECT USING (
    session_id IN (
      SELECT id FROM recording_sessions 
      WHERE participant_id = auth.uid()::text 
      OR researcher_id = auth.uid()::text
      OR study_id IN (
        SELECT id FROM studies WHERE created_by = auth.uid()::text
      )
    ) OR
    -- Admins can see all analytics
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Policy: Only system and researchers can create analytics
CREATE POLICY "Users can create session analytics" ON session_analytics
  FOR INSERT WITH CHECK (
    session_id IN (
      SELECT id FROM recording_sessions 
      WHERE researcher_id = auth.uid()::text
      OR study_id IN (
        SELECT id FROM studies WHERE created_by = auth.uid()::text
      )
    ) OR
    -- Admins can create all analytics
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Policy: Only system and researchers can update analytics
CREATE POLICY "Users can update session analytics" ON session_analytics
  FOR UPDATE USING (
    session_id IN (
      SELECT id FROM recording_sessions 
      WHERE researcher_id = auth.uid()::text
      OR study_id IN (
        SELECT id FROM studies WHERE created_by = auth.uid()::text
      )
    ) OR
    -- Admins can update all analytics
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Policy: Only system and researchers can delete analytics
CREATE POLICY "Users can delete session analytics" ON session_analytics
  FOR DELETE USING (
    session_id IN (
      SELECT id FROM recording_sessions 
      WHERE researcher_id = auth.uid()::text
      OR study_id IN (
        SELECT id FROM studies WHERE created_by = auth.uid()::text
      )
    ) OR
    -- Admins can delete all analytics
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- =============================================================================
-- 9. CREATE RLS POLICIES FOR STUDY ANALYTICS
-- =============================================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view study analytics" ON study_analytics;
DROP POLICY IF EXISTS "Users can create study analytics" ON study_analytics;
DROP POLICY IF EXISTS "Users can update study analytics" ON study_analytics;
DROP POLICY IF EXISTS "Users can delete study analytics" ON study_analytics;

-- Policy: Users can only see analytics for their studies
CREATE POLICY "Users can view study analytics" ON study_analytics
  FOR SELECT USING (
    study_id IN (
      SELECT id FROM studies WHERE created_by = auth.uid()::text
    ) OR
    -- Admins can see all study analytics
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Policy: Only researchers and admins can create study analytics
CREATE POLICY "Users can create study analytics" ON study_analytics
  FOR INSERT WITH CHECK (
    study_id IN (
      SELECT id FROM studies WHERE created_by = auth.uid()::text
    ) OR
    -- Admins can create all study analytics
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Policy: Only researchers and admins can update study analytics
CREATE POLICY "Users can update study analytics" ON study_analytics
  FOR UPDATE USING (
    study_id IN (
      SELECT id FROM studies WHERE created_by = auth.uid()::text
    ) OR
    -- Admins can update all study analytics
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Policy: Only researchers and admins can delete study analytics
CREATE POLICY "Users can delete study analytics" ON study_analytics
  FOR DELETE USING (
    study_id IN (
      SELECT id FROM studies WHERE created_by = auth.uid()::text
    ) OR
    -- Admins can delete all study analytics
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- =============================================================================
-- 10. INSERT SAMPLE DATA FOR TESTING (Optional)
-- =============================================================================

-- Sample user interactions
INSERT INTO user_interactions (
  id,
  session_id,
  interaction_type,
  timestamp,
  data,
  url,
  recorded_at,
  uploaded_at
) VALUES 
(
  'int_test_001',
  'session_test_001',
  'click',
  1500,
  '{"x": 100, "y": 200, "button": 0, "target": {"tagName": "BUTTON", "textContent": "Submit"}}',
  'https://example.com/test',
  NOW(),
  NOW()
),
(
  'int_test_002',
  'session_test_001',
  'mouse_move',
  2000,
  '{"x": 150, "y": 250, "viewport": {"width": 1920, "height": 1080}}',
  'https://example.com/test',
  NOW(),
  NOW()
),
(
  'int_test_003',
  'session_test_001',
  'scroll',
  2500,
  '{"scrollX": 0, "scrollY": 300}',
  'https://example.com/test',
  NOW(),
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- Sample session analytics
INSERT INTO session_analytics (
  session_id,
  heatmap_data,
  click_path,
  scroll_data,
  metrics,
  processed_at
) VALUES (
  'session_test_001',
  '{"points": [{"x": 100, "y": 200, "intensity": 3}, {"x": 150, "y": 250, "intensity": 1}], "totalPoints": 2}',
  '{"clicks": [{"x": 100, "y": 200, "timestamp": 1500}], "totalClicks": 1}',
  '{"scrollEvents": [{"x": 0, "y": 300, "timestamp": 2500}], "maxScrollY": 300}',
  '{"duration": 3000, "totalInteractions": 3, "interactionsPerSecond": 1}',
  NOW()
) ON CONFLICT (session_id) DO NOTHING;

-- =============================================================================
-- 11. VERIFICATION QUERIES
-- =============================================================================

-- Verify tables were created
SELECT 'user_interactions' as table_name, COUNT(*) as row_count FROM user_interactions
UNION ALL
SELECT 'session_analytics' as table_name, COUNT(*) as row_count FROM session_analytics
UNION ALL
SELECT 'study_analytics' as table_name, COUNT(*) as row_count FROM study_analytics;

-- =============================================================================
-- MIGRATION COMPLETE
-- =============================================================================
-- 
-- Tables created:
-- - user_interactions: Stores individual user interaction events
-- - session_analytics: Stores processed analytics for each session
-- - study_analytics: Stores aggregated analytics across all sessions in a study
--
-- Features implemented:
-- - Row Level Security (RLS) for data access control
-- - Automatic timestamp updates via triggers
-- - Performance indexes for common queries
-- - Sample data for testing
--
-- Next steps:
-- 1. Test the interactions API endpoints
-- 2. Verify user interaction tracking in the frontend
-- 3. Test analytics processing and heatmap generation
-- =============================================================================
