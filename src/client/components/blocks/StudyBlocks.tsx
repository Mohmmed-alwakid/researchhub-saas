import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { Button } from '../ui/Button';
import { CheckCircle, Star } from 'lucide-react';

interface StudyBlock {
  id: string;
  type: string;
  order: number;
  title: string;
  description?: string;
  isRequired: boolean;
  settings: Record<string, string | number | boolean | string[] | Record<string, string>>;
}

interface BlockProps {
  block: StudyBlock;
  onComplete: (response: Record<string, any>) => void;
  onNext: () => void;
  isLastBlock: boolean;
}

// Welcome Block Component
export const WelcomeBlock: React.FC<BlockProps> = ({ block, onComplete, onNext, isLastBlock }) => {
  const handleContinue = () => {
    onComplete({ acknowledged: true, timestamp: new Date().toISOString() });
    if (!isLastBlock) onNext();
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <h2 className="text-2xl font-bold text-gray-900">{block.title}</h2>
        {block.description && (
          <p className="text-gray-600 mt-2">{block.description}</p>
        )}
      </CardHeader>
      <CardContent className="text-center space-y-6">
        <div className="text-lg text-gray-700 leading-relaxed">
          {block.settings.message}
        </div>
        <Button 
          onClick={handleContinue}
          className="px-8 py-3 text-lg"
        >
          Get Started
        </Button>
      </CardContent>
    </Card>
  );
};

