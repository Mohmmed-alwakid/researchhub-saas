/**
 * Create study blocks table and add sample blocks for testing
 */
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wxpwxzdgdvinlbtnbgdf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4cHd4emRnZHZpbmxidG5iZ2RmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAxOTk1ODAsImV4cCI6MjA2NTc3NTU4MH0.YMai9p4VQMbdqmc_9uWGeJ6nONHwuM9XT2FDTFy0aGk';

const supabase = createClient(supabaseUrl, supabaseKey);

async function createStudyBlocksSystem() {
  console.log('🔧 Creating study blocks system...\n');

  const studyId = '6a9957f2-cbab-4013-a149-f02232b3ee9f'; // E-commerce study

  // First, let's create sample blocks directly in the study settings
  // This is simpler than creating a new table for now
  
  const sampleBlocks = [
    {
      id: 'block_1_welcome',
      type: 'welcome',
      order: 1,
      title: 'Welcome to the Study',
      description: 'Introduction and consent',
      isRequired: true,
      settings: {
        message: 'Welcome to our e-commerce checkout flow study! Your feedback will help us improve the shopping experience for millions of users.',
        showLogo: true,
        backgroundColor: '#f8fafc'
      }
    },
    {
      id: 'block_2_context',
      type: 'context_screen',
      order: 2,
      title: 'Study Instructions',
      description: 'What you\'ll be doing',
      isRequired: true,
      settings: {
        content: 'In this study, you\'ll navigate through a checkout process on our e-commerce platform. Please think aloud as you go through each step, sharing your thoughts and any confusion you might have.',
        duration: 'Take your time - there\'s no rush'
      }
    },
    {
      id: 'block_3_demographics',
      type: 'multiple_choice',
      order: 3,
      title: 'Background Information',
      description: 'Tell us about your online shopping experience',
      isRequired: true,
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
      id: 'block_4_website_test',
      type: 'live_website_test',
      order: 4,
      title: 'Checkout Flow Test',
      description: 'Navigate through the checkout process',
      isRequired: true,
      settings: {
        url: 'https://demo-ecommerce.researchhub.com/checkout',
        tasks: [
          'Add a product to your cart',
          'Proceed to checkout',
          'Fill in shipping information',
          'Select payment method',
          'Review your order'
        ],
        recordScreen: true,
        recordAudio: true
      }
    },
    {
      id: 'block_5_feedback',
      type: 'open_question',
      order: 5,
      title: 'Your Thoughts',
      description: 'Share your experience',
      isRequired: true,
      settings: {
        question: 'What was your overall experience with the checkout process? What would you improve?',
        placeholder: 'Please share your honest thoughts about the checkout flow...',
        minLength: 50
      }
    },
    {
      id: 'block_6_rating',
      type: 'opinion_scale',
      order: 6,
      title: 'Rate the Experience',
      description: 'How satisfied were you?',
      isRequired: true,
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
      id: 'block_7_thank_you',
      type: 'thank_you',
      order: 7,
      title: 'Thank You!',
      description: 'Study completed',
      isRequired: true,
      settings: {
        message: 'Thank you for participating in our study! Your feedback is incredibly valuable and will help us improve the shopping experience.',
        showCompensation: true,
        nextSteps: 'You will receive your compensation within 24 hours.'
      }
    }
  ];

  // Update the study with blocks in settings
  console.log('📋 Adding blocks to study settings...');
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
