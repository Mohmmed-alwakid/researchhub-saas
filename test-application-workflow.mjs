import fetch from 'node-fetch';

const API_BASE = 'http://localhost:3003/api';
const STUDY_ID = '2fd69681-3a09-49c5-b110-a06d8834aee8'; // Test New Application Study

let authToken = null;

async function testApplicationWorkflow() {
  console.log('🎯 TESTING APPLICATION SUBMISSION WORKFLOW\n');
  
  try {
    // Step 1: Login as participant
    console.log('🔐 Step 1: Logging in as participant...');
    
    const loginResponse = await fetch(`${API_BASE}/auth?action=login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'abwanwr77+participant@gmail.com',
        password: 'Testtest123'
      })
    });
    
    const loginData = await loginResponse.json();
    console.log('📊 Login response:', JSON.stringify(loginData, null, 2));
    
    if (!loginData.success || !loginData.session?.access_token) {
      console.error('❌ Login failed');
      return;
    }
    
    authToken = loginData.session.access_token;
    console.log(`✅ Login successful! Token: ${authToken.substring(0, 20)}...\n`);
    
    // Step 2: Check current application status
    console.log('🔍 Step 2: Checking current application status...');
    
    const statusResponse = await fetch(`${API_BASE}/applications?endpoint=applications/status/${STUDY_ID}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    const statusData = await statusResponse.json();
    console.log('📊 Status response:', JSON.stringify(statusData, null, 2));
    
    // Step 3: Try to submit application
    console.log('\n📝 Step 3: Attempting to submit application...');
    
    const applicationResponse = await fetch(`${API_BASE}/applications?endpoint=studies/${STUDY_ID}/apply`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        screeningResponses: []
      })
    });
    
    const applicationData = await applicationResponse.json();
    console.log('📊 Application submission response:');
    console.log(`   Status: ${applicationResponse.status}`);
    console.log(`   Data:`, JSON.stringify(applicationData, null, 2));
    
    if (applicationData.success) {
      console.log('✅ Application submitted successfully!');
    } else {
      console.log(`❌ Application submission failed: ${applicationData.error}`);
      if (applicationData.details) {
        console.log(`   Details: ${applicationData.details}`);
      }
    }
    
    // Step 4: Check status again after submission
    console.log('\n🔍 Step 4: Checking application status after submission...');
    
    const finalStatusResponse = await fetch(`${API_BASE}/applications?endpoint=applications/status/${STUDY_ID}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    const finalStatusData = await finalStatusResponse.json();
    console.log('📊 Final status response:', JSON.stringify(finalStatusData, null, 2));
    
    // Step 5: Check applications table directly
    console.log('\n🗄️ Step 5: Direct database check (for comparison)...');
    
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(
      'https://wxpwxzdgdvinlbtnbgdf.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4cHd4emRnZHZpbmxidG5iZ2RmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAxOTk1ODAsImV4cCI6MjA2NTc3NTU4MH0.YMai9p4VQMbdqmc_9uWGeJ6nONHwuM9XT2FDTFy0aGk'
    );
    
    const { data: dbApplications, error: dbError } = await supabase
      .from('study_applications')
      .select('*')
      .eq('study_id', STUDY_ID);
    
    if (dbError) {
      console.log('❌ Database check error:', dbError);
    } else {
      console.log(`📋 Database shows ${dbApplications.length} applications for this study`);
      if (dbApplications.length > 0) {
        console.log('   Applications:', JSON.stringify(dbApplications, null, 2));
      }
    }
    
  } catch (error) {
    console.error('❌ Workflow test error:', error);
  }
}

testApplicationWorkflow();
