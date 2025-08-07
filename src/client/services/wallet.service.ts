import { toast } from 'react-hot-toast';

// Supported currencies: USD and SAR only
export type SupportedCurrency = 'USD' | 'SAR';

// Local development configuration
const DEVELOPMENT_CONFIG = {
  FORCE_LOCAL_MODE: false, // DISABLED: Use real APIs only
  MOCK_DELAY: 500 // Keep for future use if needed
};

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

// Helper function to simulate API delay
const simulateDelay = (ms: number = DEVELOPMENT_CONFIG.MOCK_DELAY) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

// Helper function to detect if token is a mock token
const isMockToken = (token: string): boolean => {
  return Boolean(token && token.includes('mock-signature'));
};

class WalletService {
  private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<{ success: boolean; data?: T; error?: string }> {
    try {
      // Get token from Zustand auth store (same pattern as api.service.ts)
      let token = null;
      const authStorage = localStorage.getItem('auth-storage');
      if (authStorage) {
        try {
          const { state } = JSON.parse(authStorage);
          token = state?.token;
        } catch (error) {
          console.warn('Failed to parse auth storage:', error);
        }
      }
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Check if we should use mock data (local development mode)
      if (DEVELOPMENT_CONFIG.FORCE_LOCAL_MODE || isMockToken(token)) {
        console.log('🔧 Wallet Service - Using mock data for local development');
        await simulateDelay();
        
        // Return mock data based on endpoint
        if (endpoint.includes('get-wallet')) {
          return { success: true, data: getMockWalletData() as T };
        } else if (endpoint.includes('transactions')) {
          return { success: true, data: getMockTransactions() as T };
        } else if (endpoint.includes('withdrawals')) {
          return { success: true, data: getMockWithdrawals() as T };
        } else if (endpoint.includes('request-withdrawal')) {
          // Simulate creating a new withdrawal request
          const newWithdrawal: WithdrawalRequest = {
            id: `mock-withdrawal-${Date.now()}`,
            participant_id: 'mock-participant-001',
            wallet_id: 'mock-wallet-001',
            amount: 100.00,
            status: 'pending',
            payment_method: 'paypal',
            payment_details: { email: 'participant@example.com' },
            requested_at: new Date().toISOString()
          };
          return { success: true, data: newWithdrawal as T };
        }
        
        return { success: true, data: {} as T };
      }

      const response = await fetch(`/api${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          ...options.headers,
        },
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || `HTTP error! status: ${response.status}`);
      }

      return result;
    } catch (error) {
      console.error(`Wallet API Error (${endpoint}):`, error);
      const message = error instanceof Error ? error.message : 'An unexpected error occurred';
      
      // In local development, don't show error toasts for expected API failures
      const errorMessage = error instanceof Error ? error.message : '';
      if (!DEVELOPMENT_CONFIG.FORCE_LOCAL_MODE && !errorMessage.includes('mock')) {
        toast.error(message);
      }
      
      return { success: false, error: message };
    }
  }

  async getWallet(): Promise<{ success: boolean; data?: WalletData; error?: string }> {
    return this.makeRequest<WalletData>('/payments-consolidated-full?action=get-wallet');
  }

  async getTransactions(): Promise<{ success: boolean; data?: Transaction[]; error?: string }> {
    return this.makeRequest<Transaction[]>('/payments-consolidated-full?action=transactions');
  }

  async getWithdrawals(): Promise<{ success: boolean; data?: WithdrawalRequest[]; error?: string }> {
    return this.makeRequest<WithdrawalRequest[]>('/payments-consolidated-full?action=withdrawals');
  }

  async createWithdrawal(request: CreateWithdrawalRequest): Promise<{ success: boolean; data?: WithdrawalRequest; error?: string }> {
    return this.makeRequest<WithdrawalRequest>('/payments-consolidated-full?action=request-withdrawal', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async addTransaction(amount: number, description: string, transactionType: Transaction['transaction_type'] = 'earning'): Promise<{ success: boolean; data?: Transaction; error?: string }> {
    return this.makeRequest<Transaction>('/wallets/transactions', {
      method: 'POST',
      body: JSON.stringify({ amount, description, type: transactionType }),
    });
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
