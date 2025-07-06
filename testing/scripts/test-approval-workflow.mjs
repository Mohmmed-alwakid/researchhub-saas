#!/usr/bin/env node

import fetch from 'node-fetch';

const baseURL = 'http://localhost:3003';

// Test approval workflow with existing application
async function testApprovalWorkflow() {
  try {
    console.log('=== Testing Application Approval Workflow ===');

    // 1. Login as researcher
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
    console.log('✅ Researcher login successful');

    // 2. Get applications for researcher's studies
    console.log('2. Getting researcher\'s applications...');
    const studyId = '018793df-957b-460f-87de-373dc6afb962'; // Researcher Test Study
    const applicationsResponse = await fetch(`${baseURL}/api/applications?endpoint=study/${studyId}/applications`, {
      headers: {
        'Authorization': `Bearer ${researcherToken}`,
        'Content-Type': 'application/json'
      }
    });

    const applicationsResult = await applicationsResponse.json();
    console.log('📊 Applications response:', JSON.stringify(applicationsResult, null, 2));

    if (!applicationsResult.success) {
      console.log('❌ Failed to get applications');
      return;
    }

    const applications = applicationsResult.data.applications;
    if (applications.length === 0) {
      console.log('❌ No applications found');
      return;
    }

    console.log(`✅ Found ${applications.length} applications`);

    // 3. Test application approval for pending application
    const pendingApplication = applications.find(app => app.status === 'pending');
    if (!pendingApplication) {
      console.log('❌ No pending applications found');
      return;
    }

    console.log(`3. Approving application ${pendingApplication.id}...`);
    const approvalResponse = await fetch(`${baseURL}/api/applications?action=approve`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${researcherToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        application_id: pendingApplication.id,
        notes: 'Application approved after review - automated test'
      })
    });

    const approvalResult = await approvalResponse.json();
    console.log('📊 Approval response:', JSON.stringify(approvalResult, null, 2));
    
    if (approvalResult.success) {
      console.log('✅ Application approved successfully!');
      
      // 4. Verify the status change
      console.log('4. Verifying status change...');
      const verifyResponse = await fetch(`${baseURL}/api/applications?endpoint=study/${studyId}/applications`, {
        headers: {
          'Authorization': `Bearer ${researcherToken}`,
          'Content-Type': 'application/json'
        }
      });

      const verifyResult = await verifyResponse.json();
      const updatedApplication = verifyResult.data.applications.find(app => app.id === pendingApplication.id);
      
      if (updatedApplication && updatedApplication.status === 'approved') {
        console.log('✅ Status change verified! Application is now approved.');
        console.log('🎉 Full approval workflow test completed successfully!');
      } else {
        console.log('❌ Status change not reflected');
        console.log('📊 Updated application:', updatedApplication);
      }
    } else {
      console.log('❌ Application approval failed');
    }

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
}

testApprovalWorkflow();
