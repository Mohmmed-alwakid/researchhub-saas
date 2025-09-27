/**
 * QUICK DELETE DEBUG TEST
 * Test delete with the study we know exists and is visible
 */

console.log('🔍 Quick Delete Debug Test');

async function quickDeleteDebug() {
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

    // Get the first study from the list
    const studiesResponse = await fetch('https://researchhub-saas.vercel.app/api/research-consolidated?action=get-studies', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'x-user-role': 'researcher'
      }
    });

    const studiesData = await studiesResponse.json();
    
    if (!studiesData.studies || studiesData.studies.length === 0) {
      console.log('❌ No studies found');
      return;
    }

    const testStudy = studiesData.studies[0];
    console.log(`🎯 Testing delete with visible study:`);
    console.log(`   Title: "${testStudy.title}"`);
    console.log(`   ID: ${testStudy.id} (${typeof testStudy.id})`);
    console.log(`   Researcher: ${testStudy.researcher_id}`);
    console.log(`   Current User: ${userId}`);
    console.log(`   Ownership Match: ${testStudy.researcher_id === userId ? 'YES' : 'NO'}`);

    // Test delete
    const deleteResponse = await fetch('https://researchhub-saas.vercel.app/api/research-consolidated?action=delete-study', {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        id: testStudy.id,
        debug: true
      })
    });

    const deleteData = await deleteResponse.json();
    
    console.log(`\n🗑️ Delete Result:`);
    console.log(`   Status: ${deleteResponse.status}`);
    console.log(`   Success: ${deleteData.success}`);
    console.log(`   Message: ${deleteData.message || 'none'}`);
    console.log(`   Error: ${deleteData.error || 'none'}`);
    
    if (deleteData.debug) {
      console.log(`   Debug:`, JSON.stringify(deleteData.debug, null, 2));
    }

    if (deleteResponse.ok) {
      console.log('\n🎉 DELETE SUCCESSFUL!');
    } else {
      console.log('\n💡 The debug info shows our query attempts.');
      console.log('   Check Vercel function logs for detailed server output:');
      console.log('   https://vercel.com/mohmmed-alwakids-projects/researchhub-saas/functions');
    }

  } catch (error) {
    console.error('❌ Quick debug failed:', error.message);
  }
}

quickDeleteDebug();