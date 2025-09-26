import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wxpwxzdgdvinlbtnbgdf.supabase.co';
const supabaseKey = ''PLACEHOLDER_SUPABASE_SERVICE_ROLE_KEY'';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTableStructure() {
  console.log('🔍 Checking table structures using SQL query...');
  
  try {
    // Check study_sessions table structure using raw SQL
    const { data, error } = await supabase.rpc('get_table_columns', {
      table_name: 'study_sessions'
    });
    
    if (error) {
      // If RPC doesn't exist, let's try a different approach
      console.log('RPC not available, trying direct select...');
      
      // Let's try to insert a test record to see what fields are required
      console.log('\n🧪 Testing study_sessions table fields...');
      
      const testSessionData = {
        study_id: 'test-id',
        participant_id: 'test-participant',
        application_id: 'test-application',
        status: 'active',
        started_at: new Date().toISOString(),
        session_data: {}
      };
      
      const { data: insertData, error: insertError } = await supabase
        .from('study_sessions')
        .insert(testSessionData)
        .select();
        
      if (insertError) {
        console.log('Insert error (tells us about table structure):', insertError);
      } else {
        console.log('✅ Test insert successful! Table structure is compatible.');
        console.log('Inserted data:', insertData);
        
        // Clean up test data
        if (insertData && insertData[0]) {
          await supabase
            .from('study_sessions')
            .delete()
            .eq('id', insertData[0].id);
          console.log('🧹 Cleaned up test data');
        }
      }
    } else {
      console.log('Table columns:', data);
    }
    
  } catch (error) {
    console.error('❌ Failed to check table structure:', error);
  }
}

checkTableStructure();
