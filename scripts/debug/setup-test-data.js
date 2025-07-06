import { createClient } from '@supabase/supabase-js';

// Use service role key for admin operations
const supabase = createClient(
  'https://wxpwxzdgdvinlbtnbgdf.supabase.co', 
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4cHd4emRnZHZpbmxidG5iZ2RmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDE5OTU4MCwiZXhwIjoyMDY1Nzc1NTgwfQ.l-lLRLnAWuTPzJZ-iNrYITuagCcNz6RhOoOBAJFMxU8'
);

// Test participant credentials
const PARTICIPANT_EMAIL = 'abwanwr77+participant@gmail.com';

async function setupTestData() {
  try {
    console.log('🛠️ Setting up test data for study session testing...\n');
    
    // 1. Get available studies
    console.log('📋 Step 1: Getting available studies...');
    const { data: studies, error: studiesError } = await supabase
      .from('studies')
      .select('id, title, status')
      .eq('status', 'active')
      .limit(1);
    
    if (!studies || studies.length === 0) {
      console.log('❌ No active studies found. Creating a test study...');
      
      // Create a basic test study
      const { data: newStudy, error: createError } = await supabase
        .from('studies')
        .insert({
          title: 'Study Session Test Study',
          description: 'A test study for testing the study session flow',
          status: 'active',
          is_public: true,
          target_participants: 10,
          researcher_id: '550e8400-e29b-41d4-a716-446655440000', // dummy researcher ID
          settings: {
            type: 'usability',
            duration: 15,
            compensation: 25,
            maxParticipants: 10
          },
          tasks: [
            {
              type: 'welcome_screen',
              title: 'Welcome',
              description: 'Welcome to our study'
            },
            {
              type: 'open_question', 
              title: 'First Impression',
              description: 'What is your first impression?'
            }
          ]
        })
        .select()
        .single();
        
      if (createError) {
        console.error('❌ Failed to create test study:', createError);
        return;
      }
      
      console.log('✅ Created test study:', newStudy.id);
      studies.push(newStudy);
    }
    
    const testStudy = studies[0];
    console.log(`✅ Using study: ${testStudy.id} - ${testStudy.title}`);
    
    // 2. Get or create participant user
    console.log('\n👥 Step 2: Getting participant user...');
    const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers();
    
    let participantUser = users?.find(user => user.email === PARTICIPANT_EMAIL);
    
    if (!participantUser) {
      console.log('❌ Participant user not found. Please ensure the test accounts are created first.');
      console.log('Run the auth test first to create the participant account.');
      return;
    }
    
    console.log(`✅ Found participant user: ${participantUser.id}`);
    
    // 3. Check if profile exists
    console.log('\n👤 Step 3: Checking/creating participant profile...');
    const { data: existingProfile, error: profileCheckError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', participantUser.id)
      .single();
    
    if (!existingProfile) {
      console.log('Creating participant profile...');
      const { data: newProfile, error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: participantUser.id,
          email: participantUser.email,
          role: 'participant',
          first_name: 'Test',
          last_name: 'Participant'
        })
        .select()
        .single();
        
      if (profileError) {
        console.error('❌ Failed to create profile:', profileError);
        return;
      }
      
      console.log('✅ Created participant profile');
    } else {
      console.log('✅ Participant profile exists');
    }
    
    // 4. Create or update study application
    console.log('\n📝 Step 4: Creating approved study application...');
    
    // Check if application already exists
    const { data: existingApp, error: appCheckError } = await supabase
      .from('study_applications')
      .select('*')
      .eq('study_id', testStudy.id)
      .eq('participant_id', participantUser.id)
      .single();
    
    if (existingApp) {
      console.log('Application exists, updating status to approved...');
      const { error: updateError } = await supabase
        .from('study_applications')
        .update({ 
          status: 'approved',
          reviewed_at: new Date().toISOString()
        })
        .eq('id', existingApp.id);
        
      if (updateError) {
        console.error('❌ Failed to update application:', updateError);
        return;
      }
    } else {
      console.log('Creating new approved application...');
      const { data: newApp, error: appError } = await supabase
        .from('study_applications')
        .insert({
          study_id: testStudy.id,
          participant_id: participantUser.id,
          status: 'approved',
          application_data: {},
          applied_at: new Date().toISOString(),
          reviewed_at: new Date().toISOString()
        })
        .select()
        .single();
        
      if (appError) {
        console.error('❌ Failed to create application:', appError);
        return;
      }
      
      console.log('✅ Created approved application:', newApp.id);
    }
    
    console.log('\n🎉 Test data setup complete!');
    console.log(`📋 Study ID: ${testStudy.id}`);
    console.log(`👤 Participant ID: ${participantUser.id}`);
    console.log(`📧 Participant Email: ${PARTICIPANT_EMAIL}`);
    console.log('\n✅ Ready to test study session flow!');
    
  } catch (err) {
    console.error('❌ Exception:', err.message);
  }
}

setupTestData();
