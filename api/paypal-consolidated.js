// PayPal Payment Integration for ResearchHub SaaS
// Handles subscription plans, payments, and upgrades

import { createClient } from '@supabase/supabase-js';

// PayPal SDK configuration
const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;
const PAYPAL_MODE = process.env.PAYPAL_MODE || 'sandbox'; // 'sandbox' or 'live'

// PayPal API URLs
const PAYPAL_API_BASE = PAYPAL_MODE === 'live' 
  ? 'https://api-m.paypal.com'
  : 'https://api-m.sandbox.paypal.com';

// Initialize Supabase (with fallback for development)
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
let supabase = null;

if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey);
}

// PayPal subscription plans configuration
const PAYPAL_SUBSCRIPTION_PLANS = {
  basic: {
    id: 'P-5ML4271244454362WXNWU5NQ', // Will be created in PayPal
    name: 'ResearchHub Basic',
    description: 'Basic plan with 15 studies and enhanced features',
    price: '29.00',
    currency: 'USD',
    interval: 'MONTH',
    interval_count: 1,
    features: {
      maxStudies: 15,
      maxParticipantsPerStudy: 50,
      recordingMinutes: 300,
      advancedAnalytics: true,
      exportData: true,
      teamCollaboration: false,
      prioritySupport: false,
      customBranding: false
    }
  },
  pro: {
    id: 'P-1GJ4271244454362WXNWU5NR', // Will be created in PayPal
    name: 'ResearchHub Pro',
    description: 'Pro plan with unlimited studies and all features',
    price: '79.00',
    currency: 'USD',
    interval: 'MONTH',
    interval_count: 1,
    features: {
      maxStudies: -1,
      maxParticipantsPerStudy: 200,
      recordingMinutes: -1,
      advancedAnalytics: true,
      exportData: true,
      teamCollaboration: true,
      prioritySupport: true,
      customBranding: true
    }
  },
  enterprise: {
    id: 'P-8XH4271244454362WXNWU5NS', // Will be created in PayPal
    name: 'ResearchHub Enterprise',
    description: 'Enterprise plan with custom features and dedicated support',
    price: '199.00',
    currency: 'USD',
    interval: 'MONTH',
    interval_count: 1,
    features: {
      maxStudies: -1,
      maxParticipantsPerStudy: -1,
      recordingMinutes: -1,
      advancedAnalytics: true,
      exportData: true,
      teamCollaboration: true,
      prioritySupport: true,
      customBranding: true,
      dedicatedSupport: true,
      apiAccess: true,
      sso: true
    }
  }
};

// PayPal API helper functions
async function getPayPalAccessToken() {
  try {
    const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString('base64');
    
    const response = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: 'grant_type=client_credentials'
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(`PayPal auth failed: ${data.error_description || 'Unknown error'}`);
    }
    
    return data.access_token;
  } catch (error) {
    console.error('PayPal authentication error:', error);
    throw error;
  }
}

async function createPayPalProduct() {
  try {
    const accessToken = await getPayPalAccessToken();
    
    const response = await fetch(`${PAYPAL_API_BASE}/v1/catalogs/products`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'PayPal-Request-Id': `researchhub-product-${Date.now()}`
      },
      body: JSON.stringify({
        name: 'ResearchHub SaaS Subscription',
        description: 'Research platform with study builder and analytics',
        type: 'SERVICE',
        category: 'SOFTWARE'
      })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(`PayPal product creation failed: ${JSON.stringify(data)}`);
    }
    
    return data.id;
  } catch (error) {
    console.error('PayPal product creation error:', error);
    throw error;
  }
}

