-- Study Blocks Database Migration
-- Created: June 25, 2025
-- Purpose: Move block storage from hardcoded data to database tables

-- 1. Block Templates Table - Reusable block definitions
CREATE TABLE IF NOT EXISTS block_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type VARCHAR(50) NOT NULL, -- welcome, context_screen, multiple_choice, etc.
    name VARCHAR(255) NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    category VARCHAR(50) DEFAULT 'basic',
    default_settings JSONB DEFAULT '{}',
    is_system BOOLEAN DEFAULT false, -- System blocks vs user-created
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Study Blocks Table - Actual blocks in studies
CREATE TABLE IF NOT EXISTS study_blocks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    study_id UUID NOT NULL REFERENCES studies(id) ON DELETE CASCADE,
    template_id UUID REFERENCES block_templates(id),
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    settings JSONB DEFAULT '{}',
    conditional_logic JSONB DEFAULT '{}', -- For branching and conditions
    order_index INTEGER NOT NULL,
    is_required BOOLEAN DEFAULT true,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(study_id, order_index)
);

-- 3. Block Responses Table - Participant responses
CREATE TABLE IF NOT EXISTS block_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES recording_sessions(id) ON DELETE CASCADE,
    block_id UUID NOT NULL REFERENCES study_blocks(id) ON DELETE CASCADE,
    participant_id UUID NOT NULL REFERENCES auth.users(id),
    response_data JSONB NOT NULL,
    metadata JSONB DEFAULT '{}',
    started_at TIMESTAMP WITH TIME ZONE NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE,
    time_spent_seconds INTEGER,
    interaction_count INTEGER DEFAULT 0,
    is_complete BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Block Analytics Table - Detailed interaction tracking
CREATE TABLE IF NOT EXISTS block_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    response_id UUID NOT NULL REFERENCES block_responses(id) ON DELETE CASCADE,
    session_id UUID NOT NULL REFERENCES recording_sessions(id) ON DELETE CASCADE,
    block_id UUID NOT NULL REFERENCES study_blocks(id) ON DELETE CASCADE,
    participant_id UUID NOT NULL REFERENCES auth.users(id),
    event_type VARCHAR(50) NOT NULL, -- view, interact, complete, skip, error
    event_data JSONB DEFAULT '{}',
    timestamp_ms BIGINT NOT NULL, -- Precise timing
    sequence_number INTEGER NOT NULL, -- Order of events
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Block Conditions Table - For advanced conditional logic
CREATE TABLE IF NOT EXISTS block_conditions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    block_id UUID NOT NULL REFERENCES study_blocks(id) ON DELETE CASCADE,
    condition_type VARCHAR(50) NOT NULL, -- show_if, hide_if, skip_if, branch_to
    condition_logic JSONB NOT NULL, -- The actual condition logic
    target_block_id UUID REFERENCES study_blocks(id), -- For branching
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_study_blocks_study_id ON study_blocks(study_id);
CREATE INDEX IF NOT EXISTS idx_study_blocks_order ON study_blocks(study_id, order_index);
CREATE INDEX IF NOT EXISTS idx_block_responses_session ON block_responses(session_id);
CREATE INDEX IF NOT EXISTS idx_block_responses_block ON block_responses(block_id);
CREATE INDEX IF NOT EXISTS idx_block_responses_participant ON block_responses(participant_id);
CREATE INDEX IF NOT EXISTS idx_block_analytics_response ON block_analytics(response_id);
CREATE INDEX IF NOT EXISTS idx_block_analytics_session ON block_analytics(session_id);
CREATE INDEX IF NOT EXISTS idx_block_analytics_event_type ON block_analytics(event_type);
CREATE INDEX IF NOT EXISTS idx_block_analytics_timestamp ON block_analytics(timestamp_ms);
CREATE INDEX IF NOT EXISTS idx_block_conditions_block ON block_conditions(block_id);

-- Insert default block templates
INSERT INTO block_templates (type, name, description, icon, category, default_settings, is_system) VALUES
-- Basic blocks
('welcome', 'Welcome Screen', 'Introduction and study overview', 'hand-wave', 'basic', '{"message": "Welcome to our study!", "showLogo": true, "backgroundColor": "#f8fafc"}', true),
('context_screen', 'Context Screen', 'Instructions and context', 'info', 'basic', '{"content": "Study instructions will appear here", "duration": "Take your time"}', true),
('thank_you', 'Thank You', 'Study completion message', 'heart', 'basic', '{"message": "Thank you for participating!", "showCompensation": false}', true),

-- Question blocks
('multiple_choice', 'Multiple Choice', 'Single or multiple selection questions', 'list', 'questions', '{"question": "Your question here", "options": [], "allowMultiple": false}', true),
('open_question', 'Open Question', 'Free text response', 'message-square', 'questions', '{"question": "Your question here", "placeholder": "Type your answer...", "minLength": 10}', true),
('opinion_scale', 'Opinion Scale', 'Rating and scale questions', 'star', 'questions', '{"question": "Rate your experience", "scaleType": "star", "minValue": 1, "maxValue": 5}', true),
('yes_no', 'Yes/No Question', 'Binary choice questions', 'check-x', 'questions', '{"question": "Your yes/no question", "yesText": "Yes", "noText": "No"}', true),

