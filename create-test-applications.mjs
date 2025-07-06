import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wxpwxzdgdvinlbtnbgdf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4cHd4emRnZHZpbmxidG5iZ2RmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAxOTk1ODAsImV4cCI6MjA2NTc3NTU4MH0.YMai9p4VQMbdqmc_9uWGeJ6nONHwuM9XT2FDTFy0aGk';

const supabase = createClient(supabaseUrl, supabaseKey);

async function createTestApplications() {
  console.log('=== Creating Test Applications ===');
  
  // Study and user IDs we know exist
  const studyId = '99a0f9b1-bdfe-46b8-961a-97dc3d29fb98'; // Fixed Study Creation Test
  const researcherId = 'b7e7a5c1-b4e2-4d5a-9a7b-123456789abc'; // Our researcher
  
  try {
    // First, update the study to have the correct researcher_id
    console.log('📚 Updating study researcher...');
    const { data: studyUpdate, error: studyError } = await supabase
      .from('studies')
      .update({ researcher_id: researcherId })
      .eq('id', studyId)
      .select();

    if (studyError) {
      console.error('❌ Error updating study:', studyError);
    } else {
      console.log('✅ Study updated successfully');
    }

    // Use valid UUID format for participant IDs
    const applications = [
      {
        study_id: studyId,
        participant_id: '9876c870-79e9-4106-99d6-9080049ec2aa', // Valid UUID
        status: 'pending',
        application_data: {
          screening_responses: [
            { question: 'Why do you want to participate?', answer: 'I am very interested in participating in this research study. I have experience with user testing and would love to contribute to your research.' }
          ],
          submitted_at: new Date().toISOString()
        },
        applied_at: new Date().toISOString()
      },
      {
        study_id: studyId,
        participant_id: '1234c870-79e9-4106-99d6-9080049ec2bb', // Valid UUID format
        status: 'pending',
        application_data: {
          screening_responses: [
            { question: 'What is your experience?', answer: 'I am a UX designer with 5 years of experience and would like to participate in this study to learn more about user research.' }
          ],
          submitted_at: new Date(Date.now() - 1000 * 60 * 60).toISOString()
        },
        applied_at: new Date(Date.now() - 1000 * 60 * 60).toISOString()
      },
      {
        study_id: studyId,
        participant_id: '5678c870-79e9-4106-99d6-9080049ec2cc', // Valid UUID format
        status: 'pending', 
        application_data: {
          screening_responses: [
            { question: 'Tell us about yourself', answer: 'As a frequent user of web applications, I believe I can provide valuable insights for your research study.' }
          ],
          submitted_at: new Date(Date.now() - 1000 * 60 * 30).toISOString()
        },
        applied_at: new Date(Date.now() - 1000 * 60 * 30).toISOString()
      }
    ];

    console.log('📝 Creating test applications...');
    
    for (let i = 0; i < applications.length; i++) {
      const app = applications[i];
      const { data, error } = await supabase
        .from('study_applications')
        .insert(app)
        .select();

      if (error) {
        console.error(`❌ Error creating application ${i + 1}:`, error);
      } else {
        console.log(`✅ Created application ${i + 1}: ${data[0]?.id}`);
      }
    }

    console.log('\n🎉 Test applications created successfully!');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

createTestApplications();
