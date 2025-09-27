/**
 * ENHANCED DELETE API DEBUG TEST
 * Add extensive logging to understand what's happening in the Supabase query
 */

console.log('🔍 Enhanced Delete API Debug Test');

async function debugDeleteApi() {
  try {
    // Login and get user details
    console.log('🔑 Getting authentication details...');
    
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
    
    console.log(`✅ User ID from auth: ${userId}`);

    // Get studies to find one to delete
    const studiesResponse = await fetch('https://researchhub-saas.vercel.app/api/research-consolidated?action=get-studies', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'x-user-role': 'researcher'
      }
    });

    const studiesData = await studiesResponse.json();
    const ownedStudy = studiesData.studies?.find(study => study.researcher_id === userId);

    if (!ownedStudy) {
      console.log('❌ No owned study found');
      return;
    }

    console.log(`\n🎯 Target study details:`);
    console.log(`   Title: ${ownedStudy.title}`);
    console.log(`   ID: ${ownedStudy.id} (${typeof ownedStudy.id})`);
    console.log(`   Researcher ID: ${ownedStudy.researcher_id}`);
    console.log(`   Status: ${ownedStudy.status}`);

    // Create a custom debug version of the delete request that logs everything
    console.log('\n🔍 Creating debug delete request...');

    // Instead of calling the API directly, let's simulate the API logic to debug it
    console.log('\n📊 SIMULATING API LOGIC:');
    
    console.log(`1. Authentication: Would use token to get user ID: ${userId}`);
    console.log(`2. Study ID extraction: ${ownedStudy.id}`);
    console.log(`3. Supabase query would be:`);
    console.log(`   SELECT id, title, status, researcher_id FROM studies`);
    console.log(`   WHERE id = ${ownedStudy.id} AND researcher_id = '${userId}'`);
    
    // Let's verify that our study shows up in the studies list with the exact same IDs
    console.log('\n🔍 VERIFICATION - Looking for exact match in studies list:');
    
    const exactMatch = studiesData.studies?.find(study => {
      const idMatch = study.id === ownedStudy.id;
      const researcherMatch = study.researcher_id === userId;
      
      console.log(`   Study "${study.title}"`);
      console.log(`     ID Match: ${study.id} === ${ownedStudy.id} = ${idMatch}`);
      console.log(`     Researcher Match: ${study.researcher_id} === ${userId} = ${researcherMatch}`);
      
      return idMatch && researcherMatch;
    });

    if (exactMatch) {
      console.log(`✅ FOUND EXACT MATCH: Study should be deletable`);
      
      // Now try the actual delete with maximum debugging
      console.log('\n🗑️ Attempting actual delete with debug...');
      
      const deleteResponse = await fetch('https://researchhub-saas.vercel.app/api/research-consolidated?action=delete-study', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: ownedStudy.id,
          debug: true  // Add debug flag if API supports it
        })
      });

      const deleteData = await deleteResponse.json();
      console.log(`\n📋 DELETE RESPONSE DETAILS:`);
      console.log(`   Status: ${deleteResponse.status}`);
      console.log(`   Success: ${deleteData.success}`);
      console.log(`   Error: ${deleteData.error || 'none'}`);
      console.log(`   Message: ${deleteData.message || 'none'}`);
      console.log(`   Full Response:`, JSON.stringify(deleteData, null, 2));

    } else {
      console.log(`❌ NO EXACT MATCH FOUND - This explains the 404 error`);
    }

  } catch (error) {
    console.error('❌ Enhanced debug test failed:', error.message);
  }
}

debugDeleteApi();