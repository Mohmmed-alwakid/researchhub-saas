// Simple test for Study Sessions API
import express from 'express';
import studySessionsHandler from '../../api/study-sessions.js';

const testApp = express();
testApp.use(express.json());

// Mount the study sessions handler
testApp.all('/api/study-sessions*', studySessionsHandler);

// Start test server
const PORT = 3004;
testApp.listen(PORT, () => {
  console.log(`🧪 Test server running on http://localhost:${PORT}`);
  
  // Run basic tests
  setTimeout(async () => {
    console.log('🧪 Running tests...');
    
    // Test 1: List sessions
    try {
      const response = await fetch('http://localhost:3004/api/study-sessions', {
        headers: { 'Authorization': 'Bearer mock-participant-token' }
      });
      const data = await response.json();
      console.log('✅ List sessions test:', data);
    } catch (error) {
      console.log('❌ List sessions error:', error.message);
    }
    
    // Test 2: Start session
    try {
      const response = await fetch('http://localhost:3004/api/study-sessions/start', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': 'Bearer mock-participant-token'
        },
        body: JSON.stringify({
          userId: 'test-user-123',
          studyId: 'test-study-456',
          sessionData: {
            deviceInfo: { userAgent: 'test-browser' },
            startTime: new Date().toISOString()
          }
        })
      });
      const data = await response.json();
      console.log('✅ Start session test:', data);
    } catch (error) {
      console.log('❌ Start session error:', error.message);
    }
    
    process.exit(0);
  }, 1000);
});
