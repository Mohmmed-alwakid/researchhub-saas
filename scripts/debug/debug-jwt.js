import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wxpwxzdgdvinlbtnbgdf.supabase.co';
const supabaseKey = ''PLACEHOLDER_SUPABASE_SERVICE_ROLE_KEY'';

// Sample JWT token from the test (trimmed for safety)
const sampleToken = ''PLACEHOLDER_SUPABASE_SERVICE_ROLE_KEY'';

async function debugJWT() {
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  console.log('🔍 Testing JWT token parsing...');
  
  try {
    const { data: { user }, error } = await supabase.auth.getUser(sampleToken);
    
    console.log('Auth result:', { user, error });
    
    if (user) {
      console.log('User ID:', user.id);
      console.log('User email:', user.email);
      console.log('User metadata:', user.user_metadata);
    }
    
    if (error) {
      console.log('Auth error:', error);
    }
    
    // Try to get profile
    if (user) {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      console.log('Profile result:', { profile, profileError });
    }
    
  } catch (error) {
    console.error('Test error:', error);
  }
}

debugJWT();
