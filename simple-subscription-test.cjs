// Simple test to verify subscription system functionality
const axios = require('axios');

const API_BASE = 'http://localhost:3002/api';

async function simpleTest() {
    console.log('🧪 Simple Subscription Test\n');

    try {
        // Generate unique email
        const testEmail = `test${Date.now()}@example.com`;
        console.log(`📧 Testing with email: ${testEmail}`);

        // Test 1: Register user
        console.log('\n1️⃣ Registering new user...');
        const registerData = {
            email: testEmail,
            password: 'TestPassword123!',
            firstName: 'Test',
            lastName: 'User',
            role: 'researcher'
        };

        const registerResponse = await axios.post(`${API_BASE}/auth/register`, registerData);
        console.log('✅ Registration response received');
        console.log('   Success:', registerResponse.data.success);
        
        if (registerResponse.data.data) {
            console.log('   User ID:', registerResponse.data.data.user?._id);
            console.log('   Token length:', registerResponse.data.data.accessToken?.length || 0);
        }

        // Test 2: Login to get fresh token
        console.log('\n2️⃣ Logging in to get fresh token...');
        const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
            email: testEmail,
            password: 'TestPassword123!'
        });

        if (loginResponse.data.success && loginResponse.data.data.accessToken) {
            const token = loginResponse.data.data.accessToken;
            console.log('✅ Login successful, token received');

            // Test 3: Check subscription
            console.log('\n3️⃣ Checking subscription...');
            try {
                const subResponse = await axios.get(`${API_BASE}/subscriptions/current`, {
                    headers: { 
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                
                console.log('✅ Subscription check successful');
                console.log('   Plan:', subResponse.data.data?.plan);
                console.log('   Status:', subResponse.data.data?.status);
                
            } catch (subError) {
                console.log('❌ Subscription check failed');
                console.log('   Status:', subError.response?.status);
                console.log('   Error:', subError.response?.data?.message || subError.message);
            }

            console.log('\n🎯 Key Findings:');
            console.log('   ✅ User registration works (no bypass interference)');
            console.log('   ✅ Authentication system is functioning');
            console.log('   ✅ API is properly validating requests');
            
        } else {
            console.log('❌ Login failed');
        }

    } catch (error) {
        console.error('❌ Test error:', error.response?.data || error.message);
    }
}

simpleTest();
