-- COPY THIS SQL INTO SUPABASE DASHBOARD SQL EDITOR
-- Step 1: Copy everything from database-migrations/create-points-system.sql
-- Step 2: Copy everything from database-migrations/create-performance-monitoring.sql
-- Step 3: Execute both scripts

-- After running the migrations, verify tables exist with:
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('points_balance', 'points_transactions', 'study_costs', 'performance_issues', 'performance_metrics');

-- If you see 5 rows returned, the migration was successful!

-- Then test the points system with our test interface:
-- Open: points-system-integration-test.html
