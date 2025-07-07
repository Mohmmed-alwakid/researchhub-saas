/**
 * COMPLETE RESEARCHER-PARTICIPANT WORKFLOW TEST
 * Full workflow from application creation to study completion
 */

const API_BASE = 'http://localhost:3003/api';

async function testCompleteWorkflow() {
  console.log('🎯 COMPLETE RESEARCHER-PARTICIPANT WORKFLOW TEST');
  console.log('===============================================\n');

  try {
    // PART 1: PARTICIPANT CREATES APPLICATION
    console.log('🟦 PART 1: PARTICIPANT APPLICATION WORKFLOW');
    console.log('==========================================\n');

    // 1. PARTICIPANT LOGIN
    console.log('1️⃣ PARTICIPANT LOGIN');
    console.log('-------------------');
    
    const participantAuth = await fetch(`${API_BASE}/auth?action=login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'abwanwr77+participant@gmail.com',
        password: 'Testtest123'
      })
    });

    const participantResult = await participantAuth.json();
    
    if (!participantResult.success) {
      console.error('❌ Participant authentication failed:', participantResult.error);
      return;
    }
    
    console.log('✅ Participant authenticated successfully');
    const participantToken = participantResult.session.access_token;

    // 2. GET AVAILABLE STUDIES
    console.log('\n2️⃣ GET AVAILABLE STUDIES');
    console.log('------------------------');
    
    const studiesResponse = await fetch(`${API_BASE}/applications?endpoint=studies/public`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${participantToken}`
      }
    });

    const studiesResult = await studiesResponse.json();
    const studies = studiesResult.data?.studies || [];
    
    if (studies.length === 0) {
      console.log('❌ No studies available');
      return;
    }

    const targetStudy = studies[0];
    console.log(`✅ Found ${studies.length} studies`);
    console.log(`🎯 Target study: "${targetStudy.title}" (${targetStudy.id})`);

    // 3. SUBMIT APPLICATION
    console.log('\n3️⃣ SUBMIT APPLICATION');
    console.log('---------------------');
    
    const applicationData = {
      studyId: targetStudy.id,
      responses: {
        motivation: 'Very interested in participating in this research study.',
        availability: 'Available weekdays and weekends.',
        experience: 'Experienced with user testing studies.'
      },
      demographics: {
        age_range: '25-34',
        location: 'Remote',
        device_preference: 'Desktop'
      }
    };

    const submitResponse = await fetch(`${API_BASE}/applications?type=participant`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${participantToken}`
      },
      body: JSON.stringify(applicationData)
    });

    let applicationResult;
    if (submitResponse.status === 201) {
      applicationResult = await submitResponse.json();
      console.log('✅ Application submitted successfully');
      console.log(`📋 Application ID: ${applicationResult.data.id}`);
    } else if (submitResponse.status === 409) {
      console.log('ℹ️  Application already exists (expected)');
      // Get existing application
      const existingAppsResponse = await fetch(`${API_BASE}/applications?type=participant`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${participantToken}`
        }
      });
      const existingAppsResult = await existingAppsResponse.json();
      applicationResult = { data: existingAppsResult.data[0] };
    } else {
      console.error(`❌ Application submission failed with status ${submitResponse.status}`);
      const errorText = await submitResponse.text();
      console.error(`Error response: ${errorText}`);
      return;
    }

    const applicationId = applicationResult.data.id;

    // PART 2: RESEARCHER APPROVAL WORKFLOW
    console.log('\n🟨 PART 2: RESEARCHER APPROVAL WORKFLOW');
    console.log('=====================================\n');

    // 4. RESEARCHER LOGIN
    console.log('4️⃣ RESEARCHER LOGIN');
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
    const researcherToken = researcherResult.session.access_token;

    // 5. GET APPLICATIONS FOR REVIEW
    console.log('\n5️⃣ GET APPLICATIONS FOR REVIEW');
    console.log('------------------------------');
    
    const reviewAppsResponse = await fetch(`${API_BASE}/applications?endpoint=study/${targetStudy.id}/applications`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${researcherToken}`
      }
    });

    const reviewAppsResult = await reviewAppsResponse.json();
    console.log(`📋 Applications to review: ${reviewAppsResult.data?.length || 0}`);
    
    if (reviewAppsResult.data && reviewAppsResult.data.length > 0) {
      console.log(`🎯 Found application to approve: ${reviewAppsResult.data[0].id}`);
      // Use the actual application ID from the results
      const foundApplicationId = reviewAppsResult.data[0].id;
      
      // 6. APPROVE APPLICATION
      console.log('\n6️⃣ APPROVE APPLICATION');
      console.log('---------------------');
      
      const approvalData = {
        status: 'accepted',
        feedback: 'Application approved - good fit for study requirements'
      };

      const approveResponse = await fetch(`${API_BASE}/applications?endpoint=applications/${foundApplicationId}/review`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${researcherToken}`
        },
        body: JSON.stringify(approvalData)
      });

      console.log(`📊 Approval status: ${approveResponse.status}`);
      
      if (approveResponse.status === 200) {
        const approvalResult = await approveResponse.json();
        console.log('✅ Application approved successfully');
      } else {
        const errorText = await approveResponse.text();
        console.log(`❌ Approval failed: ${errorText}`);
        // Continue anyway for testing session creation error handling
      }
    } else {
      console.log('❌ No applications found for this study');
    }

    // PART 3: PARTICIPANT STUDY SESSION WORKFLOW  
    console.log('\n🟩 PART 3: PARTICIPANT STUDY SESSION WORKFLOW');
    console.log('============================================\n');

    // 7. CREATE STUDY SESSION
    console.log('7️⃣ CREATE STUDY SESSION');
    console.log('-----------------------');
    
    const sessionResponse = await fetch(`${API_BASE}/study-sessions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${participantToken}`
      },
      body: JSON.stringify({
        studyId: targetStudy.id
      })
    });

    console.log(`📊 Session creation status: ${sessionResponse.status}`);
    const sessionText = await sessionResponse.text();
    
    let sessionResult;
    try {
      sessionResult = JSON.parse(sessionText);
    } catch (e) {
      console.log(`❌ Failed to parse session response: ${sessionText.substring(0, 200)}`);
      return;
    }

    if (sessionResult.success) {
      console.log('✅ Study session created successfully');
      console.log(`🆔 Session ID: ${sessionResult.session.id}`);
      
      const sessionId = sessionResult.session.id;

      // 8. GET SESSION DETAILS
      console.log('\n8️⃣ GET SESSION DETAILS');
      console.log('----------------------');
      
      const detailsResponse = await fetch(`${API_BASE}/study-sessions/${sessionId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${participantToken}`
        }
      });

      if (detailsResponse.status === 200) {
        const detailsResult = await detailsResponse.json();
        console.log('✅ Session details retrieved');
        console.log(`📋 Study: ${detailsResult.session.study?.title || 'Unknown'}`);
      } else {
        console.log('❌ Failed to get session details');
      }

      // 9. UPDATE SESSION PROGRESS
      console.log('\n9️⃣ UPDATE SESSION PROGRESS');
      console.log('--------------------------');
      
      const progressResponse = await fetch(`${API_BASE}/study-sessions/${sessionId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${participantToken}`
        },
        body: JSON.stringify({
          sessionData: {
            currentBlock: 2,
            totalBlocks: 5,
            blockResponses: {
              'block_1': { type: 'welcome', completed: true }
            }
          },
          progress: 40
        })
      });

      if (progressResponse.status === 200) {
        console.log('✅ Session progress updated');
      } else {
        console.log('❌ Failed to update progress');
      }

      // 10. COMPLETE SESSION
      console.log('\n🔟 COMPLETE SESSION');
      console.log('------------------');
      
      const completeResponse = await fetch(`${API_BASE}/study-sessions/${sessionId}?action=complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${participantToken}`
        },
        body: JSON.stringify({
          finalData: {
            blockResponses: {
              'block_1': { type: 'welcome', completed: true },
              'block_2': { type: 'question', response: 'Great study' },
              'block_3': { type: 'thank_you', completed: true }
            },
            completion_rate: 100
          }
        })
      });

      if (completeResponse.status === 200) {
        console.log('✅ Study session completed successfully');
      } else {
        console.log('❌ Failed to complete session');
      }

    } else {
      console.log(`❌ Session creation failed: ${sessionResult.error}`);
      console.log('ℹ️  This might be expected if application needs approval');
    }

    console.log('\n🎉 COMPLETE WORKFLOW TEST FINISHED!');
    console.log('==================================');

  } catch (error) {
    console.error('❌ Complete Workflow Error:', error);
  }
}

testCompleteWorkflow();
