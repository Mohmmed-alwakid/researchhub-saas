-- Points System Database Enhancement Migration
-- This migration adds RLS policies, indexes, constraints, and procedures
-- for the points system to improve security and performance

-- Author: ResearchHub Development Team
-- Date: January 2025
-- Version: 1.0

-- =============================================================================
-- 1. ADD INDEXES FOR BETTER PERFORMANCE
-- =============================================================================

-- Index for points_balance table
CREATE INDEX IF NOT EXISTS idx_points_balance_user_id ON points_balance(user_id);
CREATE INDEX IF NOT EXISTS idx_points_balance_last_updated ON points_balance(last_updated);
CREATE INDEX IF NOT EXISTS idx_points_balance_available_points ON points_balance(available_points);

-- Indexes for points_transactions table
CREATE INDEX IF NOT EXISTS idx_points_transactions_user_id ON points_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_points_transactions_type ON points_transactions(type);
CREATE INDEX IF NOT EXISTS idx_points_transactions_created_at ON points_transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_points_transactions_study_id ON points_transactions(study_id);
CREATE INDEX IF NOT EXISTS idx_points_transactions_assigned_by ON points_transactions(assigned_by);
CREATE INDEX IF NOT EXISTS idx_points_transactions_expires_at ON points_transactions(expires_at);

-- Composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_points_transactions_user_type_created ON points_transactions(user_id, type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_points_transactions_expired_cleanup ON points_transactions(expires_at, type) WHERE expires_at IS NOT NULL;

-- =============================================================================
-- 2. ADD CONSTRAINTS FOR DATA INTEGRITY
-- =============================================================================

-- Add check constraints to points_balance
ALTER TABLE points_balance 
ADD CONSTRAINT IF NOT EXISTS chk_points_balance_non_negative 
CHECK (total_points >= 0 AND available_points >= 0 AND used_points >= 0 AND expired_points >= 0);

ALTER TABLE points_balance 
ADD CONSTRAINT IF NOT EXISTS chk_points_balance_consistency 
CHECK (total_points = available_points + used_points + expired_points);

-- Add check constraints to points_transactions
ALTER TABLE points_transactions 
ADD CONSTRAINT IF NOT EXISTS chk_points_transactions_type 
CHECK (type IN ('assigned', 'consumed', 'earned', 'spent', 'expired', 'refunded', 'admin_assigned', 'admin_deducted'));

ALTER TABLE points_transactions 
ADD CONSTRAINT IF NOT EXISTS chk_points_transactions_amount 
CHECK (amount != 0);

-- Add foreign key constraints if not exist
ALTER TABLE points_transactions 
ADD CONSTRAINT IF NOT EXISTS fk_points_transactions_user_id 
FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE points_transactions 
ADD CONSTRAINT IF NOT EXISTS fk_points_transactions_assigned_by 
FOREIGN KEY (assigned_by) REFERENCES profiles(id) ON DELETE SET NULL;

ALTER TABLE points_transactions 
ADD CONSTRAINT IF NOT EXISTS fk_points_transactions_study_id 
FOREIGN KEY (study_id) REFERENCES studies(id) ON DELETE SET NULL;

-- =============================================================================
-- 3. ROW LEVEL SECURITY POLICIES
-- =============================================================================

-- Enable RLS on points_balance table
ALTER TABLE points_balance ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only view their own balance
CREATE POLICY IF NOT EXISTS "Users can view own points balance" 
ON points_balance FOR SELECT 
USING (auth.uid() = user_id);

-- Policy: Users can update their own balance (for system operations)
CREATE POLICY IF NOT EXISTS "Users can update own points balance" 
ON points_balance FOR UPDATE 
USING (auth.uid() = user_id);

-- Policy: Users can insert their own balance
CREATE POLICY IF NOT EXISTS "Users can insert own points balance" 
ON points_balance FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Policy: Admins can view all balances
CREATE POLICY IF NOT EXISTS "Admins can view all points balances" 
ON points_balance FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

-- Policy: Admins can update all balances
CREATE POLICY IF NOT EXISTS "Admins can update all points balances" 
ON points_balance FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

-- Enable RLS on points_transactions table
ALTER TABLE points_transactions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own transactions
CREATE POLICY IF NOT EXISTS "Users can view own points transactions" 
ON points_transactions FOR SELECT 
USING (auth.uid() = user_id);

-- Policy: Users can insert their own transactions
CREATE POLICY IF NOT EXISTS "Users can insert own points transactions" 
ON points_transactions FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Policy: Admins can view all transactions
CREATE POLICY IF NOT EXISTS "Admins can view all points transactions" 
ON points_transactions FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

-- Policy: Admins can insert transactions for any user
CREATE POLICY IF NOT EXISTS "Admins can insert points transactions for any user" 
ON points_transactions FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

-- =============================================================================
-- 4. TRIGGERS FOR AUTOMATIC BALANCE UPDATES
-- =============================================================================

-- Function to update points balance when transaction is created
CREATE OR REPLACE FUNCTION update_points_balance_on_transaction()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert or update the balance record
  INSERT INTO points_balance (user_id, total_points, available_points, used_points, expired_points, last_updated)
  VALUES (
    NEW.user_id,
    CASE 
      WHEN NEW.amount > 0 THEN NEW.amount
      ELSE 0
    END,
    CASE 
      WHEN NEW.amount > 0 THEN NEW.amount
      ELSE 0
    END,
    CASE 
      WHEN NEW.amount < 0 AND NEW.type IN ('consumed', 'spent') THEN ABS(NEW.amount)
      ELSE 0
    END,
    CASE 
      WHEN NEW.amount < 0 AND NEW.type = 'expired' THEN ABS(NEW.amount)
      ELSE 0
    END,
    NOW()
  )
  ON CONFLICT (user_id) DO UPDATE SET
    total_points = CASE 
      WHEN NEW.amount > 0 THEN points_balance.total_points + NEW.amount
      ELSE points_balance.total_points
    END,
    available_points = CASE 
      WHEN NEW.amount > 0 THEN points_balance.available_points + NEW.amount
      WHEN NEW.amount < 0 THEN points_balance.available_points + NEW.amount
      ELSE points_balance.available_points
    END,
    used_points = CASE 
      WHEN NEW.amount < 0 AND NEW.type IN ('consumed', 'spent') THEN points_balance.used_points + ABS(NEW.amount)
      ELSE points_balance.used_points
    END,
    expired_points = CASE 
      WHEN NEW.amount < 0 AND NEW.type = 'expired' THEN points_balance.expired_points + ABS(NEW.amount)
      ELSE points_balance.expired_points
    END,
    last_updated = NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic balance updates
DROP TRIGGER IF EXISTS trigger_update_points_balance ON points_transactions;
CREATE TRIGGER trigger_update_points_balance
  AFTER INSERT ON points_transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_points_balance_on_transaction();

-- =============================================================================
-- 5. STORED PROCEDURES FOR COMMON OPERATIONS
-- =============================================================================

-- Function to check if user has sufficient points
CREATE OR REPLACE FUNCTION check_sufficient_points(user_id_param UUID, required_amount INTEGER)
RETURNS BOOLEAN AS $$
DECLARE
  current_balance INTEGER;
BEGIN
  SELECT available_points INTO current_balance
  FROM points_balance
  WHERE user_id = user_id_param;
  
  RETURN COALESCE(current_balance, 0) >= required_amount;
END;
$$ LANGUAGE plpgsql;

-- Function to get user's current points balance
CREATE OR REPLACE FUNCTION get_user_points_balance(user_id_param UUID)
RETURNS TABLE (
  user_id UUID,
  total_points INTEGER,
  available_points INTEGER,
  used_points INTEGER,
  expired_points INTEGER,
  last_updated TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pb.user_id,
    pb.total_points,
    pb.available_points,
    pb.used_points,
    pb.expired_points,
    pb.last_updated
  FROM points_balance pb
  WHERE pb.user_id = user_id_param;
END;
$$ LANGUAGE plpgsql;

-- Function to expire points automatically
CREATE OR REPLACE FUNCTION expire_old_points()
RETURNS INTEGER AS $$
DECLARE
  expired_count INTEGER := 0;
  expired_record RECORD;
BEGIN
  -- Find expired transactions that haven't been processed
  FOR expired_record IN 
    SELECT user_id, SUM(amount) as expired_amount
    FROM points_transactions
    WHERE expires_at < NOW()
      AND type IN ('assigned', 'earned')
      AND amount > 0
      AND NOT EXISTS (
        SELECT 1 FROM points_transactions pt2
        WHERE pt2.user_id = points_transactions.user_id
          AND pt2.type = 'expired'
          AND pt2.reason LIKE '%Automatic expiration%'
      )
    GROUP BY user_id
  LOOP
    -- Create expiration transaction
    INSERT INTO points_transactions (user_id, type, amount, reason, balance)
    VALUES (
      expired_record.user_id,
      'expired',
      -expired_record.expired_amount,
      'Automatic expiration of old points',
      (SELECT available_points FROM points_balance WHERE user_id = expired_record.user_id) - expired_record.expired_amount
    );
    
    expired_count := expired_count + 1;
  END LOOP;
  
  RETURN expired_count;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- 6. CREATE VIEWS FOR COMMON QUERIES
-- =============================================================================

-- View for user points summary
CREATE OR REPLACE VIEW user_points_summary AS
SELECT 
  p.id as user_id,
  p.email,
  p.first_name,
  p.last_name,
  p.role,
  COALESCE(pb.total_points, 0) as total_points,
  COALESCE(pb.available_points, 0) as available_points,
  COALESCE(pb.used_points, 0) as used_points,
  COALESCE(pb.expired_points, 0) as expired_points,
  pb.last_updated,
  pb.created_at as points_account_created
FROM profiles p
LEFT JOIN points_balance pb ON p.id = pb.user_id;

-- View for recent transactions with user details
CREATE OR REPLACE VIEW recent_points_transactions AS
SELECT 
  pt.id,
  pt.user_id,
  p.email,
  p.first_name,
  p.last_name,
  pt.type,
  pt.amount,
  pt.balance,
  pt.reason,
  pt.study_id,
  pt.assigned_by,
  admin.email as assigned_by_email,
  admin.first_name as assigned_by_first_name,
  admin.last_name as assigned_by_last_name,
  pt.expires_at,
  pt.created_at
FROM points_transactions pt
JOIN profiles p ON pt.user_id = p.id
LEFT JOIN profiles admin ON pt.assigned_by = admin.id
ORDER BY pt.created_at DESC;

-- =============================================================================
-- 7. GRANTS AND PERMISSIONS
-- =============================================================================

-- Grant necessary permissions to authenticated users
GRANT SELECT, INSERT, UPDATE ON points_balance TO authenticated;
GRANT SELECT, INSERT ON points_transactions TO authenticated;
GRANT SELECT ON user_points_summary TO authenticated;
GRANT SELECT ON recent_points_transactions TO authenticated;

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION check_sufficient_points(UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_points_balance(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION expire_old_points() TO authenticated;

-- =============================================================================
-- 8. INITIAL DATA SETUP
-- =============================================================================

-- Create default points balance for existing users without one
INSERT INTO points_balance (user_id, total_points, available_points, used_points, expired_points)
SELECT id, 0, 0, 0, 0
FROM profiles
WHERE id NOT IN (SELECT user_id FROM points_balance)
ON CONFLICT (user_id) DO NOTHING;

-- =============================================================================
-- MIGRATION COMPLETION
-- =============================================================================

-- Log migration completion
INSERT INTO migrations (name, executed_at) VALUES ('points_system_enhancement', NOW())
ON CONFLICT (name) DO UPDATE SET executed_at = NOW();

-- Migration completed successfully
SELECT 'Points System Enhancement Migration Completed Successfully' AS status;
