# 🎨 ResearchHub Template System

## Overview

The **Template System** in ResearchHub allows researchers to create, manage, and reuse pre-configured collections of study blocks. Templates streamline study creation by providing proven research methodologies and block combinations that can be customized for specific needs.

## 🎯 Core Concepts

### Template Architecture
- **Template** = Pre-configured collection of study blocks with specific research purpose
- **Block Composition** = Sequence of blocks optimized for particular research goals  
- **Customization** = Ability to modify templates while preserving the original structure
- **Reusability** = Save and share successful study configurations

## 📚 Template Categories

### 1. 🖥️ Usability Testing Templates
**Purpose**: Evaluate user interactions with products, websites, or prototypes

#### Basic Usability Test
```
Blocks Sequence:
├── Welcome Screen (Introduction & Consent)
├── Context Screen (Test Instructions)
├── 5-Second Test (First Impressions)
├── Simple Input (Demographics)
├── Multiple Choice (Experience Level)
├── Open Question (Initial Expectations)
├── [Custom Usability Tasks]
├── Opinion Scale (Ease of Use Rating)
├── Multiple Choice (Feature Preferences)
├── Open Question (Improvement Suggestions)
└── Context Screen (Thank You Message)
```

#### Advanced Usability Template
```
Blocks Sequence:
├── Welcome Screen (Study Introduction)
├── Context Screen (Pre-test Instructions)
├── Simple Input (Participant Info)
├── Card Sort (Feature Categorization)
├── Tree Test (Navigation Evaluation)
├── 5-Second Test (Design Impression)
├── Open Question (Navigation Expectations)
├── [Custom Task Blocks]
├── Opinion Scale (Satisfaction Ratings)
├── Multiple Choice (Preference Ranking)
├── Open Question (Detailed Feedback)
└── Context Screen (Next Steps)
```

### 2. 📊 Survey Research Templates

#### Customer Satisfaction Survey
```
Blocks Sequence:
├── Welcome Screen (Survey Introduction)
├── Simple Input (Customer Information)
├── Multiple Choice (Product Usage)
├── Opinion Scale (Satisfaction Rating)
├── Multiple Choice (Feature Importance)
├── Yes/No (Recommendation Likelihood)
├── Opinion Scale (NPS Score)
├── Open Question (Feedback Details)
├── Multiple Choice (Improvement Areas)
└── Context Screen (Thank You)
```

#### Market Research Template
```
Blocks Sequence:
├── Welcome Screen (Research Introduction)
├── Simple Input (Demographics)
├── Multiple Choice (Market Segment)
├── Opinion Scale (Brand Perception)
├── Card Sort (Product Categories)
├── Multiple Choice (Purchase Behavior)
├── Open Question (Needs Assessment)
├── Opinion Scale (Price Sensitivity)
├── Yes/No (Interest Indicators)
└── Context Screen (Completion)
```

### 3. 🎤 User Interview Templates

#### Discovery Interview
```
Blocks Sequence:
├── Welcome Screen (Interview Introduction)
├── Context Screen (Interview Guidelines)
├── Simple Input (Participant Background)
├── Open Question (Current Challenges)
├── Open Question (Workflow Description)
├── Multiple Choice (Tool Usage)
├── Open Question (Pain Points)
├── Open Question (Ideal Solutions)
├── Opinion Scale (Priority Assessment)
└── Context Screen (Follow-up Information)
```

#### Product Feedback Interview
```
Blocks Sequence:
├── Welcome Screen (Session Introduction)
├── Context Screen (Product Context)
├── Multiple Choice (Usage Frequency)
├── Open Question (User Journey)
├── Opinion Scale (Feature Ratings)
├── Open Question (Improvement Ideas)
├── Yes/No (Feature Requests)
├── Open Question (Competitive Analysis)
└── Context Screen (Next Steps)
```

## 🔧 Template Management Features

### For Researchers

#### 1. **Browse Templates**
- **Category Filtering**: Filter by research type (Usability, Survey, Interview)
- **Preview Mode**: See block sequence and configuration before use
- **Template Details**: Purpose, duration, participant requirements
- **Usage Statistics**: How often template is used, success rates

