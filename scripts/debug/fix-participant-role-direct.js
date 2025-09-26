import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vhqoawmwvxqnblhkrgqe.supabase.co';
const supabaseServiceKey = ''PLACEHOLDER_SUPABASE_SERVICE_ROLE_KEY'';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const participantEmail = 'abwanwr77+participant@gmail.com';
const participantUserId = '9876c870-79e9-4106-99d6-9080049ec2aa';

console.log('=== DIRECT FIX FOR PARTICIPANT ROLE ===');

async function fixParticipantRole() {
  try {
    // First, let's check current state
    const { data: currentProfile, error: fetchError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', participantUserId)
      .single();

    if (fetchError) {
      console.error('Error fetching current profile:', fetchError);
      return;
    }

    console.log('Current profile before fix:', currentProfile);

    // Now let's update the role directly
    const { data: updatedProfile, error: updateError } = await supabase
      .from('profiles')
      .update({ 
        role: 'participant',
        updated_at: new Date().toISOString()
      })
      .eq('id', participantUserId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating profile:', updateError);
      return;
    }

    console.log('✅ Profile updated successfully:', updatedProfile);

    // Verify the fix
    const { data: verifiedProfile, error: verifyError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', participantUserId)
      .single();

    if (verifyError) {
      console.error('Error verifying update:', verifyError);
      return;
    }

    console.log('✅ Verified updated profile:', verifiedProfile);
    console.log(`Role is now: ${verifiedProfile.role}`);

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

fixParticipantRole();
