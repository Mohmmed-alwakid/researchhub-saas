import fetch from 'node-fetch';

const API_BASE = 'http://localhost:3003';
let authToken = null;

async function testAPI() {
  console.log('🧪 Testing Complete Application Workflow APIs...\n');

  try {
    // Step 1: Login as participant
    console.log('📝 Step 1: Logging in as participant...');
    const loginResponse = await fetch(`${API_BASE}/api/auth?action=login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'abwanwr77+participant@gmail.com',
        password: 'Testtest123'
      })
    });
    
    const loginData = await loginResponse.json();
    console.log('Login result:', loginData);
    
    if (!loginData.success) {
      throw new Error('Login failed: ' + loginData.error);
    }
    
    authToken = loginData.session.access_token;
    console.log('✅ Login successful, token obtained\n');

    // Step 2: Discover public studies
    console.log('🔍 Step 2: Discovering public studies...');
    const studiesResponse = await fetch(`${API_BASE}/api/participant-applications?endpoint=studies/public`);
    const studiesData = await studiesResponse.json();
    
    console.log('Studies result:', JSON.stringify(studiesData, null, 2));
    
    if (!studiesData.success || studiesData.data.studies.length === 0) {
      throw new Error('No public studies found');
    }
    
    const firstStudy = studiesData.data.studies[0];
    console.log(`✅ Found ${studiesData.data.studies.length} public studies\n`);

    // Step 3: Submit application
    console.log('📝 Step 3: Submitting application...');
    const applicationResponse = await fetch(`${API_BASE}/api/participant-applications?endpoint=studies/${firstStudy._id}/apply`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        applicationData: {
          demographics: { age: 25, gender: 'prefer not to say' },
          availability: 'weekdays',
          experience: 'intermediate',
          motivation: 'interested in UX research'
        }
      })
    });
    
    const applicationData = await applicationResponse.json();
    console.log('Application result:', JSON.stringify(applicationData, null, 2));
    
    if (!applicationData.success) {
      console.log('⚠️ Application might have failed or already exists:', applicationData.error);
    } else {
      console.log('✅ Application submitted successfully\n');
    }

    // Step 4: Get my applications
    console.log('📄 Step 4: Getting my applications...');
    const myAppsResponse = await fetch(`${API_BASE}/api/participant-applications?endpoint=my-applications`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    const myAppsData = await myAppsResponse.json();
    console.log('My applications result:', JSON.stringify(myAppsData, null, 2));
    
    if (myAppsData.success) {
      console.log(`✅ Retrieved ${myAppsData.data.applications.length} applications\n`);
    }

    // Step 5: Login as researcher
    console.log('🔬 Step 5: Logging in as researcher...');
    const researcherLoginResponse = await fetch(`${API_BASE}/api/auth?action=login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'abwanwr77+researcher@gmail.com',
        password: 'Testtest123'
      })
    });
    
    const researcherLoginData = await researcherLoginResponse.json();
    
    if (!researcherLoginData.success) {
      throw new Error('Researcher login failed: ' + researcherLoginData.error);
    }
    
    authToken = researcherLoginData.session.access_token;
    console.log('✅ Researcher login successful\n');

    // Step 6: Get study applications
    console.log('📋 Step 6: Getting study applications...');
    const studyAppsResponse = await fetch(`${API_BASE}/api/researcher-applications?endpoint=study/${firstStudy._id}/applications`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    const studyAppsData = await studyAppsResponse.json();
    console.log('Study applications result:', JSON.stringify(studyAppsData, null, 2));
    
    if (studyAppsData.success && studyAppsData.data.applications.length > 0) {
      console.log(`✅ Found ${studyAppsData.data.applications.length} applications for study\n`);
      
      // Step 7: Review an application
      const firstApplication = studyAppsData.data.applications[0];
      console.log('🔍 Step 7: Reviewing application...');
      
      const reviewResponse = await fetch(`${API_BASE}/api/researcher-applications?endpoint=applications/${firstApplication.id}/review`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          status: 'accepted',
          notes: 'Great application! Welcome to the study.'
        })
      });
      
      const reviewData = await reviewResponse.json();
      console.log('Review result:', JSON.stringify(reviewData, null, 2));
      
      if (reviewData.success) {
        console.log('✅ Application reviewed successfully\n');
      }
    }

    console.log('🎉 Complete workflow test completed successfully!');

  } catch (error) {
    console.error('❌ Workflow test failed:', error.message);
  }
}

testAPI();
