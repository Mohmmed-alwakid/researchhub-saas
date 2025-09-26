/**
 * Manual Test Application Creator
 * Creates a test application in approved state for testing study sessions
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wxpwxzdgdvinlbtnbgdf.supabase.co';
const supabaseKey = ''PLACEHOLDER_SUPABASE_SERVICE_ROLE_KEY'';

const PARTICIPANT_EMAIL = 'abwanwr77+participant@gmail.com';
const PARTICIPANT_PASSWORD = 'Testtest123';

async function createApprovedApplication() {
  console.log('🚀 Creating approved application for testing...');
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  try {
    // Step 1: Login as participant to get user ID
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: PARTICIPANT_EMAIL,
      password: PARTICIPANT_PASSWORD
    });
    
    if (authError) {
      throw new Error(`Login failed: ${authError.message}`);
    }
    
    const participantId = authData.user.id;
    console.log(`✅ Participant ID: ${participantId}`);
    
    // Step 2: Get available studies
    const { data: studies, error: studiesError } = await supabase
      .from('studies')
      .select('id, title, status')
      .eq('status', 'active')
      .limit(5);
    
    if (studiesError) {
      throw new Error(`Failed to fetch studies: ${studiesError.message}`);
    }
    
    console.log(`✅ Found ${studies?.length || 0} active studies`);
    if (studies && studies.length > 0) {
      console.log('Available studies:');
      studies.forEach(study => {
        console.log(`  - ${study.title} (${study.id})`);
      });
    }
    
    if (!studies || studies.length === 0) {
      throw new Error('No active studies found');
    }
    
    const targetStudy = studies[0];
    console.log(`🎯 Using study: ${targetStudy.title}`);
    
    // Step 3: Check if application already exists
    const { data: existingApp, error: checkError } = await supabase
      .from('study_applications')
      .select('*')
      .eq('study_id', targetStudy.id)
      .eq('participant_id', participantId)
      .single();
    
    if (checkError && checkError.code !== 'PGRST116') {
      console.log('Error checking existing application:', checkError);
    }
    
    if (existingApp) {
      console.log(`✅ Application already exists with status: ${existingApp.status}`);
      
      if (existingApp.status !== 'accepted') {
        // Update to accepted
        const { error: updateError } = await supabase
          .from('study_applications')
          .update({ status: 'accepted', updated_at: new Date().toISOString() })
          .eq('id', existingApp.id);
          
        if (updateError) {
          throw new Error(`Failed to update application: ${updateError.message}`);
        }
        
        console.log('✅ Updated application status to accepted');
      }
      
      return {
        applicationId: existingApp.id,
        studyId: targetStudy.id,
        participantId: participantId,
        status: 'accepted'
      };
    }
    
    // Step 4: Create new approved application
    const applicationData = {
      study_id: targetStudy.id,
      participant_id: participantId,
      status: 'accepted', // Create it already approved for testing
      application_data: {
        experience: 'Test participant with experience in usability testing',
        availability: 'Available for testing',
        motivation: 'Interested in contributing to research'
      },
      applied_at: new Date().toISOString(),
      reviewed_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    const { data: newApp, error: createError } = await supabase
      .from('study_applications')
      .insert(applicationData)
      .select()
      .single();
    
    if (createError) {
      throw new Error(`Failed to create application: ${createError.message}`);
    }
    
    console.log('✅ Created approved application successfully!');
    
    return {
      applicationId: newApp.id,
      studyId: targetStudy.id,
      participantId: participantId,
      status: 'accepted'
    };
    
  } catch (error) {
    console.error('❌ Failed to create approved application:', error);
    throw error;
  }
}

// Test the application creation
createApprovedApplication().then(result => {
  console.log('\n🎉 Success! Test application details:');
  console.log(result);
}).catch(console.error);
