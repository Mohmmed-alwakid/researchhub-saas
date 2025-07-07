import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wxpwxzdgdvinlbtnbgdf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4cHd4emRnZHZpbmxidG5iZ2RmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAxOTk1ODAsImV4cCI6MjA2NTc3NTU4MH0.YMai9p4VQMbdqmc_9uWGeJ6nONHwuM9XT2FDTFy0aGk';

const supabase = createClient(supabaseUrl, supabaseKey);

async function listAllStudies() {
  console.log('🔍 Listing all studies in database...\n');
  
  try {
    const { data: studies, error } = await supabase
      .from('studies')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('❌ Error fetching studies:', error);
      return;
    }
    
    console.log(`✅ Found ${studies.length} total studies:`);
    studies.forEach((study, index) => {
      console.log(`\n${index + 1}. "${study.title}"`);
      console.log(`   ID: ${study.id}`);
      console.log(`   Status: ${study.status}`);
      console.log(`   Is Public: ${study.is_public}`);
      console.log(`   Researcher: ${study.researcher_id}`);
      console.log(`   Created: ${study.created_at}`);
      if (study.title.includes('E-commerce') || study.title.includes('Checkout')) {
        console.log('   ⚠️ THIS LOOKS LIKE OUR TARGET STUDY!');
      }
    });
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

listAllStudies();
