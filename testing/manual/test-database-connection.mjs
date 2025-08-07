/**
 * Test Database Connection and Tables
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wxpwxzdgdvinlbtnbgdf.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4cHd4emRnZHZpbmxidG5iZ2RmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDE5OTU4MCwiZXhwIjoyMDY1Nzc1NTgwfQ.8uf_3CJODn75Vw0ksQ36r2D9s2JC8pKY6uHLl9O_SdM';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testDatabase() {
    console.log('🔍 Testing Database Connection...');
    
    try {
        // Test basic connection
        const { data, error } = await supabase
            .from('profiles')
            .select('id')
            .limit(1);
            
        if (error) {
            console.log('❌ Database Connection Failed:', error.message);
            return;
        }
        
        console.log('✅ Database Connection: SUCCESS');
        
        // Check if collaboration tables exist
        const tables = [
            'collaboration_sessions',
            'user_presence', 
            'collaboration_edits',
            'approval_queue',
            'approval_history',
            'comments',
            'comment_reactions',
            'collaboration_activity',
            'notifications'
        ];
        
        console.log('\n📋 Checking Collaboration Tables...');
        
        for (const table of tables) {
            try {
                const { data, error } = await supabase
                    .from(table)
                    .select('*')
                    .limit(1);
                    
                if (error) {
                    console.log(`❌ Table '${table}': NOT EXISTS`);
                } else {
                    console.log(`✅ Table '${table}': EXISTS`);
                }
            } catch (err) {
                console.log(`❌ Table '${table}': ERROR - ${err.message}`);
            }
        }
        
        console.log('\n🎯 RESULT: Some collaboration tables may need to be created');
        console.log('💡 TIP: You can create tables manually in Supabase SQL Editor if migration fails');
        
    } catch (error) {
        console.log('❌ Database Test Failed:', error.message);
    }
}

testDatabase();