// Context Screen Block Component  
export const ContextScreenBlock: React.FC<BlockProps> = ({ block, onComplete, onNext, isLastBlock }) => {
  const handleContinue = () => {
    onComplete({ acknowledged: true, timestamp: new Date().toISOString() });
    if (!isLastBlock) onNext();
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <h2 className="text-2xl font-bold text-gray-900">{block.title}</h2>
        {block.description && (
          <p className="text-gray-600 mt-2">{block.description}</p>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-gray-700 leading-relaxed whitespace-pre-line">
          {block.settings.content}
        </div>
        {block.settings.duration && (
          <div className="text-sm text-gray-500 italic">
            {block.settings.duration}
          </div>
        )}
        <div className="flex justify-center">
          <Button 
            onClick={handleContinue}
            className="px-8 py-3"
          >
            I Understand, Continue
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

// Multiple Choice Block Component
export const MultipleChoiceBlock: React.FC<BlockProps> = ({ block, onComplete, onNext, isLastBlock }) => {
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);

  const handleOptionToggle = (option: string) => {
    if (block.settings.allowMultiple) {
      setSelectedOptions(prev => 
        prev.includes(option) 
          ? prev.filter(o => o !== option)
          : [...prev, option]
      );
    } else {
      setSelectedOptions([option]);
    }
  };

  const handleSubmit = () => {
    onComplete({ 
      selectedOptions, 
      question: block.settings.question,
      timestamp: new Date().toISOString() 
    });
    if (!isLastBlock) onNext();
  };

  const canSubmit = selectedOptions.length > 0;

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <h2 className="text-2xl font-bold text-gray-900">{block.title}</h2>
        {block.description && (
          <p className="text-gray-600 mt-2">{block.description}</p>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-lg font-medium text-gray-800">
          {block.settings.question}
        </div>
        
        <div className="space-y-3">
          {block.settings.options.map((option: string, index: number) => (
            <label
              key={index}
              className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
            >
              <input
                type={block.settings.allowMultiple ? "checkbox" : "radio"}
                name="option"
                checked={selectedOptions.includes(option)}
                onChange={() => handleOptionToggle(option)}
                className="w-4 h-4 text-indigo-600"
              />
              <span className="text-gray-700">{option}</span>
            </label>
          ))}
        </div>

        <div className="flex justify-center">
          <Button 
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="px-8 py-3"
          >
            Continue
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

// Open Question Block Component
export const OpenQuestionBlock: React.FC<BlockProps> = ({ block, onComplete, onNext, isLastBlock }) => {
  const [response, setResponse] = useState('');

  const handleSubmit = () => {
    onComplete({ 
      response, 
      question: block.settings.question,
      wordCount: response.split(' ').length,
      timestamp: new Date().toISOString() 
    });
    if (!isLastBlock) onNext();
  };

  const canSubmit = response.length >= (block.settings.minLength || 1);

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <h2 className="text-2xl font-bold text-gray-900">{block.title}</h2>
        {block.description && (
          <p className="text-gray-600 mt-2">{block.description}</p>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-lg font-medium text-gray-800">
          {block.settings.question}
        </div>
        
        <textarea
          value={response}
          onChange={(e) => setResponse(e.target.value)}
          placeholder={block.settings.placeholder || "Please share your thoughts..."}
          className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
        />

        {block.settings.minLength && (
          <div className="text-sm text-gray-500">
            Minimum {block.settings.minLength} characters 
            {response.length > 0 && ` (${response.length} characters entered)`}
          </div>
        )}

        <div className="flex justify-center">
          <Button 
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="px-8 py-3"
          >
            Continue
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

// Opinion Scale Block Component
export const OpinionScaleBlock: React.FC<BlockProps> = ({ block, onComplete, onNext, isLastBlock }) => {
  const [rating, setRating] = useState<number | null>(null);

  const handleSubmit = () => {
    onComplete({ 
      rating, 
      question: block.settings.question,
      scaleType: block.settings.scaleType,
      timestamp: new Date().toISOString() 
    });
    if (!isLastBlock) onNext();
  };

  const canSubmit = rating !== null;

  const renderStarRating = () => (
    <div className="flex justify-center space-x-2">
      {Array.from({ length: block.settings.maxValue }, (_, index) => {
        const starValue = index + 1;
        return (
          <button
            key={starValue}
            onClick={() => setRating(starValue)}
            className={`p-1 transition-colors ${
              rating && starValue <= rating 
                ? 'text-yellow-400' 
                : 'text-gray-300 hover:text-yellow-200'
            }`}
          >
            <Star size={32} fill="currentColor" />
          </button>
        );
      })}
    </div>
  );

  const renderNumberScale = () => (
    <div className="flex justify-center space-x-2">
      {Array.from({ length: block.settings.maxValue - block.settings.minValue + 1 }, (_, index) => {
        const value = block.settings.minValue + index;
        return (
          <button
            key={value}
            onClick={() => setRating(value)}
            className={`w-12 h-12 rounded-full border-2 transition-colors ${
              rating === value
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'bg-white text-gray-700 border-gray-300 hover:border-indigo-300'
            }`}
          >
            {value}
          </button>
        );
      })}
    </div>
  );

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <h2 className="text-2xl font-bold text-gray-900">{block.title}</h2>
        {block.description && (
          <p className="text-gray-600 mt-2">{block.description}</p>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-lg font-medium text-gray-800 text-center">
          {block.settings.question}
        </div>

        <div className="space-y-4">
          {block.settings.scaleType === 'star' ? renderStarRating() : renderNumberScale()}
          
          {block.settings.labels && (
            <div className="flex justify-between text-sm text-gray-500">
              <span>{block.settings.labels.min}</span>
              <span>{block.settings.labels.max}</span>
            </div>
          )}
        </div>

        <div className="flex justify-center">
          <Button 
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="px-8 py-3"
          >
            Continue
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

// Live Website Test Block Component
export const LiveWebsiteTestBlock: React.FC<BlockProps> = ({ block, onComplete, onNext, isLastBlock }) => {
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [completedTasks, setCompletedTasks] = useState<boolean[]>(
    new Array(block.settings.tasks.length).fill(false)
  );

  const handleTaskComplete = (index: number) => {
    const newCompleted = [...completedTasks];
    newCompleted[index] = true;
    setCompletedTasks(newCompleted);
  };

  const handleFinish = () => {
    onComplete({ 
      completedTasks,
      totalTasks: block.settings.tasks.length,
      url: block.settings.url,
      timestamp: new Date().toISOString() 
    });
    if (!isLastBlock) onNext();
  };

  const allTasksCompleted = completedTasks.every(Boolean);

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <h2 className="text-2xl font-bold text-gray-900">{block.title}</h2>
        {block.description && (
          <p className="text-gray-600 mt-2">{block.description}</p>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        {block.settings.instructions && (
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <p className="text-blue-800">{block.settings.instructions}</p>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          {/* Tasks Panel */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">Tasks to Complete:</h3>
            <div className="space-y-2">
              {block.settings.tasks.map((task: string, index: number) => (
                <div
                  key={index}
                  className={`flex items-center space-x-3 p-3 rounded-lg border ${
                    completedTasks[index] 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <button
                    onClick={() => handleTaskComplete(index)}
                    className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      completedTasks[index]
                        ? 'bg-green-500 border-green-500 text-white'
                        : 'border-gray-300 hover:border-green-300'
                    }`}
                  >
                    {completedTasks[index] && <CheckCircle size={16} />}
                  </button>
                  <span className={completedTasks[index] ? 'line-through text-gray-600' : 'text-gray-800'}>
                    {task}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Website Preview */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">Website:</h3>
            <div className="border rounded-lg overflow-hidden">
              <iframe
                src={block.settings.url}
                className="w-full h-96"
                title="Website Test"
                sandbox="allow-same-origin allow-scripts allow-forms"
              />
            </div>
            <a
              href={block.settings.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-600 hover:text-indigo-800 text-sm"
            >
              Open in new window →
            </a>
          </div>
        </div>

        <div className="flex justify-center">
          <Button 
            onClick={handleFinish}
            disabled={!allTasksCompleted}
            className="px-8 py-3"
          >
            {allTasksCompleted ? 'Tasks Completed!' : `Complete Tasks (${completedTasks.filter(Boolean).length}/${completedTasks.length})`}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

// Thank You Block Component
export const ThankYouBlock: React.FC<BlockProps> = ({ block, onComplete }) => {
  const handleFinish = () => {
    onComplete({ 
      studyCompleted: true,
      timestamp: new Date().toISOString() 
    });
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <h2 className="text-2xl font-bold text-gray-900">{block.title}</h2>
        {block.description && (
          <p className="text-gray-600 mt-2">{block.description}</p>
        )}
      </CardHeader>
      <CardContent className="text-center space-y-6">
        <div className="text-lg text-gray-700 leading-relaxed">
          {block.settings.message}
        </div>
        
        {block.settings.showCompensation && (
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <h3 className="text-lg font-semibold text-green-800 mb-2">Compensation</h3>
            <p className="text-green-700">{block.settings.nextSteps}</p>
          </div>
        )}

        <Button 
          onClick={handleFinish}
          className="px-8 py-3 text-lg bg-green-600 hover:bg-green-700"
        >
          Complete Study
        </Button>
      </CardContent>
    </Card>
  );
};
