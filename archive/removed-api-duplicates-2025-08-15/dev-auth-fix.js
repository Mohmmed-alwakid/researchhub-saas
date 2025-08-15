// Quick development authentication fix
// This bypasses Supabase for local development when network issues occur

export async function handleAuthAction(action, body) {
  console.log('=== DEVELOPMENT AUTH FIX ===');
  console.log('Action:', action);
  
  if (action === 'login') {
    const { email, password } = body;
    
    // Check against test accounts
    const testAccounts = {
      'abwanwr77+researcher@gmail.com': { 
        id: 'researcher-test', 
        role: 'researcher', 
        name: 'Test Researcher',
        password: 'Testtest123'
      },
      'abwanwr77+participant@gmail.com': { 
        id: 'participant-test', 
        role: 'participant', 
        name: 'Test Participant',
        password: 'Testtest123'
      },
      'abwanwr77+admin@gmail.com': { 
        id: 'admin-test', 
        role: 'admin', 
        name: 'Test Admin',
        password: 'Testtest123'
      }
    };
    
    const account = testAccounts[email];
    
    if (account && account.password === password) {
      console.log('✅ Local auth success for:', email);
      
      // Generate a fake JWT-like token for development
      const token = `dev-token-${account.id}-${Date.now()}`;
      const refreshToken = `dev-refresh-${account.id}-${Date.now()}`;
      
      return {
        success: true,
        data: {
          user: {
            id: account.id,
            email: email,
            role: account.role,
            name: account.name,
            created_at: new Date().toISOString(),
            email_confirmed_at: new Date().toISOString(),
            user_metadata: {
              name: account.name,
              role: account.role
            }
          },
          session: {
            access_token: token,
            refresh_token: refreshToken,
            expires_in: 3600,
            token_type: 'bearer'
          }
        }
      };
    }
    
    console.log('❌ Invalid credentials for:', email);
    return {
      success: false,
      error: 'Invalid credentials'
    };
  }
  
  if (action === 'verify') {
    // For development, just return success for any token
    return {
      success: true,
      data: {
        user: {
          id: 'dev-user',
          email: 'dev@example.com',
          role: 'researcher'
        }
      }
    };
  }
  
  return {
    success: false,
    error: 'Action not supported in development mode'
  };
}
