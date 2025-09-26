import { createClient } from '@supabase/supabase-js';

// Use regular client with participant login
const supabase = createClient(
  'https://wxpwxzdgdvinlbtnbgdf.supabase.co', 
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4cHd4emRnZHZpbmxidG5iZ2RmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAxOTk1ODAsImV4cCI6MjA2NTc3NTU4MH0.YMai9p4VQMbdqmc_9uWGeJ6nONHwuM9XT2FDTFy0aGk'
);

async function createTestApplicationForSession() {
  try {
    console.log('🛠️ Creating test application for session testing...\n');
    
    // 1. Login as participant
    console.log('🔐 Logging in as participant...');
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'abwanwr77+participant@gmail.com',
      password: 'Testtest123'
    });
    
    if (authError) {
      console.error('❌ Login failed:', authError);
      return;
    }
    
    console.log('✅ Login successful:', authData.user.id);
    
    // 2. Get available studies
    console.log('\n📋 Getting available studies...');
    const { data: studies, error: studiesError } = await supabase
      .from('studies')
      .select('id, title, status')
      .eq('status', 'active')
      .limit(1);
    
    if (!studies || studies.length === 0) {
      console.log('❌ No active studies found');
      return;
    }
    
    const testStudy = studies[0];
    console.log(`✅ Found study: ${testStudy.id} - ${testStudy.title}`);
    
    // 3. Check if application already exists
    console.log('\n📝 Checking for existing application...');
    const { data: existingApp, error: appCheckError } = await supabase
      .from('study_applications')
      .select('*')
      .eq('study_id', testStudy.id)
      .eq('participant_id', authData.user.id);
    
    if (existingApp && existingApp.length > 0) {
      console.log('✅ Application already exists:', existingApp[0].id);
      console.log('Status:', existingApp[0].status);
      
      if (existingApp[0].status !== 'approved') {
        console.log('⚠️ Application is not approved. Manual approval needed.');
        console.log('Use Supabase dashboard to update status to "approved"');
      }
      
      return existingApp[0];
    }
    
    // 4. Create new application
    console.log('Creating new application...');
    const { data: newApp, error: appError } = await supabase
      .from('study_applications')
      .insert({
        study_id: testStudy.id,
        participant_id: authData.user.id,
        status: 'pending', // Will need manual approval
        application_data: {},
        applied_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (appError) {
      console.error('❌ Failed to create application:', appError);
      return;
    }
    
    console.log('✅ Created new application:', newApp.id);
    console.log('⚠️ Status: pending - needs manual approval');
    console.log('\n📝 To approve this application:');
    console.log(`1. Go to Supabase dashboard`);
    console.log(`2. Open study_applications table`);
    console.log(`3. Find application ID: ${newApp.id}`);
    console.log(`4. Update status from "pending" to "approved"`);
    console.log(`5. Set reviewed_at to current timestamp`);
    
    return newApp;
    
  } catch (err) {
    console.error('❌ Exception:', err.message);
  }
}

createTestApplicationForSession();
