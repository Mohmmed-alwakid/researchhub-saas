import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wxpwxzdgdvinlbtnbgdf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4cHd4emRnZHZpbmxidG5iZ2RmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAxOTk1ODAsImV4cCI6MjA2NTc3NTU4MH0.YMai9p4VQMbdqmc_9uWGeJ6nONHwuM9XT2FDTFy0aGk';

// Sample JWT token from the test (trimmed for safety)
const sampleToken = 'eyJhbGciOiJIUzI1NiIsImtpZCI6ImtNTk9JUFUzZGs1VUZiSzAiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL3d4cHd4emRnZHZpbmxidG5iZ2RmLnN1cGFiYXNlLmNvL2F1dGgvdjEiLCJzdWIiOiI5ODc2Yzg3MC03OWU5LTQxMDYtOTlkNi05MDgwMDQ5ZWMyYWEiLCJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNzUwNTUzMTk2LCJpYXQiOjE3NTA1NDk1OTYsImVtYWlsIjoiYWJ3YW53cjc3K3BhcnRpY2lwYW50QGdtYWlsLmNvbSIsInBob25lIjoiIiwiYXBwX21ldGFkYXRhIjp7InByb3ZpZGVyIjoiZW1haWwiLCJwcm92aWRlcnMiOlsiZW1haWwiXX0sInVzZXJfbWV0YWRhdGEiOnsiZW1haWwiOiJhYndhbndyNzcrcGFydGljaXBhbnRAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsImZpcnN0X25hbWUiOiJwYXJ0aWNpcGFudCIsImxhc3RfbmFtZSI6InRlc3RlciIsInBob25lX3ZlcmlmaWVkIjpmYWxzZSwicm9sZSI6InBhcnRpY2lwYW50Iiwic3ViIjoiOTg3NmM4NzAtNzllOS00MTA2LTk5ZDYtOTA4MDA0OWVjMmFhIn0sInJvbGUiOiJhdXRoZW50aWNhdGVkIiwiYWFsIjoiYWFsMSIsImFtciI6W3sibWV0aG9kIjoicGFzc3dvcmQiLCJ0aW1lc3RhbXAiOjE3NTA1NDk1OTZ9XSwic2Vzc2lvbl9pZCI6Ijk0M2QxNDkxLWNmYjEtNGMwNC1hNGNhLWZmODY5MzQ5MGI4MCIsImlzX2Fub255bW91cyI6ZmFsc2V9.YKSJVfQrH82IJCNB2T8EPViRnfikLYbbZSDN6uUTW4UM';

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
