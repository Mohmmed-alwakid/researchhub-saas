import React from 'react';
import { WalletOverview } from './WalletOverview';
import { EnhancedWithdrawalForm } from './EnhancedWithdrawalForm';
import { EnhancedTransactionHistory } from './EnhancedTransactionHistory';
import { WithdrawalHistory } from './WithdrawalHistory';
import { WithdrawalFormData } from './WithdrawalForm';
import { Button } from '../ui/Button';
import { ChevronUp, ChevronDown, RefreshCw } from 'lucide-react';
import { WalletData, Transaction, WithdrawalRequest } from '../../services/wallet.service';

interface MobileWalletProps {
  wallet: WalletData | null;
  transactions: Transaction[];
  withdrawals: WithdrawalRequest[];
  loading: boolean;
  showWithdrawalForm: boolean;
  onRefresh: () => Promise<void>;
  onRequestWithdrawal: () => void;
  onWithdrawalSubmit: (data: WithdrawalFormData) => Promise<void>;
  onWithdrawalCancel: () => void;
}

export const MobileWallet: React.FC<MobileWalletProps> = ({
  wallet,
  transactions,
  withdrawals,
  loading,
  showWithdrawalForm,
  onRefresh,
  onRequestWithdrawal,
  onWithdrawalSubmit,
  onWithdrawalCancel
}) => {
  const [expandedSection, setExpandedSection] = React.useState<'transactions' | 'withdrawals' | null>(null);

  const toggleSection = (section: 'transactions' | 'withdrawals') => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  if (!wallet) {
    return (
      <div className="text-center p-6">
        <p className="text-gray-600">Wallet unavailable</p>
        <Button onClick={onRefresh} className="mt-4" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4">
      {/* Mobile Wallet Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Wallet</h2>
        <Button onClick={onRefresh} variant="outline" size="sm" disabled={loading}>
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {/* Wallet Overview - Mobile Optimized */}
      <div className="mb-6">
        <WalletOverview 
          wallet={wallet}
          onRequestWithdrawal={onRequestWithdrawal}
          loading={loading}
        />
      </div>

      {/* Withdrawal Form - Full Width on Mobile */}
      {showWithdrawalForm && (
        <div className="mb-6">
          <EnhancedWithdrawalForm 
            wallet={wallet}
            onSubmit={onWithdrawalSubmit}
            onCancel={onWithdrawalCancel}
            loading={loading}
          />
        </div>
      )}

      {/* Collapsible Sections for Mobile */}
      <div className="space-y-4">
        {/* Transaction History Section */}
        <div className="border border-gray-200 rounded-lg">
          <button
            onClick={() => toggleSection('transactions')}
            className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-t-lg"
          >
            <span className="font-medium text-gray-900">Transaction History</span>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">
                {transactions.length} transactions
              </span>
              {expandedSection === 'transactions' ? (
                <ChevronUp className="h-5 w-5 text-gray-400" />
              ) : (
                <ChevronDown className="h-5 w-5 text-gray-400" />
              )}
            </div>
          </button>
          
          {expandedSection === 'transactions' && (
            <div className="p-0">
              <EnhancedTransactionHistory 
                transactions={transactions}
                loading={loading}
              />
            </div>
          )}
        </div>

        {/* Withdrawal History Section */}
        <div className="border border-gray-200 rounded-lg">
          <button
            onClick={() => toggleSection('withdrawals')}
            className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-t-lg"
          >
            <span className="font-medium text-gray-900">Withdrawal History</span>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">
                {withdrawals.length} withdrawals
              </span>
              {expandedSection === 'withdrawals' ? (
                <ChevronUp className="h-5 w-5 text-gray-400" />
              ) : (
                <ChevronDown className="h-5 w-5 text-gray-400" />
              )}
            </div>
          </button>
          
          {expandedSection === 'withdrawals' && (
            <div className="p-0">
              <WithdrawalHistory 
                withdrawals={withdrawals}
                loading={loading}
              />
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions - Mobile Optimized */}
      <div className="grid grid-cols-2 gap-3 mt-6">
        <Button 
          onClick={onRequestWithdrawal}
          disabled={loading || wallet.balance < 5}
          className="w-full"
        >
          Request Withdrawal
        </Button>
        <Button 
          onClick={() => toggleSection('transactions')}
          variant="outline"
          className="w-full"
        >
          View Transactions
        </Button>
      </div>
    </div>
  );
};
