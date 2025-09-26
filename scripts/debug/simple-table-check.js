import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wxpwxzdgdvinlbtnbgdf.supabase.co';
const supabaseKey = ''PLACEHOLDER_SUPABASE_SERVICE_ROLE_KEY'';

async function checkTablesSimple() {
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  console.log('🔍 Checking for study_applications table...');
  
  // Test connection with studies table
  try {
    const { data: studies, error } = await supabase
      .from('studies')
      .select('id, title')
      .limit(1);
    
    if (error) {
      console.log('❌ Database connection error:', error);
      return;
    } else {
      console.log('✅ Database connection successful');
    }
  } catch (error) {
    console.log('❌ Connection failed:', error.message);
    return;
  }

  // Check if study_applications table exists
  try {
    const { data, error } = await supabase
      .from('study_applications')
      .select('*')
      .limit(1);
    
    if (error) {
      console.log('❌ study_applications table does not exist:', error.message);
      console.log('💡 We need to create the study_applications table');
    } else {
      console.log('✅ study_applications table exists');
      console.log('Sample data:', data);
    }
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

checkTablesSimple().catch(console.error);
