import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wxpwxzdgdvinlbtnbgdf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4cHd4emRnZHZpbmxidG5iZ2RmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAxOTk1ODAsImV4cCI6MjA2NTc3NTU4MH0.YMai9p4VQMbdqmc_9uWGeJ6nONHwuM9XT2FDTFy0aGk';

async function testResearcherWorkflow() {
  console.log('🧪 Testing Complete Researcher Workflow...');

  const supabase = createClient(supabaseUrl, supabaseKey);
  
  // Step 1: Login as researcher
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'abwanwr77+researcher@gmail.com',
    password: 'Testtest123'
  });

  if (authError) {
    console.error('❌ Login failed:', authError);
    return;
  }

  console.log('✅ Researcher login successful');
  console.log('✅ Researcher ID:', authData.user.id);

  // Step 2: Create a new study owned by this researcher
  const studyData = {
    title: 'Researcher Workflow Test Study - ' + new Date().toISOString(),
    description: 'Test study for researcher approval workflow',
    type: 'usability',
    settings: {
      maxParticipants: 3,
      duration: 15,
      compensation: 10,
      recording: { screen: true, audio: false, webcam: false }
    },
    status: 'active',
    tasks: []
  };

  console.log('📝 Creating new study owned by researcher...');
  
  const createResponse = await fetch('http://localhost:3003/api/studies', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authData.session.access_token}`
    },
    body: JSON.stringify(studyData)
  });

  const createResult = await createResponse.json();
  
  if (!createResult.success) {
    console.error('❌ Study creation failed:', createResult.error);
    return;
  }

  const newStudyId = createResult.study._id;
  console.log('✅ New study created successfully!');
  console.log('✅ Study ID:', newStudyId);

  // Step 3: Switch to participant and apply to this study
  console.log('\n🔄 Switching to participant workflow...');
  
  const { data: participantAuth, error: participantError } = await supabase.auth.signInWithPassword({
    email: 'abwanwr77+participant@gmail.com',
    password: 'Testtest123'
  });

  if (participantError) {
    console.error('❌ Participant login failed:', participantError);
    return;
  }

  console.log('✅ Participant login successful');

  // Apply to the study
  const applicationData = {
    screeningResponses: [
      {
        questionId: 'test_question_1',
        question: 'Why are you interested?',
        answer: 'Testing the researcher workflow'
      }
    ]
  };

  console.log('📝 Submitting application to new study...');
  
  const applyResponse = await fetch(`http://localhost:3003/api/applications?endpoint=studies/${newStudyId}/apply`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${participantAuth.session.access_token}`
    },
    body: JSON.stringify(applicationData)
  });

  const applyResult = await applyResponse.json();
  
  if (!applyResult.success) {
    console.error('❌ Application failed:', applyResult.error);
    return;
  }

  console.log('✅ Application submitted successfully!');
  console.log('✅ Application ID:', applyResult.data._id);

  // Step 4: Switch back to researcher and check applications
  console.log('\n🔄 Switching back to researcher to approve application...');
  
  const { data: researcherAuth2, error: researcherError2 } = await supabase.auth.signInWithPassword({
    email: 'abwanwr77+researcher@gmail.com',
    password: 'Testtest123'
  });

  if (researcherError2) {
    console.error('❌ Researcher login failed:', researcherError2);
    return;
  }

  // Get applications for the study
  console.log('📋 Getting applications for researcher study...');
  
  const appsResponse = await fetch(`http://localhost:3003/api/applications?endpoint=study/${newStudyId}/applications`, {
    headers: {
      'Authorization': `Bearer ${researcherAuth2.session.access_token}`
    }
  });

  const appsResult = await appsResponse.json();
  
  console.log('📊 Applications Response Status:', appsResponse.status);
  console.log('📊 Applications Response:', JSON.stringify(appsResult, null, 2));

  if (appsResult.success && appsResult.data?.applications?.length > 0) {
    console.log('🎉 SUCCESS! Researcher can see applications for their study!');
    console.log(`✅ Found ${appsResult.data.applications.length} applications`);
    
    // Try to approve the application
    const applicationId = appsResult.data.applications[0]._id;
    console.log('✅ Attempting to approve application:', applicationId);
    
    const approveResponse = await fetch(`http://localhost:3003/api/applications?endpoint=applications/${applicationId}/review`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${researcherAuth2.session.access_token}`
      },
      body: JSON.stringify({
        status: 'approved',
        notes: 'Approved for testing purposes'
      })
    });

    const approveResult = await approveResponse.json();
    
    console.log('📊 Approval Response Status:', approveResponse.status);
    console.log('📊 Approval Response:', JSON.stringify(approveResult, null, 2));

    if (approveResult.success) {
      console.log('🎉 APPLICATION APPROVED SUCCESSFULLY!');
      console.log('✅ Complete researcher workflow is now functional!');
    }

  } else {
    console.log('❌ Researcher cannot see applications for their study');
  }
}

testResearcherWorkflow();
