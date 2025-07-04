// Complete workflow test: Apply -> Approve -> Session -> Responses
import fetch from 'node-fetch';

const baseUrl = 'http://localhost:3003';

async function completeWorkflowTest() {
  try {
    console.log('🎯 COMPLETE WORKFLOW TEST: Apply -> Approve -> Session -> Responses');
    console.log('====================================================================');

    // STEP 1: LOGIN AS PARTICIPANT
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

    // STEP 2: GET STUDY TO APPLY TO
    console.log('\n2️⃣ GET STUDY');
    const studiesResponse = await fetch(`${baseUrl}/api/studies`, {
      headers: { 'Authorization': `Bearer ${participantToken}` }
    });
    
    const studiesData = await studiesResponse.json();
    const study = studiesData.studies[0];
    console.log(`✅ Using study: ${study.id}`);

    // STEP 3: APPLY TO STUDY
    console.log('\n3️⃣ APPLY TO STUDY');
    const applicationResponse = await fetch(`${baseUrl}/api/applications`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${participantToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        studyId: study.id,
        message: 'I would like to participate in this test study for response saving debugging.'
      })
    });
    
    const applicationData = await applicationResponse.json();
    console.log('Application response:', JSON.stringify(applicationData, null, 2));
    
    if (!applicationData.success) {
      throw new Error('Application failed: ' + applicationData.error);
    }
    
    const applicationId = applicationData.data.id;
    console.log(`✅ Application submitted: ${applicationId}`);

    // STEP 4: LOGIN AS RESEARCHER TO APPROVE
    console.log('\n4️⃣ LOGIN AS RESEARCHER');
    const researcherLogin = await fetch(`${baseUrl}/api/auth?action=login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'abwanwr77+Researcher@gmail.com',
        password: 'Testtest123'
      })
    });
    
    const researcherData = await researcherLogin.json();
    const researcherToken = researcherData.session.access_token;
    console.log('✅ Researcher login successful');

    // STEP 5: APPROVE APPLICATION
    console.log('\n5️⃣ APPROVE APPLICATION');
    const approvalResponse = await fetch(`${baseUrl}/api/applications/${applicationId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${researcherToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        status: 'approved',
        feedback: 'Application approved for testing purposes.'
      })
    });
    
    const approvalData = await approvalResponse.json();
    console.log('Approval response:', JSON.stringify(approvalData, null, 2));
    
    if (!approvalData.success) {
      throw new Error('Approval failed: ' + approvalData.error);
    }
    
    console.log('✅ Application approved');

    // STEP 6: PARTICIPANT CREATE SESSION
    console.log('\n6️⃣ CREATE SESSION (AS PARTICIPANT)');
    const sessionResponse = await fetch(`${baseUrl}/api/study-sessions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${participantToken}`,
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

    // STEP 7: SAVE BLOCK RESPONSES
    console.log('\n7️⃣ SAVE BLOCK RESPONSES');
    
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
          answer: 'This is my test response for the open question. The platform seems easy to use and intuitive. I really like how clean the interface is.',
          wordCount: 24
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

    let successCount = 0;
    for (const block of testBlocks) {
      console.log(`   💾 Saving ${block.blockType} response...`);
      
      const saveResponse = await fetch(`${baseUrl}/api/blocks?action=response`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${participantToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sessionId: sessionId,
          blockId: block.blockId,
          blockType: block.blockType,
          response: block.response,
          timeSpent: Math.floor(Math.random() * 30) + 10
        })
      });

      const saveResult = await saveResponse.json();
      
      if (saveResult.success) {
        console.log(`   ✅ ${block.blockType} response saved!`);
        successCount++;
      } else {
        console.log(`   ❌ ${block.blockType} response failed:`, saveResult.error);
      }
    }

    // STEP 8: VERIFY RESPONSES
    console.log('\n8️⃣ VERIFY SAVED RESPONSES');
    const verifyResponse = await fetch(`${baseUrl}/api/study-sessions/${sessionId}`, {
      headers: { 'Authorization': `Bearer ${participantToken}` }
    });
    
    const verifyData = await verifyResponse.json();
    
    if (verifyData.success && verifyData.data.responses) {
      const responseCount = Object.keys(verifyData.data.responses).length;
      console.log(`✅ ${responseCount} responses found in session`);
      console.log('📋 Saved responses:', Object.keys(verifyData.data.responses));
    } else {
      console.log('❌ No responses found in session');
    }

    console.log(`\n🎉 COMPLETE WORKFLOW TEST FINISHED!`);
    console.log(`📊 Summary: ${successCount}/${testBlocks.length} responses saved successfully`);

    return { success: successCount === testBlocks.length, sessionId, responseCount: successCount };

  } catch (error) {
    console.error('❌ Complete workflow test failed:', error.message);
    return { success: false, error: error.message };
  }
}

completeWorkflowTest();
