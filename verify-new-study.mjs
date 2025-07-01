import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wxpwxzdgdvinlbtnbgdf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4cHd4emRnZHZpbmxidG5iZ2RmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAxOTk1ODAsImV4cCI6MjA2NTc3NTU4MH0.YMai9p4VQMbdqmc_9uWGeJ6nONHwuM9XT2FDTFy0aGk';

const supabase = createClient(supabaseUrl, supabaseKey);

const newStudyId = '78c00ccc-840c-4038-9f37-81cbdcf53f0c';

async function verifyNewStudy() {
  console.log(`🔍 Verifying new study: ${newStudyId}\n`);
  
  try {
    // Check if the study exists
    const { data: study, error } = await supabase
      .from('studies')
      .select('*')
      .eq('id', newStudyId)
      .single();
    
    if (error) {
      console.error('❌ Error fetching study:', error);
      return;
    }
    
    if (!study) {
      console.log('❌ Study not found in database!');
      return;
    }
    
    console.log('✅ Study found in database:');
    console.log('   Title:', study.title);
    console.log('   Status:', study.status);
    console.log('   Is Public:', study.is_public);
    console.log('   Researcher ID:', study.researcher_id);
    console.log('   Created At:', study.created_at);
    console.log('   Target Participants:', study.target_participants);
    
    // Check public studies criteria
    console.log('\n🔍 Public studies criteria check:');
    console.log('   Status === "active":', study.status === 'active');
    console.log('   Is Public === true:', study.is_public === true);
    
    const willAppearPublic = study.status === 'active' && study.is_public === true;
    console.log(`   Will appear in public studies: ${willAppearPublic ? '✅ YES' : '❌ NO'}`);
    
    if (!willAppearPublic) {
      console.log('\n🔧 Fixing study to make it public...');
      
      const { data: updatedStudy, error: updateError } = await supabase
        .from('studies')
        .update({
          status: 'active',
          is_public: true
        })
        .eq('id', newStudyId)
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
    
    console.log('\n📋 All studies in database:');
    const { data: allStudies, error: allError } = await supabase
      .from('studies')
      .select('id, title, status, is_public, created_at')
      .order('created_at', { ascending: false });
    
    if (allError) {
      console.error('❌ Error fetching all studies:', allError);
      return;
    }
    
    allStudies.forEach((s, index) => {
      const isPublic = s.status === 'active' && s.is_public === true;
      console.log(`   ${index + 1}. "${s.title}" (${s.status}, public: ${s.is_public}) ${isPublic ? '✅' : '❌'}`);
    });
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

verifyNewStudy();
