-- Create participant_wallets table
CREATE TABLE IF NOT EXISTS participant_wallets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    participant_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    balance DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    total_earned DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    total_withdrawn DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure one wallet per participant
    CONSTRAINT unique_participant_wallet UNIQUE (participant_id)
);

-- Create withdrawal_requests table  
CREATE TABLE IF NOT EXISTS withdrawal_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    participant_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    wallet_id UUID NOT NULL REFERENCES participant_wallets(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    payment_method VARCHAR(50) NOT NULL DEFAULT 'paypal',
    payment_details JSONB, -- Store PayPal email, bank details, etc.
    admin_notes TEXT,
    requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processed_at TIMESTAMP WITH TIME ZONE,
    processed_by UUID REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure amount is positive
    CONSTRAINT positive_withdrawal_amount CHECK (amount > 0)
);

-- Create wallet_transactions table for transaction history
CREATE TABLE IF NOT EXISTS wallet_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wallet_id UUID NOT NULL REFERENCES participant_wallets(id) ON DELETE CASCADE,
    transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('earning', 'withdrawal', 'adjustment')),
    amount DECIMAL(10,2) NOT NULL,
    balance_before DECIMAL(10,2) NOT NULL,
    balance_after DECIMAL(10,2) NOT NULL,
    reference_type VARCHAR(50), -- 'study_completion', 'withdrawal_request', 'admin_adjustment'
    reference_id UUID, -- ID of the study, withdrawal request, etc.
    description TEXT,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_participant_wallets_participant_id ON participant_wallets(participant_id);
CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_participant_id ON withdrawal_requests(participant_id);
CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_status ON withdrawal_requests(status);
CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_requested_at ON withdrawal_requests(requested_at DESC);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_wallet_id ON wallet_transactions(wallet_id);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_created_at ON wallet_transactions(created_at DESC);

-- Enable Row Level Security
ALTER TABLE participant_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE withdrawal_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallet_transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for participant_wallets
CREATE POLICY "Participants can view their own wallet" ON participant_wallets
    FOR SELECT USING (participant_id = auth.uid());

CREATE POLICY "Admin can view all wallets" ON participant_wallets
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "System can update wallets" ON participant_wallets
    FOR UPDATE USING (true);

CREATE POLICY "System can insert wallets" ON participant_wallets
    FOR INSERT WITH CHECK (true);

-- RLS Policies for withdrawal_requests
CREATE POLICY "Participants can view their own withdrawal requests" ON withdrawal_requests
    FOR SELECT USING (participant_id = auth.uid());

CREATE POLICY "Participants can create withdrawal requests" ON withdrawal_requests
    FOR INSERT WITH CHECK (participant_id = auth.uid());

CREATE POLICY "Admin can view all withdrawal requests" ON withdrawal_requests
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Admin can update withdrawal requests" ON withdrawal_requests
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- RLS Policies for wallet_transactions
CREATE POLICY "Participants can view their own transactions" ON wallet_transactions
    FOR SELECT USING (
        wallet_id IN (
            SELECT id FROM participant_wallets WHERE participant_id = auth.uid()
        )
    );

CREATE POLICY "Admin can view all transactions" ON wallet_transactions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "System can insert transactions" ON wallet_transactions
    FOR INSERT WITH CHECK (true);

-- Create function to automatically create wallet for new participants
CREATE OR REPLACE FUNCTION create_participant_wallet()
RETURNS TRIGGER AS $$
BEGIN
    -- Only create wallet for participants
    IF NEW.role = 'participant' THEN
        INSERT INTO participant_wallets (participant_id)
        VALUES (NEW.id)
        ON CONFLICT (participant_id) DO NOTHING;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-create wallets
DROP TRIGGER IF EXISTS trigger_create_participant_wallet ON profiles;
CREATE TRIGGER trigger_create_participant_wallet
    AFTER INSERT OR UPDATE OF role ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION create_participant_wallet();