-- Interactive blocks
('live_website_test', 'Website Test', 'Interactive website testing', 'globe', 'interactive', '{"url": "", "tasks": [], "recordScreen": true}', true),
('image_upload', 'Image Upload', 'Collect images from participants', 'image', 'interactive', '{"prompt": "Upload an image", "maxFiles": 1, "acceptedTypes": ["image/*"]}', true),
('file_upload', 'File Upload', 'Collect files from participants', 'file', 'interactive', '{"prompt": "Upload a file", "maxFiles": 1, "acceptedTypes": ["*/*"]}', true),

-- Advanced blocks
('conditional_branch', 'Conditional Branch', 'Logic-based routing', 'git-branch', 'advanced', '{"conditions": [], "defaultTarget": null}', true),
('ai_follow_up', 'AI Follow-up', 'AI-powered follow-up questions', 'brain', 'advanced', '{"baseQuestion": "", "followUpCount": 3, "aiModel": "gpt-3.5-turbo"}', true),
('card_sort', 'Card Sort', 'Information architecture testing', 'layout-grid', 'advanced', '{"items": [], "categories": [], "instructions": "Sort the cards"}', true),
('tree_test', 'Tree Test', 'Navigation and findability', 'tree-pine', 'advanced', '{"tree": {}, "tasks": [], "instructions": "Find the item"}', true),
('five_second_test', '5-Second Test', 'First impression testing', 'clock', 'advanced', '{"imageUrl": "", "duration": 5, "questions": []}', true)
ON CONFLICT DO NOTHING;

-- RLS Policies
ALTER TABLE block_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE block_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE block_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE block_conditions ENABLE ROW LEVEL SECURITY;

-- Block templates - readable by all authenticated users, manageable by admins
CREATE POLICY "Block templates are viewable by authenticated users" ON block_templates
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Block templates are manageable by admins" ON block_templates
    FOR ALL TO authenticated USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- Study blocks - manageable by study owners, viewable by participants with access
CREATE POLICY "Study blocks are manageable by study owners" ON study_blocks
    FOR ALL TO authenticated USING (
        EXISTS (
            SELECT 1 FROM studies s
            JOIN user_profiles up ON s.researcher_id = up.user_id
            WHERE s.id = study_blocks.study_id 
            AND up.user_id = auth.uid()
            AND up.role IN ('admin', 'researcher')
        )
    );

CREATE POLICY "Study blocks are viewable by participants" ON study_blocks
    FOR SELECT TO authenticated USING (
        EXISTS (
            SELECT 1 FROM recording_sessions rs
            JOIN studies s ON rs.study_id = s.id
            WHERE s.id = study_blocks.study_id 
            AND rs.participant_id = auth.uid()
        )
    );

-- Block responses - participants can manage their own responses
CREATE POLICY "Participants can manage their own block responses" ON block_responses
    FOR ALL TO authenticated USING (participant_id = auth.uid());

CREATE POLICY "Researchers can view responses for their studies" ON block_responses
    FOR SELECT TO authenticated USING (
        EXISTS (
            SELECT 1 FROM study_blocks sb
            JOIN studies s ON sb.study_id = s.id
            JOIN user_profiles up ON s.researcher_id = up.user_id
            WHERE sb.id = block_responses.block_id
            AND up.user_id = auth.uid()
            AND up.role IN ('admin', 'researcher')
        )
    );

-- Block analytics - similar to responses
CREATE POLICY "Participants can create their own analytics" ON block_analytics
    FOR INSERT TO authenticated WITH CHECK (participant_id = auth.uid());

CREATE POLICY "Researchers can view analytics for their studies" ON block_analytics
    FOR SELECT TO authenticated USING (
        EXISTS (
            SELECT 1 FROM study_blocks sb
            JOIN studies s ON sb.study_id = s.id
            JOIN user_profiles up ON s.researcher_id = up.user_id
            WHERE sb.id = block_analytics.block_id
            AND up.user_id = auth.uid()
            AND up.role IN ('admin', 'researcher')
        )
    );

-- Block conditions - manageable by study owners
CREATE POLICY "Block conditions are manageable by study owners" ON block_conditions
    FOR ALL TO authenticated USING (
        EXISTS (
            SELECT 1 FROM study_blocks sb
            JOIN studies s ON sb.study_id = s.id
            JOIN user_profiles up ON s.researcher_id = up.user_id
            WHERE sb.id = block_conditions.block_id
            AND up.user_id = auth.uid()
            AND up.role IN ('admin', 'researcher')
        )
    );

-- Add helpful functions
CREATE OR REPLACE FUNCTION get_study_block_sequence(study_uuid UUID)
RETURNS TABLE (
    block_id UUID,
    block_type VARCHAR,
    title VARCHAR,
    order_index INTEGER,
    conditions JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        sb.id,
        sb.type,
        sb.title,
        sb.order_index,
        COALESCE(
            json_agg(
                json_build_object(
                    'type', bc.condition_type,
                    'logic', bc.condition_logic,
                    'target', bc.target_block_id
                )
            ) FILTER (WHERE bc.id IS NOT NULL),
            '[]'::json
        )::jsonb as conditions
    FROM study_blocks sb
    LEFT JOIN block_conditions bc ON sb.id = bc.block_id AND bc.is_active = true
    WHERE sb.study_id = study_uuid AND sb.is_active = true
    GROUP BY sb.id, sb.type, sb.title, sb.order_index
    ORDER BY sb.order_index;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add trigger to update updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_block_templates_updated_at BEFORE UPDATE ON block_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_study_blocks_updated_at BEFORE UPDATE ON study_blocks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_block_responses_updated_at BEFORE UPDATE ON block_responses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
