// PayPal Payment Service for ResearchHub SaaS
// Handles frontend PayPal integration and subscription management

// Generic API response interface
interface ApiResponse<T = unknown> {
  success?: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PayPalPlan {
  id: string;
  name: string;
  description: string;
  price: string;
  currency: string;
  features: {
    maxStudies: number;
    maxParticipantsPerStudy: number;
    recordingMinutes: number;
    advancedAnalytics: boolean;
    exportData: boolean;
    teamCollaboration: boolean;
    prioritySupport: boolean;
    customBranding: boolean;
    dedicatedSupport?: boolean;
    apiAccess?: boolean;
    sso?: boolean;
  };
}

export interface SubscriptionStatus {
  plan_id: string;
  plan_name: string;
  status: string;
  paypal_subscription_id?: string;
  current_period_start?: string;
  current_period_end?: string;
  amount?: string;
  currency?: string;
  features: PayPalPlan['features'];
}

export interface CreateSubscriptionRequest {
  planId: string;
  userId: string;
  userInfo: {
    userId: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface CreateSubscriptionResponse {
  subscriptionId: string;
  approvalUrl: string;
  planDetails: PayPalPlan;
}

export interface PayPalError {
  success: false;
  error: string;
  planLimitExceeded?: boolean;
  details?: {
    reason: string;
    currentPlan: string;
    requiredPlan: string;
    upgradeMessage: string;
  };
}

class PayPalService {
  private apiUrl: string;

  constructor() {
    this.apiUrl = process.env.NODE_ENV === 'production' 
      ? '/api/paypal-consolidated'
      : 'http://localhost:3003/api/paypal-consolidated';
  }

  private async makeRequest<T = unknown>(action: string, method: string = 'GET', body?: unknown): Promise<ApiResponse<T>> {
    const token = localStorage.getItem('access_token');
    
    const config: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      ...(body ? { body: JSON.stringify(body) } : {})
    };

    const url = `${this.apiUrl}?action=${action}`;
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Network error' }));
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // Get all available subscription plans
  async getAvailablePlans(): Promise<PayPalPlan[]> {
    try {
      const response = await this.makeRequest<PayPalPlan[]>('get-available-plans');
      return response.data || [];
    } catch (error) {
      console.error('Failed to fetch available plans:', error);
      throw error;
    }
  }

  // Get current user's subscription status
  async getSubscriptionStatus(userId: string): Promise<SubscriptionStatus> {
    try {
      const response = await this.makeRequest<SubscriptionStatus>(`get-subscription-status&userId=${userId}`);
      return response.data!;
    } catch (error) {
      console.error('Failed to fetch subscription status:', error);
      throw error;
    }
  }

  // Create a new subscription
  async createSubscription(request: CreateSubscriptionRequest): Promise<CreateSubscriptionResponse> {
    try {
      const response = await this.makeRequest<CreateSubscriptionResponse>('create-subscription', 'POST', request);
      return response.data!;
    } catch (error) {
      console.error('Failed to create subscription:', error);
      throw error;
    }
  }

  // Cancel an existing subscription
  async cancelSubscription(subscriptionId: string, reason?: string): Promise<void> {
    try {
      await this.makeRequest('cancel-subscription', 'POST', {
        subscriptionId,
        reason: reason || 'User requested cancellation'
      });
    } catch (error) {
      console.error('Failed to cancel subscription:', error);
      throw error;
    }
  }

  // Get plan comparison for upgrade suggestions
  async getPlanComparison(currentPlan: string): Promise<{
    current: PayPalPlan;
    available: PayPalPlan[];
    recommendations: string[];
  }> {
    try {
      const plans = await this.getAvailablePlans();
      const current = plans.find(p => p.id === currentPlan) || this.getFreePlan();
      
      const available = plans.filter(p => p.id !== currentPlan);
      
      const recommendations = this.generateUpgradeRecommendations(current);
      
      return {
        current,
        available,
        recommendations
      };
    } catch (error) {
      console.error('Failed to get plan comparison:', error);
      throw error;
    }
  }

  // Generate upgrade recommendations based on current plan
  private generateUpgradeRecommendations(current: PayPalPlan): string[] {
    const recommendations: string[] = [];
    
    if (current.id === 'free') {
      recommendations.push('Upgrade to Basic for more studies and data export');
      recommendations.push('Try Pro for unlimited studies and team collaboration');
    } else if (current.id === 'basic') {
      recommendations.push('Upgrade to Pro for unlimited studies');
      recommendations.push('Get team collaboration and priority support');
    } else if (current.id === 'pro') {
      recommendations.push('Upgrade to Enterprise for dedicated support');
      recommendations.push('Get SSO and API access for your organization');
    }
    
    return recommendations;
  }

  // Get default free plan structure
  private getFreePlan(): PayPalPlan {
    return {
      id: 'free',
      name: 'Free',
      description: 'Basic research features to get started',
      price: '0',
      currency: 'USD',
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
    };
  }

  // Check if an error is a plan limit error
  isPayPalError(error: unknown): error is PayPalError {
    return error !== null && 
           typeof error === 'object' && 
           'success' in error && 
           (error as PayPalError).success === false;
  }

  // Format price for display
  formatPrice(price: string, currency: string = 'USD'): string {
    const amount = parseFloat(price);
    if (amount === 0) return 'Free';
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  }

  // Get plan badge color for UI
  getPlanBadgeColor(planId: string): string {
    const colors = {
      free: 'bg-gray-100 text-gray-800',
      basic: 'bg-blue-100 text-blue-800',
      pro: 'bg-purple-100 text-purple-800',
      enterprise: 'bg-orange-100 text-orange-800'
    };
    return colors[planId as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  }

  // Get next upgrade plan
  getNextUpgradePlan(currentPlan: string): string {
    const upgradePath = {
      free: 'basic',
      basic: 'pro',
      pro: 'enterprise',
      enterprise: 'enterprise' // Already at top
    };
    return upgradePath[currentPlan as keyof typeof upgradePath] || 'basic';
  }

  // Calculate savings for annual billing (future feature)
  calculateAnnualSavings(monthlyPrice: string): string {
    const monthly = parseFloat(monthlyPrice);
    const annual = monthly * 12 * 0.8; // 20% discount
    const savings = (monthly * 12) - annual;
    
    return this.formatPrice(savings.toString());
  }

  // Validate subscription data
  validateSubscriptionData(data: CreateSubscriptionRequest): string[] {
    const errors: string[] = [];
    
    if (!data.planId) {
      errors.push('Plan ID is required');
    }
    
    if (!data.userId) {
      errors.push('User ID is required');
    }
    
    if (!data.userInfo) {
      errors.push('User information is required');
    } else {
      if (!data.userInfo.firstName) {
        errors.push('First name is required');
      }
      if (!data.userInfo.lastName) {
        errors.push('Last name is required');
      }
      if (!data.userInfo.email) {
        errors.push('Email is required');
      }
    }
    
    return errors;
  }

  // Get feature comparison matrix
  getFeatureMatrix(): Array<{
    feature: string;
    free: boolean | string;
    basic: boolean | string;
    pro: boolean | string;
    enterprise: boolean | string;
  }> {
    return [
      {
        feature: 'Studies per month',
        free: '3',
        basic: '15',
        pro: 'Unlimited',
        enterprise: 'Unlimited'
      },
      {
        feature: 'Participants per study',
        free: '10',
        basic: '50',
        pro: '200',
        enterprise: 'Unlimited'
      },
      {
        feature: 'Recording minutes',
        free: '60',
        basic: '300',
        pro: 'Unlimited',
        enterprise: 'Unlimited'
      },
      {
        feature: 'Advanced Analytics',
        free: false,
        basic: true,
        pro: true,
        enterprise: true
      },
      {
        feature: 'Data Export',
        free: false,
        basic: true,
        pro: true,
        enterprise: true
      },
      {
        feature: 'Team Collaboration',
        free: false,
        basic: false,
        pro: true,
        enterprise: true
      },
      {
        feature: 'Priority Support',
        free: false,
        basic: false,
        pro: true,
        enterprise: true
      },
      {
        feature: 'Custom Branding',
        free: false,
        basic: false,
        pro: true,
        enterprise: true
      },
      {
        feature: 'Dedicated Support',
        free: false,
        basic: false,
        pro: false,
        enterprise: true
      },
      {
        feature: 'API Access',
        free: false,
        basic: false,
        pro: false,
        enterprise: true
      },
      {
        feature: 'SSO Integration',
        free: false,
        basic: false,
        pro: false,
        enterprise: true
      }
    ];
  }
}

// Create singleton instance
export const paypalService = new PayPalService();
