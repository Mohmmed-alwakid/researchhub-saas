#!/usr/bin/env node

import fetch from 'node-fetch';

const baseURL = 'http://localhost:3003';

// Test the review application endpoint
async function testReviewEndpoint() {
  try {
    console.log('=== Testing Application Review Endpoint ===');

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

    // First, let me reset the application status to pending
    console.log('2. Resetting application to pending...');
    // Create a new pending application first
    const newApplicationResponse = await fetch(`${baseURL}/api/applications`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${researcherToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        studyId: '018793df-957b-460f-87de-373dc6afb962',
        responses: [],
        demographics: {
          motivation: 'Testing the review endpoint',
          availability: 'Anytime for testing'
        }
      })
    });

    // Actually, let me just test rejecting the existing accepted application
    const applicationId = 'bc366ca0-64e1-4f0f-9635-f8444acb1d3a';

    // 3. Test approving the application using the review endpoint
    console.log('3. Rejecting application using review endpoint...');
    const reviewResponse = await fetch(`${baseURL}/api/applications?endpoint=applications/${applicationId}/review`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${researcherToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        status: 'rejected',
        notes: 'Testing the review endpoint - rejecting for test purposes'
      })
    });

    const reviewResult = await reviewResponse.json();
    console.log('📊 Review response:', JSON.stringify(reviewResult, null, 2));
    
    if (reviewResult.success) {
      console.log('✅ Application review successful!');
      
      // 4. Test approving it back
      console.log('4. Now approving the application...');
      const approveResponse = await fetch(`${baseURL}/api/applications?endpoint=applications/${applicationId}/review`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${researcherToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: 'approved',
          notes: 'Testing approval through review endpoint'
        })
      });

      const approveResult = await approveResponse.json();
      console.log('📊 Approval response:', JSON.stringify(approveResult, null, 2));
      
      if (approveResult.success) {
        console.log('✅ Application approval successful!');
        console.log('🎉 Review endpoint test completed successfully!');
      } else {
        console.log('❌ Application approval failed');
      }
    } else {
      console.log('❌ Application review failed');
    }

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
}

testReviewEndpoint();
