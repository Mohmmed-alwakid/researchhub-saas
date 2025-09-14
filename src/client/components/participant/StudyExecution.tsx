import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Play, 
  Clock, 
  AlertCircle,
  Save,
  ArrowLeft,
  ArrowRight
} from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import toast from 'react-hot-toast';

// Types for study execution
interface StudySession {
  id: string;
  studyId: string;
  participantId: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'paused' | 'abandoned';
  currentBlockIndex: number;
  startedAt?: string;
  completedAt?: string;
  responses: Record<string, any>;
  metadata: {
    userAgent: string;
    screenResolution: string;
    timeZone: string;
  };
}

interface StudyBlock {
  id: string;
  type: 'instruction' | 'question' | 'task' | 'media' | 'survey' | 'break';
  title: string;
  content: string;
  config: Record<string, any>;
  required: boolean;
  timeLimit?: number;
  order: number;
}

interface Study {
  id: string;
  title: string;
  description: string;
  type: string;
  duration: number;
  compensation: number;
  status: string;
  blocks: StudyBlock[];
  instructions: string[];
  researcherName: string;
  researcherOrganization: string;
}

// API service for study execution
class StudyExecutionAPI {
  private authClient: any;
  private baseUrl: string;

  constructor(authClient: any, baseUrl = 'http://localhost:3003/api') {
    this.authClient = authClient;
    this.baseUrl = baseUrl;
  }

  async getStudy(studyId: string): Promise<Study> {
    // Mock implementation with comprehensive study data
    return {
      id: studyId,
      title: 'E-commerce Website Usability Test',
      description: 'Help us improve our online shopping experience by testing key user flows and providing feedback.',
      type: 'usability',
      duration: 45,
      compensation: 50,
      status: 'active',
      blocks: [
        {
          id: 'block-1',
          type: 'instruction',
          title: 'Welcome & Setup',
          content: 'Welcome to our usability study! In this session, you\'ll be testing an e-commerce website to help us understand how users interact with online shopping platforms.\n\nPlease ensure you:\n• Have a stable internet connection\n• Are in a quiet environment\n• Have your audio enabled\n\nThis study will take approximately 45 minutes to complete.',
          config: { showProgress: true },
          required: true,
          order: 1
        },
        {
          id: 'block-2',
          type: 'question',
          title: 'Pre-Study Questions',
          content: 'Before we begin, please answer a few questions about your online shopping habits.',
          config: {
            questions: [
              {
                id: 'freq',
                type: 'radio',
                question: 'How often do you shop online?',
                options: ['Daily', 'Weekly', 'Monthly', 'Rarely', 'Never']
              },
              {
                id: 'devices',
                type: 'checkbox',
                question: 'Which devices do you typically use for online shopping?',
                options: ['Desktop/Laptop', 'Smartphone', 'Tablet', 'Smart TV']
              },
              {
                id: 'experience',
                type: 'scale',
                question: 'Rate your overall online shopping experience',
                min: 1,
                max: 5,
                labels: ['Very Poor', 'Poor', 'Average', 'Good', 'Excellent']
              }
            ]
          },
          required: true,
          order: 2
        },
        {
          id: 'block-3',
          type: 'task',
          title: 'Task 1: Product Search',
          content: 'Your first task is to find a specific product on the website. Please navigate to the website and search for "wireless headphones under $100".',
          config: {
            url: 'https://demo-ecommerce.vercel.app',
            instructions: [
              'Click on the website link provided',
              'Use the search function to find wireless headphones',
              'Filter results to show only items under $100',
              'Think aloud as you perform these actions'
            ],
            trackClicks: true,
            recordScreen: true
          },
          required: true,
          timeLimit: 600, // 10 minutes
          order: 3
        },
        {
          id: 'block-4',
          type: 'question',
          title: 'Task 1 Feedback',
          content: 'Please share your thoughts about the search experience.',
          config: {
            questions: [
              {
                id: 'search_ease',
                type: 'scale',
                question: 'How easy was it to find the search function?',
                min: 1,
                max: 5,
                labels: ['Very Difficult', 'Difficult', 'Neutral', 'Easy', 'Very Easy']
              },
              {
                id: 'search_results',
                type: 'textarea',
                question: 'What did you think about the search results? Any suggestions for improvement?',
                placeholder: 'Please provide detailed feedback...'
              }
            ]
          },
          required: true,
          order: 4
        },
        {
          id: 'block-5',
          type: 'break',
          title: 'Short Break',
          content: 'Great job! Take a 2-minute break before we continue with the next task.',
          config: { duration: 120 },
          required: false,
          order: 5
        },
        {
          id: 'block-6',
          type: 'task',
          title: 'Task 2: Product Purchase Flow',
          content: 'Now, please select one of the headphones from your search results and go through the purchase process (but don\'t actually complete the purchase).',
          config: {
            url: 'https://demo-ecommerce.vercel.app',
            instructions: [
              'Select a product from your previous search',
              'Add it to your cart',
              'Proceed to checkout',
              'Fill in fake information (DO NOT use real payment details)',
              'Stop before completing the actual purchase'
            ],
            trackClicks: true,
            recordScreen: true
          },
          required: true,
          timeLimit: 900, // 15 minutes
          order: 6
        },
        {
          id: 'block-7',
          type: 'survey',
          title: 'Final Survey',
          content: 'Thank you for completing the tasks! Please answer these final questions about your overall experience.',
          config: {
            questions: [
              {
                id: 'overall_satisfaction',
                type: 'scale',
                question: 'Overall, how would you rate this website?',
                min: 1,
                max: 10,
                labels: ['Terrible', 'Excellent']
              },
              {
                id: 'recommendation',
                type: 'radio',
                question: 'Would you recommend this website to a friend?',
                options: ['Definitely yes', 'Probably yes', 'Not sure', 'Probably no', 'Definitely no']
              },
              {
                id: 'improvements',
                type: 'textarea',
                question: 'What improvements would you suggest for this website?',
                placeholder: 'Please provide specific suggestions...'
              },
              {
                id: 'additional_feedback',
                type: 'textarea',
                question: 'Any additional feedback about this study or the website?',
                placeholder: 'Optional: Share any other thoughts...',
                required: false
              }
            ]
          },
          required: true,
          order: 7
        }
      ],
      instructions: [
        'Please read all instructions carefully before proceeding',
        'Think aloud during tasks - your verbal feedback is valuable',
        'If you encounter any technical issues, please note them',
        'Take your time - there\'s no need to rush',
        'Be honest in your feedback - both positive and negative comments help'
      ],
      researcherName: 'Dr. Sarah Johnson',
      researcherOrganization: 'University of Technology'
    };
  }

