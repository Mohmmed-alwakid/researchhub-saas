import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wxpwxzdgdvinlbtnbgdf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4cHd4emRnZHZpbmxidG5iZ2RmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAxOTk1ODAsImV4cCI6MjA2NTc3NTU4MH0.YMai9p4VQMbdqmc_9uWGeJ6nONHwuM9XT2FDTFy0aGk';

const supabase = createClient(supabaseUrl, supabaseKey);

// First, let's get the actual user ID from the auth.users table
async function getUserIds() {
  console.log('🔍 Checking auth.users table for actual user IDs...');
  
  try {
    // Try to get users - this might also fail due to RLS, but worth a try
    const { data: users, error } = await supabase.auth.admin.listUsers();
    
    if (error) {
      console.log('❌ Cannot access auth.users:', error.message);
      console.log('This is expected - need service role key for admin functions');
      return;
    }
    
    console.log('✅ Users found:');
    users.users.forEach(user => {
      console.log(`- ${user.email}: ${user.id} (role: ${user.user_metadata?.role})`);
    });
    
  } catch (error) {
    console.log('❌ Admin function failed:', error.message);
  }
}

// Alternative: Let's manually try to create profiles using direct database connection
// Since we know the issue is RLS, let's try a workaround
async function createProfilesWorkaround() {
  console.log('🔧 Attempting RLS workaround...');
  
  // Try to create a profile for the researcher using an authenticated client
  // First, get a valid JWT token by logging in
  
  try {
    console.log('1. Logging in to get authenticated client...');
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: 'abwanwr77+researcher@gmail.com',
      password: 'Testtest123'
    });
    
    if (loginError) {
      console.error('❌ Login failed:', loginError);
      return;
    }
    
    console.log('✅ Login successful, user ID:', loginData.user.id);
    
    // Create authenticated client
    const authenticatedSupabase = createClient(supabaseUrl, supabaseKey, {
      global: {
        headers: {
          Authorization: `Bearer ${loginData.session.access_token}`
        }
      }
    });
    
    console.log('2. Creating profile with authenticated client...');
    
    const profileData = {
      id: loginData.user.id,
      email: loginData.user.email,
      first_name: loginData.user.user_metadata?.first_name || 'Researcher',
      last_name: loginData.user.user_metadata?.last_name || 'tester',
      role: loginData.user.user_metadata?.role || 'researcher',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    console.log('Profile data:', profileData);
    
    const { data: profile, error: profileError } = await authenticatedSupabase
      .from('profiles')
      .insert(profileData);
    
    if (profileError) {
      console.error('❌ Profile creation failed:', profileError);
    } else {
      console.log('✅ Profile created successfully!');
    }
    
    // Sign out
    await supabase.auth.signOut();
    
  } catch (error) {
    console.error('❌ Workaround failed:', error);
  }
}

async function main() {
  await getUserIds();
  await createProfilesWorkaround();
}

main();
