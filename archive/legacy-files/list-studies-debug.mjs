// List existing studies and use one for debugging
import fetch from 'node-fetch';

const baseUrl = 'http://localhost:3003';

async function listStudiesAndDebug() {
  try {
    // Login as researcher first to see if there are studies
    console.log('🔍 Checking for existing studies...');
    
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
    
    const studiesResponse = await fetch(`${baseUrl}/api/studies`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const studiesData = await studiesResponse.json();
    console.log('📋 Studies found:', JSON.stringify(studiesData, null, 2));
    
    // If no studies exist, we'll test directly with test study ID
    if (!studiesData.data || studiesData.data.length === 0) {
      console.log('📝 No studies found, using test study ID for blocks API...');
      
      // Test the blocks API directly
      const blocksResponse = await fetch(`${baseUrl}/api/blocks?action=study&studyId=test_study_123`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const blocksData = await blocksResponse.json();
      console.log('🧱 Test blocks response:', JSON.stringify(blocksData, null, 2));
      
      if (blocksData.success) {
        console.log('✅ Blocks API is working with test data');
        // Now test response saving with a simple mock session
        return await testResponseSavingWithMockData(token);
      }
    } else {
      const study = studiesData.data[0];
      console.log(`✅ Using existing study: ${study.id}`);
      return await debugWithExistingStudy(token, study.id);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

async function testResponseSavingWithMockData(token) {
  console.log('\n🧪 TESTING RESPONSE SAVING WITH MOCK DATA');
  
  // Create a mock session directly in the database using a simple endpoint
  const mockSessionId = `debug_session_${Date.now()}`;
  
  console.log(`📝 Using mock session ID: ${mockSessionId}`);
  
  // Test saving response directly
  const responseData = {
    sessionId: mockSessionId,
    blockId: 'test_welcome',
    blockType: 'welcome_screen',
    response: {
      acknowledged: true,
      timestamp: new Date().toISOString()
    }
  };

  console.log('📤 Testing response save...');
  
  const saveResponse = await fetch(`${baseUrl}/api/blocks?action=response`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(responseData)
  });

  const saveResult = await saveResponse.json();
  console.log('📥 Save result:', JSON.stringify(saveResult, null, 2));
  
  return saveResult;
}

async function debugWithExistingStudy(token, studyId) {
  console.log(`\n🧪 TESTING WITH EXISTING STUDY: ${studyId}`);
  
  // Create session for existing study
  const sessionResponse = await fetch(`${baseUrl}/api/study-sessions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ studyId })
  });
  
  const sessionData = await sessionResponse.json();
  console.log('📝 Session creation:', JSON.stringify(sessionData, null, 2));
  
  if (sessionData.success) {
    const sessionId = sessionData.data.id;
    
    // Test response saving
    const responseData = {
      sessionId: sessionId,
      blockId: 'test_welcome',
      blockType: 'welcome_screen',
      response: {
        acknowledged: true,
        timestamp: new Date().toISOString()
      }
    };

    const saveResponse = await fetch(`${baseUrl}/api/blocks?action=response`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(responseData)
    });

    const saveResult = await saveResponse.json();
    console.log('📥 Save result:', JSON.stringify(saveResult, null, 2));
    
    return saveResult;
  }
  
  return sessionData;
}

listStudiesAndDebug();
