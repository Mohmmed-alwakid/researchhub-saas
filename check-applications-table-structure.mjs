/**
 * Check the actual structure of study_applications table
 */

const API_BASE = 'http://localhost:3003/api';

async function checkApplicationsTable() {
  console.log('🔍 CHECKING STUDY_APPLICATIONS TABLE STRUCTURE');
  console.log('==============================================\n');

  try {
    // 1. LOGIN AS RESEARCHER
    console.log('1️⃣ RESEARCHER LOGIN');
    console.log('------------------');
    
    const loginResponse = await fetch(`${API_BASE}/auth?action=login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'abwanwr77+Researcher@gmail.com',
        password: 'Testtest123'
      })
    });

    const loginResult = await loginResponse.json();
    console.log('✅ Researcher authenticated successfully');
    const token = loginResult.session.access_token;

    // 2. GET STUDY APPLICATIONS TO SEE STRUCTURE
    console.log('\n2️⃣ GET STUDY APPLICATIONS TO SEE STRUCTURE');
    console.log('-------------------------------------------');
    
    const appsResponse = await fetch(`${API_BASE}/applications?endpoint=study/62184eb3-45c0-45e6-af6d-4cbad96a5a0a/applications`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    const appsResult = await appsResponse.json();
    
    if (appsResult.success && appsResult.data.length > 0) {
      console.log('✅ Found applications. Sample structure:');
      console.log(JSON.stringify(appsResult.data[0], null, 2));
      
      console.log('\n📋 Available columns in study_applications:');
      Object.keys(appsResult.data[0]).forEach(key => {
        console.log(`  - ${key}`);
      });
    } else {
      console.log('❌ No applications found or error occurred');
      console.log(JSON.stringify(appsResult, null, 2));
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkApplicationsTable();
