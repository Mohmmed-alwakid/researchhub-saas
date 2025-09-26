import { createClient } from '@supabase/supabase-js';


/**
 * Wallets API - Participant wallet and withdrawal management
 * 
 * Endpoints:
 * - GET /api/wallets?action=get - Get participant wallet
 * - POST /api/wallets?action=request-withdrawal - Request withdrawal
 * - GET /api/wallets?action=withdrawals - Get participant withdrawal history
 * - GET /api/wallets?action=transactions - Get wallet transaction history
 * - GET /api/wallets?action=admin-withdrawals - Get all withdrawals (admin)
 * - POST /api/wallets?action=process-withdrawal - Approve/reject withdrawal (admin)
 * - GET /api/wallets?action=admin-wallets - Get all wallets (admin)
 * - POST /api/wallets?action=add-earnings - Add earnings for study completion
 * 
 * Created: July 5, 2025
 * Status: Production Ready ✅
 */

const supabaseUrl = 'https://wxpwxzdgdvinlbtnbgdf.supabase.co';
const supabaseKey = 'process.env.SUPABASE_SERVICE_ROLE_KEY || 'your_supabase_service_role_key_here'';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'process.env.SUPABASE_SERVICE_ROLE_KEY || 'your_supabase_service_role_key_here'';

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { action } = req.query;

  // Create Supabase clients
  const supabase = createClient(supabaseUrl, supabaseKey);
  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

  try {
    switch (action) {
      case 'get':
        return await getParticipantWallet(req, res, supabase);
      case 'request-withdrawal':
        return await requestWithdrawal(req, res, supabase);
      case 'withdrawals':
        return await getParticipantWithdrawals(req, res, supabase);
      case 'transactions':
        return await getWalletTransactions(req, res, supabase);
      case 'admin-withdrawals':
        return await getAllWithdrawals(req, res, supabaseAdmin);
      case 'process-withdrawal':
        return await processWithdrawal(req, res, supabaseAdmin);
      case 'admin-wallets':
        return await getAllWallets(req, res, supabaseAdmin);
      case 'add-earnings':
        return await addStudyEarnings(req, res, supabase);
      default:
        return res.status(400).json({
          success: false,
          error: 'Invalid action parameter'
        });
    }
  } catch (error) {
    console.error('Wallets API error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}

// Get participant wallet
async function getParticipantWallet(req, res, supabase) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  // Verify authentication
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ success: false, error: 'No authorization header' });
  }

  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  
  if (authError || !user) {
    return res.status(401).json({ success: false, error: 'Invalid token' });
  }

  // Create an authenticated Supabase client using the user's token
  const userSupabase = createClient(supabaseUrl, supabaseKey, {
    global: {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  });

  try {
    // Get participant wallet using authenticated client
    const { data: wallet, error } = await userSupabase
      .from('participant_wallets')
      .select('*')
      .eq('participant_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
      console.error('Error fetching wallet:', error);
      return res.status(500).json({ 
        success: false, 
        error: 'Failed to fetch wallet' 
      });
    }

    // If no wallet exists, create one using authenticated client
    if (!wallet) {
      const { data: newWallet, error: createError } = await userSupabase
        .from('participant_wallets')
        .insert({
          participant_id: user.id,
          balance: 0.00,
          total_earned: 0.00,
          total_withdrawn: 0.00,
          currency: 'USD'
        })
        .select()
        .single();

      if (createError) {
        console.error('Error creating wallet:', createError);
        return res.status(500).json({ 
          success: false, 
          error: 'Failed to create wallet' 
        });
      }

      return res.status(200).json({
        success: true,
        data: newWallet
      });
    }

    return res.status(200).json({
      success: true,
      data: wallet
    });

  } catch (error) {
    console.error('Get wallet error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to get wallet'
    });
  }
}

