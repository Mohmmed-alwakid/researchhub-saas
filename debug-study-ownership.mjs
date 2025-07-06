/**
 * DEBUG STUDY OWNERSHIP AND DATABASE STRUCTURE
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wxpwxzdgdvinlbtnbgdf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4cHd4emRnZHZpbmxidG5iZ2RmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAxOTk1ODAsImV4cCI6MjA2NTc3NTU4MH0.YMai9p4VQMbdqmc_9uWGeJ6nONHwuM9XT2FDTFy0aGk';

async function debugStudyOwnership() {
  console.log('🔍 DEBUGGING STUDY OWNERSHIP');
  console.log('=' .repeat(50));

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // Step 1: Login as researcher
    const { data: researcherAuth, error: researcherError } = await supabase.auth.signInWithPassword({
      email: 'abwanwr77+researcher@gmail.com',
      password: 'Testtest123'
    });

    if (researcherError) {
      console.error('❌ Researcher login failed:', researcherError);
      return;
    }

    console.log('✅ Researcher logged in');
    console.log('👤 Researcher user ID:', researcherAuth.user.id);

    // Step 2: Check study details with detailed field info
    const studyId = '99a0f9b1-bdfe-46b8-961a-97dc3d29fb98';
    
    const { data: study, error: studyError } = await supabase
      .from('studies')
      .select('*')
      .eq('id', studyId)
      .single();

    console.log('\n📊 STUDY DETAILS:');
    console.log('Study error:', studyError);
    console.log('Study data:', JSON.stringify(study, null, 2));

    if (study) {
      console.log('\n🔑 OWNERSHIP CHECK:');
      console.log('Researcher user ID:  ', researcherAuth.user.id);
      console.log('Study created_by:    ', study.created_by);
      console.log('Study createdBy:     ', study.createdBy);
      console.log('Study researcher_id: ', study.researcher_id);
      console.log('Study user_id:       ', study.user_id);
      console.log('Study owner_id:      ', study.owner_id);
      
      console.log('\n✨ FIELD COMPARISON:');
      console.log('created_by === user.id?  ', study.created_by === researcherAuth.user.id);
      console.log('createdBy === user.id?   ', study.createdBy === researcherAuth.user.id);
      console.log('researcher_id === user.id?', study.researcher_id === researcherAuth.user.id);
    }

    // Step 3: Check if there are any applications to this study
    const { data: applications, error: appsError } = await supabase
      .from('study_applications')
      .select('*')
      .eq('study_id', studyId);

    console.log('\n📋 STUDY APPLICATIONS:');
    console.log('Applications error:', appsError);
    console.log('Applications count:', applications?.length || 0);
    if (applications && applications.length > 0) {
      console.log('First application:', JSON.stringify(applications[0], null, 2));
    }

  } catch (error) {
    console.error('❌ Debug Error:', error);
  }
}

debugStudyOwnership();
