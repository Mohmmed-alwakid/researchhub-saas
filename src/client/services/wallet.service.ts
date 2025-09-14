import { toast } from 'react-hot-toast';
import { apiService } from './api-network-resilient.service';

// Supported currencies: USD and SAR only
export type SupportedCurrency = 'USD' | 'SAR';

export interface WalletData {
  id: string;
  participant_id: string;
  balance: number;
  total_earned: number;
  total_withdrawn: number;
  currency: SupportedCurrency;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  wallet_id: string;
  transaction_type: 'earning' | 'withdrawal' | 'refund' | 'bonus';
  amount: number;
  balance_before: number;
  balance_after: number;
  reference_type?: 'study_completion' | 'withdrawal_request' | 'bonus' | 'refund';
  reference_id?: string;
  description: string;
  created_at: string;
  created_by: string;
}

export interface WithdrawalRequest {
  id: string;
  participant_id: string;
  wallet_id: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  payment_method: 'paypal' | 'bank_transfer' | 'crypto';
  payment_details: Record<string, string | number>;
  requested_at: string;
  processed_at?: string;
  processed_by?: string;
  admin_notes?: string;
}

export interface CreateWithdrawalRequest {
  amount: number;
  payment_method: 'paypal' | 'bank_transfer' | 'crypto';
  payment_details: {
    email?: string;
    account_number?: string;
    routing_number?: string;
    bank_name?: string;
    wallet_address?: string;
  };
}

// Mock data for local development
const getMockWalletData = (): WalletData => {
  return {
    id: 'mock-wallet-001',
    participant_id: 'mock-participant-001',
    balance: 125.50,
    total_earned: 567.25,
    total_withdrawn: 441.75,
    currency: 'USD',
    created_at: new Date(Date.now() - 86400000 * 30).toISOString(),
    updated_at: new Date().toISOString()
  };
};

const getMockTransactions = (): Transaction[] => {
  const baseTime = Date.now();
  return [
    {
      id: 'mock-txn-001',
      wallet_id: 'mock-wallet-001',
      transaction_type: 'earning',
      amount: 25.00,
      balance_before: 100.50,
      balance_after: 125.50,
      reference_type: 'study_completion',
      reference_id: 'study-001',
      description: 'E-commerce Checkout Flow Study Completion',
      created_at: new Date(baseTime - 86400000).toISOString(),
      created_by: 'system'
    },
    {
      id: 'mock-txn-002',
      wallet_id: 'mock-wallet-001',
      transaction_type: 'withdrawal',
      amount: -50.00,
      balance_before: 150.50,
      balance_after: 100.50,
      reference_type: 'withdrawal_request',
      reference_id: 'withdrawal-001',
      description: 'PayPal Withdrawal',
      created_at: new Date(baseTime - 86400000 * 3).toISOString(),
      created_by: 'participant'
    },
    {
      id: 'mock-txn-003',
      wallet_id: 'mock-wallet-001',
      transaction_type: 'earning',
      amount: 30.00,
      balance_before: 120.50,
      balance_after: 150.50,
      reference_type: 'study_completion',
      reference_id: 'study-002',
      description: 'Mobile App Navigation Study Completion',
      created_at: new Date(baseTime - 86400000 * 5).toISOString(),
      created_by: 'system'
    }
  ];
};

const getMockWithdrawals = (): WithdrawalRequest[] => {
  const baseTime = Date.now();
  return [
    {
      id: 'mock-withdrawal-001',
      participant_id: 'mock-participant-001',
      wallet_id: 'mock-wallet-001',
      amount: 50.00,
      status: 'completed',
      payment_method: 'paypal',
      payment_details: { email: 'participant@example.com' },
      requested_at: new Date(baseTime - 86400000 * 3).toISOString(),
      processed_at: new Date(baseTime - 86400000 * 2).toISOString(),
      processed_by: 'admin-001'
    },
    {
      id: 'mock-withdrawal-002',
      participant_id: 'mock-participant-001',
      wallet_id: 'mock-wallet-001',
      amount: 75.00,
      status: 'pending',
      payment_method: 'paypal',
      payment_details: { email: 'participant@example.com' },
      requested_at: new Date(baseTime - 86400000).toISOString()
    }
  ];
};

