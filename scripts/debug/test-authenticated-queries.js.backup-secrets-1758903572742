import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wxpwxzdgdvinlbtnbgdf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4cHd4emRnZHZpbmxidG5iZ2RmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAxOTk1ODAsImV4cCI6MjA2NTc3NTU4MH0.YMai9p4VQMbdqmc_9uWGeJ6nONHwuM9XT2FDTFy0aGk';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testAuthenticatedQueries() {
  console.log('🔍 Testing authenticated queries vs anonymous queries...');
  
  try {
    console.log('1. Logging in...');
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: 'abwanwr77+researcher@gmail.com',
      password: 'Testtest123'
    });
    
    if (loginError) {
      console.error('❌ Login failed:', loginError);
      return;
    }
    
    console.log('✅ Login successful');
    
    // Create authenticated client
    const authenticatedSupabase = createClient(supabaseUrl, supabaseKey, {
      global: {
        headers: {
          Authorization: `Bearer ${loginData.session.access_token}`
        }
      }
    });
    
    const userId = loginData.user.id;
    console.log('User ID:', userId);
    
    console.log('\n2. Testing anonymous client query...');
    const { data: anonProfile, error: anonError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    console.log('Anonymous query result:');
    console.log('Data:', anonProfile);
    console.log('Error:', anonError);
    
    console.log('\n3. Testing authenticated client query...');
    const { data: authProfile, error: authError } = await authenticatedSupabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    console.log('Authenticated query result:');
    console.log('Data:', authProfile);
    console.log('Error:', authError);
    
    console.log('\n4. Testing authenticated client - all profiles...');
    const { data: allProfiles, error: allError } = await authenticatedSupabase
      .from('profiles')
      .select('*')
      .limit(10);
    
    console.log('All profiles (authenticated):');
    console.log('Data:', allProfiles);
    console.log('Error:', allError);
    
    // Sign out
    await supabase.auth.signOut();
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testAuthenticatedQueries();
