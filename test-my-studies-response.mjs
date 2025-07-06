// Simple test to check the exact response format from my-studies
async function testMyStudiesResponse() {
  console.log('🧪 Testing My Studies Response Format...\n');

  const BASE_URL = 'http://localhost:3003';
  
  try {
    // Login
    const loginResponse = await fetch(`${BASE_URL}/api/auth?action=login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'abwanwr77+Researcher@gmail.com',
        password: 'Testtest123'
      })
    });

    const loginData = await loginResponse.json();
    const token = loginData.session?.access_token;
    
    console.log('✅ Login successful, token length:', token?.length);

    // Test my-studies endpoint
    console.log('\n📚 Testing my-studies endpoint...');
    const studiesResponse = await fetch(`${BASE_URL}/api/studies?action=my-studies`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    console.log(`📡 Status: ${studiesResponse.status}`);
    console.log(`📡 Headers:`, Object.fromEntries(studiesResponse.headers.entries()));

    const responseText = await studiesResponse.text();
    console.log(`📡 Raw response: ${responseText}`);

    if (studiesResponse.ok) {
      try {
        const responseData = JSON.parse(responseText);
        console.log('\n✅ Parsed response:', {
          success: responseData.success,
          studiesCount: responseData.studies?.length || 0,
          total: responseData.total,
          message: responseData.message,
          studiesData: responseData.studies
        });
      } catch (parseError) {
        console.error('❌ JSON parse error:', parseError.message);
      }
    }

    // Also test without action parameter (default behavior)
    console.log('\n📚 Testing default studies endpoint...');
    const defaultResponse = await fetch(`${BASE_URL}/api/studies`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    console.log(`📡 Default Status: ${defaultResponse.status}`);
    const defaultText = await defaultResponse.text();
    console.log(`📡 Default Raw response: ${defaultText}`);

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

testMyStudiesResponse();
