import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  DollarSign, 
  User, 
  Calendar, 
  AlertCircle,
  Eye,
  Loader2,
  Filter
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { getWithdrawalRequests, processWithdrawal } from '../../services/admin.service';

interface WithdrawalRequest {
  _id: string;
  userId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  amount: number;
  fees: number;
  netAmount: number;
  paymentMethod: 'paypal' | 'bank_transfer';
  paymentDetails: {
    email?: string;
    accountNumber?: string;
    routingNumber?: string;
  };
  status: 'pending' | 'approved' | 'rejected';
  requestedAt: string;
  processedAt?: string;
  processedBy?: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  notes?: string;
  adminNotes?: string;
}

interface AdminWithdrawalQueueProps {
  className?: string;
}

export const AdminWithdrawalQueue: React.FC<AdminWithdrawalQueueProps> = ({ 
  className = '' 
}) => {
  const [requests, setRequests] = useState<WithdrawalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [selectedRequest, setSelectedRequest] = useState<WithdrawalRequest | null>(null);
  const [adminNotes, setAdminNotes] = useState('');

  useEffect(() => {
    fetchWithdrawalRequests();
  }, []);

  const fetchWithdrawalRequests = async () => {
    try {
      setLoading(true);
      const data = await getWithdrawalRequests();
      setRequests(data);
    } catch (error) {
      console.error('Failed to fetch withdrawal requests:', error);
      toast.error('Failed to load withdrawal requests');
    } finally {
      setLoading(false);
    }
  };

  const handleProcessRequest = async (requestId: string, action: 'approve' | 'reject') => {
    if (!selectedRequest) return;

    setProcessingId(requestId);
    try {
      const response = await processWithdrawal(requestId, action, adminNotes || undefined);

      if (response.success) {
        toast.success(`Withdrawal request ${action}d successfully!`);
        await fetchWithdrawalRequests();
        setSelectedRequest(null);
        setAdminNotes('');
      } else {
        toast.error(response.error || `Failed to ${action} withdrawal request`);
      }
    } catch (error) {
      console.error(`Failed to ${action} withdrawal request:`, error);
      toast.error(`Failed to ${action} withdrawal request`);
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'approved':
        return <CheckCircle className="h-4 w-4" />;
      case 'rejected':
        return <XCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const filteredRequests = requests.filter(request => {
    if (filter === 'all') return true;
    return request.status === filter;
  });

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

  const getPaymentMethodDisplay = (request: WithdrawalRequest) => {
    if (request.paymentMethod === 'paypal') {
      return `PayPal: ${request.paymentDetails.email}`;
    } else if (request.paymentMethod === 'bank_transfer') {
      return `Bank: *****${request.paymentDetails.accountNumber?.slice(-4)}`;
    }
    return request.paymentMethod;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Withdrawal Queue</h2>
          <p className="text-gray-600">Review and process withdrawal requests</p>
        </div>
        
        {/* Filter */}
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as 'all' | 'pending' | 'approved' | 'rejected')}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="all">All Requests</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { 
            label: 'Total Requests', 
            value: requests.length, 
            color: 'text-blue-600' 
          },
          { 
            label: 'Pending', 
            value: requests.filter(r => r.status === 'pending').length, 
            color: 'text-yellow-600' 
          },
          { 
            label: 'Approved', 
            value: requests.filter(r => r.status === 'approved').length, 
            color: 'text-green-600' 
          },
          { 
            label: 'Rejected', 
            value: requests.filter(r => r.status === 'rejected').length, 
            color: 'text-red-600' 
          }
        ].map((stat) => (
          <Card key={stat.label} className="p-4">
            <div className="text-center">
              <p className="text-sm text-gray-600">{stat.label}</p>
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Requests List */}
      <div className="space-y-4">
        {filteredRequests.length === 0 ? (
          <Card className="p-8 text-center">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No withdrawal requests found</p>
          </Card>
        ) : (
          filteredRequests.map((request) => (
            <Card key={request._id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  {/* Request Info */}
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-500" />
                        <span className="font-medium">
                          {request.userId.firstName} {request.userId.lastName}
                        </span>
                      </div>
                      <Badge className={getStatusColor(request.status)}>
                        {getStatusIcon(request.status)}
                        <span className="ml-1 capitalize">{request.status}</span>
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        <span>{formatCurrency(request.amount)} (Net: {formatCurrency(request.netAmount)})</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(request.requestedAt)}</span>
                      </div>
                      <div>
                        <span>{getPaymentMethodDisplay(request)}</span>
                      </div>
                    </div>
                    
                    {request.notes && (
                      <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                        <strong>User Notes:</strong> {request.notes}
                      </div>
                    )}
                    
                    {request.adminNotes && (
                      <div className="text-sm text-gray-600 bg-blue-50 p-2 rounded">
                        <strong>Admin Notes:</strong> {request.adminNotes}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedRequest(request)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Review
                    </Button>
                    
                    {request.status === 'pending' && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedRequest(request);
                            handleProcessRequest(request._id, 'approve');
                          }}
                          disabled={processingId === request._id}
                          className="text-green-600 hover:text-green-700"
                        >
                          {processingId === request._id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <CheckCircle className="h-4 w-4 mr-1" />
                          )}
                          Approve
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedRequest(request);
                            handleProcessRequest(request._id, 'reject');
                          }}
                          disabled={processingId === request._id}
                          className="text-red-600 hover:text-red-700"
                        >
                          {processingId === request._id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <XCircle className="h-4 w-4 mr-1" />
                          )}
                          Reject
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Review Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Review Withdrawal Request</h3>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">User</label>
                    <p className="text-sm text-gray-900">
                      {selectedRequest.userId.firstName} {selectedRequest.userId.lastName}
                    </p>
                    <p className="text-sm text-gray-500">{selectedRequest.userId.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Amount</label>
                    <p className="text-sm text-gray-900">{formatCurrency(selectedRequest.amount)}</p>
                    <p className="text-sm text-gray-500">Net: {formatCurrency(selectedRequest.netAmount)}</p>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Payment Method</label>
                  <p className="text-sm text-gray-900">{getPaymentMethodDisplay(selectedRequest)}</p>
                </div>
                
                {selectedRequest.notes && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">User Notes</label>
                    <p className="text-sm text-gray-900">{selectedRequest.notes}</p>
                  </div>
                )}
                
                {selectedRequest.status === 'pending' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Admin Notes</label>
                    <textarea
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      placeholder="Add any notes about this decision..."
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md resize-none"
                    />
                  </div>
                )}
              </div>
              
              <div className="flex justify-end gap-3 mt-6">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedRequest(null);
                    setAdminNotes('');
                  }}
                >
                  Cancel
                </Button>
                
                {selectedRequest.status === 'pending' && (
                  <>
                    <Button
                      onClick={() => handleProcessRequest(selectedRequest._id, 'reject')}
                      disabled={processingId === selectedRequest._id}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      {processingId === selectedRequest._id ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <XCircle className="h-4 w-4 mr-2" />
                      )}
                      Reject
                    </Button>
                    
                    <Button
                      onClick={() => handleProcessRequest(selectedRequest._id, 'approve')}
                      disabled={processingId === selectedRequest._id}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {processingId === selectedRequest._id ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <CheckCircle className="h-4 w-4 mr-2" />
                      )}
                      Approve
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
