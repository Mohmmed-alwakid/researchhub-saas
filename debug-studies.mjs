#!/usr/bin/env node

import fetch from 'node-fetch';

const baseURL = 'http://localhost:3003';

// Debug studies endpoint
async function debugStudies() {
  try {
    console.log('=== Testing Studies Endpoint ===');

    // Login first
    const loginResponse = await fetch(`${baseURL}/api/auth?action=login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'abwanwr77+participant@gmail.com',
        password: 'Testtest123'
      })
    });

    const loginResult = await loginResponse.json();
    const token = loginResult.session.access_token;
    console.log('✅ Login successful');

    // Test studies endpoint
    const studiesResponse = await fetch(`${baseURL}/api/studies?endpoint=public&status=recruiting`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('📊 Studies response status:', studiesResponse.status);
    
    const studiesResult = await studiesResponse.json();
    console.log('📊 Studies response:', JSON.stringify(studiesResult, null, 2));

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
}

debugStudies();
