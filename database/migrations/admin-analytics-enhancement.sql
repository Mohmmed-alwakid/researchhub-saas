-- Enhanced Admin Analytics Database Migration
-- Adds support for advanced analytics, fraud detection, and platform settings management

-- Author: ResearchHub Development Team
-- Date: July 2025
-- Version: 3.0 - Admin Analytics Enhancement

-- =============================================================================
-- 1. CREATE PLATFORM SETTINGS TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS platform_settings (
    id INTEGER PRIMARY KEY DEFAULT 1,
    
    -- Study cost settings (what researchers pay)
    study_base_cost INTEGER NOT NULL DEFAULT 10,
    cost_per_block INTEGER NOT NULL DEFAULT 2,
    cost_per_participant INTEGER NOT NULL DEFAULT 1,
    max_blocks_free INTEGER NOT NULL DEFAULT 5,
    max_participants_free INTEGER NOT NULL DEFAULT 10,
    
    -- Participant reward settings
    participant_base_reward INTEGER NOT NULL DEFAULT 5,
    participant_bonus_per_block INTEGER NOT NULL DEFAULT 1,
    participant_conversion_rate DECIMAL(5,3) NOT NULL DEFAULT 0.100,
    participant_min_withdrawal INTEGER NOT NULL DEFAULT 50,
    
    -- Platform revenue settings
    platform_fee_percent DECIMAL(5,2) NOT NULL DEFAULT 15.00,
    withdrawal_fee_percent DECIMAL(5,2) NOT NULL DEFAULT 2.50,
    
    -- Security and limits
    max_withdrawal_per_day INTEGER NOT NULL DEFAULT 1000,
    max_studies_per_participant_per_day INTEGER NOT NULL DEFAULT 10,
    fraud_detection_threshold INTEGER NOT NULL DEFAULT 100,
    
    -- Study quality thresholds
    min_study_duration_seconds INTEGER NOT NULL DEFAULT 60,
    max_study_duration_seconds INTEGER NOT NULL DEFAULT 3600,
    completion_rate_threshold DECIMAL(3,2) NOT NULL DEFAULT 0.80,
    
    -- Automated actions
    auto_approve_withdrawals_under INTEGER NOT NULL DEFAULT 100,
    auto_expire_points_days INTEGER NOT NULL DEFAULT 365,
    monthly_report_enabled BOOLEAN NOT NULL DEFAULT true,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_by UUID REFERENCES profiles(id)
);

