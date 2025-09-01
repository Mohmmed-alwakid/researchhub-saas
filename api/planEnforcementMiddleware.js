/**
 * PLAN ENFORCEMENT MIDDLEWARE
 * Validates subscription limits before allowing actions
 * Integrates with usage tracking and subscription management
 */

import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL || 'https://wxpwxzdgdvinlbtnbgdf.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4cHd4emRnZHZpbmxidG5iZ2RmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAxOTk1ODAsImV4cCI6MjA2NTc3NTU4MH0.YMai9p4VQMbdqmc_9uWGeJ6nONHwuM9XT2FDTFy0aGk';

const supabase = createClient(supabaseUrl, supabaseKey);

// Subscription plan definitions with limits
export const SUBSCRIPTION_PLANS = {
  free: {
    id: 'free',
    name: 'Free',
    price: 0,
    maxStudies: 3,
    maxParticipantsPerStudy: 10,
    recordingMinutes: 60,
    advancedAnalytics: false,
    exportData: false,
    teamCollaboration: false,
    prioritySupport: false,
    customBranding: false
  },
  basic: {
    id: 'basic',
    name: 'Basic',
    price: 29,
    maxStudies: 15,
    maxParticipantsPerStudy: 50,
    recordingMinutes: 300,
    advancedAnalytics: true,
    exportData: true,
    teamCollaboration: false,
    prioritySupport: false,
    customBranding: false
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    price: 99,
    maxStudies: -1, // Unlimited
    maxParticipantsPerStudy: 500,
    recordingMinutes: 1800,
    advancedAnalytics: true,
    exportData: true,
    teamCollaboration: true,
    prioritySupport: true,
    customBranding: true
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    price: 299,
    maxStudies: -1, // Unlimited
    maxParticipantsPerStudy: -1, // Unlimited
    recordingMinutes: -1, // Unlimited
    advancedAnalytics: true,
    exportData: true,
    teamCollaboration: true,
    prioritySupport: true,
    customBranding: true
  }
};

// In-memory storage for development (fallback when Supabase unavailable)
const inMemoryStorage = {
  subscriptions: new Map(),
  usage: new Map()
};

/**
 * Get user subscription from database or fallback
 */
export async function getUserSubscription(userId, userEmail = null) {
  try {
    // Try Supabase first
    const { data, error } = await supabase
      .from('user_subscriptions')
      .select('*, subscription_plans(*)')
      .eq('user_id', userId)
      .eq('status', 'active')
      .single();

    if (data && !error) {
      return {
        plan: data.subscription_plans?.id || 'free',
        status: data.status,
        features: SUBSCRIPTION_PLANS[data.subscription_plans?.id || 'free']
      };
    }
  } catch (error) {
    console.log('🔧 Supabase unavailable, using fallback subscription data');
  }

  // Fallback to in-memory storage for development
  if (inMemoryStorage.subscriptions.has(userId)) {
    return inMemoryStorage.subscriptions.get(userId);
  }

  // Default free plan for new users
  const defaultSubscription = {
    plan: 'free',
    status: 'active',
    features: SUBSCRIPTION_PLANS.free
  };

  // Store in fallback for consistency
  inMemoryStorage.subscriptions.set(userId, defaultSubscription);
  
  // Special handling for test accounts
  if (userEmail) {
    if (userEmail.includes('+admin@')) {
      const enterpriseSubscription = {
        plan: 'enterprise',
        status: 'active',
        features: SUBSCRIPTION_PLANS.enterprise
      };
      inMemoryStorage.subscriptions.set(userId, enterpriseSubscription);
      return enterpriseSubscription;
    }
    if (userEmail.includes('+Researcher@')) {
      const proSubscription = {
        plan: 'pro',
        status: 'active',
        features: SUBSCRIPTION_PLANS.pro
      };
      inMemoryStorage.subscriptions.set(userId, proSubscription);
      return proSubscription;
    }
  }

  return defaultSubscription;
}

/**
 * Get user usage metrics from database or fallback
 */
