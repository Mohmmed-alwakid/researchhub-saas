import React, { useState, useEffect, useRef } from 'react';
import { MousePointer, Eye, Clock, Target, BarChart3, CheckCircle, ExternalLink } from 'lucide-react';

interface ClickTrackingTaskProps {
  task: {
    _id: string;
    title: string;
    description: string;
    configuration?: {
      targetUrl?: string;
      targetSelectors?: string[];
      instructions?: string;
      timeLimit?: number;
      trackClicks?: boolean;
      trackHovers?: boolean;
      trackScrolling?: boolean;
      minClicks?: number;
      questions?: Array<{
        id: string;
        question: string;
        type: 'text' | 'rating' | 'multiple-choice' | 'boolean';
        required?: boolean;
        options?: string[];
      }>;
    };
  };  
  study: { title: string; settings?: Record<string, unknown> };
  session: { _id: string };
  onComplete: (metadata: Record<string, unknown>) => void;
  isRecording: boolean;
  taskVariant?: 'five_second_test';
}

interface ClickEvent {
  timestamp: number;
  x: number;
  y: number;
  target: string;
  tagName: string;
  id?: string;
  className?: string;
  innerText?: string;
}

interface UsabilityMetadata {
  clicks: ClickEvent[];
  hovers: Array<{ timestamp: number; target: string; duration: number }>;
  scrollEvents: Array<{ timestamp: number; scrollY: number; scrollX: number }>;
  timeSpent: number;
  taskCompleted: boolean;
  targetUrl?: string;
  startTime: Date;
  endTime?: Date;
  responses: Record<string, unknown>;
}

