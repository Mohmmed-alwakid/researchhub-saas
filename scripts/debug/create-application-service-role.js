/**
 * Create test application using service role to bypass RLS
 */
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wxpwxzdgdvinlbtnbgdf.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4cHd4emRnZHZpbmxidG5iZ2RmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDE5OTU4MCwiZXhwIjoyMDY1Nzc1NTgwfQ.p_lVJr1uXJo9FGNeTf6rWxAYjrHGNwH_OWsJchjhUhM'; // Service role key bypasses RLS

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function createTestApplicationWithServiceRole() {
  console.log('🔧 Creating test application with service role...\n');

  const participantId = '9876c870-79e9-4106-99d6-9080049ec2aa'; 
  const studyId = '6a9957f2-cbab-4013-a149-f02232b3ee9f'; 
  const applicationId = '3c349697-b376-4d9c-8d34-6333d68b9c02'; 

  // Check if application exists first
  const { data: existingApp } = await supabase
    .from('study_applications')
    .select('*')
    .eq('id', applicationId)
    .single();

  if (existingApp) {
    console.log('✅ Application already exists:', existingApp);
    return existingApp;
  }

  // Create the application
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

  // Also ensure participant profile exists
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', participantId)
    .single();

  if (profileError) {
    console.log('Creating participant profile...');
    const { data: newProfile, error: createProfileError } = await supabase
      .from('profiles')
      .insert({
        id: participantId,
        email: 'test-participant@researchhub.com',
        role: 'participant',
        full_name: 'Test Participant Session User',
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
    console.log('✅ Profile already exists:', profile);
  }

  return newApp;
}

createTestApplicationWithServiceRole().catch(console.error);
