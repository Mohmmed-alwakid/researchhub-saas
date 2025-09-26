import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Clock, DollarSign, Users, CheckCircle, AlertCircle } from 'lucide-react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';

import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { participantApplicationsService } from '../../services/participantApplications.service';

interface StudyDetails {
  _id: string;
  title: string;
  description: string;
  type: string;
  researcher: {
    name: string;
  };
  configuration: {
    duration: number;
    compensation: number;
    maxParticipants: number;
    participantCriteria: {
      minAge?: number;
      maxAge?: number;
      location?: string[];
      devices?: string[];
      customScreening?: Array<{
        id: string;
        question: string;
        type: 'text' | 'multiple-choice' | 'boolean' | 'number';
        options?: string[];
        required: boolean;
      }>;
    };
    instructions?: string;
  };
  participants: {
    enrolled: number;
  };
}

const StudyApplicationPage: React.FC = () => {
  const { id: studyId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [study, setStudy] = useState<StudyDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [screeningResponses, setScreeningResponses] = useState<Record<string, string>>({});
  const [existingApplication, setExistingApplication] = useState<{
    id: string;
    status: string;
    appliedAt: string;
  } | null>(null);
  const [checkingApplication, setCheckingApplication] = useState(true);

  // DEBUG: Add console logs
  console.log('🔍 StudyApplicationPage - Component mounted', {
    studyId,
    loading,
    study: study ? study.title : null,
    timestamp: new Date().toISOString()
  });

  const fetchStudyDetails = useCallback(async () => {
    try {
      setLoading(true);
      console.log('🔍 StudyApplicationPage - Fetching study details for ID:', studyId);
      const response = await participantApplicationsService.getStudyDetails(studyId!);
      console.log('🔍 StudyApplicationPage - API response:', response);
      setStudy(response.study as unknown as StudyDetails);
      console.log('🔍 StudyApplicationPage - Study set successfully');
    } catch (error) {
      console.error('❌ StudyApplicationPage - Failed to fetch study details:', error);
      toast.error('Failed to load study details');
      navigate('/app/discover');
    } finally {
      setLoading(false);
      console.log('🔍 StudyApplicationPage - Loading set to false');
    }
  }, [studyId, navigate]);

  const checkExistingApplication = useCallback(async () => {
    try {
      setCheckingApplication(true);
      console.log('🔍 StudyApplicationPage - Checking existing application for study ID:', studyId);
      const response = await participantApplicationsService.checkApplicationStatus(studyId!);
      console.log('🔍 StudyApplicationPage - Application status response:', response);
      if (response.data.hasApplied && response.data.application) {
        setExistingApplication(response.data.application);
      }
    } catch (error) {
      console.error('❌ StudyApplicationPage - Failed to check application status:', error);
    } finally {
      setCheckingApplication(false);
      console.log('🔍 StudyApplicationPage - Checking application set to false');
    }
  }, [studyId]);

  useEffect(() => {
    if (studyId) {
      fetchStudyDetails();
      checkExistingApplication();
    }
  }, [studyId, fetchStudyDetails, checkExistingApplication]);

  const handleScreeningResponseChange = (questionId: string, answer: string) => {
    setScreeningResponses(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleSubmitApplication = async () => {
    if (!study) return;

    // Validate required screening questions
    const requiredQuestions = study.configuration.participantCriteria.customScreening?.filter(q => q.required) || [];
    const missingResponses = requiredQuestions.filter(q => !screeningResponses[q.id]);

    if (missingResponses.length > 0) {
      toast.error('Please answer all required screening questions');
      return;
    }

    try {
      setSubmitting(true);
      
      const screeningResponsesArray = Object.entries(screeningResponses).map(([questionId, answer]) => {
        const question = study.configuration.participantCriteria.customScreening?.find(q => q.id === questionId);
        return {
          questionId,
          question: question?.question || '',
          answer
        };
      });

      await participantApplicationsService.applyToStudy(studyId!, {
        screeningResponses: screeningResponsesArray
      });

      toast.success('Application submitted successfully!');
      navigate('/app/participant-dashboard'); // Fixed navigation route
    } catch (error) {
      console.error('Failed to submit application:', error);
      
      // Check for duplicate application error
      if (error instanceof Error && 'response' in error && 
          typeof error.response === 'object' && error.response !== null &&
          'data' in error.response && 
          typeof error.response.data === 'object' && error.response.data !== null) {
        
        const errorData = error.response.data as { 
          code?: string; 
          error?: string; 
          message?: string; 
        };
        
        if (errorData.code === 'DUPLICATE_APPLICATION') {
          toast.error('You have already applied to this study');
          // Refresh the application status
          checkExistingApplication();
          return;
        }
        
        const errorMessage = 'error' in errorData && typeof errorData.error === 'string' 
          ? errorData.error 
          : 'Failed to submit application';
        toast.error(errorMessage);
      } else {
        toast.error('Failed to submit application');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    console.log('🔍 StudyApplicationPage - Rendering loading state');
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="h-6 bg-gray-200 rounded mb-4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!study) {
    console.log('🔍 StudyApplicationPage - Rendering no study state');
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Study Not Found</h2>
          <p className="text-gray-600 mb-4">The study you're looking for doesn't exist or is no longer available.</p>
          <Button onClick={() => navigate('/app/discover-studies')}>
            Back to Studies
          </Button>
        </div>
      </div>
    );
  }

  console.log('🔍 StudyApplicationPage - Rendering main content for study:', study.title);

  const getTypeIcon = (type: string) => {
    const icons = {
      usability: '🖥️',
      interview: '🎤',
      survey: '📋',
      'card-sorting': '🗂️',
      'a-b-testing': '🔬'
    };
    return icons[type as keyof typeof icons] || '📊';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/app/discover-studies')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Studies
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Apply to Study</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Study Details */}
          <div className="lg:col-span-2 space-y-6">
            <Card variant="elevated">
              <CardHeader>
                <div className="flex items-start">
                  <span className="text-3xl mr-4">{getTypeIcon(study.type)}</span>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">{study.title}</h2>
                    <p className="text-gray-600 capitalize">{study.type.replace('-', ' ')}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 mb-6">{study.description}</p>

                {study.configuration.instructions && (
                  <div>
                    <h3 className="font-medium text-gray-900 mb-3">Instructions</h3>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-blue-800">{study.configuration.instructions}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Eligibility Criteria */}
            {study.configuration.participantCriteria && (
              <Card variant="elevated">
                <CardHeader title="Eligibility Criteria" />
                <CardContent>
                  <div className="space-y-3">
                    {study.configuration.participantCriteria.minAge && (
                      <div className="flex items-center">
                        <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                        <span>Age: {study.configuration.participantCriteria.minAge}
                          {study.configuration.participantCriteria.maxAge && 
                            ` - ${study.configuration.participantCriteria.maxAge}`
                          } years old
                        </span>
                      </div>
                    )}
                    {study.configuration.participantCriteria.devices && study.configuration.participantCriteria.devices.length > 0 && (
                      <div className="flex items-center">
                        <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                        <span>Device: {study.configuration.participantCriteria.devices.join(', ')}</span>
                      </div>
                    )}
                    {study.configuration.participantCriteria.location && study.configuration.participantCriteria.location.length > 0 && (
                      <div className="flex items-center">
                        <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                        <span>Location: {study.configuration.participantCriteria.location.join(', ')}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Screening Questions */}
            {study.configuration.participantCriteria.customScreening && study.configuration.participantCriteria.customScreening.length > 0 && (
              <Card variant="elevated">
                <CardHeader title="Screening Questions" />
                <CardContent>
                  <div className="space-y-6">
                    {study.configuration.participantCriteria.customScreening.map((question) => (
                      <div key={question.id}>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {question.question}
                          {question.required && <span className="text-red-500 ml-1">*</span>}
                        </label>
                        
                        {question.type === 'text' && (
                          <textarea
                            value={screeningResponses[question.id] || ''}
                            onChange={(e) => handleScreeningResponseChange(question.id, e.target.value)}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="Enter your response..."
                          />
                        )}
                        
                        {question.type === 'multiple-choice' && question.options && (
                          <div className="space-y-2">
                            {question.options.map((option) => (
                              <label key={option} className="flex items-center">
                                <input
                                  type="radio"
                                  name={question.id}
                                  value={option}
                                  checked={screeningResponses[question.id] === option}
                                  onChange={(e) => handleScreeningResponseChange(question.id, e.target.value)}
                                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                                />
                                <span className="ml-3 text-sm text-gray-700">{option}</span>
                              </label>
                            ))}
                          </div>
                        )}
                        
                        {question.type === 'boolean' && (
                          <div className="space-y-2">
                            <label className="flex items-center">
                              <input
                                type="radio"
                                name={question.id}
                                value="yes"
                                checked={screeningResponses[question.id] === 'yes'}
                                onChange={(e) => handleScreeningResponseChange(question.id, e.target.value)}
                                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                              />
                              <span className="ml-3 text-sm text-gray-700">Yes</span>
                            </label>
                            <label className="flex items-center">
                              <input
                                type="radio"
                                name={question.id}
                                value="no"
                                checked={screeningResponses[question.id] === 'no'}
                                onChange={(e) => handleScreeningResponseChange(question.id, e.target.value)}
                                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                              />
                              <span className="ml-3 text-sm text-gray-700">No</span>
                            </label>
                          </div>
                        )}
                        
                        {question.type === 'number' && (
                          <input
                            type="number"
                            value={screeningResponses[question.id] || ''}
                            onChange={(e) => handleScreeningResponseChange(question.id, e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="Enter a number..."
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Study Summary */}
          <div className="space-y-6">
            <Card variant="elevated" className="sticky top-8">
              <CardHeader title="Study Details" />
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <Clock className="w-5 h-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-600">Duration</p>
                      <p className="font-medium">{study.configuration.duration} minutes</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <DollarSign className="w-5 h-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-600">Compensation</p>
                      <p className="font-medium">${study.configuration.compensation}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <Users className="w-5 h-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-600">Participants</p>
                      <p className="font-medium">
                        {study.participants.enrolled}/{study.configuration.maxParticipants}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t">
                  <p className="text-sm text-gray-600 mb-2">Researcher</p>
                  <p className="font-medium">{study.researcher.name}</p>
                </div>

                <Button
                  onClick={handleSubmitApplication}
                  disabled={
                    submitting || 
                    checkingApplication ||
                    !!existingApplication ||
                    study.participants.enrolled >= study.configuration.maxParticipants
                  }
                  className="w-full mt-6"
                >
                  {checkingApplication ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Checking...
                    </div>
                  ) : submitting ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Submitting...
                    </div>
                  ) : existingApplication ? (
                    `Already Applied (${existingApplication.status})`
                  ) : study.participants.enrolled >= study.configuration.maxParticipants ? (
                    'Study Full'
                  ) : (
                    'Submit Application'
                  )}
                </Button>
                
                {existingApplication && (
                  <div className="mt-4">
                    {/* Application Status Bar */}
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">Application Status</h3>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          existingApplication.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          existingApplication.status === 'approved' ? 'bg-green-100 text-green-800' :
                          existingApplication.status === 'rejected' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {existingApplication.status.charAt(0).toUpperCase() + existingApplication.status.slice(1)}
                        </span>
                      </div>
                      
                      {/* Progress Bar */}
                      <div className="mb-6">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700">Application Progress</span>
                          <span className="text-sm text-gray-500">
                            {existingApplication.status === 'pending' ? '1/3' :
                             existingApplication.status === 'approved' ? '3/3' :
                             existingApplication.status === 'rejected' ? '2/3' : '1/3'}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full transition-all duration-300 ${
                              existingApplication.status === 'pending' ? 'bg-yellow-500 w-1/3' :
                              existingApplication.status === 'approved' ? 'bg-green-500 w-full' :
                              existingApplication.status === 'rejected' ? 'bg-red-500 w-2/3' :
                              'bg-gray-400 w-1/3'
                            }`}
                          ></div>
                        </div>
                      </div>
                      
                      {/* Status Steps */}
                      <div className="space-y-3">
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center mr-3">
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                            </svg>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">Application Submitted</p>
                            <p className="text-sm text-gray-600">
                              {new Date(existingApplication.appliedAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                            existingApplication.status === 'pending' ? 'bg-yellow-500' :
                            existingApplication.status === 'approved' ? 'bg-green-500' :
                            existingApplication.status === 'rejected' ? 'bg-red-500' :
                            'bg-gray-300'
                          }`}>
                            {existingApplication.status === 'pending' ? (
                              <svg className="w-4 h-4 text-white animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                            ) : existingApplication.status === 'approved' ? (
                              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                              </svg>
                            ) : existingApplication.status === 'rejected' ? (
                              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
                              </svg>
                            ) : (
                              <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {existingApplication.status === 'pending' ? 'Under Review' :
                               existingApplication.status === 'approved' ? 'Application Approved' :
                               existingApplication.status === 'rejected' ? 'Application Declined' :
                               'Pending Review'}
                            </p>
                            <p className="text-sm text-gray-600">
                              {existingApplication.status === 'pending' ? 'Your application is being reviewed by the researcher' :
                               existingApplication.status === 'approved' ? 'Congratulations! Your application has been approved' :
                               existingApplication.status === 'rejected' ? 'Your application was not selected for this study' :
                               'Waiting for researcher review'}
                            </p>
                          </div>
                        </div>
                        
                        {existingApplication.status === 'approved' && (
                          <div className="flex items-center">
                            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center mr-3">
                              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                              </svg>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">Ready to Participate</p>
                              <p className="text-sm text-gray-600">You will receive further instructions soon</p>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {/* Action Button */}
                      {existingApplication.status === 'approved' && (
                        <div className="mt-6 pt-4 border-t">
                          <Link 
                            to={`/app/studies/${studyId}/session`}
                            className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors inline-block text-center"
                          >
                            Start Study Session
                          </Link>
                        </div>
                      )}
                      
                      {existingApplication.status === 'pending' && (
                        <div className="mt-6 pt-4 border-t">
                          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                            <div className="flex">
                              <svg className="w-5 h-5 text-yellow-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                              </svg>
                              <div>
                                <p className="text-yellow-800 font-medium">Application Sent to Researcher</p>
                                <p className="text-yellow-700 text-sm">We'll notify you once the researcher reviews your application. This typically takes 1-3 business days.</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudyApplicationPage;
