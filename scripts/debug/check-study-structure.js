/**
 * Check study structure and blocks in the database
 */
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wxpwxzdgdvinlbtnbgdf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4cHd4emRnZHZpbmxidG5iZ2RmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAxOTk1ODAsImV4cCI6MjA2NTc3NTU4MH0.YMai9p4VQMbdqmc_9uWGeJ6nONHwuM9XT2FDTFy0aGk';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkStudyStructure() {
  console.log('🔍 Checking study structure and blocks...\n');

  const studyId = '6a9957f2-cbab-4013-a149-f02232b3ee9f'; // E-commerce study

  // Check the study data structure
  console.log('📋 Step 1: Check study structure');
  const { data: study, error: studyError } = await supabase
    .from('studies')
    .select('*')
    .eq('id', studyId)
    .single();

  if (studyError) {
    console.error('❌ Error fetching study:', studyError);
    return;
  }

  console.log('✅ Study found:');
  console.log('Columns available:', Object.keys(study));
  console.log('Study data:', JSON.stringify(study, null, 2));

  // Check if there's a separate blocks table
  console.log('\n📋 Step 2: Check for study_blocks table');
  try {
    const { data: blocks, error: blocksError } = await supabase
      .from('study_blocks')
      .select('*')
      .eq('study_id', studyId);

    if (blocksError) {
      console.log('⚠️ No study_blocks table found or accessible:', blocksError.message);
    } else {
      console.log(`✅ Found ${blocks.length} blocks for study:`);
      blocks.forEach((block, index) => {
        console.log(`  ${index + 1}. ID: ${block.id}, Type: ${block.type}, Order: ${block.order}`);
      });
    }
  } catch (e) {
    console.log('⚠️ No study_blocks table exists');
  }

  // Check if blocks are stored in the study settings or another field
  console.log('\n📋 Step 3: Check study settings for blocks');
  if (study.settings && typeof study.settings === 'object') {
    console.log('Study settings:', JSON.stringify(study.settings, null, 2));
    
    if (study.settings.blocks) {
      console.log('✅ Found blocks in study settings:', study.settings.blocks);
    } else {
      console.log('⚠️ No blocks found in study settings');
    }
  }

  // Check all tables to see what structure we have
  console.log('\n📋 Step 4: Check for other possible block storage');
  
  // Check if there are tasks (legacy)
  try {
    const { data: tasks, error: tasksError } = await supabase
      .from('study_tasks')
      .select('*')
      .eq('study_id', studyId);

    if (tasksError) {
      console.log('⚠️ No study_tasks table found');
    } else {
      console.log(`Found ${tasks.length} tasks for study`);
    }
  } catch (e) {
    console.log('⚠️ No study_tasks table exists');
  }

  console.log('\n🏁 Structure check complete');
}

checkStudyStructure().catch(console.error);
