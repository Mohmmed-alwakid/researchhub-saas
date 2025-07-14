# 🎯 STUDY CREATION SYSTEM - COMPREHENSIVE REQUIREMENTS
## Zero-Ambiguity Implementation Blueprint for AI Agents

**Created**: July 12, 2025  
**Status**: 🟢 GREENFIELD SPECIFICATION  
**Scope**: Complete study creation wizard and block-based builder  
**Dependencies**: Platform Foundation (01-PLATFORM_FOUNDATION.md)

---

## 📋 EXECUTIVE SUMMARY

The Study Creation System is the **flagship feature** of ResearchHub - a sophisticated wizard that enables researchers to create both usability studies and interview sessions with enterprise-grade tools and consumer-grade simplicity.

### **🎯 Core Value Proposition**
> "Transform complex research design into a guided, visual workflow that produces professional studies in under 10 minutes"

### **🏆 Success Metrics**
- **Time to Study**: <10 minutes from start to publish
- **Completion Rate**: >95% wizard completion rate
- **User Satisfaction**: >9.0/10 study creation experience
- **Study Quality**: >90% of studies meet research standards

---

## 🧩 STUDY TYPES ARCHITECTURE

### **Two Distinct Study Flows**

#### **Usability Studies (Block-Based Builder)**
```typescript
interface UsabilityStudy {
  flowType: 'block-based-builder';
  approach: 'drag-and-drop visual composer';
  dataCollection: ['screen-recording', 'click-tracking', 'time-on-task', 'user-feedback'];
  duration: '15-60 minutes';
  participants: 'multiple asynchronous participants';
  pricing: 'pay-per-participant';
}
```

#### **Interview Sessions (Configuration-Based)**
```typescript
interface InterviewSession {
  flowType: 'session-configuration';
  approach: 'form-based session setup';
  dataCollection: ['audio-recording', 'video-recording', 'notes', 'transcripts'];
  duration: '15-120 minutes';
  participants: 'one-on-one scheduled sessions';
  pricing: 'pay-per-session';
}
```

---

## 🗄️ DATABASE SCHEMA

### **Enhanced Study Tables**
```sql
-- Study types (simplified to two core types)
CREATE TYPE study_type AS ENUM ('usability', 'interview');

-- Study creation method
CREATE TYPE creation_method AS ENUM ('wizard', 'template', 'duplicate');

-- Enhanced studies table
CREATE TABLE studies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Basic information
  title VARCHAR(255) NOT NULL,
  description TEXT,
  study_type study_type NOT NULL,
  creation_method creation_method DEFAULT 'wizard',
  
  -- Configuration (type-specific)
  usability_config JSONB, -- For usability studies
  interview_config JSONB, -- For interview sessions
  
  -- Common settings
  max_participants INTEGER DEFAULT 100,
  estimated_duration INTEGER, -- minutes
  reward_amount DECIMAL(10,2) DEFAULT 0,
  
  -- Status and metadata
  status study_status NOT NULL DEFAULT 'draft',
  settings JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  
  -- Auto-save functionality
  auto_save_data JSONB DEFAULT '{}',
  last_auto_save TIMESTAMP WITH TIME ZONE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  published_at TIMESTAMP WITH TIME ZONE,
  
  -- Ownership
  created_by UUID NOT NULL REFERENCES users(id),
  updated_by UUID REFERENCES users(id)
);

-- Study blocks (for usability studies)
CREATE TYPE block_type AS ENUM (
  'welcome_screen',
  'task_instruction', 
  'website_interaction',
  'rating_scale',
  'open_feedback',
  'multiple_choice',
  'thank_you_screen'
);

CREATE TABLE study_blocks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  study_id UUID NOT NULL REFERENCES studies(id) ON DELETE CASCADE,
  block_type block_type NOT NULL,
  order_index INTEGER NOT NULL,
  title VARCHAR(255) NOT NULL,
  config JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Interview sessions (for interview studies)
CREATE TYPE session_format AS ENUM ('audio_only', 'video', 'screen_share');
CREATE TYPE session_status AS ENUM ('scheduled', 'active', 'completed', 'cancelled');

CREATE TABLE interview_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  study_id UUID NOT NULL REFERENCES studies(id) ON DELETE CASCADE,
  participant_id UUID REFERENCES users(id),
  
  -- Session details
  session_format session_format NOT NULL,
  scheduled_start TIMESTAMP WITH TIME ZONE NOT NULL,
  scheduled_end TIMESTAMP WITH TIME ZONE NOT NULL,
  actual_start TIMESTAMP WITH TIME ZONE,
  actual_end TIMESTAMP WITH TIME ZONE,
  
  -- Configuration
  meeting_url TEXT,
  recording_enabled BOOLEAN DEFAULT true,
  notes TEXT,
  
  -- Status
  status session_status DEFAULT 'scheduled',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_studies_type ON studies(study_type);
CREATE INDEX idx_studies_organization ON studies(organization_id);
CREATE INDEX idx_study_blocks_study ON study_blocks(study_id, order_index);
CREATE INDEX idx_interview_sessions_study ON interview_sessions(study_id);
CREATE INDEX idx_interview_sessions_participant ON interview_sessions(participant_id);
```

