/**
 * Create study blocks and add them to a study for testing
 */
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wxpwxzdgdvinlbtnbgdf.supabase.co';
const supabaseKey = ''PLACEHOLDER_SUPABASE_SERVICE_ROLE_KEY'';

const supabase = createClient(supabaseUrl, supabaseKey);

async function createStudyBlocksSystem() {
  console.log('🔧 Creating study blocks system...\n');

  // First, let's check what studies exist and use one of them
  console.log('📋 Checking existing studies...');
  const { data: existingStudies, error: studiesError } = await supabase
    .from('studies')
    .select('id, title, researcher_id, settings')
    .limit(1);

  if (studiesError) {
    console.error('❌ Error fetching studies:', studiesError);
    return;
  }

  if (!existingStudies || existingStudies.length === 0) {
    console.log('❌ No studies found. Please create a study first.');
    return;
  }

  const study = existingStudies[0];
  const studyId = study.id;
  console.log(`✅ Using existing study: ${study.title} (${studyId})`);

  // Create sample blocks for the existing study
  console.log('🎯 Creating study blocks...');
  
  const sampleBlocks = [
    {
      study_id: studyId,
      type: 'welcome',
      order: 1,
      title: 'Welcome to the Study',
      description: 'Introduction and consent',
      is_required: true,
      settings: {
        message: 'Welcome to our user experience study! Your feedback will help us improve our platform for everyone.',
        showLogo: true,
        backgroundColor: '#f8fafc'
      }
    },
    {
      study_id: studyId,
      type: 'context_screen',
      order: 2,
      title: 'Study Instructions',
      description: 'What you\'ll be doing',
      is_required: true,
      settings: {
        content: 'In this study, you\'ll be asked to complete several tasks and answer questions about your experience. Please be honest and detailed in your responses.',
        duration: 'This should take about 10-15 minutes'
      }
    },
    {
      study_id: studyId,
      type: 'multiple_choice',
      order: 3,
      title: 'Background Information',
      description: 'Tell us about yourself',
      is_required: true,
      settings: {
        question: 'How often do you use online platforms for research or work?',
        options: [
          'Daily',
          'Weekly', 
          'Monthly',
          'Rarely',
          'This is my first time'
        ],
        allowMultiple: false
      }
    },
    {
      study_id: studyId,
      type: 'open_question',
      order: 4,
      title: 'Your Thoughts',
      description: 'Share your experience',
      is_required: true,
      settings: {
        question: 'What are your initial impressions of this platform?',
        placeholder: 'Please share your honest thoughts...',
        minLength: 20
      }
    },
    {
      study_id: studyId,
      type: 'opinion_scale',
      order: 5,
      title: 'Rate the Experience',
      description: 'How satisfied were you?',
      is_required: true,
      settings: {
        question: 'How would you rate your overall experience so far?',
        scaleType: 'star',
        minValue: 1,
        maxValue: 5,
        labels: {
          min: 'Very Poor',
          max: 'Excellent'
        }
      }
    },
    {
      study_id: studyId,
      type: 'thank_you',
      order: 6,
      title: 'Thank You!',
      description: 'Study completed',
      is_required: true,
      settings: {
        message: 'Thank you for participating in our study! Your feedback is incredibly valuable and will help us improve the platform.',
        showCompensation: true,
        nextSteps: 'Your responses have been recorded. Thank you for your time!'
      }
    }
  ];

  // Update the study with blocks in settings
  console.log('📋 Adding blocks to study settings...');
  
  const updatedSettings = {
    ...study.settings || {},
    blocks: sampleBlocks,
    hasBlocks: true,
    blockCount: sampleBlocks.length
  };

  const { data: updatedStudy, error: updateError } = await supabase
    .from('studies')
    .update({ 
      settings: updatedSettings,
      updated_at: new Date().toISOString()
    })
    .eq('id', studyId)
    .select();

  if (updateError) {
    console.error('❌ Error updating study:', updateError);
    return;
  }

  console.log('✅ Successfully updated study with blocks!');
  console.log('📊 Study now has', sampleBlocks.length, 'blocks configured');
  
  // Verify the update
  console.log('\n🔍 Verifying blocks were added...');
  const { data: verifyStudy, error: verifyError } = await supabase
    .from('studies')
    .select('settings')
    .eq('id', studyId)
    .single();
    
  if (verifyError) {
    console.error('❌ Error verifying study:', verifyError);
    return;
  }
    
  if (verifyStudy?.settings?.blocks) {
    console.log('✅ Verification successful: Study has', verifyStudy.settings.blocks.length, 'blocks');
    console.log('📋 Block types:', verifyStudy.settings.blocks.map(b => b.type).join(', '));
  } else {
    console.log('❌ Verification failed: No blocks found in study settings');
  }

  console.log('\n🎉 Study blocks system created successfully!');
  console.log('🚀 You can now test the participant experience with these blocks');
}

createStudyBlocksSystem().catch(console.error);
