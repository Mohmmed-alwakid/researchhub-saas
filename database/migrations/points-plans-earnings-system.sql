-- Enhanced Points System with Plans and Participant Earnings
-- This migration adds support for subscription plans and participant withdrawal system

-- Author: ResearchHub Development Team
-- Date: July 2025
-- Version: 2.0

-- =============================================================================
-- 1. ENHANCE PROFILES TABLE FOR SUBSCRIPTION PLANS
-- =============================================================================

-- Add subscription plan fields to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS subscription_plan VARCHAR(20) DEFAULT 'free' 
CHECK (subscription_plan IN ('free', 'basic', 'pro', 'enterprise'));

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS plan_expires_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS plan_started_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS auto_renew BOOLEAN DEFAULT true;

-- =============================================================================
-- 2. CREATE WITHDRAWAL REQUESTS TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS withdrawal_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL CHECK (amount > 0),
    fee INTEGER NOT NULL DEFAULT 0,
    net_amount INTEGER NOT NULL CHECK (net_amount > 0),
    cash_value DECIMAL(10,2) NOT NULL CHECK (cash_value > 0),
    payout_method VARCHAR(20) NOT NULL CHECK (payout_method IN ('paypal', 'bank_transfer', 'gift_card')),
    payout_details JSONB NOT NULL, -- Store encrypted payout information
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed', 'failed')),
    admin_notes TEXT,
    external_transaction_id VARCHAR(100), -- PayPal transaction ID, bank reference, etc.
    requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processed_at TIMESTAMP WITH TIME ZONE,
    processed_by UUID REFERENCES profiles(id),
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- 3. CREATE PLAN SUBSCRIPTIONS TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS plan_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    plan_type VARCHAR(20) NOT NULL CHECK (plan_type IN ('free', 'basic', 'pro', 'enterprise')),
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired', 'paused')),
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    cancelled_at TIMESTAMP WITH TIME ZONE,
    auto_renew BOOLEAN DEFAULT true,
    monthly_points_allocated INTEGER NOT NULL DEFAULT 0,
    price_paid DECIMAL(10,2) DEFAULT 0,
    payment_method VARCHAR(50),
    stripe_subscription_id VARCHAR(100), -- For Stripe integration
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- 4. CREATE PARTICIPANT EARNINGS TRACKING TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS participant_earnings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    study_id UUID REFERENCES studies(id) ON DELETE SET NULL,
    points_earned INTEGER NOT NULL CHECK (points_earned > 0),
    cash_equivalent DECIMAL(10,2) NOT NULL CHECK (cash_equivalent >= 0),
    earning_type VARCHAR(30) NOT NULL DEFAULT 'study_completion' 
        CHECK (earning_type IN ('study_completion', 'bonus', 'referral', 'quality_bonus')),
    difficulty_multiplier DECIMAL(3,2) DEFAULT 1.0,
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    withdrawn BOOLEAN DEFAULT false,
    withdrawal_request_id UUID REFERENCES withdrawal_requests(id)
);

-- =============================================================================
-- 5. ENHANCE POINTS_TRANSACTIONS TABLE
-- =============================================================================

-- Add new transaction types and fields
ALTER TABLE points_transactions 
ADD COLUMN IF NOT EXISTS withdrawal_request_id UUID REFERENCES withdrawal_requests(id);

-- Update transaction type constraint to include new types
ALTER TABLE points_transactions 
DROP CONSTRAINT IF EXISTS chk_points_transactions_type;

ALTER TABLE points_transactions 
ADD CONSTRAINT chk_points_transactions_type 
CHECK (type IN (
    'assigned', 'consumed', 'earned', 'spent', 'expired', 'refunded', 
    'admin_assigned', 'admin_deducted', 'plan_allocation', 'bonus_points',
    'study_reward', 'withdrawal', 'withdrawal_fee', 'bonus_earned'
));

