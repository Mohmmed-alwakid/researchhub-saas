// Test response saving with real session
import fetch from 'node-fetch';

const baseUrl = 'http://localhost:3003';

async function testResponseSavingComplete() {
  try {
    console.log('🎯 COMPLETE RESPONSE SAVING TEST');
    console.log('==================================');

    // 1. Login
    console.log('\n1️⃣ LOGIN');
    const loginResponse = await fetch(`${baseUrl}/api/auth?action=login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'abwanwr77+participant@gmail.com',
        password: 'Testtest123'
      })
    });
    
    const loginData = await loginResponse.json();
    const token = loginData.session.access_token;
    console.log('✅ Login successful');

    // 2. Get existing study
    console.log('\n2️⃣ GET STUDY');
    const studiesResponse = await fetch(`${baseUrl}/api/studies`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const studiesData = await studiesResponse.json();
    const study = studiesData.studies[0];
    console.log(`✅ Using study: ${study.id}`);

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
    console.log('Session creation response:', JSON.stringify(sessionData, null, 2));
    
    if (!sessionData.success) {
      throw new Error('Session creation failed: ' + sessionData.error);
    }
    
    const sessionId = sessionData.data.id;
    console.log(`✅ Session created: ${sessionId}`);

    // 4. Test saving multiple block responses
    console.log('\n4️⃣ SAVE BLOCK RESPONSES');
    
    const testBlocks = [
      {
        blockId: 'test_welcome',
        blockType: 'welcome_screen',
        response: {
          acknowledged: true,
          timestamp: new Date().toISOString()
        }
      },
      {
        blockId: 'test_open_question',
        blockType: 'open_question',
        response: {
          answer: 'This is my test response for the open question. The platform seems easy to use and intuitive.',
          wordCount: 17
        }
      },
      {
        blockId: 'test_rating',
        blockType: 'opinion_scale',
        response: {
          rating: 4,
          scaleType: 'star',
          question: 'How would you rate your overall experience so far?'
        }
      },
      {
        blockId: 'test_thank_you',
        blockType: 'thank_you',
        response: {
          acknowledged: true,
          completedAt: new Date().toISOString()
        }
      }
    ];

    for (const block of testBlocks) {
      console.log(`   💾 Saving ${block.blockType} response...`);
      
      const saveResponse = await fetch(`${baseUrl}/api/blocks?action=response`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sessionId: sessionId,
          blockId: block.blockId,
          blockType: block.blockType,
          response: block.response,
          timeSpent: Math.floor(Math.random() * 30) + 10, // Random time between 10-40 seconds
          metadata: {
            completedAt: new Date().toISOString(),
            sessionId: sessionId,
            userAgent: 'Debug Script',
            screenResolution: '1920x1080',
            viewportSize: '1920x1080'
          },
          startTime: new Date(Date.now() - 30000).toISOString(), // 30 seconds ago
          interactionCount: Math.floor(Math.random() * 5) + 1,
          analytics: [
            {
              type: 'block_start',
              timestamp: Date.now() - 30000,
              data: { blockType: block.blockType, blockId: block.blockId },
              sequence: 0
            },
            {
              type: 'block_complete',
              timestamp: Date.now(),
              data: { 
                blockType: block.blockType, 
                blockId: block.blockId, 
                timeSpent: 30,
                responseLength: JSON.stringify(block.response).length,
                interactionCount: 1
              },
              sequence: 1
            }
          ]
        })
      });

      const saveResult = await saveResponse.json();
      
      if (saveResult.success) {
        console.log(`   ✅ ${block.blockType} response saved!`);
      } else {
        console.log(`   ❌ ${block.blockType} response failed:`, saveResult.error);
      }
    }

    // 5. Verify all responses were saved
    console.log('\n5️⃣ VERIFY SAVED RESPONSES');
    const verifyResponse = await fetch(`${baseUrl}/api/study-sessions/${sessionId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const verifyData = await verifyResponse.json();
    
    if (verifyData.success && verifyData.data.responses) {
      const responseCount = Object.keys(verifyData.data.responses).length;
      console.log(`✅ ${responseCount} responses found in session`);
      console.log('📋 Saved responses:', Object.keys(verifyData.data.responses));
      
      // Show details of each response
      for (const [blockId, response] of Object.entries(verifyData.data.responses)) {
        console.log(`   - ${blockId}: ${response.blockType} (${response.completedAt})`);
      }
    } else {
      console.log('❌ No responses found in session');
      console.log('Session data:', JSON.stringify(verifyData, null, 2));
    }

    console.log('\n🎉 COMPLETE RESPONSE SAVING TEST FINISHED!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testResponseSavingComplete();
