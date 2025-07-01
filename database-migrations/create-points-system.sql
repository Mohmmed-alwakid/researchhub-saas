-- Points System Database Migration
-- Replaces Stripe integration with admin-controlled points system
-- Created: July 1, 2025

-- Points Balance Table - Current balance for each user
CREATE TABLE IF NOT EXISTS points_balance (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    total_points INTEGER NOT NULL DEFAULT 0,
    available_points INTEGER NOT NULL DEFAULT 0,
    used_points INTEGER NOT NULL DEFAULT 0,
    expired_points INTEGER NOT NULL DEFAULT 0,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT valid_points CHECK (
        total_points >= 0 AND 
        available_points >= 0 AND 
        used_points >= 0 AND 
        expired_points >= 0 AND
        total_points = available_points + used_points + expired_points
    )
);

-- Points Transactions Table - Audit trail of all point movements
CREATE TABLE IF NOT EXISTS points_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL CHECK (type IN ('assigned', 'consumed', 'refunded', 'expired')),
    amount INTEGER NOT NULL, -- Positive for additions, negative for consumption
    balance INTEGER NOT NULL, -- Balance after this transaction
    reason TEXT NOT NULL,
    study_id UUID REFERENCES studies(id) ON DELETE SET NULL, -- If related to a study
    assigned_by UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- Admin who assigned points
    expires_at TIMESTAMP WITH TIME ZONE, -- When assigned points expire
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT valid_amount CHECK (
        (type = 'assigned' AND amount > 0) OR
        (type = 'consumed' AND amount < 0) OR
        (type = 'refunded' AND amount > 0) OR
        (type = 'expired' AND amount < 0)
    )
);

-- Study Costs Table - Define point costs for different study types
CREATE TABLE IF NOT EXISTS study_costs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    study_type VARCHAR(50) NOT NULL,
    base_cost INTEGER NOT NULL DEFAULT 10,
    per_participant_cost INTEGER NOT NULL DEFAULT 1,
    recording_cost INTEGER NOT NULL DEFAULT 5,
    advanced_analytics_cost INTEGER NOT NULL DEFAULT 2,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(study_type)
);

-- Insert default study costs
INSERT INTO study_costs (study_type, base_cost, per_participant_cost, recording_cost, advanced_analytics_cost, description) VALUES
('usability_test', 15, 2, 5, 3, 'Standard usability testing session'),
('survey', 5, 1, 0, 1, 'Survey and questionnaire studies'),
('interview', 25, 5, 10, 5, 'One-on-one user interviews'),
('card_sorting', 10, 1, 2, 2, 'Card sorting and information architecture'),
('tree_testing', 10, 1, 2, 2, 'Navigation and findability testing'),
('a_b_testing', 20, 2, 5, 5, 'A/B testing and comparison studies'),
('prototype_test', 20, 3, 8, 4, 'Prototype and design validation'),
('accessibility_test', 30, 4, 10, 6, 'Accessibility and inclusive design testing')
ON CONFLICT (study_type) DO NOTHING;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_points_transactions_user_id ON points_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_points_transactions_type ON points_transactions(type);
CREATE INDEX IF NOT EXISTS idx_points_transactions_created_at ON points_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_points_transactions_study_id ON points_transactions(study_id);
CREATE INDEX IF NOT EXISTS idx_points_transactions_assigned_by ON points_transactions(assigned_by);
CREATE INDEX IF NOT EXISTS idx_study_costs_type ON study_costs(study_type);

-- Row Level Security (RLS) Policies
ALTER TABLE points_balance ENABLE ROW LEVEL SECURITY;
ALTER TABLE points_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_costs ENABLE ROW LEVEL SECURITY;

-- Points Balance Policies
CREATE POLICY "Users can view their own points balance" ON points_balance
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all points balances" ON points_balance
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

CREATE POLICY "System can update points balances" ON points_balance
    FOR UPDATE USING (true);

CREATE POLICY "System can insert points balances" ON points_balance
    FOR INSERT WITH CHECK (true);

-- Points Transactions Policies
CREATE POLICY "Users can view their own transactions" ON points_transactions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all transactions" ON points_transactions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

CREATE POLICY "System can insert transactions" ON points_transactions
    FOR INSERT WITH CHECK (true);

