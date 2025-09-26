import { createClient } from '@supabase/supabase-js';
const supabase = createClient(
  'https://wxpwxzdgdvinlbtnbgdf.supabase.co', 
  ''PLACEHOLDER_SUPABASE_SERVICE_ROLE_KEY''
);

async function checkApplications() {
  try {
    console.log('🔍 Checking study applications...');
    
    const { data: applications, error } = await supabase
      .from('study_applications')
      .select('*')
      .limit(10);
    
    console.log('Applications found:', applications?.length || 0);
    
    if (applications && applications.length > 0) {
      applications.forEach(app => {
        console.log(`- App ID: ${app.id}`);
        console.log(`  Study: ${app.study_id}`);
        console.log(`  Participant: ${app.participant_id}`);
        console.log(`  Status: ${app.status}`);
        console.log('');
      });
      
      // Check if any are approved
      const approvedApps = applications.filter(app => app.status === 'approved');
      console.log(`✅ Approved applications: ${approvedApps.length}`);
      
    } else {
      console.log('⚠️ No applications found');
    }
    
    if (error) {
      console.error('❌ Error:', error);
    }
    
  } catch (err) {
    console.error('❌ Exception:', err.message);
  }
}

checkApplications();
