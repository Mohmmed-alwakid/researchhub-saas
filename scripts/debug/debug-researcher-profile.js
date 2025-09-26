import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wxpwxzdgdvinlbtnbgdf.supabase.co';
const supabaseKey = ''PLACEHOLDER_SUPABASE_SERVICE_ROLE_KEY'';

const supabase = createClient(supabaseUrl, supabaseKey);

const userId = '4c3d798b-2975-4ec4-b9e2-c6f128b8a066';

async function debugProfile() {
  console.log('🔍 Debugging researcher profile...');
  console.log('User ID:', userId);
  
  try {
    // Check if profile exists with service role (no RLS)
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    console.log('Profile query result:');
    console.log('Data:', profile);
    console.log('Error:', profileError);
    
    if (profile) {
      console.log('✅ Profile found!');
      console.log('- ID:', profile.id);
      console.log('- Email:', profile.email);
      console.log('- Role:', profile.role);
      console.log('- First Name:', profile.first_name);
      console.log('- Last Name:', profile.last_name);
    } else {
      console.log('❌ Profile not found');
    }
    
    // Also check all profiles to see what's in the table
    const { data: allProfiles, error: allError } = await supabase
      .from('profiles')
      .select('id, email, role, first_name, last_name')
      .limit(10);
    
    console.log('\n📋 All profiles in table:');
    console.log('Data:', allProfiles);
    console.log('Error:', allError);
    
  } catch (error) {
    console.error('❌ Debug failed:', error);
  }
}

debugProfile();
