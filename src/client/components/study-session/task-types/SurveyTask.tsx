import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { 
  Star, 
  ChevronRight, 
  Clock,
  AlertTriangle
} from 'lucide-react';

interface Question {
  id: string;
  question: string;
  type: 'text' | 'textarea' | 'radio' | 'checkbox' | 'rating' | 'scale' | 'dropdown' | 'boolean';
  options?: string[];
  required: boolean;
  placeholder?: string;
  min?: number;
  max?: number;
  scaleLabels?: { min: string; max: string };
  validation?: {
    minLength?: number;
    maxLength?: number;
    pattern?: string;
  };
}

interface SurveyTaskProps {
  task: {
    _id: string;
    title: string;
    description: string;
    configuration?: {
      questions?: Question[];
      questionsPerPage?: number;
      instructions?: string;
    };
  };
  study: {
    title: string;
    settings?: {
      recordScreen?: boolean;
    };
  };
  session: {
    _id: string;
  };
  onComplete: (responses: Record<string, unknown>) => void;
  isRecording: boolean;
  taskVariant?: 'open_question' | 'opinion_scale' | 'simple_input' | 'multiple_choice' | 'yes_no';
}

type ResponseValue = string | number | boolean | string[];

// Type guard helpers
const isString = (value: ResponseValue): value is string => typeof value === 'string';
const isNumber = (value: ResponseValue): value is number => typeof value === 'number';
const isStringArray = (value: ResponseValue): value is string[] => Array.isArray(value);

