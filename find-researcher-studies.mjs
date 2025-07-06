#!/usr/bin/env node

import fetch from 'node-fetch';

const baseURL = 'http://localhost:3003';

// Find studies for the researcher
async function findResearcherStudies() {
  try {
    console.log('=== Finding Studies for Researcher ===');

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
    const researcherId = researcherLoginResult.user.id;
    console.log('✅ Researcher login successful -', researcherId);

    // 2. Get studies for this researcher
    console.log('2. Fetching studies for researcher...');
    const studiesResponse = await fetch(`${baseURL}/api/studies?type=researcher`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${researcherToken}`,
        'Content-Type': 'application/json'
      }
    });

    const studiesResult = await studiesResponse.json();
    console.log('📊 Studies response:', JSON.stringify(studiesResult, null, 2));

    if (studiesResult.success && studiesResult.studies && studiesResult.studies.length > 0) {
      const study = studiesResult.studies[0];
      console.log(`✅ Found study: ${study.id} - "${study.title}"`);
      
      // 3. Try to get applications for this study
      console.log('3. Fetching applications for this study...');
      const applicationsResponse = await fetch(`${baseURL}/api/applications?endpoint=study/${study.id}/applications`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${researcherToken}`,
          'Content-Type': 'application/json'
        }
      });

      const applicationsResult = await applicationsResponse.json();
      console.log('📊 Applications for study:', JSON.stringify(applicationsResult, null, 2));
      
      return study.id;
    } else {
      console.log('❌ No studies found for researcher');
      return null;
    }

  } catch (error) {
    console.error('❌ Error finding studies:', error);
  }
}

findResearcherStudies();
