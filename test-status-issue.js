// Test Study Status Issue - Direct API Test
// 
// NOTE: This issue has been RESOLVED as of June 28, 2025
// Root cause: Frontend caching issue in StudiesPage component
// Solution: Enhanced refresh mechanisms in StudiesPage
// See: STUDY_STATUS_ISSUE_RESOLUTION.md for full details
//
import fetch from 'node-fetch';

const API_BASE = 'http://localhost:3003/api';

// Test credentials
const TEST_RESEARCHER = {
    email: 'abwanwr77+Researcher@gmail.com',
    password: 'Testtest123'
};

async function testStudyStatusIssue() {
    console.log('🔍 Testing Study Status Issue');
    console.log('=====================================');
    
    let token = null;
    let studyId = null;
    
    try {
        // Step 1: Authenticate
        console.log('\n📋 Step 1: Authenticating...');
        const authResponse = await fetch(`${API_BASE}/auth?action=login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(TEST_RESEARCHER)
        });
        
        const authResult = await authResponse.json();
        
        if (!authResult.success || !authResult.session?.access_token) {
            throw new Error(`Authentication failed: ${authResult.error || 'No access token received'}`);
        }
        
        token = authResult.session.access_token;
        console.log('✅ Authentication successful');
        console.log(`   User: ${authResult.user.email} (${authResult.user.role})`);
        
        // Step 2: Create study with explicit 'active' status
        console.log('\n📋 Step 2: Creating study with active status...');
        const studyData = {
            title: `API Test Study - ${new Date().toISOString()}`,
            description: 'Testing if status field is preserved when set to active',
            type: 'usability_test',
            status: 'active', // EXPLICIT active status
            tasks: [
                {
                    id: 'welcome-001',
                    order: 1,
                    type: 'welcome_screen',
                    title: 'Welcome',
                    description: 'Welcome to our study',
                    settings: {}
                },
                {
                    id: 'thankyou-002',
                    order: 2,
                    type: 'thank_you',
                    title: 'Thank You',
                    description: 'Thank you for participating',
                    settings: {}
                }
            ],
            settings: {
                maxParticipants: 15,
                duration: 30,
                compensation: 25,
                recording: {
                    screen: true,
                    audio: false,
                    webcam: false
                }
            }
        };
        
        console.log('   Sending data with status:', studyData.status);
        
        const createResponse = await fetch(`${API_BASE}/studies`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(studyData)
        });
        
        const createResult = await createResponse.json();
        
        if (!createResult.success) {
            throw new Error(`Study creation failed: ${createResult.error || 'Unknown error'}`);
        }
        
        studyId = createResult.study._id || createResult.study.id;
        console.log('✅ Study created successfully');
        console.log(`   Study ID: ${studyId}`);
        console.log(`   Response Status: ${createResult.study.status}`);
        console.log(`   Expected Status: active`);
        console.log(`   Status Match: ${createResult.study.status === 'active' ? '✅ YES' : '❌ NO'}`);
        
        // Step 3: Fetch studies list to verify
        console.log('\n📋 Step 3: Fetching studies list...');
        const fetchResponse = await fetch(`${API_BASE}/studies`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const fetchResult = await fetchResponse.json();
        
        if (!fetchResult.success) {
            throw new Error(`Fetch studies failed: ${fetchResult.error || 'Unknown error'}`);
        }
        
        const targetStudy = fetchResult.studies.find(s => s._id === studyId || s.id === studyId);
        
        if (targetStudy) {
            console.log('✅ Study found in list');
            console.log(`   Study Status in List: ${targetStudy.status}`);
            console.log(`   Expected Status: active`);
            console.log(`   Status Match: ${targetStudy.status === 'active' ? '✅ YES' : '❌ NO'}`);
            
            if (targetStudy.status !== 'active') {
                console.log('');
                console.log('🚨 ISSUE IDENTIFIED:');
                console.log('   - Study was created with status: "active"');
                console.log('   - API responded with status:', createResult.study.status);
                console.log('   - But studies list shows status:', targetStudy.status);
                console.log('');
                console.log('📋 This indicates either:');
                console.log('   1. The backend is not saving the status correctly');
                console.log('   2. The fetch operation is returning stale data');
                console.log('   3. There\'s a database or caching issue');
            }
        } else {
            console.log('❌ Study not found in list');
        }
        
        // Step 4: Summary
        console.log('\n📋 Summary:');
        console.log('=====================================');
        console.log(`Study Created: ${studyId}`);
        console.log(`Create Response Status: ${createResult.study.status}`);
        console.log(`List Response Status: ${targetStudy ? targetStudy.status : 'NOT FOUND'}`);
        console.log(`Issue Exists: ${targetStudy && targetStudy.status !== 'active' ? 'YES' : 'NO'}`);
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        console.error('Stack:', error.stack);
    }
}

// Run the test
testStudyStatusIssue();
