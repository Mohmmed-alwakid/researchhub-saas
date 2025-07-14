import React, { useState, useEffect, useCallback } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  DollarSign, 
  Eye, 
  Download,  CreditCard,
  Plus,
  Search,
  Filter,
  Coins
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { Button } from '../ui/Button';
import { useAuthStore } from '../../stores/authStore';
import { getPaymentRequests, getEnhancedFinancialOverview } from '../../services/admin.service';
import AdminPointsManager from './AdminPointsManager';

interface PaymentRequest {
  _id: string;
  userId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  planType: 'basic' | 'pro' | 'enterprise';
  amount: number;
  currency: string;
  status: 'pending' | 'verified' | 'rejected';
  paymentMethod: string;
  paymentProofUrl?: string;
  adminNotes?: string;
  requestedAt: string;
  processedAt?: string;
  processedBy?: {
    _id: string;
    firstName: string;
    lastName: string;
  };
}

interface FinancialOverviewResponse {
  data: {
    totalPayments: number;
    pendingPayments: number;
    completedPayments: number;
    rejectedPayments: number;
    totalRevenue: number;
    monthlyRevenue: number;
  };
}

interface PaymentStats {
  totalRequests: number;
  pendingRequests: number;
  verifiedRequests: number;
  rejectedRequests: number;
  totalRevenue: number;
  thisMonthRevenue: number;
}

