import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wxpwxzdgdvinlbtnbgdf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4cHd4emRnZHZpbmxidG5iZ2RmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAxOTk1ODAsImV4cCI6MjA2NTc3NTU4MH0.YMai9p4VQMbdqmc_9uWGeJ6nONHwuM9XT2FDTFy0aGk';

async function debugStudyVisibility() {
  console.log('🔍 Debugging Study Visibility...');

  const supabase = createClient(supabaseUrl, supabaseKey);
  
  // Check latest studies
  console.log('📋 Checking all recent studies...');
  
  const { data: allStudies, error: allError } = await supabase
    .from('studies')
    .select('id, title, status, is_public, created_at, researcher_id')
    .order('created_at', { ascending: false })
    .limit(5);

  if (allStudies) {
    console.log(`✅ Found ${allStudies.length} recent studies:`);
    allStudies.forEach((study, index) => {
      console.log(`${index + 1}. ${study.title}`);
      console.log(`   ID: ${study.id}`);
      console.log(`   Status: ${study.status}`);
      console.log(`   Is Public: ${study.is_public}`);
      console.log(`   Researcher: ${study.researcher_id}`);
      console.log(`   Created: ${study.created_at}`);
      console.log('');
    });
  }

  // Check public studies specifically
  console.log('📋 Checking public studies only...');
  
  const { data: publicStudies, error: publicError } = await supabase
    .from('studies')
    .select('id, title, status, is_public')
    .eq('status', 'active')
    .eq('is_public', true);

  if (publicStudies) {
    console.log(`✅ Found ${publicStudies.length} public active studies:`);
    publicStudies.forEach((study, index) => {
      console.log(`${index + 1}. ${study.title} (${study.id})`);
    });
  } else {
    console.log('❌ Error fetching public studies:', publicError);
  }
}

debugStudyVisibility();
