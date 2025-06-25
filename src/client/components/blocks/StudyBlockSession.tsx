import React, { useState, useEffect } from 'react';
import { BlockRenderer, StudyBlock } from './StudyBlockComponents';
import { ConditionalBranchBlock, AIFollowUpBlock, CardSortBlock, blockAnimations } from './AdvancedStudyBlocks';
import { Button } from '../ui/Button';
import { Card, CardContent } from '../ui/Card';
import { ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

interface StudyBlockSessionProps {
  sessionId: string;
  studyId: string;
  onComplete: () => void;
  onExit: () => void;
}

export const StudyBlockSession: React.FC<StudyBlockSessionProps> = ({
  sessionId,
  studyId,
  onComplete,
  onExit
}) => {
  const [blocks, setBlocks] = useState<StudyBlock[]>([]);
  const [currentBlockIndex, setCurrentBlockIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [completedBlocks, setCompletedBlocks] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchBlocks = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get auth token
        const authStorage = localStorage.getItem('auth-storage');
        let token = '';
        if (authStorage) {
          try {
            const { state } = JSON.parse(authStorage);
            token = state?.token || '';
          } catch (e) {
            console.warn('Failed to parse auth storage:', e);
          }
        }

        if (!token) {
          throw new Error('No authentication token found');
        }

        console.log('📋 Loading blocks for study:', studyId);

        const response = await fetch(`/api/study-blocks?studyId=${studyId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error(`Failed to load blocks: ${response.statusText}`);
        }

        const data = await response.json();
        
        if (!data.success) {
          throw new Error(data.error || 'Failed to load blocks');
        }

        console.log('✅ Loaded blocks:', data.blocks);
        setBlocks(data.blocks || []);

      } catch (error) {
        console.error('❌ Error loading blocks:', error);
        setError(error instanceof Error ? error.message : 'Failed to load study blocks');
        toast.error('Failed to load study blocks');
      } finally {
        setLoading(false);
      }
    };

    fetchBlocks();
  }, [studyId]);

  // Track block start time when currentBlockIndex changes
  useEffect(() => {
    if (blocks.length > 0 && currentBlockIndex < blocks.length) {
      const currentBlock = blocks[currentBlockIndex];
      const blockKey = `block_${currentBlock.id}_start`;
      
      if (!sessionStorage.getItem(blockKey)) {
        sessionStorage.setItem(blockKey, Date.now().toString());
        sessionStorage.setItem(`block_${currentBlock.id}_interactions`, '0');
        console.log('📊 Started tracking block:', currentBlock.id);
      }
    }
  }, [currentBlockIndex, blocks]);

  const saveBlockResponse = async (blockId: string, blockType: string, response: Record<string, string | number | boolean | string[]>) => {
    try {
      setSaving(true);

      // Get auth token
      const authStorage = localStorage.getItem('auth-storage');
      let token = '';
      if (authStorage) {
        try {
          const { state } = JSON.parse(authStorage);
          token = state?.token || '';
        } catch (e) {
          console.warn('Failed to parse auth storage:', e);
        }
      }

      if (!token) {
        throw new Error('No authentication token found');
      }

      // Collect analytics data
      const now = Date.now();
      const startTime = sessionStorage.getItem(`block_${blockId}_start`) || now.toString();
      const interactionCount = Number(sessionStorage.getItem(`block_${blockId}_interactions`) || 0);
      
      const analytics = [
        {
          type: 'block_start',
          timestamp: Number(startTime),
          data: { blockType, blockId },
          sequence: 0
        },
        {
          type: 'block_complete',
          timestamp: now,
          data: { 
            blockType, 
            blockId, 
            timeSpent: Math.floor((now - Number(startTime)) / 1000),
            responseLength: JSON.stringify(response).length,
            interactionCount
          },
          sequence: interactionCount + 1
        }
      ];

      console.log('💾 Saving block response:', { blockId, blockType, analytics: analytics.length });

      const saveResponse = await fetch('/api/study-blocks', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sessionId,
          blockId,
          blockType,
          response,
          metadata: {
            completedAt: new Date().toISOString(),
            sessionId: sessionId,
            userAgent: navigator.userAgent,
            screenResolution: `${window.screen.width}x${window.screen.height}`,
            viewportSize: `${window.innerWidth}x${window.innerHeight}`
          },
          startTime: new Date(Number(startTime)).toISOString(),
          interactionCount,
          analytics
        })
      });

      if (!saveResponse.ok) {
        throw new Error(`Failed to save response: ${saveResponse.statusText}`);
      }

      const saveData = await saveResponse.json();
      
      if (!saveData.success) {
        throw new Error(saveData.error || 'Failed to save response');
      }

      console.log('✅ Block response saved successfully:', saveData.source || 'unknown');
      toast.success('Response saved');

      // Mark block as completed
      setCompletedBlocks(prev => new Set([...prev, blockId]));

      // Clear analytics session data for this block
      sessionStorage.removeItem(`block_${blockId}_start`);
      sessionStorage.removeItem(`block_${blockId}_interactions`);

    } catch (error) {
      console.error('❌ Error saving block response:', error);
      toast.error('Failed to save response');
      throw error; // Re-throw to prevent progression
    } finally {
      setSaving(false);
    }
  };

  const handleBlockComplete = async (response: Record<string, string | number | boolean | string[]>) => {
    if (blocks.length === 0) return;

    const currentBlock = blocks[currentBlockIndex];
    
    try {
      await saveBlockResponse(currentBlock.id, currentBlock.type, response);
      
      // Check if this is the last block
      if (currentBlockIndex >= blocks.length - 1) {
        console.log('🎉 All blocks completed!');
        toast.success('Study completed successfully!');
        setTimeout(() => {
          onComplete();
        }, 1000);
      }
    } catch (error) {
      // Error handling is done in saveBlockResponse
      console.error('Failed to complete block:', error);
    }
  };

  const handleNext = () => {
    if (currentBlockIndex < blocks.length - 1) {
      setCurrentBlockIndex(currentBlockIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentBlockIndex > 0) {
      setCurrentBlockIndex(currentBlockIndex - 1);
    }
  };

  const handleExit = () => {
    if (window.confirm('Are you sure you want to exit the study? Your progress will be saved.')) {
      onExit();
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading study blocks...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-8">
            <div className="text-red-600 mb-4">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Study</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <div className="space-y-2">
              <Button onClick={() => window.location.reload()} className="w-full">
                Try Again
              </Button>
              <Button variant="outline" onClick={onExit} className="w-full">
                Exit Study
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // No blocks found
  if (blocks.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-8">
            <p className="text-gray-600 mb-4">No blocks found for this study.</p>
            <Button onClick={onExit}>Exit Study</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentBlock = blocks[currentBlockIndex];
  const isLastBlock = currentBlockIndex >= blocks.length - 1;
  const isFirstBlock = currentBlockIndex === 0;
  const progressPercentage = Math.round(((currentBlockIndex + 1) / blocks.length) * 100);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with progress */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                onClick={handleExit}
                className="text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Exit Study
              </Button>
              <div className="text-sm text-gray-600">
                Block {currentBlockIndex + 1} of {blocks.length}
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-sm font-medium text-gray-900">
                {progressPercentage}% Complete
              </div>
              <div className="w-32 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          {/* Block navigation breadcrumb */}
          <div className="flex items-center space-x-2 mb-6">
            {blocks.map((block, index) => (
              <React.Fragment key={block.id}>
                <div className={`flex items-center space-x-2 ${
                  index === currentBlockIndex 
                    ? 'text-blue-600 font-medium' 
                    : completedBlocks.has(block.id)
                      ? 'text-green-600'
                      : 'text-gray-400'
                }`}>
                  {completedBlocks.has(block.id) ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <div className={`w-4 h-4 rounded-full border-2 ${
                      index === currentBlockIndex 
                        ? 'border-blue-600 bg-blue-100' 
                        : 'border-gray-300'
                    }`}>
                      {index === currentBlockIndex && (
                        <div className="w-2 h-2 bg-blue-600 rounded-full m-0.5"></div>
                      )}
                    </div>
                  )}
                  <span className="text-sm">{block.type.replace('_', ' ')}</span>
                </div>
                {index < blocks.length - 1 && (
                  <ArrowRight className="w-3 h-3 text-gray-300" />
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Current block */}
          <AnimatePresence mode="wait">
            <motion.div 
              key={currentBlock.id}
              className="relative"
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              {saving && (
                <motion.div 
                  className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10 rounded-lg"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex items-center space-x-2">
                    <motion.div 
                      className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    ></motion.div>
                    <span className="text-blue-600 font-medium">Saving...</span>
                  </div>
                </motion.div>
              )}
              
              <BlockRenderer
                block={currentBlock}
                onComplete={handleBlockComplete}
                onNext={handleNext}
                isLastBlock={isLastBlock}
              />
            </motion.div>
          </AnimatePresence>

          {/* Navigation buttons */}
          <div className="flex justify-between mt-8">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={isFirstBlock}
              className="flex items-center"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>
            
            <div className="text-sm text-gray-500 flex items-center">
              {completedBlocks.size} of {blocks.length} blocks completed
            </div>
            
            <Button
              variant="outline"
              onClick={handleNext}
              disabled={isLastBlock || !completedBlocks.has(currentBlock.id)}
              className="flex items-center"
            >
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
