/**
 * Enhanced Points Management API with Plans Integration
 * 
 * Features:
 * - Subscription plan integration with automatic point allocation
 * - Participant earnings and withdrawal system
 * - Researcher points dashboard and management
 * - Monthly point allocation based on plans
 * - Participant reward calculation and payout
 * 
 * Plan Structure:
 * - Free Plan: 20 points/month
 * - Basic Plan: 100 points/month ($29/month)
 * - Pro Plan: 500 points/month ($99/month)  
 * - Enterprise Plan: 2000 points/month ($299/month)
 * 
 * Participant Earnings:
 * - Points earned per completed study
 * - Conversion to real money (1 point = $0.10)
 * - Withdrawal system via PayPal/bank transfer
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wxpwxzdgdvinlbtnbgdf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4cHd4emRnZHZpbmxidG5iZ2RmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAxOTk1ODAsImV4cCI6MjA2NTc3NTU4MH0.YMai9p4VQMbdqmc_9uWGeJ6nONHwuM9XT2FDTFy0aGk';

// Enhanced configuration with plans and participant earnings
const POINTS_CONFIG = {
  // Study creation costs
  STUDY_BASE_COST: 10,
  COST_PER_BLOCK: 2,
  COST_PER_PARTICIPANT: 1,
  MAX_BLOCKS_FREE: 5,
  MAX_PARTICIPANTS_FREE: 10,
  EXPIRATION_DAYS_DEFAULT: 365,
  
  // Subscription plans with monthly point allocation
  SUBSCRIPTION_PLANS: {
    free: {
      name: 'Free Plan',
      monthlyPoints: 20,
      price: 0,
      features: ['Basic studies', 'Up to 5 participants', 'Email support']
    },
    basic: {
      name: 'Basic Plan',
      monthlyPoints: 100,
      price: 29,
      features: ['Unlimited studies', 'Up to 50 participants', 'Priority support', 'Basic analytics']
    },
    pro: {
      name: 'Pro Plan',
      monthlyPoints: 500,
      price: 99,
      features: ['Unlimited everything', 'Advanced analytics', 'API access', 'Custom branding']
    },
    enterprise: {
      name: 'Enterprise Plan',
      monthlyPoints: 2000,
      price: 299,
      features: ['Unlimited points', 'Dedicated support', 'Custom integrations', 'SLA guarantee']
    }
  },
  
  // Participant earnings configuration
  PARTICIPANT_EARNINGS: {
    BASE_REWARD_PER_STUDY: 5, // Base points for completing a study
    BONUS_PER_BLOCK: 1, // Additional points per block completed
    CONVERSION_RATE: 0.10, // $0.10 per point
    MIN_WITHDRAWAL: 50, // Minimum 50 points ($5) to withdraw
    WITHDRAWAL_FEE_PERCENT: 2.5, // 2.5% platform fee
    PAYOUT_METHODS: ['paypal', 'bank_transfer', 'gift_card']
  },
  
  TRANSACTION_TYPES: {
    // Researcher transactions
    EARNED: 'earned',
    SPENT: 'spent',
    ADMIN_ASSIGNED: 'admin_assigned',
    PLAN_ALLOCATION: 'plan_allocation',
    BONUS_POINTS: 'bonus_points',
    
    // Participant transactions
    STUDY_REWARD: 'study_reward',
    WITHDRAWAL: 'withdrawal',
    WITHDRAWAL_FEE: 'withdrawal_fee',
    BONUS_EARNED: 'bonus_earned'
  }
};

// Helper function to get user's current plan
async function getUserPlan(supabase, userId) {
  const { data: profile } = await supabase
    .from('profiles')
    .select('subscription_plan, plan_expires_at')
    .eq('id', userId)
    .single();
    
  if (!profile) return 'free';
  
  // Check if plan is still active
  if (profile.plan_expires_at && new Date(profile.plan_expires_at) < new Date()) {
    return 'free'; // Expired plan defaults to free
  }
  
  return profile.subscription_plan || 'free';
}

// Helper function to calculate participant reward
function calculateParticipantReward(studyBlocks, participantCount, studyDifficulty = 'normal') {
  const baseReward = POINTS_CONFIG.PARTICIPANT_EARNINGS.BASE_REWARD_PER_STUDY;
  const blockBonus = studyBlocks * POINTS_CONFIG.PARTICIPANT_EARNINGS.BONUS_PER_BLOCK;
  
  // Difficulty multiplier
  const difficultyMultiplier = {
    easy: 0.8,
    normal: 1.0,
    hard: 1.5,
    expert: 2.0
  }[studyDifficulty] || 1.0;
  
  return Math.round((baseReward + blockBonus) * difficultyMultiplier);
}

// Add to existing handler function - new endpoints

// RESEARCHER: GET PLAN INFORMATION AND POINTS ALLOCATION
if (action === 'plan-info' && req.method === 'GET') {
  if (!profile || profile.role !== 'researcher') {
    return res.status(403).json({ success: false, error: 'Researcher access required' });
  }

  const userPlan = await getUserPlan(authenticatedSupabase, user.id);
  const planConfig = POINTS_CONFIG.SUBSCRIPTION_PLANS[userPlan];
  
  // Get current month's allocation status
  const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM format
  const { data: monthlyAllocation } = await authenticatedSupabase
    .from('points_transactions')
    .select('amount')
    .eq('user_id', user.id)
    .eq('type', 'plan_allocation')
    .gte('created_at', `${currentMonth}-01`)
    .lt('created_at', `${currentMonth}-31`);

  const allocatedThisMonth = monthlyAllocation?.reduce((sum, tx) => sum + tx.amount, 0) || 0;
  const remainingAllocation = planConfig.monthlyPoints - allocatedThisMonth;

  return res.status(200).json({
    success: true,
    data: {
      currentPlan: userPlan,
      planDetails: planConfig,
      monthlyAllocation: {
        total: planConfig.monthlyPoints,
        allocated: allocatedThisMonth,
        remaining: Math.max(0, remainingAllocation)
      },
      upgradeAvailable: userPlan !== 'enterprise'
    }
  });
}

// RESEARCHER: ALLOCATE MONTHLY POINTS
if (action === 'allocate-monthly-points' && req.method === 'POST') {
  if (!profile || profile.role !== 'researcher') {
    return res.status(403).json({ success: false, error: 'Researcher access required' });
  }

  const userPlan = await getUserPlan(authenticatedSupabase, user.id);
  const planConfig = POINTS_CONFIG.SUBSCRIPTION_PLANS[userPlan];
  
  if (!planConfig) {
    return res.status(400).json({ success: false, error: 'Invalid subscription plan' });
  }

  // Check if already allocated this month
  const currentMonth = new Date().toISOString().slice(0, 7);
  const { data: existingAllocation } = await authenticatedSupabase
    .from('points_transactions')
    .select('id')
    .eq('user_id', user.id)
    .eq('type', 'plan_allocation')
    .gte('created_at', `${currentMonth}-01`)
    .single();

  if (existingAllocation) {
    return res.status(400).json({ 
      success: false, 
      error: 'Monthly points already allocated for this period' 
    });
  }

  // Allocate monthly points
  return await handleAssignPoints(
    authenticatedSupabase, 
    null, // System allocation, no admin
    user.id, 
    planConfig.monthlyPoints, 
    `Monthly ${planConfig.name} allocation`, 
    30, // 30 days expiry
    res,
    'plan_allocation'
  );
}

// PARTICIPANT: GET EARNINGS SUMMARY
if (action === 'participant-earnings' && req.method === 'GET') {
  if (!profile || profile.role !== 'participant') {
    return res.status(403).json({ success: false, error: 'Participant access required' });
  }

  // Get participant's earnings transactions
  const { data: transactions, error } = await authenticatedSupabase
    .from('points_transactions')
    .select('*')
    .eq('user_id', user.id)
    .in('type', ['study_reward', 'withdrawal', 'withdrawal_fee', 'bonus_earned'])
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Participant earnings error:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch earnings' });
  }

  const earnings = transactions.reduce((acc, tx) => {
    if (tx.type === 'study_reward' || tx.type === 'bonus_earned') {
      acc.totalEarned += Math.abs(tx.amount);
    } else if (tx.type === 'withdrawal') {
      acc.totalWithdrawn += Math.abs(tx.amount);
    } else if (tx.type === 'withdrawal_fee') {
      acc.totalFees += Math.abs(tx.amount);
    }
    return acc;
  }, { totalEarned: 0, totalWithdrawn: 0, totalFees: 0 });

  const currentBalance = earnings.totalEarned - earnings.totalWithdrawn - earnings.totalFees;
  const availableForWithdrawal = currentBalance >= POINTS_CONFIG.PARTICIPANT_EARNINGS.MIN_WITHDRAWAL;

  return res.status(200).json({
    success: true,
    data: {
      earnings: {
        ...earnings,
        currentBalance,
        availableForWithdrawal,
        minimumWithdrawal: POINTS_CONFIG.PARTICIPANT_EARNINGS.MIN_WITHDRAWAL,
        conversionRate: POINTS_CONFIG.PARTICIPANT_EARNINGS.CONVERSION_RATE,
        estimatedCashValue: currentBalance * POINTS_CONFIG.PARTICIPANT_EARNINGS.CONVERSION_RATE
      },
      recentTransactions: transactions.slice(0, 10).map(mapTransactionToFrontend)
    }
  });
}

// PARTICIPANT: REQUEST WITHDRAWAL
if (action === 'request-withdrawal' && req.method === 'POST') {
  if (!profile || profile.role !== 'participant') {
    return res.status(403).json({ success: false, error: 'Participant access required' });
  }

  const { amount, payoutMethod, payoutDetails } = req.body;

  if (!amount || amount < POINTS_CONFIG.PARTICIPANT_EARNINGS.MIN_WITHDRAWAL) {
    return res.status(400).json({ 
      success: false, 
      error: `Minimum withdrawal amount is ${POINTS_CONFIG.PARTICIPANT_EARNINGS.MIN_WITHDRAWAL} points` 
    });
  }

  if (!POINTS_CONFIG.PARTICIPANT_EARNINGS.PAYOUT_METHODS.includes(payoutMethod)) {
    return res.status(400).json({ 
      success: false, 
      error: 'Invalid payout method' 
    });
  }

  // Get current participant balance
  const { data: balance } = await authenticatedSupabase
    .from('points_balance')
    .select('available_points')
    .eq('user_id', user.id)
    .single();

  if (!balance || balance.available_points < amount) {
    return res.status(400).json({ 
      success: false, 
      error: 'Insufficient balance for withdrawal' 
    });
  }

  // Calculate withdrawal fee
  const fee = Math.round(amount * POINTS_CONFIG.PARTICIPANT_EARNINGS.WITHDRAWAL_FEE_PERCENT / 100);
  const netAmount = amount - fee;

  // Create withdrawal request (this would trigger payment processing)
  const { data: withdrawalRequest, error: withdrawalError } = await authenticatedSupabase
    .from('withdrawal_requests')
    .insert({
      user_id: user.id,
      amount: amount,
      fee: fee,
      net_amount: netAmount,
      payout_method: payoutMethod,
      payout_details: payoutDetails,
      status: 'pending',
      cash_value: netAmount * POINTS_CONFIG.PARTICIPANT_EARNINGS.CONVERSION_RATE
    })
    .select()
    .single();

  if (withdrawalError) {
    console.error('Withdrawal request error:', withdrawalError);
    return res.status(500).json({ success: false, error: 'Failed to create withdrawal request' });
  }

  // Create withdrawal transaction (points deducted)
  const { data: transaction, error: transactionError } = await authenticatedSupabase
    .from('points_transactions')
    .insert({
      user_id: user.id,
      type: 'withdrawal',
      amount: -amount,
      reason: `Withdrawal request to ${payoutMethod}`,
      withdrawal_request_id: withdrawalRequest.id
    })
    .select()
    .single();

  if (transactionError) {
    console.error('Withdrawal transaction error:', transactionError);
    return res.status(500).json({ success: false, error: 'Failed to create withdrawal transaction' });
  }

  return res.status(200).json({
    success: true,
    data: {
      withdrawalRequest,
      transaction: mapTransactionToFrontend(transaction),
      message: `Withdrawal request for ${amount} points (${netAmount * POINTS_CONFIG.PARTICIPANT_EARNINGS.CONVERSION_RATE} USD) submitted successfully`
    }
  });
}

// ADMIN: PROCESS PARTICIPANT WITHDRAWAL
if (action === 'process-withdrawal' && req.method === 'POST') {
  if (!profile || profile.role !== 'admin') {
    return res.status(403).json({ success: false, error: 'Admin access required' });
  }

  const { withdrawalRequestId, status, adminNotes, transactionId } = req.body;

  if (!withdrawalRequestId || !['approved', 'rejected'].includes(status)) {
    return res.status(400).json({ 
      success: false, 
      error: 'Valid withdrawal request ID and status required' 
    });
  }

  // Update withdrawal request
  const { data: updatedRequest, error: updateError } = await authenticatedSupabase
    .from('withdrawal_requests')
    .update({
      status,
      admin_notes: adminNotes,
      processed_at: new Date().toISOString(),
      processed_by: user.id,
      external_transaction_id: transactionId
    })
    .eq('id', withdrawalRequestId)
    .select()
    .single();

  if (updateError) {
    console.error('Withdrawal update error:', updateError);
    return res.status(500).json({ success: false, error: 'Failed to update withdrawal request' });
  }

  return res.status(200).json({
    success: true,
    data: {
      withdrawalRequest: updatedRequest,
      message: `Withdrawal request ${status} successfully`
    }
  });
}

// SYSTEM: REWARD PARTICIPANT FOR STUDY COMPLETION
if (action === 'reward-participant' && req.method === 'POST') {
  // This would be called when a participant completes a study
  const { participantId, studyId, studyBlocks, difficulty } = req.body;

  if (!participantId || !studyId) {
    return res.status(400).json({ 
      success: false, 
      error: 'Participant ID and study ID required' 
    });
  }

  const rewardAmount = calculateParticipantReward(studyBlocks, 1, difficulty);

  // Create reward transaction
  const { data: transaction, error: transactionError } = await authenticatedSupabase
    .from('points_transactions')
    .insert({
      user_id: participantId,
      type: 'study_reward',
      amount: rewardAmount,
      reason: `Study completion reward`,
      study_id: studyId
    })
    .select()
    .single();

  if (transactionError) {
    console.error('Participant reward error:', transactionError);
    return res.status(500).json({ success: false, error: 'Failed to create reward transaction' });
  }

  return res.status(200).json({
    success: true,
    data: {
      transaction: mapTransactionToFrontend(transaction),
      rewardAmount,
      cashValue: rewardAmount * POINTS_CONFIG.PARTICIPANT_EARNINGS.CONVERSION_RATE,
      message: `Participant rewarded ${rewardAmount} points for study completion`
    }
  });
}

// Enhanced helper functions would be added here...
// (Previous helper functions remain the same but with added transaction type support)

export default handler;