---

## 🎨 UI COMPONENTS ARCHITECTURE

### **StudyCreationWizard (Main Container)**
```typescript
// src/components/studies/StudyCreationWizard.tsx
interface StudyCreationWizardProps {
  onComplete: (study: Study) => void;
  onCancel: () => void;
  mode?: 'create' | 'edit' | 'duplicate';
  existingStudy?: Study;
}

interface WizardState {
  currentStep: number;
  studyType: 'usability' | 'interview' | null;
  studyData: {
    title: string;
    description: string;
    estimatedDuration: number;
    maxParticipants: number;
    rewardAmount: number;
    // Type-specific configs
    usabilityConfig?: UsabilityConfig;
    interviewConfig?: InterviewConfig;
  };
  isValid: boolean;
  errors: Record<string, string>;
  autoSaveStatus: 'idle' | 'saving' | 'saved' | 'error';
}

const WIZARD_STEPS = [
  {
    id: 1,
    title: 'Study Type',
    component: StudyTypeSelection,
    validation: (state) => state.studyType !== null
  },
  {
    id: 2,
    title: 'Study Builder',
    component: StudyBuilder,
    validation: (state) => state.studyData.title.length > 0
  },
  {
    id: 3,
    title: 'Preview & Launch',
    component: StudyPreview,
    validation: () => true
  }
];

export const StudyCreationWizard: React.FC<StudyCreationWizardProps> = ({
  onComplete,
  onCancel,
  mode = 'create',
  existingStudy
}) => {
  const [state, setState] = useState<WizardState>(initialState);
  
  // Auto-save functionality
  useEffect(() => {
    const autoSave = debounce(() => {
      if (state.studyData.title) {
        setState(prev => ({ ...prev, autoSaveStatus: 'saving' }));
        // Save to localStorage and/or server
        saveStudyDraft(state.studyData);
        setState(prev => ({ ...prev, autoSaveStatus: 'saved' }));
      }
    }, 2000);
    
    autoSave();
  }, [state.studyData]);

  const handleStepChange = (newStep: number) => {
    const currentStepData = WIZARD_STEPS[state.currentStep - 1];
    
    // Validate before moving forward
    if (newStep > state.currentStep && !currentStepData.validation(state)) {
      // Show validation errors
      return;
    }
    
    setState(prev => ({ ...prev, currentStep: newStep }));
  };

  const CurrentStepComponent = WIZARD_STEPS[state.currentStep - 1].component;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[95vh] overflow-hidden">
        
        {/* Header with progress */}
        <div className="border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              {mode === 'create' ? 'Create New Study' : 'Edit Study'}
            </h2>
            
            {/* Auto-save indicator */}
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              {state.autoSaveStatus === 'saving' && (
                <>
                  <Spinner className="w-4 h-4" />
                  <span>Saving...</span>
                </>
              )}
              {state.autoSaveStatus === 'saved' && (
                <>
                  <Check className="w-4 h-4 text-green-500" />
                  <span>Saved</span>
                </>
              )}
            </div>
            
            <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
              <X className="w-6 h-6" />
            </button>
          </div>
          
          {/* Progress bar */}
          <div className="mt-4">
            <div className="flex items-center">
              {WIZARD_STEPS.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div
                    className={`
                      w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                      ${index + 1 < state.currentStep
                        ? 'bg-blue-600 text-white'
                        : index + 1 === state.currentStep
                        ? 'bg-blue-100 text-blue-600 border-2 border-blue-600'
                        : 'bg-gray-100 text-gray-400'
                      }
                    `}
                  >
                    {index + 1 < state.currentStep ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      step.id
                    )}
                  </div>
                  <span className="ml-2 text-sm font-medium text-gray-900">
                    {step.title}
                  </span>
                  {index < WIZARD_STEPS.length - 1 && (
                    <div className="w-12 h-px bg-gray-200 mx-4" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 overflow-y-auto">
          <CurrentStepComponent
            state={state}
            onUpdate={setState}
            onNext={() => handleStepChange(state.currentStep + 1)}
            onPrevious={() => handleStepChange(state.currentStep - 1)}
          />
        </div>

        {/* Footer navigation */}
        <div className="border-t border-gray-200 px-6 py-4 flex justify-between">
          <button
            onClick={() => handleStepChange(state.currentStep - 1)}
            disabled={state.currentStep === 1}
            className="px-4 py-2 text-gray-600 disabled:text-gray-400"
          >
            Previous
          </button>
          
          <div className="flex space-x-3">
            <button
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            
            {state.currentStep < WIZARD_STEPS.length ? (
              <button
                onClick={() => handleStepChange(state.currentStep + 1)}
                disabled={!WIZARD_STEPS[state.currentStep - 1].validation(state)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300"
              >
                Continue
              </button>
            ) : (
              <button
                onClick={() => onComplete(state.studyData)}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Publish Study
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
```