#### 2. **Template Preview Interface**
```typescript
interface TemplatePreview {
  id: string;
  name: string;
  category: 'usability' | 'survey' | 'interview' | 'card_sort' | 'tree_test';
  description: string;
  purpose: string;
  estimatedDuration: number;
  recommendedParticipants: number;
  blocks: BlockPreview[];
  tags: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  lastUpdated: Date;
  usageCount: number;
  rating: number;
}

interface BlockPreview {
  type: BlockType;
  title: string;
  description: string;
  estimatedDuration: number;
  isRequired: boolean;
  configuration: any;
}
```

#### 3. **Use Template Workflow**
1. **Template Selection**: Choose from categorized library
2. **Preview Review**: Examine block sequence and purpose
3. **Customization Options**: 
   - Modify block settings
   - Add/remove blocks
   - Reorder sequence
   - Customize content
4. **Save as Custom**: Option to save modifications as new template

#### 4. **Create Custom Templates**
- **From Scratch**: Build template using block library
- **From Existing Study**: Convert successful studies to templates  
- **From Modified Template**: Save customized versions
- **Template Metadata**: Name, description, category, tags

#### 5. **Template Library Management**
- **My Templates**: Personal template collection
- **Shared Templates**: Team/organization templates
- **Public Templates**: Community-contributed templates
- **Favorites**: Bookmark frequently used templates

### For Administrators

#### 1. **Global Template Library**
- **Curated Templates**: Official ResearchHub templates
- **Quality Control**: Review and approve community templates
- **Category Management**: Organize templates by research type
- **Template Analytics**: Usage statistics and performance metrics

#### 2. **Template Administration Interface**
```typescript
interface AdminTemplateManagement {
  createTemplate(template: TemplateData): Promise<Template>;
  updateTemplate(id: string, updates: Partial<TemplateData>): Promise<Template>;
  deleteTemplate(id: string): Promise<void>;
  approveTemplate(id: string): Promise<void>;
  categorizeTemplate(id: string, category: TemplateCategory): Promise<void>;
  getTemplateAnalytics(id: string): Promise<TemplateAnalytics>;
  bulkOperations: {
    importTemplates(templates: TemplateData[]): Promise<Template[]>;
    exportTemplates(ids: string[]): Promise<TemplateExport>;
    archiveTemplates(ids: string[]): Promise<void>;
  };
}
```

#### 3. **Template Quality Standards**
- **Block Validation**: Ensure proper block configuration
- **Research Methodology**: Verify scientific validity
- **User Experience**: Check for logical flow and clarity
- **Accessibility**: Ensure WCAG compliance
- **Performance**: Optimize for completion rates

## 📋 Template Data Structure

### Template Schema
```typescript
interface Template {
  id: string;
  name: string;
  description: string;
  category: TemplateCategory;
  purpose: string;
  methodology: string;
  
  // Block Configuration
  blocks: TemplateBlock[];
  estimatedDuration: number;
  
  // Metadata
  tags: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  targetAudience: string[];
  industry: string[];
  
  // Publishing Info
  isPublic: boolean;
  createdBy: string;
  organization?: string;
  version: string;
  changelog: VersionChange[];
  
  // Analytics
  usageCount: number;
  rating: number;
  reviews: TemplateReview[];
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
}

interface TemplateBlock {
  blockType: BlockType;
  config: BlockConfiguration;
  order: number;
  isRequired: boolean;
  notes?: string;
}
```

### Template Categories
```typescript
type TemplateCategory = 
  | 'usability_testing'
  | 'user_interviews' 
  | 'surveys'
  | 'card_sorting'
  | 'tree_testing'
  | 'five_second_tests'
  | 'a_b_testing'
  | 'customer_feedback'
  | 'market_research'
  | 'academic_research'
  | 'custom';
```

## 🎨 Template UI/UX Design