-- Insert default settings
INSERT INTO platform_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- 2. CREATE ADMIN AUDIT LOG TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS admin_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    action VARCHAR(100) NOT NULL,
    details JSONB,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for audit log
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_admin_id ON admin_audit_log(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_timestamp ON admin_audit_log(timestamp);
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_action ON admin_audit_log(action);

-- =============================================================================
-- 3. ENHANCE STUDY SESSIONS TABLE FOR ANALYTICS
-- =============================================================================

-- Add analytics columns to study_sessions if they don't exist
ALTER TABLE study_sessions 
ADD COLUMN IF NOT EXISTS duration_seconds INTEGER,
ADD COLUMN IF NOT EXISTS blocks_completed INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS flags JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS quality_score DECIMAL(3,2);

-- Create index for analytics queries
CREATE INDEX IF NOT EXISTS idx_study_sessions_analytics ON study_sessions(status, completed_at, duration_seconds);

-- =============================================================================
-- 4. ENHANCE POINTS_TRANSACTIONS TABLE FOR FRAUD DETECTION
-- =============================================================================

-- Add fraud detection columns
ALTER TABLE points_transactions 
ADD COLUMN IF NOT EXISTS risk_score INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS fraud_flags JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS reviewed_by UUID REFERENCES profiles(id),
ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMP WITH TIME ZONE;

-- Create indexes for fraud detection
CREATE INDEX IF NOT EXISTS idx_points_transactions_risk ON points_transactions(risk_score) WHERE risk_score > 0;
CREATE INDEX IF NOT EXISTS idx_points_transactions_fraud ON points_transactions USING GIN(fraud_flags) WHERE fraud_flags != '{}';

-- =============================================================================
-- 5. CREATE PLATFORM REVENUE TRACKING VIEW
-- =============================================================================

CREATE OR REPLACE VIEW platform_revenue_summary AS
SELECT 
    DATE_TRUNC('day', created_at) as revenue_date,
    
    -- Researcher spending (income)
    SUM(CASE WHEN type IN ('consumed', 'spent') THEN ABS(amount) ELSE 0 END) as researcher_spending,
    
    -- Participant earnings (expense)
    SUM(CASE WHEN type = 'study_reward' THEN ABS(amount) ELSE 0 END) as participant_earnings,
    
    -- Platform fees (income)
    SUM(CASE WHEN type = 'withdrawal_fee' THEN ABS(amount) ELSE 0 END) as withdrawal_fees,
    
    -- Expired points (income)
    SUM(CASE WHEN type = 'expired' THEN ABS(amount) ELSE 0 END) as expired_points,
    
    -- Net revenue calculation
    SUM(CASE WHEN type IN ('consumed', 'spent') THEN ABS(amount) ELSE 0 END) - 
    SUM(CASE WHEN type = 'study_reward' THEN ABS(amount) ELSE 0 END) +
    SUM(CASE WHEN type = 'withdrawal_fee' THEN ABS(amount) ELSE 0 END) +
    SUM(CASE WHEN type = 'expired' THEN ABS(amount) ELSE 0 END) as net_revenue
    
FROM points_transactions
WHERE created_at >= NOW() - INTERVAL '365 days'
GROUP BY DATE_TRUNC('day', created_at)
ORDER BY revenue_date DESC;

-- =============================================================================
-- 6. CREATE STUDY ANALYTICS VIEW
-- =============================================================================

CREATE OR REPLACE VIEW study_analytics AS
SELECT 
    s.id as study_id,
    s.title,
    s.status,
    s.created_at,
    s.creator_id,
    p.email as creator_email,
    p.first_name as creator_first_name,
    p.last_name as creator_last_name,
    
    -- Study metrics
    COALESCE(jsonb_array_length(s.blocks), 0) as block_count,
    s.target_participants,
    
    -- Session metrics
    COUNT(ss.id) as total_sessions,
    COUNT(CASE WHEN ss.status = 'completed' THEN 1 END) as completed_sessions,
    CASE 
        WHEN COUNT(ss.id) > 0 THEN 
            ROUND(COUNT(CASE WHEN ss.status = 'completed' THEN 1 END)::DECIMAL / COUNT(ss.id) * 100, 2)
        ELSE 0 
    END as completion_rate,
    
    -- Points transactions
    COALESCE(SUM(CASE WHEN pt.type IN ('consumed', 'spent') THEN ABS(pt.amount) ELSE 0 END), 0) as researcher_spent,
    COALESCE(SUM(CASE WHEN pt.type = 'study_reward' THEN ABS(pt.amount) ELSE 0 END), 0) as participant_earned,
    
    -- Platform revenue calculation
    COALESCE(SUM(CASE WHEN pt.type IN ('consumed', 'spent') THEN ABS(pt.amount) ELSE 0 END), 0) - 
    COALESCE(SUM(CASE WHEN pt.type = 'study_reward' THEN ABS(pt.amount) ELSE 0 END), 0) as platform_revenue
    
FROM studies s
LEFT JOIN profiles p ON s.creator_id = p.id
LEFT JOIN study_sessions ss ON s.id = ss.study_id
LEFT JOIN points_transactions pt ON s.id = pt.study_id
WHERE s.created_at >= NOW() - INTERVAL '365 days'
GROUP BY s.id, s.title, s.status, s.created_at, s.creator_id, p.email, p.first_name, p.last_name, s.blocks, s.target_participants
ORDER BY s.created_at DESC;

-- =============================================================================
-- 7. CREATE PARTICIPANT EARNINGS VIEW
-- =============================================================================

CREATE OR REPLACE VIEW participant_earnings_summary AS
SELECT 
    p.id as participant_id,
    p.email,
    p.first_name,
    p.last_name,
    p.created_at as joined_date,
    
    -- Earnings metrics
    COUNT(DISTINCT ss.id) as studies_completed,
    COALESCE(SUM(CASE WHEN pt.type = 'study_reward' THEN ABS(pt.amount) ELSE 0 END), 0) as total_earned,
    COALESCE(SUM(CASE WHEN pt.type = 'withdrawal' THEN ABS(pt.amount) ELSE 0 END), 0) as total_withdrawn,
    COALESCE(SUM(CASE WHEN pt.type = 'withdrawal_fee' THEN ABS(pt.amount) ELSE 0 END), 0) as total_fees,
    
    -- Current balance
    COALESCE(pb.available_points, 0) as current_balance,
    
    -- Activity metrics
    COUNT(DISTINCT DATE_TRUNC('day', ss.completed_at)) as active_days,
    AVG(ss.duration_seconds) as avg_session_duration,
    
    -- Quality metrics
    AVG(ss.quality_score) as avg_quality_score,
    COUNT(CASE WHEN ss.flags::text != '{}' THEN 1 END) as flagged_sessions
    
FROM profiles p
LEFT JOIN study_sessions ss ON p.id = ss.participant_id AND ss.status = 'completed'
LEFT JOIN points_transactions pt ON p.id = pt.user_id
LEFT JOIN points_balance pb ON p.id = pb.user_id
WHERE p.role = 'participant'
GROUP BY p.id, p.email, p.first_name, p.last_name, p.created_at, pb.available_points
ORDER BY total_earned DESC;

-- =============================================================================
-- 8. CREATE FRAUD DETECTION FUNCTIONS
-- =============================================================================

-- Function to calculate risk score for transactions
CREATE OR REPLACE FUNCTION calculate_risk_score(
    user_id UUID,
    transaction_type VARCHAR,
    amount INTEGER,
    study_id UUID DEFAULT NULL
) RETURNS INTEGER AS $$
DECLARE
    risk_score INTEGER := 0;
    settings RECORD;
    user_history RECORD;
BEGIN
    -- Get platform settings
    SELECT * INTO settings FROM platform_settings WHERE id = 1;
    
    -- Get user transaction history
    SELECT 
        COUNT(*) as transaction_count,
        AVG(ABS(amount)) as avg_amount,
        MAX(ABS(amount)) as max_amount,
        COUNT(DISTINCT DATE_TRUNC('day', created_at)) as active_days
    INTO user_history
    FROM points_transactions 
    WHERE user_id = calculate_risk_score.user_id
    AND created_at >= NOW() - INTERVAL '30 days';
    
    -- Risk factors
    IF amount > settings.fraud_detection_threshold THEN
        risk_score := risk_score + 50;
    END IF;
    
    IF user_history.max_amount > 0 AND amount > user_history.max_amount * 3 THEN
        risk_score := risk_score + 30;
    END IF;
    
    IF user_history.avg_amount > 0 AND amount > user_history.avg_amount * 5 THEN
        risk_score := risk_score + 20;
    END IF;
    
    IF user_history.transaction_count > 100 THEN
        risk_score := risk_score + 15;
    END IF;
    
    RETURN LEAST(risk_score, 100); -- Cap at 100
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- 9. CREATE AUTOMATED TRIGGERS
-- =============================================================================

-- Trigger to update risk scores on new transactions
CREATE OR REPLACE FUNCTION update_transaction_risk_score() RETURNS TRIGGER AS $$
BEGIN
    NEW.risk_score := calculate_risk_score(NEW.user_id, NEW.type, NEW.amount, NEW.study_id);
    
    -- Add fraud flags based on risk score
    IF NEW.risk_score > 70 THEN
        NEW.fraud_flags := jsonb_build_object(
            'high_risk', true,
            'flagged_at', NOW(),
            'reason', 'Automated risk detection'
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_update_transaction_risk ON points_transactions;
CREATE TRIGGER trigger_update_transaction_risk
    BEFORE INSERT ON points_transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_transaction_risk_score();

-- =============================================================================
-- 10. CREATE RLS POLICIES FOR ADMIN ANALYTICS
-- =============================================================================

-- RLS for platform_settings (admin only)
ALTER TABLE platform_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can view platform settings" ON platform_settings
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Admin can update platform settings" ON platform_settings
    FOR UPDATE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- RLS for admin_audit_log (admin only)
ALTER TABLE admin_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can view audit log" ON admin_audit_log
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Admin can insert audit log" ON admin_audit_log
    FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- =============================================================================
-- 11. CREATE PERFORMANCE INDEXES
-- =============================================================================

-- Indexes for analytics queries
CREATE INDEX IF NOT EXISTS idx_studies_analytics ON studies(created_at, status, creator_id);
CREATE INDEX IF NOT EXISTS idx_study_sessions_analytics_full ON study_sessions(study_id, participant_id, status, completed_at);
CREATE INDEX IF NOT EXISTS idx_points_transactions_analytics ON points_transactions(study_id, type, created_at, amount);
CREATE INDEX IF NOT EXISTS idx_profiles_role_analytics ON profiles(role, created_at);

-- Composite indexes for complex queries
CREATE INDEX IF NOT EXISTS idx_points_transactions_user_type_date ON points_transactions(user_id, type, created_at);
CREATE INDEX IF NOT EXISTS idx_study_sessions_participant_date ON study_sessions(participant_id, completed_at) WHERE status = 'completed';

-- =============================================================================
-- 12. CREATE AUTOMATED REPORTS FUNCTION
-- =============================================================================

-- Function to generate daily platform summary
CREATE OR REPLACE FUNCTION generate_daily_platform_summary(target_date DATE DEFAULT CURRENT_DATE) 
RETURNS TABLE (
    report_date DATE,
    total_studies INTEGER,
    total_sessions INTEGER,
    completed_sessions INTEGER,
    researcher_spending INTEGER,
    participant_earnings INTEGER,
    platform_revenue INTEGER,
    new_users INTEGER,
    active_users INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        target_date,
        COUNT(DISTINCT s.id)::INTEGER as total_studies,
        COUNT(DISTINCT ss.id)::INTEGER as total_sessions,
        COUNT(DISTINCT CASE WHEN ss.status = 'completed' THEN ss.id END)::INTEGER as completed_sessions,
        COALESCE(SUM(CASE WHEN pt.type IN ('consumed', 'spent') THEN ABS(pt.amount) ELSE 0 END), 0)::INTEGER as researcher_spending,
        COALESCE(SUM(CASE WHEN pt.type = 'study_reward' THEN ABS(pt.amount) ELSE 0 END), 0)::INTEGER as participant_earnings,
        COALESCE(SUM(CASE WHEN pt.type IN ('consumed', 'spent') THEN ABS(pt.amount) ELSE 0 END), 0)::INTEGER - 
        COALESCE(SUM(CASE WHEN pt.type = 'study_reward' THEN ABS(pt.amount) ELSE 0 END), 0)::INTEGER as platform_revenue,
        COUNT(DISTINCT CASE WHEN p.created_at::DATE = target_date THEN p.id END)::INTEGER as new_users,
        COUNT(DISTINCT CASE WHEN ss.completed_at::DATE = target_date THEN ss.participant_id END)::INTEGER as active_users
    FROM studies s
    LEFT JOIN study_sessions ss ON s.id = ss.study_id
    LEFT JOIN points_transactions pt ON s.id = pt.study_id AND pt.created_at::DATE = target_date
    LEFT JOIN profiles p ON p.created_at::DATE = target_date
    WHERE s.created_at::DATE = target_date
       OR ss.completed_at::DATE = target_date
       OR pt.created_at::DATE = target_date
       OR p.created_at::DATE = target_date;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- MIGRATION COMPLETION LOG
-- =============================================================================

INSERT INTO admin_audit_log (admin_id, action, details) 
VALUES (
    '00000000-0000-0000-0000-000000000000'::UUID,
    'MIGRATION_COMPLETED',
    jsonb_build_object(
        'migration', 'admin_analytics_enhancement',
        'version', '3.0',
        'timestamp', NOW(),
        'tables_created', ARRAY['platform_settings', 'admin_audit_log'],
        'views_created', ARRAY['platform_revenue_summary', 'study_analytics', 'participant_earnings_summary'],
        'functions_created', ARRAY['calculate_risk_score', 'generate_daily_platform_summary'],
        'triggers_created', ARRAY['trigger_update_transaction_risk']
    )
);

-- Grant permissions for analytics views
GRANT SELECT ON platform_revenue_summary TO authenticated;
GRANT SELECT ON study_analytics TO authenticated;
GRANT SELECT ON participant_earnings_summary TO authenticated;
