#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wxpwxzdgdvinlbtnbgdf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4cHd4emRnZHZpbmxidG5iZ2RmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAxOTk1ODAsImV4cCI6MjA2NTc3NTU4MH0.YMai9p4VQMbdqmc_9uWGeJ6nONHwuM9XT2FDTFy0aGk';

// Test different query approaches
async function testQueryApproaches() {
  try {
    console.log('=== Testing Different Query Approaches ===');

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
    const applicationId = 'bc366ca0-64e1-4f0f-9635-f8444acb1d3a';

    // 2. Test with left join first
    console.log('2. Testing with left join...');
    const { data: leftJoinResult, error: leftJoinError } = await supabase
      .from('study_applications')
      .select(`
        id,
        study_id,
        participant_id,
        status,
        studies (
          id,
          title,
          researcher_id
        )
      `)
      .eq('id', applicationId)
      .single();

    if (leftJoinError) {
      console.error('❌ Left join failed:', leftJoinError);
    } else {
      console.log('✅ Left join successful!');
      console.log('📊 Left join result:', JSON.stringify(leftJoinResult, null, 2));
    }

    // 3. Test getting application first, then study separately
    console.log('3. Testing separate queries...');
    const { data: appResult, error: appError } = await supabase
      .from('study_applications')
      .select('*')
      .eq('id', applicationId)
      .single();

    if (appError) {
      console.error('❌ App query failed:', appError);
      return;
    }

    console.log('✅ Application found:', appResult.id);

    const { data: studyResult, error: studyError } = await supabase
      .from('studies')
      .select('*')
      .eq('id', appResult.study_id)
      .single();

    if (studyError) {
      console.error('❌ Study query failed:', studyError);
      return;
    }

    console.log('✅ Study found:', studyResult.title);
    console.log('🔐 Study researcher:', studyResult.researcher_id);
    console.log('🔐 Current user:', authData.user.id);
    console.log('🔐 Access check:', studyResult.researcher_id === authData.user.id ? 'ALLOWED' : 'DENIED');

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
}

testQueryApproaches();
