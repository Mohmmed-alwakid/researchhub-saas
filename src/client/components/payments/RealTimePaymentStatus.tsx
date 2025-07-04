import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  DollarSign, 
  Loader2,
  RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { pointsService } from '../../services/payment.service';

interface PaymentStatus {
  id: string;
  type: 'purchase' | 'withdrawal';
  amount: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: string;
  updatedAt: string;
  paymentMethod?: string;
  reference?: string;
  errorMessage?: string;
}

interface RealTimePaymentStatusProps {
  className?: string;
  refreshInterval?: number; // in seconds
  showHistory?: boolean;
}

export const RealTimePaymentStatus: React.FC<RealTimePaymentStatusProps> = ({
  className = '',
  refreshInterval = 30, // 30 seconds default
  showHistory = true
}) => {
  const [payments, setPayments] = useState<PaymentStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPaymentStatus();
    
    // Set up auto-refresh
    const interval = setInterval(() => {
      fetchPaymentStatus(true);
    }, refreshInterval * 1000);

    return () => clearInterval(interval);
  }, [refreshInterval]);

  const fetchPaymentStatus = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      // Fetch payment history (this would typically be a real-time endpoint)
      const paymentHistory = await pointsService.getPaymentHistory();
      const withdrawalHistory = await pointsService.getWithdrawalHistory();

      if (paymentHistory.success && withdrawalHistory.success) {
        // Transform data to common format
        const allPayments: PaymentStatus[] = [
          ...(paymentHistory.data || []).map(payment => ({
            id: payment._id,
            type: 'purchase' as const,
            amount: payment.amount,
            status: (payment.status === 'verified' ? 'completed' : 
                   payment.status === 'rejected' ? 'failed' : 'pending') as PaymentStatus['status'],
            createdAt: payment.requestedAt,
            updatedAt: payment.processedAt || payment.requestedAt,
            paymentMethod: payment.paymentMethod,
            reference: payment._id
          })),
          ...(withdrawalHistory.data || []).map(withdrawal => ({
            id: withdrawal._id,
            type: 'withdrawal' as const,
            amount: withdrawal.amount,
            status: (withdrawal.status === 'approved' ? 'completed' : 
                   withdrawal.status === 'rejected' ? 'failed' : 'pending') as PaymentStatus['status'],
            createdAt: withdrawal.requestedAt,
            updatedAt: withdrawal.processedAt || withdrawal.requestedAt,
            paymentMethod: withdrawal.paymentMethod,
            reference: withdrawal._id
          }))
        ];

        // Sort by most recent first
        allPayments.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
        
        setPayments(allPayments);
        setLastRefresh(new Date());
      } else {
        setError('Failed to load payment status');
      }
    } catch (err) {
      console.error('Failed to fetch payment status:', err);
      setError('Failed to load payment status');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'processing':
        return <Loader2 className="h-4 w-4 animate-spin" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'failed':
        return <XCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pending';
      case 'processing':
        return 'Processing';
      case 'completed':
        return 'Completed';
      case 'failed':
        return 'Failed';
      default:
        return status;
    }
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (minutes < 1440) return `${Math.floor(minutes / 60)}h ago`;
    return `${Math.floor(minutes / 1440)}d ago`;
  };

  const pendingPayments = payments.filter(p => p.status === 'pending' || p.status === 'processing');
  const recentPayments = showHistory ? payments.slice(0, 10) : [];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Payment Status</h3>
          {lastRefresh && (
            <p className="text-sm text-gray-500">
              Last updated: {formatTimeAgo(lastRefresh)}
            </p>
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => fetchPaymentStatus(true)}
          disabled={refreshing}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Error State */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-red-700">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pending Payments */}
      {pendingPayments.length > 0 && (
        <Card>
          <CardHeader>
            <h4 className="font-medium text-gray-900">Pending Transactions</h4>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {pendingPayments.map((payment) => (
                <div key={payment.id} className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      {payment.type === 'purchase' ? (
                        <DollarSign className="h-4 w-4 text-green-600" />
                      ) : (
                        <DollarSign className="h-4 w-4 text-blue-600" />
                      )}
                      <span className="font-medium">
                        {payment.type === 'purchase' ? 'Point Purchase' : 'Withdrawal Request'}
                      </span>
                    </div>
                    <Badge className={getStatusColor(payment.status)}>
                      {getStatusIcon(payment.status)}
                      <span className="ml-1">{getStatusText(payment.status)}</span>
                    </Badge>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{formatCurrency(payment.amount)}</div>
                    <div className="text-sm text-gray-500">{formatDate(payment.createdAt)}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Payment History */}
      {showHistory && recentPayments.length > 0 && (
        <Card>
          <CardHeader>
            <h4 className="font-medium text-gray-900">Recent Transactions</h4>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {recentPayments.map((payment) => (
                <div key={payment.id} className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      {payment.type === 'purchase' ? (
                        <DollarSign className="h-4 w-4 text-green-600" />
                      ) : (
                        <DollarSign className="h-4 w-4 text-blue-600" />
                      )}
                      <span className="font-medium">
                        {payment.type === 'purchase' ? 'Point Purchase' : 'Withdrawal'}
                      </span>
                    </div>
                    <Badge className={getStatusColor(payment.status)}>
                      {getStatusIcon(payment.status)}
                      <span className="ml-1">{getStatusText(payment.status)}</span>
                    </Badge>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{formatCurrency(payment.amount)}</div>
                    <div className="text-sm text-gray-500">{formatDate(payment.updatedAt)}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {payments.length === 0 && (
        <Card className="p-8 text-center">
          <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No payment transactions found</p>
        </Card>
      )}
    </div>
  );
};
