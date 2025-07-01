// Debug Block Response Saving - Step by step debugging
import fetch from 'node-fetch';

const baseUrl = 'http://localhost:3003';

console.log('🐛 DEBUG: Block Response Saving');
console.log('========================================');

// Test credentials
const credentials = {
  email: 'abwanwr77+participant@gmail.com',
  password: 'Testtest123'
};

async function debugResponseSaving() {
  try {
    // 1. Login
    console.log('\n1️⃣ LOGIN');
    const loginResponse = await fetch(`${baseUrl}/api/auth?action=login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    
    if (!loginResponse.ok) {
      throw new Error('Login failed');
    }
    
    const loginData = await loginResponse.json();
    const token = loginData.token;
    console.log('✅ Login successful');

    // 2. Get study
    console.log('\n2️⃣ GET STUDY');
    const studiesResponse = await fetch(`${baseUrl}/api/studies`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const studiesData = await studiesResponse.json();
    const study = studiesData.data?.[0];
    
    if (!study) {
      throw new Error('No study found');
    }
    
    console.log(`✅ Study found: ${study.id}`);

    // 3. Create session
    console.log('\n3️⃣ CREATE SESSION');
    const sessionResponse = await fetch(`${baseUrl}/api/study-sessions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ studyId: study.id })
    });
    
    const sessionData = await sessionResponse.json();
    console.log('Session response:', sessionData);
    
    if (!sessionData.success) {
      throw new Error('Session creation failed: ' + sessionData.error);
    }
    
    const sessionId = sessionData.data.id;
    console.log(`✅ Session created: ${sessionId}`);

    // 4. Try to save a block response with detailed debugging
    console.log('\n4️⃣ SAVE BLOCK RESPONSE (WITH DEBUGGING)');
    
    const responseData = {
      sessionId: sessionId,
      blockId: 'test_welcome',
      blockType: 'welcome_screen',
      response: {
        acknowledged: true,
        timestamp: new Date().toISOString()
      },
      metadata: {
        completedAt: new Date().toISOString(),
        sessionId: sessionId,
        userAgent: 'Debug Script',
        screenResolution: '1920x1080',
        viewportSize: '1920x1080'
      },
      startTime: new Date().toISOString(),
      interactionCount: 1,
      analytics: [
        {
          type: 'block_start',
          timestamp: Date.now() - 5000,
          data: { blockType: 'welcome_screen', blockId: 'test_welcome' },
          sequence: 0
        },
        {
          type: 'block_complete',
          timestamp: Date.now(),
          data: { 
            blockType: 'welcome_screen', 
            blockId: 'test_welcome', 
            timeSpent: 5,
            responseLength: 50,
            interactionCount: 1
          },
          sequence: 1
        }
      ]
    };

    console.log('📤 Sending response data:', JSON.stringify(responseData, null, 2));

    const saveResponse = await fetch(`${baseUrl}/api/blocks?action=response`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(responseData)
    });

    console.log('📥 Response status:', saveResponse.status);
    console.log('📥 Response headers:', Object.fromEntries(saveResponse.headers.entries()));

    const saveResult = await saveResponse.json();
    console.log('📥 Save result:', JSON.stringify(saveResult, null, 2));

    if (saveResult.success) {
      console.log('✅ Block response saved successfully!');
    } else {
      console.log('❌ Block response save failed:', saveResult.error);
    }

    // 5. Verify session was updated
    console.log('\n5️⃣ VERIFY SESSION');
    const verifyResponse = await fetch(`${baseUrl}/api/study-sessions/${sessionId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const verifyData = await verifyResponse.json();
    console.log('Session verification:', JSON.stringify(verifyData, null, 2));

  } catch (error) {
    console.error('❌ Debug failed:', error.message);
  }
}

debugResponseSaving();
