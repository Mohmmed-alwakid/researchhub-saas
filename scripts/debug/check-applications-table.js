/**
 * Check Database Schema for Applications Table
 * Test to see what tables exist and if we need to create study_applications
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wxpwxzdgdvinlbtnbgdf.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4cHd4emRnZHZpbmxidG5iZ2RmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDE5OTU4MCwiZXhwIjoyMDY1Nzc1NTgwfQ.8uf_3CJODn75Vw0ksQ36r2D9s2JC8pKY6uHLl9O_SdM';

async function checkApplicationsTable() {
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  console.log('🔍 Checking for existing applications/study_applications table...');
  
  // Try to execute a simple query to check connection
  try {
    const { data: testResult, error: testError } = await supabase
      .from('studies')
      .select('count')
      .limit(1);
    
    if (testError) {
      console.log('❌ Database connection error:', testError.message);
      return;
    } else {
      console.log('✅ Database connection successful');
    }
  } catch (error) {
    console.log('❌ Database connection failed:', error.message);
    return;
  }
  
  // Check if applications table exists by trying to query it
  try {
    const { data: applications, error: appError } = await supabase
      .from('applications')
      .select('*')
      .limit(1);
    
    if (!appError) {
      console.log('✅ Found applications table');
      console.log('Sample data:', applications);
    } else {
      console.log('❌ applications table not found:', appError.message);
    }
  } catch (error) {
    console.log('❌ Error checking applications table:', error.message);
  }
  
  // Check if study_applications table exists
  try {
    const { data: studyApps, error: studyAppError } = await supabase
      .from('study_applications')
      .select('*')
      .limit(1);
    
    if (!studyAppError) {
      console.log('✅ Found study_applications table');
      console.log('Sample data:', studyApps);
    } else {
      console.log('❌ study_applications table not found:', studyAppError.message);
    }
  } catch (error) {
    console.log('❌ Error checking study_applications table:', error.message);
  }

  // Alternative: Use RPC to list tables
  try {
    console.log('\n📋 Trying RPC to list tables...');
    const { data: rpcResult, error: rpcError } = await supabase
      .rpc('get_table_list');
    
    if (rpcError) {
      console.log('❌ RPC Error:', rpcError.message);
    } else {
      console.log('✅ RPC Result:', rpcResult);
    }
  } catch (error) {
    console.log('❌ RPC call failed:', error.message);
  }
}

checkApplicationsTable().catch(console.error);
