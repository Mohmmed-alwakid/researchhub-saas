import { useState, useEffect, useCallback } from 'react';
import { walletService, type WalletData, type Transaction, type WithdrawalRequest, type CreateWithdrawalRequest } from '../services/wallet.service';
import toast from 'react-hot-toast';

export interface UseWalletReturn {
  wallet: WalletData | null;
  transactions: Transaction[];
  withdrawals: WithdrawalRequest[];
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  refreshWallet: () => Promise<void>;
  createWithdrawal: (request: CreateWithdrawalRequest) => Promise<{ success: boolean; error?: string }>;
}

export const useWallet = (): UseWalletReturn => {
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWalletData = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      // Fetch wallet data
      const walletResponse = await walletService.getWallet();
      if (walletResponse.success && walletResponse.data) {
        setWallet(walletResponse.data);
      } else {
        console.error('Failed to fetch wallet:', walletResponse.error);
        setError(walletResponse.error || 'Failed to fetch wallet');
      }

      // Fetch transactions
      const transactionsResponse = await walletService.getTransactions();
      if (transactionsResponse.success && transactionsResponse.data) {
        setTransactions(transactionsResponse.data);
      } else {
        console.error('Failed to fetch transactions:', transactionsResponse.error);
      }

      // Fetch withdrawals
      const withdrawalsResponse = await walletService.getWithdrawals();
      if (withdrawalsResponse.success && withdrawalsResponse.data) {
        setWithdrawals(withdrawalsResponse.data);
      } else {
        console.error('Failed to fetch withdrawals:', withdrawalsResponse.error);
      }

    } catch (error) {
      console.error('Error fetching wallet data:', error);
      const message = error instanceof Error ? error.message : 'Failed to fetch wallet data';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const refreshWallet = useCallback(async () => {
    await fetchWalletData(true);
  }, [fetchWalletData]);

  const createWithdrawal = useCallback(async (request: CreateWithdrawalRequest): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await walletService.createWithdrawal(request);
      
      if (response.success) {
        toast.success('Withdrawal request submitted successfully');
        // Refresh data to show the new withdrawal
        await refreshWallet();
        return { success: true };
      } else {
        const message = response.error || 'Failed to create withdrawal request';
        toast.error(message);
        return { success: false, error: message };
      }
    } catch (error) {
      console.error('Error creating withdrawal:', error);
      const message = error instanceof Error ? error.message : 'Failed to create withdrawal request';
      toast.error(message);
      return { success: false, error: message };
    }
  }, [refreshWallet]);

  useEffect(() => {
    fetchWalletData();
  }, [fetchWalletData]);

  return {
    wallet,
    transactions,
    withdrawals,
    loading,
    refreshing,
    error,
    refreshWallet,
    createWithdrawal
  };
};
