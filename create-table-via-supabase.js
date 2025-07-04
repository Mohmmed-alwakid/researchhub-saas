// Simple script to create the payment_requests table via Supabase API
// This script will use the direct Supabase REST API to create the table

const fetch = require('node-fetch');

const SUPABASE_URL = 'https://wxpwxzdgdvinlbtnbgdf.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4cHd4emRnZHZpbmxidG5iZ2RmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDE5OTU4MCwiZXhwIjoyMDY1Nzc1NTgwfQ.pHO2-V_kKqOgbRqBQW1HjZmTfBqxLdQECCCv1fKKqRo';

const SQL_CREATE_TABLE = `
-- Create payment_requests table
CREATE TABLE IF NOT EXISTS payment_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    plan_type VARCHAR(50) NOT NULL DEFAULT 'basic',
    amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'rejected')),
    payment_method VARCHAR(100),
    payment_proof_url TEXT,
    admin_notes TEXT,
    requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processed_at TIMESTAMP WITH TIME ZONE,
    processed_by UUID REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_payment_requests_user_id ON payment_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_requests_status ON payment_requests(status);
CREATE INDEX IF NOT EXISTS idx_payment_requests_requested_at ON payment_requests(requested_at DESC);

-- Enable Row Level Security
ALTER TABLE payment_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Admin can view all payment requests" ON payment_requests
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Admin can insert payment requests" ON payment_requests
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Admin can update payment requests" ON payment_requests
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Users can view their own payment requests" ON payment_requests
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own payment requests" ON payment_requests
    FOR INSERT WITH CHECK (user_id = auth.uid());
`;

async function createTable() {
    try {
        console.log('Creating payment_requests table...');
        
        const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
                'apikey': SUPABASE_SERVICE_KEY
            },
            body: JSON.stringify({
                sql: SQL_CREATE_TABLE
            })
        });

        const result = await response.text();
        
        if (response.ok) {
            console.log('✅ Table created successfully!');
            console.log('Response:', result);
        } else {
            console.error('❌ Failed to create table');
            console.error('Status:', response.status);
            console.error('Response:', result);
        }
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

createTable();