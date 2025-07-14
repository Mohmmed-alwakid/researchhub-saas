# 🎯 PARTICIPANT EXPERIENCE SYSTEM - COMPREHENSIVE REQUIREMENTS
## Seamless Research Participation & Study Execution

**Created**: July 12, 2025  
**Status**: 🟢 GREENFIELD SPECIFICATION  
**Scope**: Complete participant journey, study execution, and engagement system  
**Dependencies**: Study Creation System (04-STUDY_CREATION_SYSTEM.md), User Management (03-USER_MANAGEMENT_SYSTEM.md)

---

## 📋 EXECUTIVE SUMMARY

The Participant Experience System creates an engaging, intuitive, and accessible platform for users to discover, apply for, and complete research studies while ensuring high-quality data collection and participant satisfaction.

### **🎯 Core Value Proposition**
> "Effortless research participation that respects participant time while delivering high-quality insights to researchers"

### **🏆 Success Metrics**
- **Participation Rate**: >85% application-to-completion rate
- **User Satisfaction**: >4.7/5 participant experience rating
- **Data Quality**: >95% complete and valid responses
- **Time Efficiency**: <50% of estimated study duration actual time

---

## 🗄️ DATABASE SCHEMA

### **Participant Experience Tables**
```sql
-- Study sessions for participant progress tracking
CREATE TABLE study_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  study_id UUID NOT NULL REFERENCES studies(id) ON DELETE CASCADE,
  participant_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Session management
  session_token UUID NOT NULL UNIQUE DEFAULT uuid_generate_v4(),
  status session_status NOT NULL DEFAULT 'started',
  
  -- Progress tracking
  current_block_id UUID,
  completed_blocks UUID[] DEFAULT '{}',
  total_blocks INTEGER NOT NULL,
  progress_percentage DECIMAL(5,2) DEFAULT 0,
  
  -- Timing data
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  estimated_duration INTEGER, -- minutes
  actual_duration INTEGER, -- minutes
  
  -- Session data
  session_data JSONB DEFAULT '{}',
  participant_metadata JSONB DEFAULT '{}',
  
  -- Device and context
  device_info JSONB DEFAULT '{}',
  browser_info JSONB DEFAULT '{}',
  screen_resolution VARCHAR(20),
  
  -- Quality metrics
  attention_score DECIMAL(3,2), -- 0-1 scale
  completion_quality quality_rating,
  
  UNIQUE(study_id, participant_id)
);

-- Block responses for detailed interaction tracking
CREATE TABLE block_responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES study_sessions(id) ON DELETE CASCADE,
  block_id UUID NOT NULL,
  block_type block_type NOT NULL,
  
  -- Response data
  response_data JSONB NOT NULL DEFAULT '{}',
  response_text TEXT,
  response_files TEXT[] DEFAULT '{}',
  
  -- Interaction tracking
  view_time INTEGER, -- milliseconds
  interaction_count INTEGER DEFAULT 0,
  scroll_depth DECIMAL(5,2), -- percentage
  clicks_recorded JSONB DEFAULT '{}',
  
  -- Quality metrics
  is_complete BOOLEAN DEFAULT FALSE,
  quality_score DECIMAL(3,2), -- 0-1 scale
  attention_indicators JSONB DEFAULT '{}',
  
  -- Timestamps
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  submitted_at TIMESTAMP WITH TIME ZONE,
  
  UNIQUE(session_id, block_id)
);

-- Participant feedback and ratings
CREATE TABLE participant_feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES study_sessions(id) ON DELETE CASCADE,
  participant_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  study_id UUID NOT NULL REFERENCES studies(id) ON DELETE CASCADE,
  
  -- Feedback ratings
  overall_rating INTEGER CHECK (overall_rating >= 1 AND overall_rating <= 5),
  difficulty_rating INTEGER CHECK (difficulty_rating >= 1 AND difficulty_rating <= 5),
  clarity_rating INTEGER CHECK (clarity_rating >= 1 AND clarity_rating <= 5),
  technical_rating INTEGER CHECK (technical_rating >= 1 AND technical_rating <= 5),
  
  -- Feedback text
  feedback_text TEXT,
  improvement_suggestions TEXT,
  technical_issues TEXT,
  
  -- Experience metrics
  would_participate_again BOOLEAN,
  would_recommend BOOLEAN,
  
  -- Context
  completion_context completion_context,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Study applications and screening
CREATE TABLE study_applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  study_id UUID NOT NULL REFERENCES studies(id) ON DELETE CASCADE,
  participant_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Application data
  application_responses JSONB DEFAULT '{}',
  screening_responses JSONB DEFAULT '{}',
  demographic_data JSONB DEFAULT '{}',
  
  -- Status tracking
  status application_status NOT NULL DEFAULT 'pending',
  status_reason TEXT,
  reviewed_by UUID REFERENCES users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  
  -- Scheduling (for interviews/moderated studies)
  preferred_times JSONB DEFAULT '{}',
  scheduled_time TIMESTAMP WITH TIME ZONE,
  timezone VARCHAR(50),
  
  -- Communication
  confirmation_sent BOOLEAN DEFAULT FALSE,
  reminder_sent BOOLEAN DEFAULT FALSE,
  instructions_sent BOOLEAN DEFAULT FALSE,
  
  -- Metadata
  application_source VARCHAR(50), -- 'direct', 'invitation', 'referral'
  referral_code VARCHAR(20),
  
  -- Timestamps
  applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(study_id, participant_id)
);

-- Participant notifications and communications
CREATE TABLE participant_notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  participant_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  study_id UUID REFERENCES studies(id) ON DELETE CASCADE,
  
  -- Notification details
  type notification_type NOT NULL,
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  
  -- Action button
  action_url TEXT,
  action_text VARCHAR(50),
  
  -- Delivery settings
  delivery_method notification_delivery[] DEFAULT '{in_app}',
  priority notification_priority DEFAULT 'normal',
  
  -- Status tracking
  status notification_status DEFAULT 'pending',
  sent_at TIMESTAMP WITH TIME ZONE,
  read_at TIMESTAMP WITH TIME ZONE,
  clicked_at TIMESTAMP WITH TIME ZONE,
  
  -- Scheduling
  scheduled_for TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  
  -- Metadata
  template_id UUID,
  metadata JSONB DEFAULT '{}',
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Participant rewards and incentives
CREATE TABLE participant_rewards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  participant_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  study_id UUID NOT NULL REFERENCES studies(id) ON DELETE CASCADE,
  session_id UUID REFERENCES study_sessions(id),
  
  -- Reward details
  reward_type reward_type NOT NULL,
  amount DECIMAL(10,2),
  currency VARCHAR(3) DEFAULT 'USD',
  description TEXT,
  
  -- Status tracking
  status reward_status DEFAULT 'pending',
  earned_at TIMESTAMP WITH TIME ZONE,
  processed_at TIMESTAMP WITH TIME ZONE,
  
  -- Payment details
  payment_method VARCHAR(50),
  payment_reference VARCHAR(100),
  payment_fee DECIMAL(10,2) DEFAULT 0,
  
  -- Metadata
  reward_criteria JSONB DEFAULT '{}',
  processing_metadata JSONB DEFAULT '{}',
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Accessibility preferences and accommodations
CREATE TABLE participant_accessibility (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  participant_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Visual accommodations
  screen_reader_user BOOLEAN DEFAULT FALSE,
  high_contrast_mode BOOLEAN DEFAULT FALSE,
  font_size_preference font_size_preference DEFAULT 'medium',
  color_blind_type color_blind_type,
  
  -- Motor accommodations
  keyboard_navigation_only BOOLEAN DEFAULT FALSE,
  reduced_motion BOOLEAN DEFAULT FALSE,
  extended_time_needed BOOLEAN DEFAULT FALSE,
  time_multiplier DECIMAL(3,2) DEFAULT 1.0,
  
  -- Cognitive accommodations
  simplified_instructions BOOLEAN DEFAULT FALSE,
  frequent_breaks_needed BOOLEAN DEFAULT FALSE,
  audio_instructions BOOLEAN DEFAULT FALSE,
  
  -- Communication preferences
  preferred_communication communication_method[] DEFAULT '{email}',
  language_preference VARCHAR(10) DEFAULT 'en',
  
  -- Technical accommodations
  low_bandwidth_mode BOOLEAN DEFAULT FALSE,
  mobile_optimized BOOLEAN DEFAULT FALSE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(participant_id)
);

-- ENUMs for participant experience
CREATE TYPE session_status AS ENUM ('started', 'in_progress', 'paused', 'completed', 'abandoned', 'expired');
CREATE TYPE quality_rating AS ENUM ('poor', 'fair', 'good', 'excellent');
CREATE TYPE completion_context AS ENUM ('completed', 'time_limit', 'technical_issue', 'voluntary_exit', 'disqualified');
CREATE TYPE application_status AS ENUM ('pending', 'approved', 'rejected', 'waitlisted', 'withdrawn');
CREATE TYPE notification_type AS ENUM ('study_invitation', 'application_update', 'session_reminder', 'reward_notification', 'system_update');
CREATE TYPE notification_delivery AS ENUM ('in_app', 'email', 'sms', 'push');
CREATE TYPE notification_priority AS ENUM ('low', 'normal', 'high', 'urgent');
CREATE TYPE notification_status AS ENUM ('pending', 'sent', 'delivered', 'read', 'clicked', 'failed');
CREATE TYPE reward_type AS ENUM ('monetary', 'gift_card', 'product_sample', 'donation', 'none');
CREATE TYPE reward_status AS ENUM ('pending', 'earned', 'processing', 'paid', 'failed', 'cancelled');
CREATE TYPE font_size_preference AS ENUM ('small', 'medium', 'large', 'extra_large');
CREATE TYPE color_blind_type AS ENUM ('protanopia', 'deuteranopia', 'tritanopia', 'monochromacy');
CREATE TYPE communication_method AS ENUM ('email', 'sms', 'phone', 'in_app', 'postal');

-- Performance indexes
CREATE INDEX idx_study_sessions_participant ON study_sessions(participant_id, status);
CREATE INDEX idx_study_sessions_study ON study_sessions(study_id, status);
CREATE INDEX idx_study_sessions_progress ON study_sessions(study_id, progress_percentage);
CREATE INDEX idx_block_responses_session ON block_responses(session_id, block_id);
CREATE INDEX idx_block_responses_timing ON block_responses(started_at, completed_at);
CREATE INDEX idx_participant_feedback_study ON participant_feedback(study_id, overall_rating);
CREATE INDEX idx_study_applications_participant ON study_applications(participant_id, status);
CREATE INDEX idx_study_applications_study ON study_applications(study_id, status);
CREATE INDEX idx_participant_notifications_participant ON participant_notifications(participant_id, status);
CREATE INDEX idx_participant_rewards_participant ON participant_rewards(participant_id, status);
```

