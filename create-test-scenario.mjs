import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wxpwxzdgdvinlbtnbgdf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4cHd4emRnZHZpbmxidG5iZ2RmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAxOTk1ODAsImV4cCI6MjA2NTc3NTU4MH0.YMai9p4VQMbdqmc_9uWGeJ6nONHwuM9XT2FDTFy0aGk';

const supabase = createClient(supabaseUrl, supabaseKey);

async function createCompleteTestScenario() {
  console.log('🧪 Creating complete test scenario for study session flow...\n');

  try {
    // Step 1: Login as participant to get their user ID
    console.log('📝 Step 1: Get participant user ID...');
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'abwanwr77+participant@gmail.com',
      password: 'Testtest123'
    });

    if (authError) {
      console.error('❌ Auth error:', authError);
      return;
    }

    const participantId = authData.user.id;
    const authToken = authData.session.access_token;
    console.log('✅ Participant ID:', participantId);

    // Step 2: Get an available study
    console.log('\n📝 Step 2: Find available study...');
    const { data: studies, error: studiesError } = await supabase
      .from('studies')
      .select('*')
      .eq('status', 'active')
      .limit(1);

    if (studiesError || !studies || studies.length === 0) {
      console.log('⚠️ No active studies found, using first available study...');
      const { data: allStudies, error: allError } = await supabase
        .from('studies')
        .select('*')
        .limit(1);
      
      if (allError || !allStudies || allStudies.length === 0) {
        console.error('❌ No studies found at all');
        return;
      }
      studies[0] = allStudies[0];
    }

    const studyId = studies[0].id;
    console.log('✅ Found study:', { id: studyId, title: studies[0].title });

    // Step 3: Create application for this study
    console.log('\n📝 Step 3: Create application...');
    let application;
    const { data: newApplication, error: appError } = await supabase
      .from('study_applications')
      .insert({
        study_id: studyId,
        participant_id: participantId,
        status: 'pending',
        application_data: {
          motivation: 'Testing the study session flow',
          experience: 'Previous testing experience'
        },
        applied_at: new Date().toISOString()
      })
      .select()
      .single();

    if (appError) {
      console.error('❌ Application creation error:', appError);
      
      // Check if application already exists
      const { data: existingApp, error: checkError } = await supabase
        .from('study_applications')
        .select('*')
        .eq('study_id', studyId)
        .eq('participant_id', participantId)
        .single();

      if (existingApp) {
        console.log('✅ Application already exists:', existingApp);
        application = existingApp;
      } else {
        console.error('❌ Could not create or find application');
        return;
      }
    } else {
      console.log('✅ Application created:', newApplication.id);
      application = newApplication;
    }

    // Step 4: Approve the application
    console.log('\n📝 Step 4: Approve application...');
    const { data: approvedApp, error: approveError } = await supabase
      .from('study_applications')
      .update({ 
        status: 'approved',
        reviewed_at: new Date().toISOString()
      })
      .eq('id', application.id)
      .select()
      .single();

    if (approveError) {
      console.error('❌ Approval error:', approveError);
      
      // Try different status values
      console.log('🔄 Trying different status values...');
      const statusOptions = ['accepted', 'approved', 'active'];
      
      for (const status of statusOptions) {
        const { data: testUpdate, error: testError } = await supabase
          .from('study_applications')
          .update({ status })
          .eq('id', application.id)
          .select();
          
        if (!testError) {
          console.log(`✅ Successfully updated status to: ${status}`);
          break;
        } else {
          console.log(`❌ Status '${status}' failed:`, testError.message);
        }
      }
    } else {
      console.log('✅ Application approved successfully');
    }

    // Step 5: Test the study session API
    console.log('\n📝 Step 5: Test study session API...');
    
    // Create authenticated supabase client
    const authSupabase = createClient(supabaseUrl, supabaseKey);
    await authSupabase.auth.setSession({
      access_token: authToken,
      refresh_token: authData.session.refresh_token
    });

    // Test the blocks API getStudySession endpoint
    const response = await fetch('http://localhost:3003/api/blocks?action=getStudySession', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        studyId: studyId
      })
    });

    const sessionData = await response.json();
    console.log('📊 Session API Response:', JSON.stringify(sessionData, null, 2));

    if (sessionData.success) {
      console.log('\n🎉 SUCCESS! Study session flow is working!');
      console.log('✅ Session ID:', sessionData.data.sessionId);
      console.log('✅ Study blocks:', sessionData.data.blocks.length);
      console.log('✅ Study title:', sessionData.data.study.title);
    } else {
      console.log('\n❌ Study session API failed:', sessionData.error);
    }

    // Step 6: Test saving a block response
    if (sessionData.success && sessionData.data.blocks.length > 0) {
      console.log('\n📝 Step 6: Test saving block response...');
      
      const firstBlock = sessionData.data.blocks[0];
      const responseData = {
        sessionId: sessionData.data.sessionId,
        blockId: firstBlock.id,
        blockType: firstBlock.type,
        response: {
          acknowledged: true,
          startTime: new Date().toISOString()
        },
        timeSpent: 5
      };

      const saveResponse = await fetch('http://localhost:3003/api/blocks?action=response', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify(responseData)
      });

      const saveResult = await saveResponse.json();
      console.log('💾 Save Response Result:', JSON.stringify(saveResult, null, 2));
      
      if (saveResult.success) {
        console.log('✅ Block response saved successfully!');
      } else {
        console.log('❌ Block response save failed:', saveResult.error);
      }
    }

    console.log('\n🏁 Test scenario creation complete!');
    
  } catch (error) {
    console.error('❌ Test scenario failed:', error);
  }
}

createCompleteTestScenario();
