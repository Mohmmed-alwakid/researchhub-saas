// Using built-in fetch in Node.js 20+

async function testBackendAPI() {
    const baseURL = 'http://localhost:3002';
    
    console.log('🔍 Testing ResearchHub Backend API...\n');
    
    const tests = [
        { name: 'Health Check', url: `${baseURL}/health` },
        { name: 'API Health Check', url: `${baseURL}/api/health` },
        { name: 'Auth Check', url: `${baseURL}/api/auth/check` },
        { name: 'Root Endpoint', url: `${baseURL}/` }
    ];
    
    for (const test of tests) {
        try {
            console.log(`📡 Testing ${test.name}: ${test.url}`);
            const response = await fetch(test.url);
            const status = response.status;
            const contentType = response.headers.get('content-type');
            
            if (contentType && contentType.includes('application/json')) {
                const data = await response.json();
                console.log(`✅ ${test.name}: ${status} - ${JSON.stringify(data)}`);
            } else {
                const text = await response.text();
                console.log(`✅ ${test.name}: ${status} - ${text.substring(0, 100)}...`);
            }
        } catch (error) {
            console.log(`❌ ${test.name}: Failed - ${error.message}`);
        }
        console.log('');
    }
    
    // Test database connection via API
    try {
        console.log('🗄️ Testing database connection via API...');
        const response = await fetch(`${baseURL}/api/health`);
        if (response.ok) {
            const data = await response.json();
            console.log('✅ Database status via API:', JSON.stringify(data, null, 2));
        } else {
            console.log('❌ Database API test failed:', response.status);
        }
    } catch (error) {
        console.log('❌ Database API test error:', error.message);
    }
}

testBackendAPI().then(() => {
    console.log('\n🎯 Backend API testing completed');
    process.exit(0);
}).catch(error => {
    console.error('❌ API testing failed:', error);
    process.exit(1);
});
