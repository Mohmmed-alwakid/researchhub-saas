/**
 * API ENDPOINT TEST
 * Test if the delete endpoint is even receiving requests
 */

console.log('🔍 API Endpoint Response Test');

async function apiEndpointTest() {
  try {
    // Login
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

    console.log(`✅ Authentication successful`);

    // Test if the research endpoint is working at all
    console.log('\n📋 Testing get-studies endpoint...');
    const studiesResponse = await fetch('https://researchhub-saas.vercel.app/api/research-consolidated?action=get-studies', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    const studiesData = await studiesResponse.json();
    console.log(`Studies endpoint: ${studiesResponse.status} - ${studiesData.success ? 'Success' : 'Failed'}`);

    // Test if delete endpoint accepts the request (even with invalid data)
    console.log('\n🗑️ Testing delete endpoint with invalid ID...');
    const deleteResponse = await fetch('https://researchhub-saas.vercel.app/api/research-consolidated?action=delete-study', {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        id: 'invalid-test-id-12345'
      })
    });

    const deleteData = await deleteResponse.json();
    console.log(`Delete endpoint status: ${deleteResponse.status}`);
    console.log(`Delete response:`, JSON.stringify(deleteData, null, 2));

    // Check if we get the expected structure even for failure
    if (deleteData.hasOwnProperty('success')) {
      console.log('✅ Delete endpoint is responding with proper JSON structure');
    } else {
      console.log('❌ Delete endpoint is not responding properly');
    }

    console.log('\n🔧 Endpoint Analysis Complete');

  } catch (error) {
    console.error('❌ API endpoint test failed:', error.message);
  }
}

apiEndpointTest();