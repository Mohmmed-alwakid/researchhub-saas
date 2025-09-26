import { createClient } from '@supabase/supabase-js';


// PUT /api/admin/payments/requests/[requestId]/[action] - Verify or reject payment
const supabaseUrl = process.env.SUPABASE_URL || 'https://wxpwxzdgdvinlbtnbgdf.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'process.env.SUPABASE_SERVICE_ROLE_KEY || 'your_supabase_service_role_key_here'';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey || supabaseKey);

// Helper function to verify admin access
async function verifyAdmin(req) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    throw new Error('No token provided');
  }

  const authenticatedSupabase = createClient(supabaseUrl, supabaseKey, {
    global: {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  });

  const { data: { user }, error: authError } = await authenticatedSupabase.auth.getUser(token);
  if (authError || !user) {
    throw new Error('Invalid token');
  }

  // Check admin role
  const userRole = user.user_metadata?.role;
  if (userRole === 'admin' || userRole === 'super_admin') {
    return user;
  }

  const { data: profile } = await authenticatedSupabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || (profile.role !== 'admin' && profile.role !== 'super_admin')) {
    throw new Error('Access denied. Admin role required.');
  }

  return user;
}

// Mock payment data - In a real app, this would be stored in a database
let mockPaymentRequests = [
  {
    _id: 'payment_001',
    userId: {
      _id: 'user_001',
      firstName: 'John',
      lastName: 'Smith',
      email: 'john.smith@example.com'
    },
    planType: 'pro',
    amount: 29.99,
    currency: 'USD',
    status: 'pending',
    paymentMethod: 'Bank Transfer',
    paymentProofUrl: 'https://example.com/proof1.jpg',
    adminNotes: '',
    requestedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    processedAt: null,
    processedBy: null
  },
  {
    _id: 'payment_002',
    userId: {
      _id: 'user_002',
      firstName: 'Sarah',
      lastName: 'Johnson',
      email: 'sarah.johnson@company.com'
    },
    planType: 'enterprise',
    amount: 99.99,
    currency: 'USD',
    status: 'verified',
    paymentMethod: 'Wire Transfer',
    paymentProofUrl: 'https://example.com/proof2.pdf',
    adminNotes: 'Payment verified via bank statement',
    requestedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    processedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    processedBy: {
      _id: 'admin_001',
      firstName: 'Admin',
      lastName: 'User'
    }
  },
  {
    _id: 'payment_004',
    userId: {
      _id: 'user_004',
      firstName: 'Emily',
      lastName: 'Davis',
      email: 'emily.davis@research.edu'
    },
    planType: 'pro',
    amount: 29.99,
    currency: 'USD',
    status: 'pending',
    paymentMethod: 'Cryptocurrency',
    paymentProofUrl: 'https://example.com/proof4.jpg',
    adminNotes: '',
    requestedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    processedAt: null,
    processedBy: null
  }
];

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'PUT') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });
  }

  try {
    // Verify admin access
    await verifyAdmin(req);

    const { requestId, action } = req.query;
    const { adminNotes } = req.body;

    if (!requestId || !action) {
      return res.status(400).json({
        success: false,
        error: 'Request ID and action are required'
      });
    }

    if (!['verify', 'reject'].includes(action)) {
      return res.status(400).json({
        success: false,
        error: 'Action must be either "verify" or "reject"'
      });
    }

    // Find the payment request
    const requestIndex = mockPaymentRequests.findIndex(r => r._id === requestId);
    if (requestIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Payment request not found'
      });
    }

    const request = mockPaymentRequests[requestIndex];
    
    if (request.status !== 'pending') {
      return res.status(400).json({
        success: false,
        error: 'Only pending payment requests can be processed'
      });
    }

    // Update the payment request
    const updatedRequest = {
      ...request,
      status: action === 'verify' ? 'verified' : 'rejected',
      adminNotes: adminNotes || '',
      processedAt: new Date().toISOString(),
      processedBy: {
        _id: 'admin_current',
        firstName: 'Current',
        lastName: 'Admin'
      }
    };

    mockPaymentRequests[requestIndex] = updatedRequest;

    return res.status(200).json({
      success: true,
      data: updatedRequest,
      message: `Payment request ${action === 'verify' ? 'verified' : 'rejected'} successfully`
    });
    
  } catch (error) {
    console.error('Payment action error:', error);
    return res.status(error.message.includes('Access denied') ? 403 : 500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
}
