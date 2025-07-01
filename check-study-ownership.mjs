import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wxpwxzdgdvinlbtnbgdf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4cHd4emRnZHZpbmxidG5iZ2RmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAxOTk1ODAsImV4cCI6MjA2NTc3NTU4MH0.YMai9p4VQMbdqmc_9uWGeJ6nONHwuM9XT2FDTFy0aGk';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkStudyOwnership() {
  console.log('🔍 Checking study ownership and applications...\n');
  
  try {
    // Get the real study from database
    const { data: studies, error } = await supabase
      .from('studies')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('❌ Error fetching studies:', error);
      return;
    }
    
    console.log(`📋 Found ${studies.length} studies in database:`);
    studies.forEach((study, index) => {
      console.log(`   ${index + 1}. "${study.title}"`);
      console.log(`      ID: ${study.id}`);
      console.log(`      Researcher: ${study.researcher_id}`);
      console.log(`      Status: ${study.status}`);
      console.log(`      Public: ${study.is_public}`);
      console.log('');
    });
    
    // Check applications for the test study
    const testStudyId = '2fd69681-3a09-49c5-b110-a06d8834aee8';
    console.log(`\n🔍 Checking applications for study: ${testStudyId}`);
    
    const { data: applications, error: appError } = await supabase
      .from('study_applications')
      .select('*')
      .eq('study_id', testStudyId)
      .order('created_at', { ascending: false });
    
    if (appError) {
      console.error('❌ Error fetching applications:', appError);
      return;
    }
    
    console.log(`✅ Found ${applications.length} applications:`);
    applications.forEach((app, index) => {
      console.log(`   ${index + 1}. Application ID: ${app.id}`);
      console.log(`      Participant: ${app.participant_email}`);
      console.log(`      Status: ${app.status}`);
      console.log(`      Created: ${app.created_at}`);
      console.log('');
    });
    
    // Get researcher info
    const testStudy = studies.find(s => s.id === testStudyId);
    if (testStudy) {
      console.log(`\n👤 Study owner info:`);
      console.log(`   Researcher ID: ${testStudy.researcher_id}`);
      
      // Try to get researcher details
      const { data: user, error: userError } = await supabase.auth.admin.getUserById(testStudy.researcher_id);
      if (user && !userError) {
        console.log(`   Researcher Email: ${user.user.email}`);
      } else {
        console.log(`   Could not fetch researcher details`);
      }
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

checkStudyOwnership();
