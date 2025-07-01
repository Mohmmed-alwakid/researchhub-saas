/**
 * Test Block Response Saving with Updated API
 * Date: June 30, 2025
 */

const API_BASE = 'http://localhost:3003/api';

// Test accounts
const PARTICIPANT_ACCOUNT = {
  email: 'abwanwr77+participant@gmail.com',
  password: 'Testtest123'
};

async function testBlockResponseSaving() {
  console.log('🧪 TESTING BLOCK RESPONSE SAVING');
  console.log('=' .repeat(40));
  
  let participantToken = null;
  let sessionId = null;

  try {
    // Step 1: Login
    console.log('\n1️⃣ PARTICIPANT LOGIN');
    const loginResponse = await fetch(`${API_BASE}/auth?action=login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(PARTICIPANT_ACCOUNT)
    });

    const loginData = await loginResponse.json();
    participantToken = loginData.session.access_token;
    console.log('✅ Logged in successfully');

    // Step 2: Get available studies
    const studiesResponse = await fetch(`${API_BASE}/applications?endpoint=studies/public`, {
      headers: { 'Authorization': `Bearer ${participantToken}` }
    });
    
    const studiesData = await studiesResponse.json();
    const studyId = studiesData.data.studies[0].id;
    console.log('✅ Found study:', studyId);

    // Step 3: Create session
    console.log('\n2️⃣ CREATE STUDY SESSION');
    const sessionResponse = await fetch(`${API_BASE}/study-sessions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${participantToken}`
      },
      body: JSON.stringify({ studyId })
    });

    const sessionData = await sessionResponse.json();
    sessionId = sessionData.session.id;
    console.log('✅ Session created:', sessionId);

    // Step 4: Test saving responses for different block types
    console.log('\n3️⃣ TEST SAVING BLOCK RESPONSES');
    
    const testResponses = [
      {
        blockId: 'test_welcome',
        blockType: 'welcome',
        response: { acknowledged: true },
        timeSpent: 5000
      },
      {
        blockId: 'test_multiple_choice',
        blockType: 'multiple_choice',
        response: { selectedOption: 'Daily', optionText: 'Daily' },
        timeSpent: 12000
      },
      {
        blockId: 'test_open_question',
        blockType: 'open_question',
        response: { 
          answer: 'This platform looks very professional and user-friendly. I appreciate the clean design and intuitive navigation.'
        },
        timeSpent: 45000
      },
      {
        blockId: 'test_opinion_scale',
        blockType: 'opinion_scale',
        response: { rating: 4, scaleType: 'star' },
        timeSpent: 8000
      }
    ];

    for (const testResponse of testResponses) {
      console.log(`\n   💾 Saving ${testResponse.blockType} response...`);
      
      const saveResponse = await fetch(`${API_BASE}/blocks?action=response`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${participantToken}`
        },
        body: JSON.stringify({
          sessionId: sessionId,
          blockId: testResponse.blockId,
          blockType: testResponse.blockType,
          response: testResponse.response,
          timeSpent: testResponse.timeSpent
        })
      });

      const saveData = await saveResponse.json();
      
      if (saveData.success) {
        console.log(`   ✅ ${testResponse.blockType} response saved successfully`);
      } else {
        console.log(`   ❌ ${testResponse.blockType} response failed:`, saveData.error);
      }
    }

    // Step 5: Verify responses were saved
    console.log('\n4️⃣ VERIFY SAVED RESPONSES');
    const verifyResponse = await fetch(`${API_BASE}/study-sessions/${sessionId}`, {
      headers: { 'Authorization': `Bearer ${participantToken}` }
    });

    const verifyData = await verifyResponse.json();
    
    if (verifyData.success && verifyData.session.responses) {
      const responses = verifyData.session.responses;
      console.log('✅ Session responses found:');
      
      Object.keys(responses).forEach(blockId => {
        const blockResponse = responses[blockId];
        console.log(`   📋 ${blockId} (${blockResponse.blockType}): Response saved`);
        console.log(`       Time spent: ${blockResponse.timeSpent}ms`);
        console.log(`       Data: ${JSON.stringify(blockResponse.response)}`);
      });

      console.log(`\n📊 Total responses saved: ${Object.keys(responses).length}`);
    } else {
      console.log('❌ No responses found in session');
    }

    console.log('\n🎉 BLOCK RESPONSE SAVING TEST COMPLETE!');
    return {
      success: true,
      sessionId,
      responsesCount: Object.keys(verifyData.session?.responses || {}).length
    };

  } catch (error) {
    console.error('\n❌ TEST FAILED:', error.message);
    return { success: false, error: error.message };
  }
}

// Run the test
testBlockResponseSaving()
  .then(result => {
    if (result.success) {
      console.log('\n✅ ALL RESPONSE SAVING TESTS PASSED!');
      console.log(`📊 Summary: ${result.responsesCount} responses saved successfully`);
    } else {
      console.log('\n❌ RESPONSE SAVING TESTS FAILED!');
      console.log(`💥 Error: ${result.error}`);
    }
  })
  .catch(error => {
    console.error('\n💥 UNEXPECTED ERROR:', error);
  });
