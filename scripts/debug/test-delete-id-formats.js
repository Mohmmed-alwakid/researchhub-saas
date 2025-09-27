/**
 * TEST DELETE WITH BOTH ID FORMATS
 * Check which ID format works for deletion: numeric ID or UUID
 */

console.log('🔍 Testing Delete with Both ID Formats');

async function testDeleteIdFormats() {
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

    // Step 2: Create study 
    console.log('\n📝 Creating test study...');

    const studyData = {
      title: `ID Test Study ${Date.now()}`,
      description: 'Test study for ID format validation',
      type: 'unmoderated_study',
      status: 'draft',
      blocks: [
        {
          id: 'welcome-id-test',
          type: 'welcome',
          title: 'Welcome',
          description: 'Welcome ID test',
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

    const createData = await createResponse.json();
    const numericId = createData.data?.id;
    const uuidId = createData.data?.uuid;

    console.log(`✅ Study created:`);
    console.log(`   Numeric ID: ${numericId}`);
    console.log(`   UUID: ${uuidId}`);

    // Step 3: Test Delete with Numeric ID first
    console.log('\n🗑️ Testing delete with NUMERIC ID...');

    const deleteNumericResponse = await fetch('https://researchhub-saas.vercel.app/api/research-consolidated?action=delete-study', {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        id: numericId
      })
    });

    const deleteNumericData = await deleteNumericResponse.json();
    console.log(`Numeric ID Delete: ${deleteNumericResponse.status} - ${deleteNumericData.error || deleteNumericData.message || 'Success'}`);

    // If numeric delete failed, try with UUID
    if (!deleteNumericResponse.ok) {
      console.log('\n🗑️ Testing delete with UUID...');

      const deleteUuidResponse = await fetch('https://researchhub-saas.vercel.app/api/research-consolidated?action=delete-study', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: uuidId
        })
      });

      const deleteUuidData = await deleteUuidResponse.json();
      console.log(`UUID Delete: ${deleteUuidResponse.status} - ${deleteUuidData.error || deleteUuidData.message || 'Success'}`);

      if (deleteUuidResponse.ok) {
        console.log('✅ SUCCESS: UUID format works for deletion');
      } else {
        console.log('⚠️ Both ID formats failed - may be database/permissions issue');
      }
    } else {
      console.log('✅ SUCCESS: Numeric ID format works for deletion');
    }

    // Step 4: Get current studies to verify
    console.log('\n📚 Checking final study list...');

    const finalResponse = await fetch('https://researchhub-saas.vercel.app/api/research-consolidated?action=get-studies', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'x-user-role': 'researcher'
      }
    });

    const finalData = await finalResponse.json();
    const studyStillExists = finalData.studies?.find(study => study.id == numericId || study.uuid === uuidId);
    
    if (!studyStillExists) {
      console.log('✅ Study successfully deleted from database');
    } else {
      console.log('⚠️ Study still exists in database after delete attempt');
    }

  } catch (error) {
    console.error('❌ ID format test failed:', error.message);
  }
}

testDeleteIdFormats();