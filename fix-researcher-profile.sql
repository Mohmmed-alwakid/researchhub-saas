-- Manual SQL script to create researcher profile
-- This bypasses RLS policies by being executed directly on the database

INSERT INTO profiles (
  id,
  email,
  first_name,
  last_name,
  role,
  created_at,
  updated_at
) VALUES (
  '4c3d798b-2975-4ec4-b9e2-c6f128b8a066',
  'abwanwr77+researcher@gmail.com',
  'Researcher',
  'tester',
  'researcher',
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  role = EXCLUDED.role,
  updated_at = NOW();

-- Also create profiles for the other test accounts if they don't exist
INSERT INTO profiles (
  id,
  email,
  first_name,
  last_name,
  role,
  created_at,
  updated_at
) VALUES 
  -- These are placeholder IDs - need to be replaced with actual user IDs from auth.users table
  ('00000000-0000-0000-0000-000000000001', 'abwanwr77+participant@gmail.com', 'Participant', 'tester', 'participant', NOW(), NOW()),
  ('00000000-0000-0000-0000-000000000002', 'abwanwr77+admin@gmail.com', 'Admin', 'tester', 'admin', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  role = EXCLUDED.role,
  updated_at = NOW();
