/**
 * Debug script to check study session data access
 * Investigating the "no rows" error in StudySessionPage
 */
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wxpwxzdgdvinlbtnbgdf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4cHd4emRnZHZpbmxidG5iZ2RmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAxOTk1ODAsImV4cCI6MjA2NTc3NTU4MH0.YMai9p4VQMbdqmc_9uWGeJ6nONHwuM9XT2FDTFy0aGk';

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugStudySessionData() {
  console.log('🔍 Starting debug of study session data...\n');

  // First, let's check what study sessions exist
  console.log('📋 Step 1: Check recording_sessions table');
  const { data: sessions, error: sessionsError } = await supabase
    .from('recording_sessions')
    .select('*');

  if (sessionsError) {
    console.error('❌ Error fetching sessions:', sessionsError);
  } else {
    console.log('✅ Found sessions:', sessions.length);
    sessions.forEach(session => {
      console.log(`  - Session ID: ${session.id}`);
      console.log(`    Study ID: ${session.study_id}`);
      console.log(`    Participant ID: ${session.participant_id}`);
      console.log(`    Status: ${session.status}`);
      console.log('');
    });
  }

  // Check studies table
  console.log('📋 Step 2: Check studies table');
  const { data: studies, error: studiesError } = await supabase
    .from('studies')
    .select('*');

  if (studiesError) {
    console.error('❌ Error fetching studies:', studiesError);
  } else {
    console.log('✅ Found studies:', studies.length);
    studies.forEach(study => {
      console.log(`  - Study ID: ${study.id}`);
      console.log(`    Title: ${study.title}`);
      console.log(`    Researcher ID: ${study.researcher_id}`);
      console.log('');
    });
  }

  // Check study applications to see what data we have
  console.log('📋 Step 3: Check study_applications table');
  const { data: applications, error: applicationsError } = await supabase
    .from('study_applications')
    .select('*');

  if (applicationsError) {
    console.error('❌ Error fetching applications:', applicationsError);
  } else {
    console.log('✅ Found applications:', applications.length);
    applications.forEach(app => {
      console.log(`  - Application ID: ${app.id}`);
      console.log(`    Study ID: ${app.study_id}`);
      console.log(`    Participant ID: ${app.participant_id}`);
      console.log(`    Status: ${app.status}`);
      console.log('');
    });
  }

  // Now let's test a specific session lookup (if any session exists)
  if (sessions && sessions.length > 0) {
    const testSession = sessions[0];
    console.log(`📋 Step 4: Test session lookup for ${testSession.id}`);
    
    // Test the exact query used in the API
    const { data: sessionWithStudy, error: joinError } = await supabase
      .from('recording_sessions')
      .select(`
        id,
        study_id,
        status,
        started_at,
        completed_at,
        metadata,
        recording_settings,
        studies!inner(title, description, tasks, settings)
      `)
      .eq('id', testSession.id)
      .single();

    if (joinError) {
      console.error('❌ Error with join query:', joinError);
      
      // Let's try without the join
      console.log('🔄 Testing without join...');
      const { data: sessionOnly, error: sessionOnlyError } = await supabase
        .from('recording_sessions')
        .select('*')
        .eq('id', testSession.id)
        .single();

      if (sessionOnlyError) {
        console.error('❌ Error even without join:', sessionOnlyError);
      } else {
        console.log('✅ Session found without join:', sessionOnly);
      }

      // Check if the study exists
      console.log('🔄 Testing study lookup...');
      const { data: studyOnly, error: studyOnlyError } = await supabase
        .from('studies')
        .select('*')
        .eq('id', testSession.study_id)
        .single();

      if (studyOnlyError) {
        console.error('❌ Study not found:', studyOnlyError);
      } else {
        console.log('✅ Study found:', studyOnly);
      }

    } else {
      console.log('✅ Session with study join successful:', sessionWithStudy);
    }
  } else {
    console.log('⚠️ No sessions found to test');
  }

  console.log('\n🏁 Debug complete');
}

debugStudySessionData().catch(console.error);
