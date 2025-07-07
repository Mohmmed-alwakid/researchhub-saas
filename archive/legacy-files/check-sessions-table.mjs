import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wxpwxzdgdvinlbtnbgdf.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4cHd4emRnZHZpbmxidG5iZ2RmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDE5OTU4MCwiZXhwIjoyMDY1Nzc1NTgwfQ.I_4j2vgcu2aR9Pw1d-QG2hpKunbmNKD8tWg3Psl0GNc';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkTable() {
  console.log('🔍 Checking study_sessions table structure...\n');

  // Try a raw SQL query to see table structure
  const { data: tableStructure, error: structureError } = await supabase
    .rpc('sql', {
      query: `
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_name = 'study_sessions'
        ORDER BY ordinal_position;
      `
    });

  console.log('📋 Table structure:', tableStructure);
  console.log('❌ Structure error:', structureError);

  // Check if table exists at all
  const { data: tableExists, error: existsError } = await supabase
    .rpc('sql', {
      query: `
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_name = 'study_sessions';
      `
    });

  console.log('\n📊 Table exists check:', tableExists);
  console.log('❌ Exists error:', existsError);

  // List all tables to see what we have
  const { data: allTables, error: allTablesError } = await supabase
    .rpc('sql', {
      query: `
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
        ORDER BY table_name;
      `
    });

  console.log('\n📋 All tables:', allTables);
  console.log('❌ All tables error:', allTablesError);
}

checkTable().catch(console.error);
