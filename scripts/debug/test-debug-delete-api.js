/**
 * TEST DEBUG DELETE API
 * Call the new debug delete endpoint to understand the database issue
 */

console.log('🔍 Testing Debug Delete API');

async function testDebugDeleteApi() {
  try {
    // Login first
    console.log('🔑 Getting authentication token...');
    
    const loginResponse = await fetch('https://researchhub-saas.vercel.app/api/auth-consolidated?action=login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'abwanwr77+Researcher@gmail.com',
        password: 'Testtest123'
      })
    });

    const loginData = await loginResponse.json();
    const token = loginData.session?.access_token || loginData.tokens?.authToken;
    
    if (!token) {
      throw new Error('No authentication token received');
    }
    
    console.log('✅ Authentication token obtained');

    // Get a study to delete
    const studiesResponse = await fetch('https://researchhub-saas.vercel.app/api/research-consolidated?action=get-studies', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'x-user-role': 'researcher'
      }
    });

    const studiesData = await studiesResponse.json();
    const userId = loginData.user?.id;
    const testStudy = studiesData.studies?.find(study => study.researcher_id === userId);

    if (!testStudy) {
      console.log('❌ No owned study found for testing');
      return;
    }

    console.log(`🎯 Testing with study: "${testStudy.title}" (ID: ${testStudy.id})`);

    // Call our debug delete API
    console.log('\n🗑️ Calling debug delete API...');
    
    const debugDeleteResponse = await fetch('https://researchhub-saas.vercel.app/api/debug-delete-study', {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        id: testStudy.id
      })
    });

    const debugDeleteData = await debugDeleteResponse.json();

    console.log(`\n📋 DEBUG DELETE RESPONSE:`);
    console.log(`Status: ${debugDeleteResponse.status}`);
    console.log(`Success: ${debugDeleteData.success}`);
    console.log(`Message: ${debugDeleteData.message || 'none'}`);
    console.log(`Error: ${debugDeleteData.error || 'none'}`);
    console.log(`Debug Info:`, JSON.stringify(debugDeleteData.debug, null, 2));

    if (debugDeleteResponse.ok) {
      console.log('\n🎉 DELETE OPERATION SUCCESSFUL WITH DEBUG API!');
    } else {
      console.log('\n⚠️ Delete operation failed - check debug info above');
    }

  } catch (error) {
    console.error('❌ Debug delete API test failed:', error.message);
  }
}

testDebugDeleteApi();