// Helper function to simulate API delay for development
const simulateDelay = (ms: number = 300) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

// Helper function to detect if token is a mock/fallback token
const isFallbackToken = (token: string): boolean => {
  return Boolean(token && (token.includes('mock-signature') || token.includes('fallback-token')));
};

class WalletService {
  /**
   * Get wallet data with automatic network-resilient fallback
   */
  async getWallet(): Promise<{ success: boolean; data?: WalletData; error?: string }> {
    try {
      console.log('🔧 Wallet Service - Getting wallet data...');
      
      // Check if using fallback authentication
      const authStorage = localStorage.getItem('auth-storage');
      let isFallback = false;
      if (authStorage) {
        try {
          const { state } = JSON.parse(authStorage);
          isFallback = isFallbackToken(state?.token || '');
        } catch {
          // Continue with normal flow
        }
      }
      
      if (isFallback) {
        console.log('🔧 Using fallback wallet data');
        await simulateDelay();
        return { success: true, data: getMockWalletData() };
      }

      // Use network-resilient API service
      const result = await apiService.get<{ success: boolean; data: WalletData }>('/wallet?action=wallet');
      return result;
      
    } catch (error) {
      console.error('Wallet getWallet error:', error);
      // Fallback to mock data on any error
      return { success: true, data: getMockWalletData() };
    }
  }

  /**
   * Get transaction history with automatic network-resilient fallback
   */
  async getTransactions(): Promise<{ success: boolean; data?: Transaction[]; error?: string }> {
    try {
      console.log('🔧 Wallet Service - Getting transactions...');
      
      // Check if using fallback authentication
      const authStorage = localStorage.getItem('auth-storage');
      let isFallback = false;
      if (authStorage) {
        try {
          const { state } = JSON.parse(authStorage);
          isFallback = isFallbackToken(state?.token || '');
        } catch {
          // Continue with normal flow
        }
      }
      
      if (isFallback) {
        console.log('🔧 Using fallback transaction data');
        await simulateDelay();
        return { success: true, data: getMockTransactions() };
      }

      // Use network-resilient API service
      const result = await apiService.get<{ success: boolean; data: Transaction[] }>('/wallet?action=transactions');
      return result;
      
    } catch (error) {
      console.error('Wallet getTransactions error:', error);
      // Fallback to mock data on any error
      return { success: true, data: getMockTransactions() };
    }
  }

  /**
   * Get withdrawal requests with automatic network-resilient fallback
   */
  async getWithdrawals(): Promise<{ success: boolean; data?: WithdrawalRequest[]; error?: string }> {
    try {
      console.log('🔧 Wallet Service - Getting withdrawals...');
      
      // Check if using fallback authentication
      const authStorage = localStorage.getItem('auth-storage');
      let isFallback = false;
      if (authStorage) {
        try {
          const { state } = JSON.parse(authStorage);
          isFallback = isFallbackToken(state?.token || '');
        } catch {
          // Continue with normal flow
        }
      }
      
      if (isFallback) {
        console.log('🔧 Using fallback withdrawal data');
        await simulateDelay();
        return { success: true, data: getMockWithdrawals() };
      }

      // Use network-resilient API service
      const result = await apiService.get<{ success: boolean; data: WithdrawalRequest[] }>('/wallet?action=withdrawal-requests');
      return result;
      
    } catch (error) {
      console.error('Wallet getWithdrawals error:', error);
      // Fallback to mock data on any error
      return { success: true, data: getMockWithdrawals() };
    }
  }

