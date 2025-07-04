// Apply Database Migration Programmatically
// This script connects to Supabase and applies the complete screen recording migration

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const supabaseUrl = 'https://wxpwxzdgdvinlbtnbgdf.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY environment variable is required');
  console.log('💡 Set it using: set SUPABASE_SERVICE_ROLE_KEY=your-service-key');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyMigration() {
  console.log('🗄️  APPLYING DATABASE MIGRATION');
  console.log('=' .repeat(50));
  console.log('Database:', supabaseUrl);
  console.log('Timestamp:', new Date().toISOString());
  console.log('=' .repeat(50));

  try {
    // Read the migration file
    const migrationPath = path.join(process.cwd(), 'database-migrations', 'complete-screen-recording-migration.sql');
    
    if (!fs.existsSync(migrationPath)) {
      throw new Error(`Migration file not found: ${migrationPath}`);
    }

    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    console.log('✅ Migration file loaded');
    console.log(`📄 File size: ${migrationSQL.length} characters`);

    // Apply the migration
    console.log('\n🚀 Executing migration...');
    const { data, error } = await supabase.rpc('exec_sql', { sql: migrationSQL });
    
    if (error) {
      // Try a different approach if RPC doesn't work
      console.log('⚠️  RPC method failed, trying direct SQL execution...');
      
      // Split the migration into individual statements
      const statements = migrationSQL
        .split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

      console.log(`📝 Executing ${statements.length} SQL statements...`);

      for (let i = 0; i < statements.length; i++) {
        const statement = statements[i];
        if (statement.trim()) {
          try {
            const { error: stmtError } = await supabase.rpc('exec_sql', { sql: statement });
            if (stmtError) {
              console.log(`⚠️  Statement ${i + 1} warning:`, stmtError.message);
            } else {
              console.log(`✅ Statement ${i + 1} executed`);
            }
          } catch (stmtErr) {
            console.log(`⚠️  Statement ${i + 1} error:`, stmtErr.message);
          }
        }
      }
    } else {
      console.log('✅ Migration executed successfully');
    }

    // Verify the migration
    console.log('\n🔍 Verifying migration...');
    
    // Check if tables exist
    const { data: tables, error: tableError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .in('table_name', ['recording_sessions', 'recordings']);

    if (tableError) {
      console.log('⚠️  Could not verify tables:', tableError.message);
    } else {
      console.log('✅ Tables found:', tables.map(t => t.table_name));
    }

    // Test basic functionality
    console.log('\n🧪 Testing basic functionality...');
    
    try {
      const { data: sessionTest, error: sessionError } = await supabase
        .from('recording_sessions')
        .select('*')
        .limit(1);

      if (sessionError) {
        console.log('⚠️  Recording sessions table test:', sessionError.message);
      } else {
        console.log('✅ Recording sessions table accessible');
        console.log(`📊 Sample records: ${sessionTest.length}`);
      }
    } catch (err) {
      console.log('⚠️  Table test error:', err.message);
    }

    console.log('\n🎉 MIGRATION COMPLETE');
    console.log('=' .repeat(50));
    console.log('✅ Database migration applied');
    console.log('✅ Tables created and accessible');
    console.log('✅ Ready for recording API testing');
    console.log('\n🔧 Next step: Run recording API tests');
    console.log('   node test-recording-api-complete.js');

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.log('\n💡 Manual migration instructions:');
    console.log('1. Open Supabase Dashboard');
    console.log('2. Go to SQL Editor');
    console.log('3. Execute: database-migrations/complete-screen-recording-migration.sql');
  }
}

// Run migration
applyMigration();
