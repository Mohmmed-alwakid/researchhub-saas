import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Trash2,
  Search,
  Calendar,
  DollarSign,
  AlertCircle,
  FileText,
  Loader2,
  RefreshCw,
  Wallet
} from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge.tsx';
import { participantApplicationsService } from '../../services/participantApplications.service';
import type { IParticipantApplication } from '../../../shared/types';
import { WalletOverview } from '../../components/wallet/WalletOverview';
// import { EnhancedWithdrawalForm } from '../../components/wallet/EnhancedWithdrawalForm';
import { WithdrawalHistory } from '../../components/wallet/WithdrawalHistory';
// import { EnhancedTransactionHistory } from '../../components/wallet/EnhancedTransactionHistory';
// import { WithdrawalFormData } from '../../components/wallet/WithdrawalForm'; // TODO: Will be used when withdrawal form is implemented
import { useEnhancedWallet } from '../../hooks/useEnhancedWallet';
import WalletErrorBoundary from '../../components/wallet/WalletErrorBoundary';
// import { WalletSkeleton } from '../../components/wallet/WalletSkeletons';
import { walletToasts } from '../../utils/walletToasts';

interface EnhancedApplication extends Omit<IParticipantApplication, 'studyId'> {
  studyId: {
    _id: string;
    title: string;
    description: string;
    type: string;
    status: string;
    configuration: {
      duration: number;
      compensation: number;
    };
  };
}

interface ApplicationStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  withdrawn: number;
}

