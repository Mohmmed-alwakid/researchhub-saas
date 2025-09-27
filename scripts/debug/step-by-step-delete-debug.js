/**
 * STEP-BY-STEP DELETE DEBUG TEST
 * Debug each step of the delete process in detail
 */

console.log('🔍 Step-by-Step Delete Debug Test');

async function stepByStepDeleteDebug() {
  try {
    // Step 1: Authentication
    console.log('\n🔐 STEP 1: Authentication');
    const loginResponse = await fetch('https://researchhub-saas.vercel.app/api/auth-consolidated?action=login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'abwanwr77+Researcher@gmail.com',
        password: 'Testtest123'
      })
    });

    const loginData = await loginResponse.json();
    const token = loginData.session?.access_token || loginData.tokens?.authToken;
    const userId = loginData.user?.id;

    console.log(`✅ Auth successful: ${userId}`);

    // Step 2: Create a test study
    console.log('\n📝 STEP 2: Create Test Study');
    const studyData = {
      title: `Debug Delete Test ${Date.now()}`,
      description: 'Study for debugging delete functionality',
      type: 'unmoderated_study',
      status: 'draft',
      settings: { duration: 30 },
      blocks: [{
        id: 'welcome-debug',
        type: 'welcome', 
        title: 'Welcome',
        description: 'Debug test',
        order: 0,
        settings: {}
      }]
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
    if (!createData.success) {
      throw new Error(`Study creation failed: ${createData.error}`);
    }

    const studyId = createData.data.id;
    const studyUuid = createData.data.uuid;
    console.log(`✅ Study created: ID=${studyId}, UUID=${studyUuid}`);

    // Step 3: Verify study exists in database
    console.log('\n📋 STEP 3: Verify Study Exists');
    const getResponse = await fetch('https://researchhub-saas.vercel.app/api/research-consolidated?action=get-studies', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    const getData = await getResponse.json();
    const foundStudy = getData.studies?.find(s => s.id == studyId);
    
    if (foundStudy) {
      console.log(`✅ Study found in database:`);
      console.log(`   ID: ${foundStudy.id} (${typeof foundStudy.id})`);
      console.log(`   UUID: ${foundStudy.uuid}`);
      console.log(`   researcher_id: ${foundStudy.researcher_id}`);
      console.log(`   created_by: ${foundStudy.created_by}`);
      console.log(`   Current user: ${userId}`);
      console.log(`   Ownership (researcher_id): ${foundStudy.researcher_id === userId ? 'MATCH' : 'NO MATCH'}`);
    } else {
      throw new Error('Study not found in database after creation');
    }

    // Step 4: Test delete with detailed request/response logging
    console.log('\n🗑️ STEP 4: Attempt Delete (UUID format)');
    
    // First try UUID
    console.log(`Deleting UUID: ${studyUuid}`);
    const deleteResponse = await fetch('https://researchhub-saas.vercel.app/api/research-consolidated?action=delete-study', {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'User-Agent': 'Debug-Test/1.0'
      },
      body: JSON.stringify({ id: studyUuid })
    });

    // Log raw response
    const responseText = await deleteResponse.text();
    console.log(`Delete Response Status: ${deleteResponse.status}`);
    console.log(`Delete Response Headers:`, Object.fromEntries(deleteResponse.headers.entries()));
    console.log(`Delete Response Body: ${responseText}`);

    let deleteData;
    try {
      deleteData = JSON.parse(responseText);
    } catch {
      console.log('❌ Response is not valid JSON');
      deleteData = { error: 'Invalid JSON response', rawResponse: responseText };
    }

    if (deleteResponse.ok && deleteData.success) {
      console.log('🎉 UUID DELETE SUCCESSFUL!');
    } else {
      console.log('❌ UUID delete failed, trying numeric ID...');
      
      // Try numeric ID
      console.log(`\n🔄 STEP 4b: Attempt Delete (Numeric format)`);
      console.log(`Deleting ID: ${studyId}`);
      
      const numericDeleteResponse = await fetch('https://researchhub-saas.vercel.app/api/research-consolidated?action=delete-study', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id: studyId })
      });

      const numericResponseText = await numericDeleteResponse.text();
      console.log(`Numeric Delete Status: ${numericDeleteResponse.status}`);
      console.log(`Numeric Delete Body: ${numericResponseText}`);

      if (numericDeleteResponse.ok) {
        console.log('🎉 NUMERIC ID DELETE SUCCESSFUL!');
      } else {
        console.log('❌ Both delete attempts failed');
      }
    }

    // Step 5: Verify if study was actually deleted
    console.log('\n🔍 STEP 5: Verify Deletion');
    const verifyResponse = await fetch('https://researchhub-saas.vercel.app/api/research-consolidated?action=get-studies', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    const verifyData = await verifyResponse.json();
    const stillExists = verifyData.studies?.find(s => s.id == studyId);
    
    if (stillExists) {
      console.log('❌ Study still exists after delete attempt');
    } else {
      console.log('✅ Study successfully deleted from database');
    }

  } catch (error) {
    console.error('❌ Step-by-step debug failed:', error.message);
  }
}

stepByStepDeleteDebug();