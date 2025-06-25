/**
 * Test study session API directly with proper authentication
 */
import fetch from 'node-fetch';

const API_BASE = 'http://localhost:3003/api';

async function testStudySessionAPI() {
  console.log('🔍 Testing Study Session API with authentication...\n');

  // Step 1: Login as participant to get a valid token
  console.log('📋 Step 1: Login as participant');
  const loginResponse = await fetch(`${API_BASE}/auth?action=login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email: 'abwanwr77+participant@gmail.com',
      password: 'Testtest123'
    })
  });

  const loginData = await loginResponse.json();
  
  if (!loginData.success || !loginData.session?.access_token) {
    console.error('❌ Login failed:', loginData);
    return;
  }
  
  console.log('✅ Login successful');
  console.log('User ID:', loginData.user?.id);
  const token = loginData.session.access_token;

  // Step 2: Create a study session for the valid study
  console.log('\n📋 Step 2: Create study session');
  const studyId = '6a9957f2-cbab-4013-a149-f02232b3ee9f'; // E-commerce study
  
  const createSessionResponse = await fetch(`${API_BASE}/study-sessions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      studyId: studyId
    })
  });

  const createSessionData = await createSessionResponse.json();
  console.log('Create session response:', createSessionData);

  if (!createSessionData.success) {
    console.error('❌ Session creation failed');
    return;
  }

  const sessionId = createSessionData.session.id;
  console.log('✅ Session created:', sessionId);

  // Step 3: Get the study session
  console.log('\n📋 Step 3: Get study session');
  const getSessionResponse = await fetch(`${API_BASE}/study-sessions/${sessionId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  const getSessionData = await getSessionResponse.json();
  console.log('Get session response:', JSON.stringify(getSessionData, null, 2));

  if (getSessionData.success) {
    console.log('✅ Study session retrieved successfully!');
    console.log('Study title:', getSessionData.session.study?.title);
  } else {
    console.error('❌ Failed to get study session');
  }

  console.log('\n🏁 API test complete');
}

testStudySessionAPI().catch(console.error);
