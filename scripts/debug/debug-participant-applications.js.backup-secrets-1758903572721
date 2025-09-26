/**
 * Debug participant applications - check database structure and data
 */
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wxpwxzdgdvinlbtnbgdf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4cHd4emRnZHZpbmxidG5iZ2RmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAxOTk1ODAsImV4cCI6MjA2NTc3NTU4MH0.YMai9p4VQMbdqmc_9uWGeJ6nONHwuM9XT2FDTFy0aGk';
const supabase = createClient(supabaseUrl, supabaseKey);

async function debugApplications() {
  try {
    console.log('🔍 Debugging participant applications...');
    
    // Test participant details
    const participantEmail = 'abwanwr77+participant@gmail.com';
    const participantId = '9876c870-79e9-4106-99d6-9080049ec2aa';
    
    console.log(`\n📋 Looking for applications for participant: ${participantEmail} (${participantId})`);
    
    // Check all applications in the database
    console.log('\n1️⃣ Getting ALL applications in study_applications table:');
    const { data: allApps, error: allError } = await supabase
      .from('study_applications')
      .select('*');
    
    if (allError) {
      console.error('❌ Error getting all applications:', allError);
    } else {
      console.log(`Found ${allApps.length} total applications in study_applications table:`);
      allApps.forEach((app, index) => {
        console.log(`  ${index + 1}. ID: ${app.id}, Participant: ${app.participant_id}, Status: ${app.status}, Applied: ${app.applied_at}`);
      });
    }
    
    // Check for our specific participant
    console.log(`\n2️⃣ Getting applications for participant ${participantId}:`);
    const { data: participantApps, error: participantError } = await supabase
      .from('study_applications')
      .select('*')
      .eq('participant_id', participantId);
      
    if (participantError) {
      console.error('❌ Error getting participant applications:', participantError);
    } else {
      console.log(`Found ${participantApps.length} applications for participant:`);
      participantApps.forEach((app, index) => {
        console.log(`  ${index + 1}. ID: ${app.id}, Study: ${app.study_id}, Status: ${app.status}, Applied: ${app.applied_at}`);
      });
    }
    
    // Check with JOIN to studies table (same as API)
    console.log(`\n3️⃣ Getting applications with JOIN to studies (API query):`);
    const { data: joinedApps, error: joinedError } = await supabase
      .from('study_applications')
      .select(`
        id,
        status,
        application_data,
        applied_at,
        reviewed_at,
        studies!inner(id, title, description, status, settings)
      `)
      .eq('participant_id', participantId)
      .order('applied_at', { ascending: false });
      
    if (joinedError) {
      console.error('❌ Error getting joined applications:', joinedError);
    } else {
      console.log(`Found ${joinedApps.length} applications with JOIN:`);
      joinedApps.forEach((app, index) => {
        console.log(`  ${index + 1}. App ID: ${app.id}, Status: ${app.status}, Study: ${app.studies?.title || 'Unknown'}, Applied: ${app.applied_at}`);
      });
    }
    
    // Check if there are applications in other tables that might be relevant
    console.log(`\n4️⃣ Checking for applications in other possible tables:`);
    
    // Check if there's a 'applications' table
    try {
      const { data: otherApps, error: otherError } = await supabase
        .from('applications')
        .select('*')
        .eq('participant_id', participantId);
        
      if (otherError) {
        console.log('No "applications" table found or accessible');
      } else {
        console.log(`Found ${otherApps.length} applications in "applications" table:`);
        otherApps.forEach((app, index) => {
          console.log(`  ${index + 1}. ID: ${app.id}, Status: ${app.status}, Applied: ${app.applied_at || app.created_at}`);
        });
      }
    } catch (e) {
      console.log('No "applications" table found');
    }
    
    console.log('\n✅ Debug complete!');
    
  } catch (error) {
    console.error('❌ Debug failed:', error);
  }
}

debugApplications();
