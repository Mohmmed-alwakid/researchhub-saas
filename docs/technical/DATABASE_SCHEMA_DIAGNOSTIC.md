# 🔍 Database Schema Diagnostic

## ⚡ IMMEDIATE FIX: Run This Query First

Copy and paste this into your Supabase SQL Editor to check your current table structure:

```sql
-- Check what columns exist in your studies table
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'studies' AND table_schema = 'public'
ORDER BY ordinal_position;
```

```sql
-- Check what columns exist in your applications table  
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'applications' AND table_schema = 'public'
ORDER BY ordinal_position;
```

```sql
-- Check what columns exist in your users/profiles table
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name IN ('users', 'profiles') AND table_schema = 'public'
ORDER BY table_name, ordinal_position;
```

## 📋 After Running Diagnostic

Based on the results, I'll create the correct SQL indexes that match your actual database schema.

**Run the diagnostic queries above first, then I'll provide the corrected index commands!**

---

## 🎯 Expected Tables & Columns

Based on the ResearchHub codebase analysis, the expected structure should be:

### Studies Table:
- `id` (UUID)
- `creator_id` OR `researcher_id` (UUID) 
- `title` (TEXT)
- `status` (VARCHAR)
- `study_type` (VARCHAR)
- `created_at` (TIMESTAMP)

### Applications Table:
- `id` (UUID)
- `study_id` (UUID)
- `user_id` OR `participant_id` (UUID)
- `status` (VARCHAR)
- `created_at` (TIMESTAMP)

### Users/Profiles Table:
- `id` (UUID)
- `email` (VARCHAR)
- `role` (VARCHAR)
- `status` (VARCHAR)
- `created_at` (TIMESTAMP)

**Run the diagnostic queries to confirm your exact column names!**
