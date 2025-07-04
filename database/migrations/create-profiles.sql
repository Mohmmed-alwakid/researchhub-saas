-- SQL script to create missing profiles directly in Supabase
-- Run this in the Supabase SQL editor

-- First, check current profiles
SELECT * FROM profiles;

-- Insert missing test account profiles
INSERT INTO profiles (
  id,
  email,
  first_name,
  last_name,
  role,
  created_at,
  updated_at,
  is_email_verified
) VALUES 
(
  gen_random_uuid(),
  'abwanwr77+admin@gmail.com',
  'Admin',
  'User',
  'admin',
  now(),
  now(),
  true
),
(
  gen_random_uuid(), 
  'abwanwr77+Researcher@gmail.com',
  'Research',
  'User',
  'researcher',
  now(),
  now(),
  true
),
(
  gen_random_uuid(),
  'abwanwr77+participant@gmail.com', 
  'Participant',
  'User',
  'participant',
  now(),
  now(),
  true
);

-- Verify the profiles were created
SELECT 
  id,
  email,
  first_name,
  last_name,
  role,
  created_at
FROM profiles 
ORDER BY created_at DESC;