export async function getUserUsage(userId) {
  try {
    // Try Supabase first
    const { data, error } = await supabase
      .from('usage_metrics')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (data && !error) {
      return {
        studiesCreated: data.studies_created || 0,
        participantsRecruited: data.participants_recruited || 0,
        recordingMinutesUsed: data.recording_minutes_used || 0,
        dataExports: data.data_exports || 0,
        lastResetDate: new Date(data.last_reset_date)
      };
    }
  } catch (error) {
    console.log('🔧 Supabase unavailable, using fallback usage data');
  }

  // Fallback to in-memory storage for development
  if (inMemoryStorage.usage.has(userId)) {
    return inMemoryStorage.usage.get(userId);
  }

  // Default usage for new users
  const defaultUsage = {
    studiesCreated: 0,
    participantsRecruited: 0,
    recordingMinutesUsed: 0,
    dataExports: 0,
    lastResetDate: new Date()
  };

  inMemoryStorage.usage.set(userId, defaultUsage);
  return defaultUsage;
}

/**
 * Update user usage metrics
 */
async function updateUserUsage(userId, updates) {
  try {
    // Try Supabase first
    const { data, error } = await supabase
      .from('usage_metrics')
      .upsert({
        user_id: userId,
        studies_created: updates.studiesCreated,
        participants_recruited: updates.participantsRecruited,
        recording_minutes_used: updates.recordingMinutesUsed,
        data_exports: updates.dataExports,
        last_reset_date: updates.lastResetDate
      });

    if (!error) {
      return { success: true };
    }
  } catch (error) {
    console.log('🔧 Supabase unavailable, using fallback usage storage');
  }

  // Fallback to in-memory storage
  inMemoryStorage.usage.set(userId, updates);
  return { success: true };
}

/**
 * Check if action is allowed based on plan limits
 */
function checkPlanLimits(subscription, usage, action, actionData = {}) {
  const plan = subscription.features;
  
  switch (action) {
    case 'create-study':
      if (plan.maxStudies !== -1 && usage.studiesCreated >= plan.maxStudies) {
        return {
          allowed: false,
          reason: 'Study limit exceeded',
          currentUsage: usage.studiesCreated,
          planLimit: plan.maxStudies,
          requiredPlan: getUpgradePlan(subscription.plan),
          upgradeMessage: `Upgrade to ${getUpgradePlan(subscription.plan)} to create more studies`
        };
      }
      break;

    case 'add-participant':
      const currentParticipants = actionData.currentParticipants || 0;
      if (plan.maxParticipantsPerStudy !== -1 && currentParticipants >= plan.maxParticipantsPerStudy) {
        return {
          allowed: false,
          reason: 'Participant limit exceeded for this study',
          currentUsage: currentParticipants,
          planLimit: plan.maxParticipantsPerStudy,
          requiredPlan: getUpgradePlan(subscription.plan),
          upgradeMessage: `Upgrade to ${getUpgradePlan(subscription.plan)} for more participants per study`
        };
      }
      break;

    case 'export-data':
      if (!plan.exportData) {
        return {
          allowed: false,
          reason: 'Data export not available in your plan',
          requiredPlan: 'basic',
          upgradeMessage: 'Upgrade to Basic plan to export your research data'
        };
      }
      break;

    case 'advanced-analytics':
      if (!plan.advancedAnalytics) {
        return {
          allowed: false,
          reason: 'Advanced analytics not available in your plan',
          requiredPlan: 'basic',
          upgradeMessage: 'Upgrade to Basic plan for advanced analytics insights'
        };
      }
      break;

    case 'team-collaboration':
      if (!plan.teamCollaboration) {
        return {
          allowed: false,
          reason: 'Team collaboration not available in your plan',
          requiredPlan: 'pro',
          upgradeMessage: 'Upgrade to Pro plan for team collaboration features'
        };
      }
      break;

    case 'record-session':
      const requestedMinutes = actionData.estimatedMinutes || 30;
      if (plan.recordingMinutes !== -1 && (usage.recordingMinutesUsed + requestedMinutes) > plan.recordingMinutes) {
        return {
          allowed: false,
          reason: 'Recording minutes limit exceeded',
          currentUsage: usage.recordingMinutesUsed,
          planLimit: plan.recordingMinutes,
          requiredPlan: getUpgradePlan(subscription.plan),
          upgradeMessage: `Upgrade to ${getUpgradePlan(subscription.plan)} for more recording time`
        };
      }
      break;
  }

  return { allowed: true };
}

/**
 * Get the next upgrade plan
 */
function getUpgradePlan(currentPlan) {
  const upgrades = {
    free: 'basic',
    basic: 'pro',
    pro: 'enterprise',
    enterprise: 'enterprise'
  };
  return upgrades[currentPlan] || 'basic';
}

/**
 * Plan enforcement middleware function
 */