-- =============================================================================
-- 6. CREATE INDEXES FOR PERFORMANCE
-- =============================================================================

-- Indexes for withdrawal requests
CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_user_id ON withdrawal_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_status ON withdrawal_requests(status);
CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_requested_at ON withdrawal_requests(requested_at);

-- Indexes for plan subscriptions
CREATE INDEX IF NOT EXISTS idx_plan_subscriptions_user_id ON plan_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_plan_subscriptions_status ON plan_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_plan_subscriptions_expires_at ON plan_subscriptions(expires_at);

-- Indexes for participant earnings
CREATE INDEX IF NOT EXISTS idx_participant_earnings_user_id ON participant_earnings(user_id);
CREATE INDEX IF NOT EXISTS idx_participant_earnings_study_id ON participant_earnings(study_id);
CREATE INDEX IF NOT EXISTS idx_participant_earnings_earned_at ON participant_earnings(earned_at);

-- Indexes for enhanced profiles
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_plan ON profiles(subscription_plan);
CREATE INDEX IF NOT EXISTS idx_profiles_plan_expires_at ON profiles(plan_expires_at);

-- =============================================================================
-- 7. ROW LEVEL SECURITY POLICIES
-- =============================================================================

-- Enable RLS on new tables
ALTER TABLE withdrawal_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE plan_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE participant_earnings ENABLE ROW LEVEL SECURITY;

-- Withdrawal requests policies
CREATE POLICY "Users can view own withdrawal requests" 
ON withdrawal_requests FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own withdrawal requests" 
ON withdrawal_requests FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all withdrawal requests" 
ON withdrawal_requests FOR ALL 
USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role = 'admin'
    )
);

-- Plan subscriptions policies
CREATE POLICY "Users can view own plan subscriptions" 
ON plan_subscriptions FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update own plan subscriptions" 
ON plan_subscriptions FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all plan subscriptions" 
ON plan_subscriptions FOR ALL 
USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role = 'admin'
    )
);

-- Participant earnings policies
CREATE POLICY "Users can view own earnings" 
ON participant_earnings FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "System can create participant earnings" 
ON participant_earnings FOR INSERT 
WITH CHECK (true); -- System-level inserts allowed

CREATE POLICY "Admins can view all participant earnings" 
ON participant_earnings FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role = 'admin'
    )
);

-- =============================================================================
-- 8. STORED PROCEDURES FOR BUSINESS LOGIC
-- =============================================================================

-- Function to get user's current active plan
CREATE OR REPLACE FUNCTION get_user_active_plan(user_id_param UUID)
RETURNS TEXT AS $$
DECLARE
    active_plan TEXT;
BEGIN
    SELECT plan_type INTO active_plan
    FROM plan_subscriptions
    WHERE user_id = user_id_param
        AND status = 'active'
        AND (expires_at IS NULL OR expires_at > NOW())
    ORDER BY created_at DESC
    LIMIT 1;
    
    RETURN COALESCE(active_plan, 'free');
END;
$$ LANGUAGE plpgsql;

-- Function to calculate participant earnings for a study
CREATE OR REPLACE FUNCTION calculate_participant_reward(
    study_blocks INTEGER,
    difficulty TEXT DEFAULT 'normal'
)
RETURNS INTEGER AS $$
DECLARE
    base_reward INTEGER := 5;
    block_bonus INTEGER := 1;
    difficulty_multiplier DECIMAL := 1.0;
    total_reward INTEGER;
BEGIN
    -- Set difficulty multiplier
    CASE difficulty
        WHEN 'easy' THEN difficulty_multiplier := 0.8;
        WHEN 'normal' THEN difficulty_multiplier := 1.0;
        WHEN 'hard' THEN difficulty_multiplier := 1.5;
        WHEN 'expert' THEN difficulty_multiplier := 2.0;
        ELSE difficulty_multiplier := 1.0;
    END CASE;
    
    total_reward := ROUND((base_reward + (study_blocks * block_bonus)) * difficulty_multiplier);
    
    RETURN total_reward;
