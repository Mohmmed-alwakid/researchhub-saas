-- =====================================================================================
-- COMPREHENSIVE USAGE TRACKING & ADMIN SYSTEM MIGRATION
-- Created: September 1, 2025
-- Purpose: Complete database schema for usage tracking, admin functionality, and analytics
-- =====================================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================================================
-- 1. ENHANCED USAGE TRACKING SYSTEM
-- =====================================================================================

-- User usage statistics with real-time tracking
CREATE TABLE IF NOT EXISTS user_usage_stats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Current period tracking
    current_period_start TIMESTAMP WITH TIME ZONE DEFAULT DATE_TRUNC('month', NOW()),
    current_period_end TIMESTAMP WITH TIME ZONE DEFAULT (DATE_TRUNC('month', NOW()) + INTERVAL '1 month'),
    
    -- Study usage
    studies_created_this_period INTEGER DEFAULT 0,
    studies_total INTEGER DEFAULT 0,
    max_studies_allowed INTEGER DEFAULT 3, -- Free plan limit
    
    -- Participant usage
    participants_this_period INTEGER DEFAULT 0,
    participants_total INTEGER DEFAULT 0,
    max_participants_per_study INTEGER DEFAULT 10, -- Free plan limit
    
    -- Recording usage (in minutes)
    recording_minutes_this_period INTEGER DEFAULT 0,
    recording_minutes_total INTEGER DEFAULT 0,
    max_recording_minutes INTEGER DEFAULT 60, -- Free plan limit
    
    -- Feature usage flags
    advanced_analytics_enabled BOOLEAN DEFAULT FALSE,
    data_export_enabled BOOLEAN DEFAULT FALSE,
    team_collaboration_enabled BOOLEAN DEFAULT FALSE,
    priority_support_enabled BOOLEAN DEFAULT FALSE,
    custom_branding_enabled BOOLEAN DEFAULT FALSE,
    api_access_enabled BOOLEAN DEFAULT FALSE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id)
);

-- Usage events tracking for analytics
CREATE TABLE IF NOT EXISTS usage_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Event details
    event_type VARCHAR(50) NOT NULL, -- 'study_created', 'participant_invited', 'recording_started', etc.
    event_category VARCHAR(30) NOT NULL, -- 'study', 'participant', 'recording', 'billing', etc.
    event_data JSONB DEFAULT '{}',
    
    -- Context
    study_id UUID REFERENCES studies(id) ON DELETE SET NULL,
    organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
    session_id VARCHAR(100),
    ip_address INET,
    user_agent TEXT,
    
    -- Metrics
    duration_seconds INTEGER, -- For events with duration
    bytes_processed BIGINT,   -- For file/data operations
    
    -- Timestamps
    occurred_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Plan limits configuration
CREATE TABLE IF NOT EXISTS plan_limits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    plan_id VARCHAR(20) NOT NULL UNIQUE, -- 'free', 'basic', 'pro', 'enterprise'
    plan_name VARCHAR(50) NOT NULL,
    
    -- Study limits
    max_studies_per_month INTEGER NOT NULL,
    max_participants_per_study INTEGER NOT NULL,
    max_recording_minutes INTEGER NOT NULL,
    
    -- Feature flags
    advanced_analytics BOOLEAN DEFAULT FALSE,
    data_export BOOLEAN DEFAULT FALSE,
    team_collaboration BOOLEAN DEFAULT FALSE,
    priority_support BOOLEAN DEFAULT FALSE,
    custom_branding BOOLEAN DEFAULT FALSE,
    api_access BOOLEAN DEFAULT FALSE,
    sso_integration BOOLEAN DEFAULT FALSE,
    
    -- Pricing
    monthly_price DECIMAL(10,2) DEFAULT 0,
    currency VARCHAR(3) DEFAULT 'USD',
    
    -- Metadata
    is_active BOOLEAN DEFAULT TRUE,
    display_order INTEGER DEFAULT 0,
    description TEXT,
    features_list JSONB DEFAULT '[]',
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User subscriptions with PayPal integration
CREATE TABLE IF NOT EXISTS user_subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Subscription details
    plan_id VARCHAR(20) NOT NULL REFERENCES plan_limits(plan_id),
    status VARCHAR(20) NOT NULL DEFAULT 'active', -- 'active', 'cancelled', 'expired', 'past_due'
    
    -- PayPal integration
    paypal_subscription_id VARCHAR(100) UNIQUE,
    paypal_plan_id VARCHAR(100),
    
    -- Billing
    current_period_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    current_period_end TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '1 month'),
    next_billing_date TIMESTAMP WITH TIME ZONE,
    amount DECIMAL(10,2) DEFAULT 0,
    currency VARCHAR(3) DEFAULT 'USD',
    
    -- Management
    auto_renew BOOLEAN DEFAULT TRUE,
    cancelled_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    trial_ends_at TIMESTAMP WITH TIME ZONE,
    
    -- Metadata
    payment_method VARCHAR(50) DEFAULT 'paypal',
    created_by UUID REFERENCES users(id),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id, status) -- Only one active subscription per user
);

