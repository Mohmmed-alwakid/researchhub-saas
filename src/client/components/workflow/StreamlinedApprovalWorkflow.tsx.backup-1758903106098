import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle, 
  Clock, 
  FileText, 
  User, 
  Mail, 
  Calendar,
  Search,
  Download,
  Eye,
  MessageSquare,
  Archive,
  UserCheck,
  AlertCircle,
  Trash2,
  Send
} from 'lucide-react';

interface Application {
  id: string;
  applicantName: string;
  applicantEmail: string;
  studyId: string;
  studyTitle: string;
  appliedDate: string;
  status: 'pending' | 'approved' | 'rejected' | 'interview_scheduled' | 'completed';
  coverLetter?: string;
  qualifications: string[];
  demographics: {
    age?: number;
    gender?: string;
    occupation?: string;
    location?: string;
  };
  experience: {
    previousStudies: number;
    relevantExperience: string;
    techComfort: 1 | 2 | 3 | 4 | 5;
  };
  notes?: string;
  interviewDate?: string;
  responseRequired: boolean;
  priority: 'low' | 'medium' | 'high';
}

interface StreamlinedApprovalWorkflowProps {
  applications: Application[];
  onApplicationUpdate: (applicationId: string, status: Application['status'], notes?: string) => void;
  onBulkAction: (applicationIds: string[], action: 'approve' | 'reject' | 'schedule_interview') => void;
  onSendMessage: (applicationId: string, message: string) => void;
  studyFilters?: { studyId: string; title: string }[];
}

