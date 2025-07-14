import React, { memo, useMemo, useCallback } from 'react';
import { WalletData, Transaction, WithdrawalRequest } from '../../services/wallet.service';

// Optimized components with React.memo
export const OptimizedWalletOverview = memo<{
  wallet: WalletData;
  loading?: boolean;
  onRequestWithdrawal?: () => void;
}>(({ wallet, loading, onRequestWithdrawal }) => {
  const formattedBalance = useMemo(() => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: wallet.currency || 'USD'
    }).format(wallet.balance);
  }, [wallet.balance, wallet.currency]);

  const formattedEarned = useMemo(() => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: wallet.currency || 'USD'
    }).format(wallet.total_earned);
  }, [wallet.total_earned, wallet.currency]);

  const formattedWithdrawn = useMemo(() => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: wallet.currency || 'USD'
    }).format(wallet.total_withdrawn);
  }, [wallet.total_withdrawn, wallet.currency]);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Wallet Balance</h3>
        {!loading && (
          <div className="text-2xl font-bold text-green-600">{formattedBalance}</div>
        )}
        {loading && (
          <div className="h-8 w-24 bg-gray-200 rounded animate-pulse"></div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <div className="text-sm text-gray-600 mb-1">Total Earned</div>
          <div className="font-semibold text-blue-600">{formattedEarned}</div>
        </div>
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <div className="text-sm text-gray-600 mb-1">Total Withdrawn</div>
          <div className="font-semibold text-gray-600">{formattedWithdrawn}</div>
        </div>
      </div>

      {onRequestWithdrawal && (
        <button
          onClick={onRequestWithdrawal}
          disabled={loading || wallet.balance < 5}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
        >
          Request Withdrawal
        </button>
      )}
    </div>
  );
});

OptimizedWalletOverview.displayName = 'OptimizedWalletOverview';

// Memoized transaction item for performance
export const TransactionItem = memo<{
  transaction: Transaction;
}>(({ transaction }) => {
  const formattedAmount = useMemo(() => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(Math.abs(transaction.amount));
  }, [transaction.amount]);

  const formattedDate = useMemo(() => {
    return new Date(transaction.created_at).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }, [transaction.created_at]);

  const isPositive = transaction.amount > 0;

  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
      <div className="flex-1">
        <div className="font-medium text-sm text-gray-900">
          {transaction.description}
        </div>
        <div className="text-xs text-gray-500">{formattedDate}</div>
      </div>
      <div className={`font-semibold ${
        isPositive ? 'text-green-600' : 'text-red-600'
      }`}>
        {isPositive ? '+' : '-'}{formattedAmount}
      </div>
    </div>
  );
});

TransactionItem.displayName = 'TransactionItem';

// Optimized transaction history with virtualization for large lists
export const OptimizedTransactionHistory = memo<{
  transactions: Transaction[];
  loading?: boolean;
  maxVisible?: number;
}>(({ transactions, loading, maxVisible = 10 }) => {
  const [showAll, setShowAll] = React.useState(false);

  const visibleTransactions = useMemo(() => {
    if (showAll || transactions.length <= maxVisible) {
      return transactions;
    }
    return transactions.slice(0, maxVisible);
  }, [transactions, showAll, maxVisible]);

  const hasMore = transactions.length > maxVisible;

  const toggleShowAll = useCallback(() => {
    setShowAll(prev => !prev);
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Transaction History</h3>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center justify-between animate-pulse">
              <div className="space-y-2 flex-1">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
              <div className="h-4 bg-gray-200 rounded w-16"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Transaction History</h3>
      
      {visibleTransactions.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No transactions yet
        </div>
      ) : (
        <>
          <div className="space-y-0">
            {visibleTransactions.map((transaction) => (
              <TransactionItem 
                key={transaction.id} 
                transaction={transaction} 
              />
            ))}
          </div>
          
          {hasMore && (
            <button
              onClick={toggleShowAll}
              className="w-full mt-4 text-center text-blue-600 hover:text-blue-700 font-medium text-sm"
            >
              {showAll ? 'Show Less' : `Show All (${transactions.length})`}
            </button>
          )}
        </>
      )}
    </div>
  );
});

OptimizedTransactionHistory.displayName = 'OptimizedTransactionHistory';

// Memoized withdrawal status badge
export const WithdrawalStatusBadge = memo<{
  status: WithdrawalRequest['status'];
}>(({ status }) => {
  const badgeConfig = useMemo(() => {
    switch (status) {
      case 'pending':
        return { color: 'bg-yellow-100 text-yellow-800', text: 'Pending' };
      case 'approved':
        return { color: 'bg-green-100 text-green-800', text: 'Approved' };
      case 'rejected':
        return { color: 'bg-red-100 text-red-800', text: 'Rejected' };
      case 'completed':
        return { color: 'bg-gray-100 text-gray-800', text: 'Completed' };
      default:
        return { color: 'bg-gray-100 text-gray-800', text: status };
    }
  }, [status]);

  return (
    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${badgeConfig.color}`}>
      {badgeConfig.text}
    </span>
  );
});

WithdrawalStatusBadge.displayName = 'WithdrawalStatusBadge';
