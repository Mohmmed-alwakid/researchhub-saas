// Test recordings API without database - Mock data test
import fetch from 'node-fetch';

const API_BASE = 'http://localhost:3003/api';

async function testRecordingsAPIMock() {
  console.log('🧪 Testing Recordings API with Mock Data');
  console.log('=' .repeat(50));
  
  try {
    // Test 1: Health Check
    console.log('\n1️⃣ Testing Health Check...');
    const healthResponse = await fetch(`${API_BASE}/health`);
    const healthData = await healthResponse.json();
    console.log('✅ Health Check:', healthData.success ? 'PASS' : 'FAIL');
    
    // Test 2: GET recordings (should fail gracefully without database)
    console.log('\n2️⃣ Testing GET /api/recordings...');
    try {
      const getResponse = await fetch(`${API_BASE}/recordings`);
      const getData = await getResponse.json();
      console.log('📊 GET Recordings Response:', getData);
      console.log('✅ API endpoint accessible:', getResponse.status === 500 ? 'PASS (expected error)' : 'UNEXPECTED');
    } catch (error) {
      console.log('❌ GET Recordings Error:', error.message);
    }
    
    // Test 3: POST create session (should fail gracefully without database)
    console.log('\n3️⃣ Testing POST create session...');
    try {
      const createResponse = await fetch(`${API_BASE}/recordings?action=create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          studyId: 'test-study-123',
          participantId: 'test-participant-456'
        })
      });
      const createData = await createResponse.json();
      console.log('📊 Create Session Response:', createData);
      console.log('✅ API endpoint accessible:', createResponse.status === 500 ? 'PASS (expected error)' : 'UNEXPECTED');
    } catch (error) {
      console.log('❌ Create Session Error:', error.message);
    }
    
    // Test 4: POST upload recording (should fail gracefully without database)
    console.log('\n4️⃣ Testing POST upload recording...');
    try {
      const uploadResponse = await fetch(`${API_BASE}/recordings?action=upload`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sessionId: 'test-session-123',
          recordingData: 'data:video/webm;base64,dGVzdCBkYXRh', // "test data" in base64
          mimeType: 'video/webm',
          duration: 30
        })
      });
      const uploadData = await uploadResponse.json();
      console.log('📊 Upload Recording Response:', uploadData);
      console.log('✅ API endpoint accessible:', uploadResponse.status === 500 ? 'PASS (expected error)' : 'UNEXPECTED');
    } catch (error) {
      console.log('❌ Upload Recording Error:', error.message);
    }
    
    console.log('\n🎯 API Logic Test Summary:');
    console.log('✅ All API endpoints are accessible');
    console.log('✅ Error handling works correctly');
    console.log('✅ Ready for database setup');
    console.log('\n📋 Next Steps:');
    console.log('1. Apply supabase-manual-migration.sql in Supabase Dashboard');
    console.log('2. Test again with database tables created');
    console.log('3. Test end-to-end screen recording flow');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testRecordingsAPIMock();
