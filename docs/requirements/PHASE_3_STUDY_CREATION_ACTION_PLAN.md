# 🎯 PHASE 3: STUDY CREATION SYSTEM - DETAILED ACTION PLAN

**Duration**: Week 3-4  
**Requirements Source**: `docs/requirements/04-STUDY_CREATION_SYSTEM.md`  
**Status**: 🟡 READY FOR APPROVAL  
**Priority**: CRITICAL - Flagship Feature Implementation

---

## 📋 EXECUTIVE SUMMARY

This phase implements the flagship Study Creation System according to the comprehensive requirements. It transforms the existing StudyCreationWizard into a requirements-compliant, enterprise-grade study builder with support for both usability studies and interview sessions.

### **🎯 Phase Goals**

- Refactor StudyCreationWizard to match requirements exactly
- Implement proper study type handling (usability vs interview)
- Create advanced block system with all 13 block types
- Add collaboration and template features
- Ensure mobile responsiveness and accessibility

---

## 🧩 CURRENT STATE ANALYSIS

### **Existing Implementation Review**

```typescript
// CURRENT STUDY CREATION WIZARD ANALYSIS
// File: src/client/components/study-builder/StudyCreationWizard.tsx

STRENGTHS:
✅ Multi-step wizard structure exists
✅ Auto-save functionality implemented
✅ Basic validation and error handling
✅ Study type differentiation (usability vs interview)
✅ Block system foundation in place

GAPS REQUIRING REFACTORING:
❌ Missing requirements-compliant database schema integration
❌ Incomplete block system (only partial implementation)
❌ No collaboration features
❌ Missing template system integration
❌ No advanced study configuration options
❌ Limited accessibility compliance
❌ Missing mobile responsiveness
❌ No proper error recovery mechanisms
```

### **Required Enhancements**

```typescript
// TARGET ARCHITECTURE REQUIREMENTS
interface RequiredEnhancements {
  database_integration: 'Full schema compliance with study tables';
  block_system: 'All 13 block types with advanced configuration';
  collaboration: 'Real-time team collaboration features';
  templates: 'Template creation and management system';
  accessibility: 'WCAG 2.1 AA compliance';
  mobile: 'Full mobile responsiveness';
  performance: 'Optimized for large studies';
  analytics: 'Built-in study analytics';
}
```

---

## 🗄️ DATABASE SCHEMA ENHANCEMENT

### **Study Tables Implementation**

```sql
-- TASK: Enhance study tables to match requirements
-- PRIORITY: CRITICAL
-- ESTIMATED TIME: 6 hours

-- Enhanced study types
CREATE TYPE study_type AS ENUM ('usability', 'interview');
CREATE TYPE study_status AS ENUM ('draft', 'published', 'active', 'paused', 'completed', 'archived');
CREATE TYPE creation_method AS ENUM ('wizard', 'template', 'duplicate');

-- Enhanced studies table
CREATE TABLE IF NOT EXISTS studies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Basic information
  title VARCHAR(255) NOT NULL,
  description TEXT,
  study_type study_type NOT NULL,
  creation_method creation_method DEFAULT 'wizard',
  
  -- Configuration (type-specific)
  usability_config JSONB DEFAULT '{}', -- Screen recording, click tracking, etc.
  interview_config JSONB DEFAULT '{}', -- Audio/video settings, duration, etc.
  
  -- Common settings
  max_participants INTEGER DEFAULT 100,
  estimated_duration INTEGER, -- minutes
  reward_amount DECIMAL(10,2) DEFAULT 0,
  target_audience JSONB DEFAULT '{}',
  
  -- Advanced features
  collaboration_settings JSONB DEFAULT '{}',
  analytics_config JSONB DEFAULT '{}',
  
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

-- Study blocks table
CREATE TABLE IF NOT EXISTS study_blocks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  study_id UUID NOT NULL REFERENCES studies(id) ON DELETE CASCADE,
  
  -- Block identification
  block_type VARCHAR(50) NOT NULL, -- 'welcome', 'open_question', etc.
  order_index INTEGER NOT NULL,
  
  -- Block configuration
  title VARCHAR(255),
  description TEXT,
  settings JSONB DEFAULT '{}',
  validation_rules JSONB DEFAULT '{}',
  
  -- Conditional logic
  conditions JSONB DEFAULT '{}',
  branching_logic JSONB DEFAULT '{}',
  
  -- Analytics
  analytics_config JSONB DEFAULT '{}',
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(study_id, order_index)
);

-- Study collaboration table
CREATE TABLE IF NOT EXISTS study_collaborators (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  study_id UUID NOT NULL REFERENCES studies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL DEFAULT 'viewer', -- 'owner', 'editor', 'viewer'
  permissions JSONB DEFAULT '{}',
  invited_by UUID REFERENCES users(id),
  invited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  joined_at TIMESTAMP WITH TIME ZONE,
  
  UNIQUE(study_id, user_id)
);
```

