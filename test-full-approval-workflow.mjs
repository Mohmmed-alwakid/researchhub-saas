import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wxpwxzdgdvinlbtnbgdf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4cHd4emRnZHZpbmxidG5iZ2RmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAxOTk1ODAsImV4cCI6MjA2NTc3NTU4MH0.YMai9p4VQMbdqmc_9uWGeJ6nONHwuM9XT2FDTFy0aGk';

async function createApplicationsViaAPI() {
  console.log('=== Creating Applications via API ===');
  
  const studyId = '99a0f9b1-bdfe-46b8-961a-97dc3d29fb98';
  
  try {
    // Login as participant first
    const loginResponse = await fetch('http://localhost:3003/api/auth?action=login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'abwanwr77+participant@gmail.com',
        password: 'Testtest123'
      })
    });

    const loginData = await loginResponse.json();
    
    console.log('🔍 Login response:', JSON.stringify(loginData, null, 2));
    
    if (!loginData.success) {
      console.error('❌ Login failed:', loginData.error);
      return;
    }

    const token = loginData.session.access_token;
    console.log('✅ Participant logged in successfully');

    // Submit application via API
    const applicationData = {
      study_id: studyId,  // Changed from studyId to study_id
      participant_answers: {
        screening_responses: [
          { question: 'Why do you want to participate?', answer: 'I am very interested in participating in this research study.' }
        ]
      }
    };

    const submitResponse = await fetch('http://localhost:3003/api/applications?action=submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(applicationData)
    });

    const submitData = await submitResponse.json();
    
    if (submitData.success) {
      console.log('✅ Application submitted successfully:', submitData.application.id);
    } else {
      console.error('❌ Application submission failed:', submitData.error);
      console.error('Full response:', submitData);
    }

    console.log('\n=== Now Testing Researcher Workflow ===');
    
    // Login as researcher 
    const researcherLoginResponse = await fetch('http://localhost:3003/api/auth?action=login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'abwanwr77+researcher@gmail.com',
        password: 'Testtest123'
      })
    });

    const researcherLoginData = await researcherLoginResponse.json();
    
    console.log('🔍 Researcher login response:', JSON.stringify(researcherLoginData, null, 2));
    
    if (!researcherLoginData.success) {
      console.error('❌ Researcher login failed:', researcherLoginData.error);
      return;
    }

    const researcherToken = researcherLoginData.session.access_token;
    console.log('✅ Researcher logged in successfully');

    // Get applications for the study using correct endpoint
    const applicationsResponse = await fetch(`http://localhost:3003/api/applications?endpoint=study/${studyId}/applications`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${researcherToken}`
      }
    });

    const applicationsData = await applicationsResponse.json();
    
    if (applicationsData.success) {
      console.log(`✅ Found ${applicationsData.data.applications.length} applications`);
      applicationsData.data.applications.forEach((app, index) => {
        console.log(`${index + 1}. Application ${app.id} - Status: ${app.status}`);
      });

      // Test approve/reject workflow if applications exist
      if (applicationsData.data.applications.length > 0) {
        const appToApprove = applicationsData.data.applications[0];
        console.log(`\n🎯 Testing approval of application ${appToApprove.id}`);
        
        const approveResponse = await fetch(`http://localhost:3003/api/applications/${appToApprove.id}?type=participant`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${researcherToken}`
          },
          body: JSON.stringify({
            status: 'approved',
            feedback: 'Welcome to the study! You meet all our criteria.'
          })
        });

        const approveData = await approveResponse.json();
        
        if (approveData.success) {
          console.log('✅ Application approved successfully');
        } else {
          console.error('❌ Approval failed:', approveData.error);
        }
      }
    } else {
      console.error('❌ Failed to get applications:', applicationsData.error);
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

createApplicationsViaAPI();
