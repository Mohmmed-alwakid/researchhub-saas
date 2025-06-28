export interface StudyTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  blocks: StudyBuilderBlock[];
  usage_count?: number;
  created_at?: string;
  is_premium?: boolean;
  preview_image?: string;
  estimated_duration?: number;
}

export interface StudyBuilderBlock {
  id: string;
  type: BlockType;
  order: number;
  title: string;
  description: string;
  settings: Record<string, unknown>;
}

export type BlockType = 
  | 'welcome_screen'
  | 'open_question'
  | 'opinion_scale'
  | 'simple_input'
  | 'multiple_choice'
  | 'context_screen'
  | 'yes_no'
  | 'five_second_test'
  | 'card_sort'
  | 'tree_test'
  | 'thank_you'
  | 'image_upload'
  | 'file_upload';

export interface StudyFormData {
  title: string;
  description: string;
  type: 'usability_test' | 'interview' | 'survey' | 'card_sort' | 'tree_test';
  target_participants: number;
  duration?: number;
  include_audio?: boolean;
  research_objectives?: string[];
  instructions?: string;
  template_id?: string;
  blocks: StudyBuilderBlock[];
}

export interface WizardStep {
  id: string;
  title: string;
  description: string;
  component: React.ComponentType<StepProps>;
}

export interface StepProps {
  formData: StudyFormData;
  onUpdateFormData: (updates: Partial<StudyFormData>) => void;
  onNext: () => void;
  onPrevious: () => void;
  isFirst: boolean;
  isLast: boolean;
  validationErrors?: Record<string, string>;
  isLoading?: boolean;
  onValidationChange?: (isValid: boolean) => void;
  canProceed?: boolean;
}

export interface BlockLibraryItem {
  type: BlockType;
  name: string;
  description: string;
  icon: string;
  category: 'input' | 'display' | 'assessment' | 'collection';
}

export const BLOCK_LIBRARY: BlockLibraryItem[] = [
  {
    type: 'welcome_screen',
    name: 'Welcome Screen',
    description: 'Introduce participants to your study with a friendly welcome message',
    icon: '👋',
    category: 'display'
  },
  {
    type: 'open_question',
    name: 'Open Question',
    description: 'Collect detailed qualitative feedback with text responses',
    icon: '💭',
    category: 'input'
  },
  {
    type: 'opinion_scale',
    name: 'Opinion Scale',
    description: 'Gather quantitative ratings using numerical or visual scales',
    icon: '📊',
    category: 'assessment'
  },
  {
    type: 'simple_input',
    name: 'Simple Input',
    description: 'Collect structured data like names, emails, or numbers',
    icon: '📝',
    category: 'input'
  },
  {
    type: 'multiple_choice',
    name: 'Multiple Choice',
    description: 'Present options for single or multiple selection responses',
    icon: '☑️',
    category: 'input'
  },
  {
    type: 'context_screen',
    name: 'Context Screen',
    description: 'Provide instructions or transitional information',
    icon: 'ℹ️',
    category: 'display'
  },
  {
    type: 'yes_no',
    name: 'Yes/No Question',
    description: 'Ask binary questions with clear yes or no responses',
    icon: '✅',
    category: 'input'
  },
  {
    type: 'five_second_test',
    name: '5-Second Test',
    description: 'Test first impressions and immediate recall',
    icon: '⏱️',
    category: 'assessment'
  },
  {
    type: 'card_sort',
    name: 'Card Sort',
    description: 'Understand how users categorize and organize information',
    icon: '🗂️',
    category: 'assessment'
  },
  {
    type: 'tree_test',
    name: 'Tree Test',
    description: 'Evaluate navigation and information findability',
    icon: '🌳',
    category: 'assessment'
  },
  {
    type: 'image_upload',
    name: 'Image Upload',
    description: 'Allow participants to upload images or screenshots',
    icon: '🖼️',
    category: 'collection'
  },
  {
    type: 'file_upload',
    name: 'File Upload',
    description: 'Collect documents and files from participants',
    icon: '📎',
    category: 'collection'
  },
  {
    type: 'thank_you',
    name: 'Thank You',
    description: 'End the study with appreciation and completion message',
    icon: '🙏',
    category: 'display'
  }
];

// Helper functions
export const getBlockDisplayName = (type: BlockType): string => {
  const block = BLOCK_LIBRARY.find(b => b.type === type);
  return block?.name || type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

export const getDefaultBlockDescription = (type: BlockType): string => {
  const descriptions = {
    welcome_screen: 'Welcome participants to your study',
    open_question: 'Ask an open-ended question',
    opinion_scale: 'Rate on a scale of 1-10',
    simple_input: 'Enter your response',
    multiple_choice: 'Select your answer',
    context_screen: 'Additional information',
    yes_no: 'Please answer yes or no',
    five_second_test: 'View the image for 5 seconds',
    card_sort: 'Sort the cards into categories',
    tree_test: 'Find the information in the structure',
    thank_you: 'Thank you for participating!',
    image_upload: 'Upload an image',
    file_upload: 'Upload a file'
  };
  return descriptions[type] || 'Block description';
};

export const getDefaultBlockSettings = (type: BlockType): Record<string, unknown> => {
  const defaults = {
    welcome_screen: {
      title: 'Welcome to our study',
      message: 'Thank you for participating in our research study.',
      showContinueButton: true
    },
    open_question: {
      question: 'What are your thoughts?',
      placeholder: 'Please share your thoughts here...',
      required: true,
      maxLength: 500
    },
    opinion_scale: {
      question: 'How would you rate this?',
      scaleType: 'numeric',
      minValue: 1,
      maxValue: 10,
      minLabel: 'Poor',
      maxLabel: 'Excellent',
      required: true
    },
    simple_input: {
      question: 'Please provide your input',
      inputType: 'text',
      placeholder: 'Enter your answer',
      required: true,
      validation: {}
    },
    multiple_choice: {
      question: 'Please select an option',
      options: ['Option 1', 'Option 2', 'Option 3'],
      allowMultiple: false,
      required: true,
      randomizeOptions: false
    },
    context_screen: {
      title: 'Instructions',
      content: 'Please read the following instructions carefully.',
      showContinueButton: true
    },
    yes_no: {
      question: 'Do you agree?',
      required: true,
      showIcons: true
    },
    five_second_test: {
      question: 'What do you remember?',
      imageUrl: '',
      displayDuration: 5,
      followUpQuestion: 'What do you remember seeing?'
    },
    card_sort: {
      title: 'Sort these items',
      items: ['Item 1', 'Item 2', 'Item 3'],
      categories: ['Category A', 'Category B'],
      allowNewCategories: true
    },
    tree_test: {
      title: 'Find the information',
      task: 'Where would you look to find...?',
      tree: {
        name: 'Home',
        children: []
      }
    },
    thank_you: {
      title: 'Thank you!',
      message: 'Thank you for participating in our study. Your feedback is valuable.',
      showCompletionCode: false,
      redirectUrl: ''
    },
    image_upload: {
      question: 'Please upload an image',
      acceptedTypes: ['image/jpeg', 'image/png', 'image/gif'],
      maxFileSize: 5242880, // 5MB
      required: true
    },
    file_upload: {
      question: 'Please upload a file',
      acceptedTypes: ['.pdf', '.doc', '.docx', '.txt'],
      maxFileSize: 10485760, // 10MB
      required: true
    }
  };
  
  return defaults[type] || {};
};
