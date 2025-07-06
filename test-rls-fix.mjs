import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wxpwxzdgdvinlbtnbgdf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4cHd4emRnZHZpbmxidG5iZ2RmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAxOTk1ODAsImV4cCI6MjA2NTc3NTU4MH0.YMai9p4VQMbdqmc_9uWGeJ6nONHwuM9XT2FDTFy0aGk';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testRLSFix() {
  console.log('=== Testing RLS Policy Fix for Study Applications ===\n');

  // Login as researcher
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'abwanwr77+researcher@gmail.com',
    password: 'Testtest123'
  });

  if (authError) {
    console.error('❌ Login failed:', authError.message);
    return;
  }

  console.log('✅ Logged in as researcher:', authData.user.email);
  console.log('🔑 User ID:', authData.user.id);

  // Get researcher's studies
  const { data: studies, error: studiesError } = await supabase
    .from('studies')
    .select('id, title, researcher_id')
    .eq('researcher_id', authData.user.id);

  if (studiesError) {
    console.error('❌ Failed to get studies:', studiesError.message);
    return;
  }

  console.log('\n📚 Researcher studies:');
  studies.forEach(study => {
    console.log(`  - ${study.title} (ID: ${study.id})`);
  });

  if (studies.length === 0) {
    console.log('⚠️ No studies found for this researcher');
    return;
  }

  // Now try to get applications for researcher's studies
  const { data: applications, error: appsError } = await supabase
    .from('study_applications')
    .select(`
      id,
      study_id,
      participant_id,
      status,
      applied_at,
      studies:study_id (
        title,
        researcher_id
      ),
      profiles:participant_id (
        email,
        first_name,
        last_name
      )
    `)
    .in('study_id', studies.map(s => s.id));

  if (appsError) {
    console.error('❌ Failed to get applications:', appsError.message);
    return;
  }

  console.log('\n📝 Applications for researcher studies:');
  if (applications.length === 0) {
    console.log('⚠️ No applications found for researcher studies');
  } else {
    applications.forEach(app => {
      console.log(`  - Application ${app.id}`);
      console.log(`    Study: ${app.studies?.title}`);
      console.log(`    Participant: ${app.profiles?.email}`);
      console.log(`    Status: ${app.status}`);
      console.log(`    Applied: ${app.applied_at}`);
      console.log('');
    });
  }

  // Test specific query that was failing before
  console.log('🔍 Testing specific query that was failing before...');
  const { data: directQuery, error: directError } = await supabase
    .from('study_applications')
    .select('*')
    .eq('study_id', studies[0]?.id);

  if (directError) {
    console.error('❌ Direct query failed:', directError.message);
  } else {
    console.log(`✅ Direct query succeeded! Found ${directQuery.length} applications`);
  }

  console.log('\n🎉 RLS Policy Test Complete!');
}

testRLSFix().catch(console.error);
