-- Study Applications Table Migration
-- Creates the study_applications table to track participant applications to studies

-- Create study_applications table
CREATE TABLE IF NOT EXISTS study_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    study_id UUID NOT NULL REFERENCES studies(id) ON DELETE CASCADE,
    participant_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'withdrawn')),
    application_data JSONB DEFAULT '{}',
    notes TEXT,
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    reviewed_by UUID REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    UNIQUE(study_id, participant_id) -- Prevent duplicate applications
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_study_applications_study_id ON study_applications(study_id);
CREATE INDEX IF NOT EXISTS idx_study_applications_participant_id ON study_applications(participant_id);
CREATE INDEX IF NOT EXISTS idx_study_applications_status ON study_applications(status);
CREATE INDEX IF NOT EXISTS idx_study_applications_applied_at ON study_applications(applied_at);

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language plpgsql;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_study_applications_updated_at ON study_applications;
CREATE TRIGGER update_study_applications_updated_at
    BEFORE UPDATE ON study_applications
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS (Row Level Security)
ALTER TABLE study_applications ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Participants can view their own applications
CREATE POLICY "Participants can view their own applications" ON study_applications
    FOR SELECT USING (participant_id = auth.uid());

-- Participants can insert their own applications
CREATE POLICY "Participants can apply to studies" ON study_applications
    FOR INSERT WITH CHECK (participant_id = auth.uid());

-- Participants can update their own applications (e.g., withdraw)
CREATE POLICY "Participants can update their own applications" ON study_applications
    FOR UPDATE USING (participant_id = auth.uid());

-- Researchers can view applications to their studies
CREATE POLICY "Researchers can view applications to their studies" ON study_applications
    FOR SELECT USING (
        study_id IN (
            SELECT id FROM studies WHERE researcher_id = auth.uid()
        )
    );

-- Researchers can update applications to their studies (review)
CREATE POLICY "Researchers can review applications to their studies" ON study_applications
    FOR UPDATE USING (
        study_id IN (
            SELECT id FROM studies WHERE researcher_id = auth.uid()
        )
    );

-- Admins can view all applications
CREATE POLICY "Admins can view all applications" ON study_applications
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

COMMENT ON TABLE study_applications IS 'Tracks participant applications to studies with full lifecycle management';
COMMENT ON COLUMN study_applications.status IS 'Application status: pending, accepted, rejected, withdrawn';
COMMENT ON COLUMN study_applications.application_data IS 'Additional application data as JSON (demographics, availability, etc.)';
COMMENT ON COLUMN study_applications.notes IS 'Researcher notes about the application';
