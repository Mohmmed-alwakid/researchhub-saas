/**
 * STC BANK PAYMENT INTEGRATION
 * Integration module for STC Bank payment gateway
 * Works alongside existing DodoPayments system
 */

import crypto from 'crypto';

// STC Bank API configuration
const STC_BANK_CONFIG = {
  merchant_id: process.env.STC_BANK_MERCHANT_ID,
  api_key: process.env.STC_BANK_API_KEY,
  secret_key: process.env.STC_BANK_SECRET_KEY,
  webhook_secret: process.env.STC_BANK_WEBHOOK_SECRET,
  environment: process.env.STC_BANK_ENVIRONMENT || 'sandbox',
  endpoints: {
    sandbox: 'https://sandbox.merchant.stcbank.com.sa/api/v1',
    production: 'https://merchant.stcbank.com.sa/api/v1'
  }
};

/**
 * STC Bank API wrapper class
 */
class STCBankAPI {
  constructor() {
    this.baseUrl = STC_BANK_CONFIG.endpoints[STC_BANK_CONFIG.environment];
    this.merchantId = STC_BANK_CONFIG.merchant_id;
    this.apiKey = STC_BANK_CONFIG.api_key;
    this.secretKey = STC_BANK_CONFIG.secret_key;
  }

  /**
   * Make authenticated request to STC Bank API
   */
  async makeRequest(endpoint, method = 'POST', data = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.apiKey}`,
      'X-Merchant-ID': this.merchantId,
      'Accept': 'application/json'
    };

    // Add signature for security (common pattern for payment gateways)
    if (method === 'POST' && data) {
      headers['X-Signature'] = this.generateSignature(data);
    }

    try {
      const response = await fetch(url, {
        method,
        headers,
        body: method !== 'GET' ? JSON.stringify(data) : undefined
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`STC Bank API error: ${response.status} - ${errorData.message || response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('STC Bank API request failed:', error);
      
      // For development, return simulated response
      if (STC_BANK_CONFIG.environment === 'sandbox' || !this.apiKey) {
        console.log('Using STC Bank simulation mode');
        return this.getSimulatedResponse(endpoint, data);
      }
      
      throw error;
    }
  }

  /**
   * Generate HMAC signature for request validation
   */
  generateSignature(data) {
    const payload = JSON.stringify(data);
    return crypto
      .createHmac('sha256', this.secretKey)
      .update(payload)
      .digest('hex');
  }

  /**
   * Create payment intent with STC Bank
   */
  async createPaymentIntent(amount, currency = 'SAR', description = '', metadata = {}) {
    const paymentData = {
      amount: Math.round(amount * 100), // Convert to halala (SAR's smallest unit)
      currency: currency.toUpperCase(),
      description: description || 'ResearchHub Payment',
      merchant_reference: this.generateReference(),
      return_url: `${process.env.FRONTEND_URL || 'https://researchhub-saas.vercel.app'}/payment/success`,
      cancel_url: `${process.env.FRONTEND_URL || 'https://researchhub-saas.vercel.app'}/payment/cancel`,
      webhook_url: `${process.env.API_URL || 'https://researchhub-saas.vercel.app'}/api/payments-consolidated-full?action=stc-webhook`,
      metadata: {
        platform: 'ResearchHub',
        ...metadata
      }
    };

    const response = await this.makeRequest('/payments', 'POST', paymentData);
    return response;
  }

  /**
   * Verify payment status
   */
  async verifyPayment(paymentId) {
    const response = await this.makeRequest(`/payments/${paymentId}`, 'GET');
    return response;
  }

  /**
   * Process refund
   */
  async processRefund(paymentId, amount = null, reason = '') {
    const refundData = {
      payment_id: paymentId,
      amount: amount ? Math.round(amount * 100) : null, // null for full refund
      reason: reason || 'Customer request'
    };

    const response = await this.makeRequest('/refunds', 'POST', refundData);
    return response;
  }

  /**
   * Generate unique merchant reference
   */
  generateReference() {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 6);
    return `RH_${timestamp}_${random}`;
  }

  /**
   * Simulated responses for development/testing
   */
  getSimulatedResponse(endpoint, data) {
    const baseResponse = {
      timestamp: new Date().toISOString(),
      merchant_id: this.merchantId || 'sandbox_merchant'
    };

    if (endpoint === '/payments') {
      return {
        ...baseResponse,
        payment_id: `stc_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`,
        status: 'pending',
        amount: data.amount || 1000,
        currency: data.currency || 'SAR',
        payment_url: `https://sandbox.merchant.stcbank.com.sa/checkout/pay/${Math.random().toString(36).substr(2, 12)}`,
        merchant_reference: data.merchant_reference || this.generateReference(),
        expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString() // 30 minutes
      };
    }

    if (endpoint.includes('/payments/')) {
      const paymentId = endpoint.split('/').pop();
      return {
        ...baseResponse,
        payment_id: paymentId,
        status: Math.random() > 0.5 ? 'completed' : 'pending',
        amount: 1000,
        currency: 'SAR',
        paid_at: new Date().toISOString()
      };
    }

    if (endpoint === '/refunds') {
      return {
        ...baseResponse,
        refund_id: `ref_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`,
        status: 'processed',
        amount: data.amount || 1000,
        processed_at: new Date().toISOString()
      };
    }

    return baseResponse;
  }

  /**
   * Verify webhook signature
   */
  verifyWebhookSignature(payload, signature) {
    const expectedSignature = crypto
      .createHmac('sha256', STC_BANK_CONFIG.webhook_secret)
      .update(payload)
      .digest('hex');
    
    return crypto.timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    );
  }
}

export {
  STCBankAPI,
  STC_BANK_CONFIG
};
