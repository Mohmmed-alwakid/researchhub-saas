// Test script to create a subscription for our test user
import axios from 'axios';

async function createTestSubscription() {
  try {
    console.log('🧪 Creating Test Subscription...');
    
    // Step 1: Login to get token
    console.log('📝 Logging in...');
    const loginResponse = await axios.post('http://localhost:3002/api/auth/login', {
      email: 'admin@test.com',
      password: 'Admin123!'
    });
    
    if (!loginResponse.data.success) {
      console.log('❌ Login failed:', loginResponse.data);
      return;
    }
    
    const token = loginResponse.data.data?.accessToken || loginResponse.data.accessToken;
    console.log('✅ Login successful');
    
    // Step 2: Get current subscription
    console.log('📝 Getting current subscription...');
    const subResponse = await axios.get('http://localhost:3002/api/subscription/current', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('📊 Current subscription:', JSON.stringify(subResponse.data, null, 2));
    
    // Step 3: Try to update subscription status to active (hack for testing)
    if (subResponse.data.success && subResponse.data.data) {
      const subscription = subResponse.data.data;
      console.log('📝 Current subscription status:', subscription.status);
      
      if (subscription.status !== 'active') {
        console.log('⚠️ Subscription is not active. Status:', subscription.status);
        console.log('💡 For testing purposes, we need to either:');
        console.log('   1. Create a Stripe checkout session and complete payment');
        console.log('   2. Manually update the database');
        console.log('   3. Modify the permission check temporarily');
      } else {
        console.log('✅ Subscription is already active!');
      }
    }
    
  } catch (error) {
    console.log('❌ Error during subscription test:');
    if (error.response?.data) {
      console.log('Response data:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.log('Error message:', error.message);
    }
  }
}

console.log('Starting subscription test...');
createTestSubscription().then(() => {
  console.log('Subscription test completed.');
});
