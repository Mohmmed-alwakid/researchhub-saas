/**
 * RESEARCHER APPLICATION MANAGEMENT ENHANCEMENT TEST
 * Test current functionality and identify improvement opportunities
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wxpwxzdgdvinlbtnbgdf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4cHd4emRnZHZpbmxidG5iZ2RmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAxOTk1ODAsImV4cCI6MjA2NTc3NTU4MH0.YMai9p4VQMbdqmc_9uWGeJ6nONHwuM9XT2FDTFy0aGk';
const API_BASE = 'http://localhost:3003/api';

async function testResearcherApplicationManagement() {
  console.log('🎯 TESTING RESEARCHER APPLICATION MANAGEMENT');
  console.log('=' .repeat(60));

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // Step 1: Login as researcher
    console.log('\n📝 STEP 1: RESEARCHER LOGIN');
    const { data: researcherAuth, error: researcherError } = await supabase.auth.signInWithPassword({
      email: 'abwanwr77+researcher@gmail.com',
      password: 'Testtest123'
    });

    if (researcherError) {
      console.error('❌ Researcher login failed:', researcherError);
      return;
    }

    console.log('✅ Researcher logged in successfully');

    // Step 2: Get researcher's studies
    console.log('\n📚 STEP 2: GET RESEARCHER STUDIES');
    const studiesResponse = await fetch(`${API_BASE}/studies`, {
      headers: {
        'Authorization': `Bearer ${researcherAuth.session.access_token}`
      }
    });

    const studiesResult = await studiesResponse.json();
    
    console.log('📊 Studies Response Status:', studiesResponse.status);
    console.log('📊 Studies Result:', JSON.stringify(studiesResult, null, 2));
    
    if (!studiesResult.success || !studiesResult.studies?.length) {
      console.log('❌ No studies found for researcher');
      return;
    }

    const firstStudy = studiesResult.studies[0];
    console.log(`✅ Found study: "${firstStudy.title}" (ID: ${firstStudy._id})`);

    // Step 3: Get applications for the study
    console.log('\n📋 STEP 3: GET STUDY APPLICATIONS');
    const applicationsResponse = await fetch(`${API_BASE}/applications?endpoint=study/${firstStudy._id}/applications`, {
      headers: {
        'Authorization': `Bearer ${researcherAuth.session.access_token}`
      }
    });

    const applicationsResult = await applicationsResponse.json();
    
    console.log('📊 Applications Response Status:', applicationsResponse.status);
    console.log('📊 Applications Result:', JSON.stringify(applicationsResult, null, 2));

    if (applicationsResult.success) {
      console.log(`✅ Found ${applicationsResult.data.applications.length} applications`);
      
      if (applicationsResult.data.applications.length > 0) {
        console.log('\n📝 APPLICATION DETAILS:');
        applicationsResult.data.applications.forEach((app, index) => {
          console.log(`   ${index + 1}. Status: ${app.status}`);
          console.log(`      Participant: ${app.participant?.name || 'N/A'}`);
          console.log(`      Email: ${app.participant?.email || 'N/A'}`);
          console.log(`      Applied: ${app.appliedAt}`);
          console.log(`      ID: ${app._id}`);
        });

        // Step 4: Test approval functionality
        const pendingApp = applicationsResult.data.applications.find(app => app.status === 'pending');
        
        if (pendingApp) {
          console.log('\n✅ STEP 4: TEST APPLICATION APPROVAL');
          console.log(`🎯 Approving application: ${pendingApp._id}`);

          const approvalResponse = await fetch(`${API_BASE}/applications?endpoint=applications/${pendingApp._id}/review`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${researcherAuth.session.access_token}`
            },
            body: JSON.stringify({
              status: 'approved',
              notes: 'Approved for testing researcher management functionality'
            })
          });

          const approvalResult = await approvalResponse.json();
          
          console.log('📊 Approval Response Status:', approvalResponse.status);
          console.log('📊 Approval Result:', JSON.stringify(approvalResult, null, 2));

          if (approvalResult.success) {
            console.log('✅ Application approved successfully!');
          } else {
            console.log('❌ Application approval failed:', approvalResult.error);
          }
        } else {
          console.log('ℹ️ No pending applications to test approval');
        }

      } else {
        console.log('ℹ️ No applications found for this study');
      }
    } else {
      console.log('❌ Failed to get applications:', applicationsResult.error);
    }

    // Step 5: Test filtering functionality
    console.log('\n🔍 STEP 5: TEST FILTERING FUNCTIONALITY');
    
    const filterTests = ['pending', 'approved', 'rejected'];
    for (const status of filterTests) {
      const filterResponse = await fetch(`${API_BASE}/applications?endpoint=study/${firstStudy._id}/applications&status=${status}`, {
        headers: {
          'Authorization': `Bearer ${researcherAuth.session.access_token}`
        }
      });

      const filterResult = await filterResponse.json();
      
      if (filterResult.success) {
        console.log(`✅ Filter '${status}': ${filterResult.data.applications.length} applications`);
      } else {
        console.log(`❌ Filter '${status}' failed:`, filterResult.error);
      }
    }

    console.log('\n🎉 RESEARCHER APPLICATION MANAGEMENT TEST COMPLETE!');
    console.log('=' .repeat(60));

  } catch (error) {
    console.error('❌ Test Error:', error);
  }
}

testResearcherApplicationManagement();
