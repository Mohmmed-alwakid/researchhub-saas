-- Fix RLS Policies for study_applications table
-- This script ensures participants can insert their own applications

-- Enable RLS on the table
ALTER TABLE study_applications ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Participants can insert their own applications" ON study_applications;
DROP POLICY IF EXISTS "Participants can view their own applications" ON study_applications;
DROP POLICY IF EXISTS "Researchers can update applications" ON study_applications;

-- Create policy for participants to insert applications
CREATE POLICY "Participants can insert their own applications"
ON study_applications
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = participant_id);

-- Create policy for participants to view their own applications  
CREATE POLICY "Participants can view their own applications"
ON study_applications
FOR SELECT
TO authenticated
USING (auth.uid() = participant_id);

-- Create policy for researchers to update applications for their studies
CREATE POLICY "Researchers can update applications"
ON study_applications
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM studies s 
    WHERE s.id = study_applications.study_id 
    AND s.researcher_id = auth.uid()
  )
);

-- Create policy for researchers to view applications for their studies
CREATE POLICY "Researchers can view applications for their studies"
ON study_applications
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM studies s 
    WHERE s.id = study_applications.study_id 
    AND s.researcher_id = auth.uid()
  )
);

-- Verify policies were created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'study_applications';