const PaymentManagement: React.FC = () => {
  const { token } = useAuthStore();
  const [paymentRequests, setPaymentRequests] = useState<PaymentRequest[]>([]);
  const [stats, setStats] = useState<PaymentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<PaymentRequest | null>(null);
  const [showAddCredits, setShowAddCredits] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'verified' | 'rejected'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'payments' | 'points'>('payments');

  // Form states
  const [verificationNotes, setVerificationNotes] = useState('');
  const [addCreditsForm, setAddCreditsForm] = useState({
    email: '',
    credits: 0,
    planType: 'basic' as 'basic' | 'pro' | 'enterprise',
    expiresAt: ''
  });

  const loadPaymentData = useCallback(async () => {
    setLoading(true);
    try {
      // Use new admin service methods
      const [requestsData, statsData] = await Promise.all([
        getPaymentRequests(),
        getEnhancedFinancialOverview()
      ]);

      if (requestsData) {
        setPaymentRequests(requestsData);
      }

      if (statsData && (statsData as FinancialOverviewResponse).data) {
        // Transform enhanced financial data to match existing interface
        const data = (statsData as FinancialOverviewResponse).data;
        const transformedStats: PaymentStats = {
          totalRequests: data.totalPayments || 0,
          pendingRequests: data.pendingPayments || 0,
          verifiedRequests: data.completedPayments || 0,
          rejectedRequests: data.rejectedPayments || 0,
          totalRevenue: data.totalRevenue || 0,
          thisMonthRevenue: data.monthlyRevenue || 0
        };
        setStats(transformedStats);
      }
    } catch (error) {
      console.error('Error loading payment data:', error);
      toast.error('Failed to load payment data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (token) {
      loadPaymentData();
    }
  }, [loadPaymentData, token]);

  const handleVerifyPayment = async (requestId: string, approve: boolean) => {
    if (!token) {
      toast.error('Authentication required');
      return;
    }

    try {
      const response = await fetch(`/api/admin/payments/requests/${requestId}/${approve ? 'verify' : 'reject'}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          adminNotes: verificationNotes
        })
      });

      if (response.ok) {
        toast.success(`Payment ${approve ? 'verified' : 'rejected'} successfully`);
        setSelectedRequest(null);
        setVerificationNotes('');
        loadPaymentData();
      } else {
        throw new Error('Failed to process payment verification');
      }
    } catch (error) {
      console.error('Error verifying payment:', error);
      toast.error('Failed to process payment verification');
    }
  };

  const handleAddCredits = async () => {
    if (!token) {
      toast.error('Authentication required');
      return;
    }

    try {
      const response = await fetch('/api/admin/payments/credits/add', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(addCreditsForm)
      });

      if (response.ok) {
        toast.success('Credits added successfully');
        setShowAddCredits(false);
        setAddCreditsForm({
          email: '',
          credits: 0,
          planType: 'basic',
          expiresAt: ''
        });
        loadPaymentData();
      } else {
        throw new Error('Failed to add credits');
      }
    } catch (error) {
      console.error('Error adding credits:', error);
      toast.error('Failed to add credits');
    }
  };

  const filteredRequests = paymentRequests.filter(request => {
    const matchesFilter = filter === 'all' || request.status === filter;
    const matchesSearch = searchTerm === '' || 
      request.userId.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.userId.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.userId.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase()
    }).format(amount);
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
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'verified':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'verified':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Payment & Points Management</h2>
          <p className="text-gray-600">Manage payments, credits, and user points</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('payments')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'payments'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              Payment Requests
            </div>
          </button>
          <button
            onClick={() => setActiveTab('points')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'points'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <Coins className="w-4 h-4" />
              Points Management
            </div>
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'payments' && (
        <div className="space-y-6">
          {/* Add Credits Button */}
          <div className="flex justify-end">
            <Button
              onClick={() => setShowAddCredits(true)}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Credits
            </Button>
          </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Requests</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalRequests}</p>
                </div>
                <CreditCard className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pending Requests</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.pendingRequests}</p>
                </div>
                <Clock className="w-8 h-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(stats.totalRevenue, 'USD')}
                  </p>
                </div>
                <DollarSign className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as 'all' | 'pending' | 'verified' | 'rejected')}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Requests</option>
                <option value="pending">Pending</option>
                <option value="verified">Verified</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Requests Table */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Payment Requests</h3>
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
                    Plan & Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Requested At
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRequests.map((request) => (
                  <tr key={request._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {request.userId.firstName} {request.userId.lastName}
                        </div>
                        <div className="text-sm text-gray-500">{request.userId.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900 capitalize">
                          {request.planType} Plan
                        </div>
                        <div className="text-sm text-gray-500">
                          {formatCurrency(request.amount, request.currency)}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                        {getStatusIcon(request.status)}
                        {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(request.requestedAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => setSelectedRequest(request)}
                        className="text-blue-600 hover:text-blue-900 flex items-center gap-1"
                      >
                        <Eye className="w-4 h-4" />
                        Review
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredRequests.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No payment requests found</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Review Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-screen overflow-y-auto">
            <CardHeader>
              <h3 className="text-lg font-semibold">Review Payment Request</h3>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">User</label>
                  <p className="text-sm text-gray-900">
                    {selectedRequest.userId.firstName} {selectedRequest.userId.lastName}
                  </p>
                  <p className="text-sm text-gray-500">{selectedRequest.userId.email}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Plan & Amount</label>
                  <p className="text-sm text-gray-900 capitalize">{selectedRequest.planType} Plan</p>
                  <p className="text-sm text-gray-500">
                    {formatCurrency(selectedRequest.amount, selectedRequest.currency)}
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Payment Method</label>
                  <p className="text-sm text-gray-900">{selectedRequest.paymentMethod}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Requested At</label>
                  <p className="text-sm text-gray-900">{formatDate(selectedRequest.requestedAt)}</p>
                </div>
              </div>

              {selectedRequest.paymentProofUrl && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Payment Proof</label>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(selectedRequest.paymentProofUrl, '_blank')}
                      className="flex items-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      View Proof
                    </Button>
                  </div>
                </div>
              )}

              {selectedRequest.status === 'pending' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Admin Notes</label>
                  <textarea
                    value={verificationNotes}
                    onChange={(e) => setVerificationNotes(e.target.value)}
                    placeholder="Add notes about the verification..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}

              {selectedRequest.adminNotes && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Previous Notes</label>
                  <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">{selectedRequest.adminNotes}</p>
                </div>
              )}

              <div className="flex gap-2 pt-4">
                {selectedRequest.status === 'pending' && (
                  <>
                    <Button
                      onClick={() => handleVerifyPayment(selectedRequest._id, true)}
                      className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Verify & Approve
                    </Button>
                    <Button
                      onClick={() => handleVerifyPayment(selectedRequest._id, false)}
                      variant="outline"
                      className="flex items-center gap-2 text-red-600 border-red-600 hover:bg-red-50"
                    >
                      <XCircle className="w-4 h-4" />
                      Reject
                    </Button>
                  </>
                )}
                
                <Button
                  onClick={() => setSelectedRequest(null)}
                  variant="outline"
                  className="ml-auto"
                >
                  Close
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Add Credits Modal */}
      {showAddCredits && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <h3 className="text-lg font-semibold">Add Credits Manually</h3>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">User Email</label>
                <input
                  type="email"
                  value={addCreditsForm.email}
                  onChange={(e) => setAddCreditsForm({ ...addCreditsForm, email: e.target.value })}
                  placeholder="user@example.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Credits</label>
                <input
                  type="number"
                  value={addCreditsForm.credits}
                  onChange={(e) => setAddCreditsForm({ ...addCreditsForm, credits: Number(e.target.value) })}
                  placeholder="100"
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Plan Type</label>
                <select
                  value={addCreditsForm.planType}
                  onChange={(e) => setAddCreditsForm({ ...addCreditsForm, planType: e.target.value as 'basic' | 'pro' | 'enterprise' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="basic">Basic</option>
                  <option value="pro">Pro</option>
                  <option value="enterprise">Enterprise</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Expires At (Optional)</label>
                <input
                  type="date"
                  value={addCreditsForm.expiresAt}
                  onChange={(e) => setAddCreditsForm({ ...addCreditsForm, expiresAt: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  onClick={handleAddCredits}
                  className="flex-1"
                  disabled={!addCreditsForm.email || addCreditsForm.credits <= 0}
                >
                  Add Credits
                </Button>
                <Button
                  onClick={() => setShowAddCredits(false)}
                  variant="outline"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
        </div>
      )}

      {/* Points Management Tab */}
      {activeTab === 'points' && (
        <AdminPointsManager />
      )}
    </div>
  );
};

export default PaymentManagement;
