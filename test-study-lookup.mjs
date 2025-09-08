/**
 * TEST STUDY LOOKUP - Find actual study IDs
 */

const PRODUCTION_URL = 'https://researchhub-saas.vercel.app';

async function findStudyIDs() {
  console.log('🔍 Finding actual study IDs...\n');

  try {
    // Login as researcher to get token
    const loginResponse = await fetch(`${PRODUCTION_URL}/api/auth-consolidated?action=login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'abwanwr77+researcher@gmail.com',
        password: 'Testtest123'
      })
    });

    const loginData = await loginResponse.json();
    if (!loginData.success) {
      throw new Error(`Login failed: ${loginData.error}`);
    }

    const token = loginData.session.access_token;
    console.log('✅ Researcher login successful');

    // Get studies
    const studiesResponse = await fetch(`${PRODUCTION_URL}/api/research-consolidated?action=get-studies`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    const studiesData = await studiesResponse.json();
    console.log('📊 Studies API Response:', JSON.stringify(studiesData, null, 2));

    if (studiesData.success && studiesData.studies) {
      console.log('\n📋 Available Studies:');
      studiesData.studies.forEach((study, index) => {
        console.log(`${index + 1}. ID: ${study.id || study._id} | Title: ${study.title} | Status: ${study.status}`);
      });

      // Also try getting individual study
      if (studiesData.studies.length > 0) {
        const firstStudy = studiesData.studies[0];
        const studyId = firstStudy.id || firstStudy._id;
        
        console.log(`\n🎯 Testing study detail for ID: ${studyId}`);
        
        const studyDetailResponse = await fetch(`${PRODUCTION_URL}/api/research-consolidated?action=get-study&id=${studyId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        const studyDetailData = await studyDetailResponse.json();
        console.log('📋 Study Detail Response:', JSON.stringify(studyDetailData, null, 2));
      }
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

findStudyIDs();
