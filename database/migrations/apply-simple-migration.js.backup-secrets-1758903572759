/**
 * Simple Study Blocks Migration - Individual Table Creation
 * 
 * Creates tables one by one for better error handling
 * Usage: node apply-simple-migration.js
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wxpwxzdgdvinlbtnbgdf.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4cHd4emRnZHZpbmxidG5iZ2RmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDE5OTU4MCwiZXhwIjoyMDY1Nzc1NTgwfQ.nK8KuNAXFHqf0NiIq2vhv7lInNPKJxKiGAthk-g8oWo';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createTables() {
  console.log('🚀 Starting Study Blocks Migration...');

  // 1. Create block_templates table
  console.log('📋 Creating block_templates table...');
  try {
    const { error: templatesError } = await supabase.rpc('create_block_templates_table');
    if (templatesError && !templatesError.message.includes('already exists')) {
      console.error('❌ Error creating block_templates:', templatesError);
    } else {
      console.log('✅ block_templates table ready');
    }
  } catch (err) {
    console.log('ℹ️ block_templates table creation skipped (likely exists)');
  }

  // 2. Create study_blocks table
  console.log('📋 Creating study_blocks table...');
  try {
    const { error: blocksError } = await supabase.rpc('create_study_blocks_table');
    if (blocksError && !blocksError.message.includes('already exists')) {
      console.error('❌ Error creating study_blocks:', blocksError);
    } else {
      console.log('✅ study_blocks table ready');
    }
  } catch (err) {
    console.log('ℹ️ study_blocks table creation skipped (likely exists)');
  }

  // 3. Create block_responses table
  console.log('📋 Creating block_responses table...');
  try {
    const { error: responsesError } = await supabase.rpc('create_block_responses_table');
    if (responsesError && !responsesError.message.includes('already exists')) {
      console.error('❌ Error creating block_responses:', responsesError);
    } else {
      console.log('✅ block_responses table ready');
    }
  } catch (err) {
    console.log('ℹ️ block_responses table creation skipped (likely exists)');
  }

  // 4. Create block_analytics table
  console.log('📋 Creating block_analytics table...');
  try {
    const { error: analyticsError } = await supabase.rpc('create_block_analytics_table');
    if (analyticsError && !analyticsError.message.includes('already exists')) {
      console.error('❌ Error creating block_analytics:', analyticsError);
    } else {
      console.log('✅ block_analytics table ready');
    }
  } catch (err) {
    console.log('ℹ️ block_analytics table creation skipped (likely exists)');
  }

  // Verify tables exist
  console.log('\n🔍 Verifying tables...');
  const tables = ['block_templates', 'study_blocks', 'block_responses', 'block_analytics'];
  
  for (const table of tables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);
      
      if (error) {
        console.log(`❌ Table ${table} not accessible:`, error.message);
      } else {
        console.log(`✅ Table ${table} exists and accessible`);
      }
    } catch (err) {
      console.log(`❌ Table ${table} check failed:`, err.message);
    }
  }

  console.log('\n🎉 Migration verification complete!');
}

// Run migration
createTables().catch(console.error);
