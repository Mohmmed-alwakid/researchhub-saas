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

// Usability block types (focused on usability testing)
export type BlockType = 
  | 'welcome_screen'        // Study introduction
  | 'task_instruction'      // Specific task to complete
  | 'website_navigation'    // Navigate website/app
  | 'rating_scale'         // Rate experience (1-5, 1-10, SUS)
  | 'feedback_collection'   // Open-ended feedback
  | 'comparison_test'       // A/B testing blocks
  | 'completion_check'      // Task completion verification
  | 'thank_you_screen';     // Study completion

// Enhanced study types according to requirements - simplified to two types
export type StudyType = 'usability' | 'interview';

export interface StudyFormData {
  title?: string;
  description?: string;
  type?: StudyType;
  target_participants?: number;
  duration?: number;
  include_audio?: boolean;
  research_objectives?: string[];
  instructions?: string;
  template_id?: string;
  blocks?: StudyBuilderBlock[];
  // Interview-specific fields
  interview_session_config?: InterviewSessionConfig;
  // Usability-specific fields  
  usability_config?: UsabilityConfig;
}

// Interview session configuration
export interface InterviewSessionConfig {
  type: 'live_interview';
  duration_minutes: number;
  recording: {
    enabled: boolean;
    audio: boolean;
    video: boolean;
    screen_share: boolean;
    consent_required: boolean;
  };
  interview_script: {
    introduction: string;
    questions: InterviewQuestion[];
    conclusion: string;
  };
  scheduling: {
    buffer_time_minutes: number;
    available_slots: string[];
    auto_confirm: boolean;
    reminder_settings: {
      email_24h: boolean;
      email_1h: boolean;
      sms_15min: boolean;
    };
  };
}

// Interview question structure
export interface InterviewQuestion {
  id: string;
  text: string;
  type: 'open_ended' | 'behavioral' | 'scenario' | 'follow_up';
  time_allocation_minutes: number;
  follow_up_prompts?: string[];
}

// Usability study configuration
export interface UsabilityConfig {
  website_url?: string;
  recording_settings: {
    screen_recording: boolean;
    click_tracking: boolean;
    time_tracking: boolean;
    error_tracking: boolean;
  };
  completion_criteria: {
    min_tasks_completed: number;
    auto_submit: boolean;
  };
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
    description: 'Introduce participants to your usability study with clear instructions',
    icon: '👋',
    category: 'display'
  },
  {
    type: 'task_instruction',
    name: 'Task Instructions',
    description: 'Provide specific tasks for participants to complete on your website or app',
    icon: '�',
    category: 'display'
  },
  {
    type: 'website_navigation',
    name: 'Website Navigation',
    description: 'Guide users through specific navigation tasks on your website or application',
    icon: '🌐',
    category: 'assessment'
  },
  {
    type: 'rating_scale',
    name: 'Rating Scale',
    description: 'Collect satisfaction, difficulty, or usability ratings (1-5, 1-10, SUS)',
    icon: '⭐',
    category: 'assessment'
  },
  {
    type: 'feedback_collection',
    name: 'Feedback Collection',
    description: 'Gather open-ended feedback about user experience and observations',
    icon: '�',
    category: 'input'
  },
  {
    type: 'comparison_test',
    name: 'A/B Comparison',
    description: 'Present two options for participants to compare and evaluate',
    icon: '⚖️',
    category: 'assessment'
  },
  {
    type: 'completion_check',
    name: 'Task Completion Check',
    description: 'Verify whether participants successfully completed the assigned task',
    icon: '✅',
    category: 'assessment'
  },
  {
    type: 'thank_you_screen',
    name: 'Thank You',
    description: 'Complete the study with appreciation and next steps for participants',
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
    welcome_screen: 'Welcome participants to your usability study',
    task_instruction: 'Instructions for a specific task',
    website_navigation: 'Navigate to a specific page or section',
    rating_scale: 'Rate your experience from 1 to 10',
    feedback_collection: 'Share your thoughts and feedback',
    comparison_test: 'Compare two options and choose one',
    completion_check: 'Did you successfully complete the task?',
    thank_you_screen: 'Thank you for participating!'
  };
  return descriptions[type] || 'Block description';
};

export const getDefaultBlockSettings = (type: BlockType): Record<string, unknown> => {
  const defaults = {
    welcome_screen: {
      title: 'Welcome to our usability study',
      message: 'Thank you for participating in our usability research. Your feedback will help us improve our product.',
      showContinueButton: true
    },
    task_instruction: {
      title: 'Task Instructions',
      instruction: 'Please complete the following task:',
      task: 'Navigate to the homepage and find the contact information.',
      timeLimit: 0, // 0 means no time limit
      successCriteria: 'Successfully locate and view contact information'
    },
    website_navigation: {
      title: 'Navigation Task',
      startUrl: 'https://example.com',
      targetUrl: 'https://example.com/contact',
      instruction: 'Navigate to the contact page',
      trackClicks: true,
      trackTime: true
    },
    rating_scale: {
      question: 'How would you rate the ease of completing this task?',
      scaleType: 'numeric',
      minValue: 1,
      maxValue: 10,
      minLabel: 'Very Difficult',
      maxLabel: 'Very Easy',
      required: true
    },
    feedback_collection: {
      question: 'Please share your thoughts about this task',
      placeholder: 'Describe your experience, any difficulties you encountered, or suggestions for improvement...',
      required: false,
      maxLength: 1000
    },
    comparison_test: {
      title: 'Compare These Options',
      question: 'Which option do you prefer?',
      optionA: {
        title: 'Option A',
        description: 'First option',
        imageUrl: ''
      },
      optionB: {
        title: 'Option B', 
        description: 'Second option',
        imageUrl: ''
      },
      required: true
    },
    completion_check: {
      question: 'Were you able to successfully complete the task?',
      options: ['Yes, completed successfully', 'Partially completed', 'Could not complete'],
      required: true,
      followUpQuestion: 'Please explain:'
    },
    thank_you_screen: {
      title: 'Thank you for your participation!',
      message: 'Your feedback is valuable and will help us improve our product. We appreciate the time you spent on this usability study.',
      showCompletionCode: false,
      redirectUrl: ''
    }
  };
  
  return defaults[type] || {};
};
