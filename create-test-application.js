import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wxpwxzdgdvinlbtnbgdf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4cHd4emRnZHZpbmxidG5iZ2RmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAxOTk1ODAsImV4cCI6MjA2NTc3NTU4MH0.YMai9p4VQMbdqmc_9uWGeJ6nONHwuM9XT2FDTFy0aGk';

const supabase = createClient(supabaseUrl, supabaseKey);

async function createTestApplication() {
  console.log('� Creating test application for study session workflow...\n');

  const participantId = '9876c870-79e9-4106-99d6-9080049ec2aa'; // From the valid session
  const studyId = '6a9957f2-cbab-4013-a149-f02232b3ee9f'; // The E-commerce study
  const applicationId = '3c349697-b376-4d9c-8d34-6333d68b9c02'; // From session metadata

  // Check if application already exists
  console.log('📋 Step 1: Check if application exists');
  const { data: existingApp, error: existingError } = await supabase
    .from('study_applications')
    .select('*')
    .eq('id', applicationId)
    .single();

  if (existingApp) {
    console.log('✅ Application already exists:', existingApp);
    return existingApp;
  }

  if (existingError && existingError.code !== 'PGRST116') {
    console.error('❌ Error checking existing application:', existingError);
    return;
  }

  console.log('📋 Step 2: Create new application');
  const { data: newApp, error: createError } = await supabase
    .from('study_applications')
    .insert({
      id: applicationId,
      study_id: studyId,
      participant_id: participantId,
      status: 'accepted',
      application_data: {
        message: 'Test application for e-commerce checkout flow testing',
        experience: 'intermediate',
        availability: 'weekends'
      },
      created_at: new Date().toISOString()
    })
    .select()
    .single();

  if (createError) {
    console.error('❌ Error creating application:', createError);
    return;
  }

  console.log('✅ Application created successfully:', newApp);

  // Verify participant profile exists
  console.log('\n📋 Step 3: Verify participant profile');
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', participantId)
    .single();

  if (profileError) {
    console.log('⚠️ Participant profile not found, creating one...');
    
    const { data: newProfile, error: createProfileError } = await supabase
      .from('profiles')
      .insert({
        id: participantId,
        email: 'test-participant@researchhub.com',
        role: 'participant',
        full_name: 'Test Participant',
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (createProfileError) {
      console.error('❌ Error creating profile:', createProfileError);
    } else {
      console.log('✅ Profile created:', newProfile);
    }
  } else {
    console.log('✅ Profile exists:', profile);
  }

  console.log('\n🏁 Test data setup complete');
  return newApp;
}

createTestApplication().catch(console.error);
