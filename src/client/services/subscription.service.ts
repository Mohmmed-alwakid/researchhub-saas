/**
 * Subscription Service
 * Handles plan enforcement, usage tracking, and upgrade flows
 */

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  maxStudies: number;
  maxParticipantsPerStudy: number;
  recordingMinutes: number;
  advancedAnalytics: boolean;
  exportData: boolean;
  teamCollaboration: boolean;
  prioritySupport: boolean;
  customBranding: boolean;
}

export interface UserSubscription {
  plan: string;
  status: string;
  features: SubscriptionPlan;
}

export interface UsageMetrics {
  studiesCreated: number;
  participantsRecruited: number;
  recordingMinutesUsed: number;
  dataExports: number;
  lastResetDate: Date;
}

export interface PlanLimitError {
  success: false;
  error: string;
  planLimitExceeded: true;
  details: {
    reason: string;
    currentPlan: string;
    requiredPlan: string;
    upgradeMessage: string;
    currentUsage?: number;
    planLimit?: number;
    planFeatures: SubscriptionPlan;
  };
}

export interface UsageStats {
  subscription: UserSubscription;
  usage: UsageMetrics;
  usagePercentages: {
    studies: number;
    recording: number;
  };
  warningsActive: {
    studiesNearLimit: boolean;
    recordingNearLimit: boolean;
  };
}

interface PlanComparison {
  current: SubscriptionPlan;
  available: SubscriptionPlan[];
  features: Record<string, unknown>;
}

class SubscriptionService {
  /**
   * Check if an error is a plan limit error
   */
  isPlanLimitError(error: unknown): error is PlanLimitError {
    return !!(error && 
      typeof error === 'object' && 
      'planLimitExceeded' in error && 
      (error as { planLimitExceeded: boolean }).planLimitExceeded === true);
  }

  /**
   * Get plan comparison data for upgrade prompts
   */
  async getPlanComparison(): Promise<PlanComparison> {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch('/api/research-consolidated?action=get-plan-comparison', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        return data.data;
      }
      
      throw new Error(data.error || 'Failed to get plan comparison');
    } catch (error: unknown) {
      console.error('Get plan comparison error:', error);
      throw error;
    }
  }

  /**
   * Get user usage statistics
   */
  async getUsageStats(): Promise<UsageStats> {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch('/api/research-consolidated?action=get-usage-stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        return data.data;
      }
      
      throw new Error(data.error || 'Failed to get usage stats');
    } catch (error: unknown) {
      console.error('Get usage stats error:', error);
      throw error;
    }
  }

  /**
   * Handle plan limit errors with user-friendly messages
   */
  handlePlanLimitError(error: PlanLimitError): {
    title: string;
    message: string;
    actionText: string;
    requiredPlan: string;
  } {
    const details = error.details;
    
    const messages = {
      'Study limit exceeded': {
        title: 'Study Limit Reached',
        message: `You've created ${details.currentUsage}/${details.planLimit} studies allowed in your ${details.currentPlan} plan.`,
        actionText: `Upgrade to ${details.requiredPlan} for ${this.getPlanStudyLimit(details.requiredPlan)} studies`
      },
      'Participant limit exceeded for this study': {
        title: 'Participant Limit Reached',
        message: `This study has reached the ${details.planLimit} participant limit for ${details.currentPlan} plans.`,
        actionText: `Upgrade to ${details.requiredPlan} for ${this.getPlanParticipantLimit(details.requiredPlan)} participants per study`
      },
      'Data export not available in your plan': {
        title: 'Data Export Unavailable',
        message: 'Data export is not included in your current plan.',
        actionText: `Upgrade to ${details.requiredPlan} to export your research data`
      },
      'Advanced analytics not available in your plan': {
        title: 'Advanced Analytics Unavailable',
        message: 'Advanced analytics are not included in your current plan.',
        actionText: `Upgrade to ${details.requiredPlan} for detailed insights`
      },
      'Team collaboration not available in your plan': {
        title: 'Team Collaboration Unavailable',
        message: 'Team collaboration features are not included in your current plan.',
        actionText: `Upgrade to ${details.requiredPlan} for team features`
      },
      'Recording minutes limit exceeded': {
        title: 'Recording Time Limit Reached',
        message: `You've used ${details.currentUsage}/${details.planLimit} minutes of recording time this month.`,
        actionText: `Upgrade to ${details.requiredPlan} for more recording time`
      }
    };

    const messageData = messages[details.reason as keyof typeof messages] || {
      title: 'Plan Upgrade Required',
      message: details.upgradeMessage,
      actionText: `Upgrade to ${details.requiredPlan}`
    };

    return {
      ...messageData,
      requiredPlan: details.requiredPlan
    };
  }

  /**
   * Get study limit for a plan
   */
  private getPlanStudyLimit(planId: string): string {
    const limits = {
      free: '3',
      basic: '15',
      pro: 'unlimited',
      enterprise: 'unlimited'
    };
    return limits[planId as keyof typeof limits] || 'more';
  }

  /**
   * Get participant limit for a plan
   */
  private getPlanParticipantLimit(planId: string): string {
    const limits = {
      free: '10',
      basic: '50',
      pro: '500',
      enterprise: 'unlimited'
    };
    return limits[planId as keyof typeof limits] || 'more';
  }

  /**
   * Format usage percentage for display
   */
  formatUsagePercentage(current: number, limit: number): {
    percentage: number;
    isNearLimit: boolean;
    color: 'green' | 'yellow' | 'red';
  } {
    if (limit === -1) {
      return { percentage: 0, isNearLimit: false, color: 'green' };
    }

    const percentage = Math.round((current / limit) * 100);
    const isNearLimit = percentage > 80;
    
    let color: 'green' | 'yellow' | 'red' = 'green';
    if (percentage > 90) color = 'red';
    else if (percentage > 80) color = 'yellow';

    return { percentage, isNearLimit, color };
  }

  /**
   * Get plan pricing for display
   */
  getPlanPricing() {
    return {
      free: { price: 0, period: 'forever' },
      basic: { price: 29, period: 'month' },
      pro: { price: 99, period: 'month' },
      enterprise: { price: 299, period: 'month' }
    };
  }

  /**
   * Generate upgrade URL (placeholder for payment integration)
   */
  getUpgradeUrl(planId: string): string {
    return `/account/billing?upgrade=${planId}`;
  }
}

export const subscriptionService = new SubscriptionService();
