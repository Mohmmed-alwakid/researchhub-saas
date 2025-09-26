import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wxpwxzdgdvinlbtnbgdf.supabase.co';
const supabaseKey = ''PLACEHOLDER_SUPABASE_SERVICE_ROLE_KEY'';

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
