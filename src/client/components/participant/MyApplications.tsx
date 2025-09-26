import React, { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '../../stores/authStore';


/**
 * MY APPLICATIONS - PARTICIPANT EXPERIENCE
 * Shows all study applications with status tracking
 */

interface Application {
  id: string;
  studyId: string;
  studyTitle: string;
  studyDescription: string;
  studyType: 'unmoderated' | 'moderated';
  duration: number;
  compensation: number;
  researcherName: string;
  researcherOrganization: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  appliedAt: string;
  reviewedAt?: string;
  notes?: string;
  nextSteps?: string;
}

interface APIApplication {
  id: string;
  study_id?: string;
  studyId?: string;
  studyTitle: string;
  studyDescription: string;
  compensation: number;
  estimated_duration?: number;
  duration?: number;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  applied_at?: string;
  appliedAt?: string;
  reviewed_at?: string;
  reviewedAt?: string;
  researcher_notes?: string;
  notes?: string;
  next_steps?: string;
  nextSteps?: string;
}

// Auth client interface for type safety
interface AuthClient {
  getToken: () => string | null;
  isAuthenticated: () => boolean;
  user: {
    id: string;
    email: string;
    role: string;
  } | null;
}

// Applications API Client
class ApplicationsAPI {
  private baseUrl: string;
  private authClient: AuthClient;

  constructor(authClient: AuthClient, baseUrl = 'http://localhost:3003/api') {
    this.baseUrl = baseUrl;
    this.authClient = authClient;
  }

  private async makeRequest<T = unknown>(endpoint: string, options: RequestInit = {}): Promise<{
    success: boolean;
    data?: T;
    error?: string;
  }> {
    const token = this.authClient.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers,
      });

      const data = await response.json();
      
      return {
        success: response.ok,
        data: data.data || data,
        error: data.error
      };
    } catch (error) {
      console.error('Applications API request failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Request failed'
      };
    }
  }

  async getMyApplications(): Promise<Application[]> {
    try {
      const response = await this.makeRequest<{applications: APIApplication[]}>('/research-consolidated?action=get-my-applications');
      
      if (response.success && response.data?.applications) {
        // Transform API response to match our interface
        return response.data.applications.map((app: APIApplication) => ({
          id: app.id,
          studyId: app.study_id || app.studyId || '',
          studyTitle: app.studyTitle,
          studyDescription: app.studyDescription,
          studyType: 'unmoderated' as const, // Default for now
          duration: app.estimated_duration || app.duration || 60,
          compensation: app.compensation || 0,
          researcherName: 'Research Team', // Default for now
          researcherOrganization: 'ResearchHub', // Default for now
          status: app.status,
          appliedAt: app.applied_at || app.appliedAt || '',
          reviewedAt: app.reviewed_at || app.reviewedAt,
          notes: app.researcher_notes || app.notes,
          nextSteps: app.next_steps || app.nextSteps
        }));
      }
      
      // Fallback to mock data
      return this.getMockApplications();
    } catch (error) {
      console.log('Using mock applications data:', error);
      return this.getMockApplications();
    }
  }

  private getMockApplications(): Application[] {
    return [
      {
        id: 'app-001',
        studyId: 'study-003',
        studyTitle: 'Educational Platform for Arabic Learners',
        studyDescription: 'Test our new educational platform designed specifically for Arabic language learning and provide insights on learning experience.',
        studyType: 'unmoderated',
        duration: 45,
        compensation: 40,
        researcherName: 'Prof. Omar Al-Mahmoud',
        researcherOrganization: 'Saudi Education Tech Institute',
        status: 'approved',
        appliedAt: '2025-08-08T10:30:00Z',
        reviewedAt: '2025-08-09T14:20:00Z',
        notes: 'Great fit for our study requirements. Looking forward to your participation.',
        nextSteps: 'Check your email for study materials and login credentials. Study begins on August 15th.'
      },
      {
        id: 'app-002',
        studyId: 'study-006',
        studyTitle: 'Islamic Banking App Security Perceptions',
        studyDescription: 'Study participant perceptions of security features in Islamic banking applications.',
        studyType: 'moderated',
        duration: 75,
        compensation: 85,
        researcherName: 'Dr. Abdullah Al-Mutairi',
        researcherOrganization: 'Islamic FinTech Research Center',
        status: 'pending',
        appliedAt: '2025-08-09T16:45:00Z',
        notes: 'Application under review. We will contact you within 2-3 business days.'
      },
      {
        id: 'app-003',
        studyId: 'study-001',
        studyTitle: 'Mobile App Usability Study',
        studyDescription: 'Help us improve our mobile application by testing new features and providing feedback on user experience.',
        studyType: 'unmoderated',
        duration: 30,
        compensation: 25,
        researcherName: 'Dr. Ahmed Al-Rashid',
        researcherOrganization: 'King Saud University',
        status: 'completed',
        appliedAt: '2025-07-25T09:15:00Z',
        reviewedAt: '2025-07-26T11:30:00Z',
        notes: 'Thank you for your excellent participation! Payment has been processed.',
        nextSteps: 'Study completed successfully. Compensation of $25 has been transferred to your account.'
      }
    ];
  }
}

