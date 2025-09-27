/**
 * DIRECT UUID DELETE TEST
 * Test deletion using exact UUID from database field debugging
 */

console.log('🎯 Direct UUID Delete Test');

async function directUuidDeleteTest() {
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
    const userId = loginData.user?.id;

    console.log(`✅ Authenticated as: ${userId}`);

    // Test with the UUID from our previous debug: 30454992-f03e-4ce4-8ae4-0c61d127b135
    const testUuid = '30454992-f03e-4ce4-8ae4-0c61d127b135';
    
    console.log(`\n🗑️ Attempting to delete study UUID: ${testUuid}`);
    
    const deleteResponse = await fetch('https://researchhub-saas.vercel.app/api/research-consolidated?action=delete-study', {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        id: testUuid
      })
    });

    const deleteData = await deleteResponse.json();
    
    console.log(`📋 Delete Response:`);
    console.log(`   Status: ${deleteResponse.status}`);
    console.log(`   Success: ${deleteData.success}`);
    console.log(`   Message: ${deleteData.message || 'none'}`);
    console.log(`   Error: ${deleteData.error || 'none'}`);
    
    if (deleteData.data) {
      console.log(`   Data:`, deleteData.data);
    }

    if (deleteResponse.ok) {
      console.log('\n🎉 SUCCESS! Direct UUID deletion worked!');
    } else {
      console.log('\n❌ Direct UUID deletion failed');
      
      // Also test with a numeric ID
      console.log(`\n🔄 Testing with numeric ID: 121214212`);
      
      const numericDeleteResponse = await fetch('https://researchhub-saas.vercel.app/api/research-consolidated?action=delete-study', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: 121214212
        })
      });

      const numericDeleteData = await numericDeleteResponse.json();
      console.log(`   Numeric Status: ${numericDeleteResponse.status}`);
      console.log(`   Numeric Success: ${numericDeleteData.success}`);
      console.log(`   Numeric Error: ${numericDeleteData.error || 'none'}`);
    }

  } catch (error) {
    console.error('❌ Direct UUID delete test failed:', error.message);
  }
}

directUuidDeleteTest();