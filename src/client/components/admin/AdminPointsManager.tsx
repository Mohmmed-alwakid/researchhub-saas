import React, { useState, useEffect } from 'react';
import { 
  Coins, 
  TrendingUp, 
  Users, 
  Plus, 
  AlertCircle,
  XCircle,
  Crown,
  Search
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { pointsService, type PointsBalance, type PointsTransaction } from '../../services/payment.service';
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader } from '../ui/Card';

interface UserBalance extends PointsBalance {
  user: {
    first_name: string;
    last_name: string;
    email: string;
    role: string;
  };
}

interface UserTransaction extends PointsTransaction {
  user: {
    first_name: string;
    last_name: string;
    email: string;
  };
}

const AdminPointsManager: React.FC = () => {
  const [balances, setBalances] = useState<UserBalance[]>([]);
  const [transactions, setTransactions] = useState<UserTransaction[]>([]);
  const [activeTab, setActiveTab] = useState<'balances' | 'transactions' | 'assign'>('balances');
  const [loading, setLoading] = useState(true);
  const [assignPoints, setAssignPoints] = useState({
    userId: '',
    amount: 0,
    reason: ''
  });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchBalances();
    fetchTransactions();
  }, []);

  const fetchBalances = async () => {
    try {
      setLoading(true);
      const response = await pointsService.getAllBalances();
      if (response.success) {
        setBalances(response.balances);
      }
    } catch (error) {
      console.error('Error fetching balances:', error);
      toast.error('Failed to fetch user balances');
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async () => {
    try {
      const response = await pointsService.getAllTransactions(100);
      if (response.success) {
        setTransactions(response.transactions);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast.error('Failed to fetch transactions');
    }
  };

  const handleAssignPoints = async () => {
    if (!assignPoints.userId || assignPoints.amount === 0 || !assignPoints.reason) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      const response = await pointsService.assignPoints(
        assignPoints.userId,
        assignPoints.amount,
        assignPoints.reason
      );

      if (response.success) {
        toast.success('Points assigned successfully');
        setAssignPoints({ userId: '', amount: 0, reason: '' });
        fetchBalances();
        fetchTransactions();
      } else {
        toast.error('Failed to assign points');
      }
    } catch (error) {
      console.error('Error assigning points:', error);
      toast.error('Failed to assign points');
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
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'admin_assigned':
        return <Crown className="w-4 h-4 text-blue-600" />;
      case 'admin_deducted':
        return <AlertCircle className="w-4 h-4 text-orange-600" />;
      default:
        return <Coins className="w-4 h-4 text-gray-600" />;
    }
  };

  const filteredBalances = balances.filter(balance =>
    balance.user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    balance.user.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    balance.user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredTransactions = transactions.filter(transaction =>
    transaction.user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.user.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.reason.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPoints = balances.reduce((sum, balance) => sum + balance.currentBalance, 0);
  const totalUsers = balances.length;
  const averageBalance = totalUsers > 0 ? Math.round(totalPoints / totalUsers) : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg mr-4">
                <Coins className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Points</p>
                <p className="text-2xl font-bold text-gray-900">{totalPoints.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg mr-4">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Active Users</p>
                <p className="text-2xl font-bold text-gray-900">{totalUsers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg mr-4">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Balance</p>
                <p className="text-2xl font-bold text-gray-900">{averageBalance}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'balances', label: 'User Balances' },
            { id: 'transactions', label: 'Transactions' },
            { id: 'assign', label: 'Assign Points' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as 'balances' | 'transactions' | 'assign')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Search Bar */}
      {(activeTab === 'balances' || activeTab === 'transactions') && (
        <div className="flex items-center space-x-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      )}

      {/* Content based on active tab */}
      {activeTab === 'balances' && (
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">User Point Balances</h3>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Current Balance
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Earned
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Spent
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredBalances.map((balance) => (
                    <tr key={balance.userId}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {balance.user.first_name} {balance.user.last_name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {balance.user.email}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          balance.user.role === 'admin' 
                            ? 'bg-purple-100 text-purple-800'
                            : balance.user.role === 'researcher'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {balance.user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-blue-600">
                        {balance.currentBalance.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                        {balance.totalEarned.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                        {balance.totalSpent.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setAssignPoints({
                              userId: balance.userId,
                              amount: 0,
                              reason: ''
                            });
                          }}
                        >
                          Assign Points
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'transactions' && (
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Recent Transactions</h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filteredTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    {getTransactionIcon(transaction.type)}
                    <div>
                      <div className="font-medium text-sm">
                        {transaction.user.first_name} {transaction.user.last_name}
                      </div>
                      <div className="text-sm text-gray-600">
                        {transaction.reason}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatDate(transaction.timestamp)}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`font-bold text-sm ${
                      transaction.type === 'earned' || transaction.type === 'admin_assigned'
                        ? 'text-green-600'
                        : 'text-red-600'
                    }`}>
                      {transaction.type === 'earned' || transaction.type === 'admin_assigned' ? '+' : '-'}
                      {Math.abs(transaction.amount).toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500 capitalize">
                      {transaction.type.replace('_', ' ')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'assign' && (
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Assign Points to User</h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-w-md">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select User
                </label>
                <select
                  value={assignPoints.userId}
                  onChange={(e) => setAssignPoints({ ...assignPoints, userId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select a user...</option>
                  {balances.map((balance) => (
                    <option key={balance.userId} value={balance.userId}>
                      {balance.user.first_name} {balance.user.last_name} ({balance.user.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Points Amount
                </label>
                <input
                  type="number"
                  value={assignPoints.amount || ''}
                  onChange={(e) => setAssignPoints({ ...assignPoints, amount: Number(e.target.value) })}
                  placeholder="Enter points amount"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason
                </label>
                <input
                  type="text"
                  value={assignPoints.reason}
                  onChange={(e) => setAssignPoints({ ...assignPoints, reason: e.target.value })}
                  placeholder="Reason for assigning points"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <Button
                onClick={handleAssignPoints}
                className="w-full"
                disabled={!assignPoints.userId || assignPoints.amount === 0 || !assignPoints.reason}
              >
                Assign Points
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminPointsManager;
