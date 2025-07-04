import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mbqtlvyhxydfwjggbqxl.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1icXRsdnloeHlkZndqZ2dicXhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ2MzUxMzMsImV4cCI6MjA1MDIxMTEzM30.BkF5RY8qrHKsO9KJEvfxI8aHHgf0PzUqQiW8P-n4Xxw';

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
