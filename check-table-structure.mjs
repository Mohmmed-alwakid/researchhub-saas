import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wxpwxzdgdvinlbtnbgdf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4cHd4emRnZHZpbmxidG5iZ2RmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAxOTk1ODAsImV4cCI6MjA2NTc3NTU4MH0.YMai9p4VQMbdqmc_9uWGeJ6nONHwuM9XT2FDTFy0aGk';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTableStructure() {
  console.log('🔍 Checking study_applications table structure...\n');
  
  try {
    // Try to get the first row to see the structure
    const { data: sample, error } = await supabase
      .from('study_applications')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('❌ Error fetching sample:', error);
      
      // Try inserting a minimal test record to see what's required
      console.log('\n🔧 Trying minimal insert to see required fields...');
      
      const { error: insertError } = await supabase
        .from('study_applications')
        .insert({
          study_id: '2fd69681-3a09-49c5-b110-a06d8834aee8'
        });
      
      if (insertError) {
        console.error('Insert error details:', insertError);
      }
      
      return;
    }
    
    if (sample && sample.length > 0) {
      console.log('✅ Sample record structure:');
      console.log(JSON.stringify(sample[0], null, 2));
      console.log('\n📋 Available columns:');
      Object.keys(sample[0]).forEach(key => {
        console.log(`   - ${key}`);
      });
    } else {
      console.log('📝 Table exists but is empty. Trying to insert test record...');
      
      const { error: insertError } = await supabase
        .from('study_applications')
        .insert({
          study_id: '2fd69681-3a09-49c5-b110-a06d8834aee8'
        });
      
      if (insertError) {
        console.error('❌ Insert error:', insertError);
      } else {
        console.log('✅ Basic insert successful');
      }
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

checkTableStructure();