// Request withdrawal
async function requestWithdrawal(req, res, supabase) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  // Verify authentication
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ success: false, error: 'No authorization header' });
  }

  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  
  if (authError || !user) {
    return res.status(401).json({ success: false, error: 'Invalid token' });
  }

  // Create an authenticated Supabase client using the user's token
  const userSupabase = createClient(supabaseUrl, supabaseKey, {
    global: {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  });

  const { amount, payment_method, payment_details } = req.body;

  console.log('🔍 Request body:', JSON.stringify(req.body, null, 2));
  console.log('🔍 User:', user.id);

  if (!amount || !payment_method || !payment_details) {
    console.log('❌ Missing required fields:', { amount, payment_method, payment_details });
    return res.status(400).json({
      success: false,
      error: 'Amount, payment method, and payment details are required'
    });
  }

  if (amount <= 0) {
    return res.status(400).json({
      success: false,
      error: 'Amount must be greater than 0'
    });
  }

  try {
    // Get participant wallet using authenticated client
    const { data: wallet, error: walletError } = await userSupabase
      .from('participant_wallets')
      .select('*')
      .eq('participant_id', user.id)
      .single();

    if (walletError || !wallet) {
      return res.status(404).json({
        success: false,
        error: 'Wallet not found'
      });
    }

    // Check if sufficient balance
    if (wallet.balance < amount) {
      return res.status(400).json({
        success: false,
        error: 'Insufficient balance'
      });
    }

    // Create withdrawal request using authenticated client
    console.log('🔍 Creating withdrawal request with:', {
      participant_id: user.id,
      wallet_id: wallet.id,
      amount,
      payment_method,
      payment_details,
      status: 'pending'
    });

    const { data: withdrawalRequest, error } = await userSupabase
      .from('withdrawal_requests')
      .insert({
        participant_id: user.id,
        wallet_id: wallet.id,
        amount,
        payment_method,
        payment_details,
        status: 'pending'
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating withdrawal request:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to create withdrawal request'
      });
    }

    return res.status(201).json({
      success: true,
      data: withdrawalRequest
    });

  } catch (error) {
    console.error('Request withdrawal error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to request withdrawal'
    });
  }
}

// Get participant withdrawals
async function getParticipantWithdrawals(req, res, supabase) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  // Verify authentication
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ success: false, error: 'No authorization header' });
  }

  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  
  if (authError || !user) {
    return res.status(401).json({ success: false, error: 'Invalid token' });
  }

  try {
    const { data: withdrawals, error } = await supabase
      .from('withdrawal_requests')
      .select('*')
      .eq('participant_id', user.id)
      .order('requested_at', { ascending: false });

    if (error) {
      console.error('Error fetching all withdrawals:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch withdrawals'
      });
    }

    console.log('🔍 Found withdrawals:', withdrawals?.length || 0);

    return res.status(200).json({
      success: true,
      data: withdrawals || []
    });

  } catch (error) {
    console.error('Get withdrawals error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to get withdrawals'
    });
  }
}

// Get wallet transactions
async function getWalletTransactions(req, res, supabase) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  // Verify authentication
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ success: false, error: 'No authorization header' });
  }

  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  
  if (authError || !user) {
    return res.status(401).json({ success: false, error: 'Invalid token' });
  }

  try {
    // Get participant wallet first
    const { data: wallet, error: walletError } = await supabase
      .from('participant_wallets')
      .select('id')
      .eq('participant_id', user.id)
      .single();

    if (walletError || !wallet) {
      return res.status(404).json({
        success: false,
        error: 'Wallet not found'
      });
    }

    // Get transactions
    const { data: transactions, error } = await supabase
      .from('wallet_transactions')
      .select('*')
      .eq('wallet_id', wallet.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching transactions:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch transactions'
      });
    }

    return res.status(200).json({
      success: true,
      data: transactions || []
    });

  } catch (error) {
    console.error('Get transactions error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to get transactions'
    });
  }
}

// Admin: Get all withdrawal requests
async function getAllWithdrawals(req, res, supabaseAdmin) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  // Verify admin authentication using a normal supabase client first
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ success: false, error: 'No authorization header' });
  }

  const token = authHeader.replace('Bearer ', '');
  
  // Use the anon client to verify the token
  const normalSupabase = createClient(supabaseUrl, supabaseKey);
  const { data: { user }, error: authError } = await normalSupabase.auth.getUser(token);
  
  if (authError || !user) {
    return res.status(401).json({ success: false, error: 'Invalid token' });
  }

  // Check if user is admin using the normal client with the user's token
  const userSupabase = createClient(supabaseUrl, supabaseKey, {
    global: {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  });

  const { data: profile, error: profileError } = await userSupabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  console.log('🔍 Admin check - User ID:', user.id);
  console.log('🔍 Admin check - Profile:', profile);
  console.log('🔍 Admin check - Profile Error:', profileError);

  if (profile?.role !== 'admin') {
    return res.status(403).json({ success: false, error: 'Admin access required' });
  }

  try {
    // Use the authenticated user client for the query (admin user should have access via RLS)
    const { data: withdrawals, error } = await userSupabase
      .from('withdrawal_requests')
      .select(`
        *,
        profiles!withdrawal_requests_participant_id_fkey (
          id,
          first_name,
          last_name,
          email
        )
      `)
      .order('requested_at', { ascending: false });

    if (error) {
      console.error('Error fetching all withdrawals:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch withdrawals'
      });
    }

    // Transform data to include participant info
    const transformedWithdrawals = withdrawals?.map(withdrawal => ({
      ...withdrawal,
      participant: {
        id: withdrawal.profiles?.id,
        name: `${withdrawal.profiles?.first_name || ''} ${withdrawal.profiles?.last_name || ''}`.trim() || 'Unnamed Participant',
        email: withdrawal.profiles?.email || 'No email available'
      }
    }));

    return res.status(200).json({
      success: true,
      data: transformedWithdrawals || []
    });

  } catch (error) {
    console.error('Get all withdrawals error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to get withdrawals'
    });
  }
}

