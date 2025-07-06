// Consolidated Payments API - DodoPayments integration for researcher payments
// This reduces multiple payment functions to a single endpoint
// Participant payments are handled separately via wallets API

export default async function handler(req, res) {
  const { action, ...params } = req.query;
  
  try {
    switch (action) {
      case 'create-payment-intent':
        return await createDodoPaymentIntent(req, res);
      case 'conversion-rates':
        return await getConversionRates(req, res);
      case 'researcher-payment':
        return await processResearcherPayment(req, res);
      case 'webhook':
        return await handleDodoWebhook(req, res);
      default:
        return await handleGeneralPayments(req, res);
    }
  } catch (error) {
    console.error('Payments consolidated endpoint error:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}

// Create DodoPayments payment intent for researcher payments
async function createDodoPaymentIntent(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const { amount, currency = 'usd', description } = req.body;

  if (!amount || amount <= 0) {
    return res.status(400).json({
      success: false,
      error: 'Valid amount is required'
    });
  }

  try {
    // Mock DodoPayments implementation for now
    // In production, integrate with actual DodoPayments API
    const paymentIntent = {
      id: `dodo_pi_${Date.now()}`,
      client_secret: `dodo_pi_${Date.now()}_secret`,
      amount: amount * 100, // Convert to cents
      currency: currency.toLowerCase(),
      status: 'requires_payment_method'
    };

    return res.status(200).json({
      success: true,
      data: {
        paymentIntent,
        fees: {
          percent: 2.5, // DodoPayments fee
          fixed: 0.30,
          total: (amount * 0.025) + 0.30
        }
      }
    });

  } catch (error) {
    console.error('Create payment intent error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to create payment intent'
    });
  }
}

// Get conversion rates and fees
async function getConversionRates(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  return res.status(200).json({
    success: true,
    data: {
      pointsPerDollar: 100, // 100 points = $1
      minimumPurchase: 5.00, // $5 minimum
      minimumWithdrawal: 10.00, // $10 minimum
      purchaseFee: { percent: 2.5, fixed: 0.30 }, // DodoPayments fees
      withdrawalFee: { percent: 3.0, fixed: 0.50 } // Withdrawal processing fees
    }
  });
}

// Process researcher payment via DodoPayments
async function processResearcherPayment(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const { payment_intent_id, study_id, researcher_id } = req.body;

  if (!payment_intent_id) {
    return res.status(400).json({
      success: false,
      error: 'Payment intent ID is required'
    });
  }

  try {
    // Mock payment processing
    // In production, confirm payment with DodoPayments API
    const confirmedPayment = {
      id: payment_intent_id,
      status: 'succeeded',
      amount_received: 1000, // $10.00 in cents
      currency: 'usd',
      processed_at: new Date().toISOString()
    };

    return res.status(200).json({
      success: true,
      data: {
        payment: confirmedPayment,
        message: 'Payment processed successfully'
      }
    });

  } catch (error) {
    console.error('Process payment error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to process payment'
    });
  }
}

// Handle DodoPayments webhooks
async function handleDodoWebhook(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  // Verify webhook signature
  const signature = req.headers['x-dodo-signature'];
  const webhookSecret = process.env.DODOPAYMENTS_WEBHOOK_SECRET;

  if (!signature || !webhookSecret) {
    return res.status(401).json({
      success: false,
      error: 'Invalid webhook signature'
    });
  }

  try {
    // Process webhook event
    const event = req.body;
    
    switch (event.type) {
      case 'payment_intent.succeeded':
        // Handle successful payment
        console.log('Payment succeeded:', event.data);
        break;
      case 'payment_intent.payment_failed':
        // Handle failed payment
        console.log('Payment failed:', event.data);
        break;
      default:
        console.log('Unhandled webhook event:', event.type);
    }

    return res.status(200).json({ success: true, received: true });

  } catch (error) {
    console.error('Webhook handling error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to process webhook'
    });
  }
}

async function handleGeneralPayments(req, res) {
  // Default payment handling
  return res.status(200).json({ success: true, message: 'Payment endpoint ready' });
}
