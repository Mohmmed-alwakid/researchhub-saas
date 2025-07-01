// Quick manual table creation for testing
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wxpwxzdgdvinlbtnbgdf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4cHd4emRnZHZpbmxidG5iZ2RmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAxOTk1ODAsImV4cCI6MjA2NTc3NTU4MH0.YMai9p4VQMbdqmc_9uWGeJ6nONHwuM9XT2FDTFy0aGk';

const supabase = createClient(supabaseUrl, supabaseKey);

async function createTestTable() {
  console.log('Creating minimal points_balance table for testing...');
  
  try {
    // Create a simple points_balance table 
    const { data, error } = await supabase.rpc('create_points_test_table');
    
    if (error) {
      console.log('RPC failed, trying direct SQL...');
      
      // Try with direct query
      const { data: queryData, error: queryError } = await supabase
        .from('points_balance')
        .select('*')
        .limit(1);
        
      if (queryError && queryError.code === '42P01') {
        console.log('Table definitely does not exist');
        console.log('🔧 Manual table creation required in Supabase dashboard');
        console.log('Or contact admin with proper service role key');
      } else {
        console.log('Table exists but had query error:', queryError);
      }
    } else {
      console.log('✅ Table creation successful');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

createTestTable();
