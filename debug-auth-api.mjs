import fetch from 'node-fetch';

async function testLogin() {
  try {
    console.log('🔍 Testing login API call...');
    const response = await fetch('http://localhost:3005/api/auth-consolidated?action=login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'abwanwr77+admin@gmail.com',
        password: 'Testtest123'
      })
    });
    
    const result = await response.json();
    console.log('API Response Status:', response.status);
    console.log('API Response Data:', JSON.stringify(result, null, 2));
    
    // Test what the auth store expects vs what we get
    console.log('\n📋 AUTH STORE ANALYSIS:');
    console.log('Expected session format: { access_token, refresh_token }');
    console.log('Received session:', result.session ? 'YES' : 'NO');
    if (result.session) {
      console.log('Has access_token:', !!result.session.access_token);
      console.log('Has refresh_token:', !!result.session.refresh_token);
    }
    
    console.log('\nExpected user format: { id, email, firstName, lastName, role }');
    console.log('Received user:', result.user ? 'YES' : 'NO');
    if (result.user) {
      console.log('User fields:', Object.keys(result.user));
      console.log('User role:', result.user.role);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('Is the API server running on port 3005?');
  }
}

testLogin();
