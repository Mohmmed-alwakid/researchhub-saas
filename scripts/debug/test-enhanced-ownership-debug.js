/**
 * TEST ENHANCED OWNERSHIP DEBUGGING
 * This will show us exactly why the ownership check is failing
 */

console.log('🔍 Testing Enhanced Ownership Debugging');

async function testEnhancedOwnershipDebugging() {
  console.log('⏳ Waiting 30 seconds for deployment...');
  await new Promise(resolve => setTimeout(resolve, 30000));

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

    console.log(`✅ Authenticated - User ID: ${userId}`);

    // Get studies to find a test study
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
    console.log(`\n🎯 Testing with study:`);
    console.log(`   Title: "${testStudy.title}"`);
    console.log(`   ID: ${testStudy.id} (${typeof testStudy.id})`);
    console.log(`   Owner in list: ${testStudy.researcher_id}`);
    console.log(`   Current user: ${userId}`);
    console.log(`   IDs match: ${testStudy.researcher_id === userId ? 'YES' : 'NO'}`);
    console.log(`   ID types match: ${typeof testStudy.researcher_id === typeof userId ? 'YES' : 'NO'}`);

    // Test delete with enhanced debugging
    console.log('\n🗑️ Testing delete with enhanced debugging...');

    const deleteResponse = await fetch('https://researchhub-saas.vercel.app/api/research-consolidated?action=delete-study', {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        id: testStudy.id
      })
    });

    const deleteData = await deleteResponse.json();
    
    console.log(`\n📋 Enhanced Delete Result:`);
    console.log(`   Status: ${deleteResponse.status}`);
    console.log(`   Success: ${deleteData.success}`);
    console.log(`   Message: ${deleteData.message || 'none'}`);
    console.log(`   Error: ${deleteData.error || 'none'}`);
    
    if (deleteData.debug) {
      console.log(`   Debug Info:`, JSON.stringify(deleteData.debug, null, 2));
    }

    if (deleteResponse.ok) {
      console.log('\n🎉 DELETE FINALLY SUCCESSFUL!');
      console.log('✅ Issue was in the ownership matching logic');
    } else {
      console.log('\n💡 Enhanced debugging should show the exact ownership mismatch');
      console.log('   Check Vercel function logs for detailed server output');
      
      // The enhanced debugging will show us:
      // 1. If the study exists at all
      // 2. Who owns the study vs who's trying to delete it
      // 3. The exact ID comparison details
    }

  } catch (error) {
    console.error('❌ Enhanced debugging test failed:', error.message);
  }
}

testEnhancedOwnershipDebugging();