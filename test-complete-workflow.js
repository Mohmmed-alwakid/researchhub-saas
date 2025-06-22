/**
 * Complete Post-Approval Workflow Test
 * Tests the full participant application -> researcher approval -> task completion workflow
 */

const API_BASE = 'http://localhost:3003/api';

// Test accounts
const ACCOUNTS = {
  participant: {
    email: 'abwanwr77+participant@gmail.com',
    password: 'Testtest123'
  },
  researcher: {
    email: 'abwanwr77+Researcher@gmail.com', 
    password: 'Testtest123'
  }
};

async function makeApiCall(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  });
  
  const data = await response.json();
  console.log(`📡 API Call: ${options.method || 'GET'} ${endpoint}`);
  console.log(`📄 Response:`, data);
  return { response, data };
}

async function login(email, password) {
  const { data } = await makeApiCall('/auth?action=login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });
    if (data.success) {
    console.log(`✅ Login successful for ${email} - Role: ${data.user.role}`);
    return data.session.access_token; // Use the Supabase access token
  } else {
    throw new Error(`❌ Login failed: ${data.error}`);
  }
}

async function testCompleteWorkflow() {
  console.log('🚀 STARTING COMPLETE POST-APPROVAL WORKFLOW TEST');
  console.log('=' .repeat(60));
  
  try {
    // Step 1: Login as participant
    console.log('\n📝 STEP 1: Participant Login');
    const participantToken = await login(ACCOUNTS.participant.email, ACCOUNTS.participant.password);
    
    // Step 2: Get available studies
    console.log('\n📋 STEP 2: Get Available Studies');
    const { data: studiesData } = await makeApiCall('/participant-applications?endpoint=studies/public');
    
    if (!studiesData.success || studiesData.data.studies.length === 0) {
      throw new Error('❌ No public studies available');
    }
    
    const study = studiesData.data.studies[0];
    console.log(`✅ Found study: ${study.title} (ID: ${study._id})`);
    
    // Step 3: Get study details
    console.log('\n📖 STEP 3: Get Study Details');
    const { data: studyDetailsData } = await makeApiCall(
      `/participant-applications?endpoint=studies/${study._id}/details`
    );
    
    if (!studyDetailsData.success) {
      throw new Error(`❌ Failed to get study details: ${studyDetailsData.error}`);
    }
    
    console.log(`✅ Study details retrieved: ${studyDetailsData.study.title}`);
    
    // Step 4: Apply to study
    console.log('\n📝 STEP 4: Submit Application');
    const { data: applicationData } = await makeApiCall(
      `/participant-applications?endpoint=studies/${study._id}/apply`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${participantToken}`
        },
        body: JSON.stringify({
          applicationData: {
            screeningResponses: []
          }
        })
      }
    );
    
    if (!applicationData.success) {
      throw new Error(`❌ Application failed: ${applicationData.error}`);
    }
    
    console.log(`✅ Application submitted successfully! ID: ${applicationData.data.application.id}`);
    const applicationId = applicationData.data.application.id;
    
    // Step 5: Login as researcher
    console.log('\n👨‍🔬 STEP 5: Researcher Login');
    const researcherToken = await login(ACCOUNTS.researcher.email, ACCOUNTS.researcher.password);
    
    // Step 6: Get pending applications
    console.log('\n📋 STEP 6: Get Pending Applications');
    const { data: applicationsData } = await makeApiCall(
      `/researcher-applications?studyId=${study._id}`,
      {
        headers: {
          'Authorization': `Bearer ${researcherToken}`
        }
      }
    );
    
    if (!applicationsData.success) {
      throw new Error(`❌ Failed to get applications: ${applicationsData.error}`);
    }
    
    console.log(`✅ Found ${applicationsData.data.applications.length} applications`);
    
    // Step 7: Approve application
    console.log('\n✅ STEP 7: Approve Application');
    const { data: approvalData } = await makeApiCall(
      `/researcher-applications?applicationId=${applicationId}`,
      {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${researcherToken}`
        },
        body: JSON.stringify({
          status: 'approved',
          notes: 'Application approved - participant meets criteria'
        })
      }
    );
    
    if (!approvalData.success) {
      throw new Error(`❌ Approval failed: ${approvalData.error}`);
    }
    
    console.log(`✅ Application approved successfully!`);
    
    // Step 8: Verify approval as participant
    console.log('\n📄 STEP 8: Verify Approval (Participant View)');
    const { data: myApplicationsData } = await makeApiCall(
      '/participant-applications?endpoint=my-applications',
      {
        headers: {
          'Authorization': `Bearer ${participantToken}`
        }
      }
    );
    
    if (!myApplicationsData.success) {
      throw new Error(`❌ Failed to get participant applications: ${myApplicationsData.error}`);
    }
    
    const approvedApp = myApplicationsData.data.applications.find(app => app.id === applicationId);
    if (!approvedApp || approvedApp.status !== 'approved') {
      throw new Error(`❌ Application not found or not approved. Status: ${approvedApp?.status}`);
    }
    
    console.log(`✅ Application status confirmed: ${approvedApp.status}`);
    
    console.log('\n🎉 COMPLETE WORKFLOW TEST SUCCESSFUL!');
    console.log('=' .repeat(60));
    console.log('✅ Participant can discover studies');
    console.log('✅ Participant can view study details');
    console.log('✅ Participant can apply to studies');
    console.log('✅ Researcher can view applications');
    console.log('✅ Researcher can approve applications');
    console.log('✅ Participant can view approved status');
    console.log('\n🚀 READY FOR TASK EXECUTION PHASE!');
    
    return {
      success: true,
      studyId: study._id,
      applicationId,
      participantToken,
      researcherToken
    };
    
  } catch (error) {
    console.error('\n❌ WORKFLOW TEST FAILED:', error.message);
    return { success: false, error: error.message };
  }
}

// Run the test
testCompleteWorkflow().then(result => {
  if (result.success) {
    console.log('\n🎯 Next Steps:');
    console.log('1. Test task execution interface');
    console.log('2. Test screen recording functionality');
    console.log('3. Test session completion');
  }
});
