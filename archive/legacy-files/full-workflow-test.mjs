// Create test application for the study to test the full workflow
async function createTestApplication() {
  console.log('🧪 Creating test application for researcher workflow...\n');

  const BASE_URL = 'http://localhost:3003';
  
  try {
    // Step 1: Login as participant
    console.log('1. 👤 Logging in as participant...');
    const participantLoginResponse = await fetch(`${BASE_URL}/api/auth?action=login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'abwanwr77+participant@gmail.com',
        password: 'Testtest123'
      })
    });

    if (!participantLoginResponse.ok) {
      const errorText = await participantLoginResponse.text();
      console.error('❌ Participant login failed:', participantLoginResponse.status, errorText);
      return;
    }

    const participantData = await participantLoginResponse.json();
    const participantToken = participantData.session?.access_token;
    console.log('✅ Participant logged in:', {
      userId: participantData.user?.id,
      role: participantData.user?.role
    });

    // Step 2: Get the study ID (we know it from previous test)
    const studyId = '99a0f9b1-bdfe-46b8-961a-97dc3d29fb98';
    console.log(`📚 Using study ID: ${studyId}`);

    // Step 3: Create application for the study
    console.log('\n2. 📝 Creating application...');
    const applicationResponse = await fetch(`${BASE_URL}/api/applications?action=apply`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${participantToken}` 
      },
      body: JSON.stringify({
        studyId: studyId,
        applicationData: {
          motivation: 'I am very interested in participating in user research and helping improve digital products.',
          experience: 'I have participated in several usability studies and have experience with online tools.',
          availability: 'Available weekdays 9 AM - 5 PM and weekends.',
          demographics: {
            age: '25-34',
            occupation: 'Software Developer',
            techExperience: 'Advanced'
          }
        }
      })
    });

    console.log(`📡 Application response status: ${applicationResponse.status}`);
    const applicationText = await applicationResponse.text();
    console.log(`📡 Application response: ${applicationText}`);

    if (applicationResponse.ok) {
      const applicationResult = JSON.parse(applicationText);
      console.log('✅ Application created:', {
        success: applicationResult.success,
        applicationId: applicationResult.data?.application?.id
      });
    } else {
      console.error('❌ Failed to create application');
      return;
    }

    // Step 4: Now test the researcher can see the application
    console.log('\n3. 👨‍🔬 Testing researcher can see application...');
    
    // Login as researcher
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
    console.log('✅ Researcher logged in');

    // Check applications
    const applicationsResponse = await fetch(`${BASE_URL}/api/applications?endpoint=study/${studyId}/applications`, {
      headers: { 'Authorization': `Bearer ${researcherToken}` }
    });

    console.log(`📡 Applications check status: ${applicationsResponse.status}`);
    const applicationsText = await applicationsResponse.text();
    console.log(`📡 Applications response: ${applicationsText}`);

    if (applicationsResponse.ok) {
      const applicationsData = JSON.parse(applicationsText);
      console.log('✅ Applications retrieved:', {
        success: applicationsData.success,
        count: applicationsData.data?.applications?.length || 0,
        applications: applicationsData.data?.applications
      });

      // Step 5: Test approval workflow if we have applications
      if (applicationsData.data?.applications?.length > 0) {
        const applicationId = applicationsData.data.applications[0].id;
        console.log(`\n4. ✅ Testing approval workflow for application ${applicationId}...`);

        const approvalResponse = await fetch(`${BASE_URL}/api/applications?endpoint=review`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${researcherToken}` 
          },
          body: JSON.stringify({
            applicationId: applicationId,
            status: 'approved',
            notes: 'Great candidate! Looking forward to working with them.'
          })
        });

        console.log(`📡 Approval response status: ${approvalResponse.status}`);
        const approvalText = await approvalResponse.text();
        console.log(`📡 Approval response: ${approvalText}`);

        if (approvalResponse.ok) {
          console.log('✅ Application approved successfully!');
          console.log('\n🎉 Full researcher application management workflow is working!');
        }
      }
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

createTestApplication();
