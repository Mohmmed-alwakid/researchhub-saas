-- Initialize Points for Test Accounts
-- Run this SQL in Supabase SQL Editor to set up points for testing

-- Create points for researcher test account (replace with actual user ID)
-- You can get the user ID from Supabase Auth > Users section

-- Example queries (replace 'ACTUAL_USER_ID' with real IDs from Supabase dashboard):

-- 1. Researcher Account (1000 points)
INSERT INTO points_balance (user_id, total_points, available_points, used_points, expired_points)
VALUES ('RESEARCHER_USER_ID_HERE', 1000, 1000, 0, 0)
ON CONFLICT (user_id) 
DO UPDATE SET 
  total_points = 1000,
  available_points = 1000,
  used_points = 0,
  expired_points = 0,
  last_updated = NOW();

-- 2. Admin Account (9999 points)  
INSERT INTO points_balance (user_id, total_points, available_points, used_points, expired_points)
VALUES ('ADMIN_USER_ID_HERE', 9999, 9999, 0, 0)
ON CONFLICT (user_id) 
DO UPDATE SET 
  total_points = 9999,
  available_points = 9999,
  used_points = 0,
  expired_points = 0,
  last_updated = NOW();

-- 3. Participant Account (0 points - will earn through studies)
INSERT INTO points_balance (user_id, total_points, available_points, used_points, expired_points)
VALUES ('PARTICIPANT_USER_ID_HERE', 0, 0, 0, 0)
ON CONFLICT (user_id) 
DO UPDATE SET 
  total_points = 0,
  available_points = 0,
  used_points = 0,
  expired_points = 0,
  last_updated = NOW();

-- 4. Add transaction records
INSERT INTO points_transactions (user_id, type, amount, description)
VALUES 
  ('RESEARCHER_USER_ID_HERE', 'admin_assigned', 1000, 'Initial researcher account setup'),
  ('ADMIN_USER_ID_HERE', 'admin_assigned', 9999, 'Initial admin account setup');

-- Instructions:
-- 1. Go to Supabase Dashboard > Authentication > Users
-- 2. Find the User IDs for your test accounts:
--    - abwanwr77+researcher@gmail.com
--    - abwanwr77+admin@gmail.com  
--    - abwanwr77+participant@gmail.com
-- 3. Replace the placeholder IDs above with actual UUIDs
-- 4. Run this SQL in Supabase Dashboard > SQL Editor
