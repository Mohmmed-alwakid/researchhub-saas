import { createClient } from '@supabase/supabase-js';


/**
 * IMPROVED Points Management API - Enhanced Version
 * 
 * Features:
 * - Fixed API-Frontend contract alignment
 * - Added missing endpoints (calculate-cost, spend, stats, admin-transactions)
 * - Improved data structure consistency
 * - Enhanced error handling and validation
 * - Point expiration management
 * - Cost calculation for studies
 * - Usage statistics
 * 
 * Endpoints:
 * - GET /api/points?action=balance - Get user's points balance
 * - POST /api/points?action=assign - Admin assigns points to researcher
 * - POST /api/points?action=consume - Consume points for study creation
 * - POST /api/points?action=spend - Alias for consume with enhanced logic
 * - GET /api/points?action=history - Get points transaction history
 * - GET /api/points?action=stats - Get usage statistics
 * - POST /api/points?action=calculate-cost - Calculate study creation cost
 * - GET /api/points?action=admin-balances - Admin: Get all user balances
 * - GET /api/points?action=admin-transactions - Admin: Get all transactions
 * - POST /api/points?action=expire-points - Admin: Expire points
 * 
 * Security Features:
 * - JWT token authentication
 * - Admin-only operations with proper validation
 * - Automatic point consumption tracking
 * - Transaction audit trail
 * - Row-level security integration
 * 
 * Created: January 2025
 * Status: Enhanced Production Ready ✅
 */
const supabaseUrl = 'https://wxpwxzdgdvinlbtnbgdf.supabase.co';
const supabaseKey = 'process.env.SUPABASE_SERVICE_ROLE_KEY || 'your_supabase_service_role_key_here'';

// Points pricing configuration
const POINTS_CONFIG = {
  STUDY_BASE_COST: 10,
  COST_PER_BLOCK: 2,
  COST_PER_PARTICIPANT: 1,
  MAX_BLOCKS_FREE: 5,
  MAX_PARTICIPANTS_FREE: 10,
  EXPIRATION_DAYS_DEFAULT: 365,
  TRANSACTION_TYPES: {
    EARNED: 'earned',
    SPENT: 'spent',
    ADMIN_ASSIGNED: 'admin_assigned',
    ADMIN_DEDUCTED: 'admin_deducted',
    EXPIRED: 'expired',
    REFUNDED: 'refunded'
  }
};

// Helper functions
const mapBalanceToFrontend = (balance) => {
  if (!balance) return null;
  
  return {
    userId: balance.user_id,
    currentBalance: balance.available_points,
    totalEarned: balance.total_points,
    totalSpent: balance.used_points,
    lastUpdated: balance.last_updated || balance.created_at
  };
};

const mapTransactionToFrontend = (transaction) => {
  if (!transaction) return null;
  
  // Map database transaction types to frontend expected types
  const typeMapping = {
    'assigned': 'admin_assigned',
    'consumed': 'spent',
    'earned': 'earned',
    'spent': 'spent',
    'expired': 'expired',
    'refunded': 'earned'
  };
  
  return {
    id: transaction.id,
    userId: transaction.user_id,
    type: typeMapping[transaction.type] || transaction.type,
    amount: Math.abs(transaction.amount),
    reason: transaction.reason,
    studyId: transaction.study_id,
    adminId: transaction.assigned_by,
    timestamp: transaction.created_at,
    description: transaction.reason,
    expiresAt: transaction.expires_at
  };
};

