/**
 * SIMPLE DIRECT DELETE TEST
 * Test deletion with minimal logic using same exact values we confirmed exist
 */

console.log('🎯 Simple Direct Delete Test');

async function simpleDirectDeleteTest() {
  try {
    // Use the exact values we confirmed from the step-by-step test
    const testStudyId = 2071297637;
    const testStudyUuid = 'fcc2656f-75cb-45c1-a3cb-87185187c25d';
    const testUserId = '4c3d798b-2975-4ec4-b9e2-c6f128b8a066';
    
    // Login to get token
    const loginResponse = await fetch('https://researchhub-saas.vercel.app/api/auth-consolidated?action=login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'abwanwr77+Researcher@gmail.com',
        password: 'Testtest123'
      })
    });

    const loginData = await loginResponse.json();
    const token = loginData.session?.access_token || loginData.tokens?.authToken;
    
    console.log('✅ Authenticated');
    console.log(`🎯 Test Data:`);
    console.log(`   Study ID: ${testStudyId}`);
    console.log(`   Study UUID: ${testStudyUuid}`);
    console.log(`   User ID: ${testUserId}`);

    // Test different combinations systematically
    const testCombinations = [
      { name: 'UUID + researcher_id', body: { id: testStudyUuid }, note: 'Current approach' },
      { name: 'Numeric ID + researcher_id', body: { id: testStudyId }, note: 'Current approach' },
      { name: 'UUID in query param', url: `?action=delete-study&id=${testStudyUuid}`, body: {}, note: 'Query param test' },
      { name: 'Numeric in query param', url: `?action=delete-study&id=${testStudyId}`, body: {}, note: 'Query param test' }
    ];

    for (const test of testCombinations) {
      console.log(`\n🧪 Testing: ${test.name} (${test.note})`);
      
      const url = test.url 
        ? `https://researchhub-saas.vercel.app/api/research-consolidated${test.url}`
        : 'https://researchhub-saas.vercel.app/api/research-consolidated?action=delete-study';
      
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: Object.keys(test.body).length > 0 ? JSON.stringify(test.body) : undefined
      });

      const responseText = await response.text();
      let responseData;
      
      try {
        responseData = JSON.parse(responseText);
      } catch {
        responseData = { error: 'Invalid JSON', raw: responseText };
      }

      console.log(`   Status: ${response.status}`);
      console.log(`   Success: ${responseData.success || 'unknown'}`);
      console.log(`   Error: ${responseData.error || 'none'}`);
      
      if (responseData.debug) {
        console.log(`   Debug: ${JSON.stringify(responseData.debug)}`);
      }

      if (response.ok && responseData.success) {
        console.log(`   🎉 SUCCESS with ${test.name}!`);
        break;
      }
    }

    console.log('\n📊 Simple Delete Test Complete');

  } catch (error) {
    console.error('❌ Simple direct delete test failed:', error.message);
  }
}

simpleDirectDeleteTest();