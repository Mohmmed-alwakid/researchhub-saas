/**
 * Advanced Study Block Components
 * 
 * Includes advanced block types with conditional logic, branching, and AI integration
 * Created: June 25, 2025
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Types for advanced blocks
interface BlockCondition {
  id: string;
  type: string;
  logic: {
    type: string;
    blockId: string;
    value: any;
  };
  targetBlockId: string;
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
  settings: {
    [key: string]: any;
    conditions?: BlockCondition[];
    defaultTarget?: string;
    baseBlockId?: string;
    baseQuestion?: string;
    followUpCount?: number;
    instructions?: string;
    items?: CardItem[];
    categories?: Category[];
  };
}

interface AnalyticsTracker {
  track: (event: string, data: Record<string, unknown>) => void;
}

interface BlockProps {
  block: AdvancedBlock;
  onNext: (response: any) => void;
  analyticsTracker?: AnalyticsTracker;
}

interface QuestionData {
  id: string;
  question: string;
  type: string;
}

// Enhanced animation variants for block transitions
export const blockAnimations = {
  enter: {
    opacity: 0,
    y: 30,
    scale: 0.95
  },
  center: {
    opacity: 1,
    y: 0,
    scale: 1
  },
  exit: {
    opacity: 0,
    y: -30,
    scale: 0.95
  }
};

// Conditional Branch Block - Routes users to different blocks based on conditions
export const ConditionalBranchBlock = ({ block, onNext, analyticsTracker }: BlockProps) => {
  const [loading, setLoading] = useState(true);
  const [nextBlockId, setNextBlockId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    evaluateConditions();
  }, []);

  const evaluateConditions = async () => {
    try {
      analyticsTracker?.track('branch_evaluation_start', { blockId: block.id });
      
      const conditions = block.settings.conditions || [];
      const previousResponses = await getPreviousResponses();

      let targetBlockId = block.settings.defaultTarget;

      // Evaluate conditions in order
      for (const condition of conditions) {
        if (await evaluateCondition(condition, previousResponses)) {
          targetBlockId = condition.targetBlockId;
          break;
        }
      }

      setNextBlockId(targetBlockId || null);
      analyticsTracker?.track('branch_evaluation_complete', { 
        blockId: block.id, 
        targetBlockId 
      });

      // Auto-proceed after 1 second
      setTimeout(() => {
        onNext({ 
          branchTarget: targetBlockId,
          evaluatedConditions: conditions.length
        });
      }, 1000);

    } catch (err) {
      console.error('Error evaluating branch conditions:', err);
      setError('Failed to evaluate conditions');
      analyticsTracker?.track('branch_evaluation_error', { 
        blockId: block.id, 
        error: err instanceof Error ? err.message : 'Unknown error'
      });
    } finally {
      setLoading(false);
    }
  };

  const evaluateCondition = async (condition: BlockCondition, responses: Record<string, any>) => {
    const { logic } = condition;
    
    switch (logic.type) {
      case 'response_equals':
        return responses[logic.blockId]?.response === logic.value;
      
      case 'response_contains':
        return responses[logic.blockId]?.response?.includes(logic.value);
      
      case 'rating_greater_than':
        return Number(responses[logic.blockId]?.response) > logic.value;
      
      case 'rating_less_than':
        return Number(responses[logic.blockId]?.response) < logic.value;
      
      case 'multiple_choice_includes':
        const mcResponse = responses[logic.blockId]?.response;
        return Array.isArray(mcResponse) ? 
          mcResponse.includes(logic.value) : 
          mcResponse === logic.value;

      case 'time_spent_greater':
        const timeSpent = responses[logic.blockId]?.metadata?.timeSpent || 0;
        return timeSpent > logic.value;

      default:
        return false;
    }
  };

  const getPreviousResponses = async (): Promise<Record<string, any>> => {
    // Get responses from session storage or API
    const sessionData = JSON.parse(sessionStorage.getItem('blockResponses') || '{}');
    return sessionData;
  };

  return (
    <motion.div
      className="bg-white rounded-2xl border border-gray-200/60 transition-all duration-300 ease-in-out shadow-soft hover:shadow-medium p-8 w-full max-w-2xl mx-auto"
      initial="enter"
      animate="center"
      exit="exit"
      variants={blockAnimations}
    >
      <div className="text-center">
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center ${loading ? 'bg-blue-100' : 'bg-green-100'}`}>
              {loading ? (
                <motion.div
                  className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
              ) : (
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
            </div>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          {loading ? 'Personalizing Your Experience...' : 'Ready to Continue'}
        </h2>

        <p className="text-gray-600 mb-6">
          {loading ? 
            'We\'re customizing the next part of the study based on your responses.' :
            'Your personalized study path has been prepared.'
          }
        </p>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {!loading && nextBlockId && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-800 text-sm">
              Next: Block {nextBlockId}
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

// AI Follow-up Block - Uses AI to generate dynamic follow-up questions
export const AIFollowUpBlock = ({ block, onNext, analyticsTracker }: BlockProps) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [questions, setQuestions] = useState<QuestionData[]>([]);
  const [responses, setResponses] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    generateFollowUpQuestions();
  }, []);

  const generateFollowUpQuestions = async () => {
    try {
      analyticsTracker?.track('ai_generation_start', { blockId: block.id });
      
      const previousResponses = await getPreviousResponses();
      const baseResponse = previousResponses[block.settings.baseBlockId || '']?.response;

      if (!baseResponse) {
        throw new Error('Base response not found for AI follow-up');
      }

      // Simulate AI question generation (in production, call actual AI API)
      const generatedQuestions = await generateAIQuestions(
        block.settings.baseQuestion || '',
        baseResponse,
        block.settings.followUpCount || 3
      );

      setQuestions(generatedQuestions);
      analyticsTracker?.track('ai_generation_complete', { 
        blockId: block.id, 
        questionCount: generatedQuestions.length 
      });

    } catch (err) {
      console.error('Error generating AI questions:', err);
      setError('Failed to generate follow-up questions');
      analyticsTracker?.track('ai_generation_error', { 
        blockId: block.id, 
        error: err instanceof Error ? err.message : 'Unknown error'
      });
    } finally {
      setLoading(false);
    }
  };

  const generateAIQuestions = async (_baseQuestion: string, _baseResponse: string, count: number): Promise<QuestionData[]> => {
    // Mock AI generation - in production, replace with actual AI API call
    const mockQuestions = [
      "Can you elaborate on that point?",
      "What specific aspects were most important to you?",
      "How did this compare to your expectations?",
      "What would you change about this experience?",
      "Would you recommend this to others? Why?"
    ];

    return mockQuestions.slice(0, count).map((q, i) => ({
      id: `ai_q_${i}`,
      question: q,
      type: 'open_text'
    }));
  };

  const handleResponse = (response: string) => {
    const newResponses = [...responses, response];
    setResponses(newResponses);

    analyticsTracker?.track('ai_question_answered', { 
      blockId: block.id, 
      questionIndex: currentQuestion,
      responseLength: response.length 
    });

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // All questions answered
      onNext({ aiResponses: newResponses });
    }
  };

  const getPreviousResponses = async (): Promise<Record<string, any>> => {
    const sessionData = JSON.parse(sessionStorage.getItem('blockResponses') || '{}');
    return sessionData;
  };

  if (loading) {
    return (
      <motion.div
        className="bg-white rounded-2xl border border-gray-200/60 transition-all duration-300 ease-in-out shadow-soft hover:shadow-medium p-8 w-full max-w-2xl mx-auto"
        initial="enter"
        animate="center"
        variants={blockAnimations}
      >
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <motion.div
              className="w-12 h-12 border-3 border-blue-600 border-t-transparent rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Generating Questions...</h2>
          <p className="text-gray-600">AI is creating personalized follow-up questions based on your responses.</p>
        </div>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div
        className="bg-white rounded-2xl border border-gray-200/60 transition-all duration-300 ease-in-out shadow-soft hover:shadow-medium p-8 w-full max-w-2xl mx-auto"
        initial="enter"
        animate="center"
        variants={blockAnimations}
      >
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-xl font-bold text-red-900 mb-2">Error</h2>
            <p className="text-red-600">{error}</p>
          </div>
        </div>
      </motion.div>
    );
  }

  const currentQ = questions[currentQuestion];

  return (
    <motion.div
      className="bg-white rounded-2xl border border-gray-200/60 transition-all duration-300 ease-in-out shadow-soft hover:shadow-medium p-8 w-full max-w-2xl mx-auto"
      initial="enter"
      animate="center"
      exit="exit"
      variants={blockAnimations}
    >
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">{block.title}</h2>
          <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
            {currentQuestion + 1} of {questions.length}
          </div>
        </div>

        <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
          <motion.div 
            className="bg-blue-600 h-2 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestion}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          <AIQuestionForm 
            question={currentQ}
            onSubmit={handleResponse}
            analyticsTracker={analyticsTracker}
          />
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
};

interface AIQuestionFormProps {
  question: QuestionData;
  onSubmit: (response: string) => void;
  analyticsTracker?: AnalyticsTracker;
}

const AIQuestionForm = ({ question, onSubmit, analyticsTracker }: AIQuestionFormProps) => {
  const [response, setResponse] = useState('');
  const [startTime] = useState(Date.now());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (response.trim()) {
      analyticsTracker?.track('ai_response_submit', {
        questionId: question.id,
        responseTime: Date.now() - startTime,
        responseLength: response.length
      });
      onSubmit(response.trim());
      setResponse('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          {question.question}
        </h3>
        
        <textarea
          value={response}
          onChange={(e) => setResponse(e.target.value)}
          placeholder="Please share your thoughts..."
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          rows={4}
          required
        />
      </div>

      <div className="flex justify-end">
        <motion.button
          type="submit"
          disabled={!response.trim()}
          className="inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98] text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:ring-blue-500 shadow-soft hover:shadow-medium text-base px-8 py-3"
          whileHover={{ scale: response.trim() ? 1.02 : 1 }}
          whileTap={{ scale: response.trim() ? 0.98 : 1 }}
        >
          Continue
        </motion.button>
      </div>
    </form>
  );
};

// Card Sort Block - Interactive information architecture testing
export const CardSortBlock = ({ block, onNext, analyticsTracker }: BlockProps) => {
  const [items] = useState(block.settings.items || []);
  const [categories] = useState(block.settings.categories || []);
  const [sortedItems, setSortedItems] = useState<Record<string, any[]>>({});
  const [draggedItem, setDraggedItem] = useState<any>(null);
  const [startTime] = useState(Date.now());

  const handleDragStart = (_e: React.DragEvent, item: any) => {
    setDraggedItem(item);
    analyticsTracker?.track('card_drag_start', { 
      blockId: block.id, 
      itemId: item.id 
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, categoryId: string) => {
    e.preventDefault();
    if (draggedItem) {
      const newSortedItems = { ...sortedItems };
      
      // Remove item from previous category
      Object.keys(newSortedItems).forEach(catId => {
        newSortedItems[catId] = newSortedItems[catId]?.filter(item => item.id !== draggedItem.id) || [];
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
      completionRate: Object.values(sortedItems).flat().length / items.length
    });
  };

  const unsortedItems = items.filter(item => 
    !Object.values(sortedItems).flat().some((sorted: any) => sorted.id === item.id)
  );

  const allItemsSorted = unsortedItems.length === 0;

  return (
    <motion.div
      className="bg-white rounded-2xl border border-gray-200/60 transition-all duration-300 ease-in-out shadow-soft hover:shadow-medium p-8 w-full max-w-6xl mx-auto"
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">{block.title}</h2>
        <p className="text-gray-600 mb-4">{block.description}</p>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-blue-800">{block.settings.instructions}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Unsorted Items */}
        <div className="lg:col-span-1">
          <h3 className="font-semibold text-gray-900 mb-4">Items to Sort</h3>
          <div className="space-y-2 min-h-[200px] p-4 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
            {unsortedItems.map((item: any) => (
              <motion.div
                key={item.id}
                draggable
                onDragStart={(e) => handleDragStart(e as unknown as React.DragEvent, item)}
                className="p-3 bg-white border border-gray-200 rounded-lg cursor-move hover:shadow-md transition-shadow"
                whileHover={{ scale: 1.02 }}
                whileDrag={{ scale: 1.05, zIndex: 1000 }}
              >
                <div className="flex items-center">
                  <svg className="w-4 h-4 text-gray-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                  </svg>
                  <span className="text-sm font-medium">{item.name}</span>
                </div>
                {item.description && (
                  <p className="text-xs text-gray-500 mt-1">{item.description}</p>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Categories */}
        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4">
          {categories.map((category: any) => (
            <div
              key={category.id}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, category.id)}
              className="min-h-[300px] p-4 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 hover:border-blue-400 transition-colors"
            >
              <h3 className="font-semibold text-gray-900 mb-4">{category.name}</h3>
              <div className="space-y-2">
                {(sortedItems[category.id] || []).map((item: any) => (
                  <motion.div
                    key={item.id}
                    className="p-3 bg-white border border-gray-200 rounded-lg shadow-sm"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <div className="text-sm font-medium">{item.name}</div>
                    {item.description && (
                      <p className="text-xs text-gray-500 mt-1">{item.description}</p>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8 flex justify-between items-center">
        <div className="text-sm text-gray-600">
          {unsortedItems.length} items remaining
        </div>
        
        <motion.button
          onClick={handleSubmit}
          disabled={!allItemsSorted}
          className="inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98] text-white bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 focus:ring-green-500 shadow-soft hover:shadow-medium text-base px-8 py-3"
          whileHover={{ scale: allItemsSorted ? 1.02 : 1 }}
          whileTap={{ scale: allItemsSorted ? 0.98 : 1 }}
        >
          Complete Sort
        </motion.button>
      </div>
    </motion.div>
  );
};

// Yes/No Block - Enhanced binary choice component
export const YesNoBlock = ({ block, onNext, analyticsTracker }: BlockProps) => {
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

  const question = block.settings.question || 'Do you agree?';
  const displayStyle = block.settings.displayStyle || 'buttons';

  return (
    <motion.div
      className="bg-white rounded-2xl border border-gray-200/60 transition-all duration-300 ease-in-out shadow-soft hover:shadow-medium p-8 w-full max-w-2xl mx-auto"
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
export const ContextScreenBlock = ({ block, onNext, analyticsTracker }: BlockProps) => {
  const [timeSpent, setTimeSpent] = useState(0);
  const [startTime] = useState(Date.now());

  React.useEffect(() => {
    const interval = setInterval(() => {
      setTimeSpent(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime]);

  const handleContinue = () => {
    analyticsTracker?.track('context_screen_completed', { 
      blockId: block.id, 
      timeSpent 
    });

    onNext({ 
      acknowledged: true,
      timeSpent,
      timestamp: new Date().toISOString()
    });
  };

  const content = block.settings.content || block.settings.message || '';
  const showTimer = block.settings.showTimer || false;
  const autoAdvance = block.settings.autoAdvance || false;
  const advanceDelay = block.settings.advanceDelay || 0;

  React.useEffect(() => {
    if (autoAdvance && advanceDelay > 0) {
      const timer = setTimeout(() => {
        handleContinue();
      }, advanceDelay * 1000);

      return () => clearTimeout(timer);
    }
  }, [autoAdvance, advanceDelay]);

  return (
    <motion.div
      className="bg-white rounded-2xl border border-gray-200/60 transition-all duration-300 ease-in-out shadow-soft hover:shadow-medium p-8 w-full max-w-3xl mx-auto"
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

        {block.settings.image && (
          <div className="text-center">
            <img 
              src={block.settings.image as string} 
              alt="Context illustration" 
              className="max-w-full h-auto rounded-lg shadow-medium mx-auto"
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
            className="inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98] text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:ring-blue-500 shadow-soft hover:shadow-medium text-base px-8 py-3"
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
export const FiveSecondTestBlock = ({ block, onNext, analyticsTracker }: BlockProps) => {
  const [phase, setPhase] = useState<'preparation' | 'viewing' | 'questions'>('preparation');
  const [timeLeft, setTimeLeft] = useState(5);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentQuestion, setCurrentQuestion] = useState(0);

  const duration = block.settings.duration || 5;
  const imageUrl = block.settings.image || block.settings.imageUrl || '';
  const questions = block.settings.followUpQuestions || [
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
        className="bg-white rounded-2xl border border-gray-200/60 transition-all duration-300 ease-in-out shadow-soft hover:shadow-medium p-8 w-full max-w-2xl mx-auto"
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
            className="inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 transform hover:scale-[1.02] active:scale-[0.98] text-white bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 focus:ring-green-500 shadow-soft hover:shadow-medium text-base px-8 py-3"
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
        className="bg-white rounded-2xl border border-gray-200/60 transition-all duration-300 ease-in-out shadow-soft hover:shadow-medium p-8 w-full max-w-2xl mx-auto"
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
              if (e.key === 'Enter' && (e.target as HTMLInputElement).value.trim()) {
                handleQuestionAnswer((e.target as HTMLInputElement).value);
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
              className="inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 transform hover:scale-[1.02] active:scale-[0.98] text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:ring-blue-500 shadow-soft hover:shadow-medium text-base px-8 py-3"
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
export const TreeTestBlock = ({ block, onNext, analyticsTracker }: BlockProps) => {
  const [currentTask, setCurrentTask] = useState(0);
  const [navigationPath, setNavigationPath] = useState<string[]>([]);
  const [currentLevel, setCurrentLevel] = useState<any[]>([]);
  const [taskStartTime, setTaskStartTime] = useState(Date.now());
  const [taskResults, setTaskResults] = useState<any[]>([]);

  const tree = block.settings.tree || [
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
  ];

  const tasks = block.settings.tasks || [
    { id: '1', instruction: 'Find information about laptops', targetPath: ['home', 'products', 'laptops'] }
  ];

  React.useEffect(() => {
    setCurrentLevel(tree);
  }, []);

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
        completeTask(newPath, selectedNode.isDestination);
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
        const node = currentNodes.find((n: any) => n.id === nodeId);
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
      className="bg-white rounded-2xl border border-gray-200/60 transition-all duration-300 ease-in-out shadow-soft hover:shadow-medium p-8 w-full max-w-4xl mx-auto"
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

export default {
  ConditionalBranchBlock,
  AIFollowUpBlock,
  CardSortBlock,
  YesNoBlock,
  ContextScreenBlock,
  FiveSecondTestBlock,
  TreeTestBlock,
  blockAnimations
};
