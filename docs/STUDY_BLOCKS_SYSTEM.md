# 📋 ResearchHub Study Blocks System

## Overview

ResearchHub uses a **modular block-based system** for building research studies. Each study consists of sequential **blocks** that serve specific purposes - from welcoming participants to collecting different types of data. This system provides maximum flexibility while maintaining consistency across research methodologies.

## 🧩 Block-Based Architecture

### Core Concept
- **Study** = A sequence of blocks that guide participants through the research experience
- **Block** = A self-contained component with a specific purpose (welcome, question, image, etc.)
- **Template** = Pre-configured collections of blocks for common research scenarios

### Block Sequence Example
```
Study: "Mobile App Usability Test"
├── Block 1: Welcome Screen (Introduction)
├── Block 2: Context Screen (Instructions)
├── Block 3: 5-Second Test (First Impressions)
├── Block 4: Multiple Choice (Demographics)
├── Block 5: Open Question (Initial Thoughts)
├── Block 6: Card Sort (Feature Categorization)
├── Block 7: Opinion Scale (Satisfaction Rating)
└── Block 8: Open Question (Final Feedback)
```

## 📦 Available Block Types

### 1. 🎯 Welcome Screen Block
**Purpose**: Introduce participants and set study context
**Use Case**: Study introduction, consent, motivation

**Components**:
- **Title**: Study title or greeting
- **Message**: Welcome text with customizable default: *"Amazing to meet you! You've been invited to share feedback, ideas, and insights. Remember there are no right or wrong answers here; just respond with what comes naturally to you!"*
- **Custom Message Toggle**: Enable/disable personalized welcome
- **Logo/Image**: Optional branding or visual element

**Technical Implementation**:
```typescript
interface WelcomeBlock {
  type: 'welcome';
  id: string;
  title: string;
  message: string;
  useCustomMessage: boolean;
  image?: string;
  settings: {
    showLogo: boolean;
    backgroundColor: string;
    textAlignment: 'left' | 'center' | 'right';
  };
}
```

### 2. ❓ Open Question Block
**Purpose**: Collect qualitative, open-ended responses
**Use Case**: Exploratory research, detailed feedback, storytelling

**Components**:
- **Question**: Main open-ended prompt
- **Note**: Additional context or instructions
- **Image**: Visual stimulus or reference
- **Follow-Up**: AI-powered dynamic follow-up questions
- **Conditions**: Logic for conditional branching

**Advanced Features**:
- **AI Sentiment Analysis**: Automatic mood and theme detection
- **Conditional Logic**: Branch to different blocks based on responses
- **Response Length Validation**: Minimum/maximum character limits

**Technical Implementation**:
```typescript
interface OpenQuestionBlock {
  type: 'open_question';
  id: string;
  question: string;
  note?: string;
  image?: string;
  validation: {
    required: boolean;
    minLength?: number;
    maxLength?: number;
  };
  aiFeatures: {
    sentimentAnalysis: boolean;
    themeExtraction: boolean;
    followUpGeneration: boolean;
  };
  conditionalLogic?: ConditionalRule[];
}
```

### 3. 📊 Opinion Scale Block
**Purpose**: Quantitative rating and satisfaction measurement
**Use Case**: Product ratings, feature evaluation, sentiment measurement

**Components**:
- **Question**: Rating prompt
- **Notes**: Clarifying instructions
- **Image**: Product/feature screenshot
- **Scale Labels**: Endpoint descriptions
- **Scale Range**: 5-10 steps
- **Scale Type**: Numerical, Stars, or Emotions

**Scale Types**:
- **Numerical**: Traditional 1-10 rating
- **Stars**: Visual star rating (1-5 ⭐)
- **Emotions**: Emoji progression (😞 → 😐 → 😊)

**Technical Implementation**:
```typescript
interface OpinionScaleBlock {
  type: 'opinion_scale';
  id: string;
  question: string;
  note?: string;
  image?: string;
  scale: {
    type: 'numerical' | 'stars' | 'emotions';
    min: number;
    max: number;
    minLabel: string;
    maxLabel: string;
    steps: number;
  };
  validation: {
    required: boolean;
  };
}
```

### 4. 📝 Simple Input Block
**Purpose**: Collect structured data with specific formats
**Use Case**: Demographics, contact info, specific data points

**Components**:
- **Question**: Direct prompt
- **Notes**: Input instructions
- **Image**: Visual context
- **Input Type**: Text, Number, Date, Email

**Input Types & Validation**:
- **Text**: Free-form text with character limits
- **Numerical**: Numbers only with range validation
- **Date**: Calendar picker with date constraints
- **Email**: Email format validation

