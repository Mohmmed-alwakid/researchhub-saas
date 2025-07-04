#!/usr/bin/env node

/**
 * Simple test to trigger the completion flow and see backend logs
 */

import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3003';

async function testCompletion() {
  console.log('🧪 Testing completion detection with thank_you block...');
  
  try {
    // Login first
    const loginResponse = await fetch(`${BASE_URL}/api/auth?action=login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'abwanwr77+participant@gmail.com',
        password: 'Testtest123'
      })
    });

    const loginData = await loginResponse.json();
    const token = loginData.session?.access_token;
    
    if (!token) {
      throw new Error('No token received');
    }

    console.log('✅ Logged in successfully');

    // Test completion with thank_you block
    const response = await fetch(`${BASE_URL}/api/blocks?action=response`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        sessionId: 'test-completion-' + Date.now(),
        blockId: 'thank-you-final',
        blockType: 'thank_you', // This should trigger completion
        response: { completed: true },
        isLastBlock: true, // Explicitly mark as last
        timeSpent: 5,
        metadata: { test: true }
      })
    });

    const data = await response.json();
    
    console.log('\n📋 Response received:');
    console.log(JSON.stringify(data, null, 2));
    
    if (data.data?.studyCompleted) {
      console.log('\n🎉 SUCCESS! Study completion detected!');
      console.log('✨ Message:', data.data.completionMessage);
    } else {
      console.log('\n❌ Study completion NOT detected');
      console.log('🔍 Check server logs for debugging info');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testCompletion();
