// Quick test script to simulate frontend auth request
const testAuth = async () => {
  try {
    console.log('🔍 Testing frontend auth request...');
    
    const response = await fetch('/api/auth-consolidated?action=login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'abwanwr77+Researcher@gmail.com',
        password: 'Testtest123'
      })
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', [...response.headers.entries()]);
    
    const data = await response.json();
    console.log('Response data:', data);
    
    return data;
  } catch (error) {
    console.error('Auth test error:', error);
    return { error: error.message };
  }
};

// Test on page load
window.addEventListener('load', () => {
  testAuth().then(result => {
    console.log('Auth test result:', result);
  });
});
