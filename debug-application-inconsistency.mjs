import fetch from 'node-fetch';
import { createClient } from '@supabase/supabase-js';

const API_BASE = 'http://localhost:3003/api';
const STUDY_ID = '2fd69681-3a09-49c5-b110-a06d8834aee8';
const SUPABASE_URL = 'https://wxpwxzdgdvinlbtnbgdf.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4cHd4emRnZHZpbmxidG5iZ2RmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAxOTk1ODAsImV4cCI6MjA2NTc3NTU4MH0.YMai9p4VQMbdqmc_9uWGeJ6nONHwuM9XT2FDTFy0aGk';

async function debugApplicationInconsistency() {
  console.log('🔍 DEBUGGING APPLICATION STATUS INCONSISTENCY\n');
  
  try {
    // Step 1: Login and get token
    console.log('🔐 Step 1: Getting authenticated token...');
    
    const loginResponse = await fetch(`${API_BASE}/auth?action=login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'abwanwr77+participant@gmail.com',
        password: 'Testtest123'
      })
    });
    
    const loginData = await loginResponse.json();
    const authToken = loginData.session.access_token;
    const userId = loginData.user.id;
    
    console.log(`✅ User ID: ${userId}`);
    console.log(`✅ Token: ${authToken.substring(0, 30)}...\n`);
    
    // Step 2: Test different Supabase client configurations
    console.log('🗄️ Step 2: Testing different database access methods...\n');
    
    // 2a. Basic anon client (like checkApplicationStatus uses)
    console.log('2a. Testing with ANON client (like checkApplicationStatus):');
    const basicSupabase = createClient(SUPABASE_URL, SUPABASE_KEY);
    
    const { data: basicResult, error: basicError } = await basicSupabase
      .from('study_applications')
      .select('id, status, created_at')
      .eq('study_id', STUDY_ID)
      .eq('participant_id', userId);
    
    console.log('   Result:', { data: basicResult, error: basicError });
    console.log(`   Found ${basicResult?.length || 0} applications\n`);
    
    // 2b. Authenticated client (like submitStudyApplication uses)
    console.log('2b. Testing with AUTHENTICATED client (like submitStudyApplication):');
    const authSupabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
      global: {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      }
    });
    
    const { data: authResult, error: authError } = await authSupabase
      .from('study_applications')
      .select('id, status, created_at')
      .eq('study_id', STUDY_ID)
      .eq('participant_id', userId);
    
    console.log('   Result:', { data: authResult, error: authError });
    console.log(`   Found ${authResult?.length || 0} applications\n`);
    
    // 2c. Check all applications for this user (no study filter)
    console.log('2c. Testing ALL applications for this user:');
    const { data: allUserApps, error: allUserError } = await authSupabase
      .from('study_applications')
      .select('*')
      .eq('participant_id', userId);
    
    console.log('   Result:', { data: allUserApps, error: allUserError });
    console.log(`   Found ${allUserApps?.length || 0} total applications for user\n`);
    
    // 2d. Check all applications in table (no filters)
    console.log('2d. Testing ALL applications in table:');
    const { data: allApps, error: allAppsError } = await basicSupabase
      .from('study_applications')
      .select('*');
    
    console.log('   Result:', { data: allApps, error: allAppsError });
    console.log(`   Found ${allApps?.length || 0} total applications in table\n`);
    
    // Step 3: Try to submit an application to see what happens
    console.log('📝 Step 3: Attempting to submit application with detailed logging...');
    
    const submitResponse = await fetch(`${API_BASE}/applications?endpoint=studies/${STUDY_ID}/apply`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({ screeningResponses: [] })
    });
    
    const submitData = await submitResponse.json();
    console.log('📊 Submit response:', JSON.stringify(submitData, null, 2));
    
    // Step 4: Check what user ID the API is actually using
    console.log('\n🔍 Step 4: Verify user ID from token...');
    
    const { data: { user }, error: tokenError } = await basicSupabase.auth.getUser(authToken);
    console.log('   Token user verification:', { user: user?.id, error: tokenError });
    
  } catch (error) {
    console.error('❌ Debug error:', error);
  }
}

debugApplicationInconsistency();