-- =====================================================================================
-- 2. ADMIN ANALYTICS & MONITORING SYSTEM
-- =====================================================================================

-- System metrics for admin dashboard
CREATE TABLE IF NOT EXISTS system_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Metric identification
    metric_name VARCHAR(100) NOT NULL,
    metric_category VARCHAR(50) NOT NULL, -- 'users', 'studies', 'revenue', 'performance'
    metric_type VARCHAR(20) NOT NULL,     -- 'count', 'sum', 'average', 'percentage'
    
    -- Values
    numeric_value DECIMAL(15,4),
    text_value TEXT,
    json_value JSONB,
    
    -- Aggregation info
    aggregation_period VARCHAR(20), -- 'daily', 'weekly', 'monthly', 'real_time'
    period_start TIMESTAMP WITH TIME ZONE,
    period_end TIMESTAMP WITH TIME ZONE,
    
    -- Metadata
    tags JSONB DEFAULT '{}',
    description TEXT,
    
    -- Timestamps
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Revenue tracking for business intelligence
CREATE TABLE IF NOT EXISTS revenue_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    subscription_id UUID REFERENCES user_subscriptions(id) ON DELETE SET NULL,
    
    -- Event details
    event_type VARCHAR(30) NOT NULL, -- 'subscription_created', 'payment_received', 'refund_issued'
    event_status VARCHAR(20) DEFAULT 'completed', -- 'pending', 'completed', 'failed'
    
    -- Financial data
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    tax_amount DECIMAL(10,2) DEFAULT 0,
    fee_amount DECIMAL(10,2) DEFAULT 0,
    net_amount DECIMAL(10,2) NOT NULL,
    
    -- PayPal integration
    paypal_transaction_id VARCHAR(100),
    paypal_payment_id VARCHAR(100),
    
    -- Metadata
    payment_method VARCHAR(50) DEFAULT 'paypal',
    processor_response JSONB DEFAULT '{}',
    
    -- Timestamps
    processed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================================================
-- 3. NOTIFICATION & ALERT SYSTEM
-- =====================================================================================

-- User notifications
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Notification details
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(30) NOT NULL, -- 'info', 'warning', 'error', 'success'
    category VARCHAR(50) NOT NULL, -- 'billing', 'usage', 'study', 'system'
    
    -- State
    is_read BOOLEAN DEFAULT FALSE,
    is_important BOOLEAN DEFAULT FALSE,
    auto_dismiss_at TIMESTAMP WITH TIME ZONE,
    
    -- Action
    action_url TEXT,
    action_label VARCHAR(50),
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    read_at TIMESTAMP WITH TIME ZONE,
    dismissed_at TIMESTAMP WITH TIME ZONE
);

-- System alerts for admins
CREATE TABLE IF NOT EXISTS system_alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Alert details
    alert_type VARCHAR(50) NOT NULL, -- 'high_usage', 'payment_failure', 'system_error'
    severity VARCHAR(20) NOT NULL,   -- 'low', 'medium', 'high', 'critical'
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    
    -- Context
    affected_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    related_resource_type VARCHAR(50), -- 'user', 'study', 'subscription'
    related_resource_id UUID,
    
    -- State
    status VARCHAR(20) DEFAULT 'open', -- 'open', 'acknowledged', 'resolved', 'false_positive'
    acknowledged_by UUID REFERENCES users(id) ON DELETE SET NULL,
    resolved_by UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- Metadata
    alert_data JSONB DEFAULT '{}',
    resolution_notes TEXT,
    
    -- Timestamps
    triggered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    acknowledged_at TIMESTAMP WITH TIME ZONE,
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================================================
-- 4. INSERT DEFAULT DATA
-- =====================================================================================

