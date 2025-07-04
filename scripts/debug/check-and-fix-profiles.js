// Script to check and fix missing profile records
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://lbmirbnbacpcpahfujri.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxibWlyYm5iYWNwY3BhaGZ1anJpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcwNzc4MzYyMiwiZXhwIjoyMDIzMzU5NjIyfQ.ZaKUWxFBku8b-DA4eV5UUewP_rlKKpNaDN_lBNJyoHE'
);

async function checkAndFixProfiles() {
  console.log('🔍 Checking Auth users vs Profile records...\n');
  
  try {
    // 1. Get all users from auth.users
    console.log('📊 Fetching all auth users...');
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.error('❌ Error fetching auth users:', authError);
      return;
    }
    
    console.log(`✅ Found ${authUsers.users.length} auth users:`);
    authUsers.users.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.email} (ID: ${user.id})`);
    });
    
    // 2. Get all profile records
    console.log('\n👤 Fetching all profile records...');
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('*');
    
    if (profileError) {
      console.error('❌ Error fetching profiles:', profileError);
      return;
    }
    
    console.log(`✅ Found ${profiles.length} profile records:`);
    profiles.forEach((profile, index) => {
      console.log(`   ${index + 1}. ${profile.email} (${profile.role}) - ID: ${profile.id}`);
    });
    
    // 3. Find missing profiles
    console.log('\n🔍 Checking for missing profiles...');
    const profileIds = new Set(profiles.map(p => p.id));
    const missingProfiles = authUsers.users.filter(user => !profileIds.has(user.id));
    
    if (missingProfiles.length === 0) {
      console.log('✅ All auth users have corresponding profile records!');
      return;
    }
    
    console.log(`❌ Found ${missingProfiles.length} missing profile records:`);
    missingProfiles.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.email} (ID: ${user.id})`);
    });
    
    // 4. Create missing profiles
    console.log('\n🛠️ Creating missing profile records...');
    for (const user of missingProfiles) {
      // Determine role based on email
      let role = 'participant'; // default
      if (user.email.includes('+admin')) {
        role = 'admin';
      } else if (user.email.includes('+researcher') || user.email.includes('+Researcher')) {
        role = 'researcher';
      }
      
      const profileData = {
        id: user.id,
        email: user.email,
        first_name: user.email.includes('+admin') ? 'Admin' : 
                   user.email.includes('+researcher') || user.email.includes('+Researcher') ? 'Researcher' : 
                   'Participant',
        last_name: 'User',
        role: role,
        status: 'active',
        subscription_plan: 'free',
        subscription_status: 'active',
        created_at: user.created_at,
        updated_at: user.created_at
      };
      
      console.log(`   Creating profile for ${user.email} with role: ${role}`);
      
      const { data: newProfile, error: insertError } = await supabase
        .from('profiles')
        .insert(profileData)
        .select()
        .single();
      
      if (insertError) {
        console.error(`   ❌ Error creating profile for ${user.email}:`, insertError);
      } else {
        console.log(`   ✅ Created profile for ${user.email}`);
      }
    }
    
    // 5. Verify final state
    console.log('\n🔍 Final verification...');
    const { data: finalProfiles, error: finalError } = await supabase
      .from('profiles')
      .select('*');
    
    if (finalError) {
      console.error('❌ Error in final verification:', finalError);
      return;
    }
    
    console.log(`✅ Final state: ${finalProfiles.length} profile records:`);
    finalProfiles.forEach((profile, index) => {
      console.log(`   ${index + 1}. ${profile.email} (${profile.role}) - ID: ${profile.id}`);
    });
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

checkAndFixProfiles()
  .then(() => {
    console.log('\n🎉 Profile check and fix completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
