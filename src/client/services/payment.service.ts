import { apiService } from './api.service';

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
  }
};

export default pointsService;
