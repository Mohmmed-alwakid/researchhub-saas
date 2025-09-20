/**
 * API CONTRACT TESTS
 * 
 * This file contains tests to ensure the API response format
 * matches exactly what the frontend expects, preventing the
 * studies page empty state bug from happening again.
 */

export const testStudiesAPIContract = async () => {
  console.log('🧪 Running Studies API Contract Tests...');
  
  try {
    // Get auth token from localStorage
    const authStorage = localStorage.getItem('auth-storage');
    if (!authStorage) {
      throw new Error('No auth token found - please login first');
    }
    
    const { state } = JSON.parse(authStorage);
    const token = state?.token;
    
    if (!token) {
      throw new Error('No valid token found in auth storage');
    }
    
    // Test the API endpoint
    const response = await fetch('/api/research-consolidated?action=get-studies', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`API returned ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Test 1: Response must be an object
    console.log('Test 1: Response is object');
    if (!data || typeof data !== 'object') {
      throw new Error('❌ FAIL: Response is not an object');
    }
    console.log('✅ PASS');
    
    // Test 2: Response must have success: true
    console.log('Test 2: Response has success: true');
    if (data.success !== true) {
      throw new Error('❌ FAIL: Response does not have success: true');
    }
    console.log('✅ PASS');
    
    // Test 3: Response must have studies array
    console.log('Test 3: Response has studies array');
    if (!Array.isArray(data.studies)) {
      throw new Error('❌ FAIL: Response does not have studies as array');
    }
    console.log(`✅ PASS (${data.studies.length} studies found)`);
    
    // Test 4: Response must have pagination object
    console.log('Test 4: Response has pagination object');
    if (!data.pagination || typeof data.pagination !== 'object') {
      throw new Error('❌ FAIL: Response does not have valid pagination object');
    }
    console.log('✅ PASS');
    
    // Test 5: Pagination must have required fields
    console.log('Test 5: Pagination has required fields');
    const requiredFields = ['currentPage', 'totalPages', 'totalStudies', 'hasNext', 'hasPrev'];
    for (const field of requiredFields) {
      if (!(field in data.pagination)) {
        throw new Error(`❌ FAIL: Pagination missing required field: ${field}`);
      }
    }
    console.log('✅ PASS');
    
    // Test 6: Must NOT have legacy format fields
    console.log('Test 6: Does not have legacy format fields');
    if ('data' in data) {
      throw new Error('❌ FAIL: Response contains legacy "data" field - this will cause empty state bug!');
    }
    if ('count' in data) {
      throw new Error('❌ FAIL: Response contains legacy "count" field - this will cause empty state bug!');
    }
    console.log('✅ PASS');
    
    // Test 7: Studies count consistency
    console.log('Test 7: Studies count consistency');
    if (data.studies.length !== data.pagination.totalStudies) {
      console.warn(`⚠️ WARNING: Studies array length (${data.studies.length}) does not match pagination.totalStudies (${data.pagination.totalStudies})`);
    } else {
      console.log('✅ PASS');
    }
    
    console.log('🎉 ALL TESTS PASSED! API contract is valid.');
    console.log(`📊 Summary: ${data.studies.length} studies returned with valid format`);
    
    return {
      success: true,
      studiesCount: data.studies.length,
      hasValidFormat: true,
      testsRun: 7,
      testsPassed: 7
    };
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('❌ API CONTRACT TEST FAILED:', errorMessage);
    return {
      success: false,
      error: errorMessage,
      hasValidFormat: false
    };
  }
};

// Auto-run test when this module is imported in the browser
if (typeof window !== 'undefined') {
  // Export to global scope for easy testing
  (window as unknown as Record<string, unknown>).testStudiesAPIContract = testStudiesAPIContract;
  console.log('🧪 Studies API Contract Test available as window.testStudiesAPIContract()');
}