const ParticipantDashboardPage: React.FC = () => {
  const [applications, setApplications] = useState<EnhancedApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<ApplicationStats>({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    withdrawn: 0
  });

  // View state - applications or wallet
  const [currentView, setCurrentView] = useState<'applications' | 'wallet'>('applications');

  // Filters and search
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  
  // Actions
  const [withdrawingId, setWithdrawingId] = useState<string | null>(null);
  const [showWithdrawalForm, setShowWithdrawalForm] = useState(false);

  // Wallet hook
  const {
    wallet,
    transactions,
    withdrawals,
    loading: walletLoading,
    refreshWallet,
    createWithdrawal
  } = useEnhancedWallet();

  // Withdrawal handling
  const handleWithdrawalSubmit = async (data: { 
    amount: number; 
    payment_method: 'paypal' | 'bank_transfer' | 'crypto'; 
    payment_details: Record<string, unknown>
  }) => {
    try {
      const result = await createWithdrawal({
        amount: data.amount,
        payment_method: data.payment_method,
        payment_details: data.payment_details
      });
      
      if (result.success) {
        // Show success message
        setShowWithdrawalForm(false);
        await refreshWallet();
      } else {
        console.error('Withdrawal failed:', result.error);
      }
    } catch (error) {
      console.error('Failed to submit withdrawal:', error);
    }
  };

  // const handleWithdrawalCancel = () => {
  //   setShowWithdrawalForm(false);
  // };

  const handleRequestWithdrawal = () => {
    setShowWithdrawalForm(true);
  };

  const fetchApplications = useCallback(async (page = 1, refresh = false) => {
    try {
      if (refresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const filters = {
        page,
        limit: 10,
        ...(statusFilter !== 'all' && { status: statusFilter })
      };

      const response = await participantApplicationsService.getMyApplications(filters);
      if (response.success && response.data) {
        const apps = (response.data.applications || []) as unknown as EnhancedApplication[];

        setApplications(apps);
        setCurrentPage(response.data.pagination?.current || 1);

        // Calculate stats
        const newStats = apps.reduce((acc, app) => {
          acc.total += 1;
          acc[app.status as keyof ApplicationStats] = (acc[app.status as keyof ApplicationStats] as number) + 1;
          return acc;
        }, {
          total: 0,
          pending: 0,
          approved: 0,
          rejected: 0,
          withdrawn: 0
        });
        setStats(newStats);
      } else {
        console.warn('Failed to fetch applications:', response);
        setApplications([]);
        setStats({ total: 0, pending: 0, approved: 0, rejected: 0, withdrawn: 0 });
        toast.error('Failed to fetch applications');
      }
    } catch (error: unknown) {
      console.error('Error fetching applications:', error);
      const message = error instanceof Error ? error.message : 'Failed to fetch applications';
      toast.error(message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [statusFilter]);

  const handleWithdrawApplication = async (applicationId: string) => {
    try {
      setWithdrawingId(applicationId);
      const response = await participantApplicationsService.withdrawApplication(applicationId);
      if (response.success) {
        toast.success('Application withdrawn successfully');
        await fetchApplications(currentPage, true);
      } else {
        toast.error(response.message || 'Failed to withdraw application');
      }
    } catch (error: unknown) {
      console.error('Error withdrawing application:', error);
      const message = error instanceof Error ? error.message : 'Failed to withdraw application';
      toast.error(message);
    } finally {
      setWithdrawingId(null);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'withdrawn':
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'withdrawn':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    // Support for USD and SAR currencies
    const currencyCode = currency === 'SAR' ? 'SAR' : 'USD';
    const locale = currency === 'SAR' ? 'ar-SA' : 'en-US';
    
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

interface StudyType {
  _id: string;
  title: string;
  description: string;
  type: string;
  status: string;
  configuration: {
    duration: number;
    compensation: number;
  };
}

  const getStudyTitle = useCallback((app: EnhancedApplication): string => {
    const study = (app as unknown as {study?: StudyType; studyId?: StudyType}).study || (app as unknown as {study?: StudyType; studyId?: StudyType}).studyId;
    if (!study) return 'Unknown Study';
    if (typeof study === 'string') return study;
    if (typeof study === 'object' && study.title) return study.title;
    return 'Unknown Study';
  }, []);

  const getStudyId = useCallback((app: EnhancedApplication): string => {
    return (app as {study?: StudyType; studyId?: StudyType}).study?._id || (app as {study?: StudyType; studyId?: StudyType}).studyId?._id || '';
  }, []);

  // Optimized filtered applications with memoization
  const filteredApplications = useMemo(() => {
    return (applications || []).filter(app => {
      const matchesSearch = getStudyTitle(app).toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [applications, searchTerm, statusFilter, getStudyTitle]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Participant Dashboard</h1>
          <p className="mt-2 text-gray-600">
            Manage your study applications and track your earnings
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setCurrentView('applications')}
                className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${
                  currentView === 'applications'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Applications
                </div>
              </button>
              <button
                onClick={() => setCurrentView('wallet')}
                className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${
                  currentView === 'wallet'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Wallet className="h-4 w-4" />
                  Wallet
                </div>
              </button>
            </nav>
          </div>
        </div>

        {/* Applications View */}
        {currentView === 'applications' && (
          <>
            {/* Stats Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <FileText className="h-8 w-8 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Total Applications</p>
                      <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Clock className="h-8 w-8 text-yellow-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Pending</p>
                      <p className="text-2xl font-semibold text-gray-900">{stats.pending}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <CheckCircle className="h-8 w-8 text-green-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Approved</p>
                      <p className="text-2xl font-semibold text-gray-900">{stats.approved}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <XCircle className="h-8 w-8 text-red-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Rejected</p>
                      <p className="text-2xl font-semibold text-gray-900">{stats.rejected}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <AlertCircle className="h-8 w-8 text-gray-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Withdrawn</p>
                      <p className="text-2xl font-semibold text-gray-900">{stats.withdrawn}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Controls */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search studies..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              
              <div className="flex gap-2">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                  <option value="withdrawn">Withdrawn</option>
                </select>

                <Button
                  onClick={() => fetchApplications(currentPage, true)}
                  disabled={refreshing}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>
            </div>

            {/* Applications List */}
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                <span className="ml-2 text-gray-600">Loading applications...</span>
              </div>
            ) : filteredApplications.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No applications found
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {searchTerm || statusFilter !== 'all' 
                      ? 'Try adjusting your search or filters.'
                      : 'You haven\'t applied to any studies yet.'}
                  </p>
                  <Link to="/studies">
                    <Button>Browse Studies</Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredApplications.map((application) => (
                  <Card key={application._id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {getStudyTitle(application)}
                            </h3>
                            <Badge className={`border ${getStatusColor(application.status)}`}>
                              <div className="flex items-center gap-1">
                                {getStatusIcon(application.status)}
                                <span className="capitalize">{application.status}</span>
                              </div>
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
                            <div className="flex items-center text-sm text-gray-600">
                              <Calendar className="h-4 w-4 mr-2" />
                              Applied: {formatDate(application.appliedAt?.toString() || '')}
                            </div>
                            <div className="flex items-center text-sm text-gray-600">
                              <DollarSign className="h-4 w-4 mr-2" />
                              Compensation: {formatCurrency(application.studyId?.configuration?.compensation || 0, 'USD')}
                            </div>
                            <div className="flex items-center text-sm text-gray-600">
                              <Clock className="h-4 w-4 mr-2" />
                              Duration: {application.studyId?.configuration?.duration || 'N/A'} min
                            </div>
                          </div>

                          {application.notes && (
                            <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                              <p className="text-sm text-gray-700">
                                <span className="font-medium">Notes:</span> {application.notes}
                              </p>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-2 ml-4">
                          <Link to={`/studies/${getStudyId(application)}`}>
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4 mr-1" />
                              View Study
                            </Button>
                          </Link>
                          
                          {application.status === 'pending' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleWithdrawApplication(application._id)}
                              disabled={withdrawingId === application._id}
                              className="text-red-600 hover:bg-red-50 border-red-200"
                            >
                              {withdrawingId === application._id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4 mr-1" />
                              )}
                              Withdraw
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}

        {/* Wallet View */}
        {currentView === 'wallet' && (
          <WalletErrorBoundary>
            <div className="space-y-6">
              {/* Wallet Loading State */}
              {walletLoading && !wallet ? (
                <div>Loading wallet...</div>
              ) : !wallet ? (
                <div className="text-center p-8">
                  <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Wallet Unavailable</h3>
                  <p className="text-gray-600 mb-4">Unable to load your wallet information.</p>
                  <Button onClick={refreshWallet} variant="outline">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Try Again
                  </Button>
                </div>
              ) : (
                <>
                  {/* Wallet Overview with Refresh */}
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Wallet Overview</h2>
                    <Button 
                      onClick={async () => {
                        await refreshWallet();
                        walletToasts.walletRefreshed();
                      }} 
                      variant="outline" 
                      size="sm"
                      disabled={walletLoading}
                    >
                      <RefreshCw className={`h-4 w-4 mr-2 ${walletLoading ? 'animate-spin' : ''}`} />
                      Refresh
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Wallet Overview */}
                    <div className="lg:col-span-2">
                      <WalletOverview 
                        wallet={wallet}
                        onRequestWithdrawal={handleRequestWithdrawal}
                        loading={walletLoading}
                      />
                    </div>

                    {/* Enhanced Withdrawal Form */}
                    {showWithdrawalForm && (
                      <div className="lg:col-span-1">
                        <div>Withdrawal form placeholder</div>
                      </div>
                    )}
                  </div>

                  {/* Enhanced Transaction and Withdrawal History */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <div>Transaction history placeholder</div>
                    </div>

                    <div>
                      <WithdrawalHistory 
                        withdrawals={withdrawals}
                        loading={walletLoading}
                        currency={wallet?.currency || 'USD'}
                      />
                    </div>
                  </div>
                </>
              )}
            </div>
          </WalletErrorBoundary>
        )}
      </div>
    </div>
  );
};

export default ParticipantDashboardPage;