END;
$$ LANGUAGE plpgsql;

-- Function to check if user can withdraw points
CREATE OR REPLACE FUNCTION can_user_withdraw(user_id_param UUID, amount_param INTEGER)
RETURNS BOOLEAN AS $$
DECLARE
    current_balance INTEGER;
    min_withdrawal INTEGER := 50;
BEGIN
    SELECT available_points INTO current_balance
    FROM points_balance
    WHERE user_id = user_id_param;
    
    RETURN COALESCE(current_balance, 0) >= amount_param AND amount_param >= min_withdrawal;
END;
$$ LANGUAGE plpgsql;

-- Function to process monthly plan point allocation
CREATE OR REPLACE FUNCTION allocate_monthly_plan_points()
RETURNS INTEGER AS $$
DECLARE
    allocation_count INTEGER := 0;
    plan_record RECORD;
    plan_points INTEGER;
BEGIN
    -- Loop through active plans that need point allocation
    FOR plan_record IN 
        SELECT ps.user_id, ps.plan_type, p.id as profile_id
        FROM plan_subscriptions ps
        JOIN profiles p ON ps.user_id = p.id
        WHERE ps.status = 'active'
            AND (ps.expires_at IS NULL OR ps.expires_at > NOW())
            AND NOT EXISTS (
                SELECT 1 FROM points_transactions pt
                WHERE pt.user_id = ps.user_id
                    AND pt.type = 'plan_allocation'
                    AND DATE_TRUNC('month', pt.created_at) = DATE_TRUNC('month', NOW())
            )
    LOOP
        -- Get points for plan type
        CASE plan_record.plan_type
            WHEN 'free' THEN plan_points := 20;
            WHEN 'basic' THEN plan_points := 100;
            WHEN 'pro' THEN plan_points := 500;
            WHEN 'enterprise' THEN plan_points := 2000;
            ELSE plan_points := 20;
        END CASE;
        
        -- Create allocation transaction
        INSERT INTO points_transactions (user_id, type, amount, reason, balance)
        VALUES (
            plan_record.user_id,
            'plan_allocation',
            plan_points,
            'Monthly ' || plan_record.plan_type || ' plan allocation',
            (SELECT available_points FROM points_balance WHERE user_id = plan_record.user_id) + plan_points
        );
        
        allocation_count := allocation_count + 1;
    END LOOP;
    
    RETURN allocation_count;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- 9. CREATE VIEWS FOR REPORTING
-- =============================================================================

-- View for user plan and points summary
CREATE OR REPLACE VIEW user_plan_summary AS
SELECT 
    p.id as user_id,
    p.email,
    p.first_name,
    p.last_name,
    p.role,
    p.subscription_plan,
    p.plan_expires_at,
    COALESCE(pb.available_points, 0) as available_points,
    COALESCE(pb.total_points, 0) as total_points,
    COALESCE(pb.used_points, 0) as used_points,
    ps.status as subscription_status,
    ps.auto_renew,
    ps.monthly_points_allocated
FROM profiles p
LEFT JOIN points_balance pb ON p.id = pb.user_id
LEFT JOIN plan_subscriptions ps ON p.id = ps.user_id AND ps.status = 'active';

-- View for participant earnings summary
CREATE OR REPLACE VIEW participant_earnings_summary AS
SELECT 
    p.id as user_id,
    p.email,
    p.first_name,
    p.last_name,
    COALESCE(SUM(pe.points_earned), 0) as total_points_earned,
    COALESCE(SUM(pe.cash_equivalent), 0) as total_cash_earned,
    COALESCE(SUM(CASE WHEN pe.withdrawn THEN pe.points_earned ELSE 0 END), 0) as points_withdrawn,
    COALESCE(SUM(CASE WHEN NOT pe.withdrawn THEN pe.points_earned ELSE 0 END), 0) as points_available,
    COUNT(pe.id) as studies_completed
