// Test script to verify admin API functionality
const API_BASE = 'http://localhost:3002/api';

async function testAdminAPI() {
    console.log('🚀 Testing Admin API...');
    
    try {
        // Step 1: Login as admin
        console.log('🔐 Logging in as admin...');
        const loginResponse = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: 'admin@researchhub.com',
                password: 'Admin123!'
            })
        });
        
        const loginData = await loginResponse.json();
        console.log('Login response:', loginData);
        
        if (!loginData.success) {
            console.error('❌ Admin login failed');
            return;
        }
        
        const token = loginData.data.accessToken;
        console.log('✅ Admin login successful');
        
        // Step 2: Fetch users
        console.log('👥 Fetching users...');
        const usersResponse = await fetch(`${API_BASE}/admin/users`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            }
        });
        
        const usersData = await usersResponse.json();
        console.log('Users response:', usersData);
        
        if (usersData.success) {
            console.log(`✅ Found ${usersData.data.length} users in database:`);
            usersData.data.forEach((user, index) => {
                console.log(`${index + 1}. ${user.name} (${user.email}) - ${user.role} - Active: ${user.isActive}`);
            });
        } else {
            console.error('❌ Failed to fetch users');
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

// Run the test
testAdminAPI();
