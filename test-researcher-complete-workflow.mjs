#!/usr/bin/env node

import fetch from 'node-fetch';

const baseURL = 'http://localhost:3003';

// Test the complete researcher application management workflow
async function testCompleteResearcherWorkflow() {
  try {
    console.log('=== Testing Complete Researcher Application Management Workflow ===');

    // 1. Login as researcher to get token
    console.log('1. Logging in as researcher...');
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
    const researcherId = researcherLoginResult.user.id;
    console.log('✅ Researcher login successful -', researcherId);

    // 2. Get researcher's applications (using the endpoint that the UI uses)
    console.log('2. Fetching researcher applications...');
    const applicationsResponse = await fetch(`${baseURL}/api/applications?endpoint=study/018793df-957b-460f-87de-373dc6afb962/applications`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${researcherToken}`,
        'Content-Type': 'application/json'
      }
    });

    const applicationsResult = await applicationsResponse.json();
    console.log('📊 Applications response:', JSON.stringify(applicationsResult, null, 2));

    if (!applicationsResult.success) {
      console.error('❌ Failed to fetch applications');
      return;
    }

    const applications = applicationsResult.data?.applications || [];
    console.log(`✅ Found ${applications.length} applications`);

    if (applications.length === 0) {
      console.log('ℹ️ No applications found. Creating a test application...');
      
      // Create a test application first
      const createAppResponse = await fetch(`${baseURL}/api/applications?endpoint=studies/018793df-957b-460f-87de-373dc6afb962/apply`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${researcherToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          studyId: '018793df-957b-460f-87de-373dc6afb962',
          responses: { test: 'response' },
          demographics: { age: 25, gender: 'other' }
        })
      });

      const createAppResult = await createAppResponse.json();
      console.log('📝 Test application creation:', createAppResult);
      
      if (!createAppResult.success) {
        console.error('❌ Failed to create test application');
        return;
      }

      // Fetch applications again
      const newAppsResponse = await fetch(`${baseURL}/api/applications?endpoint=study/018793df-957b-460f-87de-373dc6afb962/applications`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${researcherToken}`,
          'Content-Type': 'application/json'
        }
      });

      const newAppsResult = await newAppsResponse.json();
      applications.push(...(newAppsResult.data?.applications || []));
    }

    // 3. Test approving an application
    if (applications.length > 0) {
      const applicationToTest = applications[0];
      console.log(`3. Testing approval for application: ${applicationToTest.id}`);

      const approveResponse = await fetch(`${baseURL}/api/applications?action=approve_application`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${researcherToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          application_id: applicationToTest.id,
          notes: 'Approved in complete workflow test'
        })
      });

      const approveResult = await approveResponse.json();
      console.log('📊 Approve result:', approveResult);

      if (approveResult.success) {
        console.log('✅ Application approved successfully');

        // 4. Test rejecting the same application
        console.log('4. Testing rejection for the same application...');
        const rejectResponse = await fetch(`${baseURL}/api/applications?action=reject_application`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${researcherToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            application_id: applicationToTest.id,
            notes: 'Rejected for testing purposes'
          })
        });

        const rejectResult = await rejectResponse.json();
        console.log('📊 Reject result:', rejectResult);

        if (rejectResult.success) {
          console.log('✅ Application rejected successfully');
        } else {
          console.error('❌ Application rejection failed:', rejectResult.error);
        }
      } else {
        console.error('❌ Application approval failed:', approveResult.error);
      }
    }

    // 5. Test fetching applications again to see updated status
    console.log('5. Fetching applications again to verify updates...');
    const finalAppsResponse = await fetch(`${baseURL}/api/applications?endpoint=study/018793df-957b-460f-87de-373dc6afb962/applications`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${researcherToken}`,
        'Content-Type': 'application/json'
      }
    });

    const finalAppsResult = await finalAppsResponse.json();
    console.log('📊 Final applications:', JSON.stringify(finalAppsResult.data?.applications, null, 2));

    console.log('🎉 Complete researcher workflow test finished!');

  } catch (error) {
    console.error('❌ Workflow test error:', error);
  }
}

testCompleteResearcherWorkflow();
