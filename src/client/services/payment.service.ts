import { apiService } from './api.service';

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  interval: 'month' | 'year';
  features: string[];
  stripePriceId: string;
  popular?: boolean;
}

export interface PaymentMethod {
  id: string;
  brand: string;
  last4: string;
  expiryMonth: number;
  expiryYear: number;
  isDefault: boolean;
}

export interface Subscription {
  id: string;
  planId: string;
  status: 'active' | 'canceled' | 'past_due' | 'incomplete';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  plan: SubscriptionPlan;
}

export interface Invoice {
  id: string;
  number: string;
  amount: number;
  status: 'paid' | 'open' | 'void' | 'draft';
  created: string;
  dueDate: string;
  pdfUrl: string;
}

export interface CreateCheckoutSessionRequest {
  priceId: string;
  successUrl: string;
  cancelUrl: string;
  customerId?: string;
}

export interface CreateCheckoutSessionResponse {
  success: boolean;
  sessionId: string;
  url: string;
}

export interface CreatePortalSessionResponse {
  success: boolean;
  url: string;
}

/**
 * Payment and subscription management service
 */
export const paymentService = {
  /**
   * Get available subscription plans
   */
  async getPlans(): Promise<{ success: boolean; plans: SubscriptionPlan[] }> {
    return apiService.get<{ success: boolean; plans: SubscriptionPlan[] }>('/payments/plans');
  },

  /**
   * Get current user subscription
   */
  async getSubscription(): Promise<{ success: boolean; subscription: Subscription | null }> {
    return apiService.get<{ success: boolean; subscription: Subscription | null }>('/payments/subscription');
  },

  /**
   * Create Stripe checkout session
   */
  async createCheckoutSession(data: CreateCheckoutSessionRequest): Promise<CreateCheckoutSessionResponse> {
    return apiService.post<CreateCheckoutSessionResponse>('/payments/create-checkout-session', data);
  },

  /**
   * Create customer portal session
   */
  async createPortalSession(): Promise<CreatePortalSessionResponse> {
    return apiService.post<CreatePortalSessionResponse>('/payments/create-portal-session');
  },

  /**
   * Cancel subscription
   */
  async cancelSubscription(): Promise<{ success: boolean; message: string }> {
    return apiService.post('/payments/cancel-subscription');
  },

  /**
   * Resume subscription
   */
  async resumeSubscription(): Promise<{ success: boolean; message: string }> {
    return apiService.post('/payments/resume-subscription');
  },

  /**
   * Get payment methods
   */
  async getPaymentMethods(): Promise<{ success: boolean; paymentMethods: PaymentMethod[] }> {
    return apiService.get<{ success: boolean; paymentMethods: PaymentMethod[] }>('/payments/payment-methods');
  },

  /**
   * Set default payment method
   */
  async setDefaultPaymentMethod(paymentMethodId: string): Promise<{ success: boolean; message: string }> {
    return apiService.post('/payments/set-default-payment-method', { paymentMethodId });
  },

  /**
   * Delete payment method
   */
  async deletePaymentMethod(paymentMethodId: string): Promise<{ success: boolean; message: string }> {
    return apiService.delete(`/payments/payment-methods/${paymentMethodId}`);
  },

  /**
   * Get invoices
   */
  async getInvoices(): Promise<{ success: boolean; invoices: Invoice[] }> {
    return apiService.get<{ success: boolean; invoices: Invoice[] }>('/payments/invoices');
  },

  /**
   * Download invoice
   */
  async downloadInvoice(invoiceId: string): Promise<{ success: boolean; url: string }> {
    return apiService.get<{ success: boolean; url: string }>(`/payments/invoices/${invoiceId}/download`);
  },

  /**
   * Get usage statistics for billing
   */
  async getUsageStats(): Promise<{ 
    success: boolean; 
    usage: {
      studiesCreated: number;
      participantsRecruited: number;
      recordingMinutes: number;
      dataExports: number;
    };
    limits: {
      studiesCreated: number;
      participantsRecruited: number;
      recordingMinutes: number;
      dataExports: number;
    };
  }> {
    return apiService.get('/payments/usage');
  },

  /**
   * Apply discount code
   */
  async applyDiscountCode(code: string): Promise<{ 
    success: boolean; 
    discount: {
      id: string;
      percentOff?: number;
      amountOff?: number;
      duration: string;
    };
    message: string;
  }> {
    return apiService.post('/payments/apply-discount', { code });
  },
};

export default paymentService;
