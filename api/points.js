/**
 * Points Management API - Replace Stripe with Admin-Controlled Points System
 * 
 * Endpoints:
 * - GET /api/points?action=balance - Get user's points balance
 * - POST /api/points?action=assign - Admin assigns points to researcher
 * - POST /api/points?action=consume - Consume points for study creation
 * - GET /api/points?action=history - Get points transaction history
 * 
 * Security Features:
 * - JWT token authentication
 * - Admin-only point assignment
 * - Automatic point consumption tracking
 * - Transaction audit trail
 * 
 * Created: July 1, 2025
 * Status: Production Ready ✅
 */
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wxpwxzdgdvinlbtnbgdf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4cHd4emRnZHZpbmxidG5iZ2RmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAxOTk1ODAsImV4cCI6MjA2NTc3NTU4MH0.YMai9p4VQMbdqmc_9uWGeJ6nONHwuM9XT2FDTFy0aGk';

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
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

    // Create authenticated supabase client with the user's token
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

      if (error && error.code !== 'PGRST116') { // Not found is ok
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
          data: {
            balance: newBalance,
            message: 'New points account created'
          }
        });
      }

      return res.status(200).json({
        success: true,
        data: { balance }
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

      // Find target user by ID or email
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

      const finalTargetUserId = targetUser.id;

      // Calculate expiry date
      const expiresAt = expiresInDays ? 
        new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000) : 
        null;

      // Get current balance for the target user
      const { data: targetBalance } = await authenticatedSupabase
        .from('points_balance')
        .select('available_points')
        .eq('user_id', finalTargetUserId)
        .single();

      const currentPoints = targetBalance?.available_points || 0;
      const balanceAfterAssignment = currentPoints + amount;

      // Start transaction
      const { data: transaction, error: transactionError } = await authenticatedSupabase
        .from('points_transactions')
        .insert({
          user_id: finalTargetUserId,
          type: 'assigned',
          amount: amount,
          balance: balanceAfterAssignment,
          reason: reason || 'Admin assignment',
          assigned_by: user.id,
          expires_at: expiresAt
        })
        .select()
        .single();

      if (transactionError) {
        console.error('Transaction error:', transactionError);
        return res.status(500).json({ success: false, error: 'Failed to create transaction' });
      }

      // Update balance
      const { data: currentBalance } = await supabase
        .from('points_balance')
        .select('*')
        .eq('user_id', finalTargetUserId)
        .single();

      const newBalance = {
        user_id: finalTargetUserId,
        total_points: (currentBalance?.total_points || 0) + amount,
        available_points: (currentBalance?.available_points || 0) + amount,
        used_points: currentBalance?.used_points || 0,
        expired_points: currentBalance?.expired_points || 0,
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
        data: {
          transaction,
          newBalance,
          message: `${amount} points assigned to ${targetUser.email}`
        }
      });
    }

    // CONSUME POINTS
    if (action === 'consume' && req.method === 'POST') {
      const { amount, studyId, reason } = req.body;

      if (!amount || amount <= 0) {
        return res.status(400).json({ 
          success: false, 
          error: 'Positive amount required' 
        });
      }

      // Get current balance
      const { data: balance } = await supabase
        .from('points_balance')
        .select('*')
        .eq('user_id', user.id)
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
          user_id: user.id,
          type: 'consumed',
          amount: -amount, // Negative for consumption
          reason: reason || 'Study creation',
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
        user_id: user.id,
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
        data: {
          transaction,
          newBalance,
          message: `${amount} points consumed`
        }
      });
    }

    // GET TRANSACTION HISTORY
    if (action === 'history' && req.method === 'GET') {
      const { limit = 50, offset = 0 } = req.query;

      const { data: transactions, error } = await supabase
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
        data: { transactions }
      });
    }

    // ADMIN: GET ALL USER BALANCES
    if (action === 'admin-balances' && req.method === 'GET') {
      if (!profile || profile.role !== 'admin') {
        return res.status(403).json({ success: false, error: 'Admin access required' });
      }

      const { data: balances, error } = await supabase
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
        data: { balances }
      });
    }

    return res.status(400).json({
      success: false,
      error: 'Invalid action or method'
    });

  } catch (error) {
    console.error('Points API error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}
