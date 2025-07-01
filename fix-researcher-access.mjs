import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wxpwxzdgdvinlbtnbgdf.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4cHd4emRnZHZpbmxidG5iZ2RmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDE5OTU4MCwiZXhwIjoyMDY1Nzc1NTgwfQ.p_lVJr1uXJo9FGNeTf6rWxAYjrHGNwH_OWsJchjhUhM';

async function fixResearcherAccess() {
  console.log('🔧 Fixing Researcher Access to Study Applications...');

  const supabase = createClient(supabaseUrl, serviceRoleKey);

  // Method 1: Update the study owner to be our test researcher
  const studyId = '2fd69681-3a09-49c5-b110-a06d8834aee8';
  const researcherId = '4c3d798b-2975-4ec4-b9e2-c6f128b8a066'; // Our test researcher

  console.log('📝 Updating study ownership...');
  
  const { data: updatedStudy, error: updateError } = await supabase
    .from('studies')
    .update({ 
      researcher_id: researcherId,
      updated_at: new Date().toISOString()
    })
    .eq('id', studyId)
    .select()
    .single();

  if (updateError) {
    console.error('❌ Error updating study ownership:', updateError);
  } else {
    console.log('✅ Study ownership updated successfully!');
    console.log('✅ Study now owned by researcher:', researcherId);
  }

  // Verify the change
  const { data: study, error: fetchError } = await supabase
    .from('studies')
    .select('id, title, researcher_id')
    .eq('id', studyId)
    .single();

  if (study) {
    console.log('✅ Verification - Study details:');
    console.log(`   Title: ${study.title}`);
    console.log(`   ID: ${study.id}`);
    console.log(`   Researcher ID: ${study.researcher_id}`);
  }

  // Check applications for this study
  const { data: applications, error: appError } = await supabase
    .from('study_applications')
    .select('*')
    .eq('study_id', studyId);

  if (applications) {
    console.log(`✅ Found ${applications.length} applications for this study`);
    if (applications.length > 0) {
      console.log('✅ Application details:', JSON.stringify(applications[0], null, 2));
    }
  } else {
    console.log('❌ Error fetching applications:', appError);
  }
}

fixResearcherAccess();