---

## 🎯 STUDY CREATION WIZARD REFACTORING

### **Enhanced Wizard Architecture**

```typescript
// TASK: Refactor StudyCreationWizard with requirements compliance
// PRIORITY: CRITICAL
// ESTIMATED TIME: 12 hours

// File: src/client/components/study-builder/StudyCreationWizard.tsx
interface EnhancedStudyFormData {
  // Basic Information
  title: string;
  description: string;
  study_type: 'usability' | 'interview';
  creation_method: 'wizard' | 'template' | 'duplicate';
  
  // Type-specific configuration
  usability_config?: {
    screen_recording: boolean;
    click_tracking: boolean;
    scroll_tracking: boolean;
    device_preferences: string[];
    browser_preferences: string[];
  };
  
  interview_config?: {
    audio_recording: boolean;
    video_recording: boolean;
    duration_minutes: number;
    preparation_time: number;
    follow_up_questions: boolean;
  };
  
  // Participant settings
  max_participants: number;
  target_audience: {
    demographics: any;
    screening_questions: any[];
    requirements: string[];
  };
  
  // Study blocks
  blocks: StudyBlock[];
  
  // Advanced settings
  collaboration_settings: {
    allow_comments: boolean;
    require_approval: boolean;
    team_access: string[];
  };
  
  // Analytics configuration
  analytics_config: {
    track_completion_time: boolean;
    track_drop_off_points: boolean;
    custom_events: string[];
  };
}

// Enhanced wizard steps with proper flow
const ENHANCED_USABILITY_STEPS = [
  'study_type',
  'basic_info', 
  'usability_config',
  'target_audience',
  'blocks_builder',
  'collaboration',
  'analytics',
  'review',
  'launch'
] as const;

const ENHANCED_INTERVIEW_STEPS = [
  'study_type',
  'basic_info',
  'interview_config', 
  'target_audience',
  'preparation',
  'collaboration',
  'analytics',
  'review',
  'launch'
] as const;
```

### **Step Component Enhancements**

```typescript
// TASK: Enhance individual step components
// PRIORITY: HIGH
// ESTIMATED TIME: 16 hours

// File: src/client/components/study-builder/steps/StudyTypeStep.tsx
export const StudyTypeStep: React.FC<StepProps> = ({ formData, onUpdate, onValidation }) => {
  return (
    <div className="space-y-6">
      <StepHeader 
        title="Choose Your Study Type"
        description="Select the type of research study you want to create"
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StudyTypeCard
          type="usability"
          title="Usability Study"
          description="Test user interactions with your product through screen recording and behavioral analytics"
          features={[
            'Screen recording',
            'Click and scroll tracking', 
            'Time-on-task measurement',
            'Multiple participants',
            'Automated analysis'
          ]}
          pricing="Pay per participant"
          duration="15-60 minutes"
          selected={formData.study_type === 'usability'}
          onSelect={() => onUpdate({ study_type: 'usability' })}
        />
        
        <StudyTypeCard
          type="interview"
          title="Interview Session"
          description="Conduct one-on-one interviews with audio/video recording and real-time notes"
          features={[
            'Audio/video recording',
            'Real-time transcription',
            'Collaborative notes',
            'Scheduled sessions',
            'Interview guides'
          ]}
          pricing="Pay per session"
          duration="15-120 minutes"
          selected={formData.study_type === 'interview'}
          onSelect={() => onUpdate({ study_type: 'interview' })}
        />
      </div>
    </div>
  );
};

// File: src/client/components/study-builder/steps/BlocksBuilderStep.tsx
export const BlocksBuilderStep: React.FC<StepProps> = ({ formData, onUpdate }) => {
  const [selectedBlock, setSelectedBlock] = useState<string | null>(null);
  const [draggedBlock, setDraggedBlock] = useState<StudyBlock | null>(null);

  return (
    <div className="flex h-full">
      {/* Block Library Sidebar */}
      <div className="w-1/3 border-r border-gray-200 p-6">
        <BlockLibrary
          onBlockSelect={handleBlockAdd}
          availableBlocks={getAllBlockTypes()}
          studyType={formData.study_type}
        />
      </div>
      
      {/* Study Builder Canvas */}
      <div className="flex-1 p-6">
        <StudyBuilderCanvas
          blocks={formData.blocks}
          onBlocksChange={handleBlocksChange}
          onBlockSelect={setSelectedBlock}
          selectedBlock={selectedBlock}
          draggedBlock={draggedBlock}
          onDragStart={setDraggedBlock}
          onDragEnd={() => setDraggedBlock(null)}
        />
      </div>
      
      {/* Block Configuration Panel */}
      {selectedBlock && (
        <div className="w-1/3 border-l border-gray-200 p-6">
          <BlockConfigurationPanel
            block={getBlockById(selectedBlock)}
            onUpdate={handleBlockUpdate}
            onDelete={handleBlockDelete}
          />
        </div>
      )}
    </div>
  );
};
```

