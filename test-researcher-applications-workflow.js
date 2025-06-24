// Complete test of researcher applications workflow
const baseUrl = 'http://localhost:3003/api';

async function testResearcherApplicationsWorkflow() {
  console.log('🧪 Testing Researcher Applications Workflow...\n');
  
  try {
    // Step 1: Login as researcher
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
    console.log('Login result:', loginData.success ? '✅ Success' : '❌ Failed');
    
    if (!loginData.success) {
      console.error('Login failed:', loginData.error);
      return;
    }
    
    const token = loginData.session?.access_token;
    console.log('Token received:', token ? '✅ Yes' : '❌ No');
    
    // Step 2: Get a real study ID first
    console.log('\n2️⃣ Getting researcher studies for real study ID...');
    const studiesResponse = await fetch(`${baseUrl}/studies`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    const studiesData = await studiesResponse.json();
    console.log('Studies endpoint result:', studiesData.success ? '✅ Success' : '❌ Failed');
    
    let testStudyId = 'test-id'; // fallback
    
    if (studiesData.success && studiesData.studies && studiesData.studies.length > 0) {
      testStudyId = studiesData.studies[0]._id;  // Use _id instead of id
      console.log('Using real study ID:', testStudyId);
    }
    
    // Step 3: Test researcher applications endpoint with auth
    console.log('\n3️⃣ Testing researcher applications endpoint...');
    const appsResponse = await fetch(`${baseUrl}/researcher-applications?endpoint=study/${testStudyId}/applications`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    const appsData = await appsResponse.json();
    console.log('Applications endpoint result:', appsData.success ? '✅ Success' : '❌ Failed');
    
    if (appsData.success) {
      console.log('Applications count:', appsData.applications ? appsData.applications.length : 0);
      if (appsData.applications && appsData.applications.length > 0) {
        console.log('First application:', {
          id: appsData.applications[0].id,
          study_title: appsData.applications[0].study_title,
          participant_email: appsData.applications[0].participant_email,
          status: appsData.applications[0].status
        });
      }
    } else {
      console.error('Applications error:', appsData.error);
      console.error('Full response:', appsData);
    }
    
    
    // Step 4: Test with specific study applications (using the study we already fetched)
    console.log('\n4️⃣ Testing study-specific applications...');
    if (studiesData.success && studiesData.studies && studiesData.studies.length > 0) {
      const firstStudy = studiesData.studies[0];
      console.log('Testing with study:', firstStudy.title, '(ID:', firstStudy._id + ')');
      
      // Test study-specific applications with actual study ID
      const studyAppsResponse = await fetch(`${baseUrl}/researcher-applications?endpoint=study/${firstStudy._id}/applications`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      const studyAppsData = await studyAppsResponse.json();
      console.log('Study-specific applications result:', studyAppsData.success ? '✅ Success' : '❌ Failed');
      
      if (studyAppsData.success) {
        console.log('Study applications count:', studyAppsData.applications ? studyAppsData.applications.length : 0);
      } else {
        console.error('Study applications error:', studyAppsData.error);
      }
    }
    
    console.log('\n🎉 Test completed!');
    
  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// Run the test
testResearcherApplicationsWorkflow();
