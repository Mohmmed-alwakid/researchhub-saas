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
CREATE INDEX IF NOT EXISTS idx_payment_requests_processed_by ON payment_requests(processed_by);

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

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_payment_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER payment_requests_updated_at_trigger
    BEFORE UPDATE ON payment_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_payment_requests_updated_at();

-- Insert sample data
INSERT INTO payment_requests (user_id, plan_type, amount, currency, status, payment_method, payment_proof_url, admin_notes, requested_at, processed_at)
SELECT 
    p.id,
    CASE WHEN row_number() OVER (ORDER BY p.created_at) = 1 THEN 'pro'
         WHEN row_number() OVER (ORDER BY p.created_at) = 2 THEN 'enterprise'
         ELSE 'basic'
    END,
    CASE WHEN row_number() OVER (ORDER BY p.created_at) = 1 THEN 29.99
         WHEN row_number() OVER (ORDER BY p.created_at) = 2 THEN 99.99
         ELSE 9.99
    END,
    'USD',
    CASE WHEN row_number() OVER (ORDER BY p.created_at) = 1 THEN 'pending'
         WHEN row_number() OVER (ORDER BY p.created_at) = 2 THEN 'verified'
         ELSE 'rejected'
    END,
    CASE WHEN row_number() OVER (ORDER BY p.created_at) = 1 THEN 'Bank Transfer'
         WHEN row_number() OVER (ORDER BY p.created_at) = 2 THEN 'PayPal'
         ELSE 'Credit Card'
    END,
    'https://example.com/proof' || row_number() OVER (ORDER BY p.created_at) || '.pdf',
    CASE WHEN row_number() OVER (ORDER BY p.created_at) = 2 THEN 'Payment verified successfully'
         WHEN row_number() OVER (ORDER BY p.created_at) = 3 THEN 'Insufficient payment proof'
         ELSE ''
    END,
    NOW() - INTERVAL '1 day' * row_number() OVER (ORDER BY p.created_at),
    CASE WHEN row_number() OVER (ORDER BY p.created_at) > 1 THEN NOW() - INTERVAL '1 day' * (row_number() OVER (ORDER BY p.created_at) - 1)
         ELSE NULL
    END
FROM profiles p
WHERE p.role IN ('researcher', 'participant')
LIMIT 3
ON CONFLICT (id) DO NOTHING;
