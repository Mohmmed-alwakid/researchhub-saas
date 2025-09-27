/**
 * ENHANCED DELETE STUDY API WITH DEBUG LOGGING
 * Temporary patch to add comprehensive logging to understand the issue
 */

import { createClient } from '@supabase/supabase-js';

// Supabase configuration (same as API)
const supabaseUrl = 'https://wxpwxzdgdvinlbtnbgdf.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4cHd4emRnZHZpbmxidG5iZ2RmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyNDM2NDAxMywiZXhwIjoyMDM5OTQwMDEzfQ.bKzfrQOA9Sv_qzjlWJjFITdlqWLKfxH8xSqJ9-dBLBI';
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

console.log('🔍 Enhanced Delete Study Debug with Service Role');

export default async function debugDeleteStudy(req, res) {
  try {
    console.log('\n🔍 === ENHANCED DELETE STUDY DEBUG ===');
    console.log(`Method: ${req.method}`);
    console.log(`Headers:`, Object.keys(req.headers));
    console.log(`Query:`, req.query);
    console.log(`Body:`, req.body);

    // Extract study ID
    const studyId = req.query.id || req.body.id;
    console.log(`\n📋 Study ID: ${studyId} (type: ${typeof studyId})`);

    if (!studyId) {
      return res.status(400).json({
        success: false,
        error: 'Study ID is required'
      });
    }

    // Get the authentication token
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Missing or invalid authorization header'
      });
    }

    const token = authHeader.replace('Bearer ', '');
    
    // Get user from token
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    
    if (authError || !user) {
      console.log(`❌ Auth error: ${authError?.message}`);
      return res.status(401).json({
        success: false,
        error: 'Invalid token or user not found'
      });
    }

    console.log(`✅ Authenticated user: ${user.id}`);

    // First, let's see all studies to understand the data
    console.log('\n📊 DEBUGGING: Getting all studies...');
    const { data: allStudies, error: allError } = await supabaseAdmin
      .from('studies')
      .select('id, title, status, researcher_id')
      .limit(5);

    if (allError) {
      console.log(`❌ Error getting all studies: ${allError.message}`);
    } else {
      console.log(`✅ Found ${allStudies?.length || 0} studies total`);
      allStudies?.forEach((study, i) => {
        console.log(`   ${i+1}. ${study.title} (ID: ${study.id}, User: ${study.researcher_id})`);
      });
    }

    // Now search for the specific study
    console.log(`\n🎯 DEBUGGING: Searching for study ID ${studyId}...`);
    
    // Test multiple query variations
    const queryVariations = [
      { name: 'Numeric ID', id: studyId },
      { name: 'String ID', id: String(studyId) },
      { name: 'Parsed Int', id: parseInt(studyId) }
    ];

    let foundStudy = null;

    for (const variation of queryVariations) {
      console.log(`\n   Testing ${variation.name}: ${variation.id} (${typeof variation.id})`);
      
      const { data: testResult, error: testError } = await supabaseAdmin
        .from('studies')
        .select('id, title, status, researcher_id')
        .eq('id', variation.id);

      if (testError) {
        console.log(`   ❌ Query error: ${testError.message}`);
      } else {
        console.log(`   ✅ Query successful: ${testResult?.length || 0} records found`);
        if (testResult && testResult.length > 0) {
          foundStudy = testResult[0];
          console.log(`   📋 Found study: ${foundStudy.title}`);
          console.log(`   📋 Owner: ${foundStudy.researcher_id}`);
          console.log(`   📋 User match: ${foundStudy.researcher_id === user.id ? 'YES' : 'NO'}`);
          break;
        }
      }
    }

    if (!foundStudy) {
      console.log(`❌ Study ${studyId} not found with any query variation`);
      return res.status(404).json({
        success: false,
        error: 'Study not found',
        debug: {
          searchedId: studyId,
          userId: user.id,
          queryVariationsTested: queryVariations.length
        }
      });
    }

    // Check ownership
    if (foundStudy.researcher_id !== user.id) {
      console.log(`❌ Access denied: Study owned by ${foundStudy.researcher_id}, user is ${user.id}`);
      return res.status(403).json({
        success: false,
        error: 'Access denied - not your study'
      });
    }

    // Attempt delete
    console.log(`\n🗑️ DEBUGGING: Attempting delete...`);
    const { data: deleteResult, error: deleteError } = await supabaseAdmin
      .from('studies')
      .delete()
      .eq('id', foundStudy.id)
      .eq('researcher_id', user.id)
      .select();

    if (deleteError) {
      console.log(`❌ Delete error: ${deleteError.message}`);
      return res.status(500).json({
        success: false,
        error: 'Delete operation failed',
        debug: {
          deleteError: deleteError.message
        }
      });
    }

    console.log(`✅ Delete successful: ${deleteResult?.length || 0} records deleted`);

    return res.status(200).json({
      success: true,
      message: `Study '${foundStudy.title}' deleted successfully`,
      debug: {
        deletedStudy: foundStudy.title,
        deletedRecords: deleteResult?.length || 0
      }
    });

  } catch (error) {
    console.error('❌ Enhanced delete debug error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      debug: {
        errorMessage: error.message
      }
    });
  }
}