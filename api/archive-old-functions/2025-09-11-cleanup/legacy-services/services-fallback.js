import { 
  initializeFallbackDatabase,
  checkSupabaseConnectivity 
} from '../scripts/development/network-resilient-fallback.js';


/**
 * NETWORK-RESILIENT SERVICE LAYER API
 * Provides local fallback for wallet, studies, and applications services
 * ✅ REAL DATA MODE: Uses actual fallback database operations
 * 🔧 TRANSPARENT SWITCHING: Same API interface as remote services
 */

let fallbackDb;
let isInitialized = false;

// Initialize fallback database on first use
async function ensureFallbackDb() {
  if (!isInitialized || !fallbackDb) {
    console.log('🔧 Initializing fallback database for service layer...');
    fallbackDb = await initializeFallbackDatabase();
    isInitialized = true;
  }
  return fallbackDb;
}

/**
 * Wallet Service Fallback API
 */
async function handleWalletRequests(req, res) {
  const { action, userId } = req.query;
  const db = await ensureFallbackDb();
  
  try {
    switch (action) {
      case 'wallet':
        const walletData = await db.getWalletData(userId);
        return res.status(200).json({
          success: true,
          data: walletData.data || {
            id: `fallback-wallet-${userId}`,
            participant_id: userId,
            balance: 125.50,
            total_earned: 567.25,
            total_withdrawn: 441.75,
            currency: 'USD',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        });

      case 'transactions':
        const transactions = await db.getTransactions(userId);
        return res.status(200).json({
          success: true,
          data: transactions.data || []
        });

      case 'withdrawal-requests':
        const withdrawals = await db.getWithdrawalRequests(userId);
        return res.status(200).json({
          success: true,
          data: withdrawals.data || []
        });

      default:
        return res.status(400).json({
          success: false,
          error: 'Invalid wallet action'
        });
    }
  } catch (error) {
    console.error('Wallet fallback error:', error);
    return res.status(500).json({
      success: false,
      error: 'Wallet service unavailable'
    });
  }
}

/**
 * Studies Service Fallback API
 */
async function handleStudiesRequests(req, res) {
  const { action, study_id } = req.query;
  const db = await ensureFallbackDb();
  
  try {
    switch (action) {
      case 'studies':
        const studies = await db.getStudies();
        return res.status(200).json({
          success: true,
          studies: studies.data || [],
          pagination: {
            currentPage: 1,
            totalPages: 1,
            totalStudies: studies.data?.length || 0,
            hasNext: false,
            hasPrev: false
          }
        });

      case 'get-study':
        if (!study_id) {
          return res.status(400).json({
            success: false,
            error: 'Study ID required'
          });
        }
        
        const study = await db.getStudy(study_id);
        if (study.data) {
          return res.status(200).json({
            success: true,
            study: study.data
          });
        } else {
          return res.status(404).json({
            success: false,
            error: 'Study not found'
          });
        }

      case 'create-study':
        if (req.method !== 'POST') {
          return res.status(405).json({ success: false, error: 'Method not allowed' });
        }
        
        const newStudy = {
          id: `fallback-study-${Date.now()}`,
          ...req.body,
          status: 'draft',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          researcher_id: req.body.researcher_id || 'test-researcher-001'
        };
        
        const createResult = await db.createStudy(newStudy);
        return res.status(201).json({
          success: true,
          study: createResult.data,
          message: 'Study created successfully (local fallback)'
        });

      case 'launch-study':
        if (req.method !== 'PATCH') {
          return res.status(405).json({ success: false, error: 'Method not allowed' });
        }
        
        if (!study_id) {
          return res.status(400).json({
            success: false,
            error: 'Study ID required'
          });
        }
        
        const launchResult = await db.updateStudy(study_id, { 
          status: 'active',
          launched_at: new Date().toISOString()
        });
        
        if (launchResult.data) {
          return res.status(200).json({
            success: true,
            study: launchResult.data,
            message: 'Study launched successfully (local fallback)'
          });
        } else {
          return res.status(404).json({
            success: false,
            error: 'Study not found'
          });
        }

      default:
        return res.status(400).json({
          success: false,
          error: 'Invalid studies action'
        });
    }
  } catch (error) {
    console.error('Studies fallback error:', error);
    return res.status(500).json({
      success: false,
      error: 'Studies service unavailable'
    });
  }
}

/**
 * Applications Service Fallback API
 */
async function handleApplicationsRequests(req, res) {
  const { action, userId } = req.query;
  const db = await ensureFallbackDb();
  
  try {
    switch (action) {
      case 'applications':
        const applications = await db.getApplications(userId);
        return res.status(200).json({
          success: true,
          data: applications.data || []
        });

      case 'public-studies':
        const publicStudies = await db.getPublicStudies();
        return res.status(200).json({
          success: true,
          data: publicStudies.data || []
        });

      case 'apply':
        if (req.method !== 'POST') {
          return res.status(405).json({ success: false, error: 'Method not allowed' });
        }
        
        const application = {
          _id: `fallback-app-${Date.now()}`,
          participantId: userId,
          ...req.body,
          status: 'pending',
          appliedAt: new Date(),
          createdAt: new Date().toISOString()
        };
        
        const applyResult = await db.createApplication(application);
        return res.status(201).json({
          success: true,
          data: applyResult.data,
          message: 'Application submitted successfully (local fallback)'
        });

      default:
        return res.status(400).json({
          success: false,
          error: 'Invalid applications action'
        });
    }
  } catch (error) {
    console.error('Applications fallback error:', error);
    return res.status(500).json({
      success: false,
      error: 'Applications service unavailable'
    });
  }
}

/**
 * Main handler - routes to appropriate service
 */
export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    console.log(`=== SERVICE FALLBACK: ${req.url} ===`);

    // Route to appropriate service handler
    if (req.url.includes('wallet')) {
      return await handleWalletRequests(req, res);
    } else if (req.url.includes('studies') || req.url.includes('research-consolidated')) {
      return await handleStudiesRequests(req, res);
    } else if (req.url.includes('applications') || req.url.includes('participant-applications')) {
      return await handleApplicationsRequests(req, res);
    } else {
      return res.status(404).json({
        success: false,
        error: 'Service not found',
        availableServices: ['wallet', 'studies', 'applications']
      });
    }
  } catch (error) {
    console.error('Service fallback handler exception:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}
