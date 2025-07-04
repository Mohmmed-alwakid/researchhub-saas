// Test script for admin analytics functionality
// This script creates sample data and tests the admin analytics API

import fetch from 'node-fetch';
const API_BASE = 'http://localhost:3003/api';

// Test configuration
const TEST_ADMIN = {
    email: 'abwanwr77+admin@gmail.com',
    password: 'Testtest123'
};

let adminToken = null;

// Helper function to make authenticated requests
async function makeRequest(endpoint, options = {}) {
    const url = `${API_BASE}${endpoint}`;
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };
    
    // Add token if available
    if (adminToken) {
        headers['Authorization'] = `Bearer ${adminToken}`;
    }
    
    const response = await fetch(url, {
        ...options,
        headers
    });
    
    const data = await response.json();
    return { response, data };
}

// Test functions
async function loginAsAdmin() {
    console.log('🔐 Testing admin login...');
    
    const { response, data } = await makeRequest('/auth?action=login', {
        method: 'POST',
        body: JSON.stringify({
            email: TEST_ADMIN.email,
            password: TEST_ADMIN.password
        })
    });
    
    console.log('   Login response:', data);
    
    if (data.success) {
        adminToken = data.session?.access_token || data.token;
        console.log('✅ Admin login successful');
        console.log(`   User: ${data.user.email} (${data.user.role})`);
        console.log('   Token received:', !!(data.session?.access_token || data.token));
        console.log('   Token stored:', !!adminToken);
        return true;
    } else {
        console.log('❌ Admin login failed:', data.error);
        return false;
    }
}

async function testAnalyticsOverview() {
    console.log('📊 Testing analytics overview...');
    console.log('   Token available:', !!adminToken);
    console.log('   Token preview:', adminToken ? adminToken.substring(0, 20) + '...' : 'None');
    
    const { response, data } = await makeRequest('/admin/analytics?action=overview');
    
    if (data.success) {
        console.log('✅ Analytics overview successful');
        console.log('   Data:', JSON.stringify(data.data, null, 2));
    } else {
        console.log('❌ Analytics overview failed:', data.error);
    }
}

async function testStudyEconomics() {
    console.log('📚 Testing study economics...');
    
    const { response, data } = await makeRequest('/admin/analytics?action=study-economics');
    
    if (data.success) {
        console.log('✅ Study economics successful');
        console.log('   Studies found:', data.data.studies?.length || 0);
        if (data.data.studies?.length > 0) {
            console.log('   First study:', JSON.stringify(data.data.studies[0], null, 2));
        }
    } else {
        console.log('❌ Study economics failed:', data.error);
    }
}

async function testParticipantEarnings() {
    console.log('👥 Testing participant earnings...');
    
    const { response, data } = await makeRequest('/admin/analytics?action=participant-earnings');
    
    if (data.success) {
        console.log('✅ Participant earnings successful');
        console.log('   Participants found:', data.data.participants?.length || 0);
    } else {
        console.log('❌ Participant earnings failed:', data.error);
    }
}

async function testPlatformSettings() {
    console.log('⚙️ Testing platform settings...');
    
    const { response, data } = await makeRequest('/admin/analytics?action=platform-settings');
    
    if (data.success) {
        console.log('✅ Platform settings successful');
        console.log('   Settings:', JSON.stringify(data.data, null, 2));
    } else {
        console.log('❌ Platform settings failed:', data.error);
    }
}

async function testSettingsUpdate() {
    console.log('🔧 Testing settings update...');
    
    const { response, data } = await makeRequest('/admin/analytics?action=update-settings', {
        method: 'POST',
        body: JSON.stringify({
            key: 'withdrawal_fee_percent',
            value: 3.0,
            description: 'Test update from automation script'
        })
    });
    
    if (data.success) {
        console.log('✅ Settings update successful');
        console.log('   Updated:', data.data);
    } else {
        console.log('❌ Settings update failed:', data.error);
    }
}

async function testFraudDetection() {
    console.log('🛡️ Testing fraud detection...');
    
    const { response, data } = await makeRequest('/admin/analytics?action=fraud-detection');
    
    if (data.success) {
        console.log('✅ Fraud detection successful');
        console.log('   Alerts:', data.data.alerts?.length || 0);
    } else {
        console.log('❌ Fraud detection failed:', data.error);
    }
}

// Main test execution
async function runAllTests() {
    console.log('🚀 Starting Admin Analytics API Tests\n');
    
    try {
        // Step 1: Login as admin
        const loginSuccess = await loginAsAdmin();
        if (!loginSuccess) {
            console.log('❌ Cannot proceed without admin login');
            return;
        }
        
        console.log(''); // Empty line for readability
        
        // Step 2: Test all analytics endpoints
        await testAnalyticsOverview();
        console.log('');
        
        await testStudyEconomics();
        console.log('');
        
        await testParticipantEarnings();
        console.log('');
        
        await testPlatformSettings();
        console.log('');
        
        await testSettingsUpdate();
        console.log('');
        
        await testFraudDetection();
        console.log('');
        
        console.log('🎉 All tests completed!');
        
    } catch (error) {
        console.error('💥 Test execution failed:', error.message);
        console.error('Stack trace:', error.stack);
    }
}

// Run the tests
runAllTests();
