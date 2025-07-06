// Temporarily create test applications data to verify the UI workflow
async function createMockApplicationData() {
  console.log('🧪 Creating mock application data for researcher workflow testing...\n');

  const BASE_URL = 'http://localhost:3003';
  
  try {
    // Step 1: Login as researcher
    console.log('1. 👨‍🔬 Logging in as researcher...');
    const researcherLoginResponse = await fetch(`${BASE_URL}/api/auth?action=login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'abwanwr77+Researcher@gmail.com',
        password: 'Testtest123'
      })
    });

    const researcherData = await researcherLoginResponse.json();
    const researcherToken = researcherData.session?.access_token;
    const studyId = '99a0f9b1-bdfe-46b8-961a-97dc3d29fb98';
    
    console.log('✅ Researcher logged in, study ID:', studyId);

    // Step 2: Test the approval endpoint with mock data
    console.log('\n2. ✅ Testing approval workflow with mock application ID...');

    const mockApplicationId = '63db72b7-cde7-47e8-a201-4ccf91bba432'; // From the logs
    
    const approvalResponse = await fetch(`${BASE_URL}/api/applications?endpoint=applications/${mockApplicationId}/review`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${researcherToken}` 
      },
      body: JSON.stringify({
        applicationId: mockApplicationId,
        status: 'approved',
        notes: 'Great candidate! Looking forward to working with them.'
      })
    });

    console.log(`📡 Approval response status: ${approvalResponse.status}`);
    const approvalText = await approvalResponse.text();
    console.log(`📡 Approval response: ${approvalText}`);

    if (approvalResponse.ok) {
      console.log('✅ Application approval endpoint is working!');
    } else {
      console.error('❌ Application approval failed');
    }

    // Step 3: Test if we can work around the RLS issue by temporarily disabling it or creating a direct API
    console.log('\n3. 🔄 Testing alternative approaches...');
    
    // Test the researcher workflow UI via frontend
    console.log('Next: Test the frontend StudyApplicationsManagementPage.tsx in browser');
    console.log('Visit: http://localhost:5175/researcher/studies/99a0f9b1-bdfe-46b8-961a-97dc3d29fb98/applications');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

createMockApplicationData();
