import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';


/**
 * Advanced Study Block Components - Version 2
 * 
 * Week 2 Implementation: Context Screen, Yes/No, 5-Second Test, Card Sort, Tree Test
 * Created: June 30, 2025
 */

// Animation variants - simplified for compatibility
const blockAnimations = {
  enter: {
    opacity: 0,
    y: 20,
    scale: 0.95
  },
  center: {
    opacity: 1,
    y: 0,
    scale: 1
  },
  exit: {
    opacity: 0,
    y: -20,
    scale: 0.95
  }
};

// Types for advanced blocks
interface TreeNode {
  id: string;
  label: string;
  children?: TreeNode[];
  isDestination?: boolean;
}

interface TreeTestTask {
  id: string;
  instruction: string;
  targetPath: string[];
}

interface FiveSecondQuestion {
  id: string;
  question: string;
  type: 'open_text' | 'multiple_choice';
}

interface CardItem {
  id: string;
  name: string;
  description?: string;
}

interface Category {
  id: string;
  name: string;
}

interface AdvancedBlock {
  id: string;
  type: string;
  title: string;
  description?: string;
  settings: Record<string, unknown>;
}

interface AnalyticsTracker {
  track: (event: string, data: Record<string, unknown>) => void;
}

interface BlockProps {
  block: AdvancedBlock;
  onNext: (response: Record<string, unknown>) => void;
  analyticsTracker?: AnalyticsTracker;
}

