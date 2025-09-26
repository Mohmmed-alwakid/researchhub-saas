import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wxpwxzdgdvinlbtnbgdf.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4cHd4emRnZHZpbmxidG5iZ2RmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDE5OTU4MCwiZXhwIjoyMDY1Nzc1NTgwfQ.1wTJ6FZJeIXNj-ZRF3Q1hVBGpuW4pC2YB8l2QzF_YGs';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function syncAuthUsersWithProfiles() {
  console.log('🔄 Starting Auth-Profile Sync Process...\n');

  try {
    // 1. Get all auth users using service role
    console.log('📥 Fetching auth users...');
    const { data: authUsersResponse, error: authError } = await supabase.auth.admin.listUsers();

    if (authError) {
      console.error('❌ Error fetching auth users:', authError);
      return;
    }

    const authUsers = authUsersResponse.users;
    console.log(`✅ Found ${authUsers.length} auth users`);

    // 2. Get all profiles
    console.log('📥 Fetching existing profiles...');
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*');

    if (profilesError) {
      console.error('❌ Error fetching profiles:', profilesError);
      return;
    }

    console.log(`✅ Found ${profiles?.length || 0} existing profiles`);

    // 3. Find missing profiles
    const profileUserIds = new Set(profiles?.map(p => p.id) || []);
    const missingProfiles = authUsers.filter(user => !profileUserIds.has(user.id));

    console.log(`\n🔍 Analysis:`);
    console.log(`   - Auth users: ${authUsers.length}`);
    console.log(`   - Existing profiles: ${profiles?.length || 0}`);
    console.log(`   - Missing profiles: ${missingProfiles.length}`);

    if (missingProfiles.length === 0) {
      console.log('\n✅ All auth users already have profiles!');
      return;
    }

    // 4. Create missing profiles
    console.log(`\n🚀 Creating ${missingProfiles.length} missing profiles...`);

    for (const user of missingProfiles) {
      console.log(`\n👤 Processing user: ${user.email}`);
      
      // Extract user metadata
      const metadata = user.user_metadata || {};
      const firstName = metadata.first_name || '';
      const lastName = metadata.last_name || '';
      const role = metadata.role || 'participant';

      // Determine role based on email if not set in metadata
      let finalRole = role;
      if (user.email?.includes('+admin@')) {
        finalRole = 'admin';
      } else if (user.email?.includes('+Researcher@')) {
        finalRole = 'researcher';
      } else if (user.email?.includes('+participant@')) {
        finalRole = 'participant';
      }

      const profileData = {
        id: user.id,
        email: user.email,
        first_name: firstName,
        last_name: lastName,
        role: finalRole,
        created_at: user.created_at,
        updated_at: new Date().toISOString(),
        last_login: user.last_sign_in_at,
        is_email_verified: !!user.email_confirmed_at
      };

      console.log(`   📝 Creating profile with role: ${finalRole}`);

      const { data: newProfile, error: insertError } = await supabase
        .from('profiles')
        .insert([profileData])
        .select()
        .single();

      if (insertError) {
        console.error(`   ❌ Error creating profile for ${user.email}:`, insertError);
      } else {
        console.log(`   ✅ Profile created successfully for ${user.email}`);
      }
    }

    // 5. Verify sync is complete
    console.log('\n🔍 Verifying sync completion...');
    const { data: updatedProfiles, error: verifyError } = await supabase
      .from('profiles')
      .select('*');

    if (verifyError) {
      console.error('❌ Error verifying profiles:', verifyError);
      return;
    }

    console.log(`✅ Final state:`);
    console.log(`   - Auth users: ${authUsers.length}`);
    console.log(`   - Profiles: ${updatedProfiles?.length || 0}`);

    // 6. Show all test accounts
    console.log('\n🧪 Test Accounts Status:');
    const testEmails = [
      'abwanwr77+admin@gmail.com',
      'abwanwr77+Researcher@gmail.com',
      'abwanwr77+participant@gmail.com'
    ];

    for (const email of testEmails) {
      const authUser = authUsers.find(u => u.email === email);
      const profile = updatedProfiles?.find(p => p.email === email);
      
      console.log(`📧 ${email}:`);
      console.log(`   Auth: ${authUser ? '✅ Exists' : '❌ Missing'}`);
      console.log(`   Profile: ${profile ? '✅ Exists' : '❌ Missing'}`);
      if (profile) {
        console.log(`   Role: ${profile.role}`);
      }
      console.log('');
    }

    console.log('🎉 Sync process completed!');

  } catch (error) {
    console.error('💥 Unexpected error during sync:', error);
  }
}

// Run the sync
syncAuthUsersWithProfiles();
