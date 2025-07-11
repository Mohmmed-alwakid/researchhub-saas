import React, { useState, useEffect, useCallback } from 'react';
import { BlockRenderer, StudyBlock } from './StudyBlockComponents';

import { Button } from '../ui/Button';
import { Card, CardContent } from '../ui/Card';
import { ArrowLeft, ArrowRight, CheckCircle, Pause, Play, Save, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

interface StudyBlockSessionProps {
  sessionId: string;
  studyId: string;
  onComplete: () => void;
  onExit: () => void;
}

interface SessionState {
  status: 'active' | 'paused' | 'completed';
  pausedAt?: number;
  totalPauseTime: number;
  autoSaveEnabled: boolean;
  lastSaveTime?: number;
}

interface ValidationError {
  field: string;
  message: string;
  severity: 'error' | 'warning';
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
  
  // Enhanced session management state
  const [sessionState, setSessionState] = useState<SessionState>({
    status: 'active',
    totalPauseTime: 0,
    autoSaveEnabled: true
  });

  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);

  // Visual progress tracking
  const estimatedTimeRemaining = blocks.length > 0 ? Math.round((blocks.length - currentBlockIndex) * 2) : 0; // 2 min per block estimate

  // Session management functions
  const pauseSession = useCallback(() => {
    setSessionState(prev => ({
      ...prev,
      status: 'paused',
      pausedAt: Date.now()
    }));
    toast.success('Session paused');
  }, []);

  const resumeSession = useCallback(() => {
    setSessionState(prev => {
      const pauseDuration = prev.pausedAt ? Date.now() - prev.pausedAt : 0;
      return {
        ...prev,
        status: 'active',
        pausedAt: undefined,
        totalPauseTime: prev.totalPauseTime + pauseDuration
      };
    });
    toast.success('Session resumed');
  }, []);

  const saveSessionProgress = useCallback(async () => {
    try {
      const authStorage = localStorage.getItem('auth-storage');
      let token = '';
      if (authStorage) {
        const { state } = JSON.parse(authStorage);
        token = state?.token || '';
      }

      const progressData = {
        sessionId,
        currentBlockIndex,
        completedBlocks: Array.from(completedBlocks),
        sessionState,
        lastSaveTime: Date.now()
      };

      const response = await fetch('/api/study-sessions/progress', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(progressData)
      });

      if (response.ok) {
        setSessionState(prev => ({ ...prev, lastSaveTime: Date.now() }));
      }
    } catch (error) {
      console.warn('Auto-save failed:', error);
    }
  }, [sessionId, currentBlockIndex, completedBlocks, sessionState]);

  // Auto-save functionality
  useEffect(() => {
    if (!sessionState.autoSaveEnabled || sessionState.status === 'paused') return;

    const autoSaveInterval = setInterval(() => {
      if (currentBlockIndex < blocks.length) {
        saveSessionProgress();
      }
    }, 30000); // Auto-save every 30 seconds

    return () => clearInterval(autoSaveInterval);
  }, [sessionState.autoSaveEnabled, sessionState.status, currentBlockIndex, blocks.length, saveSessionProgress]);

  // Data validation functions
  const validateBlockResponse = (blockType: string, response: Record<string, unknown>): ValidationError[] => {
    const errors: ValidationError[] = [];

    switch (blockType) {
      case 'open_question':
        if (!response.answer || typeof response.answer !== 'string' || response.answer.trim().length < 10) {
          errors.push({
            field: 'answer',
            message: 'Please provide a more detailed response (at least 10 characters)',
            severity: 'warning'
          });
        }
        break;
      case 'multiple_choice':
        if (!response.selectedOption) {
          errors.push({
            field: 'selectedOption',
            message: 'Please select an option',
            severity: 'error'
          });
        }
        break;
      case 'opinion_scale':
        if (response.rating === undefined || response.rating === null) {
          errors.push({
            field: 'rating',
            message: 'Please provide a rating',
            severity: 'error'
          });
        }
        break;
      case 'simple_input':
        if (!response.value || typeof response.value !== 'string' || response.value.trim().length === 0) {
          errors.push({
            field: 'value',
            message: 'This field is required',
            severity: 'error'
          });
        }
        break;
    }

    return errors;
  };

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

        const response = await fetch(`/api/blocks?action=study&studyId=${studyId}`, {
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
        
        // Auto-save session progress when starting a new block
        saveSessionProgress();
      }
    }
  }, [currentBlockIndex, blocks, saveSessionProgress]);

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

      // Check if this is the last block (for completion detection)
      const isLastBlock = currentBlockIndex >= blocks.length - 1;
      
      const saveResponse = await fetch('/api/blocks?action=response', {
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
          isLastBlock, // Signal to backend that this is completion
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
      
      // Check if study was completed
      if (saveData.data?.studyCompleted) {
        console.log('🎉 Study completed!', saveData.data.completionMessage);
        toast.success(saveData.data.completionMessage || 'Study completed successfully!');
        setSessionState(prev => ({ ...prev, status: 'completed' }));
        return { completed: true };
      } else {
        toast.success('Response saved');
        return { completed: false };
      }

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
      // Enhanced validation with user feedback
      const errors = validateBlockResponse(currentBlock.type, response);
      setValidationErrors(errors);
      
      // Filter critical errors that prevent progression
      const criticalErrors = errors.filter(e => e.severity === 'error');
      
      if (criticalErrors.length > 0) {
        toast.error('Please fix the required fields before proceeding');
        return;
      }
      
      // Show warnings but allow progression
      if (errors.length > 0) {
        const warnings = errors.filter(e => e.severity === 'warning');
        if (warnings.length > 0) {
          toast('Your response has been noted. Consider providing more detail.', { 
            icon: '⚠️',
            duration: 3000 
          });
        }
      }

      // Clear validation errors on successful validation
      setValidationErrors([]);

      const saveResult = await saveBlockResponse(currentBlock.id, currentBlock.type, response);
      
      // Mark block as completed
      setCompletedBlocks(prev => new Set([...prev, currentBlock.id]));
      
      // Check if study was completed
      if (saveResult?.completed) {
        // Study is completed, trigger completion flow
        setTimeout(() => {
          onComplete();
        }, 2000); // Give user time to see the completion message
        return;
      }
      
      // Update session progress
      await saveSessionProgress();
      
      // Check if this is the last block
      if (currentBlockIndex >= blocks.length - 1) {
        console.log('🎉 All blocks completed!');
        setSessionState(prev => ({ ...prev, status: 'completed' }));
        
        // Save final session state
        await saveSessionProgress();
        
        toast.success('Study completed successfully!');
        setTimeout(() => {
          onComplete();
        }, 1500);
      } else {
        // Move to next block
        handleNext();
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
  const currentProgressPercentage = Math.round(((currentBlockIndex + 1) / blocks.length) * 100);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Enhanced Header with Session Controls */}
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
              
              {/* Session Status Indicator */}
              <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
                sessionState.status === 'active' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                <div className={`w-2 h-2 rounded-full ${
                  sessionState.status === 'active' ? 'bg-green-500' : 'bg-yellow-500'
                }`}></div>
                {sessionState.status === 'active' ? 'Active' : 'Paused'}
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Session Controls */}
              <div className="flex items-center space-x-2">
                {sessionState.status === 'active' ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={pauseSession}
                    className="flex items-center space-x-1"
                  >
                    <Pause className="w-3 h-3" />
                    <span>Pause</span>
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={resumeSession}
                    className="flex items-center space-x-1"
                  >
                    <Play className="w-3 h-3" />
                    <span>Resume</span>
                  </Button>
                )}
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={saveSessionProgress}
                  disabled={saving}
                  className="flex items-center space-x-1"
                >
                  <Save className="w-3 h-3" />
                  <span>{saving ? 'Saving...' : 'Save'}</span>
                </Button>
              </div>

              {/* Progress and Time Tracking */}
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-1 text-sm text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span>~{estimatedTimeRemaining}m left</span>
                </div>
                
                <div className="text-sm font-medium text-gray-900">
                  {currentProgressPercentage}% Complete
                </div>
                
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-500 ease-in-out" 
                    style={{ width: `${currentProgressPercentage}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Auto-save indicator */}
          {sessionState.lastSaveTime && (
            <div className="border-t border-gray-100 px-4 py-2">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>Auto-save enabled</span>
                <span>Last saved: {new Date(sessionState.lastSaveTime).toLocaleTimeString()}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Validation Errors Banner */}
      {validationErrors.length > 0 && (
        <div className="bg-red-50 border-b border-red-200">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-medium text-red-800">
                  Please fix the following issues:
                </h3>
                <ul className="mt-1 text-sm text-red-700 list-disc list-inside">
                  {validationErrors.map((error, index) => (
                    <li key={index}>{error.message}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Session Paused Overlay */}
      {sessionState.status === 'paused' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardContent className="text-center py-8">
              <Pause className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Session Paused</h2>
              <p className="text-gray-600 mb-6">
                Your progress has been saved. You can resume the study at any time.
              </p>
              <div className="space-y-3">
                <Button onClick={resumeSession} className="w-full">
                  <Play className="w-4 h-4 mr-2" />
                  Resume Study
                </Button>
                <Button variant="outline" onClick={handleExit} className="w-full">
                  Exit for Now
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

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
