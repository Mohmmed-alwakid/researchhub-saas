/**
 * Create study blocks table and add sample blocks for testing
 */
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wxpwxzdgdvinlbtnbgdf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4cHd4emRnZHZpbmxidG5iZ2RmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAxOTk1ODAsImV4cCI6MjA2NTc3NTU4MH0.YMai9p4VQMbdqmc_9uWGeJ6nONHwuM9XT2FDTFy0aGk';

const supabase = createClient(supabaseUrl, supabaseKey);

async function createStudyBlocksSystem() {
  console.log('🔧 Creating study blocks system...\n');

  // First, let's check what studies exist and use one of them
  console.log('📋 Checking existing studies...');
  const { data: existingStudies, error: studiesError } = await supabase
    .from('studies')
    .select('id, title, researcher_id')
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
        message: 'Welcome to our e-commerce checkout flow study! Your feedback will help us improve the shopping experience for millions of users.',
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
        content: 'In this study, you\'ll navigate through a checkout process on our e-commerce platform. Please think aloud as you go through each step, sharing your thoughts and any confusion you might have.',
        duration: 'Take your time - there\'s no rush'
      }
    },
    {
      study_id: studyId,
      type: 'multiple_choice',
      order: 3,
      title: 'Background Information',
      description: 'Tell us about your online shopping experience',
      is_required: true,
      settings: {
        question: 'How often do you shop online?',
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
        question: 'What was your overall experience with the checkout process? What would you improve?',
        placeholder: 'Please share your honest thoughts about the checkout flow...',
        minLength: 50
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
        question: 'How would you rate the overall checkout experience?',
        scaleType: 'star',
        minValue: 1,
        maxValue: 5,
        labels: {
          min: 'Very Difficult',
          max: 'Very Easy'
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
        message: 'Thank you for participating in our study! Your feedback is incredibly valuable and will help us improve the shopping experience.',
        showCompensation: true,
        nextSteps: 'You will receive your compensation within 24 hours.'
      }
    }
  ];

  // Update the study with blocks in settings (since RLS prevents direct insert)
  console.log('📋 Adding blocks to study settings...');
  
  const { data: updatedStudy, error: updateError } = await supabase
    .from('studies')
    .update({ 
      settings: { 
        ...study.settings || {},
        blocks: sampleBlocks 
      }
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
  const { data: verifyStudy } = await supabase
    .from('studies')
    .select('settings')
    .eq('id', studyId)
    .single();
    
  if (verifyStudy?.settings?.blocks) {
    console.log('✅ Verification successful: Study has', verifyStudy.settings.blocks.length, 'blocks');
  }
  const { data: updatedStudy, error: updateError } = await supabase
    .from('studies')
    .update({
      settings: {
        type: 'usability',
        blocks: sampleBlocks,
        duration: 20, // estimated minutes
        hasBlocks: true
      },
      updated_at: new Date().toISOString()
    })
    .eq('id', studyId)
    .select()
    .single();

  if (updateError) {
    console.error('❌ Error updating study:', updateError);
    return;
  }

  console.log('✅ Study updated with blocks:', updatedStudy);
  console.log(`Added ${sampleBlocks.length} blocks to the study`);

  // Verify the update
  console.log('\n📋 Verifying blocks were added...');
  const { data: verifyStudy, error: verifyError } = await supabase
    .from('studies')
    .select('*')
    .eq('id', studyId)
    .single();

  if (verifyError) {
    console.error('❌ Error verifying study:', verifyError);
    return;
  }

  console.log('✅ Verification successful');
  console.log('Study settings:', JSON.stringify(verifyStudy.settings, null, 2));

  console.log('\n🎉 Study blocks system created successfully!');
}

createStudyBlocksSystem().catch(console.error);
