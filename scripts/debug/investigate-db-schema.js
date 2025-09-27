/**
 * INVESTIGATE DATABASE SCHEMA
 * Check how studies are stored and what fields are used for lookup
 */

console.log('🔍 Investigating Database Schema');

async function investigateDbSchema() {
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
    const userId = loginData.user?.id;
    console.log(`✅ Token obtained - User ID: ${userId}`);

    // Step 2: Get all studies and analyze their structure
    console.log('\n📚 Getting studies and analyzing their structure...');

    const studiesResponse = await fetch('https://researchhub-saas.vercel.app/api/research-consolidated?action=get-studies', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'x-user-role': 'researcher'
      }
    });

    const studiesData = await studiesResponse.json();
    
    if (studiesData.studies && studiesData.studies.length > 0) {
      console.log(`\n📊 Found ${studiesData.studies.length} studies. Analyzing structure...`);
      
      // Analyze first few studies
      const sampleStudies = studiesData.studies.slice(0, 3);
      
      sampleStudies.forEach((study, index) => {
        console.log(`\n📄 Study ${index + 1} Structure:`);
        console.log(`   Title: ${study.title}`);
        console.log(`   ID Field: ${study.id} (type: ${typeof study.id})`);
        console.log(`   UUID Field: ${study.uuid || 'none'}`);
        console.log(`   _ID Field: ${study._id || 'none'}`);
        console.log(`   Researcher ID: ${study.researcher_id}`);
        console.log(`   Status: ${study.status}`);
        console.log(`   User Match: ${study.researcher_id === userId ? 'YES' : 'NO'}`);
        console.log(`   All Keys: [${Object.keys(study).join(', ')}]`);
      });

      // Try to find a study we can delete (one owned by us)
      const ownedStudy = studiesData.studies.find(study => study.researcher_id === userId);
      
      if (ownedStudy) {
        console.log(`\n🎯 Found owned study for testing:`);
        console.log(`   Title: ${ownedStudy.title}`);
        console.log(`   ID: ${ownedStudy.id}`);
        console.log(`   Status: ${ownedStudy.status}`);
        
        // Try to delete this study to see what happens
        console.log('\n🗑️ Testing delete on owned study...');

        const deleteTestResponse = await fetch('https://researchhub-saas.vercel.app/api/research-consolidated?action=delete-study', {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            id: ownedStudy.id
          })
        });

        const deleteTestData = await deleteTestResponse.json();
        console.log(`Delete Test Result: ${deleteTestResponse.status} - ${deleteTestData.error || deleteTestData.message || 'Success'}`);

        if (!deleteTestResponse.ok) {
          console.log('Full delete response:', JSON.stringify(deleteTestData, null, 2));
        }
      } else {
        console.log('\n⚠️ No owned studies found for delete testing');
      }
    } else {
      console.log('❌ No studies found or error accessing studies');
    }

  } catch (error) {
    console.error('❌ Schema investigation failed:', error.message);
  }
}

investigateDbSchema();