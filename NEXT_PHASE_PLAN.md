# Next Phase Plan: Complete Study Builder System

## 🎯 **Phase Overview: Advanced Study Builder with Task Management**
**Timeline**: 3-4 weeks  
**Priority**: High - Foundation for all research functionality  
**Current State**: Authentication ✅, Basic Studies ✅, Database Schema ✅  
**Constraint**: **Exactly 3 Study Types** - Usability Test, User Interview, Survey

## 📋 **Core Objectives**

### 🔥 **Primary Goals**
1. **Complete Study Builder System** - Full workflow from creation to deployment
2. **Smart Task Management** - Study type-specific task filtering and constraints  
3. **Task Editing Capabilities** - Full CRUD operations for study tasks
4. **Study Type Intelligence** - Prevent incompatible task combinations (e.g., surveys cannot have prototype testing)
5. **Enhanced User Experience** - Intuitive drag-drop, validation, previews
6. **Focused Study Types** - Only 3 core types with clear task boundaries

### 🎯 **Success Criteria**
- ✅ Exactly 3 study types: Usability Test, User Interview, Survey
- ✅ Tree testing and card sorting are tasks within Usability Testing (not separate study types)
- ✅ Study types enforce task limitations (e.g., surveys can't have prototype testing)
- ✅ Tasks can be added, edited, reordered, and removed
- ✅ Real-time validation and duration estimation
- ✅ Study preview and testing capabilities
- ✅ Complete study lifecycle management

## 🏗️ **Implementation Roadmap**

### **Week 1: Study Type System & Task Constraints**

#### **Day 1-2: Enhanced Study Types**
```typescript
// Study Type Definitions with Task Constraints
interface StudyType {
  id: string;
  name: string;
  description: string;
  allowedTasks: TaskCategory[];
  forbiddenTasks: TaskCategory[];
  maxTasks: number;
  minTasks: number;
  recommendedDuration: number;
  recordingSettings: RecordingConfig;
  features: StudyFeature[];
}

const STUDY_TYPES = {
  usability_test: {
    allowedTasks: [
      'navigation', 'prototype_testing', 'task_completion', 'feedback',
      'tree_testing', 'card_sorting', 'findability', 'first_click',
      'menu_testing', 'search_testing', 'mobile_navigation'
    ],
    forbiddenTasks: ['survey_questions', 'interview_deep_dive', 'demographic_survey'],
    maxTasks: 10,
    recordingRecommended: true
  },
  user_interview: {
    allowedTasks: [
      'interview_questions', 'follow_up', 'conversation_starter', 
      'background_questions', 'task_discussion', 'concept_feedback'
    ],
    forbiddenTasks: ['prototype_testing', 'navigation', 'tree_testing', 'card_sorting'],
    maxTasks: 5,
    recordingRecommended: true
  },
  survey: {
    allowedTasks: [
      'questionnaire', 'rating_scale', 'multiple_choice', 'demographics',
      'likert_scale', 'net_promoter_score', 'open_ended', 'ranking'
    ],
    forbiddenTasks: ['prototype_testing', 'navigation', 'screen_recording', 'interview_questions', 'tree_testing', 'card_sorting'],
    maxTasks: 8,
    recordingRecommended: false
  }
};
```

#### **Day 3-4: Task Library & Templates**
- Comprehensive task template library
- Task categorization and filtering
- Template customization system
- Task compatibility matrix

#### **Day 5: Validation System**
- Study type constraint enforcement
- Real-time task validation
- Duration estimation algorithms
- Conflict detection and resolution

### **Week 2: Advanced Task Management**

#### **Day 1-2: Task Builder Interface**
- Drag-and-drop task ordering
- In-line task editing
- Task duplication and templates
- Bulk task operations

#### **Day 3-4: Task Configuration**
- Task-specific settings panels
- Conditional logic for tasks
- Dynamic form generation
- Task dependency management

#### **Day 5: Preview & Testing**
- Live study preview
- Task flow visualization
- Participant simulation mode
- Task validation testing

### **Week 3: Study Lifecycle Management**

#### **Day 1-2: Study States & Workflows**
- Draft → Review → Published → Active → Completed
- Version control for study changes
- Study cloning and templates
- Collaborative editing (future)

#### **Day 3-4: Enhanced Settings**
- Study-specific recording preferences
- Participant screening criteria
- Custom completion conditions
- Integration settings

#### **Day 5: Quality Assurance**
- Automated study validation
- Best practice recommendations
- Performance optimization
- Error handling improvements

### **Week 4: Polish & Production**

#### **Day 1-2: UI/UX Enhancement**
- Visual improvements and animations
- Accessibility compliance
- Mobile responsiveness
- Loading states and feedback

#### **Day 3-4: Integration & Testing**
- End-to-end testing suite
- Performance testing
- Cross-browser compatibility
- API optimization

#### **Day 5: Documentation & Deployment**
- User documentation and guides
- Developer documentation updates
- Production deployment
- Feature flag management

## 🛠️ **Technical Implementation**

### **Database Schema Enhancements**
```sql
-- Study Types Table
CREATE TABLE study_types (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  allowed_tasks TEXT[] NOT NULL,
  forbidden_tasks TEXT[] DEFAULT '{}',
  max_tasks INTEGER DEFAULT 10,
  min_tasks INTEGER DEFAULT 1,
  recommended_duration INTEGER DEFAULT 30,
  recording_config JSONB DEFAULT '{}',
  features TEXT[] DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Enhanced Task Templates
CREATE TABLE task_templates (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  subcategory TEXT,
  description TEXT NOT NULL,
  estimated_duration INTEGER DEFAULT 5,
  complexity_level INTEGER DEFAULT 1, -- 1-5 scale
  required_fields JSONB DEFAULT '{}',
  optional_fields JSONB DEFAULT '{}',
  default_settings JSONB DEFAULT '{}',
  compatibility_tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Study Tasks with Enhanced Features
CREATE TABLE study_tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  study_id UUID REFERENCES studies(id) ON DELETE CASCADE,
  template_id TEXT REFERENCES task_templates(id),
  name TEXT NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL,
  estimated_duration INTEGER DEFAULT 5,
  actual_duration INTEGER, -- filled after completion
  settings JSONB DEFAULT '{}',
  validation_rules JSONB DEFAULT '{}',
  is_required BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### **API Endpoints Structure**
```typescript
// Study Builder API Routes
GET    /api/study-builder?action=getStudyTypes
GET    /api/study-builder?action=getTaskTemplates&studyType=usability
GET    /api/study-builder?action=getTasksByCategory&category=navigation
POST   /api/study-builder?action=createStudyWithTasks
PUT    /api/study-builder?action=updateStudyTasks&studyId=123
PUT    /api/study-builder?action=reorderTasks&studyId=123
DELETE /api/study-builder?action=removeTask&taskId=456
GET    /api/study-builder?action=validateStudy&studyId=123
POST   /api/study-builder?action=previewStudy
```

### **Frontend Component Architecture**
```
src/client/components/study-builder/
├── StudyBuilder.tsx (Main container)
├── StudyTypeSelector.tsx
├── TaskLibrary.tsx
├── TaskEditor.tsx
├── TaskList.tsx (with drag-drop)
├── StudySettings.tsx
├── StudyPreview.tsx
├── ValidationPanel.tsx
└── templates/
    ├── UsabilityTaskTemplates.tsx
    ├── SurveyTaskTemplates.tsx
    └── InterviewTaskTemplates.tsx
```

## 🎯 **Study Type Specifications** (Exactly 3 Core Study Types)

### **Usability Testing** 🖱️
- **Purpose**: Test user interactions with interfaces, prototypes, and information architecture
- **Allowed Tasks**: 
  - Website navigation, prototype testing, task completion, user feedback
  - Tree testing (information architecture), card sorting (content organization)
  - First-click tests, findability tests, menu testing, search testing
  - Mobile navigation, information architecture validation
- **Forbidden Tasks**: Survey questionnaires, interview deep-dives, demographic surveys
- **Max Tasks**: 10 | **Min Tasks**: 1
- **Recording**: Highly recommended (screen + audio)
- **Duration**: 3-60 minutes per task
- **Features**: Screen recording, click tracking, heatmaps, path analysis

### **User Interview** 🎙️
- **Purpose**: Gather qualitative insights through guided conversation
- **Allowed Tasks**: 
  - Interview questions, follow-up probes, conversation starters
  - Demographic collection, experience questions
  - Task-based discussions, concept feedback
- **Forbidden Tasks**: Prototype testing, navigation tasks, tree testing, card sorting
- **Max Tasks**: 5 | **Min Tasks**: 1
- **Recording**: Audio recording essential, video optional
- **Duration**: 10-45 minutes per task
- **Features**: Audio recording, note-taking, conversation guides

### **Survey Research** 📋
- **Purpose**: Collect structured quantitative and qualitative data
- **Allowed Tasks**: 
  - Questionnaires, rating scales, multiple choice
  - Demographics, Net Promoter Score, System Usability Scale
  - Open-ended questions, ranking tasks
- **Forbidden Tasks**: Prototype testing, navigation tasks, screen recording, tree testing, card sorting
- **Max Tasks**: 8 | **Min Tasks**: 1
- **Recording**: Not recommended (text-based responses)
- **Duration**: 1-15 minutes per task
- **Features**: Form validation, skip logic, randomization

## 📊 **Task Template Library** (Organized by Study Type)

### **Usability Testing Tasks**

#### **Navigation & Interface Testing**
- **Website Navigation**: Navigate to complete specific goals
- **Menu Testing**: Test navigation menu usability  
- **Search Testing**: Test search functionality
- **Mobile Navigation**: Test mobile-specific navigation
- **First Click Test**: Test where users click first on a page

#### **Prototype & Design Testing**
- **Wireframe Testing**: Test low-fidelity wireframes
- **Interactive Prototype**: Test high-fidelity prototypes
- **Concept Validation**: Test early-stage concepts
- **Feature Testing**: Test specific feature implementations

#### **Information Architecture Tasks**
- **Tree Testing**: Navigate site structure to find information
- **Card Sorting**: Sort items into logical categories
- **Findability Testing**: Test how easily users find content
- **Category Labeling**: Name and organize content groups

#### **Task Completion & Performance**
- **Task Completion**: Measure success completing specific tasks
- **Performance Testing**: Time and efficiency measurements
- **Error Recovery**: Test how users recover from mistakes
- **Multi-step Workflows**: Test complex task sequences

### **User Interview Tasks**

#### **Conversation Starters**
- **Warm-up Questions**: Ease participants into conversation
- **Background & Experience**: Understand user context
- **Current Workflow**: How they currently solve problems
- **Pain Points Discovery**: What frustrates them most

#### **Task-Based Discussion**
- **Task Walkthrough**: Discuss how they complete specific tasks
- **Decision Making**: Understand how they make choices
- **Feature Feedback**: Reactions to specific features
- **Concept Reactions**: Initial thoughts on new ideas

#### **Deep Dive Questions**
- **Follow-up Probes**: Dig deeper into responses
- **Clarification Questions**: Ensure understanding
- **Scenario Discussion**: "What would you do if..."
- **Wrap-up Questions**: Final thoughts and suggestions

### **Survey Research Tasks**

#### **Quantitative Measurements**
- **Likert Scales**: 5-7 point agreement scales
- **Rating Scales**: Numerical ratings (1-10)
- **System Usability Scale**: Standard SUS questionnaire
- **Net Promoter Score**: NPS measurement
- **Satisfaction Ratings**: Overall satisfaction scores

#### **Data Collection**
- **Demographics**: Age, gender, experience level, location
- **Multiple Choice**: Single or multiple selection questions
- **Ranking Tasks**: Order items by preference or importance
- **Matrix Questions**: Rate multiple items on same scale

#### **Qualitative Feedback**
- **Open-Ended Questions**: Free-text responses
- **Comment Boxes**: Additional feedback collection
- **Suggestion Prompts**: Ideas for improvement
- **Experience Descriptions**: Describe their experience

## 🔧 **Technical Features**

### **Smart Task Filtering**
```typescript
function getCompatibleTasks(studyType: string, currentTasks: Task[]): TaskTemplate[] {
  const studyConfig = STUDY_TYPES[studyType];
  
  return TASK_TEMPLATES.filter(template => {
    // Check if task is allowed for this study type
    if (!studyConfig.allowedTasks.includes(template.category)) return false;
    
    // Check if task is explicitly forbidden
    if (studyConfig.forbiddenTasks.includes(template.category)) return false;
    
    // Check if adding this task would exceed max tasks
    if (currentTasks.length >= studyConfig.maxTasks) return false;
    
    // Check task compatibility with existing tasks
    return isCompatibleWithExistingTasks(template, currentTasks);
  });
}
```

### **Dynamic Validation System**
```typescript
interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  suggestions: string[];
}