---

## 🧩 COMPLETE BLOCK SYSTEM IMPLEMENTATION

### **All 13 Block Types**

```typescript
// TASK: Implement all 13 block types from requirements
// PRIORITY: CRITICAL
// ESTIMATED TIME: 20 hours

// File: src/client/components/study-builder/blocks/index.ts
export const BLOCK_TYPES = {
  welcome: {
    name: 'Welcome Screen',
    description: 'Introduce participants to your study',
    category: 'Introduction',
    icon: 'welcome',
    defaultSettings: {
      title: 'Welcome to our study',
      message: 'Thank you for participating in our research.',
      show_progress: true,
      estimated_time: true
    }
  },
  
  open_question: {
    name: 'Open Question',
    description: 'Collect qualitative feedback and detailed responses',
    category: 'Questions',
    icon: 'question',
    defaultSettings: {
      question: '',
      placeholder: 'Please share your thoughts...',
      required: true,
      min_words: 10,
      max_words: 500,
      ai_follow_up: false
    }
  },
  
  opinion_scale: {
    name: 'Opinion Scale',
    description: 'Gather quantitative ratings and opinions',
    category: 'Ratings',
    icon: 'scale',
    defaultSettings: {
      question: '',
      scale_type: 'numeric', // 'numeric', 'stars', 'emotions'
      min_value: 1,
      max_value: 5,
      labels: { low: 'Strongly Disagree', high: 'Strongly Agree' },
      required: true
    }
  },
  
  simple_input: {
    name: 'Simple Input',
    description: 'Collect structured data like names, emails, dates',
    category: 'Data Collection',
    icon: 'input',
    defaultSettings: {
      label: '',
      input_type: 'text', // 'text', 'email', 'number', 'date', 'tel'
      placeholder: '',
      required: true,
      validation: {}
    }
  },
  
  multiple_choice: {
    name: 'Multiple Choice',
    description: 'Present options for single or multiple selection',
    category: 'Questions',
    icon: 'choices',
    defaultSettings: {
      question: '',
      options: ['Option 1', 'Option 2', 'Option 3'],
      allow_multiple: false,
      randomize_options: false,
      required: true,
      other_option: false
    }
  },
  
  context_screen: {
    name: 'Context Screen',
    description: 'Provide instructions and context between tasks',
    category: 'Instructions',
    icon: 'info',
    defaultSettings: {
      title: '',
      content: '',
      show_continue_button: true,
      auto_advance: false,
      delay_seconds: 0
    }
  },
  
  yes_no: {
    name: 'Yes/No Question',
    description: 'Simple binary choice questions',
    category: 'Questions',
    icon: 'toggle',
    defaultSettings: {
      question: '',
      yes_label: 'Yes',
      no_label: 'No',
      show_icons: true,
      required: true
    }
  },
  
  five_second_test: {
    name: '5-Second Test',
    description: 'Test first impressions and memory recall',
    category: 'Testing',
    icon: 'timer',
    defaultSettings: {
      instruction: 'Look at this design for 5 seconds',
      image_url: '',
      display_time: 5,
      questions: [
        { question: 'What do you remember most about what you saw?', type: 'open' },
        { question: 'What was the main purpose of this page?', type: 'open' }
      ]
    }
  },
  
  card_sort: {
    name: 'Card Sort',
    description: 'Test information architecture and categorization',
    category: 'Testing',
    icon: 'cards',
    defaultSettings: {
      instruction: 'Organize these items into groups that make sense to you',
      cards: [],
      sort_type: 'open', // 'open', 'closed', 'hybrid'
      categories: [],
      max_categories: 10
    }
  },
  
  tree_test: {
    name: 'Tree Test',
    description: 'Evaluate navigation and findability',
    category: 'Testing',
    icon: 'tree',
    defaultSettings: {
      instruction: 'Find where you would look for...',
      tree_structure: {},
      tasks: [],
      allow_backtrack: true,
      show_full_path: false
    }
  },
  
  thank_you: {
    name: 'Thank You',
    description: 'Thank participants and provide next steps',
    category: 'Completion',
    icon: 'thanks',
    defaultSettings: {
      title: 'Thank you!',
      message: 'Your responses have been recorded. Thank you for participating!',
      show_reward_info: true,
      redirect_url: '',
      contact_info: ''
    }
  },
  
  image_upload: {
    name: 'Image Upload',
    description: 'Collect visual content from participants',
    category: 'Data Collection',
    icon: 'image',
    defaultSettings: {
      instruction: 'Please upload an image',
      accepted_formats: ['jpg', 'jpeg', 'png', 'gif'],
      max_file_size: 5, // MB
      max_files: 1,
      required: true
    }
  },
  
  file_upload: {
    name: 'File Upload',
    description: 'Collect documents and files from participants',
    category: 'Data Collection',
    icon: 'file',
    defaultSettings: {
      instruction: 'Please upload a file',
      accepted_formats: ['pdf', 'doc', 'docx', 'txt'],
      max_file_size: 10, // MB
      max_files: 3,
      required: true
    }
  }
} as const;
```

