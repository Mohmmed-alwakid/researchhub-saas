-- RLS Policy Fix for Study Applications INSERT
-- Allow participants to insert their own applications

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can insert their own applications" ON study_applications;

-- Create new INSERT policy for participants to create applications
CREATE POLICY "Users can insert their own applications" 
ON study_applications 
FOR INSERT 
WITH CHECK (auth.uid() = participant_id);

-- Ensure RLS is enabled
ALTER TABLE study_applications ENABLE ROW LEVEL SECURITY;
