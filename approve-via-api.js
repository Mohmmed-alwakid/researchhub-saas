// Approve application via local API with proper authentication

async function approveApplicationViaAPI() {
  console.log('🔐 Logging in as researcher...');
  
  try {
    // First, login as researcher to get auth token
    const loginResponse = await fetch('http://localhost:3003/api/auth?action=login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'abwanwr77+researcher@gmail.com',
        password: 'Testtest123'
      })
    });

    if (!loginResponse.ok) {
      throw new Error(`Login failed: ${loginResponse.status}`);
    }

    const loginData = await loginResponse.json();
    
    if (!loginData.success) {
      throw new Error(`Login failed: ${loginData.error}`);
    }

    const token = loginData.user.access_token;
    console.log('✅ Researcher logged in successfully');

    // Now approve the application using researcher token
    console.log('📝 Approving application...');
    
    const approvalResponse = await fetch(`http://localhost:3003/api/applications?endpoint=applications/3556e16c-50b0-4279-9831-3920739d632f/review`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        status: 'approved',
        notes: 'Auto-approved for testing participant study workflow'
      })
    });

    if (!approvalResponse.ok) {
      throw new Error(`Approval failed: ${approvalResponse.status}`);
    }

    const approvalData = await approvalResponse.json();
    
    if (!approvalData.success) {
      throw new Error(`Approval failed: ${approvalData.error}`);
    }

    console.log('✅ Application approved successfully!');
    console.log('📋 Result:', approvalData);
    
    return true;
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    return false;
  }
}

approveApplicationViaAPI();
