import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://wxpwxzdgdvinlbtnbgdf.supabase.co', 
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4cHd4emRnZHZpbmxidG5iZ2RmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAxOTk1ODAsImV4cCI6MjA2NTc3NTU4MH0.YMai9p4VQMbdqmc_9uWGeJ6nONHwuM9XT2FDTFy0aGk'
);

async function approveApplication() {
  try {
    console.log('🔓 Approving test application...\n');
    
    const applicationId = '63db72b7-cde7-47e8-a201-4ccf91bba432';
    
    // First login as researcher to get proper permissions (or we can try as admin)
    console.log('🔐 Logging in as researcher...');
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'abwanwr77+Researcher@gmail.com',
      password: 'Testtest123'
    });
    
    if (authError) {
      console.error('❌ Login failed:', authError);
      return;
    }
    
    console.log('✅ Login successful as researcher');
    
    // Try to update the application status
    console.log('📝 Updating application status...');
    const { data: updatedApp, error: updateError } = await supabase
      .from('study_applications')
      .update({
        status: 'approved',
        reviewed_at: new Date().toISOString(),
        reviewed_by: authData.user.id
      })
      .eq('id', applicationId)
      .select()
      .single();
    
    if (updateError) {
      console.error('❌ Failed to update application:', updateError);
      return;
    }
    
    console.log('✅ Application approved successfully!');
    console.log('Application details:', updatedApp);
    
    console.log('\n🎉 Ready to test study session!');
    console.log('You can now use the study session test interface.');
    
  } catch (err) {
    console.error('❌ Exception:', err.message);
  }
}

approveApplication();
