import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wxpwxzdgdvinlbtnbgdf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4cHd4emRnZHZpbmxidG5iZ2RmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAxOTk1ODAsImV4cCI6MjA2NTc3NTU4MH0.YMai9p4VQMbdqmc_9uWGeJ6nONHwuM9XT2FDTFy0aGk';

const token = 'eyJhbGciOiJIUzI1NiIsImtpZCI6ImtNTk9JUFUzZGs1VUZiSzAiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL3d4cHd4emRnZHZpbmxidG5iZ2RmLnN1cGFiYXNlLmNvL2F1dGgvdjEiLCJzdWIiOiI0YzNkNzk4Yi0yOTc1LTRlYzQtYjllMi1jNmYxMjhiOGEwNjYiLCJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNzUwODA1MDA0LCJpYXQiOjE3NTA4MDE0MDQsImVtYWlsIjoiYWJ3YW53cjc3K3Jlc2VhcmNoZXJAZ21haWwuY29tIiwicGhvbmUiOiIiLCJhcHBfbWV0YWRhdGEiOnsicHJvdmlkZXIiOiJlbWFpbCIsInByb3ZpZGVycyI6WyJlbWFpbCJdfSwidXNlcl9tZXRhZGF0YSI6eyJlbWFpbCI6ImFid2Fud3I3NytyZXNlYXJjaGVyQGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJmaXJzdF9uYW1lIjoiUmVzZWFyY2hlciIsImxhc3RfbmFtZSI6InRlc3RlciIsInBob25lX3ZlcmlmaWVkIjpmYWxzZSwicm9sZSI6InJlc2VhcmNoZXIiLCJzdWIiOiI0YzNkNzk4Yi0yOTc1LTRlYzQtYjllMi1jNmYxMjhiOGEwNjYifSwicm9sZSI6ImF1dGhlbnRpY2F0ZWQiLCJhYWwiOiJhYWwxIiwiYW1yIjpbeyJtZXRob2QiOiJwYXNzd29yZCIsInRpbWVzdGFtcCI6MTc1MDgwMTQwNH1dLCJzZXNzaW9uX2lkIjoiNmE1NzQ0OWItZGM3NC00YjgxLTgwY2YtMjUxODA2MDkzYzU0IiwiaXNfYW5vbnltb3VzIjpmYWxzZX0.IKOwgHqoxZXCQHS36OkT2JS-_LqzX7XebIjXSOPxJ5I';

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
