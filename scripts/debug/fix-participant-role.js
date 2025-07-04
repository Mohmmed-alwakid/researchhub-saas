// Fix participant user role in profile table
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wxpwxzdgdvinlbtnbgdf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4cHd4emRnZHZpbmxidG5iZ2RmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAxOTk1ODAsImV4cCI6MjA2NTc3NTU4MH0.YMai9p4VQMbdqmc_9uWGeJ6nONHwuM9XT2FDTFy0aGk';

async function fixParticipantRole() {
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  const email = 'abwanwr77+participant@gmail.com';
  const userID = '9876c870-79e9-4106-99d6-9080049ec2aa';
  
  console.log(`\n=== FIXING ROLE FOR: ${email} ===\n`);
  
  try {
    // Update the profile role to participant
    const { data, error } = await supabase
      .from('profiles')
      .update({ role: 'participant' })
      .eq('id', userID)
      .select();
    
    if (error) {
      console.error('Update error:', error);
      return;
    }
    
    console.log('✅ Role updated successfully!');
    console.log('Updated profile:', data[0]);
    
    // Verify the change
    const { data: verifyProfile, error: verifyError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userID)
      .single();
      
    if (verifyError) {
      console.error('Verification error:', verifyError);
      return;
    }
    
    console.log('\n--- VERIFICATION ---');
    console.log('Current profile role:', verifyProfile.role);
    console.log('Expected role: participant');
    console.log('✅ Fix successful:', verifyProfile.role === 'participant');
    
  } catch (error) {
    console.error('Script error:', error);
  }
}

fixParticipantRole();