**Technical Implementation**:
```typescript
interface SimpleInputBlock {
  type: 'simple_input';
  id: string;
  question: string;
  note?: string;
  image?: string;
  inputType: 'text' | 'number' | 'date' | 'email';
  validation: {
    required: boolean;
    minLength?: number;
    maxLength?: number;
    min?: number; // for numbers
    max?: number; // for numbers
    pattern?: string; // regex validation
  };
  placeholder?: string;
}
```

### 5. ☑️ Multiple Choice Block
**Purpose**: Closed-ended questions with predefined options
**Use Case**: Categorical data, preferences, feature selection

**Components**:
- **Question**: Choice prompt
- **Notes**: Selection instructions
- **Image**: Visual reference
- **Type**: Single or Multiple selection
- **Choices**: Predefined options (2-4 for ResearchHub requirement)
- **Other Option**: Custom text input for unlisted choices

**Selection Types**:
- **Single Choice**: Radio buttons (one selection)
- **Multiple Choice**: Checkboxes (multiple selections)

**Technical Implementation**:
```typescript
interface MultipleChoiceBlock {
  type: 'multiple_choice';
  id: string;
  question: string;
  note?: string;
  image?: string;
  selectionType: 'single' | 'multiple';
  choices: Array<{
    id: string;
    text: string;
    image?: string;
  }>;
  allowOther: boolean;
  otherPlaceholder?: string;
  validation: {
    required: boolean;
    minSelections?: number;
    maxSelections?: number;
  };
}
```

### 6. 📄 Context Screen Block
**Purpose**: Provide instructions, guidance, or transitional information
**Use Case**: Task instructions, study sections, contextual information

**Components**:
- **Message**: Main instructional content
- **Notes**: Additional details or clarifications
- **Image**: Instructional diagrams or examples

**Technical Implementation**:
```typescript
interface ContextScreenBlock {
  type: 'context_screen';
  id: string;
  message: string;
  note?: string;
  image?: string;
  settings: {
    showContinueButton: boolean;
    autoAdvance: boolean;
    displayDuration?: number; // seconds
  };
}
```

### 7. ✅ Yes/No Block
**Purpose**: Binary decision collection
**Use Case**: Preference decisions, feature usage, binary feedback

**Components**:
- **Question**: Binary choice prompt
- **Notes**: Decision context
- **Image**: Visual reference
- **Type**: Icons or Emotions display

**Display Types**:
- **Icons**: ✓ (checkmark) and ✗ (cross)
- **Emotions**: 😊 (yes) and 😞 (no)

**Technical Implementation**:
```typescript
interface YesNoBlock {
  type: 'yes_no';
  id: string;
  question: string;
  note?: string;
  image?: string;
  displayType: 'icons' | 'emotions';
  validation: {
    required: boolean;
  };
}
```

### 8. ⚡ 5-Second Test Block
**Purpose**: First impression and memory testing
**Use Case**: Design evaluation, marketing material testing, immediate reactions

**Components**:
- **Custom Instructions Toggle**: Enable personalized instructions
- **Default Instructions**: *"Focus on the image. You will view an image for a limited time. Try to understand what the image is about and remember as much information as you can."*
- **Image**: Test stimulus
- **Duration**: Customizable display time (default: 5 seconds)

**Technical Implementation**:
```typescript
interface FiveSecondTestBlock {
  type: 'five_second_test';
  id: string;
  instructions: string;
  useCustomInstructions: boolean;
  image: string;
  duration: number; // seconds
  followUpQuestions: Array<{
    id: string;
    question: string;
    type: 'open_question' | 'multiple_choice';
  }>;
}
```

### 9. 🃏 Card Sort Block
**Purpose**: Information architecture and categorization research
**Use Case**: Website navigation, feature grouping, mental model understanding

**Components**:
- **Custom Instructions**: Task-specific guidance
- **Default Instructions**: *"Drag and drop cards into each category. Sort each card into the category that makes sense to you. Do what comes naturally. There are no right or wrong answers, so take the time that you need."*
- **Cards**: Items to be categorized
- **Categories**: Predefined or participant-created groups
- **Shuffle Options**: Randomize card/category order

**Advanced Features**:
- **Open Card Sort**: Participants create their own categories
- **Closed Card Sort**: Predefined categories only
- **Hybrid Sort**: Mix of predefined and custom categories

