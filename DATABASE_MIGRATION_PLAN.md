/**
 * DATABASE INTEGRATION STRATEGY FOR RESEARCH-CONSOLIDATED.JS
 * 
 * CURRENT STATE:
 * - Uses in-memory studiesDatabase array (resets on server restart)
 * - Has basic CRUD operations for studies
 * - Returns data in format expected by frontend
 * 
 * MIGRATION PLAN:
 * 1. Replace in-memory studiesDatabase with Supabase queries
 * 2. Map database fields to expected API format
 * 3. Maintain backward compatibility with existing frontend
 * 4. Add proper error handling for database operations
 * 
 * DATABASE MAPPING:
 * In-Memory → Database
 * ---------------------
 * id (number) → id (uuid)
 * _id (string) → id (as string)
 * title → title
 * description → description
 * status → status (enum: draft/active/paused/completed/archived)
 * created_at → created_at
 * updated_at → updated_at
 * created_by → researcher_id (from auth)
 * type → settings.type (JSON field)
 * target_participants → target_participants
 * blocks → settings.blocks (JSON field)
 * compensation → settings.compensation (JSON field)
 * duration → settings.duration (JSON field)
 * difficulty → settings.difficulty (JSON field)
 * 
 * ACTIONS TO IMPLEMENT:
 * 1. get-studies: SELECT from studies table with proper filtering
 * 2. create-study: INSERT into studies table
 * 3. update-study: UPDATE studies table
 * 4. delete-study: DELETE from studies table (if needed)
 * 
 * COMPATIBILITY NOTES:
 * - Frontend expects both `id` (number) and `_id` (string)
 * - Frontend expects camelCase (`createdAt`) and snake_case (`created_at`)
 * - Need to handle UUID to number conversion for legacy compatibility
 * 
 */
