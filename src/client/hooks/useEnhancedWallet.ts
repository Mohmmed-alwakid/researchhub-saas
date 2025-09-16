import { useState, useEffect, useCallback, useRef } from 'react';
import { walletService, type WalletData, type Transaction, type WithdrawalRequest, type CreateWithdrawalRequest } from '../services/wallet.service';
import toast from 'react-hot-toast';

export interface UseEnhancedWalletReturn {
  wallet: WalletData | null;
  transactions: Transaction[];
  withdrawals: WithdrawalRequest[];
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  lastUpdated: Date | null;
  cacheStatus: 'fresh' | 'stale' | 'expired';
  refreshWallet: () => Promise<void>;
  createWithdrawal: (request: CreateWithdrawalRequest) => Promise<{ success: boolean; error?: string }>;
  invalidateCache: () => void;
  retryFailedRequests: () => Promise<void>;
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

class WalletCache {
  private cache = new Map<string, CacheEntry<unknown>>();
  
  set<T>(key: string, data: T, ttl: number = 5 * 60 * 1000): void { // 5 minutes default
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }
  
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data as T;
  }
  
  invalidate(key?: string): void {
    if (key) {
      this.cache.delete(key);
    } else {
      this.cache.clear();
    }
  }
  
  getStatus(key: string): 'fresh' | 'stale' | 'expired' {
    const entry = this.cache.get(key);
    if (!entry) return 'expired';
    
    const age = Date.now() - entry.timestamp;
    const halfTTL = entry.ttl / 2;
    
    if (age < halfTTL) return 'fresh';
    if (age < entry.ttl) return 'stale';
    return 'expired';
  }
}

const walletCache = new WalletCache();

