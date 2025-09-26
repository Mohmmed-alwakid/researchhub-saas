import React from 'react';
import { TrendingUp, TrendingDown, DollarSign, Calendar, Filter } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

interface WalletTransaction {
  id: string;
  transaction_type: 'earning' | 'withdrawal' | 'refund' | 'bonus';
  amount: number;
  balance_before: number;
  balance_after: number;
  description: string;
  reference_type?: string;
  reference_id?: string;
  created_at: string;
}

interface TransactionHistoryProps {
  transactions: WalletTransaction[];
  loading?: boolean;
  onFilterChange?: (type: 'all' | 'earnings' | 'withdrawals' | 'refunds' | 'bonuses') => void;
  currentFilter?: 'all' | 'earnings' | 'withdrawals' | 'refunds' | 'bonuses';
}

export const TransactionHistory: React.FC<TransactionHistoryProps> = ({
  transactions,
  loading = false,
  onFilterChange,
  currentFilter = 'all'
}) => {
  const formatCurrency = (amount: string | number) => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(Math.abs(numAmount));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTransactionIcon = (type: string, amount: string | number) => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (type === 'earning' || numAmount > 0) {
      return <TrendingUp className="h-4 w-4 text-green-600" />;
    } else {
      return <TrendingDown className="h-4 w-4 text-red-600" />;
    }
  };

  const getTransactionColor = (type: string, amount: string | number) => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (type === 'earning' || numAmount > 0) {
      return 'text-green-600';
    } else {
      return 'text-red-600';
    }
  };

  const getTransactionSign = (type: string, amount: string | number) => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (type === 'earning' || numAmount > 0) {
      return '+';
    } else {
      return '-';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="flex items-center justify-between p-3">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 bg-gray-200 rounded"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-32"></div>
                      <div className="h-3 bg-gray-200 rounded w-24"></div>
                    </div>
                  </div>
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const filteredTransactions = transactions.filter(transaction => {
    if (currentFilter === 'all') return true;
    if (currentFilter === 'earnings') return transaction.transaction_type === 'earning';
    if (currentFilter === 'withdrawals') return transaction.transaction_type === 'withdrawal';
    return true;
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-blue-600" />
            Transaction History
          </CardTitle>
          {onFilterChange && (
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <div className="flex gap-1">
                {(['all', 'earnings', 'withdrawals'] as const).map((filter) => (
                  <Button
                    key={filter}
                    variant={currentFilter === filter ? 'primary' : 'ghost'}
                    size="sm"
                    onClick={() => onFilterChange(filter)}
                  >
                    {filter.charAt(0).toUpperCase() + filter.slice(1)}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {filteredTransactions.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No transactions yet</h3>
            <p className="text-gray-600">
              {currentFilter === 'all' 
                ? 'Your transaction history will appear here'
                : `No ${currentFilter} found`
              }
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:border-gray-200 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0">
                    {getTransactionIcon(transaction.transaction_type, transaction.amount)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-gray-900 truncate">
                        {transaction.description}
                      </p>
                      <Badge 
                        variant={transaction.transaction_type === 'earning' ? 'success' : 'secondary'}
                        className="text-xs"
                      >
                        {transaction.transaction_type === 'earning' ? 'Earning' : 'Withdrawal'}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>{formatDate(transaction.created_at)}</span>
                      {transaction.reference_type && (
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                          {transaction.reference_type.replace('_', ' ')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`font-semibold ${getTransactionColor(transaction.transaction_type, transaction.amount)}`}>
                    {getTransactionSign(transaction.transaction_type, transaction.amount)}
                    {formatCurrency(transaction.amount)}
                  </div>
                  <div className="text-sm text-gray-500">
                    Balance: {formatCurrency(transaction.balance_after)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
