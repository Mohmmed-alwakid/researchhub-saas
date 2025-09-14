import React, { useState, useEffect } from 'react';

/**
 * Participant Earnings Dashboard Component
 * 
 * Features:
 * - Current earnings balance display
 * - Withdrawal request system
 * - Earnings history from completed studies
 * - Payout method management
 * - Withdrawal status tracking
 */

interface ParticipantEarnings {
  totalEarned: number;
  totalWithdrawn: number;
  totalFees: number;
  currentBalance: number;
  availableForWithdrawal: boolean;
  minimumWithdrawal: number;
  conversionRate: number;
  estimatedCashValue: number;
}

interface WithdrawalRequest {
  id: string;
  amount: number;
  fee: number;
  netAmount: number;
  cashValue: number;
  payoutMethod: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  requestedAt: string;
  processedAt?: string;
}

const ParticipantEarningsDashboard: React.FC = () => {
  const [earnings, setEarnings] = useState<ParticipantEarnings | null>(null);
  const [withdrawalRequests, setWithdrawalRequests] = useState<WithdrawalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Withdrawal form state
  const [withdrawalForm, setWithdrawalForm] = useState({
    amount: 50,
    payoutMethod: 'paypal',
    payoutDetails: {
      email: '',
      accountNumber: '',
      routingNumber: ''
    }
  });

  // Fetch earnings data
  useEffect(() => {
    const fetchEarningsData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('authToken');
        
        const response = await fetch('/api/points?action=participant-earnings', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        const data = await response.json();
        if (data.success) {
          setEarnings(data.data.earnings);
          // Get withdrawal requests from recent transactions
          const withdrawals = data.data.recentTransactions
            .filter((tx: any) => tx.type === 'withdrawal')
            .map((tx: any) => ({
              id: tx.id,
              amount: tx.amount,
              fee: 0, // Would be calculated
              netAmount: tx.amount * 0.975, // 2.5% fee
              cashValue: tx.amount * 0.10 * 0.975,
              payoutMethod: 'paypal',
              status: 'completed',
              requestedAt: tx.timestamp
            }));
          setWithdrawalRequests(withdrawals);
        } else {
          setError(data.error);
        }
      } catch (err) {
        setError('Failed to fetch earnings data');
        console.error('Earnings fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchEarningsData();
  }, []);

  // Submit withdrawal request
  const submitWithdrawal = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/points?action=request-withdrawal', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amount: withdrawalForm.amount,
          payoutMethod: withdrawalForm.payoutMethod,
          payoutDetails: withdrawalForm.payoutDetails
        })
      });
      
      const data = await response.json();
      if (data.success) {
        // Refresh data
        window.location.reload();
      } else {
        setError(data.error);
      }
    } catch {
      setError('Failed to submit withdrawal request');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">Your Earnings</h1>
        <p className="text-gray-600">Manage your study participation rewards</p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-red-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      )}

      {earnings && (
        <>
          {/* Earnings Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Current Balance</p>
                  <p className="text-2xl font-bold text-green-600">{earnings.currentBalance} points</p>
                  <p className="text-sm text-gray-500">${earnings.estimatedCashValue.toFixed(2)} USD</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Earned</p>
                  <p className="text-2xl font-bold text-blue-600">{earnings.totalEarned} points</p>
                  <p className="text-sm text-gray-500">${(earnings.totalEarned * earnings.conversionRate).toFixed(2)} USD</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Withdrawn</p>
                  <p className="text-2xl font-bold text-purple-600">{earnings.totalWithdrawn} points</p>
                  <p className="text-sm text-gray-500">${(earnings.totalWithdrawn * earnings.conversionRate).toFixed(2)} USD</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 0l-3-3m3 3l-3 3m-3 4h6m0 0l-3-3m3 3l-3 3" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Fees</p>
                  <p className="text-2xl font-bold text-orange-600">{earnings.totalFees} points</p>
                  <p className="text-sm text-gray-500">${(earnings.totalFees * earnings.conversionRate).toFixed(2)} USD</p>
                </div>
              </div>
            </div>
          </div>

          {/* Withdrawal Section */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Request Withdrawal</h2>
              <p className="text-gray-600">Minimum withdrawal: {earnings.minimumWithdrawal} points (${(earnings.minimumWithdrawal * earnings.conversionRate).toFixed(2)} USD)</p>
            </div>
            
            <div className="p-6">
              {earnings.availableForWithdrawal ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Withdrawal Amount (Points)
                      </label>
                      <input
                        type="number"
                        min={earnings.minimumWithdrawal}
                        max={earnings.currentBalance}
                        value={withdrawalForm.amount}
                        onChange={(e) => setWithdrawalForm(prev => ({ 
                          ...prev, 
                          amount: parseInt(e.target.value) || earnings.minimumWithdrawal 
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        ≈ ${(withdrawalForm.amount * earnings.conversionRate * 0.975).toFixed(2)} USD (after 2.5% fee)
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Payout Method
                      </label>
                      <select
                        value={withdrawalForm.payoutMethod}
                        onChange={(e) => setWithdrawalForm(prev => ({ ...prev, payoutMethod: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      >
                        <option value="paypal">PayPal</option>
                        <option value="bank_transfer">Bank Transfer</option>
                        <option value="gift_card">Gift Card</option>
                      </select>
                    </div>
                  </div>

                  {withdrawalForm.payoutMethod === 'paypal' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        PayPal Email
                      </label>
                      <input
                        type="email"
                        value={withdrawalForm.payoutDetails.email}
                        onChange={(e) => setWithdrawalForm(prev => ({ 
                          ...prev, 
                          payoutDetails: { ...prev.payoutDetails, email: e.target.value }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="your-paypal@email.com"
                      />
                    </div>
                  )}

                  {withdrawalForm.payoutMethod === 'bank_transfer' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Account Number
                        </label>
                        <input
                          type="text"
                          value={withdrawalForm.payoutDetails.accountNumber}
                          onChange={(e) => setWithdrawalForm(prev => ({ 
                            ...prev, 
                            payoutDetails: { ...prev.payoutDetails, accountNumber: e.target.value }
                          }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Routing Number
                        </label>
                        <input
                          type="text"
                          value={withdrawalForm.payoutDetails.routingNumber}
                          onChange={(e) => setWithdrawalForm(prev => ({ 
                            ...prev, 
                            payoutDetails: { ...prev.payoutDetails, routingNumber: e.target.value }
                          }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                      </div>
                    </div>
                  )}

                  <button
                    onClick={submitWithdrawal}
                    disabled={withdrawalForm.amount < earnings.minimumWithdrawal || withdrawalForm.amount > earnings.currentBalance}
                    className="w-full bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
                  >
                    Request Withdrawal
                  </button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Not enough points for withdrawal</h3>
                  <p className="text-gray-600">
                    You need at least {earnings.minimumWithdrawal} points to request a withdrawal.
                    <br />
                    Current balance: {earnings.currentBalance} points
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Withdrawal History */}
          {withdrawalRequests.length > 0 && (
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Withdrawal History</h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {withdrawalRequests.map((request) => (
                    <div key={request.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                            <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                            </svg>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {request.amount} points → ${request.cashValue.toFixed(2)} USD
                          </p>
                          <p className="text-sm text-gray-500">
                            {new Date(request.requestedAt).toLocaleDateString()} via {request.payoutMethod}
                          </p>
                        </div>
                      </div>
                      <div className="flex-shrink-0">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                          {request.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ParticipantEarningsDashboard;
