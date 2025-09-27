/**
 * WAIT FOR DEPLOYMENT AND TEST CONSISTENCY FIX
 */

console.log('⏳ Waiting for deployment and testing RLS consistency fix...');

async function testAfterDeployment() {
  // Wait for Vercel deployment
  console.log('⏳ Waiting 10 seconds for deployment...');
  await new Promise(resolve => setTimeout(resolve, 10000));
  
  try {
    // Login
    console.log('\n🔑 Authenticating...');
    
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

    console.log('✅ Authenticated');

    // Test studies list first
    console.log('\n📚 Testing studies list with admin client...');

    const studiesResponse = await fetch('https://researchhub-saas.vercel.app/api/research-consolidated?action=get-studies', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'x-user-role': 'researcher'
      }
    });

    const studiesData = await studiesResponse.json();
    
    if (studiesData.success && studiesData.studies && studiesData.studies.length > 0) {
      console.log(`✅ Studies retrieved: ${studiesData.studies.length} studies found`);
      
      // Find a study to delete
      const testStudy = studiesData.studies[0];
      console.log(`🎯 Testing delete with: "${testStudy.title}" (ID: ${testStudy.id})`);

      // Test delete
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
      
      console.log(`\n🗑️ Delete result: ${deleteResponse.status} - ${deleteData.error || deleteData.message || 'Success'}`);
      
      if (deleteResponse.ok) {
        console.log('🎉 SUCCESS: Delete operation working with RLS consistency fix!');
        console.log('✅ Platform is now fully functional');
      } else {
        console.log('⚠️ Delete still failing - may need additional investigation');
        if (deleteData.debug) {
          console.log('Debug info:', JSON.stringify(deleteData.debug, null, 2));
        }
      }
      
    } else {
      console.log('❌ Studies list still empty - deployment may not be complete');
    }

  } catch (error) {
    console.error('❌ Test after deployment failed:', error.message);
  }
}

testAfterDeployment();