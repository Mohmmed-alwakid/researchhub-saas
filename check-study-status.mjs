import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wxpwxzdgdvinlbtnbgdf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4cHd4emRnZHZpbmxidG5iZ2RmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAxOTk1ODAsImV4cCI6MjA2NTc3NTU4MH0.YMai9p4VQMbdqmc_9uWGeJ6nONHwuM9XT2FDTFy0aGk';

const supabase = createClient(supabaseUrl, supabaseKey);

const targetStudyId = '2d827c4a-adda-4172-95e9-0b4074b62b59';

async function checkStudyStatus() {
  console.log(`🔍 Checking status of study: ${targetStudyId}\n`);
  
  try {
    // Get the specific study
    const { data: study, error } = await supabase
      .from('studies')
      .select('*')
      .eq('id', targetStudyId)
      .single();
    
    if (error) {
      console.error('❌ Error fetching study:', error);
      return;
    }
    
    if (!study) {
      console.log('❌ Study not found!');
      return;
    }
    
    console.log('✅ Found study:');
    console.log('   Title:', study.title);
    console.log('   Status:', study.status);
    console.log('   Is Public:', study.is_public);
    console.log('   Researcher ID:', study.researcher_id);
    console.log('   Created At:', study.created_at);
    console.log('   Settings:', JSON.stringify(study.settings, null, 2));
    
    // Check if it meets public studies criteria
    console.log('\n🔍 Public studies criteria check:');
    console.log('   Status === "active":', study.status === 'active');
    console.log('   Is Public === true:', study.is_public === true);
    
    if (study.status === 'active' && study.is_public === true) {
      console.log('✅ Study should appear in public studies!');
    } else {
      console.log('❌ Study will NOT appear in public studies because:');
      if (study.status !== 'active') {
        console.log(`   - Status is "${study.status}" (needs to be "active")`);
      }
      if (study.is_public !== true) {
        console.log(`   - Is Public is "${study.is_public}" (needs to be true)`);
      }
    }
    
    // Fix the study if needed
    if (study.status !== 'active' || study.is_public !== true) {
      console.log('\n🔧 Fixing study to make it public...');
      
      const { data: updatedStudy, error: updateError } = await supabase
        .from('studies')
        .update({
          status: 'active',
          is_public: true
        })
        .eq('id', targetStudyId)
        .select()
        .single();
      
      if (updateError) {
        console.error('❌ Error updating study:', updateError);
        return;
      }
      
      console.log('✅ Study updated successfully!');
      console.log('   New Status:', updatedStudy.status);
      console.log('   New Is Public:', updatedStudy.is_public);
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

checkStudyStatus();
