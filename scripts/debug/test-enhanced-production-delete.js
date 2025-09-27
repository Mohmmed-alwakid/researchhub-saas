/**
 * TEST ENHANCED DELETE API ON PRODUCTION
 * Test the updated research-consolidated API with debug logging
 */

console.log('🔍 Testing Enhanced Delete API on Production');

async function testEnhancedDeleteOnProduction() {
  try {
    // Login first
    console.log('🔑 Getting authentication token...');
    
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
    
    if (!token) {
      throw new Error('No authentication token received');
    }
    
    console.log('✅ Authentication token obtained');

    // Get a study to delete
    const studiesResponse = await fetch('https://researchhub-saas.vercel.app/api/research-consolidated?action=get-studies', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'x-user-role': 'researcher'
      }
    });

    const studiesData = await studiesResponse.json();
    const userId = loginData.user?.id;
    const testStudy = studiesData.studies?.find(study => study.researcher_id === userId);

    if (!testStudy) {
      console.log('❌ No owned study found for testing');
      return;
    }

    console.log(`🎯 Testing with study: "${testStudy.title}" (ID: ${testStudy.id})`);

    // Call the enhanced delete API (research-consolidated with debug logging)
    console.log('\n🗑️ Calling enhanced delete API (after deployment)...');
    
    // Wait for deployment
    console.log('⏳ Waiting for deployment...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    const enhancedDeleteResponse = await fetch('https://researchhub-saas.vercel.app/api/research-consolidated?action=delete-study', {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        id: testStudy.id
      })
    });

    const enhancedDeleteData = await enhancedDeleteResponse.json();

    console.log(`\n📋 ENHANCED DELETE RESPONSE:`);
    console.log(`Status: ${enhancedDeleteResponse.status}`);
    console.log(`Success: ${enhancedDeleteData.success}`);
    console.log(`Message: ${enhancedDeleteData.message || 'none'}`);
    console.log(`Error: ${enhancedDeleteData.error || 'none'}`);
    
    if (enhancedDeleteData.debug) {
      console.log(`Debug Info:`, JSON.stringify(enhancedDeleteData.debug, null, 2));
    }

    if (enhancedDeleteResponse.ok) {
      console.log('\n🎉 DELETE OPERATION SUCCESSFUL WITH ENHANCED API!');
      console.log('✅ Debug logging revealed the solution!');
    } else {
      console.log('\n⚠️ Delete operation failed - but we should have debug info now');
    }

    // Check server logs (Vercel function logs)
    console.log('\n💡 Check Vercel function logs for detailed debug output');
    console.log('   Visit: https://vercel.com/mohmmed-alwakids-projects/researchhub-saas/functions');

  } catch (error) {
    console.error('❌ Enhanced delete test failed:', error.message);
  }
}

testEnhancedDeleteOnProduction();