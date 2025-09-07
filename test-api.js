import fetch from 'node-fetch';

async function testAPI() {
  try {
    console.log('Testing ResearchHub API...');
    
    const response = await fetch('https://researchhub-saas.vercel.app/api/research-consolidated?action=get-studies', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({})
    });
    
    console.log(`Response Status: ${response.status}`);
    console.log(`Response Headers:`, Object.fromEntries(response.headers));
    
    if (!response.ok) {
      const errorText = await response.text();
      console.log(`Error Response Body: ${errorText}`);
    } else {
      const data = await response.json();
      console.log('Success Response:', data);
    }
    
  } catch (error) {
    console.error('Request Failed:', error.message);
  }
}

testAPI();
