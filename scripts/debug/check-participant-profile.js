// Direct Supabase query to check user profile
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wxpwxzdgdvinlbtnbgdf.supabase.co';
const supabaseKey = ''PLACEHOLDER_SUPABASE_SERVICE_ROLE_KEY'';

async function checkParticipantRole() {
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  const email = 'abwanwr77+participant@gmail.com';
  
  console.log(`\n=== CHECKING ROLE FOR: ${email} ===\n`);
  
  try {
    // First get the user's auth details
    const { data: authUser, error: authError } = await supabase.auth.signInWithPassword({
      email: email,
      password: 'Testtest123'
    });
    
    if (authError) {
      console.error('Auth error:', authError);
      return;
    }
    
    console.log('Auth user metadata:', authUser.user.user_metadata);
    
    // Now get the profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authUser.user.id)
      .single();
      
    if (profileError) {
      console.error('Profile error:', profileError);
      return;
    }
    
    console.log('Profile data:', profile);
    console.log('\n--- ANALYSIS ---');
    console.log('Expected role: participant');
    console.log('Actual profile role:', profile.role);
    console.log('User metadata role:', authUser.user.user_metadata?.role);
    console.log('EMAIL CHECK:', email.includes('participant'));
    
    // Sign out
    await supabase.auth.signOut();
    
  } catch (error) {
    console.error('Script error:', error);
  }
}

checkParticipantRole();
