/**
 * RESEARCH API AUTHENTICATION DEBUG TEST
 * Tests the specific research-consolidated?action=get-studies endpoint 
 * that's failing in our E2E tests
 */

console.log('🧪 Testing Research API Authentication');

async function testResearchApiAuth() {
  try {
    // Step 1: Login to get a valid token
    console.log('\n🔑 Step 1: Getting authentication token...');
    
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

    if (!loginResponse.ok || !loginData.success) {
      throw new Error(`Login failed: ${JSON.stringify(loginData)}`);
    }

    const token = loginData.session?.access_token || loginData.tokens?.authToken;
    if (!token) {
      throw new Error('No token received from login');
    }

    console.log('✅ Login successful, token received');
    console.log(`📄 Token preview: ${token.substring(0, 50)}...`);

    // Step 2: Test the research API endpoint
    console.log('\n🔬 Step 2: Testing research API endpoint...');

    const researchResponse = await fetch('https://researchhub-saas.vercel.app/api/research-consolidated?action=get-studies', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'x-user-role': 'researcher'
      }
    });

    console.log(`📊 Research API response status: ${researchResponse.status}`);

    const researchData = await researchResponse.json();
    
    if (researchResponse.status === 401) {
      console.log('❌ 401 Authentication Error Details:');
      console.log(JSON.stringify(researchData, null, 2));
      
      // Test token validity
      console.log('\n🔍 Step 3: Verifying token with auth endpoint...');
      const statusResponse = await fetch('https://researchhub-saas.vercel.app/api/auth-consolidated?action=status', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const statusData = await statusResponse.json();
      console.log(`📊 Auth status response: ${statusResponse.status}`);
      console.log(JSON.stringify(statusData, null, 2));

      if (statusResponse.ok) {
        console.log('🤔 Token is valid for auth endpoint but fails for research endpoint');
        console.log('🎯 This indicates an issue with research API authentication logic');
      }
    } else if (researchResponse.ok) {
      console.log('✅ Research API call successful!');
      console.log(`📄 Studies returned: ${researchData.studies?.length || 0}`);
    } else {
      console.log('❌ Research API call failed:');
      console.log(JSON.stringify(researchData, null, 2));
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testResearchApiAuth();