import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wxpwxzdgdvinlbtnbgdf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4cHd4emRnZHZpbmxidG5iZ2RmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAxOTk1ODAsImV4cCI6MjA2NTc3NTU4MH0.YMai9p4VQMbdqmc_9uWGeJ6nONHwuM9XT2FDTFy0aGk';

async function testStudyCreation() {
  console.log('🧪 Testing Study Creation API...');

  const supabase = createClient(supabaseUrl, supabaseKey);
  
  // Login as researcher
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'abwanwr77+researcher@gmail.com',
    password: 'Testtest123'
  });

  if (authError) {
    console.error('❌ Login failed:', authError);
    return;
  }

  console.log('✅ Researcher login successful');
  console.log('✅ User ID:', authData.user.id);

  // Test study creation
  const studyData = {
    title: 'API Test Study - ' + new Date().toISOString(),
    description: 'This is a test study created via direct API call',
    type: 'usability',
    settings: {
      maxParticipants: 5,
      duration: 20,
      compensation: 15,
      recording: { screen: true, audio: false, webcam: false }
    },
    status: 'active',
    tasks: []
  };

  try {
    console.log('📝 Creating study with data:', JSON.stringify(studyData, null, 2));
    
    const response = await fetch('http://localhost:3003/api/studies', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authData.session.access_token}`
      },
      body: JSON.stringify(studyData)
    });

    const result = await response.json();
    
    console.log('📊 Study Creation Response Status:', response.status);
    console.log('📊 Study Creation Response:', JSON.stringify(result, null, 2));

    if (result.success) {
      console.log('✅ Study created successfully!');
      const studyId = result.study?.id || result.study?._id;
      console.log('✅ Study ID:', studyId);
      
      // Verify it was saved to database
      const { data: savedStudy, error: fetchError } = await supabase
        .from('studies')
        .select('*')
        .eq('id', studyId)
        .single();

      if (savedStudy) {
        console.log('✅ Study verified in database!');
        console.log('✅ Database record:', JSON.stringify(savedStudy, null, 2));
      } else {
        console.log('❌ Study not found in database:', fetchError);
      }

    } else {
      console.log('❌ Study creation failed:', result.error);
    }

  } catch (error) {
    console.error('❌ API call failed:', error);
  }
}

testStudyCreation();
