import React, { useState, useMemo } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Calendar, Filter, Download, Search, ChevronDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { formatCurrency, SupportedCurrency } from '../../services/wallet.service';

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
  currency?: SupportedCurrency;
}

interface TransactionHistoryProps {
  transactions: WalletTransaction[];
  loading?: boolean;
  currency?: SupportedCurrency;
  onFilterChange?: (type: 'all' | 'earnings' | 'withdrawals' | 'refunds' | 'bonuses') => void;
  currentFilter?: 'all' | 'earnings' | 'withdrawals' | 'refunds' | 'bonuses';
}

export const EnhancedTransactionHistory: React.FC<TransactionHistoryProps> = ({
  transactions,
  loading = false,
  currency = 'USD',
  onFilterChange,
  currentFilter = 'all'
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState<'all' | '7days' | '30days' | '90days'>('all');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest' | 'highest' | 'lowest'>('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Enhanced filtering and search
  const filteredTransactions = useMemo(() => {
    let filtered = transactions;

    // Filter by type
    if (currentFilter && currentFilter !== 'all') {
      filtered = filtered.filter(t => {
        switch (currentFilter) {
          case 'earnings': return t.transaction_type === 'earning' || t.transaction_type === 'bonus';
          case 'withdrawals': return t.transaction_type === 'withdrawal';
          case 'refunds': return t.transaction_type === 'refund';
          case 'bonuses': return t.transaction_type === 'bonus';
          default: return true;
        }
      });
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(t => 
        t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.transaction_type.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by date range
    if (dateRange !== 'all') {
      const now = new Date();
      const daysAgo = {
        '7days': 7,
        '30days': 30,
        '90days': 90
      }[dateRange];
      
      const cutoffDate = new Date(now.getTime() - (daysAgo * 24 * 60 * 60 * 1000));
      filtered = filtered.filter(t => new Date(t.created_at) >= cutoffDate);
    }

    // Sort transactions
    filtered.sort((a, b) => {
      switch (sortOrder) {
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'highest':
          return Math.abs(b.amount) - Math.abs(a.amount);
        case 'lowest':
          return Math.abs(a.amount) - Math.abs(b.amount);
        default:
          return 0;
      }
    });

    return filtered;
  }, [transactions, currentFilter, searchTerm, dateRange, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Export functionality
  const exportTransactions = () => {
    const csvContent = [
      ['Date', 'Type', 'Description', 'Amount', 'Balance After'].join(','),
      ...filteredTransactions.map(t => [
        new Date(t.created_at).toLocaleDateString(),
        t.transaction_type,
        `"${t.description}"`,
        t.amount,
        t.balance_after
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const formatTransactionCurrency = (amount: string | number) => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return formatCurrency(Math.abs(numAmount), currency);
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
    if (type === 'earning' || type === 'bonus' || numAmount > 0) {
      return <TrendingUp className="h-4 w-4 text-green-600" />;
    } else {
      return <TrendingDown className="h-4 w-4 text-red-600" />;
    }
  };

  const getTransactionColor = (type: string, amount: string | number) => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (type === 'earning' || type === 'bonus' || numAmount > 0) {
      return 'text-green-600';
    } else {
      return 'text-red-600';
    }
  };

  const getTransactionSign = (type: string, amount: string | number) => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (type === 'earning' || type === 'bonus' || numAmount > 0) {
      return '+';
    } else {
      return '-';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <div className="h-6 bg-gray-200 rounded w-1/3 animate-pulse"></div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="h-10 w-10 bg-gray-200 rounded-full animate-pulse"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                </div>
                <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="space-y-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-green-600" />
            Transaction History
          </CardTitle>
          <Button onClick={exportTransactions} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>

        {/* Enhanced Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Date Range Filter */}
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Time</option>
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
            <option value="90days">Last 90 Days</option>
          </select>

          {/* Type Filter */}
          <select
            value={currentFilter}
            onChange={(e) => onFilterChange?.(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Types</option>
            <option value="earnings">Earnings</option>
            <option value="withdrawals">Withdrawals</option>
            <option value="refunds">Refunds</option>
            <option value="bonuses">Bonuses</option>
          </select>

          {/* Sort Order */}
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="highest">Highest Amount</option>
            <option value="lowest">Lowest Amount</option>
          </select>
        </div>

        {/* Results Summary */}
        <div className="text-sm text-gray-600">
          Showing {paginatedTransactions.length} of {filteredTransactions.length} transactions
        </div>
      </CardHeader>

      <CardContent>
        {paginatedTransactions.length === 0 ? (
          <div className="text-center py-8">
            <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No transactions found</h3>
            <p className="text-gray-600">
              {searchTerm || currentFilter !== 'all' || dateRange !== 'all'
                ? 'Try adjusting your filters to see more results.'
                : 'You haven\'t had any transactions yet.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {paginatedTransactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    {getTransactionIcon(transaction.transaction_type, transaction.amount)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-gray-900">
                        {transaction.description}
                      </p>
                      <Badge variant="secondary" className="text-xs">
                        {transaction.transaction_type}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-500">
                      {formatDate(transaction.created_at)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`font-semibold ${getTransactionColor(transaction.transaction_type, transaction.amount)}`}>
                    {getTransactionSign(transaction.transaction_type, transaction.amount)}
                    {formatTransactionCurrency(transaction.amount)}
                  </div>
                  <div className="text-xs text-gray-500">
                    Balance: {formatTransactionCurrency(transaction.balance_after)}
                  </div>
                </div>
              </div>
            ))}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6">
                <Button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  variant="outline"
                  size="sm"
                >
                  Previous
                </Button>
                <div className="flex items-center space-x-2">
                  {[...Array(totalPages)].map((_, i) => (
                    <Button
                      key={i + 1}
                      onClick={() => setCurrentPage(i + 1)}
                      variant={currentPage === i + 1 ? "primary" : "outline"}
                      size="sm"
                      className="w-8 h-8 p-0"
                    >
                      {i + 1}
                    </Button>
                  ))}
                </div>
                <Button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  variant="outline"
                  size="sm"
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};