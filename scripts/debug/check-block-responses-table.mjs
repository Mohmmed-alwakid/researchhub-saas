/**
 * Check and create block_responses table if needed
 * Date: June 30, 2025
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wxpwxzdgdvinlbtnbgdf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4cHd4emRnZHZpbmxidG5iZ2RmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAxOTk1ODAsImV4cCI6MjA2NTc3NTU4MH0.YMai9p4VQMbdqmc_9uWGeJ6nONHwuM9XT2FDTFy0aGk';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkBlockResponsesTable() {
  console.log('🔍 CHECKING BLOCK_RESPONSES TABLE');
  console.log('=' .repeat(40));

  try {
    // Try to query the table to see if it exists
    const { data, error } = await supabase
      .from('block_responses')
      .select('*')
      .limit(1);

    if (error) {
      if (error.message.includes('does not exist') || error.code === '42P01') {
        console.log('❌ Table block_responses does not exist');
        console.log('📝 Creating block_responses table...');
        
        // Create the table using SQL
        const { data: createResult, error: createError } = await supabase.rpc('exec_sql', {
          sql: `
            CREATE TABLE IF NOT EXISTS block_responses (
              id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
              session_id TEXT NOT NULL,
              block_id TEXT NOT NULL,
              response_data JSONB NOT NULL,
              time_spent INTEGER DEFAULT 0,
              created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
              updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
            
            -- Create index for faster queries
            CREATE INDEX IF NOT EXISTS idx_block_responses_session_id ON block_responses(session_id);
            CREATE INDEX IF NOT EXISTS idx_block_responses_block_id ON block_responses(block_id);
            
            -- Enable RLS
            ALTER TABLE block_responses ENABLE ROW LEVEL SECURITY;
            
            -- RLS policy for participants to access their own responses
            CREATE POLICY "Users can access their own block responses" ON block_responses
              FOR ALL USING (
                session_id IN (
                  SELECT id::text FROM study_sessions 
                  WHERE participant_id = auth.uid()::text
                )
              );
          `
        });

        if (createError) {
          console.error('❌ Failed to create table:', createError);
          return false;
        }

        console.log('✅ Table block_responses created successfully');
        return true;
      } else {
        console.error('❌ Unexpected error:', error);
        return false;
      }
    } else {
      console.log('✅ Table block_responses already exists');
      console.log(`📊 Found ${data?.length || 0} existing responses`);
      return true;
    }

  } catch (error) {
    console.error('❌ Error checking table:', error);
    
    // Fallback: try direct SQL approach
    console.log('🔄 Trying alternative approach...');
    
    const { data: sqlResult, error: sqlError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_name', 'block_responses');

    if (sqlError) {
      console.error('❌ Failed to query information_schema:', sqlError);
      return false;
    }

    if (sqlResult && sqlResult.length > 0) {
      console.log('✅ Table exists (confirmed via information_schema)');
      return true;
    } else {
      console.log('❌ Table does not exist (confirmed via information_schema)');
      console.log('💡 Please create the table manually in Supabase dashboard');
      return false;
    }
  }
}

// Alternative: Just test if we can insert a test record
async function testBlockResponseSaving() {
  console.log('\n🧪 TESTING BLOCK RESPONSE SAVING');
  console.log('=' .repeat(40));

  const testResponse = {
    session_id: 'test_session_' + Date.now(),
    block_id: 'test_block',
    response_data: { test: 'response' },
    time_spent: 15000
  };

  try {
    const { data, error } = await supabase
      .from('block_responses')
      .insert(testResponse)
      .select()
      .single();

    if (error) {
      console.error('❌ Failed to insert test response:', error);
      return false;
    }

    console.log('✅ Successfully inserted test response:', data.id);

    // Clean up test data
    await supabase
      .from('block_responses')
      .delete()
      .eq('id', data.id);

    console.log('✅ Test response cleaned up');
    return true;

  } catch (error) {
    console.error('❌ Error testing insert:', error);
    return false;
  }
}

// Run the checks
async function main() {
  const tableExists = await checkBlockResponsesTable();
  
  if (tableExists) {
    const insertWorks = await testBlockResponseSaving();
    
    if (insertWorks) {
      console.log('\n🎉 BLOCK RESPONSES TABLE IS READY!');
      console.log('✅ Table exists and inserts work properly');
    } else {
      console.log('\n⚠️  TABLE EXISTS BUT INSERTS FAIL');
      console.log('💡 Check RLS policies and permissions');
    }
  } else {
    console.log('\n❌ BLOCK RESPONSES TABLE SETUP FAILED');
    console.log('💡 Manual intervention required');
  }
}

main().catch(console.error);
