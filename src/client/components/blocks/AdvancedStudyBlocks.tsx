/**
 * Advanced Study Block Components
 * 
 * Includes advanced block types with conditional logic, branching, and AI integration
 * Created: June 25, 2025
 */

import { useState, useEffect } from 'react';
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
                onDragStart={(e) => handleDragStart(e, item)}
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

export default {
  ConditionalBranchBlock,
  AIFollowUpBlock,
  CardSortBlock,
  blockAnimations
};