function validateStudy(study: Study): ValidationResult {
  const errors = [];
  const warnings = [];
  const suggestions = [];
  
  // Check study type constraints
  if (study.tasks.length > study.type.maxTasks) {
    errors.push({ type: 'TOO_MANY_TASKS', message: `Maximum ${study.type.maxTasks} tasks allowed` });
  }
  
  // Check task compatibility
  study.tasks.forEach(task => {
    if (!study.type.allowedTasks.includes(task.category)) {
      errors.push({ type: 'INCOMPATIBLE_TASK', taskId: task.id, message: `${task.name} not compatible with ${study.type.name}` });
    }
  });
  
  // Duration warnings
  const totalDuration = study.tasks.reduce((sum, task) => sum + task.estimatedDuration, 0);
  if (totalDuration > 60) {
    warnings.push({ type: 'LONG_DURATION', message: 'Study may be too long for participants' });
  }
  
  return { isValid: errors.length === 0, errors, warnings, suggestions };
}
```

## 🚀 **Immediate Next Steps**

### **This Week - Foundation**
1. ✅ Create enhanced study type definitions - **COMPLETED**
2. ✅ Implement task template library - **COMPLETED**
3. ✅ Build smart task filtering system - **COMPLETED**
4. ✅ Create task editing components - **COMPLETED**

### **Next Week - Advanced Features**
1. ✅ Drag-and-drop task reordering - **COMPLETED**
2. ✅ In-line task editing - **COMPLETED**
3. ✅ Study validation system - **COMPLETED**
4. ✅ Preview and testing modes - **COMPLETED**

### **Following Week - Polish**
1. ⏳ UI/UX improvements
2. ⏳ Performance optimization
3. ⏳ Comprehensive testing
4. ⏳ Documentation updates

## 🎯 **Success Metrics**

### **User Experience**
- ⚡ Task creation time < 30 seconds
- 🎯 95% of users can complete study creation without help
- 📱 Full mobile responsiveness
- ♿ WCAG 2.1 AA accessibility compliance

### **System Performance**
- 🚀 Page load time < 2 seconds
- 💾 Real-time auto-save every 30 seconds
- 🔄 Instant task filtering and validation
- 📊 Support for 100+ tasks per study

### **Data Quality**
- ✅ 100% valid studies (pass validation)
- 🎯 Reduced setup errors by 90%
- 📈 Increased study completion rates
- 💡 Better participant experience scores

---

**Current Status**: ✅ **PHASE 1 & 2 COMPLETED** - Enhanced Study Builder Fully Implemented  
**Completion Date**: June 20, 2025  
**Files Updated**: NEXT_PHASE_PLAN.md, api/study-builder.js, src/client/components/studies/EnhancedStudyBuilder.tsx, local-full-dev.js  
**Next Phase**: Integration testing and UI/UX polish  
**Risk Level**: Low (core functionality working and tested)