-- Insert default plan limits
INSERT INTO plan_limits (plan_id, plan_name, max_studies_per_month, max_participants_per_study, max_recording_minutes, monthly_price, features_list) VALUES
('free', 'Free Plan', 3, 10, 60, 0, 
 '["3 studies per month", "10 participants per study", "60 minutes recording", "Basic analytics"]'
),
('basic', 'Basic Plan', 15, 50, 300, 29, 
 '["15 studies per month", "50 participants per study", "300 minutes recording", "Advanced analytics", "Data export"]'
),
('pro', 'Pro Plan', -1, 200, -1, 79, 
 '["Unlimited studies", "200 participants per study", "Unlimited recording", "Team collaboration", "Priority support", "Custom branding"]'
),
('enterprise', 'Enterprise Plan', -1, -1, -1, 199, 
 '["Everything in Pro", "Unlimited participants", "SSO integration", "API access", "Dedicated support"]'
)
ON CONFLICT (plan_id) DO UPDATE SET
    plan_name = EXCLUDED.plan_name,
    max_studies_per_month = EXCLUDED.max_studies_per_month,
    max_participants_per_study = EXCLUDED.max_participants_per_study,
    max_recording_minutes = EXCLUDED.max_recording_minutes,
    monthly_price = EXCLUDED.monthly_price,
    features_list = EXCLUDED.features_list,
    updated_at = NOW();

-- =====================================================================================
-- 5. CREATE INDEXES FOR PERFORMANCE
-- =====================================================================================

-- Usage tracking indexes
CREATE INDEX IF NOT EXISTS idx_user_usage_stats_user_id ON user_usage_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_user_usage_stats_period ON user_usage_stats(current_period_start, current_period_end);

