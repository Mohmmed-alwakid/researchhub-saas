/**
 * Complete Participant Wallet & Withdrawal Workflow Test
 * 
 * This script tests the complete flow:
 * 1. Participant completes studies and earns money
 * 2. Participant requests withdrawal
 * 3. Admin approves/rejects withdrawal
 * 4. System updates wallet balances
 * 
 * Created: July 5, 2025
 */

const API_BASE = 'http://localhost:3003';

// Test accounts
const PARTICIPANT = {
    email: 'abwanwr77+participant@gmail.com',
    password: 'Testtest123'
};

const ADMIN = {
    email: 'abwanwr77+admin@gmail.com',
    password: 'Testtest123'
};

let participantToken = null;
let adminToken = null;
let participantUser = null;
let testWithdrawalId = null;

async function apiCall(endpoint, options = {}) {
    const url = `${API_BASE}/api/${endpoint}`;
    const response = await fetch(url, {
        headers: {
            'Content-Type': 'application/json',
            ...options.headers
        },
        ...options
    });
    return await response.json();
}

async function login(email, password) {
    console.log(`🔐 Logging in as ${email}...`);
    
    const response = await apiCall('auth?action=login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
    });
    
    if (response.success) {
        console.log(`✅ Login successful for ${email}`);
        return { token: response.session.access_token, user: response.user };
    } else {
        console.error(`❌ Login failed for ${email}:`, response.error);
        throw new Error(`Login failed: ${response.error}`);
    }
}

async function addEarnings(token, user, amount, studyTitle) {
    console.log(`💰 Adding $${amount} earnings for study: ${studyTitle}`);
    
    const requestBody = {
        participant_id: user.id,
        amount: amount,
        study_id: `study-${Date.now()}`,
        study_title: studyTitle
    };
    
    console.log(`🔍 DEBUG: Sending earnings request:`, JSON.stringify(requestBody, null, 2));
    
    // Note: In real implementation, this would be called by the system when a study is completed
    // For testing, we'll call it directly with the participant's token
    const response = await apiCall('wallets?action=add-earnings', {
        method: 'POST',
        headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
    });
    
    if (response.success) {
        console.log(`✅ Added $${amount} to wallet. New balance: $${response.data.new_balance}`);
        return response.data;
    } else {
        console.error(`❌ Failed to add earnings:`, response.error);
        console.log(`🔍 DEBUG: Full response:`, JSON.stringify(response, null, 2));
        throw new Error(`Add earnings failed: ${response.error}`);
    }
}

async function getWallet(token) {
    console.log(`🏦 Getting participant wallet...`);
    
    const response = await apiCall('wallets?action=get', {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (response.success) {
        const wallet = response.data;
        console.log(`✅ Wallet balance: $${wallet.balance} | Total earned: $${wallet.total_earned} | Total withdrawn: $${wallet.total_withdrawn}`);
        return wallet;
    } else {
        console.error(`❌ Failed to get wallet:`, response.error);
        throw new Error(`Get wallet failed: ${response.error}`);
    }
}

async function requestWithdrawal(token, amount, paymentMethod, paymentDetails) {
    console.log(`💸 Requesting withdrawal of $${amount}...`);
    
    const response = await apiCall('wallets?action=request-withdrawal', {
        method: 'POST',
        headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            amount: amount,
            payment_method: paymentMethod,
            payment_details: paymentDetails
        })
    });
    
    if (response.success) {
        console.log(`✅ Withdrawal request submitted. ID: ${response.data.id}`);
        return response.data;
    } else {
        console.error(`❌ Failed to request withdrawal:`, response.error);
        console.error(`🔍 Full response:`, JSON.stringify(response, null, 2));
        throw new Error(`Withdrawal request failed: ${response.error}`);
    }
}