FROM profiles p
LEFT JOIN participant_earnings pe ON p.id = pe.user_id
WHERE p.role = 'participant'
GROUP BY p.id, p.email, p.first_name, p.last_name;

-- View for withdrawal requests with user details
CREATE OR REPLACE VIEW withdrawal_requests_with_users AS
SELECT 
    wr.*,
    p.email,
    p.first_name,
    p.last_name,
    admin.email as processed_by_email,
    admin.first_name as processed_by_first_name,
    admin.last_name as processed_by_last_name
FROM withdrawal_requests wr
JOIN profiles p ON wr.user_id = p.id
LEFT JOIN profiles admin ON wr.processed_by = admin.id;

-- =============================================================================
-- 10. TRIGGERS FOR AUTOMATIC UPDATES
-- =============================================================================

-- Trigger to update participant earnings when transaction is created
CREATE OR REPLACE FUNCTION update_participant_earnings_on_transaction()
RETURNS TRIGGER AS $$
BEGIN
    -- If this is a study reward transaction, create participant earnings record
    IF NEW.type = 'study_reward' THEN
        INSERT INTO participant_earnings (
            user_id,
            study_id,
            points_earned,
            cash_equivalent,
            earning_type
        ) VALUES (
            NEW.user_id,
            NEW.study_id,
            NEW.amount,
            NEW.amount * 0.10, -- $0.10 per point
            'study_completion'
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_participant_earnings ON points_transactions;
CREATE TRIGGER trigger_update_participant_earnings
    AFTER INSERT ON points_transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_participant_earnings_on_transaction();

-- Trigger to update withdrawal request status
CREATE OR REPLACE FUNCTION update_withdrawal_request_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    
    -- Set completed_at when status changes to completed
    IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
        NEW.completed_at = NOW();
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_withdrawal_request_timestamp ON withdrawal_requests;
CREATE TRIGGER trigger_withdrawal_request_timestamp
    BEFORE UPDATE ON withdrawal_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_withdrawal_request_timestamp();

-- =============================================================================
-- 11. GRANTS AND PERMISSIONS
-- =============================================================================

-- Grant permissions on new tables
GRANT SELECT, INSERT, UPDATE ON withdrawal_requests TO authenticated;
GRANT SELECT, INSERT, UPDATE ON plan_subscriptions TO authenticated;
GRANT SELECT, INSERT ON participant_earnings TO authenticated;

-- Grant execute permissions on new functions
GRANT EXECUTE ON FUNCTION get_user_active_plan(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION calculate_participant_reward(INTEGER, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION can_user_withdraw(UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION allocate_monthly_plan_points() TO authenticated;

-- Grant select permissions on views
GRANT SELECT ON user_plan_summary TO authenticated;
GRANT SELECT ON participant_earnings_summary TO authenticated;
GRANT SELECT ON withdrawal_requests_with_users TO authenticated;

-- =============================================================================
-- 12. INITIAL DATA SETUP
-- =============================================================================

-- Set all existing users to free plan if not already set
UPDATE profiles 
SET subscription_plan = 'free' 
WHERE subscription_plan IS NULL;

-- Create initial plan subscriptions for existing users
INSERT INTO plan_subscriptions (user_id, plan_type, status, started_at)
SELECT id, 'free', 'active', NOW()
FROM profiles
WHERE id NOT IN (SELECT user_id FROM plan_subscriptions)
ON CONFLICT DO NOTHING;

-- =============================================================================
-- MIGRATION COMPLETION
-- =============================================================================

-- Log migration completion
INSERT INTO migrations (name, executed_at) VALUES ('points_plans_earnings_system', NOW())
ON CONFLICT (name) DO UPDATE SET executed_at = NOW();

-- Migration completed successfully
SELECT 'Points System with Plans and Earnings Migration Completed Successfully' AS status;