// Yes/No Block - Enhanced binary choice component
export const YesNoBlock: React.FC<BlockProps> = ({ block, onNext, analyticsTracker }) => {
  const [response, setResponse] = useState<boolean | null>(null);
  const [startTime] = useState(Date.now());

  const handleSubmit = (value: boolean) => {
    const timeSpent = Math.floor((Date.now() - startTime) / 1000);
    
    analyticsTracker?.track('yes_no_response', { 
      blockId: block.id, 
      response: value ? 'yes' : 'no',
      timeSpent 
    });

    setResponse(value);
    
    setTimeout(() => {
      onNext({ 
        response: value ? 'yes' : 'no',
        timeSpent,
        timestamp: new Date().toISOString()
      });
    }, 300);
  };

  const question = (block.settings.question as string) || 'Do you agree?';
  const displayStyle = (block.settings.displayStyle as string) || 'buttons';

  return (
    <motion.div
      className="bg-white rounded-2xl border border-gray-200/60 transition-all duration-300 ease-in-out shadow-lg p-8 w-full max-w-2xl mx-auto"
      initial="enter"
      animate="center"
      exit="exit"
      variants={blockAnimations}
    >
      <div className="text-center space-y-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{block.title}</h2>
          {block.description && (
            <p className="text-gray-600">{block.description}</p>
          )}
        </div>

        <div className="text-xl font-medium text-gray-800">
          {question}
        </div>

        {displayStyle === 'buttons' && (
          <div className="flex justify-center space-x-6">
            <motion.button
              onClick={() => handleSubmit(true)}
              disabled={response !== null}
              className={`px-8 py-4 rounded-xl font-semibold text-lg transition-all ${
                response === true 
                  ? 'bg-green-600 text-white' 
                  : 'bg-green-100 text-green-700 hover:bg-green-200'
              }`}
              whileHover={{ scale: response === null ? 1.05 : 1 }}
              whileTap={{ scale: response === null ? 0.95 : 1 }}
            >
              <span className="flex items-center space-x-2">
                <span>✓</span>
                <span>Yes</span>
              </span>
            </motion.button>

            <motion.button
              onClick={() => handleSubmit(false)}
              disabled={response !== null}
              className={`px-8 py-4 rounded-xl font-semibold text-lg transition-all ${
                response === false 
                  ? 'bg-red-600 text-white' 
                  : 'bg-red-100 text-red-700 hover:bg-red-200'
              }`}
              whileHover={{ scale: response === null ? 1.05 : 1 }}
              whileTap={{ scale: response === null ? 0.95 : 1 }}
            >
              <span className="flex items-center space-x-2">
                <span>✗</span>
                <span>No</span>
              </span>
            </motion.button>
          </div>
        )}

        {displayStyle === 'icons' && (
          <div className="flex justify-center space-x-8">
            <motion.button
              onClick={() => handleSubmit(true)}
              disabled={response !== null}
              className={`w-20 h-20 rounded-full flex items-center justify-center text-4xl transition-all ${
                response === true 
                  ? 'bg-green-600 text-white' 
                  : 'bg-green-100 text-green-600 hover:bg-green-200'
              }`}
              whileHover={{ scale: response === null ? 1.1 : 1 }}
              whileTap={{ scale: response === null ? 0.9 : 1 }}
            >
              😊
            </motion.button>

            <motion.button
              onClick={() => handleSubmit(false)}
              disabled={response !== null}
              className={`w-20 h-20 rounded-full flex items-center justify-center text-4xl transition-all ${
                response === false 
                  ? 'bg-red-600 text-white' 
                  : 'bg-red-100 text-red-600 hover:bg-red-200'
              }`}
              whileHover={{ scale: response === null ? 1.1 : 1 }}
              whileTap={{ scale: response === null ? 0.9 : 1 }}
            >
              😞
            </motion.button>
          </div>
        )}

        {response !== null && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-green-600 font-medium"
          >
            Response recorded! Moving to next question...
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

// Context Screen Block - Enhanced instructional component
export const ContextScreenBlock: React.FC<BlockProps> = ({ block, onNext, analyticsTracker }) => {
  const [timeSpent, setTimeSpent] = useState(0);
  const [startTime] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeSpent(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime]);

  const handleContinue = useCallback(() => {
    analyticsTracker?.track('context_screen_completed', { 
      blockId: block.id, 
      timeSpent 
    });

    onNext({ 
      acknowledged: true,
      timeSpent,
      timestamp: new Date().toISOString()
    });
  }, [block.id, timeSpent, analyticsTracker, onNext]);

  const content = (block.settings.content as string) || (block.settings.message as string) || '';
  const showTimer = block.settings.showTimer as boolean || false;
  const autoAdvance = block.settings.autoAdvance as boolean || false;
  const advanceDelay = (block.settings.advanceDelay as number) || 0;

  useEffect(() => {
    if (autoAdvance && advanceDelay > 0) {
      const timer = setTimeout(() => {
        handleContinue();
      }, advanceDelay * 1000);

      return () => clearTimeout(timer);
    }
  }, [autoAdvance, advanceDelay, handleContinue]);

  return (
    <motion.div
      className="bg-white rounded-2xl border border-gray-200/60 transition-all duration-300 ease-in-out shadow-lg p-8 w-full max-w-3xl mx-auto"
      initial="enter"
      animate="center"
      exit="exit"
      variants={blockAnimations}
    >
      <div className="space-y-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{block.title}</h2>
          {block.description && (
            <p className="text-gray-600">{block.description}</p>
          )}
        </div>

        <div className="bg-blue-50 rounded-xl p-6">
          <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed whitespace-pre-line">
            {content}
          </div>
        </div>

        {block.settings.image && typeof block.settings.image === 'string' && (
          <div className="text-center">
            <img 
              src={block.settings.image} 
              alt="Context illustration" 
              className="max-w-full h-auto rounded-lg shadow-md mx-auto"
              style={{ maxHeight: '400px' }}
            />
          </div>
        )}

        {showTimer && (
          <div className="text-center text-sm text-gray-500">
            Time spent: {timeSpent}s
          </div>
        )}

        <div className="flex justify-center">
          <motion.button
            onClick={handleContinue}
            disabled={autoAdvance}
            className="inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98] text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:ring-blue-500 shadow-lg text-base px-8 py-3"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {autoAdvance ? `Auto-advancing in ${Math.max(0, advanceDelay - timeSpent)}s...` : 'I Understand, Continue'}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

// 5-Second Test Block - First impression testing component
export const FiveSecondTestBlock: React.FC<BlockProps> = ({ block, onNext, analyticsTracker }) => {
  const [phase, setPhase] = useState<'preparation' | 'viewing' | 'questions'>('preparation');
  const [timeLeft, setTimeLeft] = useState(5);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentQuestion, setCurrentQuestion] = useState(0);

  const duration = (block.settings.duration as number) || 5;
  const imageUrl = (block.settings.image as string) || (block.settings.imageUrl as string) || '';
  const questions = (block.settings.followUpQuestions as FiveSecondQuestion[]) || [
    { id: '1', question: 'What was the main focus of the image?', type: 'open_text' },
    { id: '2', question: 'What do you remember most clearly?', type: 'open_text' }
  ];

  const startTest = () => {
    setPhase('viewing');
    setTimeLeft(duration);
    
    analyticsTracker?.track('five_second_test_started', { 
      blockId: block.id, 
      duration 
    });

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setPhase('questions');
          analyticsTracker?.track('five_second_test_viewing_complete', { 
            blockId: block.id 
          });
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
      analyticsTracker?.track('five_second_test_completed', { 
        blockId: block.id,
        answersCount: Object.keys(answers).length + 1
      });

      onNext({
        testCompleted: true,
        duration,
        answers: { ...answers, [question.id]: answer },
        timestamp: new Date().toISOString()
      });
    }
  };

  if (phase === 'preparation') {
    return (
      <motion.div
        className="bg-white rounded-2xl border border-gray-200/60 transition-all duration-300 ease-in-out shadow-lg p-8 w-full max-w-2xl mx-auto"
        initial="enter"
        animate="center"
        exit="exit"
        variants={blockAnimations}
      >
        <div className="text-center space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{block.title}</h2>
            {block.description && (
              <p className="text-gray-600">{block.description}</p>
            )}
          </div>

          <div className="bg-amber-50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-amber-900 mb-3">Instructions</h3>
            <p className="text-amber-800 leading-relaxed">
              You will see an image for {duration} seconds. Pay close attention to all the details 
              you can see. After the time is up, you'll be asked a few questions about what you remember.
            </p>
          </div>

          <motion.button
            onClick={startTest}
            className="inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 transform hover:scale-[1.02] active:scale-[0.98] text-white bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 focus:ring-green-500 shadow-lg text-base px-8 py-3"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Start {duration}-Second Test
          </motion.button>
        </div>
      </motion.div>
    );
  }

  if (phase === 'viewing') {
    return (
      <motion.div
        className="fixed inset-0 bg-black flex items-center justify-center z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="text-center">
          <div className="absolute top-8 left-1/2 transform -translate-x-1/2">
            <div className="bg-white rounded-full px-6 py-3 shadow-lg">
              <span className="text-2xl font-bold text-gray-900">{timeLeft}</span>
            </div>
          </div>
          
          <motion.img
            src={imageUrl}
            alt="Test image"
            className="max-w-full max-h-full object-contain"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </motion.div>
    );
  }

  if (phase === 'questions') {
    const question = questions[currentQuestion];
    
    return (
      <motion.div
        className="bg-white rounded-2xl border border-gray-200/60 transition-all duration-300 ease-in-out shadow-lg p-8 w-full max-w-2xl mx-auto"
        initial="enter"
        animate="center"
        exit="exit"
        variants={blockAnimations}
      >
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Question {currentQuestion + 1} of {questions.length}</h2>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
              />
            </div>
          </div>

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
            <button
              onClick={() => {
                const textarea = document.querySelector('textarea') as HTMLTextAreaElement;
                if (textarea && textarea.value.trim()) {
                  handleQuestionAnswer(textarea.value);
                }
              }}
              className="inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 transform hover:scale-[1.02] active:scale-[0.98] text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:ring-blue-500 shadow-lg text-base px-8 py-3"
            >
              {currentQuestion < questions.length - 1 ? 'Next Question' : 'Complete Test'}
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  return null;
};

// Tree Test Block - Navigation testing component
export const TreeTestBlock: React.FC<BlockProps> = ({ block, onNext, analyticsTracker }) => {
  const [currentTask, setCurrentTask] = useState(0);
  const [navigationPath, setNavigationPath] = useState<string[]>([]);
  const [currentLevel, setCurrentLevel] = useState<TreeNode[]>([]);
  const [taskStartTime, setTaskStartTime] = useState(Date.now());
  const [taskResults, setTaskResults] = useState<unknown[]>([]);

  const tree = useMemo(() => (block.settings.tree as TreeNode[]) || [
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

  const tasks = (block.settings.tasks as TreeTestTask[]) || [
    { id: '1', instruction: 'Find information about laptops', targetPath: ['home', 'products', 'laptops'] }
  ];

  useEffect(() => {
    setCurrentLevel(tree);
  }, [tree]);

  const navigateToNode = (nodeId: string) => {
    const newPath = [...navigationPath, nodeId];
    setNavigationPath(newPath);

    // Find the node in the current level
    const selectedNode = currentLevel.find(node => node.id === nodeId);
    
    if (selectedNode) {
      analyticsTracker?.track('tree_navigation', { 
        blockId: block.id, 
        nodeId, 
        path: newPath,
        taskIndex: currentTask
      });

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

    analyticsTracker?.track('tree_test_task_completed', { 
      blockId: block.id, 
      ...result
    });

    if (currentTask < tasks.length - 1) {
      // Move to next task
      setCurrentTask(currentTask + 1);
      setNavigationPath([]);
      setCurrentLevel(tree);
      setTaskStartTime(Date.now());
    } else {
      // All tasks complete
      onNext({
        testCompleted: true,
        taskResults: [...taskResults, result],
        totalTasks: tasks.length,
        timestamp: new Date().toISOString()
      });
    }
  };

  const goBack = () => {
    if (navigationPath.length > 0) {
      const newPath = navigationPath.slice(0, -1);
      setNavigationPath(newPath);
      
      // Navigate back to parent level
      let currentNodes = tree;
      for (const nodeId of newPath) {
        const node = currentNodes.find(n => n.id === nodeId);
        if (node && node.children) {
          currentNodes = node.children;
        }
      }
      setCurrentLevel(currentNodes);
    }
  };

  const currentTaskObj = tasks[currentTask];

  return (
    <motion.div
      className="bg-white rounded-2xl border border-gray-200/60 transition-all duration-300 ease-in-out shadow-lg p-8 w-full max-w-4xl mx-auto"
      initial="enter"
      animate="center"
      exit="exit"
      variants={blockAnimations}
    >
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{block.title}</h2>
          {block.description && (
            <p className="text-gray-600">{block.description}</p>
          )}
        </div>

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
          {currentLevel.map((node) => (
            <motion.button
              key={node.id}
              onClick={() => navigateToNode(node.id)}
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
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
            </motion.button>
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
      </div>
    </motion.div>
  );
};

// Card Sort Block - Enhanced with proper drag and drop
export const CardSortBlock: React.FC<BlockProps> = ({ block, onNext, analyticsTracker }) => {
  const [items] = useState<CardItem[]>((block.settings.items as CardItem[]) || []);
  const [categories] = useState<Category[]>((block.settings.categories as Category[]) || []);
  const [sortedItems, setSortedItems] = useState<Record<string, CardItem[]>>({});
  const [draggedItem, setDraggedItem] = useState<CardItem | null>(null);
  const [startTime] = useState(Date.now());

  const handleDragStart = (e: React.DragEvent, item: CardItem) => {
    setDraggedItem(item);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, categoryId: string) => {
    e.preventDefault();
    
    if (draggedItem) {
      // Remove item from its current category
      const newSortedItems = { ...sortedItems };
      Object.keys(newSortedItems).forEach(catId => {
        newSortedItems[catId] = newSortedItems[catId].filter(item => item.id !== draggedItem.id);
      });
      
      // Add to new category
      if (!newSortedItems[categoryId]) {
        newSortedItems[categoryId] = [];
      }
      newSortedItems[categoryId].push(draggedItem);
      
      setSortedItems(newSortedItems);
      setDraggedItem(null);

      analyticsTracker?.track('card_dropped', { 
        blockId: block.id, 
        itemId: draggedItem.id, 
        categoryId 
      });
    }
  };

  const handleSubmit = () => {
    const timeSpent = Math.floor((Date.now() - startTime) / 1000);
    
    analyticsTracker?.track('card_sort_complete', { 
      blockId: block.id, 
      timeSpent,
      itemsSorted: Object.values(sortedItems).flat().length,
      totalItems: items.length
    });

    onNext({ 
      cardSort: sortedItems,
      timeSpent,
      completionRate: Object.values(sortedItems).flat().length / items.length,
      timestamp: new Date().toISOString()
    });
  };

  const unsortedItems = items.filter(item => 
    !Object.values(sortedItems).flat().some((sorted: CardItem) => sorted.id === item.id)
  );

  const allItemsSorted = unsortedItems.length === 0;

  return (
    <motion.div
      className="bg-white rounded-2xl border border-gray-200/60 transition-all duration-300 ease-in-out shadow-lg p-8 w-full max-w-6xl mx-auto"
      initial="enter"
      animate="center"
      exit="exit"
      variants={blockAnimations}
    >
      <div className="space-y-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{block.title}</h2>
          {block.description && (
            <p className="text-gray-600">{block.description}</p>
          )}
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 rounded-xl p-6">
          <p className="text-blue-800">
            {(block.settings.instructions as string) || 'Drag and drop each card into the category where you think it belongs. There are no right or wrong answers.'}
          </p>
        </div>

        {/* Unsorted Items */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Items to Sort</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {unsortedItems.map((item: CardItem) => (
              <div
                key={item.id}
                draggable
                onDragStart={(e) => handleDragStart(e, item)}
                className="p-4 bg-gray-100 rounded-lg cursor-move hover:bg-gray-200 transition-colors border border-gray-200"
              >
                <div className="font-medium text-gray-900">{item.name}</div>
                {item.description && (
                  <div className="text-sm text-gray-600 mt-1">{item.description}</div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category: Category) => (
            <div
              key={category.id}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, category.id)}
              className="min-h-[200px] p-4 border-2 border-dashed border-gray-300 rounded-lg"
            >
              <h4 className="font-semibold text-gray-900 mb-4">{category.name}</h4>
              <div className="space-y-2">
                {(sortedItems[category.id] || []).map((item: CardItem) => (
                  <div
                    key={item.id}
                    className="p-3 bg-white rounded border border-gray-200 shadow-sm"
                  >
                    <div className="font-medium text-gray-900">{item.name}</div>
                    {item.description && (
                      <div className="text-sm text-gray-600">{item.description}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="text-center">
          <div className="text-sm text-gray-600 mb-4">
            {Object.values(sortedItems).flat().length} of {items.length} items sorted
          </div>
          <motion.button
            onClick={handleSubmit}
            disabled={!allItemsSorted}
            className={`px-8 py-3 rounded-xl font-medium transition-all ${
              allItemsSorted 
                ? 'bg-green-600 hover:bg-green-700 text-white' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
            whileHover={{ scale: allItemsSorted ? 1.02 : 1 }}
            whileTap={{ scale: allItemsSorted ? 0.98 : 1 }}
          >
            Complete Sort
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

// Export only components (no constants for fast refresh compatibility)
