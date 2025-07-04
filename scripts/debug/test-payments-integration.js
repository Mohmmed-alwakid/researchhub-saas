/**
 * Real Money Integration Test Script
 * Tests all payment and withdrawal endpoints
 */

const API_BASE = 'http://localhost:3003';

// Test accounts credentials
const TEST_ACCOUNTS = {
  admin: {
    email: 'abwanwr77+admin@gmail.com',
    password: 'Testtest123'
  },
  researcher: {
    email: 'abwanwr77+Researcher@gmail.com',
    password: 'Testtest123'
  },
  participant: {
    email: 'abwanwr77+participant@gmail.com',
    password: 'Testtest123'
  }
};

let authTokens = {};

// Helper function for API calls
async function apiCall(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  };

  console.log(`\n🔄 ${options.method || 'GET'} ${endpoint}`);
  
  try {
    const response = await fetch(url, config);
    const data = await response.json();
    
    if (response.ok) {
      console.log(`✅ Success:`, data);
      return { success: true, data };
    } else {
      console.log(`❌ Error:`, data);
      return { success: false, error: data };
    }
  } catch (error) {
    console.log(`💥 Network Error:`, error.message);
    return { success: false, error: error.message };
  }
}

// Authentication function
async function authenticate(accountType) {
  const account = TEST_ACCOUNTS[accountType];
  const result = await apiCall('/api/auth?action=login', {
    method: 'POST',
    body: JSON.stringify(account)
  });
  
  if (result.success && result.data.session && result.data.session.access_token) {
    authTokens[accountType] = result.data.session.access_token;
    console.log(`🔐 ${accountType} authenticated successfully`);
    return true;
  }
  
  console.log(`🚫 Failed to authenticate ${accountType}`);
  return false;
}

// Test authenticated endpoint
async function testAuthenticatedEndpoint(endpoint, accountType, options = {}) {
  if (!authTokens[accountType]) {
    console.log(`❌ No token for ${accountType}`);
    return false;
  }
  
  return await apiCall(endpoint, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${authTokens[accountType]}`
    }
  });
}

// Main test function
async function runPaymentTests() {
  console.log('🚀 RESEARCHHUB REAL MONEY INTEGRATION TESTS');
  console.log('=' * 50);
  
  // 1. Test health endpoint
  console.log('\n📊 1. TESTING HEALTH ENDPOINT');
  await apiCall('/api/health');
  
  // 2. Authenticate all accounts
  console.log('\n🔐 2. AUTHENTICATING TEST ACCOUNTS');
  await authenticate('admin');
  await authenticate('researcher');
  await authenticate('participant');
  
  // 3. Test payment history endpoint (no auth required)
  console.log('\n💳 3. TESTING PAYMENT HISTORY');
  await apiCall('/api/payments?action=history');
  
  // 4. Test withdrawal history
  console.log('\n💰 4. TESTING WITHDRAWAL HISTORY');
  await apiCall('/api/payments?action=withdrawals');
  
  // 5. Test financial overview (admin only)
  console.log('\n📈 5. TESTING FINANCIAL OVERVIEW (Admin)');
  await testAuthenticatedEndpoint('/api/payments?action=financial-overview', 'admin');
  
  // 6. Test create payment intent (researcher)
  console.log('\n💡 6. TESTING CREATE PAYMENT INTENT (Researcher)');
  await testAuthenticatedEndpoint('/api/payments?action=create-payment-intent', 'researcher', {
    method: 'POST',
    body: JSON.stringify({
      amount: 50,
      currency: 'usd',
      points: 5000
    })
  });
  
  // 7. Test withdrawal request (participant)
  console.log('\n🏦 7. TESTING WITHDRAWAL REQUEST (Participant)');
  await testAuthenticatedEndpoint('/api/payments?action=request-withdrawal', 'participant', {
    method: 'POST',
    body: JSON.stringify({
      amount: 25,
      paymentMethod: 'paypal',
      paymentDetails: {
        email: 'participant@example.com'
      }
    })
  });
  
  // 8. Test conversion rates
  console.log('\n💱 8. TESTING CONVERSION RATES');
  await apiCall('/api/payments?action=conversion-rates');
  
  // 9. Test admin withdrawal processing
  console.log('\n⚙️ 9. TESTING ADMIN WITHDRAWAL PROCESSING');
  await testAuthenticatedEndpoint('/api/payments?action=process-withdrawal', 'admin', {
    method: 'POST',
    body: JSON.stringify({
      withdrawalId: 'withdrawal_001',
      action: 'approve',
      adminNotes: 'Test approval from automated script'
    })
  });
  
  // 10. Test points balance endpoint
  console.log('\n🎯 10. TESTING POINTS BALANCE');
  await testAuthenticatedEndpoint('/api/points?action=balance', 'participant');
  
  console.log('\n✅ PAYMENT INTEGRATION TESTS COMPLETED');
  console.log('Check the results above for any errors or issues.');
}

// Run tests
runPaymentTests().catch(console.error);
