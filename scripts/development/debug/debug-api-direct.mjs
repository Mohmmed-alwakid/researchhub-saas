import fetch from 'node-fetch';

async function debugAPICall() {
  console.log('=== Debug API Call ===\n');

  try {
    // Login first
    const loginResponse = await fetch('http://localhost:3003/api/auth?action=login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'abwanwr77+researcher@gmail.com',
        password: 'Testtest123'
      })
    });

    const loginData = await loginResponse.json();
    const authToken = loginData.session?.access_token;

    console.log('✅ Login successful, token:', !!authToken);

    // Make API call with detailed logging
    const studyId = '99a0f9b1-bdfe-46b8-961a-97dc3d29fb98';
    console.log(`📞 Making API call to: /api/applications?endpoint=study/${studyId}/applications`);

    const response = await fetch(`http://localhost:3003/api/applications?endpoint=study/${studyId}/applications`, {
      method: 'GET',
      headers: { 
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('📊 Response status:', response.status);
    console.log('📊 Response headers:', Object.fromEntries(response.headers.entries()));

    const data = await response.json();
    console.log('📊 Response data:', JSON.stringify(data, null, 2));

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

debugAPICall().catch(console.error);
