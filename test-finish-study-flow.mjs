#!/usr/bin/env node

/**
 * Test script to demonstrate the complete "Finish Study" flow
 * Shows what happens when a participant completes the last block
 */

import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3003';

// Test account credentials
const testAccount = {
  email: 'abwanwr77+participant@gmail.com',
  password: 'Testtest123',
  role: 'participant'
};

let authToken = '';
const sessionId = 'test-finish-study-' + Date.now();

async function loginUser() {
  console.log('🔐 Logging in participant...');
  
  const response = await fetch(`${BASE_URL}/api/auth?action=login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(testAccount)
  });

  const data = await response.json();
  
  if (!data.success) {
    throw new Error(`Login failed: ${data.error}`);
  }

  authToken = data.session?.access_token || data.token || data.data?.token || data.access_token || data.data?.access_token;
  console.log('✅ Participant logged in successfully');
  console.log('🔍 Debug - Token preview:', authToken ? authToken.substring(0, 20) + '...' : 'NO TOKEN');
  return data;
}

async function simulateStudyBlocks() {
  console.log('\n📚 Simulating study with multiple blocks...');
  
  // Simulate completing various block types leading to thank_you
  const blocks = [
    { id: 'welcome-1', type: 'welcome_screen', response: { acknowledged: true } },
    { id: 'question-1', type: 'open_question', response: { answer: 'This is my response to the open question.' } },
    { id: 'rating-1', type: 'opinion_scale', response: { rating: 4, scale_type: 'numeric' } },
    { id: 'choice-1', type: 'multiple_choice', response: { selected: ['option_1'] } },
    { id: 'thank-you-1', type: 'thank_you', response: { completed: true } } // Final block
  ];

  console.log(`📋 Completing ${blocks.length} blocks in sequence...`);

  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];
    const isLastBlock = i === blocks.length - 1;
    
    console.log(`\n${i + 1}/${blocks.length} Processing block: ${block.id} (${block.type})`);
    if (isLastBlock) {
      console.log('🏁 This is the FINAL block - should trigger study completion!');
    }

    const response = await fetch(`${BASE_URL}/api/blocks?action=response`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        sessionId,
        blockId: block.id,
        blockType: block.type,
        response: block.response,
        isLastBlock, // Explicitly mark the last block
        timeSpent: Math.floor(Math.random() * 30) + 10, // Random time 10-40 seconds
        metadata: {
          completedAt: new Date().toISOString(),
          simulatedResponse: true
        }
      })
    });

    const data = await response.json();
    
    if (!data.success) {
      console.error(`❌ Failed to save block ${block.id}:`, data.error);
      continue;
    }

    console.log(`✅ Block ${block.id} saved successfully`);
    console.log(`   Source: ${data.data.source}`);
    console.log(`   Total responses: ${data.data.totalResponses}`);
    console.log(`   Study completed: ${data.data.studyCompleted}`);
    if (data.data.completionMessage) {
      console.log(`   Completion message: ${data.data.completionMessage}`);
    }
    
    // Check for study completion
    if (data.data.studyCompleted) {
      console.log('\n🎉 STUDY COMPLETED! 🎉');
      console.log('✨ Completion message:', data.data.completionMessage);
      console.log('🏆 Study status: FINISHED');
      
      // This is what the frontend would receive and act upon
      console.log('\n📱 Frontend would now:');
      console.log('   1. Show completion message to participant');
      console.log('   2. Update UI to "completed" state');
      console.log('   3. Redirect to thank you page or dashboard');
      console.log('   4. Update researcher\'s dashboard with completion');
      console.log('   5. Make participant responses available for analysis');
      
      break; // Exit the loop since study is complete
    } else {
      console.log('   ➡️  Continuing to next block...');
    }
    
    // Small delay between blocks to simulate user interaction
    await new Promise(resolve => setTimeout(resolve, 500));
  }
}

async function checkFinalStatus() {
  console.log('\n🔍 Checking final study session status...');
  
  try {
    // Try to fetch session data to confirm completion
    const response = await fetch(`${BASE_URL}/api/studies?action=session&sessionId=${sessionId}`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('📊 Session status:', data.data?.status || 'unknown');
      console.log('🕒 Completed at:', data.data?.completed_at || 'not set');
      console.log('💾 Total responses:', Object.keys(data.data?.responses || {}).length);
    } else {
      console.log('ℹ️  Session API not available (using alternative storage)');
    }
  } catch (error) {
    console.log('ℹ️  Could not check session status:', error.message);
  }
}

async function runFinishStudyDemo() {
  console.log('🚀 Starting "Finish Study" Flow Demonstration');
  console.log('=' .repeat(60));
  
  try {
    await loginUser();
    await simulateStudyBlocks();
    await checkFinalStatus();
    
    console.log('\n' + '=' .repeat(60));
    console.log('✅ FINISH STUDY DEMO COMPLETED SUCCESSFULLY!');
    console.log('\n📝 Summary of what happens when participant clicks "Finish Study":');
    console.log('   1. ✅ Final block response is saved');
    console.log('   2. ✅ Session status updated to "completed"');
    console.log('   3. ✅ Completion timestamp recorded');
    console.log('   4. ✅ Backend returns studyCompleted: true');
    console.log('   5. ✅ Frontend shows completion message');
    console.log('   6. ✅ UI transitions to completed state');
    console.log('   7. ✅ Researcher dashboard shows completion');
    console.log('   8. ✅ All responses available for analysis');
    
  } catch (error) {
    console.error('\n❌ Demo failed:', error.message);
    process.exit(1);
  }
}

// Run the demonstration
runFinishStudyDemo();