---

## 🔧 API IMPLEMENTATION

### **Study Creation Endpoints**
```typescript
// api/studies/create.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { createServerSupabaseClient } from '@/utils/supabase-server';
import { studySchema } from '@/schemas/study';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const supabase = createServerSupabaseClient({ req, res });
    
    // Verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Validate input
    const validation = studySchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: validation.error.errors
      });
    }

    const studyData = validation.data;

    // Create study
    const { data: study, error: studyError } = await supabase
      .from('studies')
      .insert({
        ...studyData,
        created_by: user.id,
        organization_id: studyData.organization_id
      })
      .select()
      .single();

    if (studyError) {
      throw studyError;
    }

    // Create blocks if usability study
    if (studyData.study_type === 'usability' && studyData.blocks?.length > 0) {
      const blocksWithStudyId = studyData.blocks.map((block, index) => ({
        ...block,
        study_id: study.id,
        order_index: index
      }));

      const { error: blocksError } = await supabase
        .from('study_blocks')
        .insert(blocksWithStudyId);

      if (blocksError) {
        throw blocksError;
      }
    }

    // Create interview sessions if interview study
    if (studyData.study_type === 'interview' && studyData.sessions?.length > 0) {
      const sessionsWithStudyId = studyData.sessions.map(session => ({
        ...session,
        study_id: study.id
      }));

      const { error: sessionsError } = await supabase
        .from('interview_sessions')
        .insert(sessionsWithStudyId);

      if (sessionsError) {
        throw sessionsError;
      }
    }

    // Log activity
    await supabase.from('activity_logs').insert({
      activity_type: 'study_created',
      user_id: user.id,
      entity_type: 'study',
      entity_id: study.id,
      metadata: { 
        study_type: studyData.study_type,
        title: studyData.title
      }
    });

    return res.status(201).json({ 
      success: true, 
      data: study 
    });

  } catch (error) {
    console.error('Study creation failed:', error);
    return res.status(500).json({ 
      error: 'Failed to create study' 
    });
  }
}

// api/studies/[id]/auto-save.ts
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id } = req.query;
    const supabase = createServerSupabaseClient({ req, res });
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Update auto-save data
    const { error } = await supabase
      .from('studies')
      .update({
        auto_save_data: req.body,
        last_auto_save: new Date().toISOString()
      })
      .eq('id', id)
      .eq('created_by', user.id);

    if (error) {
      throw error;
    }

    return res.status(200).json({ success: true });

  } catch (error) {
    console.error('Auto-save failed:', error);
    return res.status(500).json({ error: 'Auto-save failed' });
  }
}
```

