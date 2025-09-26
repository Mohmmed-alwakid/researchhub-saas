import React, { useState, useMemo } from 'react';
import { CheckCircle, Star } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { ConditionalBranchBlock, AIFollowUpBlock, CardSortBlock } from './AdvancedStudyBlocks';


// Tree Test interfaces for type safety
interface TreeTestNode {
  id: string;
  label: string;
  children?: TreeTestNode[];
  isDestination?: boolean;
}

interface TreeTestTask {
  id: string;
  instruction: string;
  targetPath: string[];
}

interface TreeTestResult {
  taskId: string;
  completed: boolean;
  success: boolean;
  path: string[];
  timeSpent: number;
  attempts: number;
}

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
  onComplete: (response: Record<string, unknown>) => void;
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

// Advanced Block Components - Week 2 Implementation

// Yes/No Block Component
export const YesNoBlock: React.FC<BlockProps> = ({ block, onComplete, onNext, isLastBlock }) => {
  const [response, setResponse] = useState<boolean | null>(null);
  const [startTime] = useState(Date.now());

  const handleSubmit = (value: boolean) => {
    const timeSpent = Math.floor((Date.now() - startTime) / 1000);
    
    onComplete({ 
      response: value ? 'yes' : 'no',
      timeSpent,
      timestamp: new Date().toISOString()
    });

    setResponse(value);
    
    setTimeout(() => {
      if (!isLastBlock) onNext();
    }, 300);
  };

  const question = (block.settings.question as string) || 'Do you agree?';
  const displayStyle = (block.settings.displayStyle as string) || 'buttons';

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <h2 className="text-2xl font-bold text-gray-900">{block.title}</h2>
        {block.description && (
          <p className="text-gray-600 mt-2">{block.description}</p>
        )}
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="text-xl font-medium text-gray-800 text-center">
          {question}
        </div>

        {displayStyle === 'buttons' && (
          <div className="flex justify-center space-x-6">
            <button
              onClick={() => handleSubmit(true)}
              disabled={response !== null}
              className={`px-8 py-4 rounded-xl font-semibold text-lg transition-all ${
                response === true 
                  ? 'bg-green-600 text-white' 
                  : 'bg-green-100 text-green-700 hover:bg-green-200'
              }`}
            >
              <span className="flex items-center space-x-2">
                <span>✓</span>
                <span>Yes</span>
              </span>
            </button>

            <button
              onClick={() => handleSubmit(false)}
              disabled={response !== null}
              className={`px-8 py-4 rounded-xl font-semibold text-lg transition-all ${
                response === false 
                  ? 'bg-red-600 text-white' 
                  : 'bg-red-100 text-red-700 hover:bg-red-200'
              }`}
            >
              <span className="flex items-center space-x-2">
                <span>✗</span>
                <span>No</span>
              </span>
            </button>
          </div>
        )}

        {displayStyle === 'icons' && (
          <div className="flex justify-center space-x-8">
            <button
              onClick={() => handleSubmit(true)}
              disabled={response !== null}
              className={`w-20 h-20 rounded-full flex items-center justify-center text-4xl transition-all ${
                response === true 
                  ? 'bg-green-600 text-white' 
                  : 'bg-green-100 text-green-600 hover:bg-green-200'
              }`}
            >
              😊
            </button>

            <button
              onClick={() => handleSubmit(false)}
              disabled={response !== null}
              className={`w-20 h-20 rounded-full flex items-center justify-center text-4xl transition-all ${
                response === false 
                  ? 'bg-red-600 text-white' 
                  : 'bg-red-100 text-red-600 hover:bg-red-200'
              }`}
            >
              😞
            </button>
          </div>
        )}

        {response !== null && (
          <div className="text-center text-green-600 font-medium">
            Response recorded! Moving to next question...
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Simple Input Block Component
export const SimpleInputBlock: React.FC<BlockProps> = ({ block, onComplete, onNext, isLastBlock }) => {
  const [value, setValue] = useState('');

  const handleSubmit = () => {
    onComplete({ 
      value, 
      question: block.settings.question as string,
      inputType: block.settings.inputType as string,
      timestamp: new Date().toISOString() 
    });
    if (!isLastBlock) onNext();
  };

  const canSubmit = value.trim().length > 0;
  const question = (block.settings.question as string) || '';
  const inputType = (block.settings.inputType as string) || 'text';
  const placeholder = (block.settings.placeholder as string) || "Your answer here...";

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
        
        <input
          type={inputType}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />

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

// Five Second Test Block Component
export const FiveSecondTestBlock: React.FC<BlockProps> = ({ block, onComplete, onNext, isLastBlock }) => {
  const [phase, setPhase] = useState<'preparation' | 'viewing' | 'questions'>('preparation');
  const [timeLeft, setTimeLeft] = useState(5);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentQuestion, setCurrentQuestion] = useState(0);

  const duration = (block.settings.duration as number) || 5;
  const imageUrl = (block.settings.image as string) || (block.settings.imageUrl as string) || '';
  
  // Safely cast followUpQuestions with proper type checking
  let questions: Array<{ id: string; question: string; type: string }> = [
    { id: '1', question: 'What was the main focus of the image?', type: 'open_text' },
    { id: '2', question: 'What do you remember most clearly?', type: 'open_text' }
  ];
  
  if (block.settings.followUpQuestions && Array.isArray(block.settings.followUpQuestions)) {
    const rawQuestions = block.settings.followUpQuestions as unknown;
    if (Array.isArray(rawQuestions)) {
      questions = rawQuestions as Array<{ id: string; question: string; type: string }>;
    }
  }

  const startTest = () => {
    setPhase('viewing');
    setTimeLeft(duration);

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setPhase('questions');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleQuestionAnswer = (answer: string) => {
    const question = questions[currentQuestion];
    setAnswers(prev => ({
      ...prev,
      [question.id]: answer
    }));

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // All questions answered
      onComplete({
        testCompleted: true,
        duration,
        answers: { ...answers, [question.id]: answer },
        timestamp: new Date().toISOString()
      });
      if (!isLastBlock) onNext();
    }
  };

  if (phase === 'preparation') {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <h2 className="text-2xl font-bold text-gray-900">{block.title}</h2>
          {block.description && (
            <p className="text-gray-600 mt-2">{block.description}</p>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-amber-50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-amber-900 mb-3">Instructions</h3>
            <p className="text-amber-800 leading-relaxed">
              You will see an image for {duration} seconds. Pay close attention to all the details 
              you can see. After the time is up, you'll be asked a few questions about what you remember.
            </p>
          </div>

          <div className="text-center">
            <Button onClick={startTest} className="px-8 py-3">
              Start {duration}-Second Test
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (phase === 'viewing') {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
        <div className="text-center">
          <div className="absolute top-8 left-1/2 transform -translate-x-1/2">
            <div className="bg-white rounded-full px-6 py-3 shadow-lg">
              <span className="text-2xl font-bold text-gray-900">{timeLeft}</span>
            </div>
          </div>
          
          <img
            src={imageUrl}
            alt="Test image"
            className="max-w-full max-h-full object-contain"
          />
        </div>
      </div>
    );
  }

  if (phase === 'questions') {
    const question = questions[currentQuestion];
    
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <h2 className="text-2xl font-bold text-gray-900">Question {currentQuestion + 1} of {questions.length}</h2>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
              style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
            />
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-lg font-medium text-gray-800">
            {question.question}
          </div>

          <textarea
            placeholder="Type your answer here..."
            className="w-full h-32 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.target as HTMLTextAreaElement).value.trim()) {
                handleQuestionAnswer((e.target as HTMLTextAreaElement).value);
              }
            }}
          />

          <div className="text-center">
            <Button
              onClick={() => {
                const textarea = document.querySelector('textarea') as HTMLTextAreaElement;
                if (textarea && textarea.value.trim()) {
                  handleQuestionAnswer(textarea.value);
                }
              }}
              className="px-8 py-3"
            >
              {currentQuestion < questions.length - 1 ? 'Next Question' : 'Complete Test'}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
};

// Tree Test Block Component
export const TreeTestBlock: React.FC<BlockProps> = ({ block, onComplete, onNext, isLastBlock }) => {
  const [currentTask, setCurrentTask] = useState(0);
  const [navigationPath, setNavigationPath] = useState<string[]>([]);
  const [currentLevel, setCurrentLevel] = useState<TreeTestNode[]>([]);
  const [taskStartTime, setTaskStartTime] = useState(Date.now());
  const [taskResults, setTaskResults] = useState<TreeTestResult[]>([]);

  const tree = useMemo(() => (block.settings.tree as unknown as TreeTestNode[]) || [
    {
      id: 'home',
      label: 'Home',
      children: [
        {
          id: 'products',
          label: 'Products',
          children: [
            { id: 'laptops', label: 'Laptops', isDestination: true },
            { id: 'phones', label: 'Phones', isDestination: true }
          ]
        },
        {
          id: 'support',
          label: 'Support',
          children: [
            { id: 'faq', label: 'FAQ', isDestination: true },
            { id: 'contact', label: 'Contact Us', isDestination: true }
          ]
        }
      ]
    }
  ], [block.settings.tree]);

  const tasks = (block.settings.tasks as unknown as TreeTestTask[]) || [
    { id: '1', instruction: 'Find information about laptops', targetPath: ['home', 'products', 'laptops'] }
  ];

  React.useEffect(() => {
    setCurrentLevel(tree);
  }, [tree]);

  const navigateToNode = (nodeId: string) => {
    const newPath = [...navigationPath, nodeId];
    setNavigationPath(newPath);

    // Find the node in the current level
    const selectedNode = currentLevel.find((node: TreeTestNode) => node.id === nodeId);
    
    if (selectedNode) {
      if (selectedNode.children) {
        setCurrentLevel(selectedNode.children);
      } else {
        // Reached a leaf node - task complete
        completeTask(newPath, selectedNode.isDestination || false);
      }
    }
  };

  const completeTask = (path: string[], isCorrectDestination: boolean) => {
    const timeSpent = Math.floor((Date.now() - taskStartTime) / 1000);
    const task = tasks[currentTask];
    
    const result = {
      taskId: task.id,
      completed: true,
      success: isCorrectDestination,
      path,
      timeSpent,
      attempts: 1
    };

    setTaskResults([...taskResults, result]);

    if (currentTask < tasks.length - 1) {
      // Move to next task
      setCurrentTask(currentTask + 1);
      setNavigationPath([]);
      setCurrentLevel(tree);
      setTaskStartTime(Date.now());
    } else {
      // All tasks complete
      onComplete({
        testCompleted: true,
        taskResults: [...taskResults, result],
        totalTasks: tasks.length,
        timestamp: new Date().toISOString()
      });
      if (!isLastBlock) onNext();
    }
  };

  const goBack = () => {
    if (navigationPath.length > 0) {
      const newPath = navigationPath.slice(0, -1);
      setNavigationPath(newPath);
      
      // Navigate back to parent level
      let currentNodes = tree;
      for (const nodeId of newPath) {
        const node = currentNodes.find((n: TreeTestNode) => n.id === nodeId);
        if (node && node.children) {
          currentNodes = node.children;
        }
      }
      setCurrentLevel(currentNodes);
    }
  };

  const currentTaskObj = tasks[currentTask];

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <h2 className="text-2xl font-bold text-gray-900">{block.title}</h2>
        {block.description && (
          <p className="text-gray-600 mt-2">{block.description}</p>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="bg-blue-50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">
            Task {currentTask + 1} of {tasks.length}
          </h3>
          <p className="text-blue-800">{currentTaskObj.instruction}</p>
        </div>

        {/* Breadcrumb */}
        {navigationPath.length > 0 && (
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <span>Path:</span>
            {navigationPath.map((nodeId, index) => (
              <span key={nodeId}>
                {index > 0 && <span className="mx-1">›</span>}
                <span className="bg-gray-100 px-2 py-1 rounded">{nodeId}</span>
              </span>
            ))}
          </div>
        )}

        {/* Navigation Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {currentLevel.map((node: TreeTestNode) => (
            <button
              key={node.id}
              onClick={() => navigateToNode(node.id)}
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left transition-colors"
            >
              <div className="font-medium text-gray-900">{node.label}</div>
              {node.children && (
                <div className="text-sm text-gray-500 mt-1">
                  {node.children.length} subcategories
                </div>
              )}
              {node.isDestination && (
                <div className="text-sm text-green-600 mt-1 font-medium">
                  ✓ Destination
                </div>
              )}
            </button>
          ))}
        </div>

        <div className="flex justify-between">
          <button
            onClick={goBack}
            disabled={navigationPath.length === 0}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ← Go Back
          </button>

          <div className="text-sm text-gray-500">
            Progress: {currentTask + 1} / {tasks.length} tasks
          </div>
        </div>
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
    
    // Advanced block types - Bridge the type differences
    case 'conditional_branch':
      return <ConditionalBranchBlock 
        block={block as unknown as typeof block} 
        onNext={(response: unknown) => onComplete(response as Record<string, unknown>)} 
        analyticsTracker={analyticsTracker} 
      />;
    case 'ai_follow_up':
      return <AIFollowUpBlock 
        block={block as unknown as typeof block} 
        onNext={(response: unknown) => onComplete(response as Record<string, unknown>)} 
        analyticsTracker={analyticsTracker} 
      />;
    case 'card_sort':
      return <CardSortBlock 
        block={block as unknown as typeof block} 
        onNext={(response: unknown) => onComplete(response as Record<string, unknown>)} 
        analyticsTracker={analyticsTracker} 
      />;
    case 'yes_no':
      return <YesNoBlock block={block} onComplete={onComplete} onNext={onNext} isLastBlock={isLastBlock} />;
    case 'simple_input':
      return <SimpleInputBlock block={block} onComplete={onComplete} onNext={onNext} isLastBlock={isLastBlock} />;
    case 'five_second_test':
      return <FiveSecondTestBlock block={block} onComplete={onComplete} onNext={onNext} isLastBlock={isLastBlock} />;
    case 'tree_test':
      return <TreeTestBlock block={block} onComplete={onComplete} onNext={onNext} isLastBlock={isLastBlock} />;
    
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