-- Usage events indexes
CREATE INDEX IF NOT EXISTS idx_usage_events_user_id ON usage_events(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_events_type ON usage_events(event_type);
CREATE INDEX IF NOT EXISTS idx_usage_events_category ON usage_events(event_category);
CREATE INDEX IF NOT EXISTS idx_usage_events_occurred_at ON usage_events(occurred_at);
CREATE INDEX IF NOT EXISTS idx_usage_events_study_id ON usage_events(study_id);

-- Subscription indexes
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_plan_id ON user_subscriptions(plan_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON user_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_paypal_id ON user_subscriptions(paypal_subscription_id);

-- Metrics indexes
CREATE INDEX IF NOT EXISTS idx_system_metrics_name ON system_metrics(metric_name);
CREATE INDEX IF NOT EXISTS idx_system_metrics_category ON system_metrics(metric_category);
CREATE INDEX IF NOT EXISTS idx_system_metrics_period ON system_metrics(period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_system_metrics_recorded_at ON system_metrics(recorded_at);

-- Revenue indexes
CREATE INDEX IF NOT EXISTS idx_revenue_events_user_id ON revenue_events(user_id);
CREATE INDEX IF NOT EXISTS idx_revenue_events_subscription_id ON revenue_events(subscription_id);
CREATE INDEX IF NOT EXISTS idx_revenue_events_type ON revenue_events(event_type);
CREATE INDEX IF NOT EXISTS idx_revenue_events_processed_at ON revenue_events(processed_at);

-- Notification indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);

-- Alert indexes
CREATE INDEX IF NOT EXISTS idx_system_alerts_type ON system_alerts(alert_type);
CREATE INDEX IF NOT EXISTS idx_system_alerts_severity ON system_alerts(severity);
CREATE INDEX IF NOT EXISTS idx_system_alerts_status ON system_alerts(status);
CREATE INDEX IF NOT EXISTS idx_system_alerts_triggered_at ON system_alerts(triggered_at);
CREATE INDEX IF NOT EXISTS idx_system_alerts_affected_user ON system_alerts(affected_user_id);

-- =====================================================================================
-- 6. CREATE ROW LEVEL SECURITY POLICIES
-- =====================================================================================

-- Enable RLS on all tables
ALTER TABLE user_usage_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE plan_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE revenue_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_alerts ENABLE ROW LEVEL SECURITY;

-- User usage stats policies
CREATE POLICY "Users can view own usage stats" ON user_usage_stats
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own usage stats" ON user_usage_stats
    FOR UPDATE USING (auth.uid() = user_id);

-- Usage events policies
CREATE POLICY "Users can view own usage events" ON usage_events
    FOR SELECT USING (auth.uid() = user_id);

-- Plan limits policies (public read)
CREATE POLICY "Plan limits are publicly readable" ON plan_limits
    FOR SELECT USING (is_active = true);

-- User subscriptions policies
CREATE POLICY "Users can view own subscriptions" ON user_subscriptions
    FOR SELECT USING (auth.uid() = user_id);

-- Notifications policies
CREATE POLICY "Users can view own notifications" ON notifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON notifications
    FOR UPDATE USING (auth.uid() = user_id);

-- Admin-only policies for system tables
CREATE POLICY "Admins can access system metrics" ON system_metrics
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

CREATE POLICY "Admins can access revenue events" ON revenue_events
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

CREATE POLICY "Admins can access system alerts" ON system_alerts
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

-- =====================================================================================
-- 7. CREATE FUNCTIONS AND TRIGGERS
-- =====================================================================================

-- Function to update user usage stats
CREATE OR REPLACE FUNCTION update_user_usage_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- Insert or update usage stats for the user
    INSERT INTO user_usage_stats (user_id, max_studies_allowed, max_participants_per_study, max_recording_minutes)
    VALUES (NEW.user_id, 3, 10, 60) -- Default free plan limits
    ON CONFLICT (user_id) DO NOTHING;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to initialize usage stats for new users
CREATE TRIGGER trigger_init_usage_stats
    AFTER INSERT ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_user_usage_stats();

-- Function to log usage events
CREATE OR REPLACE FUNCTION log_usage_event(
    p_user_id UUID,
    p_event_type VARCHAR,
    p_event_category VARCHAR,
    p_event_data JSONB DEFAULT '{}',
    p_study_id UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    event_id UUID;
BEGIN
    INSERT INTO usage_events (user_id, event_type, event_category, event_data, study_id)
    VALUES (p_user_id, p_event_type, p_event_category, p_event_data, p_study_id)
    RETURNING id INTO event_id;
    
    RETURN event_id;
END;
$$ LANGUAGE plpgsql;

-- Function to check plan limits
CREATE OR REPLACE FUNCTION check_plan_limit(
    p_user_id UUID,
    p_limit_type VARCHAR -- 'studies', 'participants', 'recording'
)
RETURNS BOOLEAN AS $$
DECLARE
    current_usage INTEGER;
    limit_value INTEGER;
    user_stats RECORD;
BEGIN
    -- Get user stats
    SELECT * INTO user_stats 
    FROM user_usage_stats 
    WHERE user_id = p_user_id;
    
    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;
    
    -- Check specific limit
    CASE p_limit_type
        WHEN 'studies' THEN
            current_usage := user_stats.studies_created_this_period;
            limit_value := user_stats.max_studies_allowed;
        WHEN 'participants' THEN
            current_usage := user_stats.participants_this_period;
            limit_value := user_stats.max_participants_per_study;
        WHEN 'recording' THEN
            current_usage := user_stats.recording_minutes_this_period;
            limit_value := user_stats.max_recording_minutes;
        ELSE
            RETURN FALSE;
    END CASE;
    
    -- -1 means unlimited
    IF limit_value = -1 THEN
        RETURN TRUE;
    END IF;
    
    RETURN current_usage < limit_value;
END;
$$ LANGUAGE plpgsql;

-- =====================================================================================
-- MIGRATION COMPLETE
-- =====================================================================================

-- Log migration completion
INSERT INTO usage_events (user_id, event_type, event_category, event_data)
SELECT 
    id,
    'migration_completed',
    'system',
    '{"migration": "comprehensive_usage_tracking", "version": "1.0", "date": "2025-09-01"}'
FROM users 
WHERE role = 'admin'
LIMIT 1;

COMMIT;
