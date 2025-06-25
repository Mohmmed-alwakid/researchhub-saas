import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { Button } from '../ui/Button';
import { CheckCircle, Star } from 'lucide-react';
import { ConditionalBranchBlock, AIFollowUpBlock, CardSortBlock } from './AdvancedStudyBlocks';

export interface StudyBlock {
  id: string;
  type: string;
  order: number;
  title: string;
  description?: string;
  isRequired: boolean;
  settings: Record<string, string | number | boolean | string[] | Record<string, string>>;
}

export interface BlockProps {
  block: StudyBlock;
  onComplete: (response: Record<string, string | number | boolean | string[]>) => void;
  onNext: () => void;
  isLastBlock: boolean;
}

// Welcome Block Component
export const WelcomeBlock: React.FC<BlockProps> = ({ block, onComplete, onNext, isLastBlock }) => {
  const handleContinue = () => {
    onComplete({ acknowledged: true, timestamp: new Date().toISOString() });
    if (!isLastBlock) onNext();
  };

  const message = block.settings.message as string || '';

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
          {message}
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

  const content = block.settings.content as string || '';
  const duration = block.settings.duration as string || '';

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
          {content}
        </div>
        {duration && (
          <div className="text-sm text-gray-500 italic">
            {duration}
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
    const allowMultiple = block.settings.allowMultiple as boolean || false;
    
    if (allowMultiple) {
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
      question: block.settings.question as string,
      timestamp: new Date().toISOString() 
    });
    if (!isLastBlock) onNext();
  };

  const canSubmit = selectedOptions.length > 0;
  const question = block.settings.question as string || '';
  const options = block.settings.options as string[] || [];
  const allowMultiple = block.settings.allowMultiple as boolean || false;

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
          {question}
        </div>
        
        <div className="space-y-3">
          {options.map((option: string, index: number) => (
            <label
              key={index}
              className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
            >
              <input
                type={allowMultiple ? "checkbox" : "radio"}
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
      question: block.settings.question as string,
      wordCount: response.split(' ').length,
      timestamp: new Date().toISOString() 
    });
    if (!isLastBlock) onNext();
  };

  const minLength = block.settings.minLength as number || 1;
  const canSubmit = response.length >= minLength;
  const question = block.settings.question as string || '';
  const placeholder = block.settings.placeholder as string || "Please share your thoughts...";

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
          {question}
        </div>
        
        <textarea
          value={response}
          onChange={(e) => setResponse(e.target.value)}
          placeholder={placeholder}
          className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
        />

        {minLength > 1 && (
          <div className="text-sm text-gray-500">
            Minimum {minLength} characters
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
      rating: rating || 0, 
      question: block.settings.question as string,
      scaleType: block.settings.scaleType as string,
      timestamp: new Date().toISOString() 
    });
    if (!isLastBlock) onNext();
  };

  const canSubmit = rating !== null;
  const question = block.settings.question as string || '';
  const scaleType = block.settings.scaleType as string || 'number';
  const maxValue = block.settings.maxValue as number || 5;
  const minValue = block.settings.minValue as number || 1;
  const labels = block.settings.labels as Record<string, string> || {};

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
          {question}
        </div>
        
        {scaleType === 'star' && (
          <div className="flex justify-center space-x-2">
            {Array.from({ length: maxValue }, (_, index) => {
              const value = index + 1;
              return (
                <button
                  key={value}
                  onClick={() => setRating(value)}
                  className="p-1"
                >
                  <Star 
                    className={`w-8 h-8 ${rating && rating >= value ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                  />
                </button>
              );
            })}
          </div>
        )}

        {scaleType === 'number' && (
          <div className="flex justify-center space-x-2">
            {Array.from({ length: maxValue - minValue + 1 }, (_, index) => {
              const value = minValue + index;
              return (
                <button
                  key={value}
                  onClick={() => setRating(value)}
                  className={`w-12 h-12 rounded-full border-2 font-semibold ${
                    rating === value 
                      ? 'bg-indigo-600 text-white border-indigo-600' 
                      : 'border-gray-300 text-gray-700 hover:border-indigo-300'
                  }`}
                >
                  {value}
                </button>
              );
            })}
          </div>
        )}

        {labels.min && labels.max && (
          <div className="flex justify-between text-sm text-gray-600 px-2">
            <span>{labels.min}</span>
            <span>{labels.max}</span>
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

// Live Website Test Block Component
export const LiveWebsiteTestBlock: React.FC<BlockProps> = ({ block, onComplete, onNext, isLastBlock }) => {
  const [taskCompleted, setTaskCompleted] = useState<boolean[]>([]);
  const [allTasksCompleted, setAllTasksCompleted] = useState(false);

  const tasks = block.settings.tasks as string[] || [];
  const url = block.settings.url as string || '';
  const instructions = block.settings.instructions as string || '';

  React.useEffect(() => {
    setTaskCompleted(new Array(tasks.length).fill(false));
  }, [tasks.length]);

  const handleTaskToggle = (index: number) => {
    const newTaskCompleted = [...taskCompleted];
    newTaskCompleted[index] = !newTaskCompleted[index];
    setTaskCompleted(newTaskCompleted);
    setAllTasksCompleted(newTaskCompleted.every(task => task));
  };

  const handleSubmit = () => {
    onComplete({ 
      completedTasks: taskCompleted.map(String), 
      totalTasks: tasks.length,
      url: url,
      timestamp: new Date().toISOString() 
    });
    if (!isLastBlock) onNext();
  };

  const canSubmit = allTasksCompleted;

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <h2 className="text-2xl font-bold text-gray-900">{block.title}</h2>
        {block.description && (
          <p className="text-gray-600 mt-2">{block.description}</p>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Instructions */}
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">Instructions</h3>
              <p className="text-blue-800">{instructions}</p>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Tasks to Complete:</h3>
              <div className="space-y-2">
                {tasks.map((task: string, index: number) => (
                  <label
                    key={index}
                    className="flex items-center space-x-3 p-2 border rounded cursor-pointer hover:bg-gray-50"
                  >
                    <input
                      type="checkbox"
                      checked={taskCompleted[index] || false}
                      onChange={() => handleTaskToggle(index)}
                      className="w-4 h-4 text-indigo-600"
                    />
                    <span className={taskCompleted[index] ? 'line-through text-gray-500' : 'text-gray-700'}>
                      {task}
                    </span>
                    {taskCompleted[index] && (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    )}
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Website iframe */}
          <div className="space-y-4">
            <div className="border rounded-lg overflow-hidden">
              <iframe
                src={url}
                className="w-full h-96"
                title="Study Website"
              />
            </div>
            <div className="text-center">
              <a 
                href={url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Open in New Tab
              </a>
            </div>
          </div>
        </div>

        <div className="flex justify-center">
          <Button 
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="px-8 py-3"
          >
            I've Completed All Tasks
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
      acknowledged: true, 
      studyCompleted: true,
      timestamp: new Date().toISOString() 
    });
  };

  const message = block.settings.message as string || '';
  const nextSteps = block.settings.nextSteps as string || '';
  const showCompensation = block.settings.showCompensation as boolean || false;

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <h2 className="text-2xl font-bold text-green-600">{block.title}</h2>
        {block.description && (
          <p className="text-gray-600 mt-2">{block.description}</p>
        )}
      </CardHeader>
      <CardContent className="text-center space-y-6">
        <div className="text-lg text-gray-700 leading-relaxed">
          {message}
        </div>
        
        {showCompensation && (
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-green-800 font-medium">{nextSteps}</p>
          </div>
        )}

        <Button 
          onClick={handleFinish}
          className="px-8 py-3 text-lg bg-green-600 hover:bg-green-700"
        >
          Finish Study
        </Button>
      </CardContent>
    </Card>
  );
};

// Block Renderer Component
export const BlockRenderer: React.FC<BlockProps> = ({ block, onComplete, onNext, isLastBlock }) => {
  // Analytics tracker for advanced blocks
  const analyticsTracker = {
    track: (event: string, data: Record<string, unknown>) => {
      console.log('📊 Analytics:', event, data);
      // In production, send to analytics service
    }
  };

  switch (block.type) {
    case 'welcome':
      return <WelcomeBlock block={block} onComplete={onComplete} onNext={onNext} isLastBlock={isLastBlock} />;
    case 'context_screen':
      return <ContextScreenBlock block={block} onComplete={onComplete} onNext={onNext} isLastBlock={isLastBlock} />;
    case 'multiple_choice':
      return <MultipleChoiceBlock block={block} onComplete={onComplete} onNext={onNext} isLastBlock={isLastBlock} />;
    case 'open_question':
      return <OpenQuestionBlock block={block} onComplete={onComplete} onNext={onNext} isLastBlock={isLastBlock} />;
    case 'opinion_scale':
      return <OpinionScaleBlock block={block} onComplete={onComplete} onNext={onNext} isLastBlock={isLastBlock} />;
    case 'live_website_test':
      return <LiveWebsiteTestBlock block={block} onComplete={onComplete} onNext={onNext} isLastBlock={isLastBlock} />;
    case 'thank_you':
      return <ThankYouBlock block={block} onComplete={onComplete} onNext={onNext} isLastBlock={isLastBlock} />;
    
    // Advanced block types
    case 'conditional_branch':
      return <ConditionalBranchBlock block={block} onNext={onComplete} analyticsTracker={analyticsTracker} />;
    case 'ai_follow_up':
      return <AIFollowUpBlock block={block} onNext={onComplete} analyticsTracker={analyticsTracker} />;
    case 'card_sort':
      return <CardSortBlock block={block} onNext={onComplete} analyticsTracker={analyticsTracker} />;
    
    default:
      return (
        <Card className="w-full max-w-2xl mx-auto">
          <CardContent className="text-center py-8">
            <p className="text-gray-600">Unknown block type: {block.type}</p>
            <p className="text-sm text-gray-500 mt-2">This block type is not yet supported.</p>
            <Button onClick={() => onComplete({ skipped: true })} className="mt-4">
              Skip Block
            </Button>
          </CardContent>
        </Card>
      );
  }
};
