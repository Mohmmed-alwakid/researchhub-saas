// Test script to check the admin users API response format
import fetch from 'node-fetch';

const TEST_TOKEN = "eyJhbGciOiJIUzI1NiIsImtpZCI6ImtNTk9JUFUzZGs1VUZiSzAiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL3d4cHd4emRnZHZpbmxidG5iZ2RmLnN1cGFiYXNlLmNvL2F1dGgvdjEiLCJzdWIiOiI2Y2U0YThmNi02MDEyLTQwZDctYTU2Zi0zNTU3MzBkZWQ4YWQiLCJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNzUyNDE1MTE0LCJpYXQiOjE3NTI0MTE1MTQsImVtYWlsIjoiYWJ3YW53cjc3K2FkbWluQGdtYWlsLmNvbSIsInBob25lIjoiIiwiYXBwX21ldGFkYXRhIjp7InByb3ZpZGVyIjoiZW1haWwiLCJwcm92aWRlcnMiOlsiZW1haWwiXX0sInVzZXJfbWV0YWRhdGEiOnsiZW1haWwiOiJhYndhbndyNzcrYWRtaW5AZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsImZpcnN0X25hbWUiOiJBZG1pbiIsImxhc3RfbmFtZSI6IlVzZXIiLCJwaG9uZV92ZXJpZmllZCI6ZmFsc2UsInJvbGUiOiJhZG1pbiIsInN1YiI6IjZjZTRhOGY2LTYwMTItNDBkNy1hNTZmLTM1NTczMGRlZDhhZCJ9LCJyb2xlIjoiYXV0aGVudGljYXRlZCIsImFhbCI6ImFhbDEiLCJhbXIiOlt7Im1ldGhvZCI6InBhc3N3b3JkIiwidGltZXN0YW1wIjoxNzUyNDExNTE0fV0sInNlc3Npb25faWQiOiJkNTE0YzNjOC0xNTNjLTQxNWItODc1Zi1iZDJmZGQyMjk4OTkiLCJpc19hbm9ueW1vdXMiOmZhbHNlfQ.GU5hMe4THh-WWVSATsk5qE-tF-Y3y_wvv55TOvDngGU"; // Fresh admin token

async function testAdminUsersAPI() {
  try {
    console.log('🔍 Testing admin users API...');
    
    const response = await fetch('http://localhost:3003/api/admin/users', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TEST_TOKEN}`
      }
    });
    
    console.log('📊 Response Status:', response.status);
    console.log('📊 Response Headers:', response.headers.raw());
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ HTTP Error:', errorText);
      return;
    }
    
    const data = await response.json();
    console.log('✅ API Response Structure:');
    console.log('- Has success property:', 'success' in data);
    console.log('- Success value:', data.success);
    console.log('- Has data property:', 'data' in data);
    console.log('- Data type:', typeof data.data);
    
    if (data.data) {
      console.log('- Data.data type:', typeof data.data.data);
      console.log('- Data.data is array:', Array.isArray(data.data.data));
      if (data.data.data && Array.isArray(data.data.data)) {
        console.log('- Users count:', data.data.data.length);
        console.log('- First user sample:', JSON.stringify(data.data.data[0], null, 2));
      }
    }
    
    console.log('\n📋 Full Response:');
    console.log(JSON.stringify(data, null, 2));
    
  } catch (error) {
    console.error('❌ API Test Error:', error.message);
  }
}

testAdminUsersAPI();
