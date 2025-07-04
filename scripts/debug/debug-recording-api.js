// Direct Recording API Test - Debug Version
// Tests the recording API directly to identify specific issues

const baseUrl = 'http://localhost:3003/api';

async function debugRecordingAPI() {
  console.log('🔧 DEBUGGING RECORDING API');
  console.log('=' .repeat(50));

  try {
    // Test direct database access
    console.log('1️⃣  Testing direct recording API call...');
    const response = await fetch(`${baseUrl}/recordings`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    const result = await response.text();
    console.log('Raw response:', result);

    if (response.status !== 200) {
      try {
        const jsonError = JSON.parse(result);
        console.log('Parsed error:', jsonError);
      } catch (e) {
        console.log('Could not parse error as JSON');
      }
    }

    // Test session creation with more details
    console.log('\n2️⃣  Testing session creation with debug...');
    const sessionResponse = await fetch(`${baseUrl}/recordings?action=create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        studyId: 'debug-test-study-123',
        participantId: 'debug-test-participant-456',
        sessionName: 'Debug Test Session',
        recordingSettings: {
          screen: true,
          audio: false
        }
      })
    });

    console.log('Session creation status:', sessionResponse.status);
    const sessionResult = await sessionResponse.text();
    console.log('Session creation response:', sessionResult);

    if (sessionResponse.status !== 200) {
      try {
        const sessionJsonError = JSON.parse(sessionResult);
        console.log('Session creation error details:', sessionJsonError);
      } catch (e) {
        console.log('Could not parse session error as JSON');
      }
    }

    // Test authenticated session creation
    console.log('\n3️⃣  Testing with authentication...');
    const loginResponse = await fetch(`${baseUrl}/auth?action=login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'abwanwr77+Researcher@gmail.com',
        password: 'Testtest123'
      })
    });

    if (loginResponse.status === 200) {
      const loginResult = await loginResponse.json();
      const token = loginResult.token;
      console.log('✅ Login successful, testing authenticated recording...');

      const authRecordingResponse = await fetch(`${baseUrl}/recordings?action=create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          studyId: 'auth-debug-study-789',
          participantId: 'auth-debug-participant-123',
          sessionName: 'Authenticated Debug Session',
          recordingSettings: {
            screen: true,
            audio: false
          }
        })
      });

      console.log('Authenticated recording status:', authRecordingResponse.status);
      const authResult = await authRecordingResponse.text();
      console.log('Authenticated recording response:', authResult);
    } else {
      console.log('❌ Login failed for authentication test');
    }

  } catch (error) {
    console.error('❌ Debug test failed:', error.message);
    console.error('Error stack:', error.stack);
  }
}

// Run debug test
debugRecordingAPI();
