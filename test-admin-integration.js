const fetch = require('node-fetch');

async function testAdminAPI() {
    const API_BASE = 'http://localhost:3002/api';
    
    console.log('🧪 Testing Admin API Integration...\n');
    
    // Step 1: Test Health Check
    console.log('1️⃣ Testing health check...');
    try {
        const healthResponse = await fetch(`${API_BASE}/health`);
        const healthData = await healthResponse.json();
        console.log('✅ Health check:', healthData.message);
    } catch (error) {
        console.log('❌ Health check failed:', error.message);
        return;
    }
    
    // Step 2: Try different admin login credentials
    const adminCredentials = [
        { email: 'testadmin@test.com', password: 'AdminPassword123!' },
        { email: 'admin@researchhub.com', password: 'Admin123!' },
        { email: 'admin@research-hub.com', password: 'AdminPassword123!' }
    ];
    
    let authToken = null;
    let adminUser = null;
    
    for (const creds of adminCredentials) {
        console.log(`\n2️⃣ Testing login with: ${creds.email}`);
        try {
            const loginResponse = await fetch(`${API_BASE}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(creds)
            });
            
            const loginData = await loginResponse.json();
            
            if (loginResponse.ok && loginData.success) {
                authToken = loginData.data.accessToken;
                adminUser = loginData.data.user;
                console.log(`✅ Login successful! Role: ${adminUser.role}`);
                break;
            } else {
                console.log(`❌ Login failed: ${loginData.message || 'Unknown error'}`);
            }
        } catch (error) {
            console.log(`❌ Login error: ${error.message}`);
        }
    }
    
    if (!authToken) {
        console.log('\n❌ Could not authenticate with any admin credentials');
        return;
    }
    
    // Step 3: Test Admin Users API
    console.log('\n3️⃣ Testing admin users API...');
    try {
        const usersResponse = await fetch(`${API_BASE}/admin/users?page=1&limit=10`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            }
        });
        
        const usersData = await usersResponse.json();
        
        if (usersResponse.ok && usersData.success) {
            const users = usersData.data.users;
            console.log(`✅ Successfully fetched ${users.length} users!`);
            
            console.log('\n📊 User Summary:');
            users.forEach((user, index) => {
                console.log(`${index + 1}. ${user.firstName} ${user.lastName} (${user.email})`);
                console.log(`   Role: ${user.role} | Active: ${user.isActive} | ID: ${user._id}`);
            });
            
            // Test if UserManagement component would work
            console.log('\n🔧 Testing UserManagement component compatibility...');
            const mappedUsers = users.map(user => ({
                _id: user._id,
                name: user.name || `${user.firstName} ${user.lastName}`,
                email: user.email,
                role: user.role,
                isActive: user.isActive,
                createdAt: user.createdAt,
                lastLoginAt: user.lastLoginAt
            }));
            
            console.log('✅ UserManagement component data mapping successful!');
            console.log(`📦 Mapped ${mappedUsers.length} users for component display`);
            
        } else {
            console.log(`❌ Failed to fetch users: ${usersData.message || 'Unknown error'}`);
        }
    } catch (error) {
        console.log(`❌ Users API error: ${error.message}`);
    }
    
    console.log('\n🎯 Test completed!');
}

testAdminAPI().catch(console.error);
