import { fileURLToPath } from 'url';

import { join, dirname } from 'path';
import { readFileSync } from 'fs';

// Consolidated Admin API - All admin functions in one endpoint
// This reduces multiple admin functions to a single endpoint

const __dirname = dirname(fileURLToPath(import.meta.url));

// Import admin functions
let adminFunctions = {};
let adminAnalyticsFunctions = {};
let paymentsAnalyticsFunctions = {};
let paymentsRequestsFunctions = {};

try {
  // Load admin.js functions
  const adminContent = readFileSync(join(__dirname, 'admin.js'), 'utf8');
  adminFunctions = eval(`(${adminContent})`);
} catch (error) {
  console.error('Error loading admin functions:', error);
}

try {
  // Load admin-analytics.js functions  
  const adminAnalyticsContent = readFileSync(join(__dirname, 'admin-analytics.js'), 'utf8');
  adminAnalyticsFunctions = eval(`(${adminAnalyticsContent})`);
} catch (error) {
  console.error('Error loading admin analytics functions:', error);
}

export default async function handler(req, res) {
  const { action } = req.query;
  
  try {
    // Route to appropriate admin function based on action
    switch (action) {
      case 'analytics':
        return await adminAnalyticsFunctions.default(req, res);
      case 'payments-analytics':
        return await paymentsAnalyticsFunctions.default(req, res);
      case 'payments-requests':
        return await paymentsRequestsFunctions.default(req, res);
      default:
        return await adminFunctions.default(req, res);
    }
  } catch (error) {
    console.error('Admin consolidated endpoint error:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}
