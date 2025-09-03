/**
 * COMPREHENSIVE STUDY PERSISTENCE FIX VERIFICATION
 * Tests the enhanced JWT authentication and user association fixes
 */

console.log('🧪 Starting comprehensive study persistence fix verification...');

const API_BASE = 'http://localhost:3003/api';
const TEST_USER = {
    email: 'abwanwr77+Researcher@gmail.com',
    password: 'Testtest123'
};

let authToken = null;
let userId = null;
let createdStudyId = null;

async function testAuthentication() {
    console.log('\n🔑 Testing Authentication...');
    
    try {
        const response = await fetch(`${API_BASE}/auth?action=login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(TEST_USER)
        });
        
        const result = await response.json();
        console.log('📝 Auth response:', JSON.stringify(result, null, 2));
        
        if (result.success && result.session) {
            authToken = result.session.access_token;
            userId = result.user?.id || result.session?.user?.id;
            
            console.log('✅ Authentication successful');
            console.log(`👤 User ID: ${userId}`);
            console.log(`🔑 Token: ${authToken.substring(0, 30)}...`);
            
            return true;
        } else {
            console.error('❌ Authentication failed:', result.error);
            return false;
        }
    } catch (error) {
        console.error('❌ Authentication error:', error.message);
        return false;
    }
}

async function testStudyCreation() {
    console.log('\n📝 Testing Study Creation...');
    
    if (!authToken) {
        console.error('❌ No auth token available');
        return false;
    }
    
    const studyData = {
        title: `Fix Verification Study ${new Date().getTime()}`,
        description: 'Test study to verify persistence fix implementation',
        type: 'usability',
        status: 'active',
        target_participants: 3,
        blocks: [
            {
                id: 'welcome',
                type: 'welcome',
                title: 'Welcome',
                description: 'Welcome to our verification study'
            },
            {
                id: 'question',
                type: 'open_question',
                title: 'Test Question',
                description: 'Please provide your feedback'
            },
            {
                id: 'thankyou',
                type: 'thank_you',
                title: 'Thank You',
                description: 'Thank you for your participation'
            }
        ]
    };
    
    try {
        console.log('📤 Sending create study request...');
        console.log('🔑 Using token:', authToken.substring(0, 30) + '...');
        
        const response = await fetch(`${API_BASE}/research?action=create-study`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify(studyData)
        });
        
        const result = await response.json();
        console.log('📝 Create response:', JSON.stringify(result, null, 2));
        
        if (result.success && result.study) {
            createdStudyId = result.study.id;
            console.log('✅ Study created successfully');
            console.log(`📋 Study ID: ${createdStudyId}`);
            console.log(`📋 Study title: ${result.study.title}`);
            console.log(`👤 Creator ID: ${result.study.creator_id}`);
            console.log(`👤 Created by: ${result.study.created_by}`);
            console.log(`📧 User email: ${result.study.user_email}`);
            
            return true;
        } else {
            console.error('❌ Study creation failed:', result.error);
            return false;
        }
    } catch (error) {
        console.error('❌ Study creation error:', error.message);
        return false;
    }
}

async function testStudyRetrieval() {
    console.log('\n📚 Testing Study Retrieval...');
    
    if (!authToken) {
        console.error('❌ No auth token available');
        return false;
    }
    
    try {
        console.log('📤 Sending get studies request...');
        console.log('🔑 Using token:', authToken.substring(0, 30) + '...');
        console.log('👤 Looking for studies by user:', userId);
        
        const response = await fetch(`${API_BASE}/research?action=get-studies`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        const result = await response.json();
        console.log('📝 Retrieve response:', JSON.stringify(result, null, 2));
        
        if (result.success) {
            const studies = result.studies || [];
            console.log(`✅ Retrieved ${studies.length} studies`);
            
            // Log each study for debugging
            studies.forEach((study, index) => {
                console.log(`📋 Study ${index + 1}:`);
                console.log(`   - Title: ${study.title}`);
                console.log(`   - ID: ${study.id}`);
                console.log(`   - Creator ID: ${study.creator_id || study.created_by}`);
                console.log(`   - Status: ${study.status}`);
                console.log(`   - Created: ${study.created_at}`);
            });
            
            return studies;
        } else {
            console.error('❌ Study retrieval failed:', result.error);
            return false;
        }
    } catch (error) {
        console.error('❌ Study retrieval error:', error.message);
        return false;
    }
}

async function testPersistenceVerification(retrievedStudies) {
    console.log('\n🔍 Testing Persistence Verification...');
    
    if (!createdStudyId) {
        console.error('❌ No created study ID to verify');
        return false;
    }
    
    if (!retrievedStudies || !Array.isArray(retrievedStudies)) {
        console.error('❌ No retrieved studies to check');
        return false;
    }
    
    console.log(`🔍 Looking for created study ${createdStudyId} in ${retrievedStudies.length} retrieved studies`);
    
    const foundStudy = retrievedStudies.find(study => study.id === createdStudyId);
    
    if (foundStudy) {
        console.log('🎉 SUCCESS: Created study found in retrieved studies!');
        console.log('✅ PERSISTENCE FIX VERIFIED: Studies are now properly associated with users');
        console.log(`📋 Found study: "${foundStudy.title}" with ID: ${foundStudy.id}`);
        console.log(`👤 Creator verification: ${foundStudy.creator_id} === ${userId} ? ${foundStudy.creator_id === userId}`);
        return true;
    } else {
        console.log('❌ PERSISTENCE ISSUE: Created study not found in retrieved studies');
        console.log('🔍 Debugging information:');
        console.log(`   - Created study ID: ${createdStudyId}`);
        console.log(`   - Retrieved study IDs: ${retrievedStudies.map(s => s.id).join(', ')}`);
        console.log(`   - User ID: ${userId}`);
        return false;
    }
}

async function runComprehensiveTest() {
    console.log('🚀 COMPREHENSIVE STUDY PERSISTENCE FIX VERIFICATION');
    console.log('=' .repeat(60));
    
    const results = {};
    
    // Step 1: Authentication
    results.auth = await testAuthentication();
    
    // Step 2: Study Creation (only if auth succeeded)
    if (results.auth) {
        results.create = await testStudyCreation();
        
        // Step 3: Study Retrieval (only if creation succeeded)
        if (results.create) {
            const retrievedStudies = await testStudyRetrieval();
            results.retrieve = !!retrievedStudies;
            
            // Step 4: Persistence Verification (only if retrieval succeeded)
            if (results.retrieve) {
                results.persistence = await testPersistenceVerification(retrievedStudies);
            }
        }
    }
    
    // Final Results
    console.log('\n🏁 FINAL TEST RESULTS');
    console.log('=' .repeat(60));
    
    const tests = [
        { name: 'Authentication', key: 'auth', critical: true },
        { name: 'Study Creation', key: 'create', critical: true },
        { name: 'Study Retrieval', key: 'retrieve', critical: true },
        { name: 'Persistence Verification', key: 'persistence', critical: true }
    ];
    
    let passedTests = 0;
    let totalTests = tests.length;
    
    tests.forEach(test => {
        const passed = results[test.key];
        const status = passed ? '✅ PASS' : '❌ FAIL';
        const critical = test.critical ? ' (CRITICAL)' : '';
        console.log(`${status} ${test.name}${critical}`);
        if (passed) passedTests++;
    });
    
    console.log('\n📊 SUMMARY:');
    console.log(`Tests passed: ${passedTests}/${totalTests}`);
    console.log(`Success rate: ${Math.round((passedTests / totalTests) * 100)}%`);
    
    if (results.persistence) {
        console.log('\n🎉 CONGRATULATIONS!');
        console.log('✅ Study persistence fix has been SUCCESSFULLY VERIFIED!');
        console.log('✅ Studies are now properly created and retrieved for authenticated users');
        console.log('✅ The production issue should be resolved');
    } else {
        console.log('\n⚠️ ATTENTION REQUIRED:');
        console.log('❌ Study persistence issue still exists');
        console.log('🔧 Additional debugging and fixes may be needed');
    }
    
    return results;
}

// Export for use in browser or Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { runComprehensiveTest };
} else {
    // Run immediately if in browser
    runComprehensiveTest().catch(console.error);
}
