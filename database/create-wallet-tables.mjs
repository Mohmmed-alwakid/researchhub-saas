/**
 * Simple Table Creation for Wallet System
 * 
 * Creates the basic tables needed for the wallet system.
 * This is a simplified version without complex policies and functions.
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wxpwxzdgdvinlbtnbgdf.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4cHd4emRnZHZpbmxidG5iZ2RmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDE5OTU4MCwiZXhwIjoyMDY1Nzc1NTgwfQ.1wTJ6FZJeIXNj-ZRF3Q1hVBGpuW4pC2YB8l2QzF_YGs';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createTables() {
    console.log('🚀 Creating wallet system tables...');
    
    try {
        // First, try to create the participant_wallets table
        console.log('📋 Creating participant_wallets table...');
        
        // We'll use direct SQL query through the REST API
        const createWalletsTableSQL = `
            CREATE TABLE IF NOT EXISTS participant_wallets (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                participant_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
                balance DECIMAL(10,2) NOT NULL DEFAULT 0.00,
                total_earned DECIMAL(10,2) NOT NULL DEFAULT 0.00,
                total_withdrawn DECIMAL(10,2) NOT NULL DEFAULT 0.00,
                currency VARCHAR(3) NOT NULL DEFAULT 'USD',
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                CONSTRAINT unique_participant_wallet UNIQUE (participant_id)
            );
        `;
        
        const createWithdrawalsTableSQL = `
            CREATE TABLE IF NOT EXISTS withdrawal_requests (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                participant_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
                wallet_id UUID NOT NULL REFERENCES participant_wallets(id) ON DELETE CASCADE,
                amount DECIMAL(10,2) NOT NULL,
                status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
                payment_method VARCHAR(50) NOT NULL DEFAULT 'paypal',
                payment_details JSONB,
                admin_notes TEXT,
                requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                processed_at TIMESTAMP WITH TIME ZONE,
                processed_by UUID REFERENCES profiles(id),
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                CONSTRAINT positive_withdrawal_amount CHECK (amount > 0)
            );
        `;
        
        const createTransactionsTableSQL = `
            CREATE TABLE IF NOT EXISTS wallet_transactions (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                wallet_id UUID NOT NULL REFERENCES participant_wallets(id) ON DELETE CASCADE,
                transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('earning', 'withdrawal', 'adjustment')),
                amount DECIMAL(10,2) NOT NULL,
                balance_before DECIMAL(10,2) NOT NULL,
                balance_after DECIMAL(10,2) NOT NULL,
                reference_type VARCHAR(50),
                reference_id UUID,
                description TEXT,
                created_by UUID REFERENCES profiles(id),
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
        `;
        
        // Execute table creation directly via Supabase REST API
        const tables = [
            { name: 'participant_wallets', sql: createWalletsTableSQL },
            { name: 'withdrawal_requests', sql: createWithdrawalsTableSQL },
            { name: 'wallet_transactions', sql: createTransactionsTableSQL }
        ];
        
        for (const table of tables) {
            console.log(`   Creating ${table.name}...`);
            
            try {
                const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${supabaseServiceKey}`,
                        'Content-Type': 'application/json',
                        'apikey': supabaseServiceKey
                    },
                    body: JSON.stringify({ query: table.sql })
                });
                
                if (response.ok) {
                    console.log(`   ✅ ${table.name} created successfully`);
                } else {
                    console.log(`   ⚠️  ${table.name} creation response: ${response.status}`);
                }
            } catch (error) {
                console.log(`   ⚠️  ${table.name} creation may have failed: ${error.message}`);
            }
        }
        
        // Now test table access
        console.log('\n🔍 Testing table access...');
        
        for (const table of tables) {
            try {
                const { data, error } = await supabase
                    .from(table.name)
                    .select('*')
                    .limit(1);
                
                if (error) {
                    console.log(`❌ ${table.name} access failed: ${error.message}`);
                } else {
                    console.log(`✅ ${table.name} accessible`);
                }
            } catch (e) {
                console.log(`❌ ${table.name} test error: ${e.message}`);
            }
        }
        
        console.log('\n🎉 Table creation completed!');
        
    } catch (error) {
        console.error('❌ Table creation failed:', error);
        process.exit(1);
    }
}

// Run the table creation
createTables();
