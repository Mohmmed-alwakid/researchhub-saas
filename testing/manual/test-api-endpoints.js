/**
 * API Testing Script for Study Edit System
 * Run this to test the new API endpoints
 */

// Wait for server to be ready
setTimeout(async () => {
    console.log('🔧 Testing Study Edit API Endpoints...\n');

    const baseUrl = 'http://localhost:3003/api/research';
    
    // Test 1: Check if study can be edited
    try {
        const response1 = await fetch(`${baseUrl}?action=can-edit-study&id=1`);
        const result1 = await response1.json();
        console.log('✅ Test 1 - Can Edit Study (ID: 1):');
        console.log(JSON.stringify(result1, null, 2));
        console.log('');
    } catch (error) {
        console.error('❌ Test 1 Failed:', error);
    }

    // Test 2: Validate state transition
    try {
        const response2 = await fetch(`${baseUrl}?action=validate-state-transition&id=1&newStatus=active`);
        const result2 = await response2.json();
        console.log('✅ Test 2 - Validate State Transition (ID: 1, draft → active):');
        console.log(JSON.stringify(result2, null, 2));
        console.log('');
    } catch (error) {
        console.error('❌ Test 2 Failed:', error);
    }

    // Test 3: Try invalid state transition
    try {
        const response3 = await fetch(`${baseUrl}?action=validate-state-transition&id=1&newStatus=completed`);
        const result3 = await response3.json();
        console.log('✅ Test 3 - Invalid State Transition (ID: 1, draft → completed):');
        console.log(JSON.stringify(result3, null, 2));
        console.log('');
    } catch (error) {
        console.error('❌ Test 3 Failed:', error);
    }

    // Test 4: Check edit permissions for study ID 2 (should be draft)
    try {
        const response4 = await fetch(`${baseUrl}?action=can-edit-study&id=2`);
        const result4 = await response4.json();
        console.log('✅ Test 4 - Can Edit Study (ID: 2):');
        console.log(JSON.stringify(result4, null, 2));
        console.log('');
    } catch (error) {
        console.error('❌ Test 4 Failed:', error);
    }

    console.log('🎉 API Testing Complete!');
}, 2000);