export async function enforcePlanLimits(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader ? authHeader.replace('Bearer ', '') : null;
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    // Extract user info from token
    let userId, userEmail;
    
    if (token.startsWith('fallback-token-')) {
      // Handle fallback token format
      const parts = token.split('-');
      userId = parts[2] || 'anonymous';
      userEmail = parts[3] ? `${parts[3]}@gmail.com` : null;
    } else {
      // Handle JWT tokens
      try {
        const { data: { user }, error } = await supabase.auth.getUser(token);
        if (user && !error) {
          userId = user.id;
          userEmail = user.email;
        } else {
          userId = 'anonymous';
        }
      } catch (error) {
        userId = 'anonymous';
      }
    }

    // Get user subscription and usage
    const subscription = await getUserSubscription(userId, userEmail);
    const usage = await getUserUsage(userId);

    // Determine action from request
    const action = req.body?.action || req.query?.action || 'general';
    const actionData = req.body || {};

    console.log(`🔒 Plan enforcement check: User ${userId} (${subscription.plan}) attempting ${action}`);

    // Check if action is allowed
    const enforcementResult = await checkPlanLimits(subscription, usage, action, actionData);

    if (!enforcementResult.allowed) {
      console.log(`❌ Plan limit exceeded: ${enforcementResult.reason}`);
      
      return res.status(402).json({
        success: false,
        error: 'Plan upgrade required',
        planLimitExceeded: true,
        details: {
          reason: enforcementResult.reason,
          currentPlan: subscription.plan,
          requiredPlan: enforcementResult.requiredPlan,
          upgradeMessage: enforcementResult.upgradeMessage,
          currentUsage: enforcementResult.currentUsage,
          planLimit: enforcementResult.planLimit,
          planFeatures: subscription.features
        }
      });
    }

    // Attach subscription and usage to request for downstream use
    req.userSubscription = subscription;
    req.userUsage = usage;
    req.userId = userId;
    req.userEmail = userEmail;

    console.log(`✅ Plan enforcement passed: ${action} allowed for ${subscription.plan} plan`);
    next();

  } catch (error) {
    console.error('Plan enforcement error:', error);
    return res.status(500).json({
      success: false,
      error: 'Plan validation failed'
    });
  }
}

/**
 * Update usage after successful action
 */
export async function updateUsageAfterAction(userId, action, actionData = {}) {
  try {
    const usage = await getUserUsage(userId);

    switch (action) {
      case 'create-study':
        usage.studiesCreated += 1;
        break;
      case 'add-participant':
        usage.participantsRecruited += (actionData.participantCount || 1);
        break;
      case 'export-data':
        usage.dataExports += 1;
        break;
      case 'record-session':
        usage.recordingMinutesUsed += (actionData.minutesUsed || 0);
        break;
    }

    await updateUserUsage(userId, usage);
    console.log(`📊 Usage updated: ${action} for user ${userId}`);

    return { success: true, updatedUsage: usage };
  } catch (error) {
    console.error('Usage update error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get plan comparison data for upgrade prompts
 */
export function getPlanComparison(currentPlan) {
  const plans = Object.values(SUBSCRIPTION_PLANS);
  const currentIndex = plans.findIndex(p => p.id === currentPlan);
  
  return {
    current: SUBSCRIPTION_PLANS[currentPlan],
    available: plans.slice(currentIndex + 1),
    features: {
      studies: plans.map(p => ({ plan: p.id, limit: p.maxStudies })),
      participants: plans.map(p => ({ plan: p.id, limit: p.maxParticipantsPerStudy })),
      recording: plans.map(p => ({ plan: p.id, limit: p.recordingMinutes })),
      analytics: plans.map(p => ({ plan: p.id, enabled: p.advancedAnalytics }))
    }
  };
}

/**
 * Development helper: Reset user usage (for testing)
 */
export async function resetUserUsage(userId) {
  const resetUsage = {
    studiesCreated: 0,
    participantsRecruited: 0,
    recordingMinutesUsed: 0,
    dataExports: 0,
    lastResetDate: new Date()
  };

  await updateUserUsage(userId, resetUsage);
  console.log(`🔄 Usage reset for user ${userId}`);
  
  return { success: true, usage: resetUsage };
}

export default {
  enforcePlanLimits,
  updateUsageAfterAction,
  getPlanComparison,
  resetUserUsage,
  getUserSubscription,
  getUserUsage,
  SUBSCRIPTION_PLANS
};
