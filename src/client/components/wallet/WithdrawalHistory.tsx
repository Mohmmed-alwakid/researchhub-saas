import React from 'react';
import { Clock, CheckCircle, XCircle, AlertCircle, Eye, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { formatCurrency, SupportedCurrency } from '../../services/wallet.service';

interface WithdrawalRequest {
  id: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  payment_method: string;
  payment_details: {
    email?: string;
    account_number?: string;
    routing_number?: string;
    bank_name?: string;
    wallet_address?: string;
  };
  admin_notes?: string;
  requested_at: string;
  processed_at?: string;
  currency?: SupportedCurrency;
}

interface WithdrawalHistoryProps {
  withdrawals: WithdrawalRequest[];
  loading?: boolean;
  currency?: SupportedCurrency;
  onViewDetails?: (withdrawal: WithdrawalRequest) => void;
}

export const WithdrawalHistory: React.FC<WithdrawalHistoryProps> = ({
  withdrawals,
  loading = false,
  currency = 'USD',
  onViewDetails
}) => {
  const formatWithdrawalCurrency = (amount: string | number) => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return formatCurrency(numAmount, currency);
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: 'warning' as const,
      approved: 'success' as const,
      rejected: 'error' as const
    };
    
    return (
      <Badge variant={variants[status as keyof typeof variants] || 'secondary'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getPaymentMethodDisplay = (method: string) => {
    const methods: Record<string, string> = {
      paypal: 'PayPal',
      bank_transfer: 'Bank Transfer',
      crypto: 'Cryptocurrency'
    };
    return methods[method] || method;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Withdrawal History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                  </div>
                  <div className="h-6 bg-gray-200 rounded w-20"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (withdrawals.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Withdrawal History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No withdrawals yet</h3>
            <p className="text-gray-600">
              Your withdrawal requests will appear here once you make them.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Withdrawal History</span>
          <Badge variant="secondary">{withdrawals.length} request{withdrawals.length !== 1 ? 's' : ''}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {withdrawals.map((withdrawal) => (
            <div
              key={withdrawal.id}
              className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    {getStatusIcon(withdrawal.status)}
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-lg">
                        {formatWithdrawalCurrency(withdrawal.amount)}
                      </span>
                      {getStatusBadge(withdrawal.status)}
                    </div>
                  </div>
                  
                  <div className="space-y-1 text-sm text-gray-600">
                    <div className="flex items-center gap-4">
                      <span>
                        <strong>Method:</strong> {getPaymentMethodDisplay(withdrawal.payment_method)}
                      </span>
                      <span>
                        <strong>Requested:</strong> {formatDate(withdrawal.requested_at)}
                      </span>
                    </div>
                    
                    {withdrawal.processed_at && (
                      <div>
                        <strong>Processed:</strong> {formatDate(withdrawal.processed_at)}
                      </div>
                    )}
                    
                    {withdrawal.payment_method === 'paypal' && withdrawal.payment_details?.email && (
                      <div>
                        <strong>PayPal:</strong> {withdrawal.payment_details.email}
                      </div>
                    )}
                    
                    {withdrawal.admin_notes && (
                      <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
                        <strong>Admin Notes:</strong> {withdrawal.admin_notes}
                      </div>
                    )}
                  </div>
                </div>
                
                {onViewDetails && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onViewDetails(withdrawal)}
                    className="ml-4"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                )}
              </div>
              
              {/* Status-specific information */}
              {withdrawal.status === 'pending' && (
                <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center gap-2 text-yellow-800">
                    <Clock className="h-4 w-4" />
                    <span className="text-sm font-medium">
                      Your withdrawal request is being reviewed by our team
                    </span>
                  </div>
                </div>
              )}
              
              {withdrawal.status === 'approved' && (
                <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2 text-green-800">
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-sm font-medium">
                      Withdrawal approved and processed
                    </span>
                  </div>
                </div>
              )}
              
              {withdrawal.status === 'rejected' && (
                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center gap-2 text-red-800">
                    <XCircle className="h-4 w-4" />
                    <span className="text-sm font-medium">
                      Withdrawal request was rejected
                    </span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
