import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wxpwxzdgdvinlbtnbgdf.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4cHd4emRnZHZpbmxidG5iZ2RmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDE5OTU4MCwiZXhwIjoyMDY1Nzc1NTgwfQ.cQT7DvWl_uVY4-_2sNGMDFgFb_1cFWgtHX6y1fy3bXI';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkExistingTables() {
  console.log('🔍 Checking existing table structures for sessions...');
  
  const tablesToCheck = ['study_sessions', 'recordings', 'recording_sessions'];
  
  for (const tableName of tablesToCheck) {
    console.log(`\n📋 Checking table: ${tableName}`);
    
    try {
      // Try to select from the table
      const { data: sampleData, error: selectError } = await supabase
        .from(tableName)
        .select('*')
        .limit(1)
        .single();
      
      if (selectError && selectError.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.log(`❌ Error selecting from ${tableName}:`, selectError.message);
        continue;
      }
      
      console.log(`✅ Table ${tableName} exists`);
      
      // Try to get table info using a raw SQL query
      const { data: tableInfo, error: infoError } = await supabase
        .from('information_schema.columns')
        .select('column_name, data_type, is_nullable, column_default')
        .eq('table_name', tableName)
        .eq('table_schema', 'public');
      
      if (infoError) {
        console.log(`Could not get column info: ${infoError.message}`);
        
        // Alternative approach - try to describe the table
        const { data: rawInfo, error: rawError } = await supabase
          .rpc('exec', { sql: `SELECT column_name, data_type FROM information_schema.columns WHERE table_name = '${tableName}' AND table_schema = 'public'` });
          
        if (!rawError && rawInfo) {
          console.log('Columns from raw query:', rawInfo);
        }
      } else {
        console.log('Columns:');
        tableInfo?.forEach(col => {
          console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
        });
      }
      
      // Show sample data if available
      if (sampleData) {
        console.log('Sample data keys:', Object.keys(sampleData));
      } else {
        console.log('No sample data available');
      }
      
    } catch (error) {
      console.log(`❌ Error checking ${tableName}:`, error);
    }
  }
}

checkExistingTables();
