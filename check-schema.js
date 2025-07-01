import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://wxpwxzdgdvinlbtnbgdf.supabase.co', 
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4cHd4emRnZHZpbmxidG5iZ2RmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAxOTk1ODAsImV4cCI6MjA2NTc3NTU4MH0.YMai9p4VQMbdqmc_9uWGeJ6nONHwuM9XT2FDTFy0aGk'
);

async function checkSchema() {
  console.log('🔍 Checking database schema...\n');
  
  // Check study_blocks table
  console.log('📋 Testing study_blocks table...');
  const { data: blocksData, error: blocksError } = await supabase
    .from('study_blocks')
    .select('*')
    .limit(1);
  
  if (blocksError) {
    console.log('❌ study_blocks error:', blocksError.message);
  } else {
    console.log('✅ study_blocks accessible, sample data:', blocksData);
  }
  
  // Check studies table  
  console.log('\n📋 Testing studies table...');
  const { data: studiesData, error: studiesError } = await supabase
    .from('studies')
    .select('id, title, settings')
    .limit(1);
  
  if (studiesError) {
    console.log('❌ studies error:', studiesError.message);
  } else {
    console.log('✅ studies accessible, sample data:', studiesData);
  }
  
  // Test simple insert to study_blocks
  console.log('\n📋 Testing simple insert to study_blocks...');
  const testBlock = {
    study_id: '2fd69681-3a09-49c5-b110-a06d8834aee8',
    type: 'welcome',
    title: 'Test Block',
    description: 'Test description',
    settings: { test: true }
  };
  
  const { data: insertData, error: insertError } = await supabase
    .from('study_blocks')
    .insert(testBlock)
    .select();
    
  if (insertError) {
    console.log('❌ Insert error:', insertError.message);
  } else {
    console.log('✅ Insert successful:', insertData);
  }
}

checkSchema().catch(console.error);
