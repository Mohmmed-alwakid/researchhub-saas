import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wxpwxzdgdvinlbtnbgdf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4cHd4emRnZHZpbmxidG5iZ2RmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAxOTk1ODAsImV4cCI6MjA2NTc3NTU4MH0.YMai9p4VQMbdqmc_9uWGeJ6nONHwuM9XT2FDTFy0aGk';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAllApplications() {
  console.log('🔍 Checking all applications in database...\n');
  
  try {
    // Get all applications
    const { data: applications, error } = await supabase
      .from('study_applications')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('❌ Error fetching applications:', error);
      return;
    }
    
    console.log(`📋 Found ${applications.length} total applications:`);
    applications.forEach((app, index) => {
      console.log(`   ${index + 1}. Application ID: ${app.id}`);
      console.log(`      Study ID: ${app.study_id}`);
      console.log(`      Participant: ${app.participant_email}`);
      console.log(`      Status: ${app.status}`);
      console.log(`      Created: ${app.created_at}`);
      console.log('');
    });
    
    // Check for applications by our participant
    const participantEmail = 'abwanwr77+participant@gmail.com';
    console.log(`\n🔍 Applications by ${participantEmail}:`);
    
    const participantApps = applications.filter(app => app.participant_email === participantEmail);
    console.log(`✅ Found ${participantApps.length} applications by this participant:`);
    
    participantApps.forEach((app, index) => {
      console.log(`   ${index + 1}. Application ID: ${app.id}`);
      console.log(`      Study ID: ${app.study_id}`);
      console.log(`      Status: ${app.status}`);
      console.log(`      Created: ${app.created_at}`);
      console.log('');
    });
    
    // Check for recent applications (last 5 minutes)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    console.log(`\n⏰ Applications created after ${fiveMinutesAgo}:`);
    
    const recentApps = applications.filter(app => app.created_at > fiveMinutesAgo);
    console.log(`✅ Found ${recentApps.length} recent applications:`);
    
    recentApps.forEach((app, index) => {
      console.log(`   ${index + 1}. Application ID: ${app.id}`);
      console.log(`      Study ID: ${app.study_id}`);
      console.log(`      Participant: ${app.participant_email}`);
      console.log(`      Status: ${app.status}`);
      console.log(`      Created: ${app.created_at}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

checkAllApplications();
