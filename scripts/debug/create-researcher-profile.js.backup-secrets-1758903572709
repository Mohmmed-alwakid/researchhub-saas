import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wxpwxzdgdvinlbtnbgdf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4cHd4emRnZHZpbmxidG5iZ2RmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAxOTk1ODAsImV4cCI6MjA2NTc3NTU4MH0.YMai9p4VQMbdqmc_9uWGeJ6nONHwuM9XT2FDTFy0aGk';

// Note: This would require the service role key to bypass RLS
// For now, let's use the anon key and see what error we get
const supabase = createClient(supabaseUrl, supabaseKey);

const researcherProfile = {
  id: '4c3d798b-2975-4ec4-b9e2-c6f128b8a066',
  email: 'abwanwr77+researcher@gmail.com',
  first_name: 'Researcher',
  last_name: 'tester',
  role: 'researcher',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

async function createResearcherProfile() {
  console.log('🔧 Manually creating researcher profile...');
  console.log('Profile data:', researcherProfile);
  
  try {
    const { data, error } = await supabase
      .from('profiles')
      .insert(researcherProfile);
    
    console.log('Insert result:');
    console.log('Data:', data);
    console.log('Error:', error);
    
    if (error) {
      console.log('❌ Failed to create profile');
      console.log('Error details:', error);
      
      // Try to understand the RLS policy issue
      console.log('\n🔍 Checking RLS policies...');
      console.log('Possible issues:');
      console.log('1. RLS is enabled on profiles table');
      console.log('2. No policy allows anonymous inserts');
      console.log('3. Need service role key to bypass RLS');
      
    } else {
      console.log('✅ Profile created successfully!');
    }
    
  } catch (error) {
    console.error('❌ Create profile failed:', error);
  }
}

createResearcherProfile();
