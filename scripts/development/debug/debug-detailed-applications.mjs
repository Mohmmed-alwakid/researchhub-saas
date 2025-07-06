// Test researcher application management workflow with detailed logging
async function testResearcherWorkflow() {
  console.log('🧪 Testing Researcher Application Management Workflow...\n');

  const BASE_URL = 'http://localhost:3003';
  
  try {
    // Step 1: Login as researcher
    console.log('1. 👨‍🔬 Logging in as researcher...');
    const loginResponse = await fetch(`${BASE_URL}/api/auth?action=login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'abwanwr77+Researcher@gmail.com',
        password: 'Testtest123'
      })
    });

    if (!loginResponse.ok) {
      const errorText = await loginResponse.text();
      console.error('❌ Login failed:', loginResponse.status, errorText);
      return;
    }

    const loginData = await loginResponse.json();
    console.log('✅ Login successful:', {
      userId: loginData.user?.id,
      role: loginData.user?.role,
      tokenExists: !!loginData.token,
      sessionExists: !!loginData.session,
      accessTokenExists: !!loginData.session?.access_token
    });

    const token = loginData.session?.access_token || loginData.token;

    // Step 2: Get researcher's studies
    console.log('\n2. 📚 Fetching researcher studies...');
    const studiesResponse = await fetch(`${BASE_URL}/api/studies?action=my-studies`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!studiesResponse.ok) {
      const errorText = await studiesResponse.text();
      console.error('❌ Studies fetch failed:', studiesResponse.status, errorText);
      return;
    }

    const studiesData = await studiesResponse.json();
    console.log('✅ Studies fetched:', {
      count: studiesData.data?.studies?.length || studiesData.studies?.length || 0,
      firstStudyId: studiesData.data?.studies?.[0]?.id || studiesData.studies?.[0]?.id
    });

    if (!studiesData.studies?.length && !studiesData.data?.studies?.length) {
      console.log('⚠️ No studies found for researcher');
      return;
    }

    const studyId = studiesData.data?.studies?.[0]?.id || studiesData.studies?.[0]?.id;

    // Step 3: Test applications endpoint with detailed error logging
    console.log(`\n3. 📋 Fetching applications for study ${studyId}...`);
    
    const applicationsUrl = `${BASE_URL}/api/applications?endpoint=study/${studyId}/applications`;
    console.log(`🌐 Request URL: ${applicationsUrl}`);
    console.log(`🔐 Authorization: Bearer ${token.substring(0, 20)}...`);

    const applicationsResponse = await fetch(applicationsUrl, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    console.log(`📡 Response status: ${applicationsResponse.status}`);
    console.log(`📡 Response headers:`, Object.fromEntries(applicationsResponse.headers.entries()));

    // Get both text and try to parse as JSON
    const responseText = await applicationsResponse.text();
    console.log(`📡 Raw response text:`, responseText);

    if (!applicationsResponse.ok) {
      console.error(`❌ Applications fetch failed: ${applicationsResponse.status}`);
      console.error(`📜 Error details: ${responseText}`);
      return;
    }

    try {
      const applicationsData = JSON.parse(responseText);
      console.log('✅ Applications fetched:', {
        success: applicationsData.success,
        count: applicationsData.data?.applications?.length || 0,
        applications: applicationsData.data?.applications
      });
    } catch (parseError) {
      console.error('❌ JSON parse error:', parseError.message);
      console.error('📜 Response was:', responseText);
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

testResearcherWorkflow();
