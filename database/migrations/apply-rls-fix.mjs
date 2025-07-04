/**
 * Apply RLS Policy Fix to Supabase
 * This script fixes the missing RLS policies for study_applications table
 */

const supabaseUrl = 'https://wxpwxzdgdvinlbtnbgdf.supabase.co';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4cHd4emRnZHZpbmxidG5iZ2RmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDE5OTU4MCwiZXhwIjoyMDY1Nzc1NTgwfQ.mfJJZSWfvnZSfr4s6K7o4M3RZWgMtqR4vUCTv8cODZw';

async function applyRLSPolicies() {
    console.log('🔧 Applying RLS policies to study_applications table...');
    
    try {
        // Using fetch to make the request
        const { default: fetch } = await import('node-fetch');
        
        const sqlCommands = [
            'ALTER TABLE study_applications ENABLE ROW LEVEL SECURITY;',
            'DROP POLICY IF EXISTS "Participants can insert their own applications" ON study_applications;',
            'DROP POLICY IF EXISTS "Participants can view their own applications" ON study_applications;',
            'CREATE POLICY "Participants can insert their own applications" ON study_applications FOR INSERT TO authenticated WITH CHECK (auth.uid() = participant_id);',
            'CREATE POLICY "Participants can view their own applications" ON study_applications FOR SELECT TO authenticated USING (auth.uid() = participant_id);'
        ];
        
        for (const sql of sqlCommands) {
            console.log(`Executing: ${sql.substring(0, 50)}...`);
            
            const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${serviceKey}`,
                    'apikey': serviceKey
                },
                body: JSON.stringify({ query: sql })
            });
            
            const result = await response.text();
            console.log(`Result: ${result.substring(0, 100)}`);
        }
        
        console.log('✅ RLS policies applied successfully!');
        return true;
        
    } catch (error) {
        console.error('❌ Error applying RLS policies:', error);
        return false;
    }
}

applyRLSPolicies();
