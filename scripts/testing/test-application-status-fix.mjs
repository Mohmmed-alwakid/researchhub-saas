import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wxpwxzdgdvinlbtnbgdf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4cHd4emRnZHZpbmxidG5iZ2RmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAxOTk1ODAsImV4cCI6MjA2NTc3NTU4MH0.YMai9p4VQMbdqmc_9uWGeJ6nONHwuM9XT2FDTFy0aGk';

async function testApplicationStatusFix() {
  console.log('🧪 Testing Application Status API Fix...');

  const supabase = createClient(supabaseUrl, supabaseKey);
  
  // Login as participant
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'abwanwr77+participant@gmail.com',
    password: 'Testtest123'
  });

  if (authError) {
    console.error('❌ Login failed:', authError);
    return;
  }

  console.log('✅ Login successful');

  // Test the fixed endpoint
  const studyId = '2fd69681-3a09-49c5-b110-a06d8834aee8';
  
  try {
    const response = await fetch(`http://localhost:3003/api/applications?endpoint=applications/status/${studyId}`, {
      headers: {
        'Authorization': `Bearer ${authData.session.access_token}`
      }
    });

    const result = await response.json();
    
    console.log('📊 API Response Status:', response.status);
    console.log('📊 API Response:', JSON.stringify(result, null, 2));

    if (result.success && result.data.hasApplied) {
      console.log('✅ FIX SUCCESSFUL: API now correctly reports hasApplied: true');
      console.log('✅ Application details:', result.data.application);
    } else {
      console.log('❌ Fix may need more work:', result);
    }

  } catch (error) {
    console.error('❌ API call failed:', error);
  }
}

testApplicationStatusFix();
