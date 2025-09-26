import React, { useState, useEffect, useCallback } from 'react';
import {
  Clock,
  CheckCircle,
  XCircle,
  Filter,
  Search,
  User,
  Mail,
  FileText,
  ArrowLeft,
  Loader2,
  RefreshCw,
  UserCheck,
  UserX
} from 'lucide-react';
import { useParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import { researcherApplicationsService } from '../../services/researcherApplications.service';
import { studiesService } from '../../services/studies.service';

import type { ApplicationReview, ResearcherApplication } from '../../services/researcherApplications.service';

interface StudyInfo {
  _id: string;
  title: string;
  description: string;
  type: string;
  status: string;
}

interface ApplicationStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  withdrawn: number;
}

const StudyApplicationsManagementPage: React.FC = () => {
  const { studyId } = useParams<{ studyId: string }>();
  const [study, setStudy] = useState<StudyInfo | null>(null);
  const [applications, setApplications] = useState<ResearcherApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState<ApplicationStats>({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    withdrawn: 0
  });
  const [selectedApplication, setSelectedApplication] = useState<ResearcherApplication | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewAction, setReviewAction] = useState<'approve' | 'reject'>('approve');
  const [rejectionReason, setRejectionReason] = useState('');
  const [notes, setNotes] = useState('');
  const fetchStudyInfo = useCallback(async () => {
    if (!studyId) return;
    
    try {
      const response = await studiesService.getStudy(studyId);
      setStudy(response.study);    } catch (error: unknown) {
      console.error('Failed to fetch study info:', error);
      toast.error('Failed to load study information');
    }
  }, [studyId]);
  const fetchApplications = useCallback(async (page = 1, refresh = false) => {
    if (!studyId) return;
    
    try {
      if (refresh) setRefreshing(true);
        const filters: Record<string, unknown> = { page, limit: 10 };
      if (statusFilter !== 'all') filters.status = statusFilter;

      const response = await researcherApplicationsService.getStudyApplications(studyId, filters);
      
      if (response.success) {
        setApplications(response.data.applications);
        setCurrentPage(response.data.pagination.current);
        setTotalPages(response.data.pagination.pages);

        // Calculate stats
        const newStats = response.data.applications.reduce((acc, app) => {
          acc.total = response.data.pagination.total;
          acc[app.status as keyof ApplicationStats]++;
          return acc;
        }, { total: 0, pending: 0, approved: 0, rejected: 0, withdrawn: 0 });

        setStats(newStats);
      }
    } catch (error: unknown) {
      console.error('Failed to fetch applications:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch applications';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [studyId, statusFilter]);

  const handleReviewApplication = async () => {
    if (!selectedApplication) return;

    try {
      setProcessingIds(prev => new Set(prev).add(selectedApplication.id));

      const reviewData: ApplicationReview = { status: reviewAction === 'approve' ? 'accepted' : 'rejected' };
      if (reviewAction === 'reject' && rejectionReason) {
        reviewData.notes = rejectionReason;
      }
      if (notes) {
        reviewData.notes = notes;
      }

      await researcherApplicationsService.reviewApplication(selectedApplication.id, reviewData);
      
      toast.success(`Application ${reviewAction}d successfully`);
      setShowReviewModal(false);
      setSelectedApplication(null);
      setRejectionReason('');
      setNotes('');
      await fetchApplications(currentPage, true);
    } catch (error: unknown) {
      console.error('Failed to review application:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to review application';
      toast.error(errorMessage);
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(selectedApplication.id);
        return newSet;
      });
    }
  };

  const openReviewModal = (application: ResearcherApplication, action: 'approve' | 'reject') => {
    setSelectedApplication(application);
    setReviewAction(action);
    setShowReviewModal(true);
    setRejectionReason('');
    setNotes('');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'withdrawn':
        return <XCircle className="w-4 h-4 text-gray-600" />;
      default:
        return null;
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
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const filteredApplications = applications.filter(app =>
    app.participant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.participant.email.toLowerCase().includes(searchTerm.toLowerCase())
  );
  useEffect(() => {
    fetchStudyInfo();
    fetchApplications();
  }, [studyId, fetchStudyInfo, fetchApplications]);
  useEffect(() => {
    fetchApplications(1);
  }, [statusFilter, fetchApplications]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg p-6 shadow-sm">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <Link to="/app/studies" className="mr-4">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Studies
              </Button>
            </Link>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {study?.title} - Applications
              </h1>
              <p className="text-gray-600 mt-2">
                Manage participant applications for this study
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                onClick={() => fetchApplications(currentPage, true)}
                disabled={refreshing}
                variant="outline"
                className="flex items-center"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <FileText className="w-8 h-8 text-gray-400" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                </div>
                <Clock className="w-8 h-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Approved</p>
                  <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Rejected</p>
                  <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
                </div>
                <XCircle className="w-8 h-8 text-red-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Withdrawn</p>
                  <p className="text-2xl font-bold text-gray-600">{stats.withdrawn}</p>
                </div>
                <XCircle className="w-8 h-8 text-gray-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                  <input
                    type="text"
                    placeholder="Search by participant name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                  <option value="withdrawn">Withdrawn</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Applications List */}
        {filteredApplications.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No applications found
              </h3>
              <p className="text-gray-600">
                {statusFilter !== 'all' 
                  ? `No ${statusFilter} applications found.`
                  : 'No participant applications yet for this study.'
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {filteredApplications.map((application) => (
              <Card key={application.id} variant="elevated">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      {/* Participant Info */}
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-indigo-600" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-lg font-medium text-gray-900 truncate">
                            {application.participant.name}
                          </p>
                          <div className="flex items-center text-sm text-gray-500">
                            <Mail className="w-4 h-4 mr-1" />
                            {application.participant.email}
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Badge className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(application.status)}`}>
                            <span className="flex items-center">
                              {getStatusIcon(application.status)}
                              <span className="ml-1 capitalize">{application.status}</span>
                            </span>
                          </Badge>
                        </div>
                      </div>

                      {/* Application Details */}
                      <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                        <div>
                          <span className="text-gray-500">Applied:</span>
                          <span className="ml-2 text-gray-900">
                            {new Date(application.appliedAt).toLocaleDateString()}
                          </span>
                        </div>
                        {application.reviewedAt && (
                          <div>
                            <span className="text-gray-500">Reviewed:</span>
                            <span className="ml-2 text-gray-900">
                              {new Date(application.reviewedAt).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Screening Responses */}
                      {application.screeningResponses && application.screeningResponses.length > 0 && (
                        <div className="mb-4">
                          <h4 className="text-sm font-medium text-gray-900 mb-2">Screening Responses</h4>
                          <div className="space-y-2">
                            {application.screeningResponses.map((response, index) => (
                              <div key={index} className="bg-gray-50 p-3 rounded-lg">
                                <p className="text-xs font-medium text-gray-700 mb-1">
                                  {response.question}
                                </p>
                                <p className="text-sm text-gray-900">{response.answer}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Rejection Reason */}
                      {application.status === 'rejected' && application.rejectionReason && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                          <p className="text-xs font-medium text-red-800 mb-1">Rejection Reason:</p>
                          <p className="text-sm text-red-700">{application.rejectionReason}</p>
                        </div>
                      )}

                      {/* Notes */}
                      {application.notes && (
                        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <p className="text-xs font-medium text-blue-800 mb-1">Notes:</p>
                          <p className="text-sm text-blue-700">{application.notes}</p>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-2 ml-4">
                      {application.status === 'pending' && (
                        <>
                          <Button
                            onClick={() => openReviewModal(application, 'approve')}
                            disabled={processingIds.has(application._id)}
                            variant="outline"
                            size="sm"
                            className="text-green-600 border-green-300 hover:bg-green-50"
                          >
                            {processingIds.has(application._id) ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <UserCheck className="w-4 h-4" />
                            )}
                          </Button>
                          <Button
                            onClick={() => openReviewModal(application, 'reject')}
                            disabled={processingIds.has(application._id)}
                            variant="outline"
                            size="sm"
                            className="text-red-600 border-red-300 hover:bg-red-50"
                          >
                            {processingIds.has(application._id) ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <UserX className="w-4 h-4" />
                            )}
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center space-x-2 mt-8">
                <Button
                  onClick={() => fetchApplications(currentPage - 1)}
                  disabled={currentPage === 1}
                  variant="outline"
                  size="sm"
                >
                  Previous
                </Button>
                <span className="text-sm text-gray-600">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  onClick={() => fetchApplications(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  variant="outline"
                  size="sm"
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Review Modal */}
      {showReviewModal && selectedApplication && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {reviewAction === 'approve' ? 'Approve' : 'Reject'} Application
            </h3>
            
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                <strong>Participant:</strong> {selectedApplication.participantId.name}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Email:</strong> {selectedApplication.participantId.email}
              </p>
            </div>

            {reviewAction === 'reject' && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rejection Reason *
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Please provide a reason for rejection..."
                  required
                />
              </div>
            )}

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Add any additional notes..."
              />
            </div>

            <div className="flex items-center justify-end space-x-3">
              <Button
                onClick={() => setShowReviewModal(false)}
                variant="outline"
              >
                Cancel
              </Button>
              <Button
                onClick={handleReviewApplication}
                disabled={reviewAction === 'reject' && !rejectionReason.trim()}
                className={reviewAction === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
              >
                {reviewAction === 'approve' ? 'Approve' : 'Reject'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudyApplicationsManagementPage;
