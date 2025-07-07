import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://nxmwzrnvhlkmcbtdhzmw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im54bXd6cm52aGxrbWNidGRoem13Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzMwNTQzNzIsImV4cCI6MjA0ODYzMDM3Mn0.JHBH3Ym6eJh_yVHF7uJFCWuOkTqKs8AzOHGzfRJP6xI';

const supabase = createClient(supabaseUrl, supabaseKey);

async function investigateStudyVisibility() {
  console.log('🔍 INVESTIGATING STUDY VISIBILITY...\n');
  
  try {
    // 1. Get all studies from the database
    console.log('1. Fetching ALL studies from database...');
    const { data: allStudies, error: allError } = await supabase
      .from('studies')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (allError) {
      console.error('❌ Error fetching all studies:', allError);
      return;
    }
    
    console.log(`✅ Found ${allStudies.length} total studies in database:`);
    allStudies.forEach((study, index) => {
      console.log(`   ${index + 1}. "${study.title}" (ID: ${study.id})`);
      console.log(`      Status: ${study.status}`);
      console.log(`      Created: ${study.created_at}`);
      console.log(`      Researcher: ${study.researcher_id}`);
      console.log(`      Max Participants: ${study.max_participants}`);
      console.log('');
    });
    
    // 2. Get studies filtered like the discover page (active/recruiting status)
    console.log('2. Fetching studies with ACTIVE/RECRUITING status...');
    const { data: activeStudies, error: activeError } = await supabase
      .from('studies')
      .select('*')
      .in('status', ['active', 'recruiting'])
      .order('created_at', { ascending: false });
    
    if (activeError) {
      console.error('❌ Error fetching active studies:', activeError);
      return;
    }
    
    console.log(`✅ Found ${activeStudies.length} active/recruiting studies:`);
    activeStudies.forEach((study, index) => {
      console.log(`   ${index + 1}. "${study.title}" (ID: ${study.id})`);
      console.log(`      Status: ${study.status}`);
      console.log('');
    });
    
    // 3. Check for our specific study
    const targetStudyId = '2d827c4a-adda-4172-95e9-0b4074b62b59';
    console.log(`3. Looking for our target study (${targetStudyId})...`);
    
    const targetStudy = allStudies.find(study => study.id === targetStudyId);
    if (targetStudy) {
      console.log('✅ Found our target study:');
      console.log('   Title:', targetStudy.title);
      console.log('   Status:', targetStudy.status);
      console.log('   Created:', targetStudy.created_at);
      console.log('   Researcher:', targetStudy.researcher_id);
      console.log('   Max Participants:', targetStudy.max_participants);
      console.log('   Description:', targetStudy.description.substring(0, 100) + '...');
    } else {
      console.log('❌ Target study not found in database!');
    }
    
    // 4. Check for existing applications by our participant
    console.log('\n4. Checking participant applications...');
    const { data: applications, error: appError } = await supabase
      .from('study_applications')
      .select('*')
      .eq('participant_email', 'abwanwr77+participant@gmail.com');
    
    if (appError) {
      console.error('❌ Error fetching applications:', appError);
      return;
    }
    
    console.log(`✅ Found ${applications.length} applications for participant:`);
    applications.forEach((app, index) => {
      console.log(`   ${index + 1}. Study: ${app.study_id}`);
      console.log(`      Status: ${app.status}`);
      console.log(`      Created: ${app.created_at}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

investigateStudyVisibility();