// Admin: Process withdrawal (approve/reject)
async function processWithdrawal(req, res, supabaseAdmin) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  // Verify admin authentication using a normal supabase client first
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ success: false, error: 'No authorization header' });
  }

  const token = authHeader.replace('Bearer ', '');
  
  // Use the anon client to verify the token
  const normalSupabase = createClient(supabaseUrl, supabaseKey);
  const { data: { user }, error: authError } = await normalSupabase.auth.getUser(token);
  
  if (authError || !user) {
    return res.status(401).json({ success: false, error: 'Invalid token' });
  }

  // Check if user is admin using the user's authenticated client
  const userSupabase = createClient(supabaseUrl, supabaseKey, {
    global: {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  });

  const { data: profile, error: profileError } = await userSupabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') {
    return res.status(403).json({ success: false, error: 'Admin access required' });
  }

  const { withdrawal_id, action, admin_notes } = req.body;

  if (!withdrawal_id || !action || !['approve', 'reject'].includes(action)) {
    return res.status(400).json({
      success: false,
      error: 'Withdrawal ID and valid action (approve/reject) are required'
    });
  }

  try {
    // Get the withdrawal request
    const { data: withdrawal, error: withdrawalError } = await userSupabase
      .from('withdrawal_requests')
      .select('*')
      .eq('id', withdrawal_id)
      .single();

    if (withdrawalError || !withdrawal) {
      return res.status(404).json({
        success: false,
        error: 'Withdrawal request not found'
      });
    }

    if (withdrawal.status !== 'pending') {
      return res.status(400).json({
        success: false,
        error: 'Withdrawal request has already been processed'
      });
    }

    const newStatus = action === 'approve' ? 'approved' : 'rejected';

    // If approving, we need to deduct from wallet balance
    if (action === 'approve') {
      // Get the wallet
      const { data: wallet, error: walletError } = await userSupabase
        .from('participant_wallets')
        .select('*')
        .eq('id', withdrawal.wallet_id)
        .single();

      if (walletError || !wallet) {
        return res.status(404).json({
          success: false,
          error: 'Wallet not found'
        });
      }

      // Check if still sufficient balance
      if (wallet.balance < withdrawal.amount) {
        return res.status(400).json({
          success: false,
          error: 'Insufficient wallet balance'
        });
      }

      // Start transaction: Update withdrawal status and wallet balance
      const { data: updatedWithdrawal, error: updateError } = await userSupabase
        .from('withdrawal_requests')
        .update({
          status: newStatus,
          admin_notes,
          processed_at: new Date().toISOString(),
          processed_by: user.id
        })
        .eq('id', withdrawal_id)
        .select()
        .single();

      if (updateError) {
        console.error('Error updating withdrawal:', updateError);
        return res.status(500).json({
          success: false,
          error: 'Failed to update withdrawal'
        });
      }

      // Update wallet balance
      const newBalance = wallet.balance - withdrawal.amount;
      const newTotalWithdrawn = wallet.total_withdrawn + withdrawal.amount;

      const { error: balanceError } = await userSupabase
        .from('participant_wallets')
        .update({
          balance: newBalance,
          total_withdrawn: newTotalWithdrawn,
          updated_at: new Date().toISOString()
        })
        .eq('id', withdrawal.wallet_id);

      if (balanceError) {
        console.error('Error updating wallet balance:', balanceError);
        // We should rollback the withdrawal update here in a real transaction
        return res.status(500).json({
          success: false,
          error: 'Failed to update wallet balance'
        });
      }

      // Create transaction record
      const { error: transactionError } = await userSupabase
        .from('wallet_transactions')
        .insert({
          wallet_id: withdrawal.wallet_id,
          transaction_type: 'withdrawal',
          amount: -withdrawal.amount, // Negative for withdrawal
          balance_before: wallet.balance,
          balance_after: newBalance,
          reference_type: 'withdrawal_request',
          reference_id: withdrawal.id,
          description: `Withdrawal processed - ${withdrawal.payment_method}`,
          created_by: user.id
        });

      if (transactionError) {
        console.error('Error creating transaction record:', transactionError);
        // Continue anyway - the withdrawal is already processed
      }

      return res.status(200).json({
        success: true,
        data: updatedWithdrawal,
        message: 'Withdrawal approved and balance updated'
      });

    } else {
      // Just reject the withdrawal
      const { data: updatedWithdrawal, error: updateError } = await userSupabase
        .from('withdrawal_requests')
        .update({
          status: newStatus,
          admin_notes,
          processed_at: new Date().toISOString(),
          processed_by: user.id
        })
        .eq('id', withdrawal_id)
        .select()
        .single();

      if (updateError) {
        console.error('Error updating withdrawal:', updateError);
        return res.status(500).json({
          success: false,
          error: 'Failed to update withdrawal'
        });
      }

      return res.status(200).json({
        success: true,
        data: updatedWithdrawal,
        message: 'Withdrawal rejected'
      });
    }

  } catch (error) {
    console.error('Process withdrawal error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to process withdrawal'
    });
  }
}

