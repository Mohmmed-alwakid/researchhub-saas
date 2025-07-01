/**
 * DEBUG STUDIES API RESPONSE
 */

const API_BASE = 'http://localhost:3001/api';

async function debugStudiesAPI() {
  console.log('🔍 DEBUGGING STUDIES API RESPONSE');
  console.log('=================================');
  
  try {
    // 1. Login as participant
    console.log('1. Logging in as participant...');
    const authResponse = await fetch(`${API_BASE}/auth?action=login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'abwanwr77+participant@gmail.com',
        password: 'Testtest123'
      })
    });

    const authResult = await authResponse.json();
    console.log('Auth result:', authResult.success ? 'SUCCESS' : 'FAILED');
    
    if (!authResult.success) {
      console.error('Authentication failed:', authResult.error);
      return;
    }

    const token = authResult.session.accessToken;

    // 2. Test studies endpoint
    console.log('\n2. Testing studies endpoint...');
    const studiesResponse = await fetch(`${API_BASE}/applications?endpoint=studies/public`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('Studies response status:', studiesResponse.status);
    console.log('Studies response headers:', [...studiesResponse.headers.entries()]);
    
    const studiesText = await studiesResponse.text();
    console.log('Studies response text (first 500 chars):', studiesText.substring(0, 500));
    
    try {
      const studiesResult = JSON.parse(studiesText);
      console.log('Studies result parsed successfully:');
      console.log('  - success:', studiesResult.success);
      console.log('  - data type:', typeof studiesResult.data);
      console.log('  - data length:', studiesResult.data?.length);
      console.log('  - error:', studiesResult.error);
      
      if (studiesResult.data && Array.isArray(studiesResult.data)) {
        console.log('  - first study id:', studiesResult.data[0]?.id);
        console.log('  - first study title:', studiesResult.data[0]?.title);
      }
    } catch (parseError) {
      console.error('JSON parse error:', parseError.message);
    }

  } catch (error) {
    console.error('Debug error:', error);
  }
}

debugStudiesAPI();
