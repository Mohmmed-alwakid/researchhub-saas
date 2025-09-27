---
mode: agent
context: [study-builder, usability-testing, block-system]
audience: [developer, researcher, ux-designer]
framework: [react, typescript]
domain: [user-research, study-creation, participant-flow]
triggers:
  paths: ["**/StudyBuilder/**", "**/study-builder/**", "**/blocks/**", "**/study-creation/**"]
  files: ["*.study.tsx", "*.block.tsx", "*StudyBuilder*", "*Block*"]
  keywords: ["StudyBuilderBlock", "BlockType", "study creation", "block system"]
inherits: [global-context]
---

# Study Builder & Block System Context

You are working on ResearchHub's **Study Builder system** - the core feature that enables researchers to create comprehensive usability testing studies using a modular block-based approach.

## 🧩 **Block-Based Study Architecture**

### **Core Concept**
ResearchHub's unique value proposition is the **modular block system** where:
- **Study** = Sequential collection of blocks that guide participants through research
- **Block** = Self-contained component with specific purpose (welcome, questions, images, ratings)
- **Template** = Pre-configured collections of blocks for common research scenarios

### **13 Available Block Types**

```typescript
type BlockType = 
  | 'welcome'           // Study introduction & participant onboarding
  | 'open_question'     // Qualitative data collection with AI follow-up  
  | 'opinion_scale'     // Quantitative ratings (numerical, stars, emotions)
  | 'simple_input'      // Structured data (text, number, date, email)
  | 'multiple_choice'   // Single/multiple selection with custom options
  | 'context_screen'    // Instructions and transitional information
  | 'yes_no'           // Binary decisions with icon/emotion displays
  | '5_second_test'    // First impression and memory testing
  | 'card_sort'        // Information architecture and categorization
  | 'tree_test'        // Navigation and findability evaluation
  | 'thank_you'        // Study completion and appreciation message
  | 'image_upload'     // Visual content collection from participants
  | 'file_upload'      // Document and file collection from participants
```

### **StudyBuilderBlock Interface**

```typescript
interface StudyBuilderBlock {
  id: string;              // Unique identifier (UUID)
  type: BlockType;         // One of 13 available block types
  order: number;           // Position in study sequence (0-based)
  title: string;           // Block title (displayed to participants)
  description: string;     // Block description (internal/researcher use)
  settings: Record<string, unknown>; // Block-specific configuration
  created_at?: string;     // Timestamp (optional)
  updated_at?: string;     // Timestamp (optional)
}
```

## 🏗️ **Study Creation Flow**

### **Multi-Step Creation Process**
1. **Study Type Selection** (`StudyTypeSelectionModal`)
   - Unmoderated Study (self-guided participant experience)
   - Moderated Interviews (researcher-facilitated sessions)

2. **Template Selection** (`TemplateSelectionModal`)  
   - Browse pre-configured block collections
   - Start from scratch option
   - Template preview with block breakdown

3. **Template Preview** (`StudyPreviewModal`)
   - Preview participant experience
   - Understand study structure and flow
   - Block-by-block breakdown

4. **Study Builder** (`StudyBuilderPage`)
   - Drag & drop block reordering
   - Block library for adding new blocks
   - Individual block configuration
   - Real-time study preview

### **Key Study Builder Components**

```typescript
// Main study builder interface
StudyBuilderPage.tsx        // Primary study creation interface
DragDropBlockList.tsx       // Visual block reordering with drag & drop
BlockLibraryModal.tsx       // Block type selection and addition
BlockEditModal.tsx          // Individual block configuration
StudyPreviewModal.tsx       // Preview participant experience

// Block-specific components  
BlockRenderer.tsx           // Renders different block types
BlockCard.tsx              // Individual block display in builder
BlockSettings.tsx          // Block-specific settings panels
```

## ⚙️ **Block Development Patterns**

