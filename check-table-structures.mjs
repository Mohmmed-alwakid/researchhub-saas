/**
 * Check the structure of studies and study_applications tables
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wxpwxzdgdvinlbtnbgdf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4cHd4emRnZHZpbmxidG5iZ2RmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAxOTk1ODAsImV4cCI6MjA2NTc3NTU4MH0.YMai9p4VQMbdqmc_9uWGeJ6nONHwuM9XT2FDTFy0aGk';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTableStructures() {
  console.log('🔍 Checking table structures...');

  try {
    // Check studies table structure
    console.log('\n📋 Studies table columns:');
    const { data: studiesColumns, error: studiesError } = await supabase
      .rpc('get_table_columns', { table_name: 'studies' });
    
    if (studiesError) {
      console.log('Using fallback method for studies...');
      const { data: studiesSample } = await supabase
        .from('studies')
        .select('*')
        .limit(1);
      
      if (studiesSample && studiesSample.length > 0) {
        console.log('Studies table columns:', Object.keys(studiesSample[0]));
      }
    } else {
      console.log('Studies columns:', studiesColumns);
    }

    // Check study_applications table structure  
    console.log('\n📋 Study Applications table columns:');
    const { data: applicationsColumns, error: applicationsError } = await supabase
      .rpc('get_table_columns', { table_name: 'study_applications' });
    
    if (applicationsError) {
      console.log('Using fallback method for applications...');
      const { data: applicationsSample } = await supabase
        .from('study_applications')
        .select('*')
        .limit(1);
      
      if (applicationsSample && applicationsSample.length > 0) {
        console.log('Applications table columns:', Object.keys(applicationsSample[0]));
      } else {
        console.log('No applications found, checking table structure...');
      }
    } else {
      console.log('Applications columns:', applicationsColumns);
    }

    // Test a simple query to see what works
    console.log('\n🧪 Testing simple study query...');
    const { data: studyTest, error: studyTestError } = await supabase
      .from('studies')
      .select('id, title, researcher_id, status')
      .limit(1);
    
    if (studyTestError) {
      console.error('Study test error:', studyTestError);
    } else {
      console.log('Study test successful:', studyTest);
    }

    // Test simple applications query
    console.log('\n🧪 Testing simple applications query...');
    const { data: appTest, error: appTestError } = await supabase
      .from('study_applications')
      .select('*')
      .limit(1);
    
    if (appTestError) {
      console.error('Applications test error:', appTestError);
    } else {
      console.log('Applications test successful:', appTest);
      if (appTest && appTest.length > 0) {
        console.log('Application columns:', Object.keys(appTest[0]));
      }
    }

  } catch (error) {
    console.error('Error checking table structures:', error);
  }
}

checkTableStructures();
