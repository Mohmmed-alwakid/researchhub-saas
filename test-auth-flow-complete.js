// Complete Authentication Flow Test
// This script tests the logout-on-refresh fix

const API_BASE = 'http://localhost:3002/api';

async function testCompleteAuthFlow() {
    console.log('🚀 Starting Complete Authentication Flow Test');
    console.log('='.repeat(60));
    
    try {
        // Step 1: Clear any existing auth data
        console.log('1️⃣ Clearing existing auth data...');
        localStorage.removeItem('auth-storage');
        console.log('✅ Auth data cleared');
        
        // Step 2: Test login
        console.log('\n2️⃣ Testing admin login...');
        const loginResponse = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'testadmin@test.com',
                password: 'AdminPassword123!'
            })
        });
        
        const loginData = await loginResponse.json();
        
        if (!loginResponse.ok || !loginData.success) {
            throw new Error(`Login failed: ${loginData.message}`);
        }
        
        const { user, accessToken, refreshToken } = loginData.data;
        console.log(`✅ Login successful for ${user.email} (${user.role})`);
        
        // Step 3: Store auth data (simulating Zustand persist)
        console.log('\n3️⃣ Storing auth data in localStorage...');
        const authData = {
            state: {
                user,
                token: accessToken,
                refreshToken,
                isAuthenticated: true
            },
            version: 0
        };
        localStorage.setItem('auth-storage', JSON.stringify(authData));
        console.log('✅ Auth data stored');
        
        // Step 4: Test profile access (simulating checkAuth)
        console.log('\n4️⃣ Testing profile access with stored token...');
        let profileResponse = await fetch(`${API_BASE}/auth/profile`, {
            headers: { 'Authorization': `Bearer ${accessToken}` }
        });
        
        if (profileResponse.ok) {
            const profileData = await profileResponse.json();
            console.log(`✅ Profile access successful: ${profileData.user.email}`);
        } else {
            console.log(`⚠️ Profile access failed (${profileResponse.status})`);
        }
        
        // Step 5: Simulate token expiration by waiting or using old token
        console.log('\n5️⃣ Simulating token expiration scenario...');
        
        // Create an expired/invalid token for testing
        const expiredToken = accessToken.replace(/.$/, 'X'); // Corrupt the token
        
        console.log('🔄 Testing with corrupted token (simulating expiration)...');
        profileResponse = await fetch(`${API_BASE}/auth/profile`, {
            headers: { 'Authorization': `Bearer ${expiredToken}` }
        });
        
        if (profileResponse.status === 401) {
            console.log('✅ Token correctly identified as invalid (401)');
            
            // Step 6: Test token refresh
            console.log('\n6️⃣ Testing token refresh...');
            const refreshResponse = await fetch(`${API_BASE}/auth/refresh`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refreshToken })
            });
            
            if (refreshResponse.ok) {
                const refreshData = await refreshResponse.json();
                const newToken = refreshData.token;
                console.log(`✅ Token refresh successful: ${newToken.substring(0, 20)}...`);
                
                // Step 7: Update localStorage and test again
                console.log('\n7️⃣ Updating auth data with new token...');
                authData.state.token = newToken;
                localStorage.setItem('auth-storage', JSON.stringify(authData));
                
                // Test profile with new token
                const newProfileResponse = await fetch(`${API_BASE}/auth/profile`, {
                    headers: { 'Authorization': `Bearer ${newToken}` }
                });
                
                if (newProfileResponse.ok) {
                    const newProfileData = await newProfileResponse.json();
                    console.log(`✅ Profile access with new token successful: ${newProfileData.user.email}`);
                } else {
                    console.log(`❌ Profile access with new token failed (${newProfileResponse.status})`);
                }
                
                // Step 8: Test admin API access
                console.log('\n8️⃣ Testing admin API access...');
                const adminResponse = await fetch(`${API_BASE}/admin/users`, {
                    headers: { 'Authorization': `Bearer ${newToken}` }
                });
                
                if (adminResponse.ok) {
                    const adminData = await adminResponse.json();
                    console.log(`✅ Admin API access successful: ${adminData.users.length} users found`);
                } else {
                    console.log(`❌ Admin API access failed (${adminResponse.status})`);
                }
                
            } else {
                console.log(`❌ Token refresh failed (${refreshResponse.status})`);
            }
        } else {
            console.log(`❌ Unexpected response for invalid token: ${profileResponse.status}`);
        }
        
        console.log('\n' + '='.repeat(60));
        console.log('🎉 Authentication flow test completed!');
        
        // Final verification
        console.log('\n🔍 Final verification:');
        const finalAuthData = JSON.parse(localStorage.getItem('auth-storage'));
        console.log(`User: ${finalAuthData.state.user.email}`);
        console.log(`Authenticated: ${finalAuthData.state.isAuthenticated}`);
        console.log(`Token present: ${!!finalAuthData.state.token}`);
        console.log(`Refresh token present: ${!!finalAuthData.state.refreshToken}`);
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        console.error('Stack trace:', error.stack);
    }
}

// Run the test
testCompleteAuthFlow();
