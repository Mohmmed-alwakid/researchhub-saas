// Check database for studies and create test data if needed
async function checkAndCreateTestData() {
  console.log('🧪 Checking database for test data...\n');

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

    const loginData = await loginResponse.json();
    const token = loginData.token;
    const researcherId = loginData.user?.id;
    
    console.log('✅ Researcher logged in:', {
      userId: researcherId,
      role: loginData.user?.role
    });

    // Step 2: Check all studies in database (admin view)
    console.log('\n2. 📚 Checking all studies in database...');
    const allStudiesResponse = await fetch(`${BASE_URL}/api/studies?action=all`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (allStudiesResponse.ok) {
      const allStudiesData = await allStudiesResponse.json();
      console.log('📊 All studies in database:', {
        count: allStudiesData.data?.studies?.length || 0,
        studies: allStudiesData.data?.studies?.map(s => ({
          id: s.id,
          title: s.title,
          researcher_id: s.researcher?.id || s.researcher_id,
          status: s.status
        }))
      });
    }

    // Step 3: Check researcher's studies specifically
    console.log('\n3. 🔍 Checking researcher-specific studies...');
    const myStudiesResponse = await fetch(`${BASE_URL}/api/studies?action=my-studies`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (myStudiesResponse.ok) {
      const myStudiesData = await myStudiesResponse.json();
      console.log('🏠 Researcher\'s studies:', {
        count: myStudiesData.data?.studies?.length || 0,
        studies: myStudiesData.data?.studies
      });
    }

    // Step 4: If no studies exist for researcher, create a test study
    const myStudiesData = await myStudiesResponse.json();
    if (!myStudiesData.data?.studies?.length) {
      console.log('\n4. 🏗️ Creating test study for researcher...');
      
      const createStudyResponse = await fetch(`${BASE_URL}/api/studies?action=create`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({
          title: 'Test Study for Application Management',
          description: 'A test study to demonstrate application management workflow',
          type: 'user_interview',
          status: 'active',
          target_participants: 10,
          settings: {
            duration: 30,
            compensation: 25,
            maxParticipants: 10
          },
          blocks: [
            {
              type: 'welcome_screen',
              title: 'Welcome to Test Study',
              description: 'Thank you for participating in our test study',
              order: 0,
              settings: {}
            },
            {
              type: 'thank_you',
              title: 'Thank You',
              description: 'Thank you for completing our study',
              order: 1,
              settings: {}
            }
          ]
        })
      });

      if (createStudyResponse.ok) {
        const newStudy = await createStudyResponse.json();
        console.log('✅ Test study created:', {
          id: newStudy.data?.study?.id,
          title: newStudy.data?.study?.title
        });

        // Step 5: Create test applications for this study
        console.log('\n5. 📝 Creating test applications...');
        
        // First login as participant
        const participantLoginResponse = await fetch(`${BASE_URL}/api/auth?action=login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: 'abwanwr77+participant@gmail.com',
            password: 'Testtest123'
          })
        });

        if (participantLoginResponse.ok) {
          const participantData = await participantLoginResponse.json();
          const participantToken = participantData.token;
          const studyId = newStudy.data?.study?.id;

          // Create a test application
          const applicationResponse = await fetch(`${BASE_URL}/api/applications?action=apply`, {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${participantToken}` 
            },
            body: JSON.stringify({
              studyId: studyId,
              applicationData: {
                motivation: 'I want to help with research',
                experience: 'Some experience with user testing',
                availability: 'Weekdays and weekends'
              }
            })
          });

          if (applicationResponse.ok) {
            const applicationResult = await applicationResponse.json();
            console.log('✅ Test application created:', applicationResult);
          } else {
            const errorText = await applicationResponse.text();
            console.error('❌ Failed to create application:', errorText);
          }
        }

      } else {
        const errorText = await createStudyResponse.text();
        console.error('❌ Failed to create test study:', errorText);
      }
    }

    // Step 6: Now test the applications endpoint again
    console.log('\n6. 🔄 Re-testing applications endpoint...');
    const finalMyStudiesResponse = await fetch(`${BASE_URL}/api/studies?action=my-studies`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (finalMyStudiesResponse.ok) {
      const finalStudiesData = await finalMyStudiesResponse.json();
      if (finalStudiesData.data?.studies?.length > 0) {
        const studyId = finalStudiesData.data.studies[0].id;
        
        console.log(`📋 Testing applications for study ${studyId}...`);
        const applicationsResponse = await fetch(`${BASE_URL}/api/applications?endpoint=study/${studyId}/applications`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        const responseText = await applicationsResponse.text();
        console.log(`📡 Applications response status: ${applicationsResponse.status}`);
        console.log(`📡 Applications response: ${responseText}`);
      }
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

checkAndCreateTestData();
