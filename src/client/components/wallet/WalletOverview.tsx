import React from 'react';
import { TrendingUp, TrendingDown, Wallet, Eye, EyeOff } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { formatCurrency, SupportedCurrency } from '../../services/wallet.service';


interface WalletData {
  balance: number;
  total_earned: number;
  total_withdrawn: number;
  currency: SupportedCurrency;
}

interface WalletOverviewProps {
  wallet: WalletData;
  loading?: boolean;
  showBalance?: boolean;
  onToggleBalance?: () => void;
  onRequestWithdrawal?: () => void;
  onRefresh?: () => Promise<void>;
}

export const WalletOverview: React.FC<WalletOverviewProps> = ({
  wallet,
  loading = false,
  showBalance = true,
  onToggleBalance,
  onRequestWithdrawal
}) => {
  const formatWalletCurrency = (amount: number) => {
    return formatCurrency(amount, wallet.currency || 'USD');
  };

  const balanceDisplay = showBalance ? formatWalletCurrency(wallet.balance) : '••••';
  const canWithdraw = wallet.balance >= 5.00; // Minimum withdrawal amount

  if (loading) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="h-16 bg-gray-200 rounded"></div>
              <div className="h-16 bg-gray-200 rounded"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 border-blue-200">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wallet className="h-5 w-5 text-blue-600" />
            <span>Wallet Balance</span>
          </div>
          {onToggleBalance && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleBalance}
              className="p-1 h-8 w-8"
            >
              {showBalance ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-6">
          {/* Current Balance */}
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900 mb-2">
              {balanceDisplay}
            </div>
            <Badge 
              variant={canWithdraw ? "success" : "secondary"}
              className="mb-4"
            >
              {canWithdraw ? "Ready for withdrawal" : "Below minimum ($5.00)"}
            </Badge>
            
            {onRequestWithdrawal && (
              <Button
                onClick={onRequestWithdrawal}
                disabled={!canWithdraw}
                className="w-full"
                variant={canWithdraw ? "primary" : "secondary"}
              >
                Request Withdrawal
              </Button>
            )}
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-lg p-4 border border-green-200">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-gray-600">Total Earned</span>
              </div>
              <div className="text-xl font-semibold text-gray-900">
                {showBalance ? formatWalletCurrency(wallet.total_earned) : '••••'}
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 border border-purple-200">
              <div className="flex items-center gap-2 mb-2">
                <TrendingDown className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-medium text-gray-600">Total Withdrawn</span>
              </div>
              <div className="text-xl font-semibold text-gray-900">
                {showBalance ? formatWalletCurrency(wallet.total_withdrawn) : '••••'}
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-white rounded-lg p-4 border border-blue-200">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Available for withdrawal:</span>
              <span className="font-semibold text-gray-900">
                {showBalance ? formatWalletCurrency(Math.max(0, wallet.balance - 0)) : '••••'}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
