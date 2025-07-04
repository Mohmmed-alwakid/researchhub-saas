// Debug studies response structure
const baseUrl = 'http://localhost:3003/api';

async function debugStudiesResponse() {
  console.log('🔍 Debugging Studies Response Structure...\n');
  
  try {
    // Login as researcher first
    console.log('1️⃣ Logging in as researcher...');
    const loginResponse = await fetch(`${baseUrl}/auth?action=login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'abwanwr77+Researcher@gmail.com',
        password: 'Testtest123'
      })
    });
    
    const loginData = await loginResponse.json();
    const token = loginData.session?.access_token;
    
    // Get studies and inspect structure
    console.log('2️⃣ Getting studies and inspecting structure...');
    const studiesResponse = await fetch(`${baseUrl}/studies`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    const studiesData = await studiesResponse.json();
    console.log('Studies response:', JSON.stringify(studiesData, null, 2));
    
    if (studiesData.studies && studiesData.studies.length > 0) {
      console.log('\nFirst study structure:');
      console.log(JSON.stringify(studiesData.studies[0], null, 2));
    }
    
  } catch (error) {
    console.error('❌ Debug failed:', error.message);
  }
}

debugStudiesResponse();
