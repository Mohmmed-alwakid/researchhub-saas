/**
 * FRESH STUDY DELETE TEST
 * Create brand new study and immediately try to delete it with comprehensive debugging
 */

console.log('🆕 Fresh Study Delete Test');

async function freshStudyDeleteTest() {
  try {
    // Login
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

    console.log(`✅ Authenticated as: ${userId}`);

    // Create a fresh study
    console.log('\n📝 Creating fresh study...');
    const timestamp = Date.now();
    const studyData = {
      title: `Fresh Delete Test ${timestamp}`,
      description: 'Study for immediate deletion testing',
      type: 'unmoderated_study',
      status: 'draft',
      settings: { duration: 30 },
      blocks: [{
        id: `welcome-${timestamp}`,
        type: 'welcome',
        title: 'Welcome',
        description: 'Test study',
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

    const newStudy = createData.data;
    console.log(`✅ Study created:`);
    console.log(`   ID: ${newStudy.id} (${typeof newStudy.id})`);
    console.log(`   UUID: ${newStudy.uuid}`);
    console.log(`   Title: ${newStudy.title}`);

    // Wait a moment for database consistency
    console.log('\n⏰ Waiting 2 seconds for database consistency...');
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Verify the study exists and get its exact field values
    console.log('\n🔍 Verifying study exists with exact field inspection...');
    const verifyResponse = await fetch('https://researchhub-saas.vercel.app/api/research-consolidated?action=get-studies', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    const verifyData = await verifyResponse.json();
    const foundStudy = verifyData.studies?.find(s => s.id == newStudy.id);

    if (!foundStudy) {
      throw new Error('Fresh study not found in database after creation');
    }

    console.log(`✅ Study found in database:`);
    console.log(`   All fields:`, Object.keys(foundStudy));
    console.log(`   ID: ${foundStudy.id} (${typeof foundStudy.id})`);
    console.log(`   UUID: ${foundStudy.uuid}`);
    console.log(`   researcher_id: ${foundStudy.researcher_id}`);
    console.log(`   created_by: ${foundStudy.created_by}`);
    console.log(`   Current user: ${userId}`);
    console.log(`   Exact match check:`);
    console.log(`     foundStudy.researcher_id === userId: ${foundStudy.researcher_id === userId}`);
    console.log(`     String comparison: ${JSON.stringify(foundStudy.researcher_id)} === ${JSON.stringify(userId)}`);

    // Now attempt deletion using both ID formats
    console.log('\n🗑️ Attempting deletion...');
    
    // Test with UUID first
    console.log(`\n🎯 Delete attempt 1: UUID format`);
    const deleteUuidResponse = await fetch('https://researchhub-saas.vercel.app/api/research-consolidated?action=delete-study', {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ id: foundStudy.uuid })
    });

    const deleteUuidData = await deleteUuidResponse.text();
    console.log(`   UUID Delete Status: ${deleteUuidResponse.status}`);
    console.log(`   UUID Delete Response: ${deleteUuidData}`);

    // Parse for debug info
    let parsedUuidResponse;
    try {
      parsedUuidResponse = JSON.parse(deleteUuidData);
      if (parsedUuidResponse.debug) {
        console.log(`   UUID Debug Info:`, JSON.stringify(parsedUuidResponse.debug, null, 2));
      }
    } catch {
      console.log('   Could not parse UUID response as JSON');
    }

    if (deleteUuidResponse.ok && parsedUuidResponse?.success) {
      console.log('🎉 SUCCESS! UUID deletion worked!');
      return { success: true, method: 'UUID' };
    }

    // Test with numeric ID
    console.log(`\n🎯 Delete attempt 2: Numeric ID format`);
    const deleteNumResponse = await fetch('https://researchhub-saas.vercel.app/api/research-consolidated?action=delete-study', {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ id: foundStudy.id })
    });

    const deleteNumData = await deleteNumResponse.text();
    console.log(`   Numeric Delete Status: ${deleteNumResponse.status}`);
    console.log(`   Numeric Delete Response: ${deleteNumData}`);

    // Parse for debug info
    let parsedNumResponse;
    try {
      parsedNumResponse = JSON.parse(deleteNumData);
      if (parsedNumResponse.debug) {
        console.log(`   Numeric Debug Info:`, JSON.stringify(parsedNumResponse.debug, null, 2));
      }
    } catch {
      console.log('   Could not parse numeric response as JSON');
    }

    if (deleteNumResponse.ok && parsedNumResponse?.success) {
      console.log('🎉 SUCCESS! Numeric ID deletion worked!');
      return { success: true, method: 'Numeric ID' };
    }

    console.log('\n❌ Both deletion methods failed for fresh study');
    console.log('🔧 This suggests a fundamental issue with the delete query logic');

    return { success: false, error: 'Both deletion methods failed' };

  } catch (error) {
    console.error('❌ Fresh study delete test failed:', error.message);
    return { success: false, error: error.message };
  }
}

freshStudyDeleteTest();