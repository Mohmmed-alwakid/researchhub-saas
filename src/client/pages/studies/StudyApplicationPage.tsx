import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, DollarSign, Users, CheckCircle, AlertCircle } from 'lucide-react';
import { participantApplicationsService } from '../../services/participantApplications.service';
import { studiesService } from '../../services/studies.service';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import toast from 'react-hot-toast';

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
  const { studyId } = useParams<{ studyId: string }>();
  const navigate = useNavigate();
  const [study, setStudy] = useState<StudyDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [screeningResponses, setScreeningResponses] = useState<Record<string, string>>({});
  const fetchStudyDetails = async () => {
    try {
      setLoading(true);
      const response = await studiesService.getStudy(studyId!);
      setStudy(response.study as unknown as StudyDetails);
    } catch (error) {
      console.error('Failed to fetch study details:', error);
      toast.error('Failed to load study details');
      navigate('/app/discover-studies');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (studyId) {
      fetchStudyDetails();
    }
  }, [studyId, fetchStudyDetails]);

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
      navigate('/app/my-applications');    } catch (error) {
      console.error('Failed to submit application:', error);
      const errorMessage = error instanceof Error && 'response' in error && 
        typeof error.response === 'object' && error.response !== null &&
        'data' in error.response && 
        typeof error.response.data === 'object' && error.response.data !== null &&
        'message' in error.response.data 
        ? String(error.response.data.message)
        : 'Failed to submit application';
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
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
                  disabled={submitting || study.participants.enrolled >= study.configuration.maxParticipants}
                  className="w-full mt-6"
                >
                  {submitting ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Submitting...
                    </div>
                  ) : study.participants.enrolled >= study.configuration.maxParticipants ? (
                    'Study Full'
                  ) : (
                    'Submit Application'
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudyApplicationPage;