  async getSession(studyId: string): Promise<StudySession | null> {
    // Mock implementation - in real app, this would fetch from backend
    const existingSession = localStorage.getItem(`study_session_${studyId}`);
    if (existingSession) {
      return JSON.parse(existingSession);
    }
    return null;
  }

  async createSession(studyId: string): Promise<StudySession> {
    const session: StudySession = {
      id: `session_${Date.now()}`,
      studyId,
      participantId: 'participant_123', // Would come from auth
      status: 'not_started',
      currentBlockIndex: 0,
      responses: {},
      metadata: {
        userAgent: navigator.userAgent,
        screenResolution: `${window.screen.width}x${window.screen.height}`,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
      }
    };

    localStorage.setItem(`study_session_${studyId}`, JSON.stringify(session));
    return session;
  }

  async updateSession(session: StudySession): Promise<StudySession> {
    localStorage.setItem(`study_session_${session.studyId}`, JSON.stringify(session));
    return session;
  }

  async saveResponse(sessionId: string, blockId: string, response: any): Promise<void> {
    // Mock implementation - in real app, this would save to backend
    console.log('Saving response:', { sessionId, blockId, response });
  }

  async completeSession(sessionId: string): Promise<void> {
    // Mock implementation - in real app, this would mark session as complete
    console.log('Completing session:', sessionId);
    toast.success('Study completed! Thank you for your participation.');
  }
}

// Loading component
const ExecutionLoading: React.FC<{ message?: string }> = ({ message = 'Loading study...' }) => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
      <p className="text-gray-600">{message}</p>
    </div>
  </div>
);

