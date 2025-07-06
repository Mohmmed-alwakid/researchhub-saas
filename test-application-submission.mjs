#!/usr/bin/env node

import fetch from 'node-fetch';

const baseURL = 'http://localhost:3003';

// Test login and application submission
async function testApplicationSubmission() {
  try {
    console.log('=== Testing Application Submission ===');

    // 1. Login as participant
    console.log('1. Logging in as participant...');
    const loginResponse = await fetch(`${baseURL}/api/auth?action=login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'abwanwr77+participant@gmail.com',
        password: 'Testtest123'
      })
    });

    const loginResult = await loginResponse.json();
    if (!loginResult.success) {
      console.error('❌ Login failed:', loginResult.error);
      return;
    }
    
    const participantToken = loginResult.session.access_token;
    console.log('✅ Participant login successful');

    // 2. Get available studies for application
    console.log('2. Getting available studies...');
    const studiesResponse = await fetch(`${baseURL}/api/studies?endpoint=public&status=recruiting`, {
      headers: {
        'Authorization': `Bearer ${participantToken}`,
        'Content-Type': 'application/json'
      }
    });

    const studiesResult = await studiesResponse.json();
    if (!studiesResult.success || studiesResult.studies.length === 0) {
      console.log('❌ No recruiting studies found');
      console.log('📊 Studies result:', JSON.stringify(studiesResult, null, 2));
      return;
    }

    const study = studiesResult.studies[0];
    console.log(`✅ Found study: ${study.title} (ID: ${study.id})`);

    // 3. Submit application
    console.log('3. Submitting application...');
    const applicationData = {
      screening_responses: [],
      motivation: 'I am very interested in participating in this study.',
      availability: 'Weekdays and weekends'
    };

    const submitResponse = await fetch(`${baseURL}/api/applications`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${participantToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        studyId: study.id,
        responses: [],
        demographics: applicationData
      })
    });

    const submitResult = await submitResponse.json();
    console.log('📊 Application submission response:', JSON.stringify(submitResult, null, 2));
    
    if (submitResult.success) {
      console.log('✅ Application submitted successfully!');
      const applicationId = submitResult.data.id;
      
      // 4. Now test researcher view
      console.log('4. Testing researcher view...');
      
      // Login as researcher
      const researcherLoginResponse = await fetch(`${baseURL}/api/auth?action=login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'abwanwr77+researcher@gmail.com',
          password: 'Testtest123'
        })
      });

      const researcherLoginResult = await researcherLoginResponse.json();
      if (!researcherLoginResult.success) {
        console.error('❌ Researcher login failed:', researcherLoginResult.error);
        return;
      }
      
      const researcherToken = researcherLoginResult.session.access_token;
      console.log('✅ Researcher login successful');

      // Get applications for the study
      const applicationsResponse = await fetch(`${baseURL}/api/applications?endpoint=study/${study.id}/applications`, {
        headers: {
          'Authorization': `Bearer ${researcherToken}`,
          'Content-Type': 'application/json'
        }
      });

      const applicationsResult = await applicationsResponse.json();
      console.log('📊 Researcher applications view:', JSON.stringify(applicationsResult, null, 2));

      if (applicationsResult.success) {
        console.log('✅ Researcher can view applications!');
        
        // 5. Test application approval
        console.log('5. Testing application approval...');
        const approvalResponse = await fetch(`${baseURL}/api/applications`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${researcherToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            endpoint: 'approve',
            application_id: applicationId,
            notes: 'Application approved after review'
          })
        });

        const approvalResult = await approvalResponse.json();
        console.log('📊 Approval response:', JSON.stringify(approvalResult, null, 2));
        
        if (approvalResult.success) {
          console.log('✅ Application approved successfully!');
          console.log('🎉 Full workflow test completed successfully!');
        } else {
          console.log('❌ Application approval failed');
        }
      } else {
        console.log('❌ Researcher cannot view applications');
      }
    } else {
      console.log('❌ Application submission failed');
    }

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
}

testApplicationSubmission();
