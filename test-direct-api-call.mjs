/**
 * TEST DIRECT API CALL WITH DETAILED LOGGING
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wxpwxzdgdvinlbtnbgdf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4cHd4emRnZHZpbmxidG5iZ2RmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAxOTk1ODAsImV4cCI6MjA2NTc3NTU4MH0.YMai9p4VQMbdqmc_9uWGeJ6nONHwuM9XT2FDTFy0aGk';

async function testDirectAPICall() {
  console.log('🧪 TESTING DIRECT API CALL WITH LOGGING');
  console.log('=' .repeat(50));

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // Login
    const { data: researcherAuth, error: researcherError } = await supabase.auth.signInWithPassword({
      email: 'abwanwr77+researcher@gmail.com',
      password: 'Testtest123'
    });

    if (researcherError) {
      console.error('❌ Login failed:', researcherError);
      return;
    }

    console.log('✅ Logged in successfully');
    console.log('👤 User ID:', researcherAuth.user.id);

    // Test the API call with full details
    const studyId = '99a0f9b1-bdfe-46b8-961a-97dc3d29fb98';
    const url = `http://localhost:3003/api/applications?endpoint=study/${studyId}/applications`;
    
    console.log('\n📡 Making API call...');
    console.log('URL:', url);
    console.log('Auth token length:', researcherAuth.session.access_token.length);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${researcherAuth.session.access_token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('\n📊 Response details:');
    console.log('Status:', response.status);
    console.log('Status text:', response.statusText);
    console.log('Headers:', Object.fromEntries(response.headers));

    const responseText = await response.text();
    console.log('\n📄 Raw response body:');
    console.log(responseText);

    try {
      const responseJson = JSON.parse(responseText);
      console.log('\n📝 Parsed response:');
      console.log(JSON.stringify(responseJson, null, 2));
    } catch (e) {
      console.log('❌ Could not parse response as JSON');
    }

  } catch (error) {
    console.error('❌ Test Error:', error);
  }
}

testDirectAPICall();
