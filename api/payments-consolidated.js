// Consolidated Payments API - All payment functions in one endpoint
// This reduces multiple payment functions to a single endpoint

export default async function handler(req, res) {
  const { action, ...params } = req.query;
  
  try {
    switch (action) {
      case 'process':
        return await processPayment(req, res);
      case 'points':
        return await handlePoints(req, res);
      case 'plans':
        return await handlePlansAndEarnings(req, res);
      case 'improved':
        return await handleImprovedPoints(req, res);
      default:
        return await handleGeneralPayments(req, res);
    }
  } catch (error) {
    console.error('Payments consolidated endpoint error:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}

// Import and implement the individual payment functions here
async function processPayment(req, res) {
  // Import from payments.js
  const { default: paymentsHandler } = await import('./payments.js');
  return await paymentsHandler(req, res);
}

async function handlePoints(req, res) {
  // Import from points.js
  const { default: pointsHandler } = await import('./points.js');
  return await pointsHandler(req, res);
}

async function handlePlansAndEarnings(req, res) {
  // Import from points-with-plans-and-earnings.js
  const { default: plansHandler } = await import('./points-with-plans-and-earnings.js');
  return await plansHandler(req, res);
}

async function handleImprovedPoints(req, res) {
  // Import from points-improved.js
  const { default: improvedPointsHandler } = await import('./points-improved.js');
  return await improvedPointsHandler(req, res);
}

async function handleGeneralPayments(req, res) {
  // Default payment handling
  return res.status(200).json({ success: true, message: 'Payment endpoint ready' });
}
