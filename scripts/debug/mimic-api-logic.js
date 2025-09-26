import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wxpwxzdgdvinlbtnbgdf.supabase.co';
const supabaseKey = 'process.env.SUPABASE_SERVICE_ROLE_KEY || 'your_supabase_service_role_key_here'';

const token = 'process.env.SUPABASE_SERVICE_ROLE_KEY || 'your_supabase_service_role_key_here'';

async function mimicAPILogic() {
  console.log('🔍 Mimicing researcher-applications API logic...');
  
  try {
    // Step 1: Create authenticated Supabase client (exactly like API)
    const authenticatedSupabase = createClient(supabaseUrl, supabaseKey, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    });
    
    // Step 2: Decode JWT token (exactly like API)
    const tokenParts = token.split('.');
    if (tokenParts.length !== 3) {
      throw new Error('Invalid JWT format');
    }
    
    const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString());
    console.log('🔍 JWT payload:', payload);
    
    const userId = payload.sub;
    const userEmail = payload.email;
    
    if (!userId || !userEmail) {
      throw new Error('Invalid user data in token');
    }
    
    console.log('🔍 Extracted user:', userId, userEmail);
    
    // Step 3: Verify user has researcher or admin role (exactly like API)
    const { data: profile, error: profileError } = await authenticatedSupabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();
    
    console.log('🔍 Profile query result:', { profile, profileError });
    
    if (profileError || !profile || !['researcher', 'admin'].includes(profile.role)) {
      console.error('❌ Role verification failed:', { profileError, profile, expectedRoles: ['researcher', 'admin'] });
      console.log('Would return 403 error here');
      return;
    }
    
    console.log('✅ Role verified:', profile.role);
    console.log('✅ Authentication would succeed in API');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

mimicAPILogic();
