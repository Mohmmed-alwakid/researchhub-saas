/**
 * Fix RLS Policy for Study Applications
 * This script adds the missing RLS policy for study_applications table
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wxpwxzdgdvinlbtnbgdf.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4cHd4emRnZHZpbmxidG5iZ2RmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDE5OTU4MCwiZXhwIjoyMDY1Nzc1NTgwfQ.mfJJZSWfvnZSfr4s6K7o4M3RZWgMtqR4vUCTv8cODZw';

async function addRLSPolicy() {
  console.log('🔧 Fixing RLS Policy for study_applications table...');
  
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  try {
    // Add RLS policy to allow participants to insert their own applications
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: `
        -- Drop existing policy if it exists
        DROP POLICY IF EXISTS "Participants can insert their own applications" ON study_applications;
        
        -- Create policy for participants to insert applications
        CREATE POLICY "Participants can insert their own applications"
        ON study_applications
        FOR INSERT
        TO authenticated
        WITH CHECK (auth.uid() = participant_id);
        
        -- Drop existing select policy if it exists
        DROP POLICY IF EXISTS "Participants can view their own applications" ON study_applications;
        
        -- Create policy for participants to view their own applications
        CREATE POLICY "Participants can view their own applications"
        ON study_applications
        FOR SELECT
        TO authenticated
        USING (auth.uid() = participant_id);
        
        -- Drop existing update policy if it exists
        DROP POLICY IF EXISTS "Researchers can update applications" ON study_applications;
        
        -- Create policy for researchers to update applications
        CREATE POLICY "Researchers can update applications"
        ON study_applications
        FOR UPDATE
        TO authenticated
        USING (
          EXISTS (
            SELECT 1 FROM studies s 
            WHERE s.id = study_applications.study_id 
            AND s.researcher_id = auth.uid()
          )
        );
        
        -- Enable RLS if not already enabled
        ALTER TABLE study_applications ENABLE ROW LEVEL SECURITY;
      `
    });
    
    if (error) {
      console.error('❌ Failed to add RLS policy:', error);
      return false;
    }
    
    console.log('✅ RLS policies added successfully');
    return true;
    
  } catch (error) {
    console.error('❌ Error adding RLS policy:', error);
    return false;
  }
}

// Alternative method using direct SQL execution
async function addRLSPolicyDirect() {
  console.log('🔧 Adding RLS Policy using direct SQL...');
  
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  try {
    // Try to execute SQL directly
    const { data, error } = await supabase
      .from('study_applications')
      .select('id')
      .limit(1);
    
    console.log('Current table access test:', { data, error });
    
    // Add the policies one by one
    const policies = [
      {
        name: 'Enable RLS',
        sql: 'ALTER TABLE study_applications ENABLE ROW LEVEL SECURITY;'
      },
      {
        name: 'Participants can insert applications',
        sql: `CREATE POLICY "participants_can_insert" ON study_applications FOR INSERT TO authenticated WITH CHECK (auth.uid() = participant_id);`
      },
      {
        name: 'Participants can view own applications', 
        sql: `CREATE POLICY "participants_can_select" ON study_applications FOR SELECT TO authenticated USING (auth.uid() = participant_id);`
      }
    ];
    
    for (const policy of policies) {
      console.log(`Adding policy: ${policy.name}`);
      // Note: We need to use the service role to execute DDL
      const result = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseServiceKey}`,
          'apikey': supabaseServiceKey
        },
        body: JSON.stringify({ sql: policy.sql })
      });
      
      const response = await result.json();
      console.log(`Policy result:`, response);
    }
    
    return true;
    
  } catch (error) {
    console.error('❌ Error in direct SQL approach:', error);
    return false;
  }
}

console.log('🚀 Starting RLS Policy Fix...');
addRLSPolicyDirect().then(success => {
  if (success) {
    console.log('🎉 RLS Policy fix completed successfully!');
  } else {
    console.log('❌ RLS Policy fix failed');
  }
}).catch(console.error);