export const ClickTrackingTask: React.FC<ClickTrackingTaskProps> = ({
  task,
  onComplete,
  isRecording,
  taskVariant
}) => {
  const [startTime] = useState(new Date());
  const [timeSpent, setTimeSpent] = useState(0);
  const [taskCompleted, setTaskCompleted] = useState(false);
  const [isTracking, setIsTracking] = useState(false);
  const [metadata, setMetadata] = useState<UsabilityMetadata>({
    clicks: [],
    hovers: [],
    scrollEvents: [],
    timeSpent: 0,
    taskCompleted: false,
    startTime: new Date(),
    responses: {}
  });
  const [responses, setResponses] = useState<Record<string, unknown>>({});
  
  const trackingAreaRef = useRef<HTMLDivElement>(null);
  const hoverTimeouts = useRef<Map<string, number>>(new Map());

  const targetUrl = task.configuration?.targetUrl;
  const instructions = task.configuration?.instructions || 'Complete the usability task by interacting with the interface.';
  const timeLimit = task.configuration?.timeLimit;
  const minClicks = task.configuration?.minClicks || 0;
  const questions = task.configuration?.questions || [];

  // Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeSpent(Math.floor((new Date().getTime() - startTime.getTime()) / 1000));
    }, 1000);

    return () => clearInterval(timer);
  }, [startTime]);

  // Click tracking
  useEffect(() => {
    if (!isTracking) return;

    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const clickEvent: ClickEvent = {
        timestamp: Date.now(),
        x: event.clientX,
        y: event.clientY,
        target: target.outerHTML.substring(0, 200),
        tagName: target.tagName,
        id: target.id,
        className: target.className,
        innerText: target.innerText?.substring(0, 100)
      };

      setMetadata(prev => ({
        ...prev,
        clicks: [...prev.clicks, clickEvent]
      }));
    };

    const handleHover = (event: MouseEvent) => {
      if (!task.configuration?.trackHovers) return;
      
      const target = event.target as HTMLElement;
      const targetKey = `${target.tagName}_${target.className}_${target.id}`;
      
      // Start hover timer
      if (event.type === 'mouseenter') {
        hoverTimeouts.current.set(targetKey, Date.now());
      } else if (event.type === 'mouseleave') {
        const startTime = hoverTimeouts.current.get(targetKey);
        if (startTime) {
          const duration = Date.now() - startTime;
          setMetadata(prev => ({
            ...prev,
            hovers: [...prev.hovers, {
              timestamp: Date.now(),
              target: target.outerHTML.substring(0, 200),
              duration
            }]
          }));
          hoverTimeouts.current.delete(targetKey);
        }
      }
    };

    const handleScroll = () => {
      if (!task.configuration?.trackScrolling) return;
      
      setMetadata(prev => ({
        ...prev,
        scrollEvents: [...prev.scrollEvents, {
          timestamp: Date.now(),
          scrollY: window.scrollY,
          scrollX: window.scrollX
        }]
      }));
    };

    // Add event listeners
    document.addEventListener('click', handleClick);
    if (task.configuration?.trackHovers) {
      document.addEventListener('mouseenter', handleHover, true);
      document.addEventListener('mouseleave', handleHover, true);
    }
    if (task.configuration?.trackScrolling) {
      window.addEventListener('scroll', handleScroll);
    }

    return () => {
      document.removeEventListener('click', handleClick);
      document.removeEventListener('mouseenter', handleHover, true);
      document.removeEventListener('mouseleave', handleHover, true);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isTracking, task.configuration]);

  const startTracking = () => {
    setIsTracking(true);
    if (targetUrl) {
      window.open(targetUrl, '_blank');
    }
  };

  const stopTracking = () => {
    setIsTracking(false);
    setTaskCompleted(true);
    setMetadata(prev => ({
      ...prev,
      taskCompleted: true,
      endTime: new Date(),
      timeSpent
    }));
  };

  const handleQuestionResponse = (questionId: string, value: unknown) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleCompleteTask = () => {
    const finalMetadata = {
      ...metadata,
      timeSpent,
      responses,
      endTime: new Date(),
      taskCompleted: true
    };
    
    onComplete(finalMetadata);
  };

  const isTimeUp = timeLimit && timeSpent >= timeLimit;
  const hasEnoughClicks = metadata.clicks.length >= minClicks;
  const canComplete = taskCompleted && hasEnoughClicks && 
    questions.every((q) => !q.required || responses[q.id]);

  return (
    <div className="p-6" ref={trackingAreaRef}>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{task.title}</h2>
        <p className="text-gray-600">{task.description}</p>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h3 className="font-medium text-blue-900 mb-2">Instructions:</h3>
        <p className="text-blue-800 mb-3">{instructions}</p>
        
        {targetUrl && (
          <div className="bg-white border border-blue-200 rounded p-3">
            <div className="flex items-center space-x-2 text-sm text-blue-700">
              <ExternalLink className="w-4 h-4" />
              <span>Target Website: {targetUrl}</span>
            </div>
          </div>
        )}
      </div>

      {/* Tracking Controls */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">
                Time: {Math.floor(timeSpent / 60)}:{(timeSpent % 60).toString().padStart(2, '0')}
              </span>
            </div>
            
            {timeLimit && (
              <div className="text-sm text-gray-600">
                / {Math.floor(timeLimit / 60)}:{((timeLimit % 60).toString().padStart(2, '0'))}
              </div>
            )}

            {isRecording && (
              <div className="flex items-center space-x-2 text-red-600">
                <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse" />
                <span className="text-sm">Recording</span>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {!isTracking && !taskCompleted ? (
              <button
                onClick={startTracking}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                disabled={!!isTimeUp}
              >
                <Target className="w-4 h-4" />
                <span>Start Task</span>
              </button>
            ) : isTracking && !taskCompleted ? (
              <button
                onClick={stopTracking}
                className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Complete Task</span>
              </button>
            ) : (
              <div className="flex items-center space-x-2 text-green-600">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm font-medium">Task Completed</span>
              </div>
            )}
          </div>
        </div>

        {isTimeUp && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-red-800 text-sm">Time limit reached! Please complete any remaining steps.</p>
          </div>
        )}
      </div>

      {/* Tracking Statistics */}
      {isTracking || taskCompleted ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
          <h3 className="font-medium text-gray-900 mb-3 flex items-center space-x-2">
            <BarChart3 className="w-4 h-4" />
            <span>Interaction Statistics</span>
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="text-center">
              <div className="flex items-center justify-center space-x-1 text-blue-600 mb-1">
                <MousePointer className="w-4 h-4" />
                <span className="font-medium">{metadata.clicks.length}</span>
              </div>
              <div className="text-gray-600">Clicks</div>
              {minClicks > 0 && (
                <div className="text-xs text-gray-500">
                  Min: {minClicks}
                </div>
              )}
            </div>
            
            {task.configuration?.trackHovers && (
              <div className="text-center">
                <div className="flex items-center justify-center space-x-1 text-purple-600 mb-1">
                  <Eye className="w-4 h-4" />
                  <span className="font-medium">{metadata.hovers.length}</span>
                </div>
                <div className="text-gray-600">Hovers</div>
              </div>
            )}
            
            {task.configuration?.trackScrolling && (
              <div className="text-center">
                <div className="flex items-center justify-center space-x-1 text-green-600 mb-1">
                  <span className="font-medium">{metadata.scrollEvents.length}</span>
                </div>
                <div className="text-gray-600">Scroll Events</div>
              </div>
            )}
            
            <div className="text-center">
              <div className="flex items-center justify-center space-x-1 text-orange-600 mb-1">
                <Clock className="w-4 h-4" />
                <span className="font-medium">{timeSpent}s</span>
              </div>
              <div className="text-gray-600">Duration</div>
            </div>
          </div>

          {!hasEnoughClicks && minClicks > 0 && (
            <div className="mt-3 text-sm text-amber-600">
              Need {minClicks - metadata.clicks.length} more clicks to complete
            </div>
          )}
        </div>
      ) : null}

      {/* Post-Task Questions */}
      {questions.length > 0 && taskCompleted && (
        <div className="border-t pt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Post-Task Questions</h3>
          <div className="space-y-6">
            {questions.map((question, index) => (
              <div key={question.id || index} className="bg-gray-50 rounded-lg p-4">
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  {question.question}
                  {question.required && <span className="text-red-500 ml-1">*</span>}
                </label>

                {question.type === 'text' && (
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                    placeholder="Enter your response..."
                    value={responses[question.id] as string || ''}
                    onChange={(e) => handleQuestionResponse(question.id, e.target.value)}
                  />
                )}

                {question.type === 'rating' && (
                  <div className="flex space-x-2">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <button
                        key={rating}
                        onClick={() => handleQuestionResponse(question.id, rating)}
                        className={`w-10 h-10 rounded-full border-2 ${
                          responses[question.id] === rating
                            ? 'bg-blue-600 border-blue-600 text-white'
                            : 'border-gray-300 text-gray-600 hover:border-blue-400'
                        }`}
                      >
                        {rating}
                      </button>
                    ))}
                  </div>
                )}

                {question.type === 'multiple-choice' && (
                  <div className="space-y-2">
                    {question.options?.map((option: string, optionIndex: number) => (
                      <label key={optionIndex} className="flex items-center space-x-2">
                        <input
                          type="radio"
                          name={question.id}
                          value={option}
                          checked={responses[question.id] === option}
                          onChange={(e) => handleQuestionResponse(question.id, e.target.value)}
                          className="text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">{option}</span>
                      </label>
                    ))}
                  </div>
                )}

                {question.type === 'boolean' && (
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name={question.id}
                        value="yes"
                        checked={responses[question.id] === 'yes'}
                        onChange={(e) => handleQuestionResponse(question.id, e.target.value)}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">Yes</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name={question.id}
                        value="no"
                        checked={responses[question.id] === 'no'}
                        onChange={(e) => handleQuestionResponse(question.id, e.target.value)}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">No</span>
                    </label>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Complete Task Button */}
      {taskCompleted && (
        <div className="border-t pt-6 mt-6">
          <div className="flex justify-end">
            <button
              onClick={handleCompleteTask}
              disabled={!canComplete}
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium ${
                canComplete
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              <span>Complete Task</span>
              <CheckCircle className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Export with both names for backward compatibility
export const PrototypeTask = ClickTrackingTask;
