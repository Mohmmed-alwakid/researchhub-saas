import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wxpwxzdgdvinlbtnbgdf.supabase.co';
const supabaseKey = ''PLACEHOLDER_SUPABASE_SERVICE_ROLE_KEY'';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkStudySessionsTable() {
  console.log('🔍 Checking study_sessions table structure...');
  
  try {
    // Try to select from the table to see if it exists
    const { data, error } = await supabase
      .from('study_sessions')
      .select('*')
      .limit(1);
    
    if (error) {
      console.log('❌ Error accessing study_sessions table:', error);
      console.log('This probably means the table does not exist.');
      
      // Let's also check what tables do exist
      console.log('\n🔍 Checking existing tables...');
      const { data: tables, error: tablesError } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public');
        
      if (tablesError) {
        console.log('Error checking tables:', tablesError);
      } else {
        console.log('Existing tables:', tables?.map(t => t.table_name));
      }
    } else {
      console.log('✅ study_sessions table exists!');
      console.log('Sample data (if any):', data);
      
      // Check table structure
      console.log('\n🔍 Checking table structure...');
      const { data: columns, error: columnsError } = await supabase
        .from('information_schema.columns')
        .select('column_name, data_type, is_nullable')
        .eq('table_name', 'study_sessions')
        .eq('table_schema', 'public');
        
      if (columnsError) {
        console.log('Error checking columns:', columnsError);
      } else {
        console.log('Table columns:');
        columns?.forEach(col => {
          console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
        });
      }
    }
    
  } catch (error) {
    console.error('❌ Failed to check study_sessions table:', error);
  }
}

checkStudySessionsTable();
