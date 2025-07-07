import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wxpwxzdgdvinlbtnbgdf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4cHd4emRnZHZpbmxidG5iZ2RmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAxOTk1ODAsImV4cCI6MjA2NTc3NTU4MH0.YMai9p4VQMbdqmc_9uWGeJ6nONHwuM9XT2FDTFy0aGk';

const supabase = createClient(supabaseUrl, supabaseKey);

async function createTestApplication() {
  console.log('🔧 Creating test application for end-to-end workflow...\n');
  
  try {
    const applicationData = {
      id: 'test-app-' + Date.now(),
      study_id: '2fd69681-3a09-49c5-b110-a06d8834aee8', // Test New Application Study
      participant_email: 'abwanwr77+participant@gmail.com',
      participant_id: 'a1b2c3d4-e5f6-7890-1234-567890abcdef', // Mock participant ID
      status: 'pending',
      submitted_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      application_data: {
        screening_responses: [],
        motivation: 'I want to participate in this usability study to help improve the user experience.',
        availability: 'Available weekdays and weekends'
      }
    };
    
    console.log('Creating application:', JSON.stringify(applicationData, null, 2));
    
    const { data: application, error } = await supabase
      .from('study_applications')
      .insert(applicationData)
      .select()
      .single();
    
    if (error) {
      console.error('❌ Error creating application:', error);
      return;
    }
    
    console.log('✅ Test application created successfully!');
    console.log('   Application ID:', application.id);
    console.log('   Study ID:', application.study_id);
    console.log('   Participant:', application.participant_email);
    console.log('   Status:', application.status);
    console.log('   Created:', application.created_at);
    
    // Verify the application was created
    const { data: verification, error: verifyError } = await supabase
      .from('study_applications')
      .select('*')
      .eq('id', application.id)
      .single();
    
    if (verifyError) {
      console.error('❌ Error verifying application:', verifyError);
      return;
    }
    
    console.log('\n✅ Application verified in database!');
    console.log('   Status:', verification.status);
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

createTestApplication();