-- Study Costs Policies
CREATE POLICY "All authenticated users can view study costs" ON study_costs
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage study costs" ON study_costs
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- Function to automatically update balance after transaction
CREATE OR REPLACE FUNCTION update_points_balance_after_transaction()
RETURNS TRIGGER AS $$
BEGIN
    -- Update the balance record
    INSERT INTO points_balance (user_id, total_points, available_points, used_points, expired_points)
    VALUES (
        NEW.user_id,
        GREATEST(0, COALESCE((SELECT total_points FROM points_balance WHERE user_id = NEW.user_id), 0) + 
            CASE WHEN NEW.type IN ('assigned', 'refunded') THEN NEW.amount ELSE 0 END),
        GREATEST(0, COALESCE((SELECT available_points FROM points_balance WHERE user_id = NEW.user_id), 0) + 
            CASE WHEN NEW.type = 'assigned' THEN NEW.amount
                 WHEN NEW.type = 'consumed' THEN NEW.amount
                 WHEN NEW.type = 'refunded' THEN NEW.amount
                 ELSE 0 END),
        GREATEST(0, COALESCE((SELECT used_points FROM points_balance WHERE user_id = NEW.user_id), 0) + 
            CASE WHEN NEW.type = 'consumed' THEN ABS(NEW.amount) ELSE 0 END),
        GREATEST(0, COALESCE((SELECT expired_points FROM points_balance WHERE user_id = NEW.user_id), 0) + 
            CASE WHEN NEW.type = 'expired' THEN ABS(NEW.amount) ELSE 0 END)
    )
    ON CONFLICT (user_id) DO UPDATE SET
        total_points = EXCLUDED.total_points,
        available_points = EXCLUDED.available_points,
        used_points = EXCLUDED.used_points,
        expired_points = EXCLUDED.expired_points,
        last_updated = NOW();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic balance updates
DROP TRIGGER IF EXISTS trigger_update_points_balance ON points_transactions;
CREATE TRIGGER trigger_update_points_balance
    AFTER INSERT ON points_transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_points_balance_after_transaction();

-- Function to calculate study cost
CREATE OR REPLACE FUNCTION calculate_study_cost(
    p_study_type VARCHAR(50),
    p_participant_count INTEGER DEFAULT 10,
    p_recording_enabled BOOLEAN DEFAULT false,
    p_advanced_analytics BOOLEAN DEFAULT false
)
RETURNS INTEGER AS $$
DECLARE
    cost_row study_costs%ROWTYPE;
    total_cost INTEGER;
BEGIN
    -- Get cost configuration for study type
    SELECT * INTO cost_row 
    FROM study_costs 
    WHERE study_type = p_study_type AND is_active = true;
    
    -- If no specific cost found, use default
    IF NOT FOUND THEN
        cost_row.base_cost := 10;
        cost_row.per_participant_cost := 1;
        cost_row.recording_cost := 5;
        cost_row.advanced_analytics_cost := 2;
    END IF;
    
    -- Calculate total cost
    total_cost := cost_row.base_cost + (cost_row.per_participant_cost * p_participant_count);
    
    -- Add recording cost if enabled
    IF p_recording_enabled THEN
        total_cost := total_cost + cost_row.recording_cost;
    END IF;
    
    -- Add analytics cost if enabled
    IF p_advanced_analytics THEN
        total_cost := total_cost + cost_row.advanced_analytics_cost;
    END IF;
    
    RETURN total_cost;
END;
$$ LANGUAGE plpgsql;

-- Create view for user points summary
CREATE OR REPLACE VIEW user_points_summary AS
SELECT 
    pb.user_id,
    p.email,
    p.first_name,
    p.last_name,
    p.role,
    pb.total_points,
    pb.available_points,
    pb.used_points,
    pb.expired_points,
    pb.last_updated,
    (SELECT COUNT(*) FROM points_transactions pt WHERE pt.user_id = pb.user_id) as transaction_count,
    (SELECT MAX(created_at) FROM points_transactions pt WHERE pt.user_id = pb.user_id AND pt.type = 'assigned') as last_assignment,
    (SELECT MAX(created_at) FROM points_transactions pt WHERE pt.user_id = pb.user_id AND pt.type = 'consumed') as last_consumption
FROM points_balance pb
JOIN profiles p ON pb.user_id = p.id;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE ON points_balance TO authenticated;
GRANT SELECT, INSERT ON points_transactions TO authenticated;
GRANT SELECT ON study_costs TO authenticated;
GRANT SELECT ON user_points_summary TO authenticated;

-- Grant admin permissions
GRANT ALL ON points_balance TO service_role;
GRANT ALL ON points_transactions TO service_role;
GRANT ALL ON study_costs TO service_role;
GRANT ALL ON user_points_summary TO service_role;