**Technical Implementation**:
```typescript
interface CardSortBlock {
  type: 'card_sort';
  id: string;
  instructions: string;
  cards: Array<{
    id: string;
    text: string;
    description?: string;
  }>;
  categories: Array<{
    id: string;
    name: string;
    description?: string;
  }>;
  settings: {
    shuffleCards: boolean;
    shuffleCategories: boolean;
    allowUncategorized: boolean;
    allowParticipantCategories: boolean;
    requireRanking: boolean;
  };
  validation: {
    requireAllCardsPlaced: boolean;
  };
}
```

### 10. 🌳 Tree Test Block
**Purpose**: Information architecture and navigation evaluation
**Use Case**: Website structure testing, menu organization, findability studies

**Components**:
- **Custom Instructions**: Navigation task guidance
- **Tree Structure**: Hierarchical site/app structure
- **Tasks**: Specific findability goals
- **Shuffle Options**: Randomize category order

**Features**:
- **Path Tracking**: Record navigation routes
- **Time Measurement**: Task completion timing
- **Success Rate**: Task completion statistics
- **Skip Option**: Allow task skipping

**Technical Implementation**:
```typescript
interface TreeTestBlock {
  type: 'tree_test';
  id: string;
  instructions: string;
  treeStructure: TreeNode[];
  tasks: Array<{
    id: string;
    instruction: string;
    targetPath: string[];
    allowSkip: boolean;
  }>;
  settings: {
    shuffleCategories: boolean;
    showBreadcrumbs: boolean;
    allowBackNavigation: boolean;
  };
}

interface TreeNode {
  id: string;
  label: string;
  children?: TreeNode[];
  isTarget?: boolean;
}
```

## 🎨 Block Design Principles

### 1. **Modularity**
Each block is self-contained and reusable across different studies.

### 2. **Flexibility**
Blocks can be configured, customized, and arranged in any sequence.

### 3. **Consistency**
All blocks follow the same structural pattern and API design.

### 4. **Accessibility**
Every block includes accessibility features and follows WCAG guidelines.

### 5. **Analytics**
Built-in data collection and analysis for each block type.

## 🔧 Technical Architecture

### Block Base Interface
```typescript
interface BaseBlock {
  id: string;
  type: BlockType;
  order: number;
  title?: string;
  description?: string;
  settings: {
    isRequired: boolean;
    showProgress: boolean;
    allowSkip: boolean;
    timeLimit?: number;
  };
  conditionalLogic?: ConditionalRule[];
  analytics: {
    trackInteractions: boolean;
    trackTime: boolean;
    trackPath: boolean;
  };
}
```

### Conditional Logic System
```typescript
interface ConditionalRule {
  id: string;
  condition: {
    blockId: string;
    operator: 'equals' | 'contains' | 'greater_than' | 'less_than';
    value: any;
  };
  action: {
    type: 'show_block' | 'hide_block' | 'jump_to_block' | 'end_study';
    targetBlockId?: string;
  };
}
```

### Data Collection Schema
```typescript
interface BlockResponse {
  blockId: string;
  participantId: string;
  studyId: string;
  blockType: BlockType;
  response: any; // Block-specific response format
  metadata: {
    startTime: Date;
    endTime: Date;
    interactionCount: number;
    revisited: boolean;
    skipped: boolean;
  };
}
```

## 📊 Analytics & Insights

### Per-Block Analytics
- **Completion Rates**: How many participants complete each block
- **Time Analysis**: Average time spent per block type
- **Drop-off Points**: Where participants exit the study
- **Response Quality**: Completeness and depth of responses

### Cross-Block Analysis
- **Flow Optimization**: Identify optimal block sequences
- **Conditional Logic Performance**: Effectiveness of branching logic
- **Template Performance**: Which templates perform best

## 🎯 Integration with ResearchHub

### Study Builder Integration
The block system integrates seamlessly with ResearchHub's existing Study Builder:

1. **Block Library**: Visual library of available blocks
2. **Drag & Drop**: Arrange blocks in study sequence
3. **Block Configuration**: Edit block settings inline
4. **Preview Mode**: Test blocks as participants would see them
5. **Template Application**: Apply pre-configured block collections

### Template System Integration
Blocks are the foundation of ResearchHub's template system, allowing researchers to:

1. **Browse Templates**: See block compositions before use
2. **Customize Templates**: Modify blocks within templates
3. **Save Custom Templates**: Create reusable block combinations
4. **Share Templates**: Collaborate on block configurations

---

**Next Steps**: This block system provides the foundation for flexible, powerful research studies in ResearchHub. Each block type can be implemented incrementally, starting with the most commonly used blocks (Welcome, Open Question, Multiple Choice) and expanding to specialized blocks (Card Sort, Tree Test) as needed.
