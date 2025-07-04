// Simple Database Table Check and Creation
// Tests if recording tables exist and creates them if needed

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wxpwxzdgdvinlbtnbgdf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4cHd4emRnZHZpbmxidG5iZ2RmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAxOTk1ODAsImV4cCI6MjA2NTc3NTU4MH0.YMai9p4VQMbdqmc_9uWGeJ6nONHwuM9XT2FDTFy0aGk';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAndCreateTables() {
  console.log('🔍 CHECKING DATABASE TABLES');
  console.log('=' .repeat(40));

  try {
    // Try to query the recording_sessions table
    console.log('1️⃣  Checking recording_sessions table...');
    const { data: sessionsData, error: sessionsError } = await supabase
      .from('recording_sessions')
      .select('id')
      .limit(1);

    if (sessionsError) {
      if (sessionsError.message.includes('does not exist')) {
        console.log('❌ recording_sessions table does not exist');
        await createRecordingSessionsTable();
      } else {
        console.log('⚠️  recording_sessions table error:', sessionsError.message);
      }
    } else {
      console.log('✅ recording_sessions table exists');
    }

    // Try to query the recordings table
    console.log('\n2️⃣  Checking recordings table...');
    const { data: recordingsData, error: recordingsError } = await supabase
      .from('recordings')
      .select('id')
      .limit(1);

    if (recordingsError) {
      if (recordingsError.message.includes('does not exist')) {
        console.log('❌ recordings table does not exist');
        await createRecordingsTable();
      } else {
        console.log('⚠️  recordings table error:', recordingsError.message);
      }
    } else {
      console.log('✅ recordings table exists');
    }

    // Test table access after creation
    console.log('\n3️⃣  Testing table access...');
    await testTableAccess();

  } catch (error) {
    console.error('❌ Database check failed:', error.message);
  }
}

async function createRecordingSessionsTable() {
  console.log('🛠️  Creating recording_sessions table...');
  
  const createTableSQL = `
    CREATE TABLE recording_sessions (
      id VARCHAR(255) PRIMARY KEY,
      study_id VARCHAR(255) NOT NULL,
      participant_id VARCHAR(255),
      researcher_id VARCHAR(255),
      status VARCHAR(50) DEFAULT 'active',
      session_name VARCHAR(255),
      session_description TEXT,
      recording_settings JSONB,
      metadata JSONB,
      started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      completed_at TIMESTAMP WITH TIME ZONE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `;

  try {
    const { error } = await supabase.rpc('exec_sql', { sql: createTableSQL });
    if (error) {
      console.log('⚠️  Could not create table via RPC:', error.message);
      console.log('📋 Manual creation required in Supabase dashboard');
    } else {
      console.log('✅ recording_sessions table created');
    }
  } catch (err) {
    console.log('⚠️  Table creation error:', err.message);
  }
}

async function createRecordingsTable() {
  console.log('🛠️  Creating recordings table...');
  
  const createTableSQL = `
    CREATE TABLE recordings (
      id VARCHAR(255) PRIMARY KEY,
      session_id VARCHAR(255) NOT NULL,
      study_id VARCHAR(255),
      participant_id VARCHAR(255),
      recording_data TEXT,
      mime_type VARCHAR(100) DEFAULT 'video/webm',
      status VARCHAR(50) DEFAULT 'recording',
      duration INTEGER DEFAULT 0,
      file_size BIGINT DEFAULT 0,
      recording_options JSONB,
      cloud_provider VARCHAR(50),
      cloud_path TEXT,
      cloud_url TEXT,
      video_properties JSONB,
      audio_properties JSONB,
      started_at TIMESTAMP WITH TIME ZONE,
      ended_at TIMESTAMP WITH TIME ZONE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `;

  try {
    const { error } = await supabase.rpc('exec_sql', { sql: createTableSQL });
    if (error) {
      console.log('⚠️  Could not create table via RPC:', error.message);
      console.log('📋 Manual creation required in Supabase dashboard');
    } else {
      console.log('✅ recordings table created');
    }
  } catch (err) {
    console.log('⚠️  Table creation error:', err.message);
  }
}

async function testTableAccess() {
  try {
    // Test inserting a sample recording session
    const testSessionId = `test-session-${Date.now()}`;
    const { data, error } = await supabase
      .from('recording_sessions')
      .insert({
        id: testSessionId,
        study_id: 'test-study-123',
        participant_id: 'test-participant-456',
        session_name: 'Test Session',
        status: 'active',
        recording_settings: { screen: true, audio: false }
      })
      .select();

    if (error) {
      console.log('⚠️  Test insert failed:', error.message);
    } else {
      console.log('✅ Test session created:', testSessionId);
      
      // Clean up test data
      await supabase
        .from('recording_sessions')
        .delete()
        .eq('id', testSessionId);
      console.log('✅ Test data cleaned up');
    }

  } catch (error) {
    console.log('⚠️  Table access test failed:', error.message);
  }
}

// Run the check
checkAndCreateTables();
