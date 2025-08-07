/**
 * Run Collaboration Migration with Environment Variables
 */

// Set environment variables
process.env.SUPABASE_URL = 'https://wxpwxzdgdvinlbtnbgdf.supabase.co';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4cHd4emRnZHZpbmxidG5iZ2RmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDE5OTU4MCwiZXhwIjoyMDY1Nzc1NTgwfQ.8uf_3CJODn75Vw0ksQ36r2D9s2JC8pKY6uHLl9O_SdM';

// Import and run the migration
import { runMigration } from './database/migrations/apply-collaboration-migration.mjs';

runMigration();