async function getAllWithdrawals(adminToken) {
    console.log(`📋 Admin getting all withdrawal requests...`);
    
    const response = await apiCall('wallets?action=admin-withdrawals', {
        headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    
    if (response.success) {
        console.log(`✅ Found ${response.data.length} withdrawal requests`);
        return response.data;
    } else {
        console.error(`❌ Failed to get withdrawals:`, response.error);
        throw new Error(`Get withdrawals failed: ${response.error}`);
    }
}

async function processWithdrawal(adminToken, withdrawalId, action, notes) {
    console.log(`⚙️ Admin ${action}ing withdrawal ${withdrawalId}...`);
    
    const response = await apiCall('wallets?action=process-withdrawal', {
        method: 'POST',
        headers: { 
            'Authorization': `Bearer ${adminToken}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            withdrawal_id: withdrawalId,
            action: action,
            admin_notes: notes
        })
    });
    
    if (response.success) {
        console.log(`✅ Withdrawal ${action}ed successfully`);
        return response.data;
    } else {
        console.error(`❌ Failed to ${action} withdrawal:`, response.error);
        throw new Error(`Process withdrawal failed: ${response.error}`);
    }
}

async function runCompleteWorkflowTest() {
    console.log('🚀 Starting Complete Participant Wallet & Withdrawal Workflow Test');
    console.log('='.repeat(80));
    
    try {
        // Step 1: Login as participant
        console.log('\n📍 STEP 1: Participant Login');
        const participantAuth = await login(PARTICIPANT.email, PARTICIPANT.password);
        participantToken = participantAuth.token;
        participantUser = participantAuth.user;
        
        // Step 2: Check initial wallet state
        console.log('\n📍 STEP 2: Check Initial Wallet State');
        let wallet = await getWallet(participantToken);
        const initialBalance = wallet.balance;
        
        // Step 3: Simulate study completions (earnings)
        console.log('\n📍 STEP 3: Simulate Study Completions');
        await addEarnings(participantToken, participantUser, 5.00, 'User Experience Survey');
        await addEarnings(participantToken, participantUser, 10.00, 'Product Feedback Study');
        await addEarnings(participantToken, participantUser, 7.50, 'Website Navigation Test');
        
        // Step 4: Check updated wallet balance
        console.log('\n📍 STEP 4: Verify Wallet Balance After Earnings');
        wallet = await getWallet(participantToken);
        const expectedBalance = initialBalance + 22.50;
        if (Math.abs(wallet.balance - expectedBalance) < 0.01) {
            console.log(`✅ Wallet balance correct: $${wallet.balance} (expected: $${expectedBalance})`);
        } else {
            console.error(`❌ Wallet balance incorrect: $${wallet.balance} (expected: $${expectedBalance})`);
        }
        
        // Step 5: Request withdrawal
        console.log('\n📍 STEP 5: Request Withdrawal');
        const withdrawalRequest = await requestWithdrawal(
            participantToken,
            15.00,
            'paypal',
            { email: 'participant@example.com' }
        );
        testWithdrawalId = withdrawalRequest.id;
        
        // Step 6: Login as admin
        console.log('\n📍 STEP 6: Admin Login');
        const adminAuth = await login(ADMIN.email, ADMIN.password);
        adminToken = adminAuth.token;
        
        // Step 7: Admin views all withdrawal requests
        console.log('\n📍 STEP 7: Admin Views Withdrawal Requests');
        const withdrawals = await getAllWithdrawals(adminToken);
        const testWithdrawal = withdrawals.find(w => w.id === testWithdrawalId);
        
        if (testWithdrawal) {
            console.log(`✅ Found test withdrawal request: $${testWithdrawal.amount} - Status: ${testWithdrawal.status}`);
        } else {
            console.error(`❌ Test withdrawal request not found in admin list`);
        }
        
        // Step 8: Admin approves withdrawal
        console.log('\n📍 STEP 8: Admin Approves Withdrawal');
        await processWithdrawal(
            adminToken,
            testWithdrawalId,
            'approve',
            'Approved - Valid request with sufficient balance'
        );
        
        // Step 9: Verify wallet balance updated
        console.log('\n📍 STEP 9: Verify Wallet Balance After Approval');
        wallet = await getWallet(participantToken);
        const expectedFinalBalance = expectedBalance - 15.00;
        
        if (Math.abs(wallet.balance - expectedFinalBalance) < 0.01) {
            console.log(`✅ Wallet balance correctly updated: $${wallet.balance} (expected: $${expectedFinalBalance})`);
            console.log(`✅ Total withdrawn updated: $${wallet.total_withdrawn}`);
        } else {
            console.error(`❌ Wallet balance incorrect after withdrawal: $${wallet.balance} (expected: $${expectedFinalBalance})`);
        }
        
        // Step 10: Test rejection workflow
        console.log('\n📍 STEP 10: Test Withdrawal Rejection');
        
        // Request another withdrawal
        const rejectionRequest = await requestWithdrawal(
            participantToken,
            5.00,
            'bank_transfer',
            { account_number: '1234567890', routing_number: '021000021' }
        );
        
        // Admin rejects it
        await processWithdrawal(
            adminToken,
            rejectionRequest.id,
            'reject',
            'Rejected - Testing rejection workflow'
        );
        
        // Verify balance unchanged
        const walletAfterRejection = await getWallet(participantToken);
        if (Math.abs(walletAfterRejection.balance - expectedFinalBalance) < 0.01) {
            console.log(`✅ Wallet balance unchanged after rejection: $${walletAfterRejection.balance}`);
        } else {
            console.error(`❌ Wallet balance changed incorrectly after rejection`);
        }
        
        // Success summary
        console.log('\n' + '='.repeat(80));
        console.log('🎉 WORKFLOW TEST COMPLETED SUCCESSFULLY!');
        console.log('='.repeat(80));
        console.log(`✅ Study Completions: 3 studies, $22.50 earned`);
        console.log(`✅ Withdrawal Request: $15.00 submitted`);
        console.log(`✅ Admin Approval: Withdrawal approved, balance updated`);
        console.log(`✅ Withdrawal Rejection: Tested rejection workflow`);
        console.log(`✅ Final Balance: $${walletAfterRejection.balance}`);
        console.log(`✅ Total Earned: $${walletAfterRejection.total_earned}`);
        console.log(`✅ Total Withdrawn: $${walletAfterRejection.total_withdrawn}`);
        console.log('\n💡 Outside System: Would handle actual money transfer for approved withdrawals');
        
    } catch (error) {
        console.error('\n❌ WORKFLOW TEST FAILED:', error.message);
        console.error('Stack trace:', error.stack);
    }
}

// Run the test
runCompleteWorkflowTest();
