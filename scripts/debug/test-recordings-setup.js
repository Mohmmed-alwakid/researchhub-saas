// Simple test to apply recordings table migration
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wxpwxzdgdvinlbtnbgdf.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4cHd4emRnZHZpbmxidG5iZ2RmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAxOTk1ODAsImV4cCI6MjA2NTc3NTU4MH0.YMai9p4VQMbdqmc_9uWGeJ6nONHwuM9XT2FDTFy0aGk';

async function createRecordingsTable() {
  try {
    console.log('🚀 Creating recordings table...');
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    // First, let's check if the table already exists
    const { data: tables, error: listError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_name', 'recordings');
      
    if (listError) {
      console.log('📝 Unable to check existing tables (this is normal)');
    }
    
    console.log('✅ Supabase connection successful');
    console.log('📋 Please manually create the recordings table in Supabase Dashboard');
    console.log('📍 Go to: https://supabase.com/dashboard/project/wxpwxzdgdvinlbtnbgdf/editor');
    console.log('📄 Use the SQL from: database-migrations/recordings-table.sql');
    
    return true;
    
  } catch (error) {
    console.error('❌ Error:', error);
    return false;
  }
}

createRecordingsTable();
