// Admin login flow test script
console.log('Testing admin login flow...');

async function testAdminLoginFlow() {
    try {
        // Step 1: Test admin login
        console.log('Step 1: Testing admin login...');
        const loginResponse = await fetch('http://localhost:3002/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: 'testadmin@test.com',
                password: 'AdminPassword123!'
            }),
        });

        const loginData = await loginResponse.json();
        
        if (!loginResponse.ok || !loginData.success) {
            console.error('❌ Login failed:', loginData.message);
            return;
        }

        console.log('✅ Login successful');
        console.log('User role:', loginData.data.user.role);
        console.log('User ID:', loginData.data.user._id);

        const token = loginData.data.accessToken;

        // Step 2: Test admin overview API
        console.log('Step 2: Testing admin overview API...');
        const overviewResponse = await fetch('http://localhost:3002/api/admin/overview', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        const overviewData = await overviewResponse.json();
        
        if (!overviewResponse.ok || !overviewData.success) {
            console.error('❌ Admin API failed:', overviewData.message);
            return;
        }

        console.log('✅ Admin API accessible');
        console.log('Overview data:', overviewData.data);

        // Step 3: Test health endpoint
        console.log('Step 3: Testing health endpoint...');
        const healthResponse = await fetch('http://localhost:3002/api/health');
        const healthData = await healthResponse.json();
        
        if (healthResponse.ok) {
            console.log('✅ Health endpoint accessible');
            console.log('Health status:', healthData.message);
        } else {
            console.log('⚠️ Health endpoint issue');
        }

        console.log('\n🎉 All backend tests passed!');
        console.log('\nNext steps:');
        console.log('1. Login to http://localhost:5175/login with testadmin@test.com / AdminPassword123!');
        console.log('2. Should redirect to /app/admin');
        console.log('3. Check browser console for any frontend errors');

    } catch (error) {
        console.error('❌ Test failed with error:', error.message);
    }
}

testAdminLoginFlow();
