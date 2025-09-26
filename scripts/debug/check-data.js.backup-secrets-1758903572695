import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://wxpwxzdgdvinlbtnbgdf.supabase.co', 
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4cHd4emRnZHZpbmxidG5iZ2RmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAxOTk1ODAsImV4cCI6MjA2NTc3NTU4MH0.YMai9p4VQMbdqmc_9uWGeJ6nONHwuM9XT2FDTFy0aGk'
);

async function checkData() {
  try {
    console.log('🔍 Checking available data...\n');
    
    // Check studies
    console.log('📋 Studies:');
    const { data: studies, error: studiesError } = await supabase
      .from('studies')
      .select('id, title, status, researcher_id')
      .limit(5);
    
    if (studies && studies.length > 0) {
      studies.forEach(study => {
        console.log(`- ${study.id}: ${study.title} (${study.status})`);
      });
    } else {
      console.log('  No studies found');
    }
    
    // Check user profiles to get participant IDs
    console.log('\n👥 User Profiles:');
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, email, role')
      .limit(5);
    
    if (profiles && profiles.length > 0) {
      profiles.forEach(profile => {
        console.log(`- ${profile.id}: ${profile.email} (${profile.role})`);
      });
    } else {
      console.log('  No profiles found');
    }
    
    // Check applications
    console.log('\n📝 Applications:');
    const { data: applications, error: appError } = await supabase
      .from('study_applications')
      .select('*')
      .limit(5);
    
    console.log(`  Found: ${applications?.length || 0} applications`);
    
    if (studiesError) console.error('Studies error:', studiesError);
    if (profilesError) console.error('Profiles error:', profilesError);
    if (appError) console.error('Applications error:', appError);
    
  } catch (err) {
    console.error('❌ Exception:', err.message);
  }
}

checkData();
