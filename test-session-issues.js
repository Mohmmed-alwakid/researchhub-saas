// Test script to diagnose session management and routing issues
const axios = require('axios');

async function testSessionAndRouting() {
  try {
    console.log('🧪 Testing Session Management and Routing Issues...');
    
    // Step 1: Login as researcher
    console.log('📝 Logging in as researcher...');
    const loginResponse = await axios.post('http://localhost:3002/api/auth/login', {
      email: 'testresearcher@test.com',
      password: 'Researcher123!'
    });
    
    if (!loginResponse.data.success) {
      console.log('❌ Login failed, trying to create user first...');
      
      // Try creating the researcher user
      try {
        await axios.post('http://localhost:3002/api/auth/register', {
          firstName: 'Test',
          lastName: 'Researcher',
          email: 'testresearcher@test.com',
          password: 'Researcher123!',
          role: 'researcher'
        });
        console.log('✅ Researcher user created');
        
        // Try login again
        const secondLoginResponse = await axios.post('http://localhost:3002/api/auth/login', {
          email: 'testresearcher@test.com',
          password: 'Researcher123!'
        });
        
        if (!secondLoginResponse.data.success) {
          console.log('❌ Still failed to login after creating user');
          return;
        }
        
        loginResponse.data = secondLoginResponse.data;
      } catch (createError) {
        console.log('❌ Failed to create researcher user:', createError.response?.data);
        return;
      }
    }
    
    const token = loginResponse.data.data?.accessToken || loginResponse.data.accessToken;
    console.log('✅ Login successful, token received');
    
    // Step 2: Test /api/studies endpoint
    console.log('📊 Testing studies endpoint...');
    try {
      const studiesResponse = await axios.get('http://localhost:3002/api/studies', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✅ Studies endpoint successful');
      console.log('📊 Studies data:', JSON.stringify(studiesResponse.data, null, 2));
    } catch (studiesError) {
      console.log('❌ Studies endpoint failed:', studiesError.response?.data);
    }
    
    // Step 3: Test token refresh
    console.log('🔄 Testing token refresh...');
    try {
      const refreshResponse = await axios.post('http://localhost:3002/api/auth/refresh', {
        refreshToken: loginResponse.data.data?.refreshToken || loginResponse.data.refreshToken
      });
      
      console.log('✅ Token refresh successful');
      console.log('🎫 New token received');
    } catch (refreshError) {
      console.log('❌ Token refresh failed:', refreshError.response?.data);
    }
    
    // Step 4: Test participant endpoints
    console.log('👥 Testing participant login...');
    try {
      const participantLoginResponse = await axios.post('http://localhost:3002/api/auth/login', {
        email: 'testparticipant@test.com',
        password: 'Participant123!'
      });
      
      if (participantLoginResponse.data.success) {
        const participantToken = participantLoginResponse.data.data?.accessToken || participantLoginResponse.data.accessToken;
        console.log('✅ Participant login successful');
        
        // Test participant studies discovery
        const discoveryResponse = await axios.get('http://localhost:3002/api/participants/studies', {
          headers: {
            'Authorization': `Bearer ${participantToken}`,
            'Content-Type': 'application/json'
          }
        });
        
        console.log('✅ Participant studies discovery successful');
        console.log('📋 Public studies:', JSON.stringify(discoveryResponse.data, null, 2));
      } else {
        console.log('❌ Participant login failed');
      }
    } catch (participantError) {
      console.log('❌ Participant endpoints failed:', participantError.response?.data);
    }
    
    console.log('🏁 Session and routing test completed');
    
  } catch (error) {
    console.log('❌ Error during test:', error.message);
    if (error.response?.data) {
      console.log('Response data:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

testSessionAndRouting();
