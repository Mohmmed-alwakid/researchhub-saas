import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://efrcjmiafaehfqpsasqp.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVmcmNqbWlhZmFlaGZxcHNhc3FwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTc5NjE2NjIsImV4cCI6MjAzMzUzNzY2Mn0.8CwCRb9WH5xJU0ixKBXdSzwuYbDkFPjd_vBdKrGOLVw';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function debugApplicationsSchema() {
  console.log('🔍 Debugging applications database schema and queries...\n');

  try {
    // 1. First, let's check the study_applications table structure
    console.log('1. Checking study_applications table structure...');
    const { data: apps, error: appsError } = await supabase
      .from('study_applications')
      .select('*')
      .limit(1);

    if (appsError) {
      console.error('❌ Error querying study_applications:', appsError);
    } else {
      console.log('✅ study_applications sample record:', apps[0] || 'No records found');
    }

    // 2. Check profiles table structure
    console.log('\n2. Checking profiles table structure...');
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);

    if (profilesError) {
      console.error('❌ Error querying profiles:', profilesError);
    } else {
      console.log('✅ profiles sample record:', profiles[0] || 'No records found');
    }

    // 3. Check if there are any study_applications for existing studies
    console.log('\n3. Checking study_applications count...');
    const { count: appCount, error: countError } = await supabase
      .from('study_applications')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('❌ Error counting study_applications:', countError);
    } else {
      console.log(`✅ Total study_applications count: ${appCount}`);
    }

    // 4. Check if there are any profiles
    console.log('\n4. Checking profiles count...');
    const { count: profileCount, error: profileCountError } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    if (profileCountError) {
      console.error('❌ Error counting profiles:', profileCountError);
    } else {
      console.log(`✅ Total profiles count: ${profileCount}`);
    }

    // 5. Let's try the exact query that's failing
    console.log('\n5. Testing the exact query from the API...');
    
    // First get a study ID
    const { data: studies, error: studiesError } = await supabase
      .from('studies')
      .select('id, title, researcher_id')
      .limit(1);

    if (studiesError || !studies || studies.length === 0) {
      console.error('❌ No studies found:', studiesError);
      return;
    }

    const testStudyId = studies[0].id;
    console.log(`📚 Testing with study ID: ${testStudyId}`);

    // Now try the problematic query
    const { data: testApps, error: testError } = await supabase
      .from('study_applications')
      .select(`
        id,
        status,
        created_at,
        updated_at,
        reviewer_notes,
        screening_responses,
        participant_id,
        profiles!study_applications_participant_id_fkey (
          id,
          first_name,
          last_name,
          email
        )
      `)
      .eq('study_id', testStudyId);

    if (testError) {
      console.error('❌ Error with join query:', testError);
      console.log('🔍 Let\'s try without the join...');
      
      // Try without join
      const { data: simpleApps, error: simpleError } = await supabase
        .from('study_applications')
        .select('id, status, created_at, participant_id, study_id')
        .eq('study_id', testStudyId);

      if (simpleError) {
        console.error('❌ Error with simple query:', simpleError);
      } else {
        console.log('✅ Simple query works:', simpleApps);
      }
    } else {
      console.log('✅ Join query works:', testApps);
    }

    // 6. Check foreign key relationship
    console.log('\n6. Checking foreign key relationship...');
    const { data: fkInfo, error: fkError } = await supabase.rpc('get_foreign_keys', {
      table_name: 'study_applications'
    });

    if (fkError) {
      console.log('⚠️ Could not get FK info (RPC not available):', fkError.message);
    } else {
      console.log('✅ Foreign key info:', fkInfo);
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

debugApplicationsSchema();
