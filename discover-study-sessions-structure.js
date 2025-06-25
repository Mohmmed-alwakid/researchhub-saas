import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wxpwxzdgdvinlbtnbgdf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4cHd4emRnZHZpbmxidG5iZ2RmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAxOTk1ODAsImV4cCI6MjA2NTc3NTU4MH0.YMai9p4VQMbdqmc_9uWGeJ6nONHwuM9XT2FDTFy0aGk';

const supabase = createClient(supabaseUrl, supabaseKey);

async function discoverTableStructure() {
  console.log('🔍 Discovering actual study_sessions table structure...');
  
  // Let's try different field combinations to figure out the real structure
  const possibleFields = [
    // Basic fields
    { id: 'uuid-test' },
    { study_id: 'test-study' },
    { participant_id: 'test-participant' },
    { user_id: 'test-user' },
    { session_id: 'test-session' },
    { status: 'active' },
    { started_at: new Date().toISOString() },
    { created_at: new Date().toISOString() },
    { updated_at: new Date().toISOString() },
    { session_data: {} },
    { data: {} },
    { recording_id: 'test-recording' },
    
    // Minimal test - just required fields
    {},
    
    // Try the fields from our API
    {
      study_id: 'test-study',
      participant_id: 'test-participant',
      status: 'active',
      started_at: new Date().toISOString(),
      session_data: {}
    },
    
    // Try without application_id
    {
      study_id: 'test-study',
      participant_id: 'test-participant',
      status: 'active',
      started_at: new Date().toISOString()
    }
  ];
  
  for (let i = 0; i < possibleFields.length; i++) {
    const testData = possibleFields[i];
    console.log(`\n🧪 Test ${i + 1}: Trying fields:`, Object.keys(testData));
    
    try {
      const { data, error } = await supabase
        .from('study_sessions')
        .insert(testData)
        .select();
        
      if (error) {
        console.log(`❌ Error: ${error.message}`);
        if (error.message.includes('column') && error.message.includes('does not exist')) {
          const missingColumn = error.message.match(/'([^']+)'/)?.[1];
          console.log(`   Missing column: ${missingColumn}`);
        }
      } else {
        console.log(`✅ SUCCESS! Valid structure found.`);
        console.log('   Inserted data:', data);
        
        // Clean up
        if (data && data[0] && data[0].id) {
          await supabase
            .from('study_sessions')
            .delete()
            .eq('id', data[0].id);
          console.log('   🧹 Cleaned up test data');
        }
        break; // Stop on first success
      }
    } catch (err) {
      console.log(`❌ Exception:`, err.message);
    }
  }
}

discoverTableStructure();
