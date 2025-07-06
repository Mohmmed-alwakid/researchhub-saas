#!/usr/bin/env node

import fetch from 'node-fetch';

const baseURL = 'http://localhost:3003';

// Simple login test
async function testLogin() {
  try {
    console.log('=== Testing Login ===');

    const loginResponse = await fetch(`${baseURL}/api/auth?action=login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'abwanwr77+participant@gmail.com',
        password: 'Testtest123'
      })
    });

    console.log('📊 Response status:', loginResponse.status);
    
    const loginResult = await loginResponse.json();
    console.log('📊 Login response:', JSON.stringify(loginResult, null, 2));

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
}

testLogin();
