import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wxpwxzdgdvinlbtnbgdf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4cHd4emRnZHZpbmxidG5iZ2RmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAxOTk1ODAsImV4cCI6MjA2NTc3NTU4MH0.YMai9p4VQMbdqmc_9uWGeJ6nONHwuM9XT2FDTFy0aGk';

async function testMyApplicationsAPI() {
  console.log('🧪 Testing My Applications API...');

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

  // Test the my-applications endpoint
  try {
    const response = await fetch(`http://localhost:3003/api/applications?endpoint=applications/my-applications`, {
      headers: {
        'Authorization': `Bearer ${authData.session.access_token}`
      }
    });

    const result = await response.json();
    
    console.log('📊 My Applications API Response Status:', response.status);
    console.log('📊 My Applications API Response:', JSON.stringify(result, null, 2));

    if (result.success && result.data?.applications?.length > 0) {
      console.log('✅ My Applications API working correctly');
      console.log(`✅ Found ${result.data.applications.length} applications`);
    } else {
      console.log('❌ My Applications API not returning expected data');
    }

  } catch (error) {
    console.error('❌ API call failed:', error);
  }
}

testMyApplicationsAPI();
