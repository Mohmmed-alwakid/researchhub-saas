// Test script to verify study creation API endpoint
import axios from 'axios';

async function testStudyCreation() {
  try {
    console.log('🧪 Testing Study Creation API...');
      // First, register a test user
    console.log('📝 Attempting to register test user...');
    try {
      const registerResponse = await axios.post('http://localhost:3002/api/auth/register', {
        firstName: 'Test',
        lastName: 'Admin',
        email: 'admin@test.com',
        password: 'Admin123!',
        role: 'researcher'
      });
      console.log('✅ Registration successful');
    } catch (regError) {
      if (regError.response?.data?.message?.includes('already exists') || 
          regError.response?.data?.error?.message?.includes('already exists')) {
        console.log('✅ User already exists, proceeding to login...');
      } else {
        console.log('❌ Registration failed:', regError.response?.data);
        return;
      }
    }
      // Now login to get an auth token
    console.log('📝 Attempting login...');
    const loginResponse = await axios.post('http://localhost:3002/api/auth/login', {
      email: 'admin@test.com',
      password: 'Admin123!'
    });
    
    console.log('📊 Login response:', JSON.stringify(loginResponse.data, null, 2));
    
    if (!loginResponse.data.success) {
      console.log('❌ Login failed:', loginResponse.data);
      return;
    }
      const token = loginResponse.data.data?.accessToken || loginResponse.data.accessToken;
    console.log('✅ Login successful, token:', token ? 'present' : 'missing');
    
    // Step 2: Get/Create user subscription (this auto-creates free subscription if none exists)
    console.log('📝 Getting user subscription...');
    try {
      const subscriptionResponse = await axios.get('http://localhost:3002/api/subscription/current', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✅ Subscription retrieved/created successfully');
      console.log('📊 Subscription details:', JSON.stringify(subscriptionResponse.data.data, null, 2));
    } catch (subError) {
      console.log('❌ Error getting subscription:', subError.response?.data || subError.message);
      console.log('⚠️ Continuing with study creation test anyway...');
    }
    
    // Step 3: Test study creation with the exact data structure the frontend sends
    const studyData = {
      title: "Test Study for API Fix",
      description: "Testing the study creation API after fixing validation rules",
      type: "usability",
      targetParticipants: 15,
      duration: 45,
      compensation: 25,
      requirements: [],
      tasks: [],
      settings: {
        recordScreen: true,
        recordAudio: false,
        recordWebcam: false,
        trackClicks: true,
        trackHovers: true,
        trackScrolls: true
      }
    };
    
    console.log('📝 Creating study with data:', JSON.stringify(studyData, null, 2));
    
    const createResponse = await axios.post('http://localhost:3002/api/studies', studyData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (createResponse.data.success) {
      console.log('✅ Study created successfully!');
      console.log('📄 Study ID:', createResponse.data.data._id);
      console.log('📊 Study data received:', JSON.stringify(createResponse.data.data, null, 2));
    } else {
      console.log('❌ Study creation failed:', createResponse.data);
    }
    
  } catch (error) {
    console.log('❌ Error during test:');
    if (error.response?.data) {
      console.log('Response data:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.log('Error message:', error.message);
    }
    if (error.response?.data?.errors) {
      console.log('🔍 Validation errors:', error.response.data.errors);
    }
  }
}

console.log('Starting test...');
testStudyCreation().then(() => {
  console.log('Test completed.');
});
