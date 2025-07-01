// Test with existing approved application
import fetch from 'node-fetch';

const baseUrl = 'http://localhost:3003';

async function testWithExistingApplication() {
  try {
    console.log('🎯 TESTING WITH EXISTING APPLICATION');
    console.log('=====================================');

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

    // GET STUDY
    console.log('\n2️⃣ GET STUDY');
    const studiesResponse = await fetch(`${baseUrl}/api/studies`, {
      headers: { 'Authorization': `Bearer ${participantToken}` }
    });
    
    const studiesData = await studiesResponse.json();
    const study = studiesData.studies[0];
    console.log(`✅ Using study: ${study.id}`);

    // CHECK EXISTING APPLICATIONS
    console.log('\n3️⃣ CHECK EXISTING APPLICATIONS');
    const applicationsResponse = await fetch(`${baseUrl}/api/applications?type=participant`, {
      headers: { 'Authorization': `Bearer ${participantToken}` }
    });
    
    const applicationsData = await applicationsResponse.json();
    console.log('Applications response:', JSON.stringify(applicationsData, null, 2));

    // If no approved application exists, we'll need researcher to approve it
    let needsApproval = true;
    if (applicationsData.success && applicationsData.data && applicationsData.data.length > 0) {
      const existingApp = applicationsData.data.find(app => app.study_id === study.id && app.status === 'accepted');
      if (existingApp) {
        console.log('✅ Found approved application');
        needsApproval = false;
      } else {
        console.log('📋 Found application but not approved, needs approval');
        const pendingApp = applicationsData.data.find(app => app.study_id === study.id);
        
        // LOGIN AS RESEARCHER TO APPROVE
        console.log('\n4️⃣ LOGIN AS RESEARCHER TO APPROVE');
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

        // APPROVE APPLICATION
        console.log('\n5️⃣ APPROVE APPLICATION');
        const approvalResponse = await fetch(`${baseUrl}/api/applications?endpoint=applications/${pendingApp.id}/review`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${researcherToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            status: 'accepted',
            notes: 'Application approved for testing purposes.'
          })
        });
        
        const approvalData = await approvalResponse.json();
        console.log('Approval response:', JSON.stringify(approvalData, null, 2));
        
        if (approvalData.success) {
          console.log('✅ Application approved');
          needsApproval = false;
        }
      }
    }

    if (needsApproval) {
      console.log('❌ Could not get approved application');
      return;
    }

    // CREATE SESSION
    console.log('\n6️⃣ CREATE SESSION');
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

    // SAVE BLOCK RESPONSES
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
          answer: 'This is my comprehensive test response for the open question. The platform seems very easy to use and intuitive. I really appreciate how clean and modern the interface is.',
          wordCount: 30
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
      console.log(`   📋 Response result:`, JSON.stringify(saveResult, null, 2));
      
      if (saveResult.success) {
        console.log(`   ✅ ${block.blockType} response saved!`);
        successCount++;
      } else {
        console.log(`   ❌ ${block.blockType} response failed:`, saveResult.error);
      }
    }

    // VERIFY RESPONSES
    console.log('\n8️⃣ VERIFY SAVED RESPONSES');
    const verifyResponse = await fetch(`${baseUrl}/api/study-sessions/${sessionId}`, {
      headers: { 'Authorization': `Bearer ${participantToken}` }
    });
    
    const verifyData = await verifyResponse.json();
    console.log('Session verification:', JSON.stringify(verifyData, null, 2));
    
    if (verifyData.success && verifyData.data.responses) {
      const responseCount = Object.keys(verifyData.data.responses).length;
      console.log(`✅ ${responseCount} responses found in session`);
      console.log('📋 Saved responses:', Object.keys(verifyData.data.responses));
    } else {
      console.log('❌ No responses found in session');
    }

    console.log(`\n🎉 TESTING COMPLETE!`);
    console.log(`📊 Summary: ${successCount}/${testBlocks.length} responses saved successfully`);

    return { success: successCount === testBlocks.length, sessionId, responseCount: successCount };

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    return { success: false, error: error.message };
  }
}

testWithExistingApplication();
