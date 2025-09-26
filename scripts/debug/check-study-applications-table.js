// Check if study applications table exists and has data
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://jdpxixlvpqsygxmrdlvv.supabase.co';
const supabaseKey = ''PLACEHOLDER_SUPABASE_SERVICE_ROLE_KEY'';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkStudyApplicationsTable() {
  console.log('🔍 Checking study applications table...\n');
  
  try {
    // Check if table exists and structure
    console.log('1️⃣ Checking table structure...');
    const { data: columns, error: columnsError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type')
      .eq('table_name', 'study_applications')
      .eq('table_schema', 'public');
    
    if (columnsError) {
      console.log('❌ Error checking columns:', columnsError.message);
    } else if (columns && columns.length > 0) {
      console.log('✅ Table exists with columns:');
      columns.forEach(col => {
        console.log(`  - ${col.column_name}: ${col.data_type}`);
      });
    } else {
      console.log('❌ Table does not exist or has no columns');
    }
    
    // Check for any data
    console.log('\n2️⃣ Checking for existing data...');
    const { data: applications, error: dataError } = await supabase
      .from('study_applications')
      .select('*')
      .limit(5);
    
    if (dataError) {
      console.log('❌ Error querying data:', dataError.message);
    } else {
      console.log('✅ Query successful');
      console.log('Record count:', applications ? applications.length : 0);
      if (applications && applications.length > 0) {
        console.log('Sample record:');
        console.log(JSON.stringify(applications[0], null, 2));
      }
    }
    
    // Check specifically for study applications with our researcher's studies
    console.log('\n3️⃣ Checking for applications to researcher studies...');
    const { data: researcherApps, error: researcherError } = await supabase
      .from('study_applications')
      .select(`
        *,
        studies!inner(title, created_by)
      `)
      .eq('studies.created_by', '4c3d798b-2975-4ec4-b9e2-c6f128b8a066')
      .limit(5);
    
    if (researcherError) {
      console.log('❌ Error querying researcher apps:', researcherError.message);
    } else {
      console.log('✅ Researcher applications query successful');
      console.log('Applications to researcher studies:', researcherApps ? researcherApps.length : 0);
      if (researcherApps && researcherApps.length > 0) {
        console.log('Sample application:');
        console.log(JSON.stringify(researcherApps[0], null, 2));
      }
    }
    
  } catch (error) {
    console.error('❌ Script failed:', error.message);
  }
}

checkStudyApplicationsTable();
