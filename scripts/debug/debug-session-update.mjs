/**
 * Debug session updating directly
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wxpwxzdgdvinlbtnbgdf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4cHd4emRnZHZpbmxidG5iZ2RmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAxOTk1ODAsImV4cCI6MjA2NTc3NTU4MH0.YMai9p4VQMbdqmc_9uWGeJ6nONHwuM9XT2FDTFy0aGk';

async function debugSessionUpdate() {
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  console.log('🔍 DEBUGGING SESSION UPDATE');
  
  // Find the latest session
  const { data: sessions, error: sessionError } = await supabase
    .from('study_sessions')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5);

  if (sessionError) {
    console.error('Error getting sessions:', sessionError);
    return;
  }

  console.log('Found sessions:', sessions.length);
  
  if (sessions.length > 0) {
    const session = sessions[0];
    console.log('Latest session:', {
      id: session.id,
      status: session.status,
      responses: session.responses || 'null'
    });

    // Try to update with test response
    const testResponse = {
      test_block: {
        blockType: 'welcome',
        response: { acknowledged: true },
        timeSpent: 5000,
        completedAt: new Date().toISOString()
      }
    };

    console.log('Attempting to update session with test response...');
    
    const { data: updateData, error: updateError } = await supabase
      .from('study_sessions')
      .update({
        responses: testResponse,
        updated_at: new Date().toISOString()
      })
      .eq('id', session.id)
      .select()
      .single();

    if (updateError) {
      console.error('Update error:', updateError);
    } else {
      console.log('Update successful:', {
        id: updateData.id,
        responses: updateData.responses
      });
    }
  }
}

debugSessionUpdate().catch(console.error);