### **Block Component Implementation**

```typescript
// TASK: Create individual block components
// PRIORITY: HIGH  
// ESTIMATED TIME: 24 hours

// File: src/client/components/study-builder/blocks/WelcomeBlock.tsx
export const WelcomeBlock: React.FC<BlockProps> = ({ block, isEditing, onUpdate }) => {
  if (isEditing) {
    return (
      <WelcomeBlockEditor
        settings={block.settings}
        onSettingsUpdate={(settings) => onUpdate({ ...block, settings })}
      />
    );
  }

  return (
    <div className="bg-white rounded-lg border p-6">
      <h2 className="text-2xl font-bold mb-4">{block.settings.title}</h2>
      <p className="text-gray-600 mb-6">{block.settings.message}</p>
      
      {block.settings.show_progress && (
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-500 mb-2">
            <span>Progress</span>
            <span>Step 1 of {totalSteps}</span>
          </div>
          <ProgressBar current={1} total={totalSteps} />
        </div>
      )}
      
      {block.settings.estimated_time && (
        <p className="text-sm text-gray-500 mb-6">
          Estimated time: {estimatedTime} minutes
        </p>
      )}
      
      <Button onClick={onContinue} size="lg" className="w-full">
        Get Started
      </Button>
    </div>
  );
};

// Similar implementations for all other block types...
```

---

## 🤝 COLLABORATION SYSTEM INTEGRATION

### **Real-time Collaboration Features**

```typescript
// TASK: Implement collaboration features
// PRIORITY: MEDIUM
// ESTIMATED TIME: 12 hours

// File: src/client/components/study-builder/collaboration/CollaborationPanel.tsx
export const CollaborationPanel: React.FC<{ studyId: string }> = ({ studyId }) => {
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  
  return (
    <div className="space-y-6">
      <CollaboratorsList
        collaborators={collaborators}
        onInvite={handleInviteCollaborator}
        onRemove={handleRemoveCollaborator}
      />
      
      <CommentsSection
        comments={comments}
        onAddComment={handleAddComment}
        onResolveComment={handleResolveComment}
      />
      
      <ApprovalWorkflow
        studyId={studyId}
        requiresApproval={collaborationSettings.require_approval}
        onSubmitForApproval={handleSubmitForApproval}
      />
    </div>
  );
};

// WebSocket integration for real-time updates
export const useCollaboration = (studyId: string) => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  
  useEffect(() => {
    const ws = new WebSocket(`${WEBSOCKET_URL}/collaboration/${studyId}`);
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      handleCollaborationUpdate(data);
    };
    
    setSocket(ws);
    return () => ws.close();
  }, [studyId]);
  
  return {
    addComment: (comment: string, blockId?: string) => {
      socket?.send(JSON.stringify({
        type: 'ADD_COMMENT',
        comment,
        blockId,
        timestamp: Date.now()
      }));
    },
    
    updateBlock: (blockId: string, changes: any) => {
      socket?.send(JSON.stringify({
        type: 'UPDATE_BLOCK',
        blockId,
        changes,
        timestamp: Date.now()
      }));
    }
  };
};
```

