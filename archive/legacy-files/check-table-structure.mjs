// Check study_applications table structure
async function checkTableStructure() {
  console.log('🧪 Checking study_applications table structure...\n');

  const BASE_URL = 'http://localhost:3003';
  
  try {
    // Login as researcher to get access token
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
    
    console.log('✅ Login successful, checking table structure...');

    // Try a simple query to see what columns exist
    const testResponse = await fetch(`${BASE_URL}/api/applications?action=test-structure`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    console.log(`📡 Status: ${testResponse.status}`);
    const responseText = await testResponse.text();
    console.log(`📡 Response: ${responseText}`);

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

checkTableStructure();
