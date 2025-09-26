import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mbqtlvyhxydfwjggbqxl.supabase.co';
const supabaseKey = ''PLACEHOLDER_SUPABASE_SERVICE_ROLE_KEY'';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkParticipantRole() {
  try {
    console.log('🔍 Checking participant user role...');
    
    // Get user by email
    const { data: authUser, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.error('❌ Error fetching auth users:', authError);
      return;
    }
    
    const participantUser = authUser.users.find(user => 
      user.email === 'abwanwr77+participant@gmail.com'
    );
    
    if (!participantUser) {
      console.log('❌ Participant user not found in auth');
      return;
    }
    
    console.log('🔧 Auth User Data:', {
      id: participantUser.id,
      email: participantUser.email,
      user_metadata: participantUser.user_metadata
    });
    
    // Get profile from profiles table
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', participantUser.id)
      .single();
    
    if (profileError) {
      console.error('❌ Error fetching profile:', profileError);
      return;
    }
    
    console.log('👤 Profile Data:', profile);
    
    // Determine role using same logic as auth.js
    const userRole = profile?.role || participantUser.user_metadata?.role || 'participant';
    console.log('🎯 Final Role (using auth.js logic):', userRole);
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkParticipantRole();
