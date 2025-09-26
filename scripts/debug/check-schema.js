import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://wxpwxzdgdvinlbtnbgdf.supabase.co', 
  ''PLACEHOLDER_SUPABASE_SERVICE_ROLE_KEY''
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