export const useEnhancedWallet = (): UseEnhancedWalletReturn => {
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [cacheStatus, setCacheStatus] = useState<'fresh' | 'stale' | 'expired'>('expired');
  
  const retryQueue = useRef<Array<() => Promise<void>>>([]);
  const pollingInterval = useRef<NodeJS.Timeout>();

  // Enhanced fetch with caching and error recovery
  const fetchWalletData = useCallback(async (isRefresh = false, useCache = true) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      // Check cache first
      if (useCache && !isRefresh) {
        const cachedWallet = walletCache.get<WalletData>('wallet');
        const cachedTransactions = walletCache.get<Transaction[]>('transactions');
        const cachedWithdrawals = walletCache.get<WithdrawalRequest[]>('withdrawals');
        
        if (cachedWallet && cachedTransactions && cachedWithdrawals) {
          setWallet(cachedWallet);
          setTransactions(cachedTransactions);
          setWithdrawals(cachedWithdrawals);
          setCacheStatus(walletCache.getStatus('wallet'));
          setLastUpdated(new Date(walletCache.get<CacheEntry<unknown>>('wallet')?.timestamp || Date.now()));
          setLoading(false);
          setRefreshing(false);
          
          // Still fetch fresh data in background if cache is stale
          if (walletCache.getStatus('wallet') === 'stale') {
            fetchWalletData(true, false);
          }
          return;
        }
      }

      // Fetch wallet data with retry logic
      const fetchWithRetry = async <T>(
        fetchFn: () => Promise<{ success: boolean; data?: T; error?: string }>,
        retries = 3
      ): Promise<T | null> => {
        for (let i = 0; i < retries; i++) {
          try {
            const response = await fetchFn();
            if (response.success && response.data) {
              return response.data;
            }
            if (i === retries - 1) {
              console.error('Final retry failed:', response.error);
            }
          } catch (error) {
            if (i === retries - 1) {
              throw error;
            }
            // Exponential backoff
            await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
          }
        }
        return null;
      };

      // Fetch all data concurrently
      const [walletData, transactionsData, withdrawalsData] = await Promise.allSettled([
        fetchWithRetry(() => walletService.getWallet()),
        fetchWithRetry(() => walletService.getTransactions()),
        fetchWithRetry(() => walletService.getWithdrawals())
      ]);

      // Process wallet data
      if (walletData.status === 'fulfilled' && walletData.value) {
        setWallet(walletData.value);
        walletCache.set('wallet', walletData.value);
      } else {
        console.error('Failed to fetch wallet:', walletData.status === 'rejected' ? walletData.reason : 'Unknown error');
      }

      // Process transactions data
      if (transactionsData.status === 'fulfilled' && transactionsData.value) {
        setTransactions(transactionsData.value);
        walletCache.set('transactions', transactionsData.value);
      } else {
        console.error('Failed to fetch transactions:', transactionsData.status === 'rejected' ? transactionsData.reason : 'Unknown error');
      }

      // Process withdrawals data
      if (withdrawalsData.status === 'fulfilled' && withdrawalsData.value) {
        setWithdrawals(withdrawalsData.value);
        walletCache.set('withdrawals', withdrawalsData.value);
      } else {
        console.error('Failed to fetch withdrawals:', withdrawalsData.status === 'rejected' ? withdrawalsData.reason : 'Unknown error');
      }

      // Check if any requests failed
      const failedRequests = [walletData, transactionsData, withdrawalsData].filter(
        result => result.status === 'rejected'
      );

      if (failedRequests.length > 0) {
        const errorMessage = `${failedRequests.length} out of 3 requests failed`;
        setError(errorMessage);
        toast.error(errorMessage);
      } else {
        setCacheStatus('fresh');
        setLastUpdated(new Date());
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
    await fetchWalletData(true, false);
  }, [fetchWalletData]);

  const createWithdrawal = useCallback(async (request: CreateWithdrawalRequest): Promise<{ success: boolean; error?: string }> => {
    try {
      // Optimistic update
      const optimisticWithdrawal: WithdrawalRequest = {
        id: `temp-${Date.now()}`,
        participant_id: wallet?.participant_id || '',
        wallet_id: wallet?.id || '',
        amount: request.amount,
        status: 'pending',
        payment_method: request.payment_method,
        payment_details: request.payment_details,
        requested_at: new Date().toISOString(),
      };

      setWithdrawals(prev => [optimisticWithdrawal, ...prev]);
      
      // Update wallet balance optimistically
      if (wallet) {
        setWallet(prev => prev ? {
          ...prev,
          balance: prev.balance - request.amount
        } : null);
      }

      const response = await walletService.createWithdrawal(request);
      
      if (response.success) {
        toast.success('Withdrawal request submitted successfully');
        // Refresh data to get actual values
        await refreshWallet();
        // Invalidate cache
        walletCache.invalidate();
        return { success: true };
      } else {
        // Revert optimistic update
        setWithdrawals(prev => prev.filter(w => w.id !== optimisticWithdrawal.id));
        if (wallet) {
          setWallet(prev => prev ? {
            ...prev,
            balance: prev.balance + request.amount
          } : null);
        }
        
        const message = response.error || 'Failed to create withdrawal request';
        toast.error(message);
        return { success: false, error: message };
      }
    } catch (error) {
      console.error('Error creating withdrawal:', error);
      
      // Revert optimistic update
      setWithdrawals(prev => prev.filter(w => w.id !== `temp-${Date.now()}`));
      if (wallet) {
        setWallet(prev => prev ? {
          ...prev,
          balance: prev.balance + request.amount
        } : null);
      }
      
      const message = error instanceof Error ? error.message : 'Failed to create withdrawal request';
      toast.error(message);
      return { success: false, error: message };
    }
  }, [refreshWallet, wallet]);

  const invalidateCache = useCallback(() => {
    walletCache.invalidate();
    setCacheStatus('expired');
  }, []);

  const retryFailedRequests = useCallback(async () => {
    if (retryQueue.current.length > 0) {
      toast('Retrying failed requests...');
      const retries = [...retryQueue.current];
      retryQueue.current = [];
      
      for (const retry of retries) {
        try {
          await retry();
        } catch (error) {
          console.error('Retry failed:', error);
        }
      }
    }
  }, []);

  // Auto-refresh when tab becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && cacheStatus === 'stale') {
        fetchWalletData(true, false);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [fetchWalletData, cacheStatus]);

  // Periodic background refresh for active users
  useEffect(() => {
    if (!loading && !error) {
      pollingInterval.current = setInterval(() => {
        // Only poll if cache is stale and user is active
        if (cacheStatus === 'stale' && !document.hidden) {
          fetchWalletData(true, false);
        }
      }, 2 * 60 * 1000); // 2 minutes
    }

    return () => {
      if (pollingInterval.current) {
        clearInterval(pollingInterval.current);
      }
    };
  }, [loading, error, cacheStatus, fetchWalletData]);

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
    lastUpdated,
    cacheStatus,
    refreshWallet,
    createWithdrawal,
    invalidateCache,
    retryFailedRequests
  };
};