interface MyApplicationsProps {
  className?: string;
}

export const MyApplications: React.FC<MyApplicationsProps> = ({ className = '' }) => {
  const { user, token, isAuthenticated } = useAuthStore();
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Create auth client
  const authClient = {
    getToken: () => token,
    isAuthenticated: () => isAuthenticated,
    user: user
  };

  const [applicationsAPI] = useState(() => new ApplicationsAPI(authClient));

  // Load applications
  const loadApplications = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const apps = await applicationsAPI.getMyApplications();
      setApplications(apps);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load applications');
    } finally {
      setIsLoading(false);
    }
  }, [applicationsAPI]);

  useEffect(() => {
    if (isAuthenticated) {
      loadApplications();
    }
  }, [isAuthenticated, loadApplications]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'approved': return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      case 'completed': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return '⏳';
      case 'approved': return '✅';
      case 'rejected': return '❌';
      case 'completed': return '🎉';
      default: return '📨';
    }
  };

  if (!isAuthenticated) {
    return (
      <div className={`min-h-screen bg-gray-50 flex items-center justify-center ${className}`}>
        <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 shadow-lg text-center">
          <div className="text-6xl mb-4">📋</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">My Applications</h2>
          <p className="text-gray-600 mb-6">
            Track your study applications and their status.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-800 text-sm">
              Please sign in to view your applications.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gray-50 ${className}`}>
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Applications</h1>
              <p className="text-gray-600 mt-1">
                Track your study applications and their current status
              </p>
            </div>
            <div className="text-sm text-gray-500">
              {applications.length} application{applications.length !== 1 ? 's' : ''}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <div className="text-red-600 mr-3">⚠️</div>
              <div className="text-red-700">{error}</div>
              <button
                onClick={() => setError(null)}
                className="ml-auto text-red-600 hover:text-red-800"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Applications List */}
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="bg-white rounded-lg border p-6 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-8 bg-gray-200 rounded w-1/4"></div>
              </div>
            ))}
          </div>
        ) : applications.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">No applications yet</h3>
            <p className="text-gray-600 mb-6">
              You haven't applied to any studies yet. Start discovering studies to apply for!
            </p>
            <a
              href="/discover"
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 inline-flex items-center"
            >
              Discover Studies
            </a>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map((application) => (
              <div key={application.id} className="bg-gradient-to-br from-white to-gray-50/30 rounded-2xl border duration-300 ease-out transform hover:scale-[1.01] backdrop-blur-sm shadow-sm border-gray-200/60 shadow-gray-200/50 hover:shadow-gray-300/60 hover:border-gray-300/80 hover:from-white hover:to-gray-50/50 p-7 hover:shadow-md transition-shadow">
                <div className="text-gray-700 p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{application.studyTitle}</h3>
                        <span className={`inline-flex items-center font-medium transition-all duration-300 transform hover:scale-105 shadow-sm backdrop-blur-sm px-3 py-1.5 text-sm rounded-full border ${getStatusColor(application.status)}`} role="status">
                          <div className="flex items-center gap-1">
                            <span className="text-sm">{getStatusIcon(application.status)}</span>
                            <span className="capitalize">{application.status}</span>
                          </div>
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
                        <div className="flex items-center text-sm text-gray-600">
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 mr-2" aria-hidden="true">
                            <path d="M8 2v4"></path>
                            <path d="M16 2v4"></path>
                            <rect width="18" height="18" x="3" y="4" rx="2"></rect>
                            <path d="M3 10h18"></path>
                          </svg>
                          Applied: {new Date(application.appliedAt).toLocaleDateString()}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 mr-2" aria-hidden="true">
                            <line x1="12" x2="12" y1="2" y2="22"></line>
                            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                          </svg>
                          Compensation: ${application.compensation}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 mr-2" aria-hidden="true">
                            <circle cx="12" cy="12" r="10"></circle>
                            <polyline points="12 6 12 12 16 14"></polyline>
                          </svg>
                          Duration: {application.duration} min
                        </div>
                      </div>

                      {application.notes && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-700">
                            <span className="font-medium">Notes:</span> {application.notes}
                          </p>
                        </div>
                      )}

                      {application.nextSteps && (
                        <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                          <p className="text-sm text-blue-700">
                            <span className="font-medium">Next Steps:</span> {application.nextSteps}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => {
                          setSelectedApplication(application);
                          setShowDetailsModal(true);
                        }}
                        className="inline-flex items-center justify-center rounded-xl transition-all duration-300 ease-out focus:outline-none focus:ring-2 focus:ring-offset-2 transform hover:scale-[1.02] active:scale-[0.98] shadow-sm hover:shadow-lg active:shadow-md backdrop-blur-sm cursor-pointer text-blue-700 bg-transparent border-2 border-blue-300 hover:bg-gradient-to-br hover:from-blue-50 hover:to-blue-100 focus:ring-blue-500 hover:border-blue-400 hover:text-blue-800 shadow-blue-200/30 hover:shadow-blue-300/40 px-4 py-2.5 text-sm font-medium"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 mr-1" aria-hidden="true">
                          <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"></path>
                          <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Application Details Modal */}
        {showDetailsModal && selectedApplication && (
          <ApplicationDetailsModal
            application={selectedApplication}
            onClose={() => {
              setShowDetailsModal(false);
              setSelectedApplication(null);
            }}
          />
        )}
      </div>
    </div>
  );
};

// Application Details Modal Component
const ApplicationDetailsModal: React.FC<{
  application: Application;
  onClose: () => void;
}> = ({ application, onClose }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'approved': return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      case 'completed': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusMessage = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Your application is currently being reviewed by the research team. You will receive a notification once there is an update.';
      case 'approved':
        return 'Congratulations! Your application has been approved. You should receive further instructions via email.';
      case 'rejected':
        return 'Unfortunately, your application was not selected for this study. Thank you for your interest.';
      case 'completed':
        return 'You have successfully completed this study. Thank you for your participation!';
      default:
        return 'Application status unknown.';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold text-gray-900">Application Details</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Study Information */}
          <div>
            <h4 className="text-lg font-medium text-gray-900 mb-3">Study Information</h4>
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <h5 className="font-medium text-gray-900">{application.studyTitle}</h5>
              <p className="text-gray-600 text-sm">{application.studyDescription}</p>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Type:</span> {application.studyType}
                </div>
                <div>
                  <span className="font-medium">Duration:</span> {application.duration} minutes
                </div>
                <div>
                  <span className="font-medium">Compensation:</span> ${application.compensation}
                </div>
                <div>
                  <span className="font-medium">Researcher:</span> {application.researcherName}
                </div>
              </div>
            </div>
          </div>

          {/* Application Status */}
          <div>
            <h4 className="text-lg font-medium text-gray-900 mb-3">Application Status</h4>
            <div className={`rounded-lg p-4 border ${getStatusColor(application.status)}`}>
              <div className="flex items-center mb-2">
                <span className="font-medium capitalize">{application.status}</span>
                <span className="ml-2 text-sm">
                  Applied on {new Date(application.appliedAt).toLocaleDateString()}
                </span>
              </div>
              <p className="text-sm">{getStatusMessage(application.status)}</p>
            </div>
          </div>

          {/* Timeline */}
          <div>
            <h4 className="text-lg font-medium text-gray-900 mb-3">Timeline</h4>
            <div className="space-y-3">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                <div className="text-sm">
                  <span className="font-medium">Application Submitted:</span> {new Date(application.appliedAt).toLocaleString()}
                </div>
              </div>
              {application.reviewedAt && (
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  <div className="text-sm">
                    <span className="font-medium">Application Reviewed:</span> {new Date(application.reviewedAt).toLocaleString()}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Notes and Next Steps */}
          {application.notes && (
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-3">Researcher Notes</h4>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-700 text-sm">{application.notes}</p>
              </div>
            </div>
          )}

          {application.nextSteps && (
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-3">Next Steps</h4>
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-blue-700 text-sm">{application.nextSteps}</p>
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="w-full bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default MyApplications;
