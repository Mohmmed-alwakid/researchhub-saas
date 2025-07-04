import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://cgobqlfqvmhvbjwagzca.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNnb2JxbGZxdm1odmJqd2FnemNhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMzk5MjkzOCwiZXhwIjoyMDQ5NTY4OTM4fQ.lzNLcBWm8Vd8Z94IhCeaSmOdFa9l3YI2c6Jp_Xj1PuY';

async function approveApplication() {
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  console.log('💫 Attempting to approve application 3556e16c-50b0-4279-9831-3920739d632f...');
  
  try {
    // Update the application status to approved using service role (bypasses RLS)
    const { data, error } = await supabase
      .from('study_applications')
      .update({
        status: 'approved',
        reviewed_at: new Date().toISOString(),
        notes: 'Auto-approved for testing participant study workflow'
      })
      .eq('id', '3556e16c-50b0-4279-9831-3920739d632f')
      .select();

    if (error) {
      console.error('❌ Error updating application:', error);
      return;
    }

    console.log('✅ Application approved successfully:', data);
    
    // Also check current status
    const { data: applicationCheck, error: checkError } = await supabase
      .from('study_applications')
      .select('*')
      .eq('id', '3556e16c-50b0-4279-9831-3920739d632f')
      .single();

    if (checkError) {
      console.error('❌ Error checking application:', checkError);
    } else {
      console.log('📋 Application current status:', applicationCheck);
    }
    
  } catch (err) {
    console.error('💥 Unexpected error:', err);
  }
}

approveApplication();
