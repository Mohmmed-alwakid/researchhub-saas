#!/usr/bin/env node

/**
 * Check Available Studies
 * Lists all available studies to find valid study IDs
 */

const LOCAL_API = 'http://localhost:3003/api';

async function checkAvailableStudies() {
  console.log('🔍 CHECKING AVAILABLE STUDIES');
  console.log('============================\n');

  try {
    // Get studies without authentication first
    console.log('📚 Step 1: Get Public Studies');
    
    const studiesResponse = await fetch(`${LOCAL_API}/research-consolidated?action=studies`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    console.log(`   Response status: ${studiesResponse.status}`);
    const studiesResult = await studiesResponse.json();
    
    if (studiesResult.success && studiesResult.studies) {
      console.log(`✅ Found ${studiesResult.studies.length} studies:`);
      studiesResult.studies.forEach((study, index) => {
        console.log(`   ${index + 1}. ${study.title || study.name} (ID: ${study.id || study._id})`);
        console.log(`      Status: ${study.status}`);
        console.log(`      Type: ${study.type}`);
        console.log('');
      });
      
      // Return the first active study ID for testing
      const activeStudy = studiesResult.studies.find(s => s.status === 'active' || s.status === 'published');
      if (activeStudy) {
        console.log(`🎯 Active study found for testing: ${activeStudy.id || activeStudy._id}`);
        return activeStudy.id || activeStudy._id;
      }
    } else {
      console.log('❌ No studies found or API error:', studiesResult.error);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
  
  return null;
}

// Run the test
checkAvailableStudies().then(studyId => {
  if (studyId) {
    console.log(`\n🔧 Use this study ID for testing: ${studyId}`);
  }
});