### Template Browser Interface
```
┌─────────────────────────────────────────────────┐
│ 🎨 Template Library                             │
├─────────────────────────────────────────────────┤
│ Categories: [All] [Usability] [Survey] [Interview] │
│ Filters: [Duration] [Difficulty] [Industry]     │
├─────────────────────────────────────────────────┤
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ │
│ │ 🖥️ Basic    │ │ 📊 Customer │ │ 🎤 Discovery│ │
│ │ Usability   │ │ Satisfaction│ │ Interview   │ │
│ │ Test        │ │ Survey      │ │             │ │
│ │             │ │             │ │             │ │
│ │ 8 blocks    │ │ 6 blocks    │ │ 7 blocks    │ │
│ │ ~30 min     │ │ ~15 min     │ │ ~45 min     │ │
│ │ ⭐ 4.8/5    │ │ ⭐ 4.6/5    │ │ ⭐ 4.9/5    │ │
│ │ [Preview]   │ │ [Preview]   │ │ [Preview]   │ │
│ │ [Use Template]│ │ [Use Template]│ │ [Use Template]│ │
│ └─────────────┘ └─────────────┘ └─────────────┘ │
└─────────────────────────────────────────────────┘
```

### Template Preview Modal
```
┌─────────────────────────────────────────────────┐
│ 🖥️ Basic Usability Test Template              │
├─────────────────────────────────────────────────┤
│ Purpose: Evaluate user interactions with        │
│ digital products and identify usability issues  │
│                                                 │
│ Duration: ~30 minutes | Participants: 5-15     │
│ Difficulty: Beginner | Category: Usability     │
├─────────────────────────────────────────────────┤
│ Block Sequence:                                 │
│ 1. 🎯 Welcome Screen (2 min)                   │
│ 2. 📄 Context Screen (3 min)                   │
│ 3. ⚡ 5-Second Test (1 min)                    │
│ 4. 📝 Demographics (3 min)                     │
│ 5. ❓ Open Question (5 min)                    │
│ 6. [Custom Task Blocks]                        │
│ 7. 📊 Satisfaction Rating (3 min)              │
│ 8. 💬 Final Feedback (5 min)                   │
│                                                 │
│ [Edit Template] [Use As-Is] [Save Copy]        │
└─────────────────────────────────────────────────┘
```

## 🚀 Implementation Roadmap

### Phase 1: Core Template System
- [ ] Template data models and database schema
- [ ] Basic template CRUD operations
- [ ] Template browser interface
- [ ] Template preview functionality

### Phase 2: Template Creation Tools
- [ ] Visual template builder
- [ ] Block library integration
- [ ] Template customization interface
- [ ] Save and export functionality

### Phase 3: Advanced Features
- [ ] Template versioning and changelog
- [ ] Community templates and sharing
- [ ] Template analytics and insights
- [ ] AI-powered template recommendations

### Phase 4: Enterprise Features
- [ ] Organization template libraries
- [ ] Template approval workflows
- [ ] Advanced analytics and reporting
- [ ] Template marketplace

## 🎯 Integration with Study Builder

### Template Application Workflow
1. **Template Selection**: Choose from library
2. **Preview & Review**: Examine block sequence
3. **Customization**: Modify blocks as needed
4. **Study Creation**: Apply template to new study
5. **Block Editing**: Fine-tune individual blocks
6. **Publishing**: Launch study with template base

### Study Builder Enhancements
- **Template Quick Start**: One-click template application
- **Block Suggestions**: AI-powered block recommendations
- **Template Save**: Convert studies back to templates
- **Template Comparison**: Compare multiple templates side-by-side

## 📊 Success Metrics

### Template Effectiveness
- **Usage Rate**: How often templates are selected
- **Completion Rate**: Study completion rates using templates
- **Customization Rate**: How much templates are modified
- **Study Success**: Research outcomes from template-based studies

### User Adoption
- **Template Creation**: Number of custom templates created
- **Community Sharing**: Templates shared between researchers
- **Time Savings**: Reduction in study setup time
- **User Satisfaction**: Researcher feedback on template system

---

**Templates provide the foundation for rapid, consistent, and effective research study creation in ResearchHub. By offering proven block combinations and allowing customization, templates enable researchers to focus on their research goals rather than study structure.**