const calculateStudyCost = (blockCount, participantCount) => {
  const baseCost = POINTS_CONFIG.STUDY_BASE_COST;
  const blockCost = Math.max(0, blockCount - POINTS_CONFIG.MAX_BLOCKS_FREE) * POINTS_CONFIG.COST_PER_BLOCK;
  const participantCost = Math.max(0, participantCount - POINTS_CONFIG.MAX_PARTICIPANTS_FREE) * POINTS_CONFIG.COST_PER_PARTICIPANT;
  const totalCost = baseCost + blockCost + participantCost;
  
  return {
    blockCount,
    participantCount,
    baseCost,
    blockCost,
    participantCost,
    totalCost
  };
};

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Authentication
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ success: false, error: 'Authorization header required' });
  }

  const token = authHeader.replace('Bearer ', '');
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return res.status(401).json({ success: false, error: 'Invalid token' });
    }

    // Create authenticated supabase client
    const authenticatedSupabase = createClient(supabaseUrl, supabaseKey, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    });

    // Get user profile for role checking
    const { data: profile, error: profileError } = await authenticatedSupabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    const { action } = req.query;

    // GET POINTS BALANCE
    if (action === 'balance' && req.method === 'GET') {
      const { data: balance, error } = await authenticatedSupabase
        .from('points_balance')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Balance fetch error:', error);
        return res.status(500).json({ success: false, error: 'Failed to fetch balance' });
      }

      // Create default balance if doesn't exist
      if (!balance) {
        const { data: newBalance, error: createError } = await authenticatedSupabase
          .from('points_balance')
          .insert({
            user_id: user.id,
            total_points: 0,
            available_points: 0,
            used_points: 0,
            expired_points: 0
          })
          .select()
          .single();

        if (createError) {
          console.error('Balance creation error:', createError);
          return res.status(500).json({ success: false, error: 'Failed to create balance' });
        }

        return res.status(200).json({
          success: true,
          balance: mapBalanceToFrontend(newBalance),
          message: 'New points account created'
        });
      }

      return res.status(200).json({
        success: true,
        balance: mapBalanceToFrontend(balance)
      });
    }

    // CALCULATE STUDY COST
    if (action === 'calculate-cost' && req.method === 'POST') {
      const { blockCount, participantCount } = req.body;

      if (!blockCount || !participantCount || blockCount < 1 || participantCount < 1) {
        return res.status(400).json({ 
          success: false, 
          error: 'Valid block count and participant count required' 
        });
      }

      const cost = calculateStudyCost(blockCount, participantCount);

      return res.status(200).json({
        success: true,
        cost
      });
    }

    // SPEND POINTS (Enhanced consume with cost calculation)
    if (action === 'spend' && req.method === 'POST') {
      const { amount, reason, studyId, blockCount, participantCount } = req.body;

      if (!amount || amount <= 0) {
        return res.status(400).json({ 
          success: false, 
          error: 'Positive amount required' 
        });
      }

      // If study creation data provided, validate cost
      if (blockCount && participantCount) {
        const calculatedCost = calculateStudyCost(blockCount, participantCount);
        if (amount !== calculatedCost.totalCost) {
          return res.status(400).json({
            success: false,
            error: 'Amount does not match calculated cost',
            data: { calculatedCost: calculatedCost.totalCost, providedAmount: amount }
          });
        }
      }

      // Use the existing consume logic
      return await handleConsumePoints(authenticatedSupabase, user.id, amount, reason, studyId, res);
    }

    // CONSUME POINTS (Original logic)
    if (action === 'consume' && req.method === 'POST') {
      const { amount, studyId, reason } = req.body;

      if (!amount || amount <= 0) {
        return res.status(400).json({ 
          success: false, 
          error: 'Positive amount required' 
        });
      }

      return await handleConsumePoints(authenticatedSupabase, user.id, amount, reason, studyId, res);
    }

    // GET USAGE STATISTICS
    if (action === 'stats' && req.method === 'GET') {
      const { data: transactions, error } = await authenticatedSupabase
        .from('points_transactions')
        .select('type, amount, study_id')
        .eq('user_id', user.id);

      if (error) {
        console.error('Stats fetch error:', error);
        return res.status(500).json({ success: false, error: 'Failed to fetch statistics' });
      }

      const stats = transactions.reduce((acc, tx) => {
        if (tx.type === 'consumed' || tx.type === 'spent') {
          acc.pointsSpent += Math.abs(tx.amount);
          if (tx.study_id) acc.studiesCreated++;
        } else if (tx.type === 'assigned' || tx.type === 'earned') {
          acc.pointsEarned += Math.abs(tx.amount);
        }
        return acc;
      }, { studiesCreated: 0, pointsSpent: 0, pointsEarned: 0 });

      stats.averageCostPerStudy = stats.studiesCreated > 0 ? 
        Math.round(stats.pointsSpent / stats.studiesCreated) : 0;

      return res.status(200).json({
        success: true,
        stats
      });
    }

    // GET TRANSACTION HISTORY
    if (action === 'history' && req.method === 'GET') {
      const { limit = 50, offset = 0 } = req.query;

      const { data: transactions, error } = await authenticatedSupabase
        .from('points_transactions')
        .select(`
          *,
          assigned_by_profile:profiles!points_transactions_assigned_by_fkey(email, first_name, last_name)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        console.error('Transaction history error:', error);
        return res.status(500).json({ success: false, error: 'Failed to fetch history' });
      }

      return res.status(200).json({
        success: true,
        transactions: transactions.map(mapTransactionToFrontend),
        pagination: { total: transactions.length, limit: parseInt(limit), offset: parseInt(offset) }
      });
    }

    // ASSIGN POINTS (Admin only)
    if (action === 'assign' && req.method === 'POST') {
      if (!profile || profile.role !== 'admin') {
        return res.status(403).json({ success: false, error: 'Admin access required' });
      }

      const { targetUserId, userEmail, amount, reason, expiresInDays } = req.body;

      if ((!targetUserId && !userEmail) || !amount || amount <= 0) {
        return res.status(400).json({ 
          success: false, 
          error: 'Target user ID or email and positive amount required' 
        });
      }

      // Find target user
      let targetUser;
      if (targetUserId) {
        const { data } = await authenticatedSupabase
          .from('profiles')
          .select('id, email, role')
          .eq('id', targetUserId)
          .single();
        targetUser = data;
      } else if (userEmail) {
        const { data } = await authenticatedSupabase
          .from('profiles')
          .select('id, email, role')
          .ilike('email', userEmail)
          .single();
        targetUser = data;
      }

      if (!targetUser) {
        return res.status(404).json({ 
          success: false, 
          error: `Target user not found with ${targetUserId ? 'ID' : 'email'}: ${targetUserId || userEmail}` 
        });
      }

      return await handleAssignPoints(authenticatedSupabase, user.id, targetUser.id, amount, reason, expiresInDays, res);
    }

    // ADMIN: GET ALL USER BALANCES
    if (action === 'admin-balances' && req.method === 'GET') {
      if (!profile || profile.role !== 'admin') {
        return res.status(403).json({ success: false, error: 'Admin access required' });
      }

      const { data: balances, error } = await authenticatedSupabase
        .from('points_balance')
        .select(`
          *,
          profile:profiles!points_balance_user_id_fkey(email, first_name, last_name, role)
        `)
        .order('total_points', { ascending: false });

      if (error) {
        console.error('Admin balances error:', error);
        return res.status(500).json({ success: false, error: 'Failed to fetch balances' });
      }

      return res.status(200).json({
        success: true,
        balances: balances.map(balance => ({
          ...mapBalanceToFrontend(balance),
          user: {
            first_name: balance.profile?.first_name || '',
            last_name: balance.profile?.last_name || '',
            email: balance.profile?.email || '',
            role: balance.profile?.role || ''
          }
        }))
      });
    }

    // ADMIN: GET ALL TRANSACTIONS
    if (action === 'admin-transactions' && req.method === 'GET') {
      if (!profile || profile.role !== 'admin') {
        return res.status(403).json({ success: false, error: 'Admin access required' });
      }

      const { limit = 100, offset = 0 } = req.query;

      const { data: transactions, error } = await authenticatedSupabase
        .from('points_transactions')
        .select(`
          *,
          user_profile:profiles!points_transactions_user_id_fkey(email, first_name, last_name),
          assigned_by_profile:profiles!points_transactions_assigned_by_fkey(email, first_name, last_name)
        `)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        console.error('Admin transactions error:', error);
        return res.status(500).json({ success: false, error: 'Failed to fetch transactions' });
      }

      return res.status(200).json({
        success: true,
        transactions: transactions.map(tx => ({
          ...mapTransactionToFrontend(tx),
          user: {
            first_name: tx.user_profile?.first_name || '',
            last_name: tx.user_profile?.last_name || '',
            email: tx.user_profile?.email || ''
          }
        })),
        pagination: { total: transactions.length, limit: parseInt(limit), offset: parseInt(offset) }
      });
    }

    // ADMIN: EXPIRE POINTS
    if (action === 'expire-points' && req.method === 'POST') {
      if (!profile || profile.role !== 'admin') {
        return res.status(403).json({ success: false, error: 'Admin access required' });
      }

      const { userId, amount, reason } = req.body;

      if (!userId || !amount || amount <= 0) {
        return res.status(400).json({ 
          success: false, 
          error: 'User ID and positive amount required' 
        });
      }

      return await handleExpirePoints(authenticatedSupabase, user.id, userId, amount, reason, res);
    }

    return res.status(400).json({
      success: false,
      error: 'Invalid action or method'
    });

  } catch (error) {
    console.error('Points API error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error.message
    });
  }
}

// Helper function to handle point consumption
async function handleConsumePoints(supabase, userId, amount, reason, studyId, res) {
  // Get current balance
  const { data: balance } = await supabase
    .from('points_balance')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (!balance || balance.available_points < amount) {
    return res.status(400).json({ 
      success: false, 
      error: 'Insufficient points balance',
      data: { 
        required: amount, 
        available: balance?.available_points || 0 
      }
    });
  }

  // Create consumption transaction
  const { data: transaction, error: transactionError } = await supabase
    .from('points_transactions')
    .insert({
      user_id: userId,
      type: 'consumed',
      amount: -amount,
      balance: balance.available_points - amount,
      reason: reason || 'Point consumption',
      study_id: studyId
    })
    .select()
    .single();

  if (transactionError) {
    console.error('Consumption transaction error:', transactionError);
    return res.status(500).json({ success: false, error: 'Failed to create transaction' });
  }

  // Update balance
  const newBalance = {
    user_id: userId,
    total_points: balance.total_points,
    available_points: balance.available_points - amount,
    used_points: balance.used_points + amount,
    expired_points: balance.expired_points,
    last_updated: new Date().toISOString()
  };

  const { error: balanceError } = await supabase
    .from('points_balance')
    .upsert(newBalance);

  if (balanceError) {
    console.error('Balance update error:', balanceError);
    return res.status(500).json({ success: false, error: 'Failed to update balance' });
  }

  return res.status(200).json({
    success: true,
    transaction: mapTransactionToFrontend(transaction),
    newBalance: mapBalanceToFrontend(newBalance).currentBalance,
    message: `${amount} points consumed successfully`
  });
}

// Helper function to handle point assignment
async function handleAssignPoints(supabase, adminId, targetUserId, amount, reason, expiresInDays, res) {
  // Calculate expiry date
  const expiresAt = expiresInDays ? 
    new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000) : 
    new Date(Date.now() + POINTS_CONFIG.EXPIRATION_DAYS_DEFAULT * 24 * 60 * 60 * 1000);

  // Get current balance
  const { data: balance } = await supabase
    .from('points_balance')
    .select('*')
    .eq('user_id', targetUserId)
    .single();

  const currentPoints = balance?.available_points || 0;
  const balanceAfterAssignment = currentPoints + amount;

  // Create assignment transaction
  const { data: transaction, error: transactionError } = await supabase
    .from('points_transactions')
    .insert({
      user_id: targetUserId,
      type: 'assigned',
      amount: amount,
      balance: balanceAfterAssignment,
      reason: reason || 'Admin assignment',
      assigned_by: adminId,
      expires_at: expiresAt
    })
    .select()
    .single();

  if (transactionError) {
    console.error('Assignment transaction error:', transactionError);
    return res.status(500).json({ success: false, error: 'Failed to create transaction' });
  }

  // Update balance
  const newBalance = {
    user_id: targetUserId,
    total_points: (balance?.total_points || 0) + amount,
    available_points: (balance?.available_points || 0) + amount,
    used_points: balance?.used_points || 0,
    expired_points: balance?.expired_points || 0,
    last_updated: new Date().toISOString()
  };

  const { error: balanceError } = await supabase
    .from('points_balance')
    .upsert(newBalance);

  if (balanceError) {
    console.error('Balance update error:', balanceError);
    return res.status(500).json({ success: false, error: 'Failed to update balance' });
  }

  return res.status(200).json({
    success: true,
    transaction: mapTransactionToFrontend(transaction),
    message: `${amount} points assigned successfully`
  });
}

// Helper function to handle point expiration
async function handleExpirePoints(supabase, adminId, userId, amount, reason, res) {
  // Get current balance
  const { data: balance } = await supabase
    .from('points_balance')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (!balance || balance.available_points < amount) {
    return res.status(400).json({ 
      success: false, 
      error: 'Insufficient points to expire',
      data: { 
        requested: amount, 
        available: balance?.available_points || 0 
      }
    });
  }

  // Create expiration transaction
  const { data: transaction, error: transactionError } = await supabase
    .from('points_transactions')
    .insert({
      user_id: userId,
      type: 'expired',
      amount: -amount,
      balance: balance.available_points - amount,
      reason: reason || 'Point expiration',
      assigned_by: adminId
    })
    .select()
    .single();

  if (transactionError) {
    console.error('Expiration transaction error:', transactionError);
    return res.status(500).json({ success: false, error: 'Failed to create transaction' });
  }

  // Update balance
  const newBalance = {
    user_id: userId,
    total_points: balance.total_points,
    available_points: balance.available_points - amount,
    used_points: balance.used_points,
    expired_points: balance.expired_points + amount,
    last_updated: new Date().toISOString()
  };

  const { error: balanceError } = await supabase
    .from('points_balance')
    .upsert(newBalance);

  if (balanceError) {
    console.error('Balance update error:', balanceError);
    return res.status(500).json({ success: false, error: 'Failed to update balance' });
  }

  return res.status(200).json({
    success: true,
    transaction: mapTransactionToFrontend(transaction),
    message: `${amount} points expired successfully`
  });
}
