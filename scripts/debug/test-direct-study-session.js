#!/usr/bin/env node

/**
 * Direct Study Session Test
 * Tests study session creation with known approved study
 */

const LOCAL_API = 'http://localhost:3003/api';
const PARTICIPANT_EMAIL = 'abwanwr77+participant@gmail.com';
const PARTICIPANT_PASSWORD = 'Testtest123';

// From our MCP Playwright testing, we know this study has approved applications
const KNOWN_APPROVED_STUDY_ID = 'mock-study-001';

async function testDirectStudySession() {
  console.log('🔧 DIRECT STUDY SESSION TEST');
  console.log('============================\n');

  try {
    // Step 1: Login as participant
    console.log('🔐 Step 1: Participant Login');
    const loginResponse = await fetch(`${LOCAL_API}/auth?action=login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: PARTICIPANT_EMAIL,
        password: PARTICIPANT_PASSWORD
      })
    });

    const loginResult = await loginResponse.json();
    if (!loginResult.success) {
      throw new Error(`Login failed: ${loginResult.error}`);
    }

    const token = loginResult.session?.access_token;
    console.log('✅ Participant authenticated successfully');

    // Step 2: Test study session creation directly
    console.log(`\n🔬 Step 2: Create Study Session`);
    console.log(`   Study ID: ${KNOWN_APPROVED_STUDY_ID}`);

    const sessionResponse = await fetch(`${LOCAL_API}/research-consolidated?action=start-session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        study_id: KNOWN_APPROVED_STUDY_ID
      })
    });

    console.log(`   Response status: ${sessionResponse.status}`);
    const sessionResult = await sessionResponse.json();
    console.log(`   Response data:`, JSON.stringify(sessionResult, null, 2));
    
    if (sessionResult.success) {
      console.log('\n✅ SUCCESS: Study session created!');
      console.log(`   Session ID: ${sessionResult.session?.sessionId || sessionResult.data?.sessionId}`);
      console.log('   The backend API is working correctly.');
      console.log('   Issue is likely in frontend navigation/routing.');
    } else {
      console.log(`\n❌ Study session creation failed: ${sessionResult.error}`);
      
      if (sessionResult.error?.includes('403') || sessionResult.error?.includes('approved')) {
        console.log('   This means the application approval system is working correctly!');
        console.log('   Need to ensure there are actually approved applications for testing.');
      }
    }

    // Step 3: Test alternate study session API endpoint
    console.log(`\n🔄 Step 3: Test Alternate API Endpoint`);
    
    const altSessionResponse = await fetch(`${LOCAL_API}/study-sessions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        studyId: KNOWN_APPROVED_STUDY_ID
      })
    });

    console.log(`   Response status: ${altSessionResponse.status}`);
    const altSessionResult = await altSessionResponse.json();
    console.log(`   Response data:`, JSON.stringify(altSessionResult, null, 2));

    if (altSessionResult.success) {
      console.log('\n✅ SUCCESS: Study session created via alternate endpoint!');
      console.log('   This confirms the backend is working.');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testDirectStudySession();
