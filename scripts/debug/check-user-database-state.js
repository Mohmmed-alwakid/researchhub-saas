import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://pcmhzjwrkhidjhcxdltp.supabase.co';
const supabaseServiceKey = ''PLACEHOLDER_SUPABASE_SERVICE_ROLE_KEY'';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function checkUserDatabaseState() {
  console.log('🔍 Checking User Database State...\n');

  try {
    // 1. Check profiles table
    console.log('📊 PROFILES TABLE:');
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (profilesError) {
      console.error('❌ Error fetching profiles:', profilesError);
    } else {
      console.log(`✅ Found ${profiles.length} profiles:`);
      profiles.forEach((profile, index) => {
        console.log(`${index + 1}. ID: ${profile.id}`);
        console.log(`   Email: ${profile.email}`);
        console.log(`   Role: ${profile.role}`);
        console.log(`   Created: ${profile.created_at}`);
        console.log('');
      });
    }

    // 2. Check auth users (admin view)
    console.log('\n👥 AUTH USERS (via auth.admin.listUsers):');
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();

    if (authError) {
      console.error('❌ Error fetching auth users:', authError);
    } else {
      console.log(`✅ Found ${authUsers.users.length} auth users:`);
      authUsers.users.forEach((user, index) => {
        console.log(`${index + 1}. ID: ${user.id}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Confirmed: ${user.email_confirmed_at ? 'Yes' : 'No'}`);
        console.log(`   Created: ${user.created_at}`);
        console.log(`   Last Sign In: ${user.last_sign_in_at || 'Never'}`);
        console.log('');
      });
    }

    // 3. Check for missing profiles
    console.log('\n🔄 SYNC CHECK:');
    if (profiles && authUsers) {
      const profileUserIds = new Set(profiles.map(p => p.id));
      const authUserIds = new Set(authUsers.users.map(u => u.id));

      const missingProfiles = authUsers.users.filter(user => !profileUserIds.has(user.id));
      const orphanedProfiles = profiles.filter(profile => !authUserIds.has(profile.id));

      if (missingProfiles.length > 0) {
        console.log(`⚠️  Found ${missingProfiles.length} auth users without profiles:`);
        missingProfiles.forEach(user => {
          console.log(`   - ${user.email} (ID: ${user.id})`);
        });
      }

      if (orphanedProfiles.length > 0) {
        console.log(`⚠️  Found ${orphanedProfiles.length} profiles without auth users:`);
        orphanedProfiles.forEach(profile => {
          console.log(`   - ${profile.email} (ID: ${profile.id})`);
        });
      }

      if (missingProfiles.length === 0 && orphanedProfiles.length === 0) {
        console.log('✅ All auth users have corresponding profiles!');
      }
    }

    // 4. Test account check
    console.log('\n🧪 TEST ACCOUNTS CHECK:');
    const testEmails = [
      'abwanwr77+admin@gmail.com',
      'abwanwr77+Researcher@gmail.com', 
      'abwanwr77+participant@gmail.com'
    ];

    for (const email of testEmails) {
      const authUser = authUsers?.users.find(u => u.email === email);
      const profile = profiles?.find(p => p.email === email);
      
      console.log(`📧 ${email}:`);
      console.log(`   Auth: ${authUser ? '✅ Exists' : '❌ Missing'}`);
      console.log(`   Profile: ${profile ? '✅ Exists' : '❌ Missing'}`);
      if (profile) {
        console.log(`   Role: ${profile.role}`);
      }
      console.log('');
    }

  } catch (error) {
    console.error('💥 Unexpected error:', error);
  }
}

checkUserDatabaseState();