export const SurveyTask: React.FC<SurveyTaskProps> = ({
  task,
  onComplete,
  isRecording,
  taskVariant
}) => {
  const [responses, setResponses] = useState<Record<string, ResponseValue>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [currentPage, setCurrentPage] = useState(0);
  const [startTime] = useState(new Date());
  const [timeSpent, setTimeSpent] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Generate questions based on task variant or use configured questions
  const generateQuestionsForVariant = (): Question[] => {
    if (taskVariant) {
      switch (taskVariant) {
        case 'open_question':
          return [{
            id: 'open_response',
            question: task.title || 'Please provide your response',
            type: 'textarea',
            required: true,
            placeholder: task.configuration?.instructions || 'Enter your response here...'
          }];
        
        case 'opinion_scale':
          return [{
            id: 'scale_rating',
            question: task.title || 'Please rate your opinion',
            type: 'rating',
            required: true,
            max: 5,
            scaleLabels: { min: 'Strongly Disagree', max: 'Strongly Agree' }
          }];
        
        case 'simple_input':
          return [{
            id: 'simple_input',
            question: task.title || 'Please provide your input',
            type: 'text',
            required: true,
            placeholder: task.configuration?.instructions || 'Enter your response...'
          }];
        
        case 'multiple_choice':
          return [{
            id: 'multiple_choice',
            question: task.title || 'Please select an option',
            type: 'radio',
            required: true,
            options: ['Option 1', 'Option 2', 'Option 3', 'Other']
          }];
        
        case 'yes_no':
          return [{
            id: 'yes_no',
            question: task.title || 'Please answer yes or no',
            type: 'boolean',
            required: true
          }];
      }
    }
    
    // Fallback to configured questions or default
    return task.configuration?.questions || [
      {
        id: 'q1',
        question: 'How would you rate your overall experience?',
        type: 'rating',
        required: true,
        max: 5
      },
      {
        id: 'q2',
        question: 'What did you like most about this experience?',
        type: 'textarea',
        required: false,
        placeholder: 'Please share your thoughts...'
      }
    ];
  };

  // Extract questions from task configuration or generate based on variant
  const questions: Question[] = generateQuestionsForVariant();

  // Pagination settings
  const questionsPerPage = task.configuration?.questionsPerPage || 5;
  const totalPages = Math.ceil(questions.length / questionsPerPage);
  const currentQuestions = questions.slice(
    currentPage * questionsPerPage,
    (currentPage + 1) * questionsPerPage
  );

  // Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeSpent(Math.floor((new Date().getTime() - startTime.getTime()) / 1000));
    }, 1000);

    return () => clearInterval(timer);
  }, [startTime]);
  // Handle response changes
  const handleResponseChange = (questionId: string, value: string | number | boolean | string[]) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: value
    }));

    // Clear error if response is provided
    if (errors[questionId] && value !== '' && value !== null && value !== undefined) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[questionId];
        return newErrors;
      });
    }
  };

  // Validate current page
  const validateCurrentPage = (): boolean => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    currentQuestions.forEach(question => {
      if (question.required) {
        const response = responses[question.id];
        
        if (response === undefined || response === null || response === '') {
          newErrors[question.id] = 'This question is required';
          isValid = false;
        } else if (question.type === 'checkbox' && Array.isArray(response) && response.length === 0) {
          newErrors[question.id] = 'Please select at least one option';
          isValid = false;
        }
      }      // Validation rules
      if (question.validation && responses[question.id]) {
        const response = responses[question.id];
        
        if (question.validation.minLength && isString(response) && response.length < question.validation.minLength) {
          newErrors[question.id] = `Minimum ${question.validation.minLength} characters required`;
          isValid = false;
        }
        
        if (question.validation.maxLength && isString(response) && response.length > question.validation.maxLength) {
          newErrors[question.id] = `Maximum ${question.validation.maxLength} characters allowed`;
          isValid = false;
        }
        
        if (question.validation.pattern && isString(response) && !new RegExp(question.validation.pattern).test(response)) {
          newErrors[question.id] = 'Invalid format';
          isValid = false;
        }
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  // Handle page navigation
  const goToNextPage = () => {
    if (validateCurrentPage()) {
      if (currentPage < totalPages - 1) {
        setCurrentPage(prev => prev + 1);
      } else {
        handleSubmit();
      }
    } else {
      toast.error('Please complete all required questions before continuing');
    }
  };

  const goToPreviousPage = () => {
    setCurrentPage(prev => Math.max(0, prev - 1));
  };

  // Submit survey
  const handleSubmit = async () => {
    if (!validateCurrentPage()) {
      toast.error('Please complete all required questions');
      return;
    }

    setIsSubmitting(true);

    try {
      const surveyData = {
        responses,
        metadata: {
          timeSpent,
          questionsAnswered: Object.keys(responses).length,
          totalQuestions: questions.length,
          startedAt: startTime,
          completedAt: new Date(),
          userAgent: navigator.userAgent,
          viewport: {
            width: window.innerWidth,
            height: window.innerHeight
          }
        }
      };

      await onComplete(surveyData);
    } catch (error) {
      console.error('Error submitting survey:', error);
      toast.error('Failed to submit survey. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render question based on type
  const renderQuestion = (question: Question) => {
    const hasError = !!errors[question.id];

    switch (question.type) {      case 'text':
        return (
          <input
            type="text"
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              hasError ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder={question.placeholder}
            value={isString(responses[question.id]) ? (responses[question.id] as string) : ''}
            onChange={(e) => handleResponseChange(question.id, e.target.value)}
          />
        );

      case 'textarea':
        return (
          <textarea
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none h-32 ${
              hasError ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder={question.placeholder}
            value={isString(responses[question.id]) ? (responses[question.id] as string) : ''}
            onChange={(e) => handleResponseChange(question.id, e.target.value)}
          />
        );

      case 'radio':
        return (
          <div className="space-y-3">
            {question.options?.map((option, index) => (
              <label key={index} className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name={question.id}
                  value={option}
                  checked={responses[question.id] === option}
                  onChange={(e) => handleResponseChange(question.id, e.target.value)}
                  className="w-5 h-5 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-gray-700">{option}</span>
              </label>
            ))}
          </div>
        );      case 'checkbox':
        return (
          <div className="space-y-3">
            {question.options?.map((option, index) => {
              const selectedOptions = isStringArray(responses[question.id]) ? (responses[question.id] as string[]) : [];
              return (
                <label key={index} className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedOptions.includes(option)}
                    onChange={(e) => {
                      const currentSelected = isStringArray(responses[question.id]) ? (responses[question.id] as string[]) : [];
                      let newSelected: string[];
                      if (e.target.checked) {
                        newSelected = [...currentSelected, option];
                      } else {
                        newSelected = currentSelected.filter((item: string) => item !== option);
                      }
                      handleResponseChange(question.id, newSelected);
                    }}
                    className="w-5 h-5 text-blue-600 focus:ring-blue-500 rounded"
                  />
                  <span className="text-gray-700">{option}</span>
                </label>
              );
            })}
          </div>
        );      case 'rating': {
        const maxRating = question.max || 5;
        const currentRating = isNumber(responses[question.id]) ? (responses[question.id] as number) : 0;
        return (
          <div className="flex items-center space-x-2">
            {[...Array(maxRating)].map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleResponseChange(question.id, index + 1)}
                className={`p-1 transition-colors ${
                  index < currentRating ? 'text-yellow-500' : 'text-gray-300 hover:text-yellow-400'
                }`}
              >
                <Star className="w-8 h-8 fill-current" />
              </button>
            ))}
            <span className="ml-4 text-gray-600">
              {currentRating > 0 ? `${currentRating}/${maxRating}` : 'No rating'}
            </span>
          </div>
        );
      }      case 'scale': {
        const min = question.min || 1;
        const max = question.max || 10;
        const currentValue = isNumber(responses[question.id]) ? (responses[question.id] as number) : min;
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>{question.scaleLabels?.min || min}</span>
              <span>{question.scaleLabels?.max || max}</span>
            </div>
            <input
              type="range"
              min={min}
              max={max}
              value={currentValue}
              onChange={(e) => handleResponseChange(question.id, parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="text-center">
              <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                {currentValue}
              </span>
            </div>
          </div>
        );
      }      case 'dropdown':
        return (
          <select
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              hasError ? 'border-red-500' : 'border-gray-300'
            }`}
            value={isString(responses[question.id]) ? (responses[question.id] as string) : ''}
            onChange={(e) => handleResponseChange(question.id, e.target.value)}
          >
            <option value="">Select an option...</option>
            {question.options?.map((option, index) => (
              <option key={index} value={option}>
                {option}
              </option>
            ))}
          </select>
        );

      case 'boolean':
        return (
          <div className="flex space-x-4">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                name={question.id}
                value="true"
                checked={responses[question.id] === 'true'}
                onChange={(e) => handleResponseChange(question.id, e.target.value)}
                className="w-5 h-5 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-gray-700">Yes</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                name={question.id}
                value="false"
                checked={responses[question.id] === 'false'}
                onChange={(e) => handleResponseChange(question.id, e.target.value)}
                className="w-5 h-5 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-gray-700">No</span>
            </label>
          </div>
        );

      default:
        return <div>Unsupported question type: {question.type}</div>;
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="p-6">
      {/* Survey Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">{task.title}</h2>
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <div className="flex items-center space-x-1">
              <Clock className="w-4 h-4" />
              <span>{formatTime(timeSpent)}</span>
            </div>
            {isRecording && (
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                <span>Recording</span>
              </div>
            )}
          </div>
        </div>

        {task.configuration?.instructions && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-blue-800">{task.configuration.instructions}</p>
          </div>
        )}

        {/* Progress indicator */}
        {totalPages > 1 && (
          <div className="mb-6">
            <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
              <span>Page {currentPage + 1} of {totalPages}</span>
              <span>{Object.keys(responses).length} of {questions.length} questions answered</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentPage + 1) / totalPages) * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Questions */}
      <div className="space-y-8">
        {currentQuestions.map((question, index) => (
          <div key={question.id} className="space-y-4">
            <div className="flex items-start space-x-3">
              <span className="inline-flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-800 rounded-full text-sm font-medium flex-shrink-0 mt-1">
                {currentPage * questionsPerPage + index + 1}
              </span>
              <div className="flex-1">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-medium text-gray-900 flex items-center">
                    {question.question}
                    {question.required && (
                      <span className="text-red-500 ml-1">*</span>
                    )}
                  </h3>
                  {question.required && (
                    <span className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded-full">
                      Required
                    </span>
                  )}
                </div>
                
                {renderQuestion(question)}
                
                {errors[question.id] && (
                  <div className="flex items-center space-x-2 mt-2 text-red-600">
                    <AlertTriangle className="w-4 h-4" />
                    <span className="text-sm">{errors[question.id]}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-8 mt-8 border-t border-gray-200">
        <button
          onClick={goToPreviousPage}
          disabled={currentPage === 0}
          className={`px-6 py-3 rounded-lg font-medium ${
            currentPage === 0
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-gray-600 text-white hover:bg-gray-700'
          }`}
        >
          Previous
        </button>

        <div className="text-sm text-gray-600">
          {Object.keys(responses).length} of {questions.length} questions completed
        </div>

        <button
          onClick={goToNextPage}
          disabled={isSubmitting}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Submitting...</span>
            </>
          ) : (
            <>
              <span>{currentPage === totalPages - 1 ? 'Complete Survey' : 'Next'}</span>
              <ChevronRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};