### **Block Display Names**
```typescript
const getBlockDisplayName = (type: BlockType): string => {
  const displayNames: Record<BlockType, string> = {
    'welcome': 'Welcome Screen',
    'open_question': 'Open Question',
    'opinion_scale': 'Opinion Scale',
    'simple_input': 'Simple Input',
    'multiple_choice': 'Multiple Choice',
    'context_screen': 'Context Screen', 
    'yes_no': 'Yes/No Question',
    '5_second_test': '5-Second Test',
    'card_sort': 'Card Sort',
    'tree_test': 'Tree Test',
    'thank_you': 'Thank You',
    'image_upload': 'Image Upload',
    'file_upload': 'File Upload'
  };
  return displayNames[type];
};
```

### **Default Block Settings**
```typescript
const getDefaultBlockSettings = (type: BlockType): Record<string, any> => {
  const defaults: Record<BlockType, Record<string, any>> = {
    'welcome': {
      showProgress: true,
      allowSkip: false,
      backgroundImage: null
    },
    'open_question': {
      maxCharacters: 1000,
      required: true,
      placeholder: 'Please share your thoughts...',
      aiFollowUp: false
    },
    'opinion_scale': {
      scaleType: 'numerical', // 'numerical' | 'stars' | 'emotions'
      min: 1,
      max: 10,
      step: 1,
      labels: { min: 'Strongly Disagree', max: 'Strongly Agree' }
    },
    // ... other block types
  };
  return defaults[type] || {};
};
```

### **Block Validation Rules**
```typescript
const validateBlock = (block: StudyBuilderBlock): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  // Universal validation
  if (!block.title?.trim()) {
    errors.push('Block title is required');
  }
  
  // Block-specific validation
  switch (block.type) {
    case 'opinion_scale':
      const settings = block.settings as OpinionScaleSettings;
      if (settings.min >= settings.max) {
        errors.push('Minimum value must be less than maximum value');
      }
      break;
      
    case '5_second_test':
      if (!block.settings.imageUrl) {
        errors.push('5-second test requires an image');
      }
      break;
      
    // ... other validations
  }
  
  return { isValid: errors.length === 0, errors };
};
```

## 🎯 **Study Builder Logic**

### **Automatic Thank You Block**
```typescript
// Every study MUST end with a thank you block
const ensureThankYouBlock = (blocks: StudyBuilderBlock[]): StudyBuilderBlock[] => {
  const hasThankYou = blocks.some(block => block.type === 'thank_you');
  
  if (!hasThankYou) {
    const thankYouBlock: StudyBuilderBlock = {
      id: generateUUID(),
      type: 'thank_you',
      order: blocks.length,
      title: 'Thank You!',
      description: 'Study completion message',
      settings: {
        message: 'Thank you for participating in this study!',
        showSummary: true,
        redirectUrl: null
      }
    };
    
    return [...blocks, thankYouBlock];
  }
  
  return blocks;
};
```

### **Block Insertion Logic**
```typescript
// New blocks are inserted BEFORE the thank you block
const insertBlock = (
  blocks: StudyBuilderBlock[], 
  newBlock: StudyBuilderBlock, 
  insertIndex?: number
): StudyBuilderBlock[] => {
  const thankyouIndex = blocks.findIndex(block => block.type === 'thank_you');
  
  // If no specific index provided, insert before thank you
  const targetIndex = insertIndex ?? (thankyouIndex !== -1 ? thankyouIndex : blocks.length);
  
  // Reorder subsequent blocks
  const updatedBlocks = blocks.map((block, index) => 
    index >= targetIndex ? { ...block, order: block.order + 1 } : block
  );
  
  newBlock.order = targetIndex;
  updatedBlocks.splice(targetIndex, 0, newBlock);
  
  return updatedBlocks;
};
```

