/**
 * RESEARCHER APPROVAL WORKFLOW TEST
 * Test researcher approving participant applications
 */

const API_BASE = 'http://localhost:3001/api';

async function testResearcherApprovalWorkflow() {
  console.log('👩‍🔬 RESEARCHER APPROVAL WORKFLOW TEST');
  console.log('====================================\n');

  try {
    // 1. RESEARCHER LOGIN
    console.log('1️⃣ RESEARCHER LOGIN');
    console.log('------------------');
    
    const researcherAuth = await fetch(`${API_BASE}/auth?action=login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'abwanwr77+Researcher@gmail.com',
        password: 'Testtest123'
      })
    });

    const researcherResult = await researcherAuth.json();
    
    if (!researcherResult.success) {
      console.error('❌ Researcher authentication failed:', researcherResult.error);
      return;
    }
    
    console.log('✅ Researcher authenticated successfully');
    console.log(`👤 User: ${researcherResult.user.email} (Role: ${researcherResult.user.role})\n`);
    const researcherToken = researcherResult.session.accessToken;

    // 2. GET RESEARCHER'S STUDIES FIRST
    console.log('2️⃣ GET RESEARCHER\'S STUDIES');
    console.log('---------------------------');
    
    const studiesResponse = await fetch(`${API_BASE}/studies?researcher=true`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${researcherToken}`
      }
    });

    const studiesResult = await studiesResponse.json();
    console.log(`📊 Studies API Status: ${studiesResponse.status}`);
    
    if (!studiesResult.success || !studiesResult.data || studiesResult.data.length === 0) {
      console.log('⚠️  No studies found for this researcher');
      console.log('📄 Response:', JSON.stringify(studiesResult, null, 2));
      return;
    }

    const researcherStudies = studiesResult.data;
    console.log(`📋 Found ${researcherStudies.length} studies owned by researcher`);
    
    // Display studies
    researcherStudies.forEach((study, index) => {
      console.log(`   ${index + 1}. "${study.title}" (ID: ${study.id})`);
    });

    // 3. GET APPLICATIONS FOR FIRST STUDY
    console.log('\n3️⃣ GET APPLICATIONS FOR STUDY');
    console.log('-----------------------------');
    
    const firstStudy = researcherStudies[0];
    console.log(`🎯 Getting applications for: "${firstStudy.title}"`);
    
    const reviewAppsResponse = await fetch(`${API_BASE}/applications?endpoint=study/${firstStudy.id}/applications`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${researcherToken}`
      }
    });

    const reviewAppsResult = await reviewAppsResponse.json();
    console.log(`📊 Applications API Status: ${reviewAppsResponse.status}`);
    console.log(`📋 Applications for this study: ${reviewAppsResult.data?.length || 0}`);

    if (reviewAppsResult.data && reviewAppsResult.data.length > 0) {
      console.log('\n📝 Applications Details:');
      reviewAppsResult.data.forEach((app, index) => {
        console.log(`   ${index + 1}. ID: ${app.id}`);
        console.log(`      Study: ${app.study_id}`);
        console.log(`      Participant: ${app.participant_id}`);
        console.log(`      Status: ${app.status}`);
        console.log(`      Applied: ${app.applied_at || app.created_at}`);
      });

      // 4. APPROVE FIRST PENDING APPLICATION
      const pendingApp = reviewAppsResult.data.find(app => app.status === 'pending');
      
      if (pendingApp) {
        console.log(`\n4️⃣ APPROVE APPLICATION`);
        console.log('---------------------');
        console.log(`🎯 Approving application: ${pendingApp.id}`);
        
        const approvalData = {
          status: 'accepted',
          feedback: 'Application approved - participant meets study requirements and shows good motivation.'
        };

        const approveResponse = await fetch(`${API_BASE}/applications?endpoint=applications/${pendingApp.id}/review`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${researcherToken}`
          },
          body: JSON.stringify(approvalData)
        });

        console.log(`📊 Approval status: ${approveResponse.status}`);
        const approvalText = await approveResponse.text();
        console.log(`📄 Approval response: ${approvalText.substring(0, 300)}`);
        
        if (approveResponse.status === 200) {
          console.log('✅ Application approved successfully!');
          
          // 5. VERIFY APPROVAL
          console.log('\n5️⃣ VERIFY APPROVAL');
          console.log('------------------');
          
          const verifyResponse = await fetch(`${API_BASE}/applications?endpoint=study/${firstStudy.id}/applications`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${researcherToken}`
            }
          });

          const verifyResult = await verifyResponse.json();
          const approvedApp = verifyResult.data?.find(app => app.id === pendingApp.id);
          
          if (approvedApp && approvedApp.status === 'accepted') {
            console.log('✅ Approval verified successfully');
            console.log(`📋 New status: ${approvedApp.status}`);
            console.log(`💬 Feedback: ${approvedApp.feedback || 'No feedback'}`);
          } else {
            console.log('❌ Approval verification failed');
          }
          
        } else {
          console.log('❌ Application approval failed');
        }
      } else {
        console.log('\n⚠️  No pending applications found to approve');
      }
    } else {
      console.log('⚠️  No applications found for review');
    }

    console.log('\n🎉 RESEARCHER APPROVAL WORKFLOW COMPLETE!');
    console.log('=========================================');

  } catch (error) {
    console.error('❌ Researcher Approval Workflow Error:', error);
  }
}

testResearcherApprovalWorkflow();