// Progress indicator
const ProgressIndicator: React.FC<{ current: number; total: number; className?: string }> = ({ 
  current, 
  total, 
  className = '' 
}) => (
  <div className={`bg-white rounded-lg shadow-sm p-4 ${className}`}>
    <div className="flex justify-between items-center mb-2">
      <span className="text-sm font-medium text-gray-700">Progress</span>
      <span className="text-sm text-gray-500">{current} of {total}</span>
    </div>
    <div className="w-full bg-gray-200 rounded-full h-2">
      <div 
        className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
        style={{ width: `${(current / total) * 100}%` }}
      />
    </div>
  </div>
);

// Block renderers
const InstructionBlock: React.FC<{ 
  block: StudyBlock; 
  onNext: () => void; 
}> = ({ block, onNext }) => (
  <div className="max-w-4xl mx-auto">
    <div className="bg-white rounded-lg shadow-sm p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">{block.title}</h2>
      <div className="prose max-w-none mb-8">
        {block.content.split('\n').map((paragraph, index) => (
          <p key={index} className="mb-4 text-gray-700">{paragraph}</p>
        ))}
      </div>
      <div className="flex justify-end">
        <button
          onClick={onNext}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
        >
          Continue
          <ArrowRight className="ml-2 w-4 h-4" />
        </button>
      </div>
    </div>
  </div>
);

