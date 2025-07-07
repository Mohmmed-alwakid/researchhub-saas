// Direct database check using service key to bypass RLS
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://jdpxixlvpqsygxmrdlvv.supabase.co';
const serviceKey = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpkcHhpeGx2cHFzeWd4bXJkbHZ2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcxODI0MzQ5NywiZXhwIjoyMDMzODE5NDk3fQ.1YSkWlhYolJL_wRb9vU3UiFrNQBwzJekIKZm3eUWKtk';

const supabase = createClient(supabaseUrl, serviceKey);

async function checkDatabase() {
  console.log('🔍 Direct database check...\n');
  
  try {
    // Check if study_applications table exists
    console.log('1️⃣ Checking study_applications table...');
    const { data: tableData, error: tableError } = await supabase
      .from('study_applications')
      .select('*')
      .limit(1);
    
    if (tableError) {
      console.log('❌ Table error:', tableError.message);
      console.log('Code:', tableError.code);
      console.log('Details:', tableError.details);
    } else {
      console.log('✅ Table exists and accessible');
      console.log('Sample data count:', tableData ? tableData.length : 0);
    }
    
    // Check studies table to confirm structure
    console.log('\n2️⃣ Checking studies table...');
    const { data: studiesData, error: studiesError } = await supabase
      .from('studies')
      .select('_id, id, title, created_by, researcher_id')
      .limit(2);
    
    if (studiesError) {
      console.log('❌ Studies error:', studiesError.message);
    } else {
      console.log('✅ Studies accessible');
      if (studiesData && studiesData.length > 0) {
        console.log('First study structure:');
        console.log(JSON.stringify(studiesData[0], null, 2));
      }
    }
    
    // Check profiles table
    console.log('\n3️⃣ Checking profiles table...');
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('id, email, first_name, last_name, role')
      .limit(2);
    
    if (profilesError) {
      console.log('❌ Profiles error:', profilesError.message);
    } else {
      console.log('✅ Profiles accessible');
      if (profilesData && profilesData.length > 0) {
        console.log('Sample profile:');
        console.log(JSON.stringify(profilesData[0], null, 2));
      }
    }
    
  } catch (error) {
    console.error('❌ Script failed:', error.message);
  }
}

checkDatabase();