---

## 🧪 TESTING SPECIFICATIONS

### **Component Testing**
```typescript
// tests/components/StudyCreationWizard.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { StudyCreationWizard } from '@/components/studies/StudyCreationWizard';

describe('StudyCreationWizard', () => {
  const mockOnComplete = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render step 1 by default', () => {
    render(
      <StudyCreationWizard onComplete={mockOnComplete} onCancel={mockOnCancel} />
    );
    
    expect(screen.getByText('Study Type')).toBeInTheDocument();
    expect(screen.getByText('Choose how to start your study')).toBeInTheDocument();
  });

  it('should advance to step 2 when study type is selected', async () => {
    render(
      <StudyCreationWizard onComplete={mockOnComplete} onCancel={mockOnCancel} />
    );
    
    // Select usability study
    fireEvent.click(screen.getByTestId('usability-study-option'));
    fireEvent.click(screen.getByText('Continue'));
    
    await waitFor(() => {
      expect(screen.getByText('Study Builder')).toBeInTheDocument();
    });
  });

  it('should prevent advancement without selecting study type', () => {
    render(
      <StudyCreationWizard onComplete={mockOnComplete} onCancel={mockOnCancel} />
    );
    
    const continueButton = screen.getByText('Continue');
    expect(continueButton).toBeDisabled();
  });

  it('should auto-save study data', async () => {
    const autoSaveSpy = jest.spyOn(require('@/utils/auto-save'), 'saveStudyDraft');
    
    render(
      <StudyCreationWizard onComplete={mockOnComplete} onCancel={mockOnCancel} />
    );
    
    // Navigate to study builder
    fireEvent.click(screen.getByTestId('usability-study-option'));
    fireEvent.click(screen.getByText('Continue'));
    
    // Fill in study title
    const titleInput = screen.getByLabelText('Study Title');
    fireEvent.change(titleInput, { target: { value: 'Test Study' } });
    
    // Wait for auto-save
    await waitFor(() => {
      expect(autoSaveSpy).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'Test Study' })
      );
    }, { timeout: 3000 });
  });
});
```

### **API Testing**
```typescript
// tests/api/studies/create.test.ts
import { createMocks } from 'node-mocks-http';
import handler from '@/pages/api/studies/create';
import { createTestUser, createTestOrganization } from '@/tests/helpers';

describe('/api/studies/create', () => {
  let testUser: any;
  let testOrg: any;

  beforeEach(async () => {
    testUser = await createTestUser();
    testOrg = await createTestOrganization(testUser.id);
  });

  it('should create a usability study successfully', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      headers: {
        authorization: `Bearer ${testUser.access_token}`
      },
      body: {
        title: 'Website Navigation Test',
        description: 'Testing main navigation flow',
        study_type: 'usability',
        organization_id: testOrg.id,
        estimated_duration: 15,
        max_participants: 50,
        blocks: [
          {
            block_type: 'welcome_screen',
            title: 'Welcome',
            config: { message: 'Welcome to our test' }
          },
          {
            block_type: 'task_instruction',
            title: 'Find Product',
            config: { task: 'Navigate to products page' }
          }
        ]
      }
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(201);
    const data = JSON.parse(res._getData());
    expect(data.success).toBe(true);
    expect(data.data.title).toBe('Website Navigation Test');
    expect(data.data.study_type).toBe('usability');
  });

  it('should validate required fields', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      headers: {
        authorization: `Bearer ${testUser.access_token}`
      },
      body: {
        // Missing required fields
        study_type: 'usability'
      }
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    const data = JSON.parse(res._getData());
    expect(data.error).toBe('Validation failed');
    expect(data.details).toBeDefined();
  });

  it('should require authentication', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        title: 'Test Study',
        study_type: 'usability'
      }
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(401);
    const data = JSON.parse(res._getData());
    expect(data.error).toBe('Authentication required');
  });
});
```

