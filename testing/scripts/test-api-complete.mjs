import fetch from 'node-fetch';

async function testResearcherApplicationsAPI() {
  console.log('=== Testing Researcher Applications API ===\n');

  try {
    // First login as researcher
    const loginResponse = await fetch('http://localhost:3003/api/auth?action=login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'abwanwr77+researcher@gmail.com',
        password: 'Testtest123'
      })
    });

    const loginData = await loginResponse.json();
    
    if (!loginData.success) {
      console.error('❌ Login failed:', loginData.error);
      return;
    }

    console.log('✅ Login successful');
    console.log('📧 User:', loginData.user.email);
    console.log('🔑 Token:', loginData.token ? 'Present' : 'Missing');
    console.log('🆔 Session:', loginData.session ? 'Present' : 'Missing');
    console.log('🔑 Access Token:', loginData.session?.access_token ? 'Present' : 'Missing');
    
    // Use the access token from session if token is not directly available
    const authToken = loginData.token || loginData.session?.access_token;

    // Test getting applications for researcher using direct study ID
    const studyId = '99a0f9b1-bdfe-46b8-961a-97dc3d29fb98';
    console.log('📚 Testing with study ID:', studyId);

    const appsResponse = await fetch(`http://localhost:3003/api/applications?endpoint=study/${studyId}/applications`, {
      method: 'GET',
      headers: { 
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });

    const appsData = await appsResponse.json();
    
    console.log('\n📝 Applications API Response:');
    console.log('Success:', appsData.success);
    
    if (appsData.success) {
      console.log('Applications found:', appsData.applications?.length || 0);
      
      if (appsData.applications && appsData.applications.length > 0) {
        console.log('\n📋 Application Details:');
        appsData.applications.forEach((app, index) => {
          console.log(`  ${index + 1}. Application ${app.id}`);
          console.log(`     Study: ${app.study_title || 'N/A'}`);
          console.log(`     Participant: ${app.participant_email || 'N/A'}`);
          console.log(`     Status: ${app.status}`);
          console.log(`     Applied: ${app.applied_at}`);
          console.log('');
        });

        // Test approving an application
        const firstApp = appsData.applications[0];
        if (firstApp.status === 'pending') {
          console.log(`🔄 Testing approval of application ${firstApp.id}...`);
          
          const approveResponse = await fetch(`http://localhost:3003/api/applications?endpoint=applications/${firstApp.id}/review`, {
            method: 'POST',
            headers: { 
              'Authorization': `Bearer ${authToken}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              status: 'accepted',
              notes: 'Approved via API test'
            })
          });

          const approveData = await approveResponse.json();
          
          if (approveData.success) {
            console.log('✅ Application approved successfully!');
          } else {
            console.error('❌ Approval failed:', approveData.error);
          }
        } else {
          console.log('ℹ️ No pending applications to test approval');
        }
      } else {
        console.log('⚠️ No applications found for this researcher');
      }
    } else {
      console.error('❌ Failed to get applications:', appsData.error);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }

  console.log('\n🎉 API Test Complete!');
}

testResearcherApplicationsAPI().catch(console.error);
