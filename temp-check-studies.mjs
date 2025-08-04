import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://wxpwxzdgdvinlbtnbgdf.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4cHd4emRnZHZpbmxidG5iZ2RmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAxOTk1ODAsImV4cCI6MjA2NTc3NTU4MH0.YMai9p4VQMbdqmc_9uWGeJ6nONHwuM9XT2FDTFy0aGk'
);

console.log('🔍 Checking studies table...');

// First try to get any studies
const { data: studies, error } = await supabase
  .from('studies')
  .select('*')
  .limit(5);

if (error) {
  console.log('❌ Error:', error);
} else {
  console.log(`✅ Found ${studies?.length || 0} studies`);
  if (studies && studies.length > 0) {
    console.log('📝 Available columns:', Object.keys(studies[0]));
    console.log('🔍 Sample study:', studies[0]);
  } else {
    console.log('📝 No studies found, checking table schema...');
    
    // Try basic fields only
    const { data: basic, error: basicError } = await supabase
      .from('studies')
      .select('id, title, description, status, created_at')
      .limit(1);
      
    if (basicError) {
      console.log('❌ Basic query error:', basicError);
    } else {
      console.log('✅ Basic query works');
    }
  }
}
