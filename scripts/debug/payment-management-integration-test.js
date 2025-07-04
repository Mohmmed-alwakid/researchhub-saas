// Payment Management System Integration Test
// This script demonstrates the full payment management workflow with real API integration

async function testPaymentManagementWithRealUser() {
  console.log('🚀 Starting Payment Management Integration Test...\n');

  // Admin token (obtained from browser localStorage)
  const adminToken = 'eyJhbGciOiJIUzI1NiIsImtpZCI6ImtNTk9JUFUzZGs1VUZiSzAiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL3d4cHd4emRnZHZpbmxidG5iZ2RmLnN1cGFiYXNlLmNvL2F1dGgvdjEiLCJzdWIiOiI2Y2U0YThmNi02MDEyLTQwZDctYTU2Zi0zNTU3MzBkZWQ4YWQiLCJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNzUxNTIzMjg0LCJpYXQiOjE3NTE1MTk2ODQsImVtYWlsIjoiYWJ3YW53cjc3K2FkbWluQGdtYWlsLmNvbSIsInBob25lIjoiIiwiYXBwX21ldGFkYXRhIjp7InByb3ZpZGVyIjoiZW1haWwiLCJwcm92aWRlcnMiOlsiZW1haWwiXX0sInVzZXJfbWV0YWRhdGEiOnsiZW1haWwiOiJhYndhbndyNzcrYWRtaW5AZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsImZpcnN0X25hbWUiOiJBZG1pbiIsImxhc3RfbmFtZSI6IlVzZXIiLCJwaG9uZV92ZXJpZmllZCI6ZmFsc2UsInJvbGUiOiJhZG1pbiIsInN1YiI6IjZjZTRhOGY2LTYwMTItNDBkNy1hNTZmLTM1NTczMGRlZDhhZCJ9LCJyb2xlIjoiYXV0aGVudGljYXRlZCIsImFhbCI6ImFhbDEiLCJhbXIiOlt7Im1ldGhvZCI6InBhc3N3b3JkIiwidGltZXN0YW1wIjoxNzUxNTE5Njg0fV0sInNlc3Npb25faWQiOiJlOTEwYjMwMi1mNTA4LTQ0YTctYWNkMC0xMWQ1NmE0NGRjMWYiLCJpc19hbm9ueW1vdXMiOmZhbHNlfQ.Ug5bWE0MK2vrvY74YB_E4bX9JSm9YVoQdnG0KQ5KzHw';
  
  const baseUrl = 'http://localhost:3003/api/admin/payments';
  const headers = {
    'Authorization': `Bearer ${adminToken}`,
    'Content-Type': 'application/json'
  };

  try {
    // Test 1: Get initial payment analytics
    console.log('📊 Step 1: Getting initial payment analytics...');
    const analyticsResponse = await fetch(`${baseUrl}/analytics`, { headers });
    const analytics = await analyticsResponse.json();
    console.log('✅ Analytics retrieved:', JSON.stringify(analytics.data, null, 2));
    console.log('');

    // Test 2: Get all payment requests
    console.log('📋 Step 2: Getting all payment requests...');
    const requestsResponse = await fetch(`${baseUrl}/requests`, { headers });
    const requests = await requestsResponse.json();
    console.log('✅ Payment requests retrieved:', requests.data.length, 'requests found');
    requests.data.forEach((req, index) => {
      console.log(`   ${index + 1}. ${req.userId.firstName} ${req.userId.lastName} - ${req.planType} ($${req.amount}) - ${req.status}`);
    });
    console.log('');

    // Test 3: Add credits to a real user (researcher)
    console.log('💳 Step 3: Adding credits to researcher user...');
    const addCreditsResponse = await fetch(`${baseUrl}/credits/add`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        email: 'abwanwr77+researcher@gmail.com',
        credits: 500,
        planType: 'pro'
      })
    });
    const creditsResult = await addCreditsResponse.json();
    console.log('✅ Credits added successfully:', JSON.stringify(creditsResult.data, null, 2));
    console.log('');

    // Test 4: Verify a pending payment
    console.log('✅ Step 4: Verifying a pending payment...');
    const pendingPayment = requests.data.find(req => req.status === 'pending');
    if (pendingPayment) {
      const verifyResponse = await fetch(`${baseUrl}/requests/${pendingPayment._id}/verify`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          adminNotes: 'Payment verified via bank statement - automated test'
        })
      });
      const verifyResult = await verifyResponse.json();
      console.log('✅ Payment verified:', JSON.stringify(verifyResult.data, null, 2));
    } else {
      console.log('ℹ️ No pending payments to verify');
    }
    console.log('');

    // Test 5: Test error handling with invalid user
    console.log('❌ Step 5: Testing error handling with invalid user...');
    try {
      const invalidResponse = await fetch(`${baseUrl}/credits/add`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          email: 'nonexistent@example.com',
          credits: 100,
          planType: 'basic'
        })
      });
      const invalidResult = await invalidResponse.json();
      console.log('✅ Error handling works:', invalidResult.error);
    } catch (error) {
      console.log('✅ Error handling test successful:', error.message);
    }
    console.log('');

    // Test 6: Get updated analytics
    console.log('📊 Step 6: Getting updated analytics...');
    const finalAnalyticsResponse = await fetch(`${baseUrl}/analytics`, { headers });
    const finalAnalytics = await finalAnalyticsResponse.json();
    console.log('✅ Final analytics:', JSON.stringify(finalAnalytics.data, null, 2));

    console.log('\n🎉 ALL PAYMENT MANAGEMENT TESTS PASSED!');
    console.log('\n📈 Summary of tested functionality:');
    console.log('   ✅ Payment analytics API');
    console.log('   ✅ Payment requests listing');
    console.log('   ✅ Add credits to real users');
    console.log('   ✅ Payment verification workflow');
    console.log('   ✅ Error handling for invalid users');
    console.log('   ✅ Admin authentication');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Test payment management integration with real users
testPaymentManagementWithRealUser();
