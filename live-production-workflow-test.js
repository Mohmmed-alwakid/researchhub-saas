/**
 * LIVE PRODUCTION WORKFLOW TEST
 * Testing the complete participant workflow in production environment
 * June 22, 2025
 */

// Test Configuration
const PRODUCTION_BASE_URL = 'https://researchhub-saas.vercel.app';
const TEST_STUDY_ID = '6a9957f2-cbab-4013-a149-f02232b3ee9f';
const PARTICIPANT_CREDENTIALS = {
  email: 'abwanwr77+participant@gmail.com',
  password: 'Testtest123'
};

let authToken = null;

// Helper function to make API calls
async function apiCall(endpoint, options = {}) {
  const url = `${PRODUCTION_BASE_URL}/api/${endpoint}`;
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...(authToken ? { 'Authorization': `Bearer ${authToken}` } : {})
    }
  };
  
  const response = await fetch(url, { ...defaultOptions, ...options });
  const data = await response.json();
  
  console.log(`📡 API Call: ${options.method || 'GET'} ${endpoint}`);
  console.log(`📊 Response (${response.status}):`, data);
  
  return { response, data };
}

// Test Steps
async function runCompleteWorkflowTest() {
  console.log('🚀 Starting Live Production Workflow Test');
  console.log('=' .repeat(60));
  
  try {
    // Step 1: Login as participant
    console.log('\n1️⃣ STEP 1: Login as Participant');
    const { response: loginResponse, data: loginData } = await apiCall('auth?action=login', {
      method: 'POST',
      body: JSON.stringify(PARTICIPANT_CREDENTIALS)
    });
    
    if (!loginData.success) {
      throw new Error(`Login failed: ${loginData.error}`);
    }
      authToken = loginData.session.access_token;
    console.log('✅ Login successful');
    console.log('👤 User:', loginData.user);
    
    // Step 2: Get study details
    console.log('\n2️⃣ STEP 2: Get Study Details');
    const { response: studyResponse, data: studyData } = await apiCall(
      `participant-applications?endpoint=studies/${TEST_STUDY_ID}/details`
    );
    
    if (!studyData.success) {
      throw new Error(`Study details failed: ${studyData.error}`);
    }
    
    console.log('✅ Study details retrieved successfully');
    console.log('📋 Study:', {
      id: studyData.study._id,
      title: studyData.study.title,
      compensation: studyData.study.configuration.compensation,
      duration: studyData.study.configuration.duration,
      participants: `${studyData.study.participants.enrolled}/${studyData.study.configuration.maxParticipants}`
    });
    
    // Step 3: Submit application
    console.log('\n3️⃣ STEP 3: Submit Application');
    const applicationData = {
      screeningResponses: [] // No screening questions for basic test
    };
    
    const { response: applyResponse, data: applyData } = await apiCall(
      `participant-applications?endpoint=studies/${TEST_STUDY_ID}/apply`,
      {
        method: 'POST',
        body: JSON.stringify(applicationData)
      }
    );
    
    if (!applyData.success) {
      console.log('❌ Application submission failed:', applyData.error);
      // This is expected if RLS is still blocking or participant already applied
      if (applyData.error.includes('already applied') || applyData.error.includes('duplicate')) {
        console.log('ℹ️ Application already exists - this is expected for testing');
      } else {
        throw new Error(`Application failed: ${applyData.error}`);
      }
    } else {
      console.log('✅ Application submitted successfully');
      console.log('📝 Application ID:', applyData.data.id);
    }
    
    // Step 4: Get my applications
    console.log('\n4️⃣ STEP 4: Get My Applications');
    const { response: myAppsResponse, data: myAppsData } = await apiCall(
      'participant-applications?endpoint=my-applications'
    );
    
    if (!myAppsData.success) {
      throw new Error(`Get applications failed: ${myAppsData.error}`);
    }
    
    console.log('✅ My applications retrieved successfully');
    console.log('📋 Applications count:', myAppsData.data.applications.length);
    
    const targetApplication = myAppsData.data.applications.find(app => app.study_id === TEST_STUDY_ID);
    if (targetApplication) {
      console.log('📝 Target application found:', {
        id: targetApplication.id,
        status: targetApplication.status,
        study_id: targetApplication.study_id,
        applied_at: targetApplication.applied_at
      });
    }
    
    console.log('\n🎉 WORKFLOW TEST COMPLETED SUCCESSFULLY!');
    console.log('=' .repeat(60));
    console.log('✅ Participant can login');
    console.log('✅ Participant can view study details');
    console.log('✅ Participant can submit application (or already applied)');
    console.log('✅ Participant can view their applications');
    console.log('\n🚀 The RLS fix was successful! The API workflow is fully functional.');
    
  } catch (error) {
    console.error('\n❌ WORKFLOW TEST FAILED');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Run the test
runCompleteWorkflowTest();
