/**
 * DEBUG DELETE WITH RESPONSE LOGGING
 * Create a custom debug endpoint to see what's happening inside the function
 */

console.log('🔍 Debug Delete with Response Logging');

async function debugDeleteWithResponse() {
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
    
    // Use known values from our previous test
    const testStudyUuid = 'fcc2656f-75cb-45c1-a3cb-87185187c25d';
    
    console.log('✅ Authenticated, testing with UUID:', testStudyUuid);

    // Make a delete request and capture ALL possible debug information
    const response = await fetch('https://researchhub-saas.vercel.app/api/research-consolidated?action=delete-study', {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'X-Debug-Mode': 'true'  // Custom header to potentially trigger more verbose logging
      },
      body: JSON.stringify({ 
        id: testStudyUuid,
        debug: true  // Add debug flag to potentially get more info
      })
    });

    // Get response details
    const status = response.status;
    const statusText = response.statusText;
    const headers = Object.fromEntries(response.headers.entries());
    const body = await response.text();

    console.log('\n📊 COMPLETE RESPONSE ANALYSIS:');
    console.log('='.repeat(50));
    console.log(`Status: ${status} ${statusText}`);
    console.log('\nHeaders:');
    Object.entries(headers).forEach(([key, value]) => {
      console.log(`  ${key}: ${value}`);
    });
    
    console.log(`\nBody: ${body}`);
    console.log('='.repeat(50));

    // Try to parse JSON
    let parsedBody;
    try {
      parsedBody = JSON.parse(body);
      console.log('\nParsed JSON:');
      console.log(JSON.stringify(parsedBody, null, 2));
    } catch (e) {
      console.log('\n❌ Body is not valid JSON');
    }

    // Check for any error patterns
    if (body.includes('timeout')) {
      console.log('⚠️ Possible timeout detected');
    }
    if (body.includes('Internal Server Error')) {
      console.log('⚠️ Internal server error detected');
    }
    if (body.includes('Cannot read properties')) {
      console.log('⚠️ Possible undefined property access');
    }

    console.log('\n🔍 Debug Complete');

  } catch (error) {
    console.error('❌ Debug delete test failed:', error.message);
    console.error('Stack:', error.stack);
  }
}

debugDeleteWithResponse();