/**
 * APPLICATION SUBMISSION FIX TEST
 * Test the deployed fix for the 400 error in application submission
 */

const PRODUCTION_URL = 'https://researchhub-saas.vercel.app';
const TEST_ACCOUNTS = {
  participant: {
    email: 'abwanwr77+participant@gmail.com',
    password: 'Testtest123'
  }
};

async function testApplicationSubmissionFix() {
  console.log('🧪 Testing Application Submission Fix...\n');

  try {
    // Step 1: Login as participant
    console.log('1️⃣ Logging in as participant...');
    const loginResponse = await fetch(`${PRODUCTION_URL}/api/auth-consolidated?action=login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: TEST_ACCOUNTS.participant.email,
        password: TEST_ACCOUNTS.participant.password
      })
    });

    const loginData = await loginResponse.json();
    
    console.log('📋 Login response:', JSON.stringify(loginData, null, 2));
    
    if (!loginData.success) {
      throw new Error(`Login failed: ${loginData.error}`);
    }
    
    // Extract token from response structure  
    const token = loginData.session?.access_token;
    if (!token) {
      throw new Error('No token found in login response');
    }
    console.log('✅ Login successful, token extracted');

    // Step 2: Test the application submission with our fixed format
    console.log('\n2️⃣ Testing application submission...');
    
    const applicationData = {
      studyId: 'demo-study-001', // Now in body as expected by API
      screeningResponses: [
        {
          questionId: 'q1',
          question: 'Are you interested in participating?',
          answer: 'Yes, very interested!'
        }
      ]
    };

    console.log('📋 Application data:', JSON.stringify(applicationData, null, 2));

    const applyResponse = await fetch(`${PRODUCTION_URL}/api/applications`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(applicationData)
    });

    console.log('📡 Response status:', applyResponse.status);
    console.log('📡 Response headers:', Object.fromEntries(applyResponse.headers.entries()));

    const applyData = await applyResponse.json();
    console.log('📋 Response data:', JSON.stringify(applyData, null, 2));

    if (applyResponse.status === 200 || applyResponse.status === 201) {
      console.log('\n✅ APPLICATION SUBMISSION FIX SUCCESS!');
      console.log('🎯 The 400 error has been resolved');
      console.log('📊 Application data:', {
        id: applyData.data?.id,
        status: applyData.data?.status,
        study_id: applyData.data?.study_id
      });
      return true;
    } else {
      console.log('\n❌ APPLICATION SUBMISSION STILL FAILING');
      console.log('🔍 Status:', applyResponse.status);
      console.log('🔍 Error:', applyData.error || 'Unknown error');
      return false;
    }

  } catch (error) {
    console.error('\n❌ TEST ERROR:', error.message);
    return false;
  }
}

// Run the test
testApplicationSubmissionFix()
  .then(success => {
    if (success) {
      console.log('\n🎉 FIX VERIFICATION COMPLETE - SUCCESS!');
      console.log('✅ Application submission is now working');
      console.log('🚀 Ready for production use');
    } else {
      console.log('\n⚠️ FIX VERIFICATION FAILED');
      console.log('🔧 Further debugging required');
    }
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('Test execution error:', error);
    process.exit(1);
  });