async function createPayPalSubscriptionPlan(planData, productId) {
  try {
    const accessToken = await getPayPalAccessToken();
    
    const planPayload = {
      product_id: productId,
      name: planData.name,
      description: planData.description,
      status: 'ACTIVE',
      billing_cycles: [
        {
          frequency: {
            interval_unit: planData.interval,
            interval_count: planData.interval_count
          },
          tenure_type: 'REGULAR',
          sequence: 1,
          total_cycles: 0, // Infinite
          pricing_scheme: {
            fixed_price: {
              value: planData.price,
              currency_code: planData.currency
            }
          }
        }
      ],
      payment_preferences: {
        auto_bill_outstanding: true,
        setup_fee_failure_action: 'CONTINUE',
        payment_failure_threshold: 3
      }
    };
    
    const response = await fetch(`${PAYPAL_API_BASE}/v1/billing/plans`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'PayPal-Request-Id': `researchhub-plan-${planData.name.toLowerCase()}-${Date.now()}`
      },
      body: JSON.stringify(planPayload)
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(`PayPal plan creation failed: ${JSON.stringify(data)}`);
    }
    
    return data.id;
  } catch (error) {
    console.error('PayPal plan creation error:', error);
    throw error;
  }
}

async function createPayPalSubscription(planId, subscriberInfo) {
  try {
    const accessToken = await getPayPalAccessToken();
    
    const subscriptionPayload = {
      plan_id: planId,
      start_time: new Date(Date.now() + 60000).toISOString(), // Start in 1 minute
      quantity: 1,
      subscriber: {
        name: {
          given_name: subscriberInfo.firstName,
          surname: subscriberInfo.lastName
        },
        email_address: subscriberInfo.email
      },
      application_context: {
        brand_name: 'ResearchHub',
        locale: 'en-US',
        shipping_preference: 'NO_SHIPPING',
        user_action: 'SUBSCRIBE_NOW',
        payment_method: {
          payer_selected: 'PAYPAL',
          payee_preferred: 'IMMEDIATE_PAYMENT_REQUIRED'
        },
        return_url: `${process.env.FRONTEND_URL}/subscription/success`,
        cancel_url: `${process.env.FRONTEND_URL}/subscription/cancel`
      }
    };
    
    const response = await fetch(`${PAYPAL_API_BASE}/v1/billing/subscriptions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'PayPal-Request-Id': `researchhub-sub-${subscriberInfo.userId}-${Date.now()}`
      },
      body: JSON.stringify(subscriptionPayload)
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(`PayPal subscription creation failed: ${JSON.stringify(data)}`);
    }
    
    return data;
  } catch (error) {
    console.error('PayPal subscription creation error:', error);
    throw error;
  }
}

async function getPayPalSubscription(subscriptionId) {
  try {
    const accessToken = await getPayPalAccessToken();
    
    const response = await fetch(`${PAYPAL_API_BASE}/v1/billing/subscriptions/${subscriptionId}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(`PayPal subscription fetch failed: ${JSON.stringify(data)}`);
    }
    
    return data;
  } catch (error) {
    console.error('PayPal subscription fetch error:', error);
    throw error;
  }
}

async function cancelPayPalSubscription(subscriptionId, reason) {
  try {
    const accessToken = await getPayPalAccessToken();
    
    const response = await fetch(`${PAYPAL_API_BASE}/v1/billing/subscriptions/${subscriptionId}/cancel`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        reason: reason || 'User requested cancellation'
      })
    });
    
    if (!response.ok) {
      const data = await response.json();
      throw new Error(`PayPal subscription cancellation failed: ${JSON.stringify(data)}`);
    }
    
    return true;
  } catch (error) {
    console.error('PayPal subscription cancellation error:', error);
    throw error;
  }
}

// Database helper functions
async function updateUserSubscription(userId, subscriptionData) {
  if (!supabase) {
    // Development fallback - store in memory or local storage
    console.log('Development mode: User subscription update', { userId, subscriptionData });
    return { success: true, data: subscriptionData };
  }
  
  try {
    const { data, error } = await supabase
      .from('user_subscriptions')
      .upsert({
        user_id: userId,
        plan_id: subscriptionData.planId,
        plan_name: subscriptionData.planName,
        paypal_subscription_id: subscriptionData.paypalSubscriptionId,
        status: subscriptionData.status,
        current_period_start: subscriptionData.currentPeriodStart,
        current_period_end: subscriptionData.currentPeriodEnd,
        amount: subscriptionData.amount,
        currency: subscriptionData.currency,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      });
    
    if (error) {
      throw error;
    }
    
    return { success: true, data };
  } catch (error) {
    console.error('Database subscription update error:', error);
    return { success: false, error: error.message };
  }
}