---

## 🎯 SUCCESS CRITERIA & VALIDATION

### **Acceptance Criteria**
```typescript
interface StudyCreationAcceptanceCriteria {
  functionality: {
    wizardFlow: {
      // User can complete full wizard flow
      canSelectStudyType: boolean;
      canConfigureStudyDetails: boolean;
      canPreviewStudy: boolean;
      canPublishStudy: boolean;
    };
    
    usabilityStudies: {
      canCreateBlocks: boolean;
      canReorderBlocks: boolean;
      canConfigureBlocks: boolean;
      canPreviewParticipantFlow: boolean;
    };
    
    interviewSessions: {
      canScheduleSessions: boolean;
      canConfigureRecording: boolean;
      canCreateInterviewGuide: boolean;
      canManageParticipants: boolean;
    };
    
    dataManagement: {
      autoSaveWorks: boolean;
      draftRecoveryWorks: boolean;
      validationPreventsErrors: boolean;
      errorHandlingIsGraceful: boolean;
    };
  };
  
  performance: {
    wizardLoadsUnder2Seconds: boolean;
    autoSaveUnder1Second: boolean;
    blockDragDropResponsive: boolean;
    previewGeneratesUnder3Seconds: boolean;
  };
  
  usability: {
    intuitive10MinuteCreation: boolean;
    clearValidationMessages: boolean;
    helpfulErrorMessages: boolean;
    responsiveOnAllDevices: boolean;
  };
  
  quality: {
    zeroDataLoss: boolean;
    gracefulErrorRecovery: boolean;
    accessibilityCompliant: boolean;
    crossBrowserCompatible: boolean;
  };
}
```

### **Performance Benchmarks**
```typescript
const PERFORMANCE_BENCHMARKS = {
  wizardLoad: {
    target: '<2 seconds',
    measurement: 'Time from click to wizard open',
    acceptance: '95th percentile under target'
  },
  
  autoSave: {
    target: '<1 second',
    measurement: 'Time from change to save confirmation',
    acceptance: 'All saves complete within target'
  },
  
  blockOperations: {
    target: '<500ms',
    measurement: 'Drag, drop, configure operations',
    acceptance: 'Smooth 60fps interactions'
  },
  
  studyPreview: {
    target: '<3 seconds',
    measurement: 'Generate participant preview',
    acceptance: '95th percentile under target'
  },
  
  studyPublication: {
    target: '<5 seconds',
    measurement: 'Publish study to live state',
    acceptance: 'All publications complete within target'
  }
};
```

---

## 🚀 IMPLEMENTATION ROADMAP

### **Phase 1: Core Wizard (Week 1-2)**
- [ ] StudyCreationWizard container component
- [ ] StudyTypeSelection step
- [ ] Basic StudyBuilder for both types
- [ ] StudyPreview step
- [ ] Auto-save functionality
- [ ] Form validation

### **Phase 2: Usability Builder (Week 3-4)**
- [ ] Block library with drag-and-drop
- [ ] Block configuration panels
- [ ] Block reordering and deletion
- [ ] Participant flow preview
- [ ] Recording settings configuration

### **Phase 3: Interview Builder (Week 5-6)**
- [ ] Session scheduling interface
- [ ] Interview guide builder
- [ ] Recording configuration
- [ ] Participant invitation system
- [ ] Session management tools

### **Phase 4: Advanced Features (Week 7-8)**
- [ ] Template system integration
- [ ] Advanced validation rules
- [ ] Collaboration features
- [ ] Analytics integration
- [ ] Mobile optimization

### **Success Validation Checklist**
- [ ] All acceptance criteria met
- [ ] Performance benchmarks achieved
- [ ] Accessibility audit passed
- [ ] Cross-browser testing completed
- [ ] Security review approved
- [ ] User testing validates 10-minute creation goal

---

**🎯 STUDY CREATION SYSTEM: The flagship feature that transforms research design into an intuitive, powerful, and delightful experience for researchers worldwide.**
