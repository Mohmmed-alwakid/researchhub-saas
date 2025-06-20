// Quick test to verify study creation API works
const fetch = require('node-fetch');

async function testStudyCreation() {
  console.log('Testing study creation API...');
  
  // First, let's test login to get a token
  try {
    const loginResponse = await fetch('http://localhost:3003/api/auth?action=login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'abwanwr77+Researcher@gmail.com',
        password: 'Testtest123'
      })
    });
    
    const loginData = await loginResponse.json();
    console.log('Login response:', loginData);
    
    if (!loginData.success || !loginData.data.access_token) {
      console.error('Login failed');
      return;
    }
    
    const token = loginData.data.access_token;
    console.log('Got token, now testing study creation...');
    
    // Now test study creation
    const studyData = {
      title: 'API Test Study',
      description: 'Testing study creation via direct API call',
      type: 'usability',
      settings: {
        maxParticipants: 10,
        duration: 30,
        compensation: 25
      },
      tasks: [
        {
          id: 'task-1',
          title: 'Test Task',
          description: 'A test task',
          type: 'website-navigation'
        }
      ]
    };
    
    const createResponse = await fetch('http://localhost:3003/api/studies', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(studyData)
    });
    
    const createData = await createResponse.json();
    console.log('Study creation response:', createData);
    
    if (createData.success) {
      console.log('✅ Study created successfully!');
      console.log('Study ID:', createData.data.id);
      
      // Now test fetching studies
      const fetchResponse = await fetch('http://localhost:3003/api/studies', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const fetchData = await fetchResponse.json();
      console.log('Fetched studies:', fetchData);
      
      if (fetchData.success && fetchData.data.length > 0) {
        console.log('✅ Study appears in studies list!');
        console.log(`Found ${fetchData.data.length} studies`);
      } else {
        console.log('❌ Study not found in studies list');
      }
      
    } else {
      console.log('❌ Study creation failed:', createData.error);
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testStudyCreation();