async function getUserSubscription(userId) {
  if (!supabase) {
    // Development fallback
    return {
      success: true,
      data: {
        plan_id: 'free',
        plan_name: 'Free',
        status: 'active',
        features: {
          maxStudies: 3,
          maxParticipantsPerStudy: 10,
          recordingMinutes: 60,
          advancedAnalytics: false,
          exportData: false,
          teamCollaboration: false,
          prioritySupport: false,
          customBranding: false
        }
      }
    };
  }
  
  try {
    const { data, error } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error && error.code !== 'PGRST116') { // Not found error
      throw error;
    }
    
    if (!data) {
      // Return default free plan
      return {
        success: true,
        data: {
          plan_id: 'free',
          plan_name: 'Free',
          status: 'active',
          features: {
            maxStudies: 3,
            maxParticipantsPerStudy: 10,
            recordingMinutes: 60,
            advancedAnalytics: false,
            exportData: false,
            teamCollaboration: false,
            prioritySupport: false,
            customBranding: false
          }
        }
      };
    }
    
    return { success: true, data };
  } catch (error) {
    console.error('Database subscription fetch error:', error);
    return { success: false, error: error.message };
  }
}

// Main handler functions
async function createSubscription(req, res) {
  try {
    const { planId, userId, userInfo } = req.body;
    
    if (!planId || !userId || !userInfo) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: planId, userId, userInfo'
      });
    }
    
    const planData = PAYPAL_SUBSCRIPTION_PLANS[planId];
    if (!planData) {
      return res.status(400).json({
        success: false,
        error: 'Invalid plan ID'
      });
    }
    
    // Create PayPal subscription
    const subscription = await createPayPalSubscription(planData.id, userInfo);
    
    // Store subscription info in database
    const subscriptionData = {
      planId,
      planName: planData.name,
      paypalSubscriptionId: subscription.id,
      status: subscription.status,
      currentPeriodStart: new Date().toISOString(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
      amount: planData.price,
      currency: planData.currency
    };
    
    const dbResult = await updateUserSubscription(userId, subscriptionData);
    
    if (!dbResult.success) {
      console.error('Failed to update database, but PayPal subscription created:', subscription.id);
    }
    
    return res.status(200).json({
      success: true,
      data: {
        subscriptionId: subscription.id,
        approvalUrl: subscription.links.find(link => link.rel === 'approve')?.href,
        planDetails: planData
      }
    });
    
  } catch (error) {
    console.error('Create subscription error:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

async function handleWebhook(req, res) {
  try {
    const webhookEvent = req.body;
    
    console.log('PayPal webhook received:', webhookEvent.event_type);
    
    switch (webhookEvent.event_type) {
      case 'BILLING.SUBSCRIPTION.ACTIVATED':
        await handleSubscriptionActivated(webhookEvent);
        break;
      case 'BILLING.SUBSCRIPTION.CANCELLED':
        await handleSubscriptionCancelled(webhookEvent);
        break;
      case 'BILLING.SUBSCRIPTION.SUSPENDED':
        await handleSubscriptionSuspended(webhookEvent);
        break;
      case 'BILLING.SUBSCRIPTION.PAYMENT.FAILED':
        await handlePaymentFailed(webhookEvent);
        break;
      case 'PAYMENT.SALE.COMPLETED':
        await handlePaymentCompleted(webhookEvent);
        break;
      default:
        console.log('Unhandled webhook event:', webhookEvent.event_type);
    }
    
    return res.status(200).json({ success: true });
    
  } catch (error) {
    console.error('Webhook handling error:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

async function handleSubscriptionActivated(webhookEvent) {
  const subscription = webhookEvent.resource;
  const subscriptionId = subscription.id;
  
  // Get subscription details
  const subscriptionDetails = await getPayPalSubscription(subscriptionId);
  
  // Update user subscription status
  if (supabase) {
    await supabase
      .from('user_subscriptions')
      .update({
        status: 'active',
        updated_at: new Date().toISOString()
      })
      .eq('paypal_subscription_id', subscriptionId);
  }
  
  console.log('Subscription activated:', subscriptionId);
}

async function handleSubscriptionCancelled(webhookEvent) {
  const subscription = webhookEvent.resource;
  const subscriptionId = subscription.id;
  
  // Update user subscription status
  if (supabase) {
    await supabase
      .from('user_subscriptions')
      .update({
        status: 'cancelled',
        updated_at: new Date().toISOString()
      })
      .eq('paypal_subscription_id', subscriptionId);
  }
  
  console.log('Subscription cancelled:', subscriptionId);
}

async function handleSubscriptionSuspended(webhookEvent) {
  const subscription = webhookEvent.resource;
  const subscriptionId = subscription.id;
  
  // Update user subscription status
  if (supabase) {
    await supabase
      .from('user_subscriptions')
      .update({
        status: 'suspended',
        updated_at: new Date().toISOString()
      })
      .eq('paypal_subscription_id', subscriptionId);
  }
  
  console.log('Subscription suspended:', subscriptionId);
}

async function handlePaymentFailed(webhookEvent) {
  const subscription = webhookEvent.resource;
  const subscriptionId = subscription.id;
  
  // Handle payment failure (could downgrade plan or notify user)
  console.log('Payment failed for subscription:', subscriptionId);
  
  // Notify user via email or other means
  // Temporarily suspend features but don't immediately cancel
}

async function handlePaymentCompleted(webhookEvent) {
  const payment = webhookEvent.resource;
  
  // Update payment history
  console.log('Payment completed:', payment.id);
  
  // Extend subscription period if needed
}

async function getSubscriptionStatus(req, res) {
  try {
    const { userId } = req.query;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'User ID required'
      });
    }
    
    const subscription = await getUserSubscription(userId);
    
    if (!subscription.success) {
      throw new Error(subscription.error);
    }
    
    return res.status(200).json({
      success: true,
      data: subscription.data
    });
    
  } catch (error) {
    console.error('Get subscription status error:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

async function cancelSubscription(req, res) {
  try {
    const { subscriptionId, reason } = req.body;
    
    if (!subscriptionId) {
      return res.status(400).json({
        success: false,
        error: 'Subscription ID required'
      });
    }
    
    await cancelPayPalSubscription(subscriptionId, reason);
    
    return res.status(200).json({
      success: true,
      data: { message: 'Subscription cancelled successfully' }
    });
    
  } catch (error) {
    console.error('Cancel subscription error:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

async function getAvailablePlans(req, res) {
  try {
    const plans = Object.entries(PAYPAL_SUBSCRIPTION_PLANS).map(([id, plan]) => ({
      id,
      name: plan.name,
      description: plan.description,
      price: plan.price,
      currency: plan.currency,
      features: plan.features
    }));
    
    return res.status(200).json({
      success: true,
      data: plans
    });
    
  } catch (error) {
    console.error('Get available plans error:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

// Main handler export
export default async function handler(req, res) {
  try {
    const { action } = req.query;
    
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }
    
    switch (action) {
      case 'create-subscription':
        return createSubscription(req, res);
      case 'webhook':
        return handleWebhook(req, res);
      case 'get-subscription-status':
        return getSubscriptionStatus(req, res);
      case 'cancel-subscription':
        return cancelSubscription(req, res);
      case 'get-available-plans':
        return getAvailablePlans(req, res);
      default:
        return res.status(400).json({
          success: false,
          error: 'Invalid action'
        });
    }
    
  } catch (error) {
    console.error('PayPal API handler error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}
