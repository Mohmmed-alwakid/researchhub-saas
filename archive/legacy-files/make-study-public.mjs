import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wxpwxzdgdvinlbtnbgdf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4cHd4emRnZHZpbmxidG5iZ2RmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAxOTk1ODAsImV4cCI6MjA2NTc3NTU4MH0.YMai9p4VQMbdqmc_9uWGeJ6nONHwuM9XT2FDTFy0aGk';

const supabase = createClient(supabaseUrl, supabaseKey);

async function makeStudyPublic() {
  console.log('=== Making Study Public for Testing ===');
  
  try {
    // Make the study public so we can apply to it
    const studyId = '99a0f9b1-bdfe-46b8-961a-97dc3d29fb98';
    const { data: studyUpdate, error: updateError } = await supabase
      .from('studies')
      .update({ is_public: true })
      .eq('id', studyId)
      .select();

    if (updateError) {
      console.error('❌ Error making study public:', updateError);
    } else {
      console.log('✅ Study is now public');
    }

    // Check current study status
    const { data: studies, error: studiesError } = await supabase
      .from('studies')
      .select('*')
      .eq('id', studyId);

    if (studiesError) {
      console.error('❌ Error fetching study:', studiesError);
    } else if (studies && studies.length > 0) {
      const study = studies[0];
      console.log(`📚 Study: ${study.title}`);
      console.log(`   Status: ${study.status}`);
      console.log(`   Public: ${study.is_public ? 'Yes' : 'No'}`);
      console.log(`   Researcher: ${study.researcher_id}`);
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

makeStudyPublic();
