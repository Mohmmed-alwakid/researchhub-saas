#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wxpwxzdgdvinlbtnbgdf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4cHd4emRnZHZpbmxidG5iZ2RmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAxOTk1ODAsImV4cCI6MjA2NTc3NTU4MH0.YMai9p4VQMbdqmc_9uWGeJ6nONHwuM9XT2FDTFy0aGk';

// Debug the exact query from the review function
async function debugReviewQuery() {
  try {
    console.log('=== Debugging Review Query ===');

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
    console.log('👤 User ID:', authData.user.id);

    // 2. Test the exact query from the review function
    const applicationId = 'bc366ca0-64e1-4f0f-9635-f8444acb1d3a';
    console.log('🔍 Looking for application:', applicationId);

    const { data: application, error: appError } = await supabase
      .from('study_applications')
      .select(`
        id,
        study_id,
        participant_id,
        status,
        studies!inner (
          id,
          title,
          researcher_id
        )
      `)
      .eq('id', applicationId)
      .single();

    if (appError) {
      console.error('❌ Query failed:', appError);
      return;
    }

    console.log('✅ Query successful!');
    console.log('📊 Application data:', JSON.stringify(application, null, 2));
    console.log('🔐 Study researcher ID:', application.studies.researcher_id);
    console.log('🔐 Current user ID:', authData.user.id);
    console.log('🔐 Access check:', application.studies.researcher_id === authData.user.id ? 'ALLOWED' : 'DENIED');

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
}

debugReviewQuery();
