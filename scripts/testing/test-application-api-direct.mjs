import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wxpwxzdgdvinlbtnbgdf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4cHd4emRnZHZpbmxidG5iZ2RmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAxOTk1ODAsImV4cCI6MjA2NTc3NTU4MH0.YMai9p4VQMbdqmc_9uWGeJ6nONHwuM9XT2FDTFy0aGk';

async function testApplicationSubmission() {
  console.log('🧪 Testing application submission workflow...');

  // Step 1: Login as participant to get JWT token
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'abwanwr77+participant@gmail.com',
    password: 'Testtest123'
  });

  if (authError) {
    console.error('❌ Login failed:', authError);
    return;
  }

  console.log('✅ Login successful, user ID:', authData.user.id);
  console.log('✅ Access token available:', !!authData.session.access_token);

  // Step 2: Try to submit application via API endpoint
  const studyId = '2fd69681-3a09-49c5-b110-a06d8834aee8'; // Real study ID
  const applicationData = {
    screeningResponses: [
      {
        questionId: 'test_question_1',
        question: 'Why are you interested in this study?',
        answer: 'I want to help improve the user experience'
      }
    ]
  };

  console.log('📝 Submitting application to study:', studyId);
  
  try {
    const response = await fetch('http://localhost:3003/api/applications?endpoint=studies/' + studyId + '/apply', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authData.session.access_token}`
      },
      body: JSON.stringify(applicationData)
    });

    const result = await response.json();
    
    console.log('📊 API Response Status:', response.status);
    console.log('📊 API Response:', JSON.stringify(result, null, 2));

    if (result.success) {
      console.log('✅ Application submitted successfully!');
      
      // Step 3: Verify application was saved by checking with authenticated client
      const userSupabase = createClient(supabaseUrl, supabaseKey, {
        auth: {
          persistSession: false
        },
        global: {
          headers: {
            Authorization: `Bearer ${authData.session.access_token}`
          }
        }
      });

      const { data: applications, error: checkError } = await userSupabase
        .from('study_applications')
        .select('*')
        .eq('study_id', studyId)
        .eq('participant_id', authData.user.id);

      console.log('🔍 Verification check:', { applications, checkError });
      
    } else {
      console.log('❌ Application submission failed:', result.error);
    }

  } catch (error) {
    console.error('❌ API call failed:', error);
  }
}

testApplicationSubmission();
