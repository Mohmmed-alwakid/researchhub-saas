/**
 * TEMPORARY API PATCH: Add debug logging to delete function
 * We'll create a patched version to understand the exact Supabase query
 */

import { createClient } from '@supabase/supabase-js';

// Use the exact same config as the main API
const supabaseUrl = process.env.SUPABASE_URL || 'https://wxpwxzdgdvinlbtnbgdf.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4cHd4emRnZHZpbmxidG5iZ2RmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjQzNjQwMTMsImV4cCI6MjAzOTk0MDAxM30.VNjs7VJjdoJkRiytIKsFB74LEWPd4XlvzjnrXYlXUbs';
const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🔍 Testing Direct Supabase Database Query');

async function testDirectDatabaseQuery() {
  try {
    // First, let's see what the studies table structure looks like
    console.log('📊 Examining studies table structure...');
    
    const { data: allStudies, error: allError } = await supabase
      .from('studies')
      .select('*')
      .limit(3);

    if (allError) {
      console.error('❌ Error querying studies table:', allError);
      return;
    }

    console.log(`✅ Retrieved ${allStudies?.length || 0} studies for analysis`);
    
    if (allStudies && allStudies.length > 0) {
      const sample = allStudies[0];
      console.log('\n📋 Sample study structure:');
      console.log(`   Fields: [${Object.keys(sample).join(', ')}]`);
      console.log(`   ID field type: ${typeof sample.id} (value: ${sample.id})`);
      console.log(`   Researcher ID type: ${typeof sample.researcher_id} (value: ${sample.researcher_id})`);
    }

    // Now let's find a specific study that we know exists
    console.log('\n🎯 Searching for target study...');
    
    const targetId = 4244301276;  // From our previous test
    const targetUserId = '4c3d798b-2975-4ec4-b9e2-c6f128b8a066';

    console.log(`   Searching for ID: ${targetId} (${typeof targetId})`);
    console.log(`   User ID: ${targetUserId} (${typeof targetUserId})`);

    // Test different query approaches
    console.log('\n🔍 Testing different query approaches...');

    // Test 1: Numeric ID
    console.log('\n1️⃣ Query with numeric ID:');
    const { data: numericQuery, error: numericError } = await supabase
      .from('studies')
      .select('id, title, status, researcher_id')
      .eq('id', targetId)
      .eq('researcher_id', targetUserId);

    if (numericError) {
      console.log(`   ❌ Numeric query error: ${numericError.message}`);
    } else {
      console.log(`   ✅ Numeric query result: ${numericQuery?.length || 0} records found`);
      if (numericQuery && numericQuery.length > 0) {
        console.log(`   Found: ${numericQuery[0].title}`);
      }
    }

    // Test 2: String ID
    console.log('\n2️⃣ Query with string ID:');
    const { data: stringQuery, error: stringError } = await supabase
      .from('studies')
      .select('id, title, status, researcher_id')
      .eq('id', String(targetId))
      .eq('researcher_id', targetUserId);

    if (stringError) {
      console.log(`   ❌ String query error: ${stringError.message}`);
    } else {
      console.log(`   ✅ String query result: ${stringQuery?.length || 0} records found`);
    }

    // Test 3: Find any study by this user
    console.log('\n3️⃣ Query any study by user:');
    const { data: userQuery, error: userError } = await supabase
      .from('studies')
      .select('id, title, status, researcher_id')
      .eq('researcher_id', targetUserId)
      .limit(1);

    if (userError) {
      console.log(`   ❌ User query error: ${userError.message}`);
    } else {
      console.log(`   ✅ User query result: ${userQuery?.length || 0} records found`);
      if (userQuery && userQuery.length > 0) {
        const userStudy = userQuery[0];
        console.log(`   Found user study: ${userStudy.title} (ID: ${userStudy.id})`);
        
        // Now try to delete this one specifically
        console.log('\n🗑️ Testing delete on confirmed user study...');
        const { data: deleteResult, error: deleteError } = await supabase
          .from('studies')
          .delete()
          .eq('id', userStudy.id)
          .eq('researcher_id', targetUserId)
          .select();

        if (deleteError) {
          console.log(`   ❌ Delete error: ${deleteError.message}`);
          console.log(`   Full error:`, deleteError);
        } else {
          console.log(`   ✅ Delete successful: ${deleteResult?.length || 0} records deleted`);
          if (deleteResult && deleteResult.length > 0) {
            console.log(`   Deleted: ${deleteResult[0].title}`);
          }
        }
      }
    }

  } catch (error) {
    console.error('❌ Direct database test failed:', error.message);
  }
}

testDirectDatabaseQuery();