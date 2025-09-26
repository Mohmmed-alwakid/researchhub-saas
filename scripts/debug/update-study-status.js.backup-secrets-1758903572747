// Script to manually update study status from Draft to Active
// This will enable participant application testing
// Updated: Uses 'active' status (correct enum value) instead of 'recruiting'

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wxpwxzdgdvinlbtnbgdf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4cHd4emRnZHZpbmxidG5iZ2RmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAxOTk1ODAsImV4cCI6MjA2NTc3NTU4MH0.YMai9p4VQMbdqmc_9uWGeJ6nONHwuM9XT2FDTFy0aGk';

const supabase = createClient(supabaseUrl, supabaseKey);

async function updateStudyStatus() {
  try {
    console.log('🔍 Fetching current studies...');
    
    // First, let's see what studies we have
    const { data: studies, error: fetchError } = await supabase
      .from('studies')
      .select('id, title, status, created_at')
      .order('created_at', { ascending: false })
      .limit(5);

    if (fetchError) {
      console.error('❌ Error fetching studies:', fetchError);
      return;
    }

    console.log('\n📋 Current Studies:');
    studies.forEach((study, index) => {
      console.log(`${index + 1}. ${study.title} (${study.status}) - ID: ${study.id}`);
    });

    // Find a good study to update (prefer E-commerce ones as they have better descriptions)
    const targetStudy = studies.find(s => 
      s.title.toLowerCase().includes('e-commerce') || 
      s.title.toLowerCase().includes('checkout')
    ) || studies[0];

    if (!targetStudy) {
      console.log('❌ No studies found to update');
      return;
    }    console.log(`\n🎯 Updating study: "${targetStudy.title}" to Active status...`);

    // Update the study status to 'active' (correct enum value)
    const { data: updatedStudy, error: updateError } = await supabase
      .from('studies')
      .update({ 
        status: 'active',
        updated_at: new Date().toISOString()
      })
      .eq('id', targetStudy.id)
      .select()
      .single();

    if (updateError) {
      console.error('❌ Error updating study:', updateError);
      return;
    }

    console.log('✅ Successfully updated study status!');
    console.log(`📄 Study: "${updatedStudy.title}"`);
    console.log(`🔄 Status: ${targetStudy.status} → ${updatedStudy.status}`);
    console.log(`🆔 Study ID: ${updatedStudy.id}`);
    
    // Also update a second study for better testing
    const secondStudy = studies.find(s => s.id !== targetStudy.id && s.status === 'draft');
    if (secondStudy) {      console.log(`\n🎯 Updating second study: "${secondStudy.title}" to Active...`);
      
      const { data: secondUpdated, error: secondError } = await supabase
        .from('studies')
        .update({ 
          status: 'active',
          updated_at: new Date().toISOString()
        })
        .eq('id', secondStudy.id)
        .select()
        .single();

      if (secondError) {
        console.error('❌ Error updating second study:', secondError);
      } else {
        console.log('✅ Successfully updated second study!');
        console.log(`📄 Study: "${secondUpdated.title}"`);
        console.log(`🆔 Study ID: ${secondUpdated.id}`);
      }
    }

    console.log('\n🚀 Ready for participant application testing!');
    console.log('👤 Participants should now see these studies in the discovery page');

  } catch (error) {
    console.error('💥 Unexpected error:', error);
  }
}

// Run the update
updateStudyStatus();
