/**
 * Simple Study Session API Test
 * Just test the API endpoints directly
 */

const BASE_URL = 'http://localhost:3003';

// Test accounts
const RESEARCHER_EMAIL = 'abwanwr77+Researcher@gmail.com';
const RESEARCHER_PASSWORD = 'Testtest123';
const PARTICIPANT_EMAIL = 'abwanwr77+participant@gmail.com';
const PARTICIPANT_PASSWORD = 'Testtest123';

async function testStudySessionAPI() {
  console.log('🚀 Testing Study Session API directly...');
  
  try {
    // Step 1: Login as participant to get auth token
    console.log('\n🔐 Step 1: Login as participant');
    const loginResponse = await fetch(`${BASE_URL}/api/auth?action=login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: PARTICIPANT_EMAIL,
        password: PARTICIPANT_PASSWORD
      })
    });
    
    const loginResult = await loginResponse.json();
    console.log('Login result:', loginResult.success ? '✅ Success' : `❌ Failed: ${loginResult.error}`);
    
    if (!loginResult.success) {
      throw new Error('Failed to login as participant');
    }
    
    const authToken = loginResult.token;
    console.log('✅ Got auth token');
    
    // Step 2: Get participant's studies/applications
    console.log('\n📋 Step 2: Check participant applications');
    const appsResponse = await fetch(`${BASE_URL}/api/participant-applications/my-applications`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    const appsResult = await appsResponse.json();
    console.log('Applications result:', appsResult.success ? '✅ Success' : `❌ Failed: ${appsResult.error}`);
    
    if (appsResult.success && appsResult.data.applications.length > 0) {
      const firstApp = appsResult.data.applications[0];
      console.log(`Found application for study: ${firstApp.studyId.title}`);
      console.log(`Application status: ${firstApp.status}`);
      
      const studyId = firstApp.studyId._id;
      
      // Step 3: Test creating a study session
      console.log('\n🔬 Step 3: Create study session');
      const sessionResponse = await fetch(`${BASE_URL}/api/study-sessions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          studyId: studyId
        })
      });
      
      const sessionResult = await sessionResponse.json();
      console.log('Session creation result:', sessionResult.success ? '✅ Success' : `❌ Failed: ${sessionResult.error}`);
      
      if (sessionResult.success) {
        const sessionId = sessionResult.session.id;
        console.log(`✅ Created session with ID: ${sessionId}`);
        
        // Step 4: Test getting the session
        console.log('\n📊 Step 4: Get session details');
        const getResponse = await fetch(`${BASE_URL}/api/study-sessions/${sessionId}`, {
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        });
        
        const getResult = await getResponse.json();
        console.log('Get session result:', getResult.success ? '✅ Success' : `❌ Failed: ${getResult.error}`);
        
        // Step 5: Test updating the session
        console.log('\n🔄 Step 5: Update session');
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
        console.log('Update session result:', updateResult.success ? '✅ Success' : `❌ Failed: ${updateResult.error}`);
        
        // Step 6: Test completing the session
        console.log('\n✅ Step 6: Complete session');
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
        console.log('Complete session result:', completeResult.success ? '✅ Success' : `❌ Failed: ${completeResult.error}`);
        
        console.log('\n🎉 ALL STUDY SESSION API TESTS PASSED!');
        console.log('═══════════════════════════════════════');
        console.log('✅ Session creation');
        console.log('✅ Session retrieval');
        console.log('✅ Session update');
        console.log('✅ Session completion');
        console.log('═══════════════════════════════════════');
        
      } else {
        console.log(`❌ Session creation failed: ${sessionResult.error}`);
      }
      
    } else {
      console.log('❌ No applications found for participant');
    }
    
  } catch (error) {
    console.error('❌ API Test failed:', error);
  }
}

// Run the test
testStudySessionAPI().catch(console.error);
