// Test file for API Development prompt validation
// This file should trigger api-development.md prompt
// Expected: Copilot should enforce 12-function limit and consolidated patterns

// Test 1: API handler structure
// Copilot should suggest action-based routing pattern
export default async function testHandler(req, res) {
  try {
    const { action } = req.query;
    
    switch (action) {
      // Copilot should suggest action cases following ResearchHub patterns
      case 'get-studies':
        return await // Should suggest proper action handler call
        
      case 'create-study':
        // Should suggest study creation pattern with validation
        
      default:
        // Should suggest proper error response pattern
        
    }
  } catch (error) {
    // Copilot should suggest consistent error handling pattern
    
  }
}

// Test 2: Authentication middleware
// Copilot should suggest the authenticateUser pattern
async function protectedEndpoint(req, res) {
  const auth = await // Should suggest authenticateUser call with roles
  
  if (!auth.success) {
    // Should suggest proper auth error response
    
  }
  
  // Should proceed with authenticated logic
}

// Test 3: Supabase operations
// Copilot should suggest proper database patterns
async function getUserStudies(userId) {
  const { data, error } = await supabase
    .from('studies')
    .select(// Should suggest proper select with joins
    
    // Should suggest proper RLS-aware filtering
    
  if (error) {
    // Should suggest proper error handling
    
  }
  
  return data;
}

// Test 4: Input validation
// Copilot should suggest validation patterns
function validateStudyInput(studyData) {
  const errors = [];
  
  // Copilot should suggest comprehensive validation checks
  if (!studyData.title?.trim()) {
    
  }
  
  // Should suggest more validation rules
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

// Test 5: Rate limiting
// Copilot should suggest rate limiting implementation
function checkApiRateLimit(userId, action) {
  // Should suggest rate limiting logic
  
}

// Test 6: NEVER CREATE NEW API FUNCTION test
// Copilot should warn against creating new functions
// and suggest extending existing consolidated handlers
const shouldNotCreateNewFunction = () => {
  // This should trigger warnings about 12-function limit
  
};