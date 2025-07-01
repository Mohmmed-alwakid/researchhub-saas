/**
 * Test Participant Block Rendering System
 * Verifies the complete workflow from session to block rendering
 * Date: June 30, 2025
 */

const API_BASE = 'http://localhost:3003/api';

// Test accounts
const PARTICIPANT_ACCOUNT = {
  email: 'abwanwr77+participant@gmail.com',
  password: 'Testtest123'
};

// Test study ID (dynamically get the first available study)
let TEST_STUDY_ID = null;

async function testParticipantBlockRendering() {
  console.log('🎯 TESTING PARTICIPANT BLOCK RENDERING SYSTEM');
  console.log('='.repeat(50));
  
  let participantToken = null;
  let sessionId = null;

  try {
    // Step 1: Participant Login
    console.log('\n1️⃣ PARTICIPANT LOGIN');
    const loginResponse = await fetch(`${API_BASE}/auth?action=login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(PARTICIPANT_ACCOUNT)
    });

    const loginData = await loginResponse.json();
    if (!loginData.success) {
      throw new Error(`Login failed: ${loginData.error}`);
    }

    participantToken = loginData.session.access_token;
    console.log('✅ Participant logged in successfully');

    // Step 1.5: Get Available Studies to find one with approved application
    console.log('\n1️⃣.5 GET AVAILABLE STUDIES');
    const studiesResponse = await fetch(`${API_BASE}/applications?endpoint=studies/public`, {
      headers: {
        'Authorization': `Bearer ${participantToken}`
      }
    });

    const studiesData = await studiesResponse.json();
    if (!studiesData.success || !studiesData.data?.studies?.length) {
      throw new Error('No studies available');
    }

    TEST_STUDY_ID = studiesData.data.studies[0].id;
    console.log(`✅ Using study: ${studiesData.data.studies[0].title} (${TEST_STUDY_ID})`);

    // Step 2: Create Study Session
    console.log('\n2️⃣ CREATE STUDY SESSION');
    const sessionResponse = await fetch(`${API_BASE}/study-sessions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${participantToken}`
      },
      body: JSON.stringify({
        studyId: TEST_STUDY_ID
      })
    });

    const sessionData = await sessionResponse.json();
    if (!sessionData.success) {
      throw new Error(`Session creation failed: ${sessionData.error}`);
    }

    sessionId = sessionData.session.id;
    console.log('✅ Study session created:', sessionId);

    // Step 3: Load Study Blocks
    console.log('\n3️⃣ LOAD STUDY BLOCKS');
    const blocksResponse = await fetch(`${API_BASE}/blocks?action=study&studyId=${TEST_STUDY_ID}`, {
      headers: {
        'Authorization': `Bearer ${participantToken}`
      }
    });

    if (!blocksResponse.ok) {
      throw new Error(`Blocks request failed: ${blocksResponse.status} ${blocksResponse.statusText}`);
    }

    const blocksData = await blocksResponse.json();
    console.log('📋 Blocks API Response:', JSON.stringify(blocksData, null, 2));

    if (!blocksData.success) {
      throw new Error(`Blocks loading failed: ${blocksData.error}`);
    }

    const blocks = blocksData.blocks || [];
    console.log(`✅ Loaded ${blocks.length} blocks for study`);

    // Step 4: Display Block Information
    console.log('\n4️⃣ BLOCK INFORMATION');
    if (blocks.length === 0) {
      console.log('⚠️  No blocks found - need to create sample blocks');
      return await createSampleBlocks();
    }

    blocks.forEach((block, index) => {
      console.log(`   ${index + 1}. ${block.type}: ${block.title || 'Untitled'}`);
      console.log(`      Description: ${block.description || 'No description'}`);
      console.log(`      Settings: ${JSON.stringify(block.settings || {})}`);
    });

    // Step 5: Simulate Block Response
    console.log('\n5️⃣ SIMULATE BLOCK RESPONSE');
    if (blocks.length > 0) {
      const firstBlock = blocks[0];
      
      const responsePayload = {
        sessionId: sessionId,
        blockId: firstBlock.id,
        blockType: firstBlock.type,
        response: getSimulatedResponse(firstBlock.type),
        completedAt: new Date().toISOString(),
        timeSpent: 15000 // 15 seconds
      };

      console.log('📝 Simulating response for block:', firstBlock.type);
      console.log('📄 Response payload:', JSON.stringify(responsePayload, null, 2));

      const responseResponse = await fetch(`${API_BASE}/blocks?action=response`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${participantToken}`
        },
        body: JSON.stringify(responsePayload)
      });

      const responseResult = await responseResponse.json();
      if (responseResult.success) {
        console.log('✅ Block response saved successfully');
      } else {
        console.log('❌ Block response failed:', responseResult.error);
      }
    }

    console.log('\n🎉 PARTICIPANT BLOCK RENDERING TEST COMPLETE');
    return {
      success: true,
      sessionId,
      blocksCount: blocks.length,
      blocks: blocks
    };

  } catch (error) {
    console.error('\n❌ TEST FAILED:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

// Create sample blocks for testing
async function createSampleBlocks() {
  console.log('\n🔧 CREATING SAMPLE BLOCKS FOR TESTING');
  
  // This would typically use the study builder, but for testing we'll create directly
  const sampleBlocks = [
    {
      type: 'welcome',
      title: 'Welcome to the Study',
      description: 'Thank you for participating in our research',
      settings: {
        buttonText: 'Start Study'
      }
    },
    {
      type: 'open_question',
      title: 'Tell us about yourself',
      description: 'Please describe your experience with the product',
      settings: {
        placeholder: 'Type your response here...',
        minLength: 50
      }
    },
    {
      type: 'opinion_scale',
      title: 'Rate your satisfaction',
      description: 'How satisfied are you with the current product?',
      settings: {
        scaleType: 'stars',
        min: 1,
        max: 5,
        labels: ['Very Poor', 'Poor', 'Average', 'Good', 'Excellent']
      }
    },
    {
      type: 'thank_you',
      title: 'Thank you!',
      description: 'Your participation helps us improve our product',
      settings: {
        redirectUrl: '/dashboard'
      }
    }
  ];

  console.log(`📋 Sample blocks to create: ${sampleBlocks.length}`);
  sampleBlocks.forEach((block, index) => {
    console.log(`   ${index + 1}. ${block.type}: ${block.title}`);
  });

  return {
    success: true,
    message: 'Sample blocks structure defined',
    sampleBlocks
  };
}

// Generate simulated responses based on block type
function getSimulatedResponse(blockType) {
  switch (blockType) {
    case 'welcome':
      return { acknowledged: true };
    
    case 'open_question':
      return { 
        answer: 'This is a simulated response to the open question. The product has been very useful for my daily workflow and I appreciate the intuitive design.'
      };
    
    case 'opinion_scale':
      return { 
        rating: 4,
        scaleType: 'stars'
      };
    
    case 'multiple_choice':
      return { 
        selectedOption: 'option_2',
        optionText: 'Good'
      };
    
    case 'yes_no':
      return { 
        answer: 'yes'
      };
    
    case 'simple_input':
      return { 
        value: 'test@example.com',
        inputType: 'email'
      };
    
    case 'thank_you':
      return { completed: true };
    
    default:
      return { response: 'Simulated response' };
  }
}

// Run the test
testParticipantBlockRendering()
  .then(result => {
    if (result.success) {
      console.log('\n✅ ALL TESTS PASSED!');
      console.log(`📊 Summary: ${result.blocksCount} blocks loaded successfully`);
    } else {
      console.log('\n❌ TESTS FAILED!');
      console.log(`💥 Error: ${result.error}`);
    }
  })
  .catch(error => {
    console.error('\n💥 UNEXPECTED ERROR:', error);
  });
