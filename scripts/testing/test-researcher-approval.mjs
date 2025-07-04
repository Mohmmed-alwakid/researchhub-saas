import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wxpwxzdgdvinlbtnbgdf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4cHd4emRnZHZpbmxidG5iZ2RmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAxOTk1ODAsImV4cCI6MjA2NTc3NTU4MH0.YMai9p4VQMbdqmc_9uWGeJ6nONHwuM9XT2FDTFy0aGk';

async function testResearcherApprovalWorkflow() {
  console.log('🧪 Testing researcher approval workflow...');

  const studyId = '2fd69681-3a09-49c5-b110-a06d8834aee8';
  const applicationId = '3556e16c-50b0-4279-9831-39200739d632f'; // Corrected ID

  // Step 1: Login as researcher
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'abwanwr77+researcher@gmail.com',
    password: 'Testtest123'
  });

  if (authError) {
    console.error('❌ Researcher login failed:', authError);
    return;
  }

  console.log('✅ Researcher login successful, user ID:', authData.user.id);

  // Step 2: Try to get applications for the study
  console.log('📋 Getting applications for study...');
  
  try {
    const response = await fetch(`http://localhost:3003/api/applications?endpoint=study/${studyId}/applications`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authData.session.access_token}`
      }
    });

    const result = await response.json();
    
    console.log('📊 Get Applications Response Status:', response.status);
    console.log('📊 Get Applications Response:', JSON.stringify(result, null, 2));

    if (result.success && result.data?.applications?.length > 0) {
      console.log('✅ Found applications for study!');
      
      // Step 3: Try to approve the application
      console.log('✅ Attempting to approve application...');
      
      const approvalResponse = await fetch(`http://localhost:3003/api/applications?endpoint=applications/${applicationId}/review`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authData.session.access_token}`
        },
        body: JSON.stringify({
          status: 'approved',
          notes: 'Application approved for study participation'
        })
      });

      const approvalResult = await approvalResponse.json();
      
      console.log('📊 Approval Response Status:', approvalResponse.status);
      console.log('📊 Approval Response:', JSON.stringify(approvalResult, null, 2));

      if (approvalResult.success) {
        console.log('🎉 Application approved successfully!');
      } else {
        console.log('❌ Application approval failed:', approvalResult.error);
      }

    } else {
      console.log('❌ No applications found or error getting applications');
    }

  } catch (error) {
    console.error('❌ API call failed:', error);
  }
}

testResearcherApprovalWorkflow();
