/**
 * TEST DELETE WITH STRING ID CONVERSION
 * The database might expect string IDs but we're sending numbers
 */

console.log('🔍 Testing Delete with String ID Conversion');

async function testStringIdDelete() {
  try {
    // Login
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

    // Get the first owned study
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
    const ownedStudy = studiesData.studies?.find(study => study.researcher_id === userId);

    if (!ownedStudy) {
      console.log('❌ No owned study found for testing');
      return;
    }

    console.log(`\n🎯 Testing with study: ${ownedStudy.title}`);
    console.log(`   Numeric ID: ${ownedStudy.id}`);
    console.log(`   UUID: ${ownedStudy.uuid}`);

    // Test 1: Numeric ID as-is
    console.log('\n🗑️ Test 1: Numeric ID (as-is)');
    let deleteResponse = await fetch('https://researchhub-saas.vercel.app/api/research-consolidated?action=delete-study', {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        id: ownedStudy.id
      })
    });

    let deleteData = await deleteResponse.json();
    console.log(`Result: ${deleteResponse.status} - ${deleteData.error || deleteData.message}`);

    if (deleteResponse.ok) {
      console.log('✅ SUCCESS: Numeric ID worked!');
      return;
    }

    // Test 2: String conversion of numeric ID
    console.log('\n🗑️ Test 2: String converted numeric ID');
    deleteResponse = await fetch('https://researchhub-saas.vercel.app/api/research-consolidated?action=delete-study', {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        id: String(ownedStudy.id)
      })
    });

    deleteData = await deleteResponse.json();
    console.log(`Result: ${deleteResponse.status} - ${deleteData.error || deleteData.message}`);

    if (deleteResponse.ok) {
      console.log('✅ SUCCESS: String converted ID worked!');
      return;
    }

    // Test 3: UUID
    console.log('\n🗑️ Test 3: UUID format');
    deleteResponse = await fetch('https://researchhub-saas.vercel.app/api/research-consolidated?action=delete-study', {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        id: ownedStudy.uuid
      })
    });

    deleteData = await deleteResponse.json();
    console.log(`Result: ${deleteResponse.status} - ${deleteData.error || deleteData.message}`);

    if (deleteResponse.ok) {
      console.log('✅ SUCCESS: UUID worked!');
      return;
    }

    // Test 4: Try via query parameter instead of body
    console.log('\n🗑️ Test 4: Via query parameter');
    deleteResponse = await fetch(`https://researchhub-saas.vercel.app/api/research-consolidated?action=delete-study&id=${ownedStudy.id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    deleteData = await deleteResponse.json();
    console.log(`Result: ${deleteResponse.status} - ${deleteData.error || deleteData.message}`);

    if (deleteResponse.ok) {
      console.log('✅ SUCCESS: Query parameter worked!');
      return;
    }

    console.log('⚠️ All delete methods failed - there may be a deeper API issue');

  } catch (error) {
    console.error('❌ String ID test failed:', error.message);
  }
}

testStringIdDelete();