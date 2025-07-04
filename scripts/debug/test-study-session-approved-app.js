/**
 * Test Study Session API with Approved Application
 */

const BASE_URL = 'http://localhost:3003';
const PARTICIPANT_EMAIL = 'abwanwr77+participant@gmail.com';
const PARTICIPANT_PASSWORD = 'Testtest123';

// From the approved application we just created
const STUDY_ID = '6a9957f2-cbab-4013-a149-f02232b3ee9f';

async function testStudySessionWithApprovedApp() {
  console.log('🚀 Testing Study Session API with approved application...');
  
  try {
    // Step 1: Login as participant
    console.log('\n🔐 Step 1: Login as participant');
    const loginResponse = await fetch(`${BASE_URL}/api/auth?action=login`, {
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
    
    const authToken = loginResult.token;
    console.log('✅ Login successful');
    
    // Step 2: Create study session
    console.log('\n🔬 Step 2: Create study session');
    const sessionResponse = await fetch(`${BASE_URL}/api/study-sessions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        studyId: STUDY_ID
      })
    });
    
    console.log(`Session API Status: ${sessionResponse.status}`);
    
    let sessionResult;
    try {
      sessionResult = await sessionResponse.json();
    } catch (parseError) {
      // If JSON parsing fails, get text to see what was returned
      const responseText = await sessionResponse.text();
      console.log('Raw response:', responseText);
      throw new Error(`Failed to parse response as JSON: ${parseError.message}`);
    }
    
    console.log(`Session API Success: ${sessionResult.success ? '✅' : '❌'}`);
    
    if (!sessionResult.success) {
      console.log(`Session API Error: ${sessionResult.error}`);
      return;
    }
    
    const sessionId = sessionResult.session.id;
    console.log(`✅ Created session: ${sessionId}`);
    
    // Step 3: Get session details
    console.log('\n📊 Step 3: Get session details');
    const getResponse = await fetch(`${BASE_URL}/api/study-sessions/${sessionId}`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    
    const getResult = await getResponse.json();
    console.log(`Get session: ${getResult.success ? '✅' : '❌'}`);
    if (!getResult.success) {
      console.log(`Get error: ${getResult.error}`);
    }
    
    // Step 4: Update session
    console.log('\n🔄 Step 4: Update session');
    const updateResponse = await fetch(`${BASE_URL}/api/study-sessions/${sessionId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        sessionData: { currentTask: 1, progress: 50 }
      })
    });
    
    const updateResult = await updateResponse.json();
    console.log(`Update session: ${updateResult.success ? '✅' : '❌'}`);
    if (!updateResult.success) {
      console.log(`Update error: ${updateResult.error}`);
    }
    
    // Step 5: Complete session
    console.log('\n✅ Step 5: Complete session');
    const completeResponse = await fetch(`${BASE_URL}/api/study-sessions/${sessionId}?action=complete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        finalData: { completedTasks: 1, totalTime: 300 },
        completionNotes: 'Test session completed successfully'
      })
    });
    
    const completeResult = await completeResponse.json();
    console.log(`Complete session: ${completeResult.success ? '✅' : '❌'}`);
    if (!completeResult.success) {
      console.log(`Complete error: ${completeResult.error}`);
    }
    
    if (sessionResult.success && getResult.success && updateResult.success && completeResult.success) {
      console.log('\n🎉 ALL STUDY SESSION TESTS PASSED!');
      console.log('═══════════════════════════════════════');
      console.log('✅ Session creation from approved application');
      console.log('✅ Session retrieval');
      console.log('✅ Session update');
      console.log('✅ Session completion');
      console.log('═══════════════════════════════════════');
      console.log('\n🚀 READY FOR UI TESTING!');
      console.log('The study session API is working properly.');
      console.log('You can now test the UI workflow:');
      console.log('1. Login as participant at http://localhost:5175');
      console.log('2. Navigate to participant dashboard');
      console.log('3. Look for approved studies with "Start Study" button');
      console.log('4. Click to start study session');
    }
    
  } catch (error) {
    console.error('❌ Study session test failed:', error);
  }
}

testStudySessionWithApprovedApp();
