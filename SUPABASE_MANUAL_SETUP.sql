-- ⚡ COPY AND PASTE THIS EXACT SQL INTO SUPABASE DASHBOARD SQL EDITOR
-- This will create all necessary tables for the points system

-- 1. Points Balance Table
CREATE TABLE IF NOT EXISTS points_balance (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    total_points INTEGER NOT NULL DEFAULT 0,
    available_points INTEGER NOT NULL DEFAULT 0,
    used_points INTEGER NOT NULL DEFAULT 0,
    expired_points INTEGER NOT NULL DEFAULT 0,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Points Transactions Table
CREATE TABLE IF NOT EXISTS points_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL CHECK (type IN ('assigned', 'consumed', 'refunded', 'expired')),
    amount INTEGER NOT NULL,
    balance INTEGER NOT NULL,
    reason TEXT NOT NULL,
    study_id UUID,
    assigned_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Study Costs Table
CREATE TABLE IF NOT EXISTS study_costs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    study_type VARCHAR(50) NOT NULL,
    base_cost INTEGER NOT NULL DEFAULT 50,
    per_participant_cost INTEGER NOT NULL DEFAULT 5,
    per_block_cost INTEGER NOT NULL DEFAULT 10,
    recording_cost INTEGER NOT NULL DEFAULT 20,
    advanced_analytics_cost INTEGER NOT NULL DEFAULT 15,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Performance Issues Table
CREATE TABLE IF NOT EXISTS performance_issues (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    type VARCHAR(50) NOT NULL,
    category VARCHAR(50) NOT NULL,
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    steps_to_reproduce TEXT[],
    expected_behavior TEXT,
    actual_behavior TEXT,
    browser_info TEXT,
    url TEXT,
    screenshot_url TEXT,
    performance_metrics JSONB,
    status VARCHAR(20) NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
    assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    resolution TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Performance Metrics Table
CREATE TABLE IF NOT EXISTS performance_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    session_id TEXT,
    url TEXT NOT NULL,
    page_load_time INTEGER,
    memory_usage BIGINT,
    network_requests INTEGER,
    errors_count INTEGER,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Insert default study costs
INSERT INTO study_costs (study_type, base_cost, per_participant_cost, per_block_cost, recording_cost, advanced_analytics_cost)
VALUES 
    ('usability', 50, 5, 10, 20, 15),
    ('interview', 75, 3, 15, 25, 20),
    ('survey', 25, 2, 5, 10, 10),
    ('cardSort', 40, 4, 8, 15, 12),
    ('treeTest', 45, 4, 10, 18, 14)
ON CONFLICT DO NOTHING;

-- 7. Enable Row Level Security
ALTER TABLE points_balance ENABLE ROW LEVEL SECURITY;
ALTER TABLE points_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_costs ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_metrics ENABLE ROW LEVEL SECURITY;

-- 8. Create RLS Policies
-- Points Balance Policies
CREATE POLICY "Users can view own points balance" ON points_balance
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can manage points balances" ON points_balance
    FOR ALL USING (true);

-- Points Transactions Policies  
CREATE POLICY "Users can view own transactions" ON points_transactions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert transactions" ON points_transactions
    FOR INSERT WITH CHECK (true);

-- Study Costs Policies
CREATE POLICY "Anyone can view study costs" ON study_costs
    FOR SELECT USING (true);

-- Performance Issues Policies
CREATE POLICY "Users can view own issues" ON performance_issues
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create issues" ON performance_issues
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Performance Metrics Policies
CREATE POLICY "Users can view own metrics" ON performance_metrics
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert metrics" ON performance_metrics
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 9. Create Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_points_transactions_user_id ON points_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_points_transactions_type ON points_transactions(type);
CREATE INDEX IF NOT EXISTS idx_points_transactions_created_at ON points_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_performance_issues_user_id ON performance_issues(user_id);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_user_id ON performance_metrics(user_id);

-- 10. Verification Query - Run this after the above to confirm tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('points_balance', 'points_transactions', 'study_costs', 'performance_issues', 'performance_metrics');

-- You should see 5 rows returned if successful!