### **Drag & Drop Reordering**
```typescript
// Handle block reordering with drag & drop
const handleBlockReorder = (
  blocks: StudyBuilderBlock[],
  dragIndex: number,
  hoverIndex: number
): StudyBuilderBlock[] => {
  // Prevent moving thank you block or moving blocks after it
  const dragBlock = blocks[dragIndex];
  const hoverBlock = blocks[hoverIndex];
  
  if (dragBlock.type === 'thank_you' || hoverBlock.type === 'thank_you') {
    return blocks; // No reordering allowed for thank you block
  }
  
  // Perform the reorder
  const reorderedBlocks = [...blocks];
  const [draggedBlock] = reorderedBlocks.splice(dragIndex, 1);
  reorderedBlocks.splice(hoverIndex, 0, draggedBlock);
  
  // Update order numbers
  return reorderedBlocks.map((block, index) => ({
    ...block,
    order: index
  }));
};
```

## 🎨 **Block-Specific Development Guidelines**

### **Welcome Block**
- Always the first block (order: 0)
- Sets study context and expectations
- Includes progress indicators and skip options
- Can include background images or branding

### **Context Screen Block**
- Provides instructions between sections
- Used for task setup or scenario introduction  
- Can include images, videos, or rich text
- Helps transition between different study phases

### **5-Second Test Block**  
- Requires image upload before configuration
- Implements timer functionality (exactly 5 seconds)
- Collects immediate impressions and recall
- Follow-up questions about memory and understanding

### **Card Sort Block**
- Presents items for categorization
- Supports open card sorting (participant creates categories)  
- Supports closed card sorting (predefined categories)
- Analyzes grouping patterns and similarities

### **Tree Test Block**
- Tests navigation and findability
- Presents hierarchical structure
- Tracks participant paths and success rates
- Identifies navigation pain points

## 📊 **Template System Integration**

### **Template Structure**
```typescript
interface StudyTemplate {
  id: string;
  name: string;
  description: string;
  category: string;           // 'usability' | 'feedback' | 'research'
  blocks: StudyBuilderBlock[]; // Pre-configured block sequence
  estimatedTime: number;      // Minutes
  participantCount: number;   // Recommended sample size
  tags: string[];            // Searchable keywords
}
```

### **Popular Template Categories**
- **Usability Testing**: Task-based testing with prototype evaluation
- **First Impressions**: 5-second tests with follow-up questions  
- **Information Architecture**: Card sorting and tree testing
- **Feedback Collection**: Opinion scales and open questions
- **Comprehensive Research**: Multi-method studies with various block types

## 🚀 **Development Best Practices**

### **When Creating Block Components**
1. **Extend existing patterns** - Don't create new component architectures
2. **Use StudyBuilderBlock interface** - Ensure type safety
3. **Include validation logic** - Both client and server-side
4. **Support preview mode** - Researchers need to preview participant experience
5. **Implement accessibility** - WCAG compliance for all block types
6. **Add analytics tracking** - Track interaction patterns and completion rates

### **When Modifying Study Builder**
1. **Test block reordering** - Ensure drag & drop works correctly
2. **Validate thank you block logic** - Always present at end
3. **Test template integration** - Templates should load correctly
4. **Verify preview functionality** - Participant preview should be accurate
5. **Check mobile responsiveness** - Study builder works on all devices

### **Performance Considerations**
1. **Lazy load block editors** - Only load editing interfaces when needed
2. **Optimize drag & drop** - Use React.memo for block cards
3. **Cache block settings** - Avoid unnecessary re-renders
4. **Debounce auto-save** - Don't save on every keystroke

---

## 💡 **Remember When Working on Study Builder:**

1. **Block system is ResearchHub's unique value** - This is what differentiates us from competitors
2. **Participant experience is paramount** - Every block should provide value to study participants  
3. **Researcher workflow efficiency** - Study creation should be intuitive and fast
4. **Template system drives adoption** - Good templates help researchers get started quickly
5. **Accessibility is non-negotiable** - All blocks must be accessible to participants with disabilities
6. **Analytics inform improvements** - Track how researchers use different block types
7. **Mobile-first design** - Many participants complete studies on mobile devices

The Study Builder is the heart of ResearchHub - make it powerful, intuitive, and delightful for researchers to use!