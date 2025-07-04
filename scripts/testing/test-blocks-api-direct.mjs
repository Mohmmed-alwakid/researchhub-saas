// Quick test of the blocks API directly
const fetch = import('node-fetch').then(mod => mod.default);

async function testBlocksAPI() {
  const fetchFn = await fetch;
  
  console.log('🧪 TESTING BLOCKS API DIRECTLY');
  
  // Login first
  const loginResponse = await fetchFn('http://localhost:3003/api/auth?action=login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'abwanwr77+participant@gmail.com',
      password: 'Testtest123'
    })
  });

  const loginData = await loginResponse.json();
  const token = loginData.session.access_token;
  
  // Get studies
  const studiesResponse = await fetchFn('http://localhost:3003/api/applications?endpoint=studies/public', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  const studiesData = await studiesResponse.json();
  const studyId = studiesData.data.studies[0].id;
  
  console.log('📋 Testing blocks for study:', studyId);
  
  // Test legacy endpoint
  const legacyResponse = await fetchFn(`http://localhost:3003/api/study-blocks?studyId=${studyId}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  console.log('Legacy endpoint status:', legacyResponse.status);
  if (!legacyResponse.ok) {
    const errorText = await legacyResponse.text();
    console.log('Legacy error:', errorText);
  } else {
    const legacyData = await legacyResponse.json();
    console.log('Legacy response:', legacyData);
  }
  
  // Test new endpoint
  const newResponse = await fetchFn(`http://localhost:3003/api/blocks?action=study&studyId=${studyId}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  console.log('New endpoint status:', newResponse.status);
  if (!newResponse.ok) {
    const errorText = await newResponse.text();
    console.log('New error:', errorText);
  } else {
    const newData = await newResponse.json();
    console.log('New response:', newData);
  }
}

testBlocksAPI().catch(console.error);
