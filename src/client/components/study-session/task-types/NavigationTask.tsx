import React, { useState, useEffect } from 'react';
import { ExternalLink, CheckCircle, Clock, ArrowRight } from 'lucide-react';

interface NavigationTaskProps {
  task: any;
  study: any;
  session: any;
  onComplete: (responses: Record<string, any>) => void;
  isRecording: boolean;
  taskVariant?: 'tree_test';
}

export const NavigationTask: React.FC<NavigationTaskProps> = ({
  task,
  onComplete,
  isRecording,
  taskVariant: _taskVariant
}) => {
  const [startTime] = useState(new Date());
  const [currentUrl, setCurrentUrl] = useState('');
  const [taskCompleted, setTaskCompleted] = useState(false);
  const [timeSpent, setTimeSpent] = useState(0);
  const [responses, setResponses] = useState<Record<string, any>>({});

  const targetUrl = task.configuration?.url || '';
  const instructions = task.configuration?.instructions || '';
  const questions = task.configuration?.questions || [];
  const timeLimit = task.timeLimit;

  // Timer
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeSpent(Math.floor((new Date().getTime() - startTime.getTime()) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime]);

  // Auto-detect URL changes (in real implementation, this would be more sophisticated)
  useEffect(() => {
    const detectUrlChange = () => {
      setCurrentUrl(window.location.href);
    };

    // Listen for navigation events
    window.addEventListener('popstate', detectUrlChange);
    detectUrlChange();

    return () => {
      window.removeEventListener('popstate', detectUrlChange);
    };
  }, []);

  const handleOpenTarget = () => {
    if (targetUrl) {
      window.open(targetUrl, '_blank');
    }
  };

  const handleMarkComplete = () => {
    setTaskCompleted(true);
  };

  const handleQuestionResponse = (questionId: string, value: any) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleCompleteTask = () => {
    const taskResponses = {
      ...responses,
      taskCompleted,
      timeSpent,
      targetUrl,
      currentUrl,
      completedManually: true
    };

    onComplete(taskResponses);
  };

  const isTimeUp = timeLimit && timeSpent >= timeLimit;
  const canComplete = taskCompleted && questions.every((q: any) => 
    !q.required || responses[q.id]
  );

  return (
    <div className="p-6">
      {/* Task Instructions */}
      <div className="mb-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <h3 className="font-medium text-blue-900 mb-2">Instructions:</h3>
          <p className="text-blue-800">{instructions}</p>
        </div>

        {/* Target URL */}
        {targetUrl && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
            <h3 className="font-medium text-gray-900 mb-2">Target Website:</h3>
            <div className="flex items-center space-x-3">
              <code className="text-sm bg-white px-3 py-2 rounded border flex-1">
                {targetUrl}
              </code>
              <button
                onClick={handleOpenTarget}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Open Website</span>
              </button>
            </div>
          </div>
        )}

        {/* Status and Timer */}
        <div className="flex items-center justify-between bg-white border rounded-lg p-4">
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
            {!taskCompleted ? (
              <button
                onClick={handleMarkComplete}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                disabled={isTimeUp}
              >
                <CheckCircle className="w-4 h-4" />
                <span>Mark Task Complete</span>
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
          <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">Time limit reached! Please complete any remaining questions and submit.</p>
          </div>
        )}
      </div>

      {/* Post-Task Questions */}
      {questions.length > 0 && taskCompleted && (
        <div className="border-t pt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Post-Task Questions</h3>
          <div className="space-y-6">
            {questions.map((question: any, index: number) => (
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
                    value={responses[question.id] || ''}
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
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
