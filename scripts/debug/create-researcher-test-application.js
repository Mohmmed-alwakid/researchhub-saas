import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wxpwxzdgdvinlbtnbgdf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4cHd4emRnZHZpbmxidG5iZ2RmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAxOTk1ODAsImV4cCI6MjA2NTc3NTU4MH0.YMai9p4VQMbdqmc_9uWGeJ6nONHwuM9XT2FDTFy0aGk';

const supabase = createClient(supabaseUrl, supabaseKey);

async function createTestApplicationForResearcher() {
  console.log('🔧 Creating test application for researcher study...');
  
  const researcherStudyId = 'baf92029-e512-4265-a01a-297a5a00f5b4'; // Usability Testing a New Product
  const participantId = '9876c870-79e9-4106-99d6-9080049ec2aa'; // Participant test account ID
  
  const applicationData = {
    study_id: researcherStudyId,
    participant_id: participantId,
    status: 'pending',
    application_data: {
      experience: 'I have 3+ years of experience in usability testing.',
      availability: 'Available weekdays 9am-5pm PST',
      motivation: 'I am passionate about improving user experiences and providing valuable feedback to help make products better.',
      demographics: {
        age: '25-34',
        profession: 'UX Designer',
        tech_comfort: 'Very comfortable'
      }
    },
    applied_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  try {
    console.log('Attempting to insert application...');
    console.log('Study ID:', researcherStudyId);
    console.log('Participant ID:', participantId);
    
    const { data, error } = await supabase
      .from('study_applications')
      .insert(applicationData)
      .select();
    
    console.log('Insert result:');
    console.log('Data:', data);
    console.log('Error:', error);
    
    if (error) {
      console.log('❌ Failed to create application');
      console.log('Error details:', error);
    } else {
      console.log('✅ Test application created successfully!');
      console.log('Application ID:', data[0]?.id);
      
      // Also verify we can query it back
      console.log('\n🔍 Verifying application was created...');
      const { data: checkData, error: checkError } = await supabase
        .from('study_applications')
        .select('*')
        .eq('study_id', researcherStudyId)
        .eq('participant_id', participantId);
        
      console.log('Verification result:');
      console.log('Data:', checkData);
      console.log('Error:', checkError);
    }
    
  } catch (error) {
    console.error('❌ Create application failed:', error);
  }
}

createTestApplicationForResearcher();
