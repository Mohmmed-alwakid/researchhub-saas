import React from 'react';
import { CheckCircle, Circle, AlertCircle, Clock, Users, Settings, Play } from 'lucide-react';


interface ProgressStep {
  id: string;
  title: string;
  description: string;
  status: 'completed' | 'current' | 'pending' | 'error';
  icon: React.ComponentType<{ className?: string }>;
  requiredFields?: string[];
  estimatedTime?: string;
}

interface StudyBuilderProgressProps {
  currentStep: string;
  studyData: {
    title?: string;
    description?: string;
    type?: string;
    tasks?: unknown[];
    settings?: Record<string, unknown>;
  };
  onStepClick?: (stepId: string) => void;
  className?: string;
}

export const StudyBuilderProgress: React.FC<StudyBuilderProgressProps> = ({
  currentStep,
  studyData,
  onStepClick,
  className = ''
}) => {
  const steps: ProgressStep[] = [
    {
      id: 'basics',
      title: 'Study Basics',
      description: 'Set title, description, and study type',
      status: 'completed',
      icon: Settings,
      requiredFields: ['title', 'description', 'type'],
      estimatedTime: '2 min'
    },
    {
      id: 'tasks',
      title: 'Add Tasks',
      description: 'Choose and configure study tasks',
      status: 'current',
      icon: Users,
      requiredFields: ['tasks'],
      estimatedTime: '5 min'
    },
    {
      id: 'settings',
      title: 'Study Settings',
      description: 'Configure recording and timing options',
      status: 'pending',
      icon: Settings,
      requiredFields: ['settings'],
      estimatedTime: '3 min'
    },
    {
      id: 'review',
      title: 'Review & Launch',
      description: 'Preview and publish your study',
      status: 'pending',
      icon: Play,
      estimatedTime: '2 min'
    }
  ];

  const getStepStatus = (step: ProgressStep): ProgressStep['status'] => {
    // Check if required fields are completed
    const isCompleted = step.requiredFields?.every(field => {
      const value = studyData[field as keyof typeof studyData];
      if (Array.isArray(value)) {
        return value.length > 0;
      }
      return value && value !== '';
    });

    if (step.id === currentStep) {
      return 'current';
    } else if (isCompleted) {
      return 'completed';
    } else if (steps.findIndex(s => s.id === currentStep) > steps.findIndex(s => s.id === step.id)) {
      return 'error'; // Step should be completed but isn't
    } else {
      return 'pending';
    }
  };

  const getStepIcon = (step: ProgressStep) => {
    const status = getStepStatus(step);
    const IconComponent = step.icon;

    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'current':
        return <IconComponent className="w-5 h-5 text-blue-600" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      case 'pending':
      default:
        return <Circle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStepStyles = (step: ProgressStep) => {
    const status = getStepStatus(step);
    const isClickable = onStepClick && (status === 'completed' || status === 'current');

    const baseStyles = `relative flex items-center gap-4 p-4 rounded-lg transition-all ${
      isClickable ? 'cursor-pointer' : 'cursor-default'
    }`;

    switch (status) {
      case 'completed':
        return `${baseStyles} bg-green-50 border border-green-200 ${
          isClickable ? 'hover:bg-green-100' : ''
        }`;
      case 'current':
        return `${baseStyles} bg-blue-50 border-2 border-blue-300 ${
          isClickable ? 'hover:bg-blue-100' : ''
        }`;
      case 'error':
        return `${baseStyles} bg-red-50 border border-red-200 ${
          isClickable ? 'hover:bg-red-100' : ''
        }`;
      case 'pending':
      default:
        return `${baseStyles} bg-gray-50 border border-gray-200`;
    }
  };

  const getCompletionPercentage = () => {
    const completedSteps = steps.filter(step => getStepStatus(step) === 'completed').length;
    return Math.round((completedSteps / steps.length) * 100);
  };

  const getTotalEstimatedTime = () => {
    const pendingSteps = steps.filter(step => 
      getStepStatus(step) === 'pending' || getStepStatus(step) === 'current'
    );
    
    if (pendingSteps.length === 0) return '0 min';
    
    const totalMinutes = pendingSteps.reduce((total, step) => {
      const time = step.estimatedTime?.match(/(\d+)/);
      return total + (time ? parseInt(time[1]) : 0);
    }, 0);
    
    return `${totalMinutes} min`;
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Progress Header */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900">Study Progress</h3>
          <span className="text-sm text-gray-600">{getCompletionPercentage()}% Complete</span>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${getCompletionPercentage()}%` }}
          ></div>
        </div>

        <div className="flex items-center justify-between text-sm text-gray-600">
          <span className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {getTotalEstimatedTime()} remaining
          </span>
          <span>{steps.filter(s => getStepStatus(s) === 'completed').length} of {steps.length} steps complete</span>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="space-y-3">
        {steps.map((step, index) => {
          const status = getStepStatus(step);
          const isClickable = onStepClick && (status === 'completed' || status === 'current');

          return (
            <div
              key={step.id}
              className={getStepStyles(step)}
              onClick={isClickable ? () => onStepClick(step.id) : undefined}
            >
              {/* Step Icon */}
              <div className="flex-shrink-0">
                {getStepIcon(step)}
              </div>

              {/* Step Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h4 className={`font-medium ${
                    status === 'completed' ? 'text-green-900' :
                    status === 'current' ? 'text-blue-900' :
                    status === 'error' ? 'text-red-900' :
                    'text-gray-600'
                  }`}>
                    {step.title}
                  </h4>
                  {step.estimatedTime && status === 'pending' && (
                    <span className="text-xs text-gray-500">{step.estimatedTime}</span>
                  )}
                </div>
                <p className={`text-sm ${
                  status === 'completed' ? 'text-green-700' :
                  status === 'current' ? 'text-blue-700' :
                  status === 'error' ? 'text-red-700' :
                  'text-gray-500'
                }`}>
                  {step.description}
                </p>

                {/* Step Status Messages */}
                {status === 'current' && (
                  <div className="mt-2 text-xs text-blue-600 font-medium">
                    Current step - Click to continue
                  </div>
                )}
                {status === 'error' && (
                  <div className="mt-2 text-xs text-red-600 font-medium">
                    Missing required information
                  </div>
                )}
                {status === 'completed' && (
                  <div className="mt-2 text-xs text-green-600 font-medium">
                    ✓ Completed
                  </div>
                )}
              </div>

              {/* Step Number */}
              <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                status === 'completed' ? 'bg-green-600 text-white' :
                status === 'current' ? 'bg-blue-600 text-white' :
                status === 'error' ? 'bg-red-600 text-white' :
                'bg-gray-300 text-gray-600'
              }`}>
                {index + 1}
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      {getCompletionPercentage() < 100 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">💡 Quick Tips</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Save your progress frequently</li>
            <li>• Preview your study before launching</li>
            <li>• Test with a small audience first</li>
          </ul>
        </div>
      )}

      {getCompletionPercentage() === 100 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h4 className="font-medium text-green-900 mb-2">🎉 Ready to Launch!</h4>
          <p className="text-sm text-green-700 mb-3">
            Your study is complete and ready for participants.
          </p>
          <button className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors">
            Launch Study
          </button>
        </div>
      )}
    </div>
  );
};

export default StudyBuilderProgress;
