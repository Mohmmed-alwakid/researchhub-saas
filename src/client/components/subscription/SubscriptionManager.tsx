import React, { useState, useEffect } from 'react';
import { 
  Coins, 
  Check, 
  Download,
  AlertCircle,
  Crown,
  Zap,
  Sparkles,
  Plus,
  Minus,
  History
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { pointsService, type PointsBalance, type PointsTransaction, type PointsUsageStats } from '../../services/payment.service';
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader } from '../ui/Card';

interface PointsManagerProps {
  onUpdate?: () => void;
}

export const PointsManager: React.FC<PointsManagerProps> = () => {
  const [balance, setBalance] = useState<PointsBalance | null>(null);
  const [transactions, setTransactions] = useState<PointsTransaction[]>([]);
  const [usageStats, setUsageStats] = useState<PointsUsageStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showTransactions, setShowTransactions] = useState(false);

  useEffect(() => {
    loadPointsData();
  }, []);

  const loadPointsData = async () => {
    try {
      setIsLoading(true);
      const [balanceResponse, transactionsResponse, statsResponse] = await Promise.all([
        pointsService.getBalance(),
        pointsService.getTransactions(20),
        pointsService.getUsageStats()
      ]);

      if (balanceResponse.success) {
        setBalance(balanceResponse.balance);
      }

      if (transactionsResponse.success) {
        setTransactions(transactionsResponse.transactions);
      }

      if (statsResponse.success) {
        setUsageStats(statsResponse.stats);
      }
    } catch (error) {
      console.error('Error loading points data:', error);
      toast.error('Failed to load points information');
    } finally {
      setIsLoading(false);
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

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'earned':
        return <Plus className="w-4 h-4 text-green-600" />;
      case 'spent':
        return <Minus className="w-4 h-4 text-red-600" />;
      case 'admin_assigned':
        return <Crown className="w-4 h-4 text-blue-600" />;
      case 'admin_deducted':
        return <AlertCircle className="w-4 h-4 text-orange-600" />;
      default:
        return <Coins className="w-4 h-4 text-gray-600" />;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'earned':
      case 'admin_assigned':
        return 'text-green-600';
      case 'spent':
      case 'admin_deducted':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Points Balance Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Coins className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-semibold">Research Points</h2>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowTransactions(!showTransactions)}
              className="flex items-center space-x-2"
            >
              <History className="w-4 h-4" />
              <span>History</span>
            </Button>
          </div>
          <p className="text-sm text-gray-600">
            Points are used to create studies and recruit participants. Contact your admin to get more points.
          </p>
        </CardHeader>
        
        <CardContent>
          {balance ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Current Balance */}
              <div className="text-center p-6 bg-blue-50 rounded-lg">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {balance.currentBalance.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">Current Balance</div>
              </div>

              {/* Total Earned */}
              <div className="text-center p-6 bg-green-50 rounded-lg">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {balance.totalEarned.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">Total Earned</div>
              </div>

              {/* Total Spent */}
              <div className="text-center p-6 bg-gray-50 rounded-lg">
                <div className="text-3xl font-bold text-gray-600 mb-2">
                  {balance.totalSpent.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">Total Spent</div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No points data available</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Usage Statistics */}
      {usageStats && (
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Usage Statistics</h3>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 mb-1">
                  {usageStats.studiesCreated}
                </div>
                <div className="text-sm text-gray-600">Studies Created</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600 mb-1">
                  {usageStats.pointsSpent.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">Points Spent</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 mb-1">
                  {usageStats.pointsEarned.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">Points Earned</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600 mb-1">
                  {Math.round(usageStats.averageCostPerStudy)}
                </div>
                <div className="text-sm text-gray-600">Avg Cost/Study</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Transaction History */}
      {showTransactions && (
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Recent Transactions</h3>
          </CardHeader>
          <CardContent>
            {transactions.length > 0 ? (
              <div className="space-y-3">
                {transactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      {getTransactionIcon(transaction.type)}
                      <div>
                        <div className="font-medium text-sm">
                          {transaction.reason}
                        </div>
                        <div className="text-xs text-gray-500">
                          {formatDate(transaction.timestamp)}
                        </div>
                        {transaction.description && (
                          <div className="text-xs text-gray-400 mt-1">
                            {transaction.description}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className={`font-bold ${getTransactionColor(transaction.type)}`}>
                      {transaction.type === 'earned' || transaction.type === 'admin_assigned' ? '+' : '-'}
                      {Math.abs(transaction.amount).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <History className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No transactions yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Information Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-sm mb-1">How Points Work</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Points are assigned by system administrators</li>
                <li>• Use points to create studies and recruit participants</li>
                <li>• Different study types have different point costs</li>
                <li>• Contact your admin if you need more points</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PointsManager;
        loadSubscriptionData();
      }
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      toast.error('Failed to cancel subscription');
    }
  };

  const handleDownloadInvoice = async (invoiceId: string) => {
    try {
      const response = await paymentService.downloadInvoice(invoiceId);
      if (response.success) {
        window.open(response.url, '_blank');
      }
    } catch (error) {
      console.error('Error downloading invoice:', error);
      toast.error('Failed to download invoice');
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price / 100);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };
  const getPlanIcon = (planName: string) => {
    const name = planName.toLowerCase();
    if (name.includes('pro') || name.includes('premium')) {
      return <Crown className="w-5 h-5" />;
    }
    if (name.includes('enterprise')) {
      return <Sparkles className="w-5 h-5" />;
    }
    return <Zap className="w-5 h-5" />;
  };
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Current Subscription */}
      {currentSubscription && (
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Current Subscription</h3>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-10 h-10 bg-indigo-100 rounded-lg">
                  {getPlanIcon(currentSubscription.plan.name)}
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{currentSubscription.plan.name}</h4>
                  <p className="text-sm text-gray-500">
                    {formatPrice(currentSubscription.plan.price)} / {currentSubscription.plan.interval}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Next billing date</p>
                <p className="font-medium">{formatDate(currentSubscription.currentPeriodEnd)}</p>
              </div>
            </div>

            <div className="mt-4 flex items-center space-x-3">
              <Button onClick={handleManageBilling} variant="outline">
                <CreditCard className="w-4 h-4 mr-2" />
                Manage Billing
              </Button>
              {currentSubscription.status === 'active' && !currentSubscription.cancelAtPeriodEnd && (
                <Button onClick={handleCancelSubscription} variant="outline" className="text-red-600 hover:text-red-700">
                  Cancel Subscription
                </Button>
              )}
            </div>

            {currentSubscription.cancelAtPeriodEnd && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mr-2" />
                  <span className="text-sm text-yellow-800">
                    Your subscription will be cancelled on {formatDate(currentSubscription.currentPeriodEnd)}
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Available Plans */}
      <div>
        <h3 className="text-lg font-semibold mb-6">
          {currentSubscription ? 'Upgrade Your Plan' : 'Choose Your Plan'}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => {
            const isCurrentPlan = currentSubscription?.plan.id === plan.id;
            
            return (
              <Card 
                key={plan.id} 
                className={`relative ${plan.popular ? 'ring-2 ring-indigo-600' : ''} ${isCurrentPlan ? 'bg-gray-50' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-indigo-600 text-white px-3 py-1 text-xs font-medium rounded-full">
                      Most Popular
                    </span>
                  </div>
                )}
                
                <CardContent className="p-6">
                  <div className="text-center">
                    <div className="flex items-center justify-center w-12 h-12 bg-indigo-100 rounded-xl mx-auto mb-4">
                      {getPlanIcon(plan.name)}
                    </div>
                    <h4 className="text-xl font-semibold text-gray-900 mb-2">{plan.name}</h4>
                    <p className="text-gray-600 mb-4">{plan.description}</p>
                    <div className="mb-6">
                      <span className="text-4xl font-bold text-gray-900">{formatPrice(plan.price)}</span>
                      <span className="text-gray-500">/{plan.interval}</span>
                    </div>
                  </div>

                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center">
                        <Check className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
                        <span className="text-sm text-gray-600">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    onClick={() => handleUpgrade(plan)}
                    disabled={isCurrentPlan || upgradeLoading === plan.id}
                    isLoading={upgradeLoading === plan.id}
                    className="w-full"
                    variant={plan.popular ? 'primary' : 'outline'}
                  >
                    {isCurrentPlan ? 'Current Plan' : 'Upgrade to ' + plan.name}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Recent Invoices */}
      {invoices.length > 0 && (
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Recent Invoices</h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {invoices.slice(0, 5).map((invoice) => (
                <div key={invoice.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-8 h-8 bg-gray-100 rounded-lg">
                      <CreditCard className="w-4 h-4 text-gray-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Invoice #{invoice.number}</p>
                      <p className="text-sm text-gray-500">{formatDate(invoice.created)}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="font-medium">{formatPrice(invoice.amount)}</span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      invoice.status === 'paid' 
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {invoice.status}
                    </span>
                    <Button
                      onClick={() => handleDownloadInvoice(invoice.id)}
                      variant="ghost"
                      size="sm"
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SubscriptionManager;
