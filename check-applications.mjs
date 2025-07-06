import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wxpwxzdgdvinlbtnbgdf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4cHd4emRnZHZpbmxidG5iZ2RmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAxOTk1ODAsImV4cCI6MjA2NTc3NTU4MH0.YMai9p4VQMbdqmc_9uWGeJ6nONHwuM9XT2FDTFy0aGk';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkApplications() {
  console.log('=== Checking Study Applications ===');
  
  try {
    // Check study_applications table structure first
    console.log('\n=== Checking Study Applications Table Structure ===');
    const { data: sampleApp, error: appError } = await supabase
      .from('study_applications')
      .select('*')
      .limit(1);

    if (appError) {
      console.error('❌ Error fetching study_applications structure:', appError);
    } else if (sampleApp && sampleApp.length > 0) {
      console.log('� Study Applications table columns:', Object.keys(sampleApp[0]));
    } else {
      // Try to insert a minimal record to see what columns are required
      console.log('📊 Table appears empty, checking with describe...');
      const { data: describeResult, error: describeError } = await supabase
        .from('study_applications')
        .select('*')
        .limit(0); // This will give us column info without data

      if (describeError) {
        console.error('❌ Describe error:', describeError);
      }
    }

    // Check studies table structure 
    console.log('\n=== Checking Studies Table Structure ===');
    const { data: sampleStudy, error: studyError } = await supabase
      .from('studies')
      .select('*')
      .limit(1);

    if (studyError) {
      console.error('❌ Error fetching studies:', studyError);
    } else if (sampleStudy && sampleStudy.length > 0) {
      console.log('📊 Studies table columns:', Object.keys(sampleStudy[0]));
    }

    // Check for studies with different column names
    console.log('\n=== Checking Studies ===');
    const { data: studies, error: studiesError } = await supabase
      .from('studies')
      .select('*')
      .limit(5);

    if (studiesError) {
      console.error('❌ Error fetching studies:', studiesError);
    } else {
      console.log(`📚 Found ${studies?.length || 0} studies:`);
      studies?.forEach((study, index) => {
        console.log(`${index + 1}. ${study.title || study.name || 'Untitled'} (${study.status}) - ${study.id}`);
        console.log(`   Creator: ${study.researcher_id || 'Unknown'}`);
      });
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkApplications();
