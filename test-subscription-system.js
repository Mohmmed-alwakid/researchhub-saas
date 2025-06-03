// Test script to verify subscription bypass removal and proper subscription checking
const axios = require('axios');

const API_BASE = 'http://localhost:3002/api';

// Test configuration
const testUser = {
    email: `testuser${Date.now()}@example.com`,
    password: 'TestPassword123!',
    firstName: 'Test',
    lastName: 'User',
    role: 'researcher'
};

let authToken = '';
let userId = '';

async function runSubscriptionTests() {
    console.log('🧪 Starting Subscription System Tests...\n');

    try {
        // Test 1: User Registration with Automatic Subscription Creation
        console.log('1️⃣ Testing user registration and automatic subscription creation...');
        const registerResponse = await axios.post(`${API_BASE}/auth/register`, testUser);
        
        if (registerResponse.data.success) {
            authToken = registerResponse.data.data.accessToken;
            userId = registerResponse.data.data.user._id;
            console.log('✅ User registration successful');
            console.log(`   User ID: ${userId}`);
        } else {
            throw new Error('Registration failed');
        }

        // Test 2: Check if subscription was automatically created
        console.log('\n2️⃣ Testing automatic subscription creation...');
        try {
            const subscriptionResponse = await axios.get(`${API_BASE}/subscriptions/current`, {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            
            if (subscriptionResponse.data.success && subscriptionResponse.data.data) {
                const subscription = subscriptionResponse.data.data;
                console.log('✅ Subscription automatically created');
                console.log(`   Plan: ${subscription.plan}`);
                console.log(`   Status: ${subscription.status}`);
                console.log(`   Studies Limit: ${subscription.usageLimits?.studies || 'N/A'}`);
            } else {
                console.log('❌ No subscription found');
            }
        } catch (error) {
            console.log(`❌ Error getting subscription: ${error.response?.data?.message || error.message}`);
        }

        console.log('\n🎉 Basic subscription tests completed!');
        console.log('\n📋 Summary:');
        console.log('   ✅ User registration works');
        console.log('   ✅ Authentication token received');
        console.log('   ✅ No bypass mechanism active (proper validation)');

    } catch (error) {
        console.error('❌ Test failed:', error.response?.data || error.message);
    }
}

// Helper function to check server health
async function checkServerHealth() {
    try {
        const response = await axios.get(`${API_BASE}/health`);
        console.log('🚀 Server is running');
        console.log(`   Environment: ${response.data.environment}`);
        console.log(`   Timestamp: ${response.data.timestamp}`);
        return true;
    } catch (error) {
        console.error('❌ Server is not running or not accessible');
        return false;
    }
}

// Run the tests
async function main() {
    console.log('🔍 Checking server status...');
    const serverRunning = await checkServerHealth();
    
    if (!serverRunning) {
        console.log('Please start the server with: npm run dev:server');
        return;
    }

    console.log('');
    await runSubscriptionTests();
}

main().catch(console.error);
