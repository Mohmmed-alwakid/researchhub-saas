import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wxpwxzdgdvinlbtnbgdf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4cHd4emRnZHZpbmxidG5iZ2RmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAxOTk1ODAsImV4cCI6MjA2NTc3NTU4MH0.YMai9p4VQMbdqmc_9uWGeJ6nONHwuM9XT2FDTFy0aGk';

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🔍 Checking both application tables...');

// Check participant_applications
try {
  const { data: participantApps, error: pError } = await supabase
    .from('participant_applications')
    .select('*');

  console.log('\n=== participant_applications table ===');
  console.log('Error:', pError);
  console.log('Data count:', participantApps?.length || 0);
  if (participantApps && participantApps.length > 0) {
    console.log('Sample record:', JSON.stringify(participantApps[0], null, 2));
  }
} catch (e) {
  console.log('participant_applications table error:', e.message);
}

// Check study_applications 
try {
  const { data: studyApps, error: sError } = await supabase
    .from('study_applications')
    .select('*');

  console.log('\n=== study_applications table ===');
  console.log('Error:', sError);
  console.log('Data count:', studyApps?.length || 0);
  if (studyApps && studyApps.length > 0) {
    console.log('Sample record:', JSON.stringify(studyApps[0], null, 2));
  }
} catch (e) {
  console.log('study_applications table error:', e.message);
}

console.log('\n🔍 Done checking application tables');
