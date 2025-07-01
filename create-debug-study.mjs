// Create a test study for debugging
import fetch from 'node-fetch';

const baseUrl = 'http://localhost:3003';

console.log('🎯 Creating Test Study for Debugging');
console.log('=====================================');

async function createTestStudy() {
  try {
    // Login as researcher
    console.log('\n1️⃣ LOGIN AS RESEARCHER');
    const loginResponse = await fetch(`${baseUrl}/api/auth?action=login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'abwanwr77+Researcher@gmail.com',
        password: 'Testtest123'
      })
    });
    
    const loginData = await loginResponse.json();
    const token = loginData.token;
    console.log('✅ Researcher login successful');

    // Create study
    console.log('\n2️⃣ CREATE TEST STUDY');
    const studyData = {
      title: 'Debug Response Saving Study',
      description: 'Test study for debugging block response saving functionality',
      type: 'usability_testing',
      status: 'published',
      settings: {
        duration: 10,
        targetParticipants: 5,
        compensation: 15.00,
        requirements: ['english_fluent'],
        isPublic: true
      },
      blocks: [
        {
          id: 'debug_welcome',
          type: 'welcome_screen',
          order: 1,
          title: 'Welcome to Debug Study',
          description: 'Welcome block for testing',
          is_required: true,
          settings: {
            title: 'Welcome!',
            description: 'This is a test study for debugging response saving.',
            showProgressBar: true,
            continueButtonText: 'Start'
          }
        },
        {
          id: 'debug_question',
          type: 'open_question',
          order: 2,
          title: 'Test Question',
          description: 'Open question for testing',
          is_required: true,
          settings: {
            question: 'What do you think about this debug test?',
            placeholder: 'Please share your thoughts...',
            required: true,
            maxLength: 500
          }
        },
        {
          id: 'debug_scale',
          type: 'opinion_scale',
          order: 3,
          title: 'Rate This',
          description: 'Opinion scale for testing',
          is_required: true,
          settings: {
            question: 'How would you rate this debugging experience?',
            scaleType: 'numerical',
            minValue: 1,
            maxValue: 5,
            minLabel: 'Poor',
            maxLabel: 'Excellent'
          }
        },
        {
          id: 'debug_thanks',
          type: 'thank_you',
          order: 4,
          title: 'Thank You!',
          description: 'Completion message',
          is_required: true,
          settings: {
            message: 'Thank you for helping us debug the response saving!',
            showCompensation: true,
            nextSteps: 'Your debug responses have been recorded.'
          }
        }
      ]
    };

    const createResponse = await fetch(`${baseUrl}/api/studies`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(studyData)
    });

    const createResult = await createResponse.json();
    console.log('📤 Study creation result:', JSON.stringify(createResult, null, 2));

    if (createResult.success) {
      console.log(`✅ Test study created: ${createResult.data.id}`);
      return createResult.data.id;
    } else {
      throw new Error('Study creation failed: ' + createResult.error);
    }

  } catch (error) {
    console.error('❌ Test study creation failed:', error.message);
    return null;
  }
}

createTestStudy();
