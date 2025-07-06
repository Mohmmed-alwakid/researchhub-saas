#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wxpwxzdgdvinlbtnbgdf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4cHd4emRnZHZpbmxidG5iZ2RmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAxOTk1ODAsImV4cCI6MjA2NTc3NTU4MH0.YMai9p4VQMbdqmc_9uWGeJ6nONHwuM9XT2FDTFy0aGk';

// Test direct approval via Supabase
async function testDirectApproval() {
  try {
    console.log('=== Testing Direct Application Approval ===');

    // 1. Login as researcher to get their token
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'abwanwr77+researcher@gmail.com',
      password: 'Testtest123'
    });

    if (authError) {
      console.error('❌ Login failed:', authError.message);
      return;
    }

    console.log('✅ Researcher logged in');

    // 2. Create an authenticated client with researcher's token
    const authenticatedSupabase = createClient(supabaseUrl, supabaseKey, {
      global: {
        headers: {
          Authorization: `Bearer ${authData.session.access_token}`
        }
      }
    });

    const applicationId = 'bc366ca0-64e1-4f0f-9635-f8444acb1d3a';

    // 3. Try to update the application status
    console.log('2. Updating application status...');
    const { data: updatedApp, error: updateError } = await authenticatedSupabase
      .from('study_applications')
      .update({ 
        status: 'accepted',
        reviewed_at: new Date().toISOString(),
        reviewed_by: authData.user.id,
        notes: 'Approved via direct test'
      })
      .eq('id', applicationId)
      .select()
      .single();

    if (updateError) {
      console.error('❌ Update failed:', updateError.message);
      console.error('❌ Update error details:', updateError);
      return;
    }

    console.log('✅ Application updated successfully!');
    console.log('📊 Updated application:', JSON.stringify(updatedApp, null, 2));

    // 4. Verify the update by reading it back
    console.log('3. Verifying update...');
    const { data: verifyApp, error: verifyError } = await authenticatedSupabase
      .from('study_applications')
      .select('*')
      .eq('id', applicationId)
      .single();

    if (verifyError) {
      console.error('❌ Verify failed:', verifyError.message);
      return;
    }

    console.log('✅ Verification successful!');
    console.log('📊 Current status:', verifyApp.status);
    console.log('🎉 Direct approval test completed successfully!');

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
}

testDirectApproval();
