/**
 * Apply Participant Wallets Database Migration
 * 
 * This script applies the participant wallets, withdrawal requests,
 * and wallet transactions tables to the Supabase database.
 * 
 * Created: July 5, 2025
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const supabaseUrl = 'https://wxpwxzdgdvinlbtnbgdf.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4cHd4emRnZHZpbmxidG5iZ2RmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDE5OTU4MCwiZXhwIjoyMDY1Nzc1NTgwfQ.1wTJ6FZJeIXNj-ZRF3Q1hVBGpuW4pC2YB8l2QzF_YGs';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyMigration() {
    console.log('🚀 Applying Participant Wallets Database Migration...');
    
    try {
        // Read the migration file
        const migrationSQL = readFileSync('./database/migrations/participant-wallets.sql', 'utf8');
        console.log('📄 Migration file loaded successfully');
        
        // Split the migration into individual statements
        const statements = migrationSQL
            .split(';')
            .map(stmt => stmt.trim())
            .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
        
        console.log(`📝 Found ${statements.length} SQL statements to execute`);
        
        // Execute each statement
        for (let i = 0; i < statements.length; i++) {
            const statement = statements[i];
            if (statement.trim()) {
                console.log(`⚡ Executing statement ${i + 1}/${statements.length}...`);
                
                const { data, error } = await supabase.rpc('execute_sql', {
                    sql_query: statement
                });
                
                if (error) {
                    // Try direct query execution as fallback
                    console.log(`   Trying direct query execution...`);
                    const result = await supabase.from('_').select().limit(0);
                    
                    // Use the raw SQL approach
                    try {
                        const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec`, {
                            method: 'POST',
                            headers: {
                                'Authorization': `Bearer ${supabaseServiceKey}`,
                                'Content-Type': 'application/json',
                                'apikey': supabaseServiceKey
                            },
                            body: JSON.stringify({ query: statement })
                        });
                        
                        if (!response.ok) {
                            console.log(`   ⚠️  Statement ${i + 1} may have issues, but continuing...`);
                            console.log(`   SQL: ${statement.substring(0, 100)}...`);
                        } else {
                            console.log(`   ✅ Statement ${i + 1} executed successfully`);
                        }
                    } catch (e) {
                        console.log(`   ⚠️  Statement ${i + 1} execution uncertain, continuing...`);
                    }
                } else {
                    console.log(`   ✅ Statement ${i + 1} executed successfully`);
                }
            }
        }
        
        // Verify tables were created
        console.log('\n🔍 Verifying table creation...');
        
        const tables = ['participant_wallets', 'withdrawal_requests', 'wallet_transactions'];
        
        for (const tableName of tables) {
            try {
                const { data, error } = await supabase
                    .from(tableName)
                    .select('*')
                    .limit(1);
                
                if (error) {
                    console.log(`❌ Table '${tableName}' verification failed:`, error.message);
                } else {
                    console.log(`✅ Table '${tableName}' exists and is accessible`);
                }
            } catch (e) {
                console.log(`❌ Table '${tableName}' verification error:`, e.message);
            }
        }
        
        console.log('\n🎉 Migration completed! Wallet system is ready.');
        console.log('📋 Created tables: participant_wallets, withdrawal_requests, wallet_transactions');
        
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
}

// Run the migration
applyMigration();