// Admin: Get all wallets
async function getAllWallets(req, res, supabase) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  // Verify admin authentication
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ success: false, error: 'No authorization header' });
  }

  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  
  if (authError || !user) {
    return res.status(401).json({ success: false, error: 'Invalid token' });
  }

  // Check if user is admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') {
    return res.status(403).json({ success: false, error: 'Admin access required' });
  }

  try {
    const { data: wallets, error } = await supabase
      .from('participant_wallets')
      .select(`
        *,
        profiles!participant_wallets_participant_id_fkey (
          id,
          first_name,
          last_name,
          email
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching all wallets:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch wallets'
      });
    }

    // Transform data to include participant info
    const transformedWallets = wallets?.map(wallet => ({
      ...wallet,
      participant: {
        id: wallet.profiles?.id,
        name: `${wallet.profiles?.first_name || ''} ${wallet.profiles?.last_name || ''}`.trim() || 'Unnamed Participant',
        email: wallet.profiles?.email || 'No email available'
      }
    }));

    return res.status(200).json({
      success: true,
      data: transformedWallets || []
    });

  } catch (error) {
    console.error('Get all wallets error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to get wallets'
    });
  }
}

// Add earnings to participant wallet (for study completion)
async function addStudyEarnings(req, res, supabase) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const { participant_id, amount, study_id, study_title } = req.body;

  if (!participant_id || !amount || amount <= 0) {
    return res.status(400).json({
      success: false,
      error: 'Participant ID and positive amount are required'
    });
  }

  try {
    // Get or create participant wallet
    let { data: wallet, error: walletError } = await supabase
      .from('participant_wallets')
      .select('*')
      .eq('participant_id', participant_id)
      .single();

    if (walletError && walletError.code !== 'PGRST116') {
      console.error('Error fetching wallet:', walletError);
      return res.status(500).json({ 
        success: false, 
        error: 'Failed to fetch wallet' 
      });
    }

    // If no wallet exists, create one
    if (!wallet) {
      const { data: newWallet, error: createError } = await supabase
        .from('participant_wallets')
        .insert({
          participant_id,
          balance: amount,
          total_earned: amount,
          total_withdrawn: 0.00,
          currency: 'USD'
        })
        .select()
        .single();

      if (createError) {
        console.error('Error creating wallet:', createError);
        return res.status(500).json({ 
          success: false, 
          error: 'Failed to create wallet' 
        });
      }

      wallet = newWallet;
    } else {
      // Update existing wallet
      const newBalance = wallet.balance + amount;
      const newTotalEarned = wallet.total_earned + amount;

      const { data: updatedWallet, error: updateError } = await supabase
        .from('participant_wallets')
        .update({
          balance: newBalance,
          total_earned: newTotalEarned,
          updated_at: new Date().toISOString()
        })
        .eq('id', wallet.id)
        .select()
        .single();

      if (updateError) {
        console.error('Error updating wallet:', updateError);
        return res.status(500).json({ 
          success: false, 
          error: 'Failed to update wallet' 
        });
      }

      wallet = updatedWallet;
    }

    // Create transaction record
    const { error: transactionError } = await supabase
      .from('wallet_transactions')
      .insert({
        wallet_id: wallet.id,
        transaction_type: 'earning',
        amount: amount,
        balance_before: wallet.balance - amount,
        balance_after: wallet.balance,
        reference_type: 'study_completion',
        reference_id: study_id,
        description: study_title ? 
          `Study completion: ${study_title}` : 
          'Study completion reward',
        created_by: participant_id
      });

    if (transactionError) {
      console.error('Error creating transaction record:', transactionError);
      // Continue anyway - the wallet is already updated
    }

    return res.status(200).json({
      success: true,
      message: 'Earnings added successfully',
      data: {
        wallet,
        amount_added: amount,
        new_balance: wallet.balance
      }
    });

  } catch (error) {
    console.error('Add earnings error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to add earnings'
    });
  }
}
