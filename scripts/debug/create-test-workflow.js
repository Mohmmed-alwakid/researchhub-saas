import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://cgobqlfqvmhvbjwagzca.supabase.co';
const supabaseServiceKey = ''PLACEHOLDER_SUPABASE_SERVICE_ROLE_KEY'';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createTestWorkflow() {
  console.log('🔄 Creating end-to-end test workflow...');
  
  try {
    // 1. Get researcher and participant IDs
    const researcherEmail = 'abwanwr77+researcher@gmail.com';
    const participantEmail = 'abwanwr77+participant@gmail.com';
    
    const { data: researcher, error: researcherError } = await supabase
      .from('users')
      .select('id')
      .eq('email', researcherEmail)
      .single();
      
    if (researcherError) {
      console.log('❌ Error finding researcher:', researcherError);
      return;
    }
    
    const { data: participant, error: participantError } = await supabase
      .from('users')
      .select('id')
      .eq('email', participantEmail)
      .single();
      
    if (participantError) {
      console.log('❌ Error finding participant:', participantError);
      return;
    }
    
    console.log('👨‍🔬 Researcher ID:', researcher.id);
    console.log('👤 Participant ID:', participant.id);
    
    // 2. Create a simple study owned by the researcher
    const studyData = {
      title: 'Test Participation Workflow Study',
      description: 'A test study to verify end-to-end participation workflow',
      researcher_id: researcher.id,
      status: 'active',
      target_participants: 5,
      study_type: 'usability',
      duration_minutes: 15,
      compensation: 25,
      is_public: true
    };
    
    const { data: study, error: studyError } = await supabase
      .from('studies')
      .insert([studyData])
      .select()
      .single();
      
    if (studyError) {
      console.log('❌ Error creating study:', studyError);
      return;
    }
    
    console.log('📊 Study created:', study.id);
    
    // 3. Have participant apply to the study
    const applicationData = {
      participant_id: participant.id,
      study_id: study.id,
      status: 'pending',
      application_date: new Date().toISOString()
    };
    
    const { data: application, error: applicationError } = await supabase
      .from('study_applications')
      .insert([applicationData])
      .select()
      .single();
      
    if (applicationError) {
      console.log('❌ Error creating application:', applicationError);
      return;
    }
    
    console.log('📝 Application created:', application.id);
    
    // 4. Approve the application
    const { data: approvedApp, error: approvalError } = await supabase
      .from('study_applications')
      .update({ status: 'approved' })
      .eq('id', application.id)
      .select()
      .single();
      
    if (approvalError) {
      console.log('❌ Error approving application:', approvalError);
      return;
    }
    
    console.log('✅ Application approved successfully!');
    
    // 5. Verify the application status
    const { data: finalApp, error: verifyError } = await supabase
      .from('study_applications')
      .select('*')
      .eq('id', application.id)
      .single();
      
    if (verifyError) {
      console.log('❌ Error verifying application:', verifyError);
    } else {
      console.log('🔍 Final application status:', finalApp.status);
    }
    
    console.log('\n🎯 Test Summary:');
    console.log(`Study ID: ${study.id}`);
    console.log(`Application ID: ${application.id}`);
    console.log(`Participant can now participate in study!`);
    
  } catch (error) {
    console.log('❌ Unexpected error:', error);
  }
}

createTestWorkflow();
