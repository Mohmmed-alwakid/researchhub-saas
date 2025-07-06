#!/usr/bin/env node

import fetch from 'node-fetch';

const baseURL = 'http://localhost:3003';

// Test the simple approve application endpoint
async function testSimpleApproveEndpoint() {
  try {
    console.log('=== Testing Simple Application Approve Endpoint ===');

    // 1. Login as researcher to get token (for authorization header)
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

    const applicationId = 'bc366ca0-64e1-4f0f-9635-f8444acb1d3a';

    // 2. Test approving the application using the simple endpoint
    console.log('2. Approving application using simple endpoint...');
    const approveResponse = await fetch(`${baseURL}/api/applications?action=approve_application`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${researcherToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        application_id: applicationId,
        notes: 'Approved using simple endpoint',
        researcher_email: 'abwanwr77+researcher@gmail.com',
        researcher_password: 'Testtest123'
      })
    });

    const approveResult = await approveResponse.json();
    console.log('📊 Approve response:', JSON.stringify(approveResult, null, 2));
    
    if (approveResult.success) {
      console.log('✅ Application approved successfully!');
      
      // 3. Test rejecting it back using the simple endpoint
      console.log('3. Now rejecting the application...');
      const rejectResponse = await fetch(`${baseURL}/api/applications?action=reject_application`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${researcherToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          application_id: applicationId,
          notes: 'Rejected using simple endpoint for testing',
          researcher_email: 'abwanwr77+researcher@gmail.com',
          researcher_password: 'Testtest123'
        })
      });

      const rejectResult = await rejectResponse.json();
      console.log('📊 Reject response:', JSON.stringify(rejectResult, null, 2));
      
      if (rejectResult.success) {
        console.log('✅ Application rejected successfully!');
        console.log('🎉 Simple application workflow test completed successfully!');
      } else {
        console.log('❌ Application rejection failed');
      }
    } else {
      console.log('❌ Application approval failed');
    }

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
}

testSimpleApproveEndpoint();
