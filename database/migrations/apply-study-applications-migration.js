import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const supabaseUrl = 'https://wxpwxzdgdvinlbtnbgdf.supabase.co';
const supabaseServiceKey = ''PLACEHOLDER_SUPABASE_SERVICE_ROLE_KEY'';

async function applyStudyApplicationsMigration() {
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  console.log('🚀 Applying study_applications table migration...');
  
  try {
    // Read the migration SQL file
    const migrationSQL = fs.readFileSync('study-applications-migration.sql', 'utf8');
    
    // Execute the migration using RPC
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: migrationSQL
    });
    
    if (error) {
      console.error('❌ Migration failed via RPC:', error);
      
      // Try alternative approach: break into smaller chunks
      console.log('🔄 Trying alternative approach...');
      
      // Split SQL into individual statements
      const statements = migrationSQL
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0);
      
      console.log(`📝 Executing ${statements.length} SQL statements...`);
      
      for (let i = 0; i < statements.length; i++) {
        const statement = statements[i];
        console.log(`⚡ Executing statement ${i + 1}/${statements.length}:`);
        console.log(statement.substring(0, 100) + '...');
        
        try {
          const { error: stmtError } = await supabase.rpc('exec_sql', {
            sql: statement + ';'
          });
          
          if (stmtError) {
            console.error(`❌ Statement ${i + 1} failed:`, stmtError);
            // Continue with other statements
          } else {
            console.log(`✅ Statement ${i + 1} executed successfully`);
          }
        } catch (err) {
          console.error(`❌ Statement ${i + 1} error:`, err.message);
        }
      }
      
    } else {
      console.log('✅ Migration applied successfully via RPC');
    }
    
    // Verify the table was created
    console.log('🔍 Verifying table creation...');
    const { data: verifyData, error: verifyError } = await supabase
      .from('study_applications')
      .select('*')
      .limit(1);
    
    if (verifyError) {
      console.error('❌ Table verification failed:', verifyError);
    } else {
      console.log('✅ study_applications table created successfully!');
    }
    
  } catch (error) {
    console.error('❌ Migration script error:', error);
  }
}

applyStudyApplicationsMigration().catch(console.error);
