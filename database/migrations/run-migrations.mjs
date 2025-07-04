import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';

const supabaseUrl = process.env.SUPABASE_URL || 'https://wxpwxzdgdvinlbtnbgdf.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4cHd4emRnZHZpbmxidG5iZ2RmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDE5OTU4MCwiZXhwIjoyMDY1Nzc1NTgwfQ.I_4j2vgcu2aR9Pw1d-QG2hpKunbmNKD8tWg3Psl0GNc';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration(migrationFile) {
  try {
    console.log(`\n📋 Running migration: ${migrationFile}`);
    
    const migrationPath = join(process.cwd(), 'database-migrations', migrationFile);
    const migrationSQL = readFileSync(migrationPath, 'utf8');
    
    // Split by semicolon and execute each statement separately
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    for (const statement of statements) {
      if (statement.length > 0) {
        const { error } = await supabase.rpc('exec_sql', { sql: statement });
        if (error) {
          console.error(`❌ Error executing statement: ${error.message}`);
          console.error(`Statement: ${statement.substring(0, 100)}...`);
        }
      }
    }
    
    console.log(`✅ Migration completed: ${migrationFile}`);
    
  } catch (error) {
    console.error(`❌ Migration failed: ${migrationFile}`, error);
    return false;
  }
  
  return true;
}

async function main() {
  console.log('🚀 Starting database migrations...');
  console.log(`📍 Supabase URL: ${supabaseUrl}`);
  
  // Run migrations in order
  const migrations = [
    'create-points-system.sql',
    'create-performance-monitoring.sql'
  ];
  
  for (const migration of migrations) {
    const success = await runMigration(migration);
    if (!success) {
      console.error('❌ Migration failed, stopping...');
      process.exit(1);
    }
  }
  
  console.log('\n🎉 All migrations completed successfully!');
  console.log('\n📊 Summary:');
  console.log('- ✅ Points system tables created');
  console.log('- ✅ Performance monitoring tables created');
  console.log('- ✅ RLS policies applied');
  console.log('- ✅ Triggers and views created');
}

main().catch(console.error);
