/**
 * FIELD NAME DEBUGGING TEST
 * Check actual database field names and structure
 */

console.log('🔍 Database Field Structure Test');

async function debugDatabaseFields() {
  try {
    // Login first
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

    // Get studies to see actual field structure
    const studiesResponse = await fetch('https://researchhub-saas.vercel.app/api/research-consolidated?action=get-studies', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'x-user-role': 'researcher'
      }
    });

    const studiesData = await studiesResponse.json();
    
    if (studiesData.success && studiesData.studies?.length > 0) {
      console.log('\n📊 Sample Studies Structure:');
      studiesData.studies.slice(0, 3).forEach((study, i) => {
        console.log(`\nStudy ${i + 1}:`);
        console.log(`  Title: ${study.title}`);
        console.log(`  ID: ${study.id} (${typeof study.id})`);
        console.log(`  UUID: ${study.uuid}`);
        console.log(`  created_by: ${study.created_by}`);
        console.log(`  researcher_id: ${study.researcher_id}`);
        console.log(`  Fields: ${Object.keys(study).join(', ')}`);
      });

      // Pick the first study for deletion test
      const testStudy = studiesData.studies[0];
      console.log(`\n🎯 Testing deletion with first study:`);
      console.log(`   ID: ${testStudy.id}`);
      console.log(`   UUID: ${testStudy.uuid}`);
      console.log(`   Owner field 'created_by': ${testStudy.created_by}`);
      console.log(`   Owner field 'researcher_id': ${testStudy.researcher_id}`);
      console.log(`   Current user: ${userId}`);
      console.log(`   Ownership match (created_by): ${testStudy.created_by === userId ? 'YES' : 'NO'}`);
      console.log(`   Ownership match (researcher_id): ${testStudy.researcher_id === userId ? 'YES' : 'NO'}`);

    } else {
      console.log('❌ No studies found or error getting studies');
      console.log(JSON.stringify(studiesData, null, 2));
    }

  } catch (error) {
    console.error('❌ Debug test failed:', error.message);
  }
}

debugDatabaseFields();