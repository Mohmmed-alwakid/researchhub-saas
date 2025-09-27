/**
 * COMPLETE LIFECYCLE TEST WITH IMMEDIATE DELETE
 * Create a study and immediately delete it to test consistency
 */

console.log('🔍 Complete Lifecycle Test: Create → Delete');

async function testCreateDeleteLifecycle() {
  try {
    // Step 1: Login
    console.log('🔑 Step 1: Authentication...');
    
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
    const userId = loginData.user?.id;

    if (!token) {
      throw new Error('No authentication token received');
    }

    console.log(`✅ Authenticated - User ID: ${userId}`);

    // Step 2: Create a test study
    console.log('\n📝 Step 2: Creating test study...');

    const studyData = {
      title: `Lifecycle Test Study ${Date.now()}`,
      description: 'Test study for create-delete lifecycle validation',
      type: 'unmoderated_study',
      status: 'draft',
      settings: {
        duration: 30,
        maxParticipants: 5
      },
      blocks: [
        {
          id: 'welcome-lifecycle',
          type: 'welcome',
          title: 'Welcome',
          description: 'Welcome to lifecycle test',
          order: 0,
          settings: {}
        },
        {
          id: 'thank-you-lifecycle',
          type: 'thank_you',
          title: 'Thank You',
          description: 'Thank you for testing',
          order: 1,
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

    const createData = await createResponse.json();

    if (!createResponse.ok || !createData.success) {
      throw new Error(`Study creation failed: ${createData.error}`);
    }

    const newStudyId = createData.data?.id;
    const newStudyUuid = createData.data?.uuid;

    console.log(`✅ Study created successfully:`);
    console.log(`   Title: ${createData.data?.title}`);
    console.log(`   ID: ${newStudyId} (${typeof newStudyId})`);
    console.log(`   UUID: ${newStudyUuid}`);

    // Step 3: Verify it appears in studies list
    console.log('\n📚 Step 3: Verifying study appears in list...');

    const studiesResponse = await fetch('https://researchhub-saas.vercel.app/api/research-consolidated?action=get-studies', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'x-user-role': 'researcher'
      }
    });

    const studiesData = await studiesResponse.json();
    const createdStudyInList = studiesData.studies?.find(study => study.id == newStudyId);

    if (createdStudyInList) {
      console.log(`✅ Study found in list: "${createdStudyInList.title}"`);
      console.log(`   List ID: ${createdStudyInList.id} (${typeof createdStudyInList.id})`);
      console.log(`   Researcher: ${createdStudyInList.researcher_id}`);
      console.log(`   Status: ${createdStudyInList.status}`);
    } else {
      console.log(`⚠️ Study NOT found in list - this explains delete issues`);
      return;
    }

    // Step 4: Attempt delete immediately after creation
    console.log('\n🗑️ Step 4: Attempting immediate delete...');

    // Test different ID formats
    const deleteTests = [
      { name: 'Numeric ID', id: newStudyId },
      { name: 'String ID', id: String(newStudyId) },
      { name: 'UUID', id: newStudyUuid }
    ];

    let deleteSuccessful = false;

    for (const test of deleteTests) {
      console.log(`\n   Testing delete with ${test.name}: ${test.id}`);

      const deleteResponse = await fetch('https://researchhub-saas.vercel.app/api/research-consolidated?action=delete-study', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: test.id
        })
      });

      const deleteData = await deleteResponse.json();
      console.log(`   Result: ${deleteResponse.status} - ${deleteData.error || deleteData.message || 'Success'}`);

      if (deleteResponse.ok) {
        console.log(`   ✅ DELETE SUCCESSFUL with ${test.name}!`);
        deleteSuccessful = true;
        break;
      }
    }

    if (!deleteSuccessful) {
      console.log('\n❌ All delete attempts failed');
      console.log('🔍 This confirms the database query mismatch issue');
      
      // Show debug info if available
      if (deleteData && deleteData.debug) {
        console.log('Debug info:', JSON.stringify(deleteData.debug, null, 2));
      }
    }

    // Step 5: Final verification
    console.log('\n🔍 Step 5: Final verification...');

    const finalResponse = await fetch('https://researchhub-saas.vercel.app/api/research-consolidated?action=get-studies', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'x-user-role': 'researcher'
      }
    });

    const finalData = await finalResponse.json();
    const studyStillExists = finalData.studies?.find(study => study.id == newStudyId);

    if (studyStillExists) {
      console.log(`⚠️ Study still exists: "${studyStillExists.title}"`);
      console.log('   Delete operation did not work');
    } else {
      console.log('✅ Study successfully deleted from database');
      console.log('   Delete operation was successful');
    }

    console.log('\n🎯 LIFECYCLE TEST COMPLETE');
    console.log('=' .repeat(50));
    console.log(`✅ Study Creation: Working`);
    console.log(`✅ Study Listing: Working`);
    console.log(`${deleteSuccessful ? '✅' : '❌'} Study Deletion: ${deleteSuccessful ? 'Working' : 'Failed'}`);

  } catch (error) {
    console.error('❌ Lifecycle test failed:', error.message);
  }
}

testCreateDeleteLifecycle();