---

## 🎨 UI COMPONENTS ARCHITECTURE

### **StudyParticipationFlow Component**
```typescript
// src/components/participant/StudyParticipationFlow.tsx
interface StudyParticipationFlowProps {
  studyId: string;
  participantId: string;
  onComplete: (sessionData: StudySessionData) => void;
  onExit: (reason: ExitReason) => void;
}

interface StudySessionState {
  currentBlockIndex: number;
  completedBlocks: string[];
  sessionData: Record<string, any>;
  timeSpent: number;
  startTime: Date;
  lastActivityTime: Date;
  isSubmitting: boolean;
  hasUnsavedChanges: boolean;
}

export const StudyParticipationFlow: React.FC<StudyParticipationFlowProps> = ({
  studyId,
  participantId,
  onComplete,
  onExit
}) => {
  const [study, setStudy] = useState<Study | null>(null);
  const [session, setSession] = useState<StudySession | null>(null);
  const [state, setState] = useState<StudySessionState>({
    currentBlockIndex: 0,
    completedBlocks: [],
    sessionData: {},
    timeSpent: 0,
    startTime: new Date(),
    lastActivityTime: new Date(),
    isSubmitting: false,
    hasUnsavedChanges: false
  });

  const [blocks, setBlocks] = useState<StudyBlock[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Auto-save and activity tracking
  const { saveProgress, trackActivity } = useStudySession(studyId, participantId);
  const { recordInteraction } = useInteractionTracking();
  const { accessibility } = useAccessibilitySettings(participantId);

  useEffect(() => {
    initializeSession();
  }, [studyId, participantId]);

  // Auto-save progress every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (state.hasUnsavedChanges && !state.isSubmitting) {
        saveProgress(state.sessionData, state.currentBlockIndex);
        setState(prev => ({ ...prev, hasUnsavedChanges: false }));
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [state.hasUnsavedChanges, state.isSubmitting]);

  // Track user activity and prevent timeouts
  useEffect(() => {
    const activityTracker = setInterval(() => {
      trackActivity();
      setState(prev => ({ 
        ...prev, 
        timeSpent: Date.now() - prev.startTime.getTime(),
        lastActivityTime: new Date()
      }));
    }, 60000); // Every minute

    return () => clearInterval(activityTracker);
  }, []);

  const initializeSession = async () => {
    try {
      setIsLoading(true);
      
      // Load study and session data
      const [studyResponse, sessionResponse] = await Promise.all([
        fetch(`/api/studies/${studyId}/participant-view`),
        fetch(`/api/study-sessions/${studyId}/${participantId}`)
      ]);

      if (!studyResponse.ok) throw new Error('Study not found');
      
      const studyData = await studyResponse.json();
      setStudy(studyData.study);
      setBlocks(studyData.blocks);

      // Initialize or resume session
      if (sessionResponse.ok) {
        const sessionData = await sessionResponse.json();
        setSession(sessionData.session);
        setState(prev => ({
          ...prev,
          currentBlockIndex: sessionData.session.currentBlockIndex || 0,
          completedBlocks: sessionData.session.completedBlocks || [],
          sessionData: sessionData.session.sessionData || {},
          startTime: new Date(sessionData.session.startedAt)
        }));
      } else {
        // Create new session
        const newSession = await createStudySession(studyId, participantId);
        setSession(newSession);
      }

    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load study');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBlockComplete = async (blockId: string, responseData: any) => {
    try {
      setState(prev => ({ ...prev, isSubmitting: true }));

      // Record block response
      await recordInteraction(session!.id, blockId, {
        responseData,
        timeSpent: Date.now() - state.lastActivityTime.getTime(),
        blockType: blocks[state.currentBlockIndex].type
      });

      // Update session state
      const newCompletedBlocks = [...state.completedBlocks, blockId];
      const newSessionData = {
        ...state.sessionData,
        [blockId]: responseData
      };

      setState(prev => ({
        ...prev,
        currentBlockIndex: prev.currentBlockIndex + 1,
        completedBlocks: newCompletedBlocks,
        sessionData: newSessionData,
        hasUnsavedChanges: true
      }));

      // Check if study is complete
      if (state.currentBlockIndex + 1 >= blocks.length) {
        await completeStudy(newSessionData);
      } else {
        // Save progress
        await saveProgress(newSessionData, state.currentBlockIndex + 1);
      }

    } catch (error) {
      setError('Failed to save response. Please try again.');
    } finally {
      setState(prev => ({ ...prev, isSubmitting: false }));
    }
  };

  const completeStudy = async (finalSessionData: Record<string, any>) => {
    try {
      const response = await fetch(`/api/study-sessions/${session!.id}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionData: finalSessionData,
          totalTimeSpent: state.timeSpent,
          completionQuality: calculateCompletionQuality(finalSessionData)
        })
      });

      if (response.ok) {
        const completionData = await response.json();
        onComplete(completionData);
      } else {
        throw new Error('Failed to complete study');
      }

    } catch (error) {
      setError('Failed to complete study. Please try again.');
    }
  };

  const handleExit = async (reason: ExitReason) => {
    if (state.hasUnsavedChanges) {
      await saveProgress(state.sessionData, state.currentBlockIndex);
    }
    
    await recordInteraction(session!.id, 'session_exit', {
      reason,
      timeSpent: state.timeSpent,
      currentBlock: state.currentBlockIndex,
      completionPercentage: (state.completedBlocks.length / blocks.length) * 100
    });

    onExit(reason);
  };

  const calculateProgress = (): number => {
    return Math.round((state.completedBlocks.length / blocks.length) * 100);
  };

  const calculateCompletionQuality = (sessionData: Record<string, any>): number => {
    // Quality score based on response completeness, time spent, and interaction patterns
    let qualityScore = 0.5; // Base score
    
    // Response completeness (40% of score)
    const responseCompleteness = Object.keys(sessionData).length / blocks.length;
    qualityScore += responseCompleteness * 0.4;
    
    // Time spent appropriateness (30% of score)
    const expectedTimeMin = study?.estimatedDuration || 15;
    const actualTimeMin = state.timeSpent / (1000 * 60);
    const timeRatio = Math.min(actualTimeMin / expectedTimeMin, 2);
    qualityScore += Math.min(timeRatio, 1) * 0.3;
    
    // Interaction quality (30% of score)
    // This would be calculated based on interaction patterns
    qualityScore += 0.3; // Simplified for now
    
    return Math.min(qualityScore, 1);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <StudyLoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <StudyErrorDisplay error={error} onRetry={initializeSession} />
      </div>
    );
  }

  if (!study || !session || blocks.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <StudyNotFound studyId={studyId} />
      </div>
    );
  }

  const currentBlock = blocks[state.currentBlockIndex];
  const progress = calculateProgress();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Study Header */}
      <StudyHeader
        study={study}
        progress={progress}
        currentBlock={state.currentBlockIndex + 1}
        totalBlocks={blocks.length}
        timeSpent={state.timeSpent}
        onExit={() => handleExit('voluntary_exit')}
        accessibility={accessibility}
      />

      {/* Progress Bar */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4">
          <ProgressBar
            progress={progress}
            currentStep={state.currentBlockIndex + 1}
            totalSteps={blocks.length}
            accessibility={accessibility}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentBlock.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <BlockRenderer
              block={currentBlock}
              initialData={state.sessionData[currentBlock.id]}
              onComplete={(responseData) => handleBlockComplete(currentBlock.id, responseData)}
              onDataChange={(data) => setState(prev => ({ 
                ...prev, 
                sessionData: { ...prev.sessionData, [currentBlock.id]: data },
                hasUnsavedChanges: true 
              }))}
              isSubmitting={state.isSubmitting}
              accessibility={accessibility}
              studyContext={{
                studyId,
                sessionId: session.id,
                blockIndex: state.currentBlockIndex,
                totalBlocks: blocks.length
              }}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Auto-save indicator */}
      <AutoSaveIndicator 
        hasUnsavedChanges={state.hasUnsavedChanges}
        isSubmitting={state.isSubmitting}
      />

      {/* Accessibility tools */}
      {accessibility.screenReaderUser && (
        <ScreenReaderAnnouncements
          currentBlock={currentBlock}
          progress={progress}
          timeSpent={state.timeSpent}
        />
      )}
    </div>
  );
};
```

### **BlockRenderer Component**
```typescript
// src/components/participant/BlockRenderer.tsx
interface BlockRendererProps {
  block: StudyBlock;
  initialData?: any;
  onComplete: (data: any) => void;
  onDataChange: (data: any) => void;
  isSubmitting: boolean;
  accessibility: AccessibilitySettings;
  studyContext: StudyContext;
}

export const BlockRenderer: React.FC<BlockRendererProps> = ({
  block,
  initialData,
  onComplete,
  onDataChange,
  isSubmitting,
  accessibility,
  studyContext
}) => {
  const [data, setData] = useState(initialData || {});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [interactionStartTime] = useState(Date.now());

  // Track interactions for analytics
  const { trackEvent } = useAnalytics();
  const interactionTracker = useRef<NodeJS.Timeout>();

  useEffect(() => {
    // Track block view
    trackEvent('block_viewed', {
      blockId: block.id,
      blockType: block.type,
      studyId: studyContext.studyId,
      blockIndex: studyContext.blockIndex
    });

    // Start interaction timing
    interactionTracker.current = setTimeout(() => {
      trackEvent('block_interaction_timeout', {
        blockId: block.id,
        timeSpent: Date.now() - interactionStartTime
      });
    }, 30000); // Track if user spends >30 seconds without interaction

    return () => {
      if (interactionTracker.current) {
        clearTimeout(interactionTracker.current);
      }
    };
  }, [block.id]);

  const handleDataChange = (newData: any) => {
    setData(newData);
    onDataChange(newData);
    setErrors({}); // Clear errors when data changes

    // Track interaction
    trackEvent('block_interaction', {
      blockId: block.id,
      blockType: block.type,
      interactionType: 'data_change'
    });
  };

  const handleSubmit = () => {
    const validationErrors = validateBlockResponse(block, data);
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      
      // Focus first error field for accessibility
      const firstErrorField = document.querySelector('[data-error="true"]') as HTMLElement;
      if (firstErrorField && accessibility.keyboardNavigationOnly) {
        firstErrorField.focus();
      }
      
      return;
    }

    // Track completion
    trackEvent('block_completed', {
      blockId: block.id,
      blockType: block.type,
      timeSpent: Date.now() - interactionStartTime,
      dataQuality: calculateDataQuality(block, data)
    });

    onComplete(data);
  };

  // Render appropriate block component based on type
  const renderBlockContent = () => {
    const commonProps = {
      block,
      data,
      onChange: handleDataChange,
      errors,
      accessibility,
      studyContext
    };

    switch (block.type) {
      case 'welcome':
        return <WelcomeBlock {...commonProps} />;
      
      case 'open_question':
        return <OpenQuestionBlock {...commonProps} />;
      
      case 'opinion_scale':
        return <OpinionScaleBlock {...commonProps} />;
      
      case 'multiple_choice':
        return <MultipleChoiceBlock {...commonProps} />;
      
      case 'simple_input':
        return <SimpleInputBlock {...commonProps} />;
      
      case 'yes_no':
        return <YesNoBlock {...commonProps} />;
      
      case 'five_second_test':
        return <FiveSecondTestBlock {...commonProps} />;
      
      case 'card_sort':
        return <CardSortBlock {...commonProps} />;
      
      case 'tree_test':
        return <TreeTestBlock {...commonProps} />;
      
      case 'image_upload':
        return <ImageUploadBlock {...commonProps} />;
      
      case 'file_upload':
        return <FileUploadBlock {...commonProps} />;
      
      case 'context_screen':
        return <ContextScreenBlock {...commonProps} />;
      
      case 'thank_you':
        return <ThankYouBlock {...commonProps} />;
      
      default:
        return (
          <div className="text-center py-8">
            <p className="text-gray-600">Unknown block type: {block.type}</p>
          </div>
        );
    }
  };

  const canProceed = () => {
    if (block.type === 'welcome' || block.type === 'context_screen' || block.type === 'thank_you') {
      return true; // These blocks don't require data input
    }
    
    return validateBlockResponse(block, data).length === 0;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      
      {/* Block Content */}
      <div className="p-6">
        {renderBlockContent()}
      </div>

      {/* Navigation */}
      <div className="border-t border-gray-200 bg-gray-50 px-6 py-4">
        <div className="flex justify-between items-center">
          
          {/* Progress indicator */}
          <div className="text-sm text-gray-600">
            Step {studyContext.blockIndex + 1} of {studyContext.totalBlocks}
          </div>

          {/* Action buttons */}
          <div className="flex space-x-3">
            {studyContext.blockIndex > 0 && (
              <button
                type="button"
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isSubmitting}
              >
                Previous
              </button>
            )}
            
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!canProceed() || isSubmitting}
              className={`
                px-6 py-2 text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500
                ${canProceed() && !isSubmitting
                  ? 'text-white bg-blue-600 hover:bg-blue-700'
                  : 'text-gray-400 bg-gray-200 cursor-not-allowed'
                }
              `}
            >
              {isSubmitting ? (
                <>
                  <Spinner className="w-4 h-4 mr-2" />
                  Submitting...
                </>
              ) : studyContext.blockIndex === studyContext.totalBlocks - 1 ? (
                'Complete Study'
              ) : (
                'Continue'
              )}
            </button>
          </div>
        </div>

        {/* Error summary for accessibility */}
        {Object.keys(errors).length > 0 && (
          <div 
            className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md"
            role="alert"
            aria-live="polite"
          >
            <h3 className="text-sm font-medium text-red-800">
              Please correct the following errors:
            </h3>
            <ul className="mt-1 text-sm text-red-700 list-disc list-inside">
              {Object.entries(errors).map(([field, error]) => (
                <li key={field}>{error}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};
```

---

## 🔧 API IMPLEMENTATION

### **Study Session Management API**
```typescript
// api/study-sessions/[studyId]/[participantId].ts
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { studyId, participantId } = req.query;
  const supabase = createServerSupabaseClient({ req, res });

  // Verify participant access
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user || user.id !== participantId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  switch (req.method) {
    case 'GET':
      return handleGetSession(req, res, supabase, studyId as string, participantId as string);
    case 'POST':
      return handleCreateSession(req, res, supabase, studyId as string, participantId as string);
    case 'PUT':
      return handleUpdateSession(req, res, supabase, studyId as string, participantId as string);
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}

async function handleGetSession(
  req: NextApiRequest,
  res: NextApiResponse,
  supabase: any,
  studyId: string,
  participantId: string
) {
  try {
    // Check if participant is approved for this study
    const { data: application } = await supabase
      .from('study_applications')
      .select('status')
      .eq('study_id', studyId)
      .eq('participant_id', participantId)
      .single();

    if (!application || application.status !== 'approved') {
      return res.status(403).json({ error: 'Not approved for this study' });
    }

    // Get existing session
    const { data: session, error } = await supabase
      .from('study_sessions')
      .select(`
        *,
        block_responses(*)
      `)
      .eq('study_id', studyId)
      .eq('participant_id', participantId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    return res.status(200).json({ session });

  } catch (error) {
    console.error('Get session error:', error);
    return res.status(500).json({ error: 'Failed to fetch session' });
  }
}

async function handleCreateSession(
  req: NextApiRequest,
  res: NextApiResponse,
  supabase: any,
  studyId: string,
  participantId: string
) {
  try {
    // Get study details
    const { data: study, error: studyError } = await supabase
      .from('studies')
      .select('*, study_blocks(*)')
      .eq('id', studyId)
      .single();

    if (studyError) throw studyError;

    // Check if session already exists
    const { data: existingSession } = await supabase
      .from('study_sessions')
      .select('id')
      .eq('study_id', studyId)
      .eq('participant_id', participantId)
      .single();

    if (existingSession) {
      return res.status(400).json({ error: 'Session already exists' });
    }

    // Create new session
    const { data: session, error: sessionError } = await supabase
      .from('study_sessions')
      .insert({
        study_id: studyId,
        participant_id: participantId,
        total_blocks: study.study_blocks.length,
        estimated_duration: study.estimated_duration,
        device_info: req.body.deviceInfo || {},
        browser_info: req.body.browserInfo || {},
        screen_resolution: req.body.screenResolution
      })
      .select()
      .single();

    if (sessionError) throw sessionError;

    // Track session start
    await supabase.from('activity_logs').insert({
      activity_type: 'session_started',
      user_id: participantId,
      entity_type: 'study_session',
      entity_id: session.id,
      metadata: {
        study_id: studyId,
        device_info: req.body.deviceInfo
      }
    });

    return res.status(201).json({ session });

  } catch (error) {
    console.error('Create session error:', error);
    return res.status(500).json({ error: 'Failed to create session' });
  }
}

async function handleUpdateSession(
  req: NextApiRequest,
  res: NextApiResponse,
  supabase: any,
  studyId: string,
  participantId: string
) {
  try {
    const {
      currentBlockIndex,
      sessionData,
      progressPercentage,
      attentionScore
    } = req.body;

    const { data: session, error } = await supabase
      .from('study_sessions')
      .update({
        current_block_id: currentBlockIndex,
        session_data: sessionData,
        progress_percentage: progressPercentage,
        attention_score: attentionScore,
        last_activity_at: new Date().toISOString()
      })
      .eq('study_id', studyId)
      .eq('participant_id', participantId)
      .select()
      .single();

    if (error) throw error;

    return res.status(200).json({ session });

  } catch (error) {
    console.error('Update session error:', error);
    return res.status(500).json({ error: 'Failed to update session' });
  }
}

// api/block-responses/[sessionId]/[blockId].ts
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { sessionId, blockId } = req.query;
  const supabase = createServerSupabaseClient({ req, res });

  switch (req.method) {
    case 'POST':
      return handleRecordResponse(req, res, supabase, sessionId as string, blockId as string);
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}

async function handleRecordResponse(
  req: NextApiRequest,
  res: NextApiResponse,
  supabase: any,
  sessionId: string,
  blockId: string
) {
  try {
    const {
      responseData,
      responseText,
      responseFiles,
      viewTime,
      interactionCount,
      scrollDepth,
      clicksRecorded,
      qualityScore,
      attentionIndicators
    } = req.body;

    // Get session to verify ownership
    const { data: session, error: sessionError } = await supabase
      .from('study_sessions')
      .select('participant_id, study_id')
      .eq('id', sessionId)
      .single();

    if (sessionError) throw sessionError;

    // Verify user owns this session
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || user.id !== session.participant_id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Record block response
    const { data: response, error: responseError } = await supabase
      .from('block_responses')
      .upsert({
        session_id: sessionId,
        block_id: blockId,
        block_type: req.body.blockType,
        response_data: responseData,
        response_text: responseText,
        response_files: responseFiles || [],
        view_time: viewTime,
        interaction_count: interactionCount,
        scroll_depth: scrollDepth,
        clicks_recorded: clicksRecorded || {},
        quality_score: qualityScore,
        attention_indicators: attentionIndicators || {},
        is_complete: true,
        completed_at: new Date().toISOString(),
        submitted_at: new Date().toISOString()
      })
      .select()
      .single();

    if (responseError) throw responseError;

    // Update session progress
    const { error: updateError } = await supabase
      .from('study_sessions')
      .update({
        last_activity_at: new Date().toISOString()
      })
      .eq('id', sessionId);

    if (updateError) throw updateError;

    return res.status(201).json({ response });

  } catch (error) {
    console.error('Record response error:', error);
    return res.status(500).json({ error: 'Failed to record response' });
  }
}
```

---

## 🧪 TESTING SPECIFICATIONS

### **Participant Flow Testing**
```typescript
// tests/participant/study-participation.test.ts
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { StudyParticipationFlow } from '@/components/participant/StudyParticipationFlow';
import { mockStudy, mockParticipant, mockSession } from '@/test-utils/mocks';

describe('Study Participation Flow', () => {
  const mockOnComplete = jest.fn();
  const mockOnExit = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock API responses
    fetchMock.mockImplementation((url) => {
      if (url.includes('/participant-view')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            study: mockStudy,
            blocks: mockStudy.blocks
          })
        });
      }
      if (url.includes('/study-sessions/')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ session: mockSession })
        });
      }
      return Promise.reject(new Error('Not mocked'));
    });
  });

  it('should initialize session and display first block', async () => {
    render(
      <StudyParticipationFlow
        studyId="study-1"
        participantId="participant-1"
        onComplete={mockOnComplete}
        onExit={mockOnExit}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Welcome to our study')).toBeInTheDocument();
    });

    expect(screen.getByText('Step 1 of 5')).toBeInTheDocument();
  });

  it('should progress through blocks correctly', async () => {
    render(
      <StudyParticipationFlow
        studyId="study-1"
        participantId="participant-1"
        onComplete={mockOnComplete}
        onExit={mockOnExit}
      />
    );

    // Wait for first block to load
    await waitFor(() => {
      expect(screen.getByText('Welcome to our study')).toBeInTheDocument();
    });

    // Click continue on welcome block
    fireEvent.click(screen.getByText('Continue'));

    // Should advance to next block
    await waitFor(() => {
      expect(screen.getByText('Step 2 of 5')).toBeInTheDocument();
    });
  });

  it('should save progress automatically', async () => {
    const mockSaveProgress = jest.fn();
    jest.spyOn(require('@/hooks/useStudySession'), 'useStudySession')
      .mockReturnValue({ saveProgress: mockSaveProgress, trackActivity: jest.fn() });

    render(
      <StudyParticipationFlow
        studyId="study-1"
        participantId="participant-1"
        onComplete={mockOnComplete}
        onExit={mockOnExit}
      />
    );

    // Simulate data change
    const textInput = await screen.findByRole('textbox');
    fireEvent.change(textInput, { target: { value: 'Test response' } });

    // Wait for auto-save (mocked to be immediate)
    await waitFor(() => {
      expect(mockSaveProgress).toHaveBeenCalled();
    }, { timeout: 100 });
  });

  it('should handle errors gracefully', async () => {
    fetchMock.mockImplementationOnce(() => 
      Promise.resolve({
        ok: false,
        status: 404
      })
    );

    render(
      <StudyParticipationFlow
        studyId="invalid-study"
        participantId="participant-1"
        onComplete={mockOnComplete}
        onExit={mockOnExit}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/study not found/i)).toBeInTheDocument();
    });
  });

  it('should track user interactions', async () => {
    const mockTrackEvent = jest.fn();
    jest.spyOn(require('@/hooks/useAnalytics'), 'useAnalytics')
      .mockReturnValue({ trackEvent: mockTrackEvent });

    render(
      <StudyParticipationFlow
        studyId="study-1"
        participantId="participant-1"
        onComplete={mockOnComplete}
        onExit={mockOnExit}
      />
    );

    await waitFor(() => {
      expect(mockTrackEvent).toHaveBeenCalledWith('block_viewed', 
        expect.objectContaining({
          blockType: 'welcome',
          studyId: 'study-1'
        })
      );
    });
  });
});
```

### **Accessibility Testing**
```typescript
// tests/accessibility/participant-accessibility.test.ts
import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { StudyParticipationFlow } from '@/components/participant/StudyParticipationFlow';