---

## 📱 MOBILE RESPONSIVENESS & ACCESSIBILITY

### **Mobile-First Design Implementation**

```typescript
// TASK: Implement mobile responsiveness
// PRIORITY: HIGH
// ESTIMATED TIME: 8 hours

// File: src/client/components/study-builder/mobile/MobileStudyBuilder.tsx
export const MobileStudyBuilder: React.FC = () => {
  const [activePanel, setActivePanel] = useState<'library' | 'canvas' | 'config'>('canvas');
  
  return (
    <div className="h-screen flex flex-col md:hidden">
      {/* Mobile Header */}
      <MobileHeader onSave={handleSave} onPreview={handlePreview} />
      
      {/* Tab Navigation */}
      <div className="flex border-b">
        <TabButton 
          active={activePanel === 'library'} 
          onClick={() => setActivePanel('library')}
        >
          Blocks
        </TabButton>
        <TabButton 
          active={activePanel === 'canvas'} 
          onClick={() => setActivePanel('canvas')}
        >
          Builder
        </TabButton>
        <TabButton 
          active={activePanel === 'config'} 
          onClick={() => setActivePanel('config')}
        >
          Settings
        </TabButton>
      </div>
      
      {/* Panel Content */}
      <div className="flex-1 overflow-hidden">
        {activePanel === 'library' && <MobileBlockLibrary />}
        {activePanel === 'canvas' && <MobileBuilderCanvas />}
        {activePanel === 'config' && <MobileConfigPanel />}
      </div>
    </div>
  );
};
```

### **Accessibility Compliance**

```typescript
// TASK: Implement WCAG 2.1 AA compliance
// PRIORITY: HIGH
// ESTIMATED TIME: 6 hours

// File: src/client/components/study-builder/accessibility/AccessibilityProvider.tsx
export const AccessibilityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [announcements, setAnnouncements] = useState<string[]>([]);
  
  const announce = useCallback((message: string) => {
    setAnnouncements(prev => [...prev, message]);
    // Clear after announcement
    setTimeout(() => {
      setAnnouncements(prev => prev.slice(1));
    }, 1000);
  }, []);
  
  return (
    <AccessibilityContext.Provider value={{ announce }}>
      {children}
      
      {/* Screen reader announcements */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {announcements.map((message, index) => (
          <div key={index}>{message}</div>
        ))}
      </div>
    </AccessibilityContext.Provider>
  );
};

// Keyboard navigation support
export const useKeyboardNavigation = () => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Implement keyboard shortcuts
      if (event.ctrlKey || event.metaKey) {
        switch (event.key) {
          case 's':
            event.preventDefault();
            handleSave();
            break;
          case 'z':
            event.preventDefault();
            if (event.shiftKey) {
              handleRedo();
            } else {
              handleUndo();
            }
            break;
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
};
```

---

## 📊 IMPLEMENTATION CHECKLIST

### **Week 3 Tasks**

#### **Database and API Updates (Days 1-2)**

```markdown
DAY 1:
☐ Implement enhanced study tables schema
☐ Create study_blocks table with proper relationships
☐ Add study_collaborators table
☐ Create database migration scripts
☐ Test new schema with sample data

DAY 2:  
☐ Update API endpoints for study creation
☐ Implement study service layer enhancements
☐ Add validation for new study fields
☐ Create collaboration API endpoints
☐ Test all API changes thoroughly
```

#### **Wizard Refactoring (Days 3-4)**

```markdown
DAY 3:
☐ Refactor StudyCreationWizard main component
☐ Update step components for requirements compliance
☐ Implement enhanced form data structure
☐ Add proper validation and error handling
☐ Test wizard flow for both study types

DAY 4:
☐ Implement auto-save with conflict resolution
☐ Add collaboration integration to wizard
☐ Create template integration features
☐ Implement proper state management
☐ Test complete wizard functionality
```

### **Week 4 Tasks**

#### **Block System Implementation (Days 5-7)**

