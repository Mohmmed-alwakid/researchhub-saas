import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wxpwxzdgdvinlbtnbgdf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4cHd4emRnZHZpbmxidG5iZ2RmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAxOTk1ODAsImV4cCI6MjA2NTc3NTU4MH0.YMai9p4VQMbdqmc_9uWGeJ6nONHwuM9XT2FDTFy0aGk';

async function debugStudySubmission() {
  console.log('=== Debug Study Submission ===');
  
  const studyId = '99a0f9b1-bdfe-46b8-961a-97dc3d29fb98';
  
  try {
    // First, verify the study exists directly in Supabase
    const supabase = createClient(supabaseUrl, supabaseKey);
    const { data: study, error: studyError } = await supabase
      .from('studies')
      .select('*')
      .eq('id', studyId)
      .single();

    if (studyError) {
      console.error('❌ Study lookup error:', studyError);
    } else {
      console.log('✅ Study found:', {
        id: study.id,
        title: study.title,
        status: study.status,
        is_public: study.is_public,
        researcher_id: study.researcher_id
      });
    }

    // Login as participant
    const loginResponse = await fetch('http://localhost:3003/api/auth?action=login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'abwanwr77+participant@gmail.com',
        password: 'Testtest123'
      })
    });

    const loginData = await loginResponse.json();
    
    if (!loginData.success) {
      console.error('❌ Login failed:', loginData.error);
      return;
    }

    const token = loginData.session.access_token;
    console.log('✅ Participant logged in successfully');

    // Try a simple GET request to the applications API first
    console.log('\n🔍 Testing API connectivity...');
    const testResponse = await fetch('http://localhost:3003/api/applications?endpoint=studies/public', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const testData = await testResponse.json();
    console.log('📡 API test response:', testData.success ? 'Success' : 'Failed');

    // Now try the application submission
    console.log('\n📝 Testing application submission...');
    const applicationData = {
      study_id: studyId,
      participant_answers: {
        screening_responses: [
          { question: 'Test question', answer: 'Test answer' }
        ]
      }
    };

    console.log('📋 Sending application data:', JSON.stringify(applicationData, null, 2));

    const submitResponse = await fetch('http://localhost:3003/api/applications?action=submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(applicationData)
    });

    const submitResult = await submitResponse.json();
    console.log('📤 Submit response:', JSON.stringify(submitResult, null, 2));

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

debugStudySubmission();
