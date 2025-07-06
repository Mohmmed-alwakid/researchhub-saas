// Simple test to create an application directly and see what happens
async function testApplicationCreation() {
  console.log('🧪 Testing application creation directly...\n');

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

    const participantData = await participantLoginResponse.json();
    const participantToken = participantData.session?.access_token;
    console.log('✅ Participant logged in:', {
      userId: participantData.user?.id,
      role: participantData.user?.role,
      tokenLength: participantToken?.length
    });

    // Step 2: Create application with correct payload structure
    const studyId = '99a0f9b1-bdfe-46b8-961a-97dc3d29fb98';
    console.log(`\n2. 📝 Creating application for study ${studyId}...`);
    
    const applicationPayload = {
      studyId: studyId,
      responses: {
        motivation: 'I am very interested in participating in user research.',
        experience: 'I have participated in several usability studies.',
        availability: 'Available weekdays 9 AM - 5 PM and weekends.'
      },
      demographics: {
        age: '25-34',
        occupation: 'Software Developer',
        techExperience: 'Advanced'
      }
    };

    console.log('📋 Payload:', applicationPayload);

    const applicationResponse = await fetch(`${BASE_URL}/api/applications`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${participantToken}` 
      },
      body: JSON.stringify(applicationPayload)
    });

    console.log(`📡 Application response status: ${applicationResponse.status}`);
    console.log(`📡 Application response headers:`, Object.fromEntries(applicationResponse.headers.entries()));
    
    const applicationText = await applicationResponse.text();
    console.log(`📡 Application response text: ${applicationText}`);

    if (applicationResponse.ok) {
      const applicationResult = JSON.parse(applicationText);
      console.log('✅ Application created successfully:', applicationResult);
    } else {
      console.error('❌ Application creation failed');
      
      // Try with different endpoint
      console.log('\n3. 🔄 Trying with action=apply endpoint...');
      const altResponse = await fetch(`${BASE_URL}/api/applications?action=apply`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${participantToken}` 
        },
        body: JSON.stringify(applicationPayload)
      });

      console.log(`📡 Alt response status: ${altResponse.status}`);
      const altText = await altResponse.text();
      console.log(`📡 Alt response: ${altText}`);
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

testApplicationCreation();
