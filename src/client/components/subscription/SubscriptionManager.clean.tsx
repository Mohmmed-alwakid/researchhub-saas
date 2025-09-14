import React, { useState, useEffect } from 'react';
import { 
  Coins, 
  AlertCircle,
  Plus,
  Minus,
  History,
  CreditCard
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
      toast.error('Failed to load points data');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Points Balance */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold flex items-center">
            <Coins className="w-5 h-5 mr-2 text-yellow-600" />
            Points Balance
          </h3>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <div className="text-3xl font-bold text-gray-900">
              {balance?.available || 0}
            </div>
            <p className="text-sm text-gray-600 mt-1">Available Points</p>
            {balance && balance.pending > 0 && (
              <p className="text-sm text-yellow-600 mt-1">
                {balance.pending} points pending
              </p>
            )}
          </div>
          
          {/* Usage Stats */}
          {usageStats && (
            <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t">
              <div className="text-center">
                <div className="text-lg font-semibold text-gray-900">
                  {usageStats.studiesCreated}
                </div>
                <p className="text-sm text-gray-600">Studies Created</p>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-gray-900">
                  {usageStats.totalSpent}
                </div>
                <p className="text-sm text-gray-600">Points Spent</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold flex items-center">
              <History className="w-5 h-5 mr-2 text-blue-600" />
              Recent Transactions
            </h3>
            <Button
              onClick={() => setShowTransactions(!showTransactions)}
              variant="ghost"
              size="sm"
            >
              {showTransactions ? 'Hide' : 'Show All'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No transactions yet</p>
          ) : (
            <div className="space-y-3">
              {(showTransactions ? transactions : transactions.slice(0, 5)).map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      transaction.type === 'credit' 
                        ? 'bg-green-100 text-green-600' 
                        : 'bg-red-100 text-red-600'
                    }`}>
                      {transaction.type === 'credit' ? <Plus className="w-4 h-4" /> : <Minus className="w-4 h-4" />}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{transaction.description}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(transaction.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className={`font-semibold ${
                    transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {transaction.type === 'credit' ? '+' : '-'}{transaction.amount}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Points Information */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold flex items-center">
            <AlertCircle className="w-5 h-5 mr-2 text-gray-600" />
            About Points
          </h3>
        </CardHeader>
        <CardContent>
          <div className="bg-blue-50 p-4 rounded-lg">
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Points are assigned by system administrators</li>
              <li>• Use points to create studies and recruit participants</li>
              <li>• Different study types have different point costs</li>
              <li>• Contact your admin if you need more points</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Simple SubscriptionManager component
interface SubscriptionManagerProps {
  onUpdate?: () => void;
}

export const SubscriptionManager: React.FC<SubscriptionManagerProps> = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Subscription Management</h3>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <CreditCard className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">
              Subscription Management Coming Soon
            </h4>
            <p className="text-gray-600">
              Advanced subscription features will be available in a future update.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SubscriptionManager;