expect.extend(toHaveNoViolations);

describe('Participant Experience Accessibility', () => {
  it('should be accessible with screen reader', async () => {
    const { container } = render(
      <StudyParticipationFlow
        studyId="study-1"
        participantId="participant-1"
        onComplete={jest.fn()}
        onExit={jest.fn()}
      />
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should support keyboard navigation', async () => {
    render(
      <StudyParticipationFlow
        studyId="study-1"
        participantId="participant-1"
        onComplete={jest.fn()}
        onExit={jest.fn()}
      />
    );

    // Test tab navigation
    const firstFocusable = screen.getAllByRole('button')[0];
    firstFocusable.focus();
    expect(document.activeElement).toBe(firstFocusable);

    // Test skip links
    const skipLink = screen.getByText('Skip to main content');
    expect(skipLink).toBeInTheDocument();
  });

  it('should provide proper ARIA labels', async () => {
    render(
      <StudyParticipationFlow
        studyId="study-1"
        participantId="participant-1"
        onComplete={jest.fn()}
        onExit={jest.fn()}
      />
    );

    // Progress bar should have proper ARIA attributes
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveAttribute('aria-valuenow');
    expect(progressBar).toHaveAttribute('aria-valuemin', '0');
    expect(progressBar).toHaveAttribute('aria-valuemax', '100');
  });

  it('should handle high contrast mode', () => {
    // Mock high contrast preference
    const mockAccessibility = {
      highContrastMode: true,
      screenReaderUser: false,
      keyboardNavigationOnly: false
    };

    render(
      <StudyParticipationFlow
        studyId="study-1"
        participantId="participant-1"
        onComplete={jest.fn()}
        onExit={jest.fn()}
      />
    );

    // Check for high contrast styles
    const mainContainer = screen.getByRole('main');
    expect(mainContainer).toHaveClass('high-contrast');
  });
});
```

---

## 🎯 SUCCESS CRITERIA & VALIDATION

### **Participant Experience KPIs**
```typescript
interface ParticipantExperienceKPIs {
  engagement: {
    applicationToCompletionRate: number; // Target: >85%
    averageTimeToComplete: number; // Target: <50% of estimated
    dropoutRate: number; // Target: <15%
    returnParticipantRate: number; // Target: >60%
  };
  
  satisfaction: {
    overallSatisfactionScore: number; // Target: >4.7/5
    difficultyRating: number; // Target: <3/5 (easy)
    clarityRating: number; // Target: >4.5/5
    technicalIssuesReported: number; // Target: <2%
  };
  
  dataQuality: {
    completeResponseRate: number; // Target: >95%
    qualityScoreAverage: number; // Target: >0.8
    attentionScoreAverage: number; // Target: >0.7
    validResponseRate: number; // Target: >98%
  };
  
  accessibility: {
    accessibilityComplianceScore: number; // Target: 100%
    assistiveTechnologySupport: boolean; // Target: Full support
    multiDeviceCompatibility: number; // Target: >95%
    loadTimeAccessible: number; // Target: <5s on slow connections
  };
}
```

### **Performance Benchmarks**
```typescript
const PARTICIPANT_PERFORMANCE_TARGETS = {
  sessionInitialization: {
    target: '<3 seconds',
    measurement: 'Time from URL access to first block display',
    acceptance: '95th percentile under target'
  },
  
  blockTransitions: {
    target: '<1 second',
    measurement: 'Time between block submissions',
    acceptance: '99th percentile under target'
  },
  
  autoSave: {
    target: '<500ms',
    measurement: 'Progress save response time',
    acceptance: 'All saves under target'
  },
  
  dataSubmission: {
    target: '<2 seconds',
    measurement: 'Final submission processing time',
    acceptance: '95th percentile under target'
  }
};
```

---

## 🚀 IMPLEMENTATION ROADMAP

### **Phase 1: Core Participation Flow (Week 1)**
- [ ] Study session management
- [ ] Basic block rendering system
- [ ] Progress tracking and auto-save
- [ ] Session initialization and recovery
- [ ] Essential UI components

### **Phase 2: Enhanced Interactions (Week 2)**
- [ ] All block type implementations
- [ ] Interaction tracking and analytics
- [ ] Accessibility features
- [ ] Mobile responsiveness
- [ ] Error handling and recovery

### **Phase 3: Advanced Features (Week 3)**
- [ ] Real-time data validation
- [ ] Advanced accessibility options
- [ ] Participant feedback system
- [ ] Reward management
- [ ] Performance optimization

### **Phase 4: Quality & Polish (Week 4)**
- [ ] Comprehensive testing suite
- [ ] Performance optimization
- [ ] Security audit
- [ ] Documentation completion
- [ ] Production deployment

---

**🎯 PARTICIPANT EXPERIENCE SYSTEM: Creating delightful, accessible, and efficient research participation that delivers high-quality insights while respecting participant time and effort.**
