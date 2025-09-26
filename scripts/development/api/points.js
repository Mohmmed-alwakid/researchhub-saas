/**
 * Points API Module for Local Development Server
 * Handles researcher points/credits management operations
 * 
 * This module proxies to the main API endpoints and provides
 * local development compatibility for the points system.
 * 
 * Created: January 2025
 * Purpose: Fix missing module error in local-full-dev.js
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || 'https://wxpwxzdgdvinlbtnbgdf.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'process.env.SUPABASE_SERVICE_ROLE_KEY || 'your_supabase_service_role_key_here'';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Create Supabase clients
const supabase = createClient(supabaseUrl, supabaseKey);
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey || supabaseKey);

/**
 * Main points API handler for local development
 * Routes requests based on action parameter
 */
export default async function handler(req, res) {
  // CORS headers for local development
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { action } = req.query;

  try {
    console.log(`🪙 Points API Request: ${req.method} ${req.url} - Action: ${action}`);

    switch (action) {
      case 'balance':
        return await getBalance(req, res, supabase);
      case 'history':
        return await getTransactionHistory(req, res, supabase);
      case 'calculate-cost':
        return await calculateStudyCost(req, res);
      case 'spend':
        return await spendPoints(req, res, supabase);
      case 'stats':
        return await getUsageStats(req, res, supabase);
      case 'assign':
        return await assignPoints(req, res, supabaseAdmin);
      default:
        return res.status(400).json({
          success: false,
          error: 'Invalid action parameter',
          validActions: ['balance', 'history', 'calculate-cost', 'spend', 'stats', 'assign']
        });
    }
  } catch (error) {
    console.error('❌ Points API Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Points operation failed',
      message: error.message
    });
  }
}

/**
 * Get user's current points balance
 */
async function getBalance(req, res, supabase) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ success: false, error: 'Authorization required' });
  }

  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);

  if (authError || !user) {
    return res.status(401).json({ success: false, error: 'Invalid token' });
  }

  // Mock balance data for development
  const mockBalance = {
    userId: user.id,
    currentBalance: 250,
    totalEarned: 500,
    totalSpent: 250,
    lastUpdated: new Date().toISOString()
  };

  return res.status(200).json({
    success: true,
    balance: mockBalance
  });
}

/**
 * Get points transaction history
 */
async function getTransactionHistory(req, res, supabase) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ success: false, error: 'Authorization required' });
  }

  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);

  if (authError || !user) {
    return res.status(401).json({ success: false, error: 'Invalid token' });
  }

  const { limit = 50, offset = 0 } = req.query;

  // Mock transaction history for development
  const mockTransactions = [
    {
      id: '1',
      userId: user.id,
      type: 'earned',
      amount: 100,
      reason: 'Initial bonus',
      timestamp: new Date(Date.now() - 86400000).toISOString(),
      description: 'Welcome bonus for new researcher'
    },
    {
      id: '2',
      userId: user.id,
      type: 'spent',
      amount: 50,
      reason: 'Study creation',
      studyId: 'study-123',
      timestamp: new Date(Date.now() - 43200000).toISOString(),
      description: 'Created study: User Experience Research'
    }
  ];

  return res.status(200).json({
    success: true,
    transactions: mockTransactions,
    pagination: {
      total: mockTransactions.length,
      limit: parseInt(limit),
      offset: parseInt(offset)
    }
  });
}

/**
 * Calculate cost for creating a study
 */
async function calculateStudyCost(req, res) {
  const { blockCount = 5, participantCount = 10 } = req.body;

  // Pricing configuration
  const PRICING = {
    baseCost: 10,        // Base cost per study
    costPerBlock: 2,     // Cost per block
    costPerParticipant: 1 // Cost per participant
  };

  const baseCost = PRICING.baseCost;
  const blockCost = blockCount * PRICING.costPerBlock;
  const participantCost = participantCount * PRICING.costPerParticipant;
  const totalCost = baseCost + blockCost + participantCost;

  const cost = {
    blockCount,
    participantCount,
    baseCost,
    blockCost,
    participantCost,
    totalCost
  };

  return res.status(200).json({
    success: true,
    cost
  });
}

/**
 * Spend points for study creation
 */
async function spendPoints(req, res, supabase) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ success: false, error: 'Authorization required' });
  }

  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);

  if (authError || !user) {
    return res.status(401).json({ success: false, error: 'Invalid token' });
  }

  const { amount, reason, studyId } = req.body;

  if (!amount || amount <= 0) {
    return res.status(400).json({ success: false, error: 'Invalid amount' });
  }

  // Mock spending operation for development
  const transaction = {
    id: Date.now().toString(),
    userId: user.id,
    type: 'spent',
    amount,
    reason,
    studyId,
    timestamp: new Date().toISOString(),
    description: `Spent ${amount} points for ${reason}`
  };

  const newBalance = 200; // Mock new balance

  return res.status(200).json({
    success: true,
    transaction,
    newBalance,
    message: `Successfully spent ${amount} points`
  });
}

/**
 * Get points usage statistics
 */
async function getUsageStats(req, res, supabase) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ success: false, error: 'Authorization required' });
  }

  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);

  if (authError || !user) {
    return res.status(401).json({ success: false, error: 'Invalid token' });
  }

  // Mock usage statistics for development
  const stats = {
    studiesCreated: 5,
    pointsSpent: 250,
    pointsEarned: 500,
    averageCostPerStudy: 50
  };

  return res.status(200).json({
    success: true,
    stats
  });
}

/**
 * Admin: Assign points to a user
 */
async function assignPoints(req, res, supabaseAdmin) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ success: false, error: 'Authorization required' });
  }

  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

  if (authError || !user) {
    return res.status(401).json({ success: false, error: 'Invalid token' });
  }

  // Check if user is admin
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || !['admin', 'super_admin'].includes(profile.role)) {
    return res.status(403).json({ success: false, error: 'Admin access required' });
  }

  const { userId, amount, reason } = req.body;

  if (!userId || !amount || !reason) {
    return res.status(400).json({ 
      success: false, 
      error: 'Missing required fields: userId, amount, reason' 
    });
  }

  // Mock admin assignment for development
  const transaction = {
    id: Date.now().toString(),
    userId,
    type: 'admin_assigned',
    amount,
    reason,
    adminId: user.id,
    timestamp: new Date().toISOString(),
    description: `Admin assigned ${amount} points: ${reason}`
  };

  return res.status(200).json({
    success: true,
    transaction,
    message: `Successfully assigned ${amount} points to user`
  });
}