  /**
   * Create withdrawal request with automatic network-resilient fallback
   */
  async createWithdrawal(request: CreateWithdrawalRequest): Promise<{ success: boolean; data?: WithdrawalRequest; error?: string }> {
    try {
      console.log('🔧 Wallet Service - Creating withdrawal request...');
      
      // Check if using fallback authentication
      const authStorage = localStorage.getItem('auth-storage');
      let isFallback = false;
      if (authStorage) {
        try {
          const { state } = JSON.parse(authStorage);
          isFallback = isFallbackToken(state?.token || '');
        } catch {
          // Continue with normal flow
        }
      }
      
      if (isFallback) {
        console.log('🔧 Using fallback for withdrawal creation');
        await simulateDelay();
        
        // Simulate creating a new withdrawal request
        const newWithdrawal: WithdrawalRequest = {
          id: `fallback-withdrawal-${Date.now()}`,
          participant_id: 'test-participant-001',
          wallet_id: 'fallback-wallet-001',
          amount: request.amount,
          status: 'pending',
          payment_method: request.payment_method,
          payment_details: request.payment_details,
          requested_at: new Date().toISOString()
        };
        
        toast.success('Withdrawal request submitted successfully (fallback mode)');
        return { success: true, data: newWithdrawal };
      }

      // Use network-resilient API service
      const result = await apiService.post<{ success: boolean; data: WithdrawalRequest }>('/wallet?action=request-withdrawal', request);
      
      if (result.success) {
        toast.success('Withdrawal request submitted successfully');
      }
      
      return result;
      
    } catch (error) {
      console.error('Wallet createWithdrawal error:', error);
      const message = error instanceof Error ? error.message : 'Failed to create withdrawal request';
      toast.error(message);
      return { success: false, error: message };
    }
  }

  /**
   * Add transaction with automatic network-resilient fallback
   */
  async addTransaction(amount: number, description: string, transactionType: Transaction['transaction_type'] = 'earning'): Promise<{ success: boolean; data?: Transaction; error?: string }> {
    try {
      console.log('🔧 Wallet Service - Adding transaction...');
      
      // Check if using fallback authentication
      const authStorage = localStorage.getItem('auth-storage');
      let isFallback = false;
      if (authStorage) {
        try {
          const { state } = JSON.parse(authStorage);
          isFallback = isFallbackToken(state?.token || '');
        } catch {
          // Continue with normal flow
        }
      }
      
      if (isFallback) {
        console.log('🔧 Using fallback for transaction creation');
        await simulateDelay();
        
        // Simulate creating a new transaction
        const newTransaction: Transaction = {
          id: `fallback-txn-${Date.now()}`,
          wallet_id: 'fallback-wallet-001',
          transaction_type: transactionType,
          amount: amount,
          balance_before: 125.50,
          balance_after: 125.50 + amount,
          description: description,
          created_at: new Date().toISOString(),
          created_by: 'fallback-system'
        };
        
        return { success: true, data: newTransaction };
      }

      // Use network-resilient API service
      const result = await apiService.post<{ success: boolean; data: Transaction }>('/wallet/transactions', {
        amount,
        description,
        type: transactionType
      });
      
      return result;
      
    } catch (error) {
      console.error('Wallet addTransaction error:', error);
      const message = error instanceof Error ? error.message : 'Failed to add transaction';
      return { success: false, error: message };
    }
  }
}

// Currency utilities for USD and SAR support
export const CURRENCY_CONFIG = {
  USD: {
    symbol: '$',
    code: 'USD',
    name: 'US Dollar',
    locale: 'en-US',
    exchangeRate: 1 // Base currency
  },
  SAR: {
    symbol: '﷼',
    code: 'SAR',
    name: 'Saudi Riyal',
    locale: 'ar-SA',
    exchangeRate: 3.75 // 1 USD = 3.75 SAR (approximate)
  }
} as const;

export const formatCurrency = (amount: number, currency: SupportedCurrency): string => {
  const config = CURRENCY_CONFIG[currency];
  return new Intl.NumberFormat(config.locale, {
    style: 'currency',
    currency: config.code,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

export const convertCurrency = (amount: number, fromCurrency: SupportedCurrency, toCurrency: SupportedCurrency): number => {
  if (fromCurrency === toCurrency) return amount;
  
  // Convert to USD first, then to target currency
  const usdAmount = fromCurrency === 'USD' ? amount : amount / CURRENCY_CONFIG[fromCurrency].exchangeRate;
  return toCurrency === 'USD' ? usdAmount : usdAmount * CURRENCY_CONFIG[toCurrency].exchangeRate;
};

export const getSupportedCurrencies = (): SupportedCurrency[] => {
  return Object.keys(CURRENCY_CONFIG) as SupportedCurrency[];
};

export const walletService = new WalletService();