const StreamlinedApprovalWorkflow: React.FC<StreamlinedApprovalWorkflowProps> = ({
  applications,
  onApplicationUpdate,
  onBulkAction,
  onSendMessage,
  studyFilters = []
}) => {
  const [selectedApplications, setSelectedApplications] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<Application['status'] | 'all'>('all');
  const [studyFilter, setStudyFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'priority' | 'name'>('date');
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [quickReplyMessage, setQuickReplyMessage] = useState('');

  // Generate mock applications for demonstration
  const mockApplications: Application[] = [
    {
      id: 'app-1',
      applicantName: 'Sarah Johnson',
      applicantEmail: 'sarah.johnson@email.com',
      studyId: 'study-1',
      studyTitle: 'Mobile App Usability Study',
      appliedDate: '2024-02-15T10:30:00Z',
      status: 'pending',
      coverLetter: 'I am excited to participate in this usability study as I have extensive experience with mobile applications and user testing.',
      qualifications: ['UX Design Background', '5+ years mobile app experience', 'Previous user testing participant'],
      demographics: {
        age: 28,
        gender: 'Female',
        occupation: 'UX Designer',
        location: 'San Francisco, CA'
      },
      experience: {
        previousStudies: 3,
        relevantExperience: 'UX Designer with mobile app focus',
        techComfort: 5
      },
      responseRequired: true,
      priority: 'high'
    },
    {
      id: 'app-2',
      applicantName: 'Michael Chen',
      applicantEmail: 'michael.chen@email.com',
      studyId: 'study-1',
      studyTitle: 'Mobile App Usability Study',
      appliedDate: '2024-02-14T14:20:00Z',
      status: 'approved',
      qualifications: ['Mobile Developer', 'User Testing Experience'],
      demographics: {
        age: 32,
        gender: 'Male',
        occupation: 'Software Developer',
        location: 'New York, NY'
      },
      experience: {
        previousStudies: 1,
        relevantExperience: 'Mobile app development and testing',
        techComfort: 4
      },
      responseRequired: false,
      priority: 'medium'
    },
    {
      id: 'app-3',
      applicantName: 'Emily Rodriguez',
      applicantEmail: 'emily.rodriguez@email.com',
      studyId: 'study-2',
      studyTitle: 'E-commerce Checkout Flow',
      appliedDate: '2024-02-13T09:45:00Z',
      status: 'interview_scheduled',
      interviewDate: '2024-02-20T15:00:00Z',
      qualifications: ['E-commerce Experience', 'Online Shopping Enthusiast'],
      demographics: {
        age: 26,
        gender: 'Female',
        occupation: 'Marketing Manager',
        location: 'Los Angeles, CA'
      },
      experience: {
        previousStudies: 0,
        relevantExperience: 'Heavy online shopper, marketing background',
        techComfort: 3
      },
      responseRequired: true,
      priority: 'medium'
    }
  ];

  const allApplications = applications.length > 0 ? applications : mockApplications;

  // Filter and sort applications
  const filteredApplications = allApplications
    .filter(app => {
      if (statusFilter !== 'all' && app.status !== statusFilter) return false;
      if (studyFilter !== 'all' && app.studyId !== studyFilter) return false;
      if (searchQuery && !app.applicantName.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !app.applicantEmail.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.appliedDate).getTime() - new Date(a.appliedDate).getTime();
        case 'priority': {
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        }
        case 'name':
          return a.applicantName.localeCompare(b.applicantName);
        default:
          return 0;
      }
    });

  const getStatusColor = (status: Application['status']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'interview_scheduled': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: Application['status']) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'approved': return <CheckCircle className="w-4 h-4" />;
      case 'rejected': return <AlertCircle className="w-4 h-4" />;
      case 'interview_scheduled': return <Calendar className="w-4 h-4" />;
      case 'completed': return <Archive className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getPriorityColor = (priority: Application['priority']) => {
    switch (priority) {
      case 'high': return 'border-l-red-500';
      case 'medium': return 'border-l-yellow-500';
      case 'low': return 'border-l-green-500';
    }
  };

  const handleSelectAll = () => {
    if (selectedApplications.length === filteredApplications.length) {
      setSelectedApplications([]);
    } else {
      setSelectedApplications(filteredApplications.map(app => app.id));
    }
  };

  const handleBulkAction = (action: 'approve' | 'reject' | 'schedule_interview') => {
    onBulkAction(selectedApplications, action);
    setSelectedApplications([]);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleSendQuickReply = (applicationId: string) => {
    if (quickReplyMessage.trim()) {
      onSendMessage(applicationId, quickReplyMessage);
      setQuickReplyMessage('');
    }
  };

  const quickReplyTemplates = [
    "Thank you for your application. We'll review it and get back to you soon.",
    "We'd like to schedule a brief interview. Please let us know your availability.",
    "Congratulations! You've been approved for the study. We'll send you the details shortly.",
    "Thank you for your interest. Unfortunately, we won't be moving forward with your application at this time."
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Application Management</h1>
          <p className="text-gray-600 mt-1">
            Streamlined workflow for reviewing and approving participant applications
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => {/* Export applications */}}
            className="flex items-center px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name or email..."
                className="pl-10 pr-3 py-2 border border-gray-300 rounded-md w-full focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as Application['status'] | 'all')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="interview_scheduled">Interview Scheduled</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Study</label>
            <select
              value={studyFilter}
              onChange={(e) => setStudyFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Studies</option>
              {studyFilters.map(study => (
                <option key={study.studyId} value={study.studyId}>{study.title}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'date' | 'priority' | 'name')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="date">Application Date</option>
              <option value="priority">Priority</option>
              <option value="name">Applicant Name</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedApplications.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-blue-50 border border-blue-200 rounded-lg p-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-blue-900">
                {selectedApplications.length} application(s) selected
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleBulkAction('approve')}
                className="flex items-center px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm"
              >
                <UserCheck className="w-4 h-4 mr-1" />
                Approve
              </button>
              <button
                onClick={() => handleBulkAction('reject')}
                className="flex items-center px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm"
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Reject
              </button>
              <button
                onClick={() => handleBulkAction('schedule_interview')}
                className="flex items-center px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
              >
                <Calendar className="w-4 h-4 mr-1" />
                Schedule Interview
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Applications List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              Applications ({filteredApplications.length})
            </h2>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleSelectAll}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                {selectedApplications.length === filteredApplications.length ? 'Deselect All' : 'Select All'}
              </button>
            </div>
          </div>
        </div>

        <div className="divide-y divide-gray-200">
          {filteredApplications.map((application) => (
            <motion.div
              key={application.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`p-4 hover:bg-gray-50 border-l-4 ${getPriorityColor(application.priority)}`}
            >
              <div className="flex items-start space-x-4">
                <input
                  type="checkbox"
                  checked={selectedApplications.includes(application.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedApplications([...selectedApplications, application.id]);
                    } else {
                      setSelectedApplications(selectedApplications.filter(id => id !== application.id));
                    }
                  }}
                  className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <h3 className="text-sm font-medium text-gray-900">{application.applicantName}</h3>
                      <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(application.status)}`}>
                        {getStatusIcon(application.status)}
                        <span className="ml-1 capitalize">{application.status.replace('_', ' ')}</span>
                      </span>
                      {application.responseRequired && (
                        <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-orange-100 text-orange-800">
                          Response Required
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setSelectedApplication(application)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="text-gray-400 hover:text-gray-600">
                        <MessageSquare className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <Mail className="w-4 h-4" />
                      <span>{application.applicantEmail}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <FileText className="w-4 h-4" />
                      <span>{application.studyTitle}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(application.appliedDate)}</span>
                    </div>
                  </div>

                  {application.coverLetter && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-md">
                      <p className="text-sm text-gray-700 line-clamp-2">{application.coverLetter}</p>
                    </div>
                  )}

                  <div className="mt-3 flex flex-wrap gap-2">
                    {application.qualifications.map((qual, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded"
                      >
                        {qual}
                      </span>
                    ))}
                  </div>

                  {application.status === 'pending' && (
                    <div className="mt-4 flex items-center space-x-2">
                      <button
                        onClick={() => onApplicationUpdate(application.id, 'approved')}
                        className="flex items-center px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm"
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Approve
                      </button>
                      <button
                        onClick={() => onApplicationUpdate(application.id, 'rejected')}
                        className="flex items-center px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm"
                      >
                        <AlertCircle className="w-4 h-4 mr-1" />
                        Reject
                      </button>
                      <button
                        onClick={() => onApplicationUpdate(application.id, 'interview_scheduled')}
                        className="flex items-center px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                      >
                        <Calendar className="w-4 h-4 mr-1" />
                        Schedule Interview
                      </button>
                    </div>
                  )}

                  {/* Quick Reply */}
                  <div className="mt-3 p-3 bg-gray-50 rounded-md">
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={quickReplyMessage}
                        onChange={(e) => setQuickReplyMessage(e.target.value)}
                        placeholder="Type a quick reply..."
                        className="flex-1 px-3 py-1 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                      />
                      <button
                        onClick={() => handleSendQuickReply(application.id)}
                        disabled={!quickReplyMessage.trim()}
                        className="flex items-center px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {quickReplyTemplates.map((template, index) => (
                        <button
                          key={index}
                          onClick={() => setQuickReplyMessage(template)}
                          className="text-xs px-2 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
                        >
                          {template.substring(0, 30)}...
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredApplications.length === 0 && (
          <div className="p-8 text-center">
            <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No applications found</h3>
            <p className="text-gray-600">Try adjusting your filters or search criteria.</p>
          </div>
        )}
      </div>

      {/* Application Detail Modal */}
      <AnimatePresence>
        {selectedApplication && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedApplication(null)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Application Details</h2>
                  <button
                    onClick={() => setSelectedApplication(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ×
                  </button>
                </div>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{selectedApplication.applicantName}</h3>
                    <p className="text-gray-600">{selectedApplication.applicantEmail}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Demographics</h4>
                      <div className="space-y-1 text-sm text-gray-600">
                        <p>Age: {selectedApplication.demographics.age}</p>
                        <p>Gender: {selectedApplication.demographics.gender}</p>
                        <p>Occupation: {selectedApplication.demographics.occupation}</p>
                        <p>Location: {selectedApplication.demographics.location}</p>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Experience</h4>
                      <div className="space-y-1 text-sm text-gray-600">
                        <p>Previous Studies: {selectedApplication.experience.previousStudies}</p>
                        <p>Tech Comfort: {selectedApplication.experience.techComfort}/5</p>
                        <p>Experience: {selectedApplication.experience.relevantExperience}</p>
                      </div>
                    </div>
                  </div>

                  {selectedApplication.coverLetter && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Cover Letter</h4>
                      <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-md">
                        {selectedApplication.coverLetter}
                      </p>
                    </div>
                  )}

                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Qualifications</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedApplication.qualifications.map((qual, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded"
                        >
                          {qual}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-end space-x-3">
                  <button
                    onClick={() => setSelectedApplication(null)}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                  >
                    Close
                  </button>
                  {selectedApplication.status === 'pending' && (
                    <>
                      <button
                        onClick={() => {
                          onApplicationUpdate(selectedApplication.id, 'approved');
                          setSelectedApplication(null);
                        }}
                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => {
                          onApplicationUpdate(selectedApplication.id, 'rejected');
                          setSelectedApplication(null);
                        }}
                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                      >
                        Reject
                      </button>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StreamlinedApprovalWorkflow;
