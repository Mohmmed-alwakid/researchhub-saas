/**
 * Test the valid session to see if it works with proper data
 */
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wxpwxzdgdvinlbtnbgdf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4cHd4emRnZHZpbmxidG5iZ2RmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAxOTk1ODAsImV4cCI6MjA2NTc3NTU4MH0.YMai9p4VQMbdqmc_9uWGeJ6nONHwuM9XT2FDTFy0aGk';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testValidSession() {
  console.log('🔍 Testing valid session with existing study...\n');

  const validSessionId = 'session_1750807384890_9876c870';
  const validStudyId = '6a9957f2-cbab-4013-a149-f02232b3ee9f';

  console.log('📋 Step 1: Test session lookup without join');
  const { data: session, error: sessionError } = await supabase
    .from('recording_sessions')
    .select('*')
    .eq('id', validSessionId)
    .single();

  if (sessionError) {
    console.error('❌ Session lookup failed:', sessionError);
    return;
  }
  console.log('✅ Session found:', session);

  console.log('\n📋 Step 2: Test study lookup separately');
  const { data: study, error: studyError } = await supabase
    .from('studies')
    .select('*')
    .eq('id', validStudyId)
    .single();

  if (studyError) {
    console.error('❌ Study lookup failed:', studyError);
    return;
  }
  console.log('✅ Study found:', study);

  console.log('\n📋 Step 3: Try manual join instead of PostgREST relationship');
  // Instead of using the !inner syntax, let's do separate queries
  const sessionWithStudy = {
    ...session,
    study: study
  };

  console.log('✅ Manual join successful:', sessionWithStudy);

  console.log('\n📋 Step 4: Test if foreign key exists');
  const { data: fkData, error: fkError } = await supabase
    .rpc('get_foreign_keys', { table_name: 'recording_sessions' });

  if (fkError) {
    console.log('⚠️ Could not get foreign key info:', fkError.message);
  } else {
    console.log('📋 Foreign keys for recording_sessions:', fkData);
  }
}

testValidSession().catch(console.error);
