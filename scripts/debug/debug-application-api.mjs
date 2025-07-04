/**
 * DEBUG APPLICATION API
 * Test the application submission directly
 */

const API_BASE = 'http://localhost:3001/api';

async function testApplicationAPI() {
  console.log('🔍 Testing Application API Debug...');

  try {
    // 1. Test authentication
    console.log('1. Testing authentication...');
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

    // 2. Test basic applications endpoint
    console.log('2. Testing applications endpoint structure...');
    const testResponse = await fetch(`${API_BASE}/applications?type=participant`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('Applications endpoint status:', testResponse.status);
    const testText = await testResponse.text();
    console.log('Applications endpoint response:', testText.substring(0, 500));

    // 3. Test application submission with minimal data
    console.log('3. Testing application submission...');
    const applicationData = {
      studyId: '11e42ca3-6b5c-447d-a2f3-58c6e0949bea',
      responses: {
        motivation: 'Test application'
      }
    };

    const submitResponse = await fetch(`${API_BASE}/applications?type=participant`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(applicationData)
    });

    console.log('Application submission status:', submitResponse.status);
    const submitText = await submitResponse.text();
    console.log('Application submission response:', submitText);

  } catch (error) {
    console.error('Error testing application API:', error);
  }
}

testApplicationAPI();