const QuestionBlock: React.FC<{ 
  block: StudyBlock; 
  responses: Record<string, any>;
  onResponse: (responses: Record<string, any>) => void;
  onNext: () => void; 
}> = ({ block, responses, onResponse, onNext }) => {
  const [blockResponses, setBlockResponses] = useState<Record<string, any>>(responses[block.id] || {});
  const questions = block.config.questions || [];

  const handleResponseChange = (questionId: string, value: any) => {
    const updated = { ...blockResponses, [questionId]: value };
    setBlockResponses(updated);
    onResponse({ ...responses, [block.id]: updated });
  };

  const isComplete = questions.filter(q => q.required !== false).every(q => 
    blockResponses[q.id] !== undefined && blockResponses[q.id] !== ''
  );

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">{block.title}</h2>
        <p className="text-gray-700 mb-8">{block.content}</p>
        
        <div className="space-y-8">
          {questions.map((question) => (
            <div key={question.id} className="border-b border-gray-200 pb-6">
              <label className="block text-lg font-medium text-gray-900 mb-4">
                {question.question}
                {question.required !== false && <span className="text-red-500 ml-1">*</span>}
              </label>
              
              {question.type === 'radio' && (
                <div className="space-y-3">
                  {question.options.map((option: string) => (
                    <label key={option} className="flex items-center">
                      <input
                        type="radio"
                        name={question.id}
                        value={option}
                        checked={blockResponses[question.id] === option}
                        onChange={(e) => handleResponseChange(question.id, e.target.value)}
                        className="mr-3 text-blue-600"
                      />
                      <span className="text-gray-700">{option}</span>
                    </label>
                  ))}
                </div>
              )}
              
              {question.type === 'checkbox' && (
                <div className="space-y-3">
                  {question.options.map((option: string) => (
                    <label key={option} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={(blockResponses[question.id] || []).includes(option)}
                        onChange={(e) => {
                          const current = blockResponses[question.id] || [];
                          const updated = e.target.checked 
                            ? [...current, option]
                            : current.filter((item: string) => item !== option);
                          handleResponseChange(question.id, updated);
                        }}
                        className="mr-3 text-blue-600"
                      />
                      <span className="text-gray-700">{option}</span>
                    </label>
                  ))}
                </div>
              )}
              
              {question.type === 'scale' && (
                <div className="space-y-4">
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>{question.labels[0]}</span>
                    <span>{question.labels[1]}</span>
                  </div>
                  <div className="flex justify-between">
                    {Array.from({ length: question.max - question.min + 1 }, (_, i) => i + question.min).map((value) => (
                      <label key={value} className="flex flex-col items-center">
                        <input
                          type="radio"
                          name={question.id}
                          value={value}
                          checked={blockResponses[question.id] === value}
                          onChange={(e) => handleResponseChange(question.id, parseInt(e.target.value))}
                          className="mb-2 text-blue-600"
                        />
                        <span className="text-sm text-gray-600">{value}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
              
              {question.type === 'textarea' && (
                <textarea
                  value={blockResponses[question.id] || ''}
                  onChange={(e) => handleResponseChange(question.id, e.target.value)}
                  placeholder={question.placeholder}
                  rows={4}
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              )}
            </div>
          ))}
        </div>
        
        <div className="flex justify-between mt-8">
          <button
            onClick={() => window.history.back()}
            className="text-gray-600 hover:text-gray-800 flex items-center"
          >
            <ArrowLeft className="mr-2 w-4 h-4" />
            Back
          </button>
          <button
            onClick={onNext}
            disabled={!isComplete}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center"
          >
            Continue
            <ArrowRight className="ml-2 w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

const TaskBlock: React.FC<{ 
  block: StudyBlock; 
  onNext: () => void; 
}> = ({ block, onNext }) => {
  const [timeLeft, setTimeLeft] = useState(block.timeLimit || 0);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(time => time - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const startTask = () => {
    setIsActive(true);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">{block.title}</h2>
          {block.timeLimit && (
            <div className="flex items-center space-x-2 text-orange-600">
              <Clock className="w-5 h-5" />
              <span className="font-mono text-lg">{formatTime(timeLeft)}</span>
            </div>
          )}
        </div>
        
        <p className="text-gray-700 mb-6">{block.content}</p>
        
        {block.config.instructions && (
          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-blue-900 mb-3">Instructions:</h3>
            <ul className="space-y-2">
              {block.config.instructions.map((instruction: string, index: number) => (
                <li key={index} className="flex items-start text-blue-800">
                  <span className="bg-blue-200 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium mr-3 mt-0.5 flex-shrink-0">
                    {index + 1}
                  </span>
                  {instruction}
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {block.config.url && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-600 mb-2">Website URL:</p>
            <a 
              href={block.config.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 font-medium break-all"
            >
              {block.config.url}
            </a>
          </div>
        )}
        
        <div className="flex justify-between">
          <button
            onClick={() => window.history.back()}
            className="text-gray-600 hover:text-gray-800 flex items-center"
          >
            <ArrowLeft className="mr-2 w-4 h-4" />
            Back
          </button>
          
          <div className="flex space-x-4">
            {!isActive && timeLeft > 0 && (
              <button
                onClick={startTask}
                className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center"
              >
                <Play className="mr-2 w-4 h-4" />
                Start Task
              </button>
            )}
            
            <button
              onClick={onNext}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
            >
              Task Complete
              <ArrowRight className="ml-2 w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const BreakBlock: React.FC<{ 
  block: StudyBlock; 
  onNext: () => void; 
}> = ({ block, onNext }) => {
  const [timeLeft, setTimeLeft] = useState(block.config.duration || 60);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(time => {
        if (time <= 1) {
          clearInterval(interval);
          return 0;
        }
        return time - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm p-8 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">{block.title}</h2>
        <p className="text-gray-700 mb-8">{block.content}</p>
        
        <div className="bg-blue-50 rounded-lg p-6 mb-8">
          <div className="text-4xl font-mono text-blue-600 mb-2">{formatTime(timeLeft)}</div>
          <p className="text-blue-800">Take a moment to rest and relax</p>
        </div>
        
        <div className="flex justify-center space-x-4">
          <button
            onClick={onNext}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
          >
            Continue Early
            <ArrowRight className="ml-2 w-4 h-4" />
          </button>
        </div>
        
        {timeLeft === 0 && (
          <div className="mt-4">
            <button
              onClick={onNext}
              className="bg-green-600 text-white px-8 py-4 rounded-lg hover:bg-green-700 transition-colors text-lg font-medium flex items-center mx-auto"
            >
              Break Complete - Continue
              <ArrowRight className="ml-2 w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// Main Study Execution Component
export const StudyExecution: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { studyId } = useParams<{ studyId: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const hasRole = useCallback((_role: string) => true, []); // Simplified for now
  const authClient = null; // Simplified for now
  
  const [study, setStudy] = useState<Study | null>(null);
  const [session, setSession] = useState<StudySession | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentBlock, setCurrentBlock] = useState<StudyBlock | null>(null);
  const [responses, setResponses] = useState<Record<string, any>>({});

  const api = useMemo(() => new StudyExecutionAPI(authClient), [authClient]);

  // Initialize study and session
  useEffect(() => {
    const initializeStudy = async () => {
      if (!studyId) {
        navigate('/app/discover');
        return;
      }

      try {
        setLoading(true);
        
        // Load study data
        const studyData = await api.getStudy(studyId);
        setStudy(studyData);
        
        // Load or create session
        let sessionData = await api.getSession(studyId);
        if (!sessionData) {
          sessionData = await api.createSession(studyId);
        }
        
        setSession(sessionData);
        setResponses(sessionData.responses);
        
        // Set current block
        const currentBlockData = studyData.blocks[sessionData.currentBlockIndex];
        setCurrentBlock(currentBlockData);
        
      } catch (error) {
        console.error('Failed to initialize study:', error);
        toast.error('Failed to load study');
        navigate('/app/discover');
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated && hasRole('participant')) {
      initializeStudy();
    }
  }, [studyId, isAuthenticated, hasRole, navigate, api]);

  const handleNext = useCallback(async () => {
    if (!study || !session || !currentBlock) return;

    const nextIndex = session.currentBlockIndex + 1;
    
    if (nextIndex >= study.blocks.length) {
      // Study completed
      const updatedSession = {
        ...session,
        status: 'completed' as const,
        completedAt: new Date().toISOString()
      };
      
      await api.updateSession(updatedSession);
      await api.completeSession(session.id);
      
      navigate('/app/participant-dashboard');
      return;
    }

    // Move to next block
    const updatedSession = {
      ...session,
      currentBlockIndex: nextIndex,
      status: 'in_progress' as const,
      responses
    };
    
    setSession(updatedSession);
    setCurrentBlock(study.blocks[nextIndex]);
    await api.updateSession(updatedSession);
    
  }, [study, session, currentBlock, responses, api, navigate]);

  const handleResponseUpdate = useCallback((newResponses: Record<string, any>) => {
    setResponses(newResponses);
  }, []);

  const handleSaveAndExit = useCallback(async () => {
    if (!session) return;

    const updatedSession = {
      ...session,
      status: 'paused' as const,
      responses
    };
    
    await api.updateSession(updatedSession);
    toast.success('Progress saved');
    navigate('/app/participant-dashboard');
  }, [session, responses, api, navigate]);

  // Authentication check
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Please log in to continue</p>
          <button
            onClick={() => navigate('/login')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  if (!hasRole('participant')) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">This page is only accessible to study participants.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return <ExecutionLoading />;
  }

  if (!study || !session || !currentBlock) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Study Not Found</h2>
          <p className="text-gray-600 mb-4">The requested study could not be loaded.</p>
          <button
            onClick={() => navigate('/app/discover')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
          >
            Back to Studies
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gray-50 ${className}`}>
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">{study.title}</h1>
              <p className="text-sm text-gray-600">
                {study.researcherName} • {study.researcherOrganization}
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <ProgressIndicator 
                current={session.currentBlockIndex + 1} 
                total={study.blocks.length}
                className="shadow-none"
              />
              
              <button
                onClick={handleSaveAndExit}
                className="text-gray-600 hover:text-gray-800 flex items-center text-sm"
              >
                <Save className="w-4 h-4 mr-1" />
                Save & Exit
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentBlock.type === 'instruction' && (
          <InstructionBlock 
            block={currentBlock}
            onNext={handleNext}
          />
        )}
        
        {(currentBlock.type === 'question' || currentBlock.type === 'survey') && (
          <QuestionBlock 
            block={currentBlock}
            responses={responses}
            onResponse={handleResponseUpdate}
            onNext={handleNext}
          />
        )}
        
        {currentBlock.type === 'task' && (
          <TaskBlock 
            block={currentBlock}
            onNext={handleNext}
          />
        )}
        
        {currentBlock.type === 'break' && (
          <BreakBlock 
            block={currentBlock}
            onNext={handleNext}
          />
        )}
      </div>
    </div>
  );
};

export default StudyExecution;
