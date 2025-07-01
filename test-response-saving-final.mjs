// Test response saving with an already accepted application
import fetch from 'node-fetch';

const baseUrl = 'http://localhost:3003';

async function testResponseSavingWithAcceptedApp() {
  try {
    console.log('🎯 TESTING RESPONSE SAVING WITH ACCEPTED APPLICATION');
    console.log('===================================================');

    // LOGIN AS PARTICIPANT
    console.log('\n1️⃣ LOGIN AS PARTICIPANT');
    const participantLogin = await fetch(`${baseUrl}/api/auth?action=login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'abwanwr77+participant@gmail.com',
        password: 'Testtest123'
      })
    });
    
    const participantData = await participantLogin.json();
    const participantToken = participantData.session.access_token;
    console.log('✅ Participant login successful');

    // GET APPLICATIONS TO FIND ACCEPTED ONE
    console.log('\n2️⃣ FIND ACCEPTED APPLICATION');
    const applicationsResponse = await fetch(`${baseUrl}/api/applications?type=participant`, {
      headers: { 'Authorization': `Bearer ${participantToken}` }
    });
    
    const applicationsData = await applicationsResponse.json();
    
    // Find an accepted application
    const acceptedApp = applicationsData.data.find(app => app.status === 'accepted');
    if (!acceptedApp) {
      throw new Error('No accepted application found');
    }
    
    const studyId = acceptedApp.study_id;
    console.log(`✅ Using accepted application for study: ${studyId}`);
    console.log(`📋 Study: ${acceptedApp.studies.title}`);

    // CREATE SESSION
    console.log('\n3️⃣ CREATE SESSION');
    const sessionResponse = await fetch(`${baseUrl}/api/study-sessions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${participantToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ studyId: studyId })
    });
    
    const sessionData = await sessionResponse.json();
    console.log('Session creation response:', JSON.stringify(sessionData, null, 2));
    
    if (!sessionData.success) {
      throw new Error('Session creation failed: ' + sessionData.error);
    }
    
    // Handle different response formats
    const sessionId = sessionData.data?.id || sessionData.session?.id;
    if (!sessionId) {
      throw new Error('No session ID received');
    }
    
    console.log(`✅ Session ID: ${sessionId}`);

    // SAVE BLOCK RESPONSES - THIS IS THE MAIN TEST
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
          answer: 'This is my comprehensive test response for the open question. The platform seems very easy to use and intuitive. I really appreciate how clean and modern the interface is. The navigation is logical and I can easily find what I need.',
          wordCount: 40
        }
      },
      {
        blockId: 'test_rating',
        blockType: 'opinion_scale',
        response: {
          rating: 5,
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

    let successCount = 0;
    let failureReasons = [];
    
    for (const block of testBlocks) {
      console.log(`   💾 Saving ${block.blockType} response...`);
      
      const requestBody = {
        sessionId: sessionId,
        blockId: block.blockId,
        blockType: block.blockType,
        response: block.response,
        timeSpent: Math.floor(Math.random() * 30) + 10,
        metadata: {
          completedAt: new Date().toISOString(),
          sessionId: sessionId,
          userAgent: 'Test Script',
          screenResolution: '1920x1080',
          viewportSize: '1920x1080'
        },
        startTime: new Date(Date.now() - 30000).toISOString(),
        interactionCount: Math.floor(Math.random() * 5) + 1
      };

      console.log(`   📤 Request body:`, JSON.stringify(requestBody, null, 2));

      const saveResponse = await fetch(`${baseUrl}/api/blocks?action=response`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${participantToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      const saveResult = await saveResponse.json();
      console.log(`   📥 Response result:`, JSON.stringify(saveResult, null, 2));
      
      if (saveResult.success) {
        console.log(`   ✅ ${block.blockType} response saved!`);
        successCount++;
      } else {
        console.log(`   ❌ ${block.blockType} response failed:`, saveResult.error);
        failureReasons.push(`${block.blockType}: ${saveResult.error}`);
      }
    }

    // VERIFY RESPONSES
    console.log('\n5️⃣ VERIFY SAVED RESPONSES');
    const verifyResponse = await fetch(`${baseUrl}/api/study-sessions/${sessionId}`, {
      headers: { 'Authorization': `Bearer ${participantToken}` }
    });
    
    const verifyData = await verifyResponse.json();
    console.log('Session verification:', JSON.stringify(verifyData, null, 2));
    
    let responseCount = 0;
    if (verifyData.success && verifyData.session) {
      // Check for responses in session object (from our blocks API)
      if (verifyData.session.responses) {
        responseCount = Object.keys(verifyData.session.responses).length;
        console.log(`✅ ${responseCount} responses found in session.responses`);
        console.log('📋 Saved response IDs:', Object.keys(verifyData.session.responses));
        
        // Show details of each response
        for (const [blockId, response] of Object.entries(verifyData.session.responses)) {
          console.log(`   - ${blockId}: ${response.blockType} (${response.completedAt})`);
          console.log(`     Response: ${JSON.stringify(response.response).substring(0, 100)}...`);
        }
      } 
      // Check for responses in metadata
      else if (verifyData.session.metadata && verifyData.session.metadata.blockResponses) {
        const metadataResponses = verifyData.session.metadata.blockResponses;
        responseCount = Object.keys(metadataResponses).length;
        console.log(`✅ ${responseCount} responses found in session.metadata.blockResponses`);
        console.log('📋 Saved response IDs:', Object.keys(metadataResponses));
        
        // Show details of each response
        for (const [blockId, response] of Object.entries(metadataResponses)) {
          console.log(`   - ${blockId}: ${response.type} (completed: ${response.completed})`);
          if (response.response) {
            console.log(`     Response: ${JSON.stringify(response.response).substring(0, 100)}...`);
          }
        }
      } else {
        console.log('❌ No responses found in session - checking session structure');
        console.log('Session keys:', Object.keys(verifyData.session));
        if (verifyData.session.metadata) {
          console.log('Metadata keys:', Object.keys(verifyData.session.metadata));
        }
      }
    } else {
      console.log('❌ No session data found in verification response');
    }

    console.log(`\n🎉 RESPONSE SAVING TEST COMPLETE!`);
    console.log(`📊 Summary: ${successCount}/${testBlocks.length} responses saved successfully`);
    
    if (failureReasons.length > 0) {
      console.log(`❌ Failure reasons:`);
      failureReasons.forEach(reason => console.log(`   - ${reason}`));
    }

    return { 
      success: successCount === testBlocks.length, 
      sessionId, 
      responseCount: successCount,
      savedResponses: responseCount,
      failures: failureReasons 
    };

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    return { success: false, error: error.message };
  }
}

testResponseSavingWithAcceptedApp();
