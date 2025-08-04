import { toast } from 'react-hot-toast';

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
      toast.error(message);
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
