import { apiService } from './api.service';

export interface PaymentIntent {
  id: string;
  client_secret: string;
  amount: number;
  currency: string;
  status: string;
}

export interface PaymentHistoryItem {
  _id: string;
  userId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  planType: string;
  amount: number;
  currency: string;
  status: 'pending' | 'verified' | 'rejected';
  paymentMethod: string;
  requestedAt: string;
  processedAt?: string;
}

export interface WithdrawalHistoryItem {
  _id: string;
  userId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  amount: number;
  fees: number;
  netAmount: number;
  paymentMethod: 'paypal' | 'bank_transfer';
  status: 'pending' | 'approved' | 'rejected';
  requestedAt: string;
  processedAt?: string;
}

export interface PointsBalance {
  userId: string;
  currentBalance: number;
  totalEarned: number;
  totalSpent: number;
  lastUpdated: string;
}

export interface PointsTransaction {
  id: string;
  userId: string;
  type: 'earned' | 'spent' | 'admin_assigned' | 'admin_deducted';
  amount: number;
  reason: string;
  studyId?: string;
  adminId?: string;
  timestamp: string;
  description: string;
}

export interface StudyCreationCost {
  blockCount: number;
  participantCount: number;
  baseCost: number;
  blockCost: number;
  participantCost: number;
  totalCost: number;
}

export interface PointsUsageStats {
  studiesCreated: number;
  pointsSpent: number;
  pointsEarned: number;
  averageCostPerStudy: number;
}

/**
 * Points management service - replaces Stripe payment system
 */
export const pointsService = {
  /**
   * Get current user's points balance
   */
  async getBalance(): Promise<{ success: boolean; balance: PointsBalance | null }> {
    return apiService.get<{ success: boolean; balance: PointsBalance | null }>('points?action=balance');
  },

  /**
   * Get points transaction history
   */
  async getTransactions(limit = 50, offset = 0): Promise<{ 
    success: boolean; 
    transactions: PointsTransaction[];
    pagination: { total: number; limit: number; offset: number; };
  }> {
    return apiService.get<{ 
      success: boolean; 
      transactions: PointsTransaction[];
      pagination: { total: number; limit: number; offset: number; };
    }>(`points?action=history&limit=${limit}&offset=${offset}`);
  },

  /**
   * Calculate cost for creating a study
   */
  async calculateStudyCost(blockCount: number, participantCount: number): Promise<{
    success: boolean;
    cost: StudyCreationCost;
  }> {
    return apiService.post<{
      success: boolean;
      cost: StudyCreationCost;
    }>('points?action=calculate-cost', { blockCount, participantCount });
  },

  /**
   * Spend points to create a study
   */
  async spendPoints(amount: number, reason: string, studyId?: string): Promise<{
    success: boolean;
    transaction: PointsTransaction;
    newBalance: number;
    message: string;
  }> {
    return apiService.post<{
      success: boolean;
      transaction: PointsTransaction;
      newBalance: number;
      message: string;
    }>('points?action=spend', { amount, reason, studyId });
  },

  /**
   * Get points usage statistics
   */
  async getUsageStats(): Promise<{ 
    success: boolean; 
    stats: PointsUsageStats;
  }> {
    return apiService.get<{ 
      success: boolean; 
      stats: PointsUsageStats;
    }>('points?action=stats');
  },

  /**
   * Admin: Assign points to a user
   */
  async assignPoints(userId: string, amount: number, reason: string): Promise<{
    success: boolean;
    transaction: PointsTransaction;
    message: string;
  }> {
    return apiService.post<{
      success: boolean;
      transaction: PointsTransaction;
      message: string;
    }>('points?action=assign', { userId, amount, reason });
  },

  /**
   * Admin: Get all users with their points balances
   */
  async getAllBalances(): Promise<{
    success: boolean;
    balances: Array<PointsBalance & { user: { first_name: string; last_name: string; email: string; role: string; } }>;
  }> {
    return apiService.get<{
      success: boolean;
      balances: Array<PointsBalance & { user: { first_name: string; last_name: string; email: string; role: string; } }>;
    }>('points?action=admin-balances');
  },

  /**
   * Admin: Get all transactions for monitoring
   */
  async getAllTransactions(limit = 100, offset = 0): Promise<{
    success: boolean;
    transactions: Array<PointsTransaction & { user: { first_name: string; last_name: string; email: string; } }>;
    pagination: { total: number; limit: number; offset: number; };
  }> {
    return apiService.get<{
      success: boolean;
      transactions: Array<PointsTransaction & { user: { first_name: string; last_name: string; email: string; } }>;
      pagination: { total: number; limit: number; offset: number; };
    }>(`points?action=admin-transactions&limit=${limit}&offset=${offset}`);
  },

  /**
   * Check if user has sufficient points for an operation
   */
  async checkSufficientPoints(requiredAmount: number): Promise<{
    success: boolean;
    sufficient: boolean;
    currentBalance: number;
    shortfall: number;
  }> {
    const balanceResponse = await this.getBalance();
    if (!balanceResponse.success || !balanceResponse.balance) {
      return {
        success: false,
        sufficient: false,
        currentBalance: 0,
        shortfall: requiredAmount
      };
    }

    const currentBalance = balanceResponse.balance.currentBalance;
    const sufficient = currentBalance >= requiredAmount;
    
    return {
      success: true,
      sufficient,
      currentBalance,
      shortfall: sufficient ? 0 : requiredAmount - currentBalance
    };
  },

  // NEW REAL MONEY INTEGRATION METHODS

  /**
   * Get conversion rates for points to dollars
   */
  async getConversionRates(): Promise<{
    success: boolean;
    data?: {
      pointsPerDollar: number;
      minimumPurchase: number;
      minimumWithdrawal: number;
      purchaseFee: { percent: number; fixed: number };
      withdrawalFee: { percent: number; fixed: number };
    };
  }> {
    return apiService.get('payments?action=conversion-rates');
  },

  /**
   * Create a Stripe payment intent for purchasing points
   */
  async createPaymentIntent(amount: number, points: number): Promise<{
    success: boolean;
    data?: {
      paymentIntent: PaymentIntent;
      points: number;
      fees: { percent: number; fixed: number; total: number };
    };
    error?: string;
  }> {
    return apiService.post('payments?action=create-payment-intent', {
      amount,
      currency: 'usd',
      points
    });
  },

  /**
   * Request a withdrawal (for participants)
   */
  async requestWithdrawal(withdrawalData: {
    amount: number;
    paymentMethod: 'paypal' | 'bank_transfer';
    paymentDetails: {
      email?: string;
      accountNumber?: string;
      routingNumber?: string;
    };
  }): Promise<{
    success: boolean;
    data?: {
      withdrawalId: string;
      amount: number;
      fees: number;
      netAmount: number;
      status: string;
      estimatedProcessingTime: string;
    };
    error?: string;
  }> {
    return apiService.post('payments?action=request-withdrawal', withdrawalData);
  },

  /**
   * Get payment history
   */
  async getPaymentHistory(): Promise<{
    success: boolean;
    data?: PaymentHistoryItem[];
  }> {
    return apiService.get('payments?action=history');
  },

  /**
   * Get withdrawal history
   */
  async getWithdrawalHistory(): Promise<{
    success: boolean;
    data?: WithdrawalHistoryItem[];
  }> {
    return apiService.get('payments?action=withdrawals');
  }
};

export default pointsService;
