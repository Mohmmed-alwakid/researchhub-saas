// Quick fix to create missing researcher profile
const fetch = require('node-fetch');

async function createResearcherProfile() {
  try {
    console.log('🔧 Creating missing researcher profile...');
    
    // Login as researcher to get user details
    const loginResponse = await fetch('http://localhost:3003/api/auth?action=login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'abwanwr77+Researcher@gmail.com',
        password: 'Testtest123'
      })
    });
    
    const loginResult = await loginResponse.json();
    console.log('Login result:', loginResult.success ? 'Success' : loginResult.error);
    
    if (!loginResult.success) {
      throw new Error('Failed to login as researcher');
    }
    
    // We know the user ID from the previous test
    const userId = '4c3d798b-2975-4ec4-b9e2-c6f128b8a066';
    
    console.log('🛠️ Creating profile record directly...');
    
    // We'll need to use the working profile API to create this
    // First let's try updating an existing profile through the API
    const profileUpdate = await fetch('http://localhost:3003/api/profile', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${loginResult.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        first_name: 'Researcher',
        last_name: 'User',
        role: 'researcher',
        email: 'abwanwr77+Researcher@gmail.com'
      })
    });
    
    const updateResult = await profileUpdate.json();
    console.log('Profile update result:', updateResult);
    
    console.log('✅ Done!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

createResearcherProfile();
