/**
 * DEBUG STUDY CREATION API RESPONSE
 * Investigation: Why is studyId undefined when creation appears successful?
 */

console.log('🔍 Debugging Study Creation API Response');

async function debugStudyCreation() {
  try {
    // Step 1: Login
    console.log('🔑 Authenticating...');
    
    const loginResponse = await fetch('https://researchhub-saas.vercel.app/api/auth-consolidated?action=login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'abwanwr77+Researcher@gmail.com',
        password: 'Testtest123'
      })
    });

    const loginData = await loginResponse.json();
    const token = loginData.session?.access_token || loginData.tokens?.authToken;
    console.log('✅ Token obtained');

    // Step 2: Create study with detailed response logging
    console.log('\n📝 Creating test study with full response logging...');

    const studyData = {
      title: `Debug Test Study ${Date.now()}`,
      description: 'Debug test for API response analysis',
      type: 'unmoderated_study',
      status: 'draft',
      settings: {
        duration: 30,
        maxParticipants: 10
      },
      blocks: [
        {
          id: 'welcome-debug',
          type: 'welcome',
          title: 'Welcome',
          description: 'Welcome debug test',
          order: 0,
          settings: {}
        }
      ]
    };

    const createResponse = await fetch('https://researchhub-saas.vercel.app/api/research-consolidated?action=create-study', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(studyData)
    });

    // Log full response details
    console.log('\n📊 RESPONSE ANALYSIS:');
    console.log(`Status: ${createResponse.status}`);
    console.log(`Status OK: ${createResponse.ok}`);
    console.log(`Headers: ${JSON.stringify([...createResponse.headers])}`);

    const responseText = await createResponse.text();
    console.log(`Raw Response: ${responseText}`);

    let createData;
    try {
      createData = JSON.parse(responseText);
      console.log('\n📋 PARSED RESPONSE:');
      console.log(`Success: ${createData.success}`);
      console.log(`Full Response:`, JSON.stringify(createData, null, 2));

      // Analyze response structure
      console.log('\n🔍 RESPONSE STRUCTURE ANALYSIS:');
      console.log(`Has 'study' property: ${!!createData.study}`);
      console.log(`Has 'data' property: ${!!createData.data}`);
      console.log(`Has 'id' property: ${!!createData.id}`);
      
      if (createData.study) {
        console.log(`Study object:`, JSON.stringify(createData.study, null, 2));
        console.log(`Study ID: ${createData.study.id}`);
      }
      
      if (createData.data) {
        console.log(`Data object:`, JSON.stringify(createData.data, null, 2));
      }

      // Check for possible ID locations
      const possibleIds = [
        createData.id,
        createData.study?.id,
        createData.data?.id,
        createData.study?.uuid,
        createData.data?.uuid,
        createData.studyId,
        createData.insertId
      ];

      console.log('\n🔍 POSSIBLE ID LOCATIONS:');
      possibleIds.forEach((id, index) => {
        const labels = ['createData.id', 'createData.study?.id', 'createData.data?.id', 'createData.study?.uuid', 'createData.data?.uuid', 'createData.studyId', 'createData.insertId'];
        console.log(`${labels[index]}: ${id}`);
      });

    } catch (parseError) {
      console.error('❌ JSON Parse Error:', parseError.message);
      console.log('Raw response was not valid JSON');
    }

  } catch (error) {
    console.error('❌ Debug test failed:', error.message);
  }
}

debugStudyCreation();