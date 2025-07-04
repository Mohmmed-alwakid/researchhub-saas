/**
 * Complete Participant Workflow Test
 * Tests the entire participant journey from application to study completion
 * June 22, 2025
 */

const BACKEND_URL = 'http://localhost:3003';

// Test configuration
const TEST_STUDY_ID = '6a9957f2-cbab-4013-a149-f02232b3ee9f';
const PARTICIPANT_EMAIL = 'abwanwr77+participant@gmail.com';
const PARTICIPANT_PASSWORD = 'Testtest123';
const RESEARCHER_EMAIL = 'abwanwr77+Researcher@gmail.com';
const RESEARCHER_PASSWORD = 'Testtest123';

console.log('🧪 COMPLETE PARTICIPANT WORKFLOW TEST');
console.log('=====================================');

let participantToken = null;
let researcherToken = null;
let applicationId = null;

async function makeRequest(endpoint, options = {}) {
    try {
        const url = `${BACKEND_URL}${endpoint}`;
        console.log(`📡 ${options.method || 'GET'} ${url}`);
        
        const response = await fetch(url, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            console.error(`❌ Request failed (${response.status}):`, data);
            return { success: false, error: data.error || `HTTP ${response.status}`, status: response.status };
        }
        
        console.log(`✅ Request successful:`, data.message || 'OK');
        return { success: true, data, status: response.status };
    } catch (error) {
        console.error(`❌ Request error:`, error.message);
        return { success: false, error: error.message };
    }
}

async function loginUser(email, password, role) {
    console.log(`\n🔐 Logging in as ${role}: ${email}`);
    
    const result = await makeRequest('/api/auth?action=login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
    });
    
    if (result.success && result.data.session?.access_token) {
        console.log(`✅ ${role} login successful`);
        return result.data.session.access_token;
    } else {
        console.error(`❌ ${role} login failed:`, result.error);
        return null;
    }
}

async function testStudyDiscovery() {
    console.log('\n📚 Testing Study Discovery...');
    
    const result = await makeRequest('/api/participant-applications?endpoint=studies/public');
      if (result.success && result.data?.data?.studies?.length > 0) {
        console.log(`✅ Found ${result.data.data.studies.length} public studies`);
        const study = result.data.data.studies.find(s => s._id === TEST_STUDY_ID);
        if (study) {
            console.log(`✅ Target study found: ${study.title}`);
            return true;
        } else {
            console.error(`❌ Target study ${TEST_STUDY_ID} not found in results`);
            return false;
        }
    } else {
        console.error('❌ Study discovery failed:', result.error);
        return false;
    }
}

async function testStudyDetails() {
    console.log('\n📖 Testing Study Details...');
    
    const result = await makeRequest(`/api/participant-applications?endpoint=studies/${TEST_STUDY_ID}/details`);
    
    if (result.success && result.data?.study) {
        console.log(`✅ Study details loaded: ${result.data.study.title}`);
        return true;
    } else {
        console.error('❌ Study details failed:', result.error);
        return false;
    }
}

async function testApplicationSubmission() {
    console.log('\n📝 Testing Application Submission...');
    
    const result = await makeRequest(`/api/participant-applications?endpoint=studies/${TEST_STUDY_ID}/apply`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${participantToken}`
        },
        body: JSON.stringify({
            applicationData: {
                screeningResponses: []
            }
        })
    });
    
    if (result.success) {
        console.log('✅ Application submitted successfully');
        applicationId = result.data?.application?.id;
        if (applicationId) {
            console.log(`✅ Application ID: ${applicationId}`);
        }
        return true;
    } else {
        console.error('❌ Application submission failed:', result.error);
        return false;
    }
}

async function testApplicationList() {
    console.log('\n📋 Testing Application List...');
    
    const result = await makeRequest('/api/participant-applications?endpoint=my-applications', {
        headers: {
            'Authorization': `Bearer ${participantToken}`
        }
    });
      if (result.success && result.data?.applications?.length >= 0) {
        console.log(`✅ Found ${result.data.applications?.length || 0} applications`);
        if (result.data.applications?.length > 0) {
            const myApplication = result.data.applications.find(app => app.study_id === TEST_STUDY_ID);
            if (myApplication) {
                console.log(`✅ Application found with status: ${myApplication.status}`);
                applicationId = myApplication.id;
                return true;
            } else {
                console.log('ℹ️ No application found for this study (may be expected if submission failed)');
                return false;
            }
        } else {
            console.log('ℹ️ No applications found (may be expected if submission failed)');
            return false;
        }
    } else {
        console.error('❌ Application list failed:', result.error);
        return false;
    }
}

async function testResearcherApplicationReview() {
    console.log('\n👥 Testing Researcher Application Review...');
    
    // First, get all applications for the study
    const listResult = await makeRequest(`/api/researcher-applications?endpoint=studies/${TEST_STUDY_ID}/applications`, {
        headers: {
            'Authorization': `Bearer ${researcherToken}`
        }
    });
    
    if (!listResult.success) {
        console.error('❌ Failed to list applications for researcher:', listResult.error);
        return false;
    }
    
    console.log(`✅ Researcher can see ${listResult.data?.applications?.length || 0} applications`);
    
    if (!applicationId) {
        console.error('❌ No application ID available for approval');
        return false;
    }
    
    // Approve the application
    const approveResult = await makeRequest(`/api/researcher-applications?endpoint=applications/${applicationId}/status`, {
        method: 'PATCH',
        headers: {
            'Authorization': `Bearer ${researcherToken}`
        },
        body: JSON.stringify({
            status: 'approved',
            notes: 'Approved by automated test'
        })
    });
    
    if (approveResult.success) {
        console.log('✅ Application approved by researcher');
        return true;
    } else {
        console.error('❌ Application approval failed:', approveResult.error);
        return false;
    }
}

async function testApprovedStudyAccess() {
    console.log('\n🎯 Testing Approved Study Access...');
    
    // Check if participant can now access study session
    const result = await makeRequest('/api/participant-applications?endpoint=my-applications', {
        headers: {
            'Authorization': `Bearer ${participantToken}`
        }
    });
    
    if (result.success) {
        const myApplication = result.data.applications?.find(app => app.study_id === TEST_STUDY_ID);
        if (myApplication && myApplication.status === 'approved') {
            console.log('✅ Application status is approved - participant can access study');
            return true;
        } else if (myApplication) {
            console.log(`⚠️ Application status: ${myApplication.status} (expected: approved)`);
            return false;
        } else {
            console.error('❌ Application not found');
            return false;
        }
    } else {
        console.error('❌ Failed to check application status:', result.error);
        return false;
    }
}

async function runCompleteTest() {
    console.log('🚀 Starting Complete Participant Workflow Test...\n');
    
    const results = {
        studyDiscovery: false,
        studyDetails: false,
        participantLogin: false,
        applicationSubmission: false,
        applicationList: false,
        researcherLogin: false,
        applicationReview: false,
        approvedAccess: false
    };
    
    try {
        // Test 1: Study Discovery (public access)
        results.studyDiscovery = await testStudyDiscovery();
        
        // Test 2: Study Details (public access)
        results.studyDetails = await testStudyDetails();
        
        // Test 3: Participant Login
        participantToken = await loginUser(PARTICIPANT_EMAIL, PARTICIPANT_PASSWORD, 'participant');
        results.participantLogin = !!participantToken;
        
        if (results.participantLogin) {
            // Test 4: Application Submission
            results.applicationSubmission = await testApplicationSubmission();
            
            // Test 5: Application List
            results.applicationList = await testApplicationList();
        }
        
        // Test 6: Researcher Login
        researcherToken = await loginUser(RESEARCHER_EMAIL, RESEARCHER_PASSWORD, 'researcher');
        results.researcherLogin = !!researcherToken;
        
        if (results.researcherLogin && applicationId) {
            // Test 7: Application Review & Approval
            results.applicationReview = await testResearcherApplicationReview();
            
            // Test 8: Approved Study Access
            if (results.applicationReview) {
                results.approvedAccess = await testApprovedStudyAccess();
            }
        }
        
    } catch (error) {
        console.error('❌ Test execution error:', error);
    }
    
    // Print final results
    console.log('\n📊 COMPLETE WORKFLOW TEST RESULTS');
    console.log('================================');
    
    Object.entries(results).forEach(([test, passed]) => {
        const status = passed ? '✅ PASS' : '❌ FAIL';
        const testName = test.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
        console.log(`${status} - ${testName}`);
    });
    
    const totalTests = Object.keys(results).length;
    const passedTests = Object.values(results).filter(Boolean).length;
    const passRate = ((passedTests / totalTests) * 100).toFixed(1);
    
    console.log(`\n🎯 Overall Results: ${passedTests}/${totalTests} tests passed (${passRate}%)`);
    
    if (passedTests === totalTests) {
        console.log('🎉 ALL TESTS PASSED! Complete workflow is functional!');
    } else if (passedTests >= totalTests * 0.8) {
        console.log('⚠️ Most tests passed, minor issues remain');
    } else {
        console.log('❌ Significant issues found, workflow needs fixes');
    }
    
    return results;
}

// Run the test
runCompleteTest().catch(console.error);