```markdown
DAY 5:
☐ Implement block library with all 13 types
☐ Create block configuration interfaces
☐ Add drag-and-drop functionality
☐ Implement block validation system
☐ Test basic block operations

DAY 6:
☐ Implement individual block components
☐ Add block editing interfaces
☐ Create conditional logic system
☐ Implement block analytics tracking
☐ Test all block types thoroughly

DAY 7:
☐ Add mobile responsiveness for blocks
☐ Implement accessibility features
☐ Create block preview functionality
☐ Add block duplication and deletion
☐ Performance optimization for large studies
```

#### **Final Integration and Testing (Day 8)**

```markdown
DAY 8:
☐ Integration testing of complete system
☐ Performance testing with large studies
☐ Accessibility testing and compliance
☐ Mobile responsiveness validation
☐ Prepare for Phase 3 review
```

---

## 🧪 TESTING STRATEGY

### **Comprehensive Testing Plan**

```typescript
// TASK: Implement comprehensive testing
// PRIORITY: HIGH
// ESTIMATED TIME: 12 hours

describe('Study Creation System', () => {
  describe('Wizard Flow', () => {
    test('completes usability study creation', async () => {
      // Test complete usability study flow
    });
    
    test('completes interview study creation', async () => {
      // Test complete interview study flow
    });
    
    test('handles auto-save and recovery', async () => {
      // Test auto-save functionality
    });
  });
  
  describe('Block System', () => {
    test('creates and configures all block types', async () => {
      // Test all 13 block types
    });
    
    test('handles drag-and-drop reordering', async () => {
      // Test block reordering
    });
    
    test('validates block configurations', async () => {
      // Test validation rules
    });
  });
  
  describe('Collaboration', () => {
    test('real-time collaboration works', async () => {
      // Test real-time features
    });
    
    test('comment system functions', async () => {
      // Test commenting
    });
  });
  
  describe('Accessibility', () => {
    test('meets WCAG 2.1 AA standards', async () => {
      // Test accessibility compliance
    });
    
    test('supports keyboard navigation', async () => {
      // Test keyboard support
    });
  });
});
```

### **Performance Testing**

```typescript
// Performance benchmarks
const PERFORMANCE_TARGETS = {
  wizard_load_time: 2000, // 2 seconds
  block_addition_time: 500, // 0.5 seconds
  auto_save_time: 1000, // 1 second
  large_study_load: 5000, // 5 seconds for 50+ blocks
};

describe('Performance Tests', () => {
  test('wizard loads within performance targets', async () => {
    const startTime = Date.now();
    await loadWizard();
    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(PERFORMANCE_TARGETS.wizard_load_time);
  });
});
```

---

## 🎯 SUCCESS CRITERIA

### **Phase 3 Completion Requirements**

```markdown
FUNCTIONAL REQUIREMENTS:
☐ Study creation wizard matches requirements 100%
☐ All 13 block types implemented and working
☐ Both usability and interview flows functional
☐ Collaboration features working correctly
☐ Template integration complete
☐ Auto-save and recovery functional

TECHNICAL REQUIREMENTS:
☐ Database schema fully compliant
☐ API endpoints match requirements
☐ Real-time collaboration working
☐ Mobile responsiveness achieved
☐ WCAG 2.1 AA compliance verified
☐ Performance targets met

QUALITY REQUIREMENTS:
☐ Test coverage >95% for critical paths
☐ No critical bugs in wizard flow
☐ All block types pass validation
☐ Accessibility audit passed
☐ Mobile testing completed
☐ Cross-browser compatibility verified

USER EXPERIENCE REQUIREMENTS:
☐ Study creation time <10 minutes
☐ Wizard completion rate >95%
☐ Block configuration intuitive
☐ Error messages helpful and clear
☐ Mobile experience excellent
☐ Collaboration feels seamless
```

---

## 📞 APPROVAL CHECKPOINT

**This Phase 3 plan requires approval before implementation. Please review:**

1. **Wizard Refactoring**: Does the refactoring approach preserve existing functionality?
2. **Block System**: Is the implementation of all 13 block types comprehensive?
3. **Collaboration**: Are the collaboration features sufficient for team workflows?
4. **Performance**: Will the system handle large studies efficiently?
5. **Timeline**: Is the 2-week timeline realistic for this scope?

**Please approve this plan or request modifications before beginning Phase 3 implementation.**

---

*This document provides detailed implementation steps for the flagship Study Creation System. This system will serve as the core differentiator for ResearchHub in the competitive UX research market.*