-- Create function to add earnings to wallet
CREATE OR REPLACE FUNCTION add_wallet_earnings(
    p_participant_id UUID,
    p_amount DECIMAL(10,2),
    p_reference_type VARCHAR(50) DEFAULT 'study_completion',
    p_reference_id UUID DEFAULT NULL,
    p_description TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    v_wallet_id UUID;
    v_old_balance DECIMAL(10,2);
    v_new_balance DECIMAL(10,2);
BEGIN
    -- Get or create wallet
    INSERT INTO participant_wallets (participant_id)
    VALUES (p_participant_id)
    ON CONFLICT (participant_id) DO NOTHING;
    
    -- Get wallet info
    SELECT id, balance INTO v_wallet_id, v_old_balance
    FROM participant_wallets
    WHERE participant_id = p_participant_id;
    
    IF v_wallet_id IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- Calculate new balance
    v_new_balance := v_old_balance + p_amount;
    
    -- Update wallet
    UPDATE participant_wallets
    SET 
        balance = v_new_balance,
        total_earned = total_earned + p_amount,
        updated_at = NOW()
    WHERE id = v_wallet_id;
    
    -- Record transaction
    INSERT INTO wallet_transactions (
        wallet_id,
        transaction_type,
        amount,
        balance_before,
        balance_after,
        reference_type,
        reference_id,
        description
    ) VALUES (
        v_wallet_id,
        'earning',
        p_amount,
        v_old_balance,
        v_new_balance,
        p_reference_type,
        p_reference_id,
        COALESCE(p_description, 'Study completion reward')
    );
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Create function to process withdrawal
CREATE OR REPLACE FUNCTION process_withdrawal(
    p_withdrawal_id UUID,
    p_admin_id UUID,
    p_approved BOOLEAN,
    p_admin_notes TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    v_withdrawal withdrawal_requests%ROWTYPE;
    v_wallet_id UUID;
    v_old_balance DECIMAL(10,2);
    v_new_balance DECIMAL(10,2);
BEGIN
    -- Get withdrawal request
    SELECT * INTO v_withdrawal
    FROM withdrawal_requests
    WHERE id = p_withdrawal_id AND status = 'pending';
    
    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;
    
    -- Update withdrawal status
    UPDATE withdrawal_requests
    SET 
        status = CASE WHEN p_approved THEN 'approved' ELSE 'rejected' END,
        processed_at = NOW(),
        processed_by = p_admin_id,
        admin_notes = p_admin_notes,
        updated_at = NOW()
    WHERE id = p_withdrawal_id;
    
    -- If approved, deduct from wallet
    IF p_approved THEN
        -- Get wallet info
        SELECT id, balance INTO v_wallet_id, v_old_balance
        FROM participant_wallets
        WHERE id = v_withdrawal.wallet_id;
        
        -- Check sufficient balance
        IF v_old_balance < v_withdrawal.amount THEN
            -- Revert withdrawal status
            UPDATE withdrawal_requests
            SET status = 'rejected', admin_notes = 'Insufficient balance'
            WHERE id = p_withdrawal_id;
            RETURN FALSE;
        END IF;
        
        -- Calculate new balance
        v_new_balance := v_old_balance - v_withdrawal.amount;
        
        -- Update wallet
        UPDATE participant_wallets
        SET 
            balance = v_new_balance,
            total_withdrawn = total_withdrawn + v_withdrawal.amount,
            updated_at = NOW()
        WHERE id = v_wallet_id;
        
        -- Record transaction
        INSERT INTO wallet_transactions (
            wallet_id,
            transaction_type,
            amount,
            balance_before,
            balance_after,
            reference_type,
            reference_id,
            description,
            created_by
        ) VALUES (
            v_wallet_id,
            'withdrawal',
            -v_withdrawal.amount,
            v_old_balance,
            v_new_balance,
            'withdrawal_request',
            p_withdrawal_id,
            'Withdrawal processed',
            p_admin_id
        );
    END IF;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;
