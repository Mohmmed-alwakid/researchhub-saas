/**
 * API ROUTING TEST
 * Test if the delete-study action is being routed correctly
 */

console.log('🔍 API Routing Test');

async function apiRoutingTest() {
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
    
    console.log('✅ Authenticated');

    // Test 1: Valid action that should work (get-studies)
    console.log('\n🧪 Test 1: get-studies (should work)');
    const getResponse = await fetch('https://researchhub-saas.vercel.app/api/research-consolidated?action=get-studies', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    console.log(`   Status: ${getResponse.status} (${getResponse.ok ? 'Success' : 'Failed'})`);

    // Test 2: Invalid action (should get specific error)
    console.log('\n🧪 Test 2: invalid-action (should get specific error)');
    const invalidResponse = await fetch('https://researchhub-saas.vercel.app/api/research-consolidated?action=invalid-action', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    const invalidData = await invalidResponse.text();
    console.log(`   Status: ${invalidResponse.status}`);
    console.log(`   Response: ${invalidData}`);

    // Test 3: delete-study action routing (should at least acknowledge the action)
    console.log('\n🧪 Test 3: delete-study action routing');
    const deleteResponse = await fetch('https://researchhub-saas.vercel.app/api/research-consolidated?action=delete-study', {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ id: 'test-id' })
    });
    const deleteData = await deleteResponse.text();
    console.log(`   Status: ${deleteResponse.status}`);
    console.log(`   Response: ${deleteData}`);

    // Test 4: Wrong method for delete-study (should get method error)
    console.log('\n🧪 Test 4: delete-study with GET method (should get method error)');
    const methodResponse = await fetch('https://researchhub-saas.vercel.app/api/research-consolidated?action=delete-study', {
      method: 'GET',  // Wrong method!
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    const methodData = await methodResponse.text();
    console.log(`   Status: ${methodResponse.status}`);
    console.log(`   Response: ${methodData}`);

    console.log('\n📊 Routing Test Complete');

  } catch (error) {
    console.error('❌ API routing test failed:', error.message);
  }
}

apiRoutingTest();