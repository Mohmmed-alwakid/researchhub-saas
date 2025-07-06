// Simple test to check the exact login response format
async function testLoginResponse() {
  console.log('🧪 Testing exact login response format...\n');

  const BASE_URL = 'http://localhost:3003';
  
  try {
    console.log('1. 👨‍🔬 Testing researcher login...');
    const loginResponse = await fetch(`${BASE_URL}/api/auth?action=login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'abwanwr77+Researcher@gmail.com',
        password: 'Testtest123'
      })
    });

    console.log(`📡 Login response status: ${loginResponse.status}`);
    
    const loginText = await loginResponse.text();
    console.log(`📡 Raw login response: ${loginText}`);

    if (loginResponse.ok) {
      try {
        const loginData = JSON.parse(loginText);
        console.log('✅ Parsed login data:', {
          success: loginData.success,
          userId: loginData.user?.id,
          role: loginData.user?.role,
          hasToken: !!loginData.token,
          hasSession: !!loginData.session,
          hasAccessToken: !!loginData.session?.access_token,
          tokenValue: loginData.token || 'NOT FOUND',
          accessTokenStart: loginData.session?.access_token?.substring(0, 20) || 'NOT FOUND'
        });
      } catch (parseError) {
        console.error('❌ JSON parse error:', parseError.message);
      }
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

testLoginResponse();
