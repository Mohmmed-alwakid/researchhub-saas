// Enhanced study templates based on Maze analysis
import { 
  EnhancedStudyTemplate, 
  TemplateVariable, 
  TemplateCategory,
  BaseBlock,
  BlockType
} from '../types/index';

// Simplified template block interface for easier template creation
export interface TemplateBlock {
  id: string;
  type: BlockType;
  order: number;
  settings: Record<string, unknown>;
  conditionalLogic?: Record<string, unknown>;
}

// Helper function to convert template blocks to BaseBlocks
function createBaseBlock(templateBlock: TemplateBlock): BaseBlock {
  const settings = templateBlock.settings as Record<string, unknown>;
  return {
    id: templateBlock.id,
    type: templateBlock.type,
    order: templateBlock.order,
    title: (settings.title as string) || (settings.question as string) || `${templateBlock.type} block`,
    description: (settings.description as string) || '',
    isRequired: (settings.required as boolean) || false,
    settings: templateBlock.settings,
    conditionalLogic: undefined, // Will be properly implemented later
    analytics: {
      trackInteractions: true,
      trackTiming: true,
      trackDropoff: true,
      customEvents: [],
      heatmapTracking: false
    },
    metadata: {
      category: 'template',
      complexity: 'beginner' as const,
      estimatedDuration: 2,
      tags: [],
      version: '1.0.0',
      author: 'template-system',
      lastModified: new Date()
    },
    createdAt: new Date(),
    updatedAt: new Date()
  };
}

// Helper function to convert template blocks array to BaseBlocks array
function convertTemplateBlocks(templateBlocks: TemplateBlock[]): BaseBlock[] {
  return templateBlocks.map(createBaseBlock);
}

// Enhanced template interface that uses TemplateBlocks
interface EnhancedStudyTemplateDefinition extends Omit<EnhancedStudyTemplate, 'blocks'> {
  templateBlocks: TemplateBlock[];
}

// Method to get BaseBlocks from template
export function getTemplateBlocks(template: EnhancedStudyTemplateDefinition): BaseBlock[] {
  return convertTemplateBlocks(template.templateBlocks);
}

// Variable definitions for template customization
export const COMMON_VARIABLES: Record<string, TemplateVariable> = {
  PRODUCT: {
    key: 'PRODUCT',
    label: 'Product Name',
    defaultValue: 'your product',
    placeholder: 'e.g., Your App Name',
    required: true,
    type: 'text'
  },
  FEATURE: {
    key: 'FEATURE',
    label: 'Feature Name',
    defaultValue: 'this feature',
    placeholder: 'e.g., Shopping Cart',
    required: true,
    type: 'text'
  },
  WEBSITE: {
    key: 'WEBSITE',
    label: 'Website URL',
    defaultValue: 'https://example.com',
    placeholder: 'https://yourwebsite.com',
    required: true,
    type: 'url'
  },
  COMPANY: {
    key: 'COMPANY',
    label: 'Company Name',
    defaultValue: 'our company',
    placeholder: 'e.g., Your Company',
    required: false,
    type: 'text'
  },
  TASK: {
    key: 'TASK',
    label: 'Task Description',
    defaultValue: 'complete your goal',
    placeholder: 'e.g., make a purchase',
    required: true,
    type: 'text'
  }
};

// Enhanced template definitions based on Maze analysis
export const ENHANCED_STUDY_TEMPLATES: EnhancedStudyTemplateDefinition[] = [
  {
    id: 'usability-testing-new-product',
    name: 'Usability Testing a New Product',
    description: 'Validate usability across your wireframes and prototypes with real users early on. Use this pre-built template to capture valuable feedback on accessibility and user experience so you can see what\'s working (and what isn\'t).',
    category: 'usability-testing',
    categoryType: 'usability-testing',
    subcategory: 'Product Testing',
    benefits: [
      'Identify usability issues early in development',
      'Understand user behavior patterns',
      'Validate design decisions with real user feedback',
      'Reduce development costs by catching issues early'
    ],
    whenToUse: 'When you have wireframes or prototypes ready for user validation and want to test usability before final development.',
    insights: [
      'User familiarity with your product type',
      'Usage frequency and engagement patterns', 
      'Task completion effectiveness',
      'User expectations and mental models',
      'Areas for improvement and optimization'
    ],    estimatedTime: '10-15 minutes',
    recommendedParticipants: '15-30 users',
    variables: [COMMON_VARIABLES.PRODUCT, COMMON_VARIABLES.TASK],
    templateBlocks: [
      {
        id: 'welcome-1',
        type: 'welcome',
        order: 1,
        settings: {
          title: 'Welcome to our [PRODUCT] usability study',
          message: 'Thank you for participating! We\'ll be testing the usability of [PRODUCT] and your feedback will help us improve the user experience.',
          autoAdvance: false,
          showContinueButton: true
        }
      },
      {
        id: 'experience-check',
        type: 'yes_no',
        order: 2,
        settings: {
          question: 'Have you used [PRODUCT] before?',
          yesLabel: 'Yes',
          noLabel: 'No',
          required: true
        }
      },
      {
        id: 'usage-frequency',
        type: 'multiple_choice',
        order: 3,
        settings: {
          question: 'If yes, how often do you use [PRODUCT] per week?',
          options: [
            'This is my first time',
            '1-2 times per week',
            '3-5 times per week',
            'Daily',
            'Multiple times per day'
          ],
          allowMultiple: false,
          required: true,
          conditionalLogic: {
            showIf: 'experience-check.answer === "yes"'
          }
        }
      },
      {
        id: 'prototype-test',
        type: 'prototype_test',
        order: 4,
        settings: {
          instruction: 'Imagine you were trying to [TASK] using [PRODUCT]. Please interact with the prototype below.',
          prototypeUrl: '[WEBSITE]',
          allowScreenRecording: true,
          timeLimit: 300,
          taskDescription: '[TASK]'
        }
      },
      {
        id: 'expectations',
        type: 'open_question',
        order: 5,
        settings: {
          question: 'What would you expect to happen once you\'ve completed [TASK]?',
          placeholder: 'Please describe your expectations...',
          maxLength: 500,
          required: true
        }
      },
      {
        id: 'final-thoughts',
        type: 'open_question',
        order: 6,
        settings: {
          question: 'Do you have any final thoughts on what you saw today?',
          placeholder: 'Any additional feedback...',
          maxLength: 300,
          required: false
        }
      },
      {
        id: 'thank-you',
        type: 'thank_you',
        order: 7,
        settings: {
          title: 'Thank you for your feedback!',
          message: 'Your insights will help us improve [PRODUCT] for everyone.',
          showSocialShare: false,
          redirectUrl: null
        }
      }
    ],
    metadata: {
      estimatedDuration: 15,
      participantCount: 25,
      difficulty: 'beginner' as const,
      studyTypes: ['usability', 'prototype'],
      tags: ['usability', 'product-testing', 'early-stage', 'validation'],
      author: 'ResearchHub Team',
      version: '1.0.0',
      lastModified: new Date()
    },
    usage: {
      usageCount: 0,
      popularity: 0.9,
      rating: 4.8,
      reviews: []
    },
    customization: {
      allowCustomization: true,
      customizableBlocks: ['welcome-1', 'experience-check', 'usage-frequency', 'prototype-test', 'expectations'],
      requiredBlocks: ['welcome-1', 'prototype-test', 'thank-you']
    }
  },
  
  {
    id: 'feature-insights-collection',
    name: 'Collect Insights on Features',
    description: 'Get an accurate reading on how your features measure up with users. Gather usability feedback quickly so you can make the right changes—faster.',
    category: 'usability-testing',
    categoryType: 'usability-testing',
    subcategory: 'Feature Evaluation',
    benefits: [
      'Measure feature usability and satisfaction',
      'Identify areas for improvement',
      'Compare feature performance',
      'Gather quantitative and qualitative insights'
    ],
    whenToUse: 'When you want to evaluate specific features and understand how well they meet user needs and expectations.',
    insights: [
      'Feature ease of use ratings',
      'Performance and reliability feedback',
      'Task completion success rates',
      'User satisfaction levels',
      'Specific improvement recommendations'
    ],    estimatedTime: '8-12 minutes',
    recommendedParticipants: '20-40 users',
    variables: [COMMON_VARIABLES.FEATURE, COMMON_VARIABLES.PRODUCT],
    templateBlocks: [
      {
        id: 'welcome-2',
        type: 'welcome',
        order: 1,
        settings: {
          title: 'Help us improve [FEATURE]',
          message: 'We value your opinion! This study will help us understand how [FEATURE] in [PRODUCT] works for users like you.',
          autoAdvance: false,
          showContinueButton: true
        }
      },
      {
        id: 'ease-of-use',
        type: 'opinion_scale',
        order: 2,
        settings: {
          question: 'How easy to use is [FEATURE]?',
          scaleType: 'stars',
          minLabel: 'Very difficult',
          maxLabel: 'Very easy',
          min: 1,
          max: 5,
          required: true
        }
      },
      {
        id: 'reliability',
        type: 'multiple_choice',
        order: 3,
        settings: {
          question: 'How reliable is the performance of [FEATURE]?',
          options: [
            'Always works as expected',
            'Usually works well',
            'Sometimes has issues',
            'Often doesn\'t work properly',
            'Never works as expected'
          ],
          allowMultiple: false,
          required: true
        }
      },
      {
        id: 'task-completion',
        type: 'yes_no',
        order: 4,
        settings: {
          question: 'Were you able to accomplish what you used [FEATURE] for?',
          yesLabel: 'Yes, completely',
          noLabel: 'No, I had difficulties',
          required: true
        }
      },
      {
        id: 'satisfaction',
        type: 'opinion_scale',
        order: 5,
        settings: {
          question: 'How satisfied are you with [FEATURE]?',
          scaleType: 'emoji',
          minLabel: 'Very unsatisfied',
          maxLabel: 'Very satisfied',
          min: 1,
          max: 5,
          required: true
        }
      },
      {
        id: 'thank-you-2',
        type: 'thank_you',
        order: 6,
        settings: {
          title: 'Thank you for your valuable feedback!',
          message: 'Your insights help us make [FEATURE] better for everyone.',
          showSocialShare: false,
          redirectUrl: null
        }
      }
    ],
    metadata: {
      estimatedDuration: 10,
      participantCount: 30,
      difficulty: 'beginner' as const,
      studyTypes: ['survey', 'feedback'],
      tags: ['feature-testing', 'satisfaction', 'usability', 'feedback'],
      author: 'ResearchHub Team',
      version: '1.0.0',
      lastModified: new Date()
    },
    usage: {
      usageCount: 0,
      popularity: 0.85,
      rating: 4.6,
      reviews: []
    },
    customization: {
      allowCustomization: true,
      customizableBlocks: ['welcome-2', 'ease-of-use', 'reliability', 'satisfaction'],
      requiredBlocks: ['ease-of-use', 'satisfaction', 'thank-you-2']
    }
  },

  {
    id: 'cta-placement-testing',
    name: 'Test CTA Placement',
    description: 'Are your call-to-actions optimized across your product and website? With this CTA placement template, you can gather valuable feedback to help you map out the most effective positioning for your audience to take action.',
    category: 'content-testing',
    categoryType: 'content-testing',
    subcategory: 'CTA Optimization',
    benefits: [
      'Optimize call-to-action placement',
      'Understand user attention patterns',
      'Improve conversion rates',
      'Test different CTA designs and positions'
    ],
    whenToUse: 'When you want to test the effectiveness of your call-to-action buttons, links, or other conversion elements.',
    insights: [
      'First impression and attention patterns',
      'CTA visibility and clarity',
      'User understanding of desired actions',
      'Memory and recall of key elements',
      'Optimization recommendations'
    ],    estimatedTime: '5-8 minutes',
    recommendedParticipants: '25-50 users',
    variables: [COMMON_VARIABLES.WEBSITE],
    templateBlocks: [
      {
        id: 'welcome-3',
        type: 'welcome',
        order: 1,
        settings: {
          title: 'CTA Placement Study',
          message: 'We\'re testing how well our website communicates its main actions. Your quick feedback will help us improve the user experience.',
          autoAdvance: false,
          showContinueButton: true
        }
      },
      {
        id: 'five-second-test',
        type: 'five_second_test',
        order: 2,
        settings: {
          websiteUrl: '[WEBSITE]',
          duration: 5,
          instruction: 'You will see a webpage for 5 seconds. Pay attention to what you see and remember as much as you can.'
        }
      },
      {
        id: 'action-recall',
        type: 'open_question',
        order: 3,
        settings: {
          question: 'What action was the webpage asking you to take?',
          placeholder: 'Describe the main action or call-to-action you noticed...',
          maxLength: 200,
          required: true
        }
      },
      {
        id: 'general-recall',
        type: 'open_question',
        order: 4,
        settings: {
          question: 'What else do you remember from the webpage?',
          placeholder: 'Any other elements, text, or features you noticed...',
          maxLength: 300,
          required: false
        }
      },
      {
        id: 'thank-you-3',
        type: 'thank_you',
        order: 5,
        settings: {
          title: 'Perfect! Thank you for your time.',
          message: 'Your feedback helps us create better user experiences.',
          showSocialShare: false,
          redirectUrl: null
        }
      }
    ],
    metadata: {
      estimatedDuration: 7,
      participantCount: 35,
      difficulty: 'beginner' as const,
      studyTypes: ['content-testing', '5-second-test'],
      tags: ['cta', 'conversion', 'first-impression', 'website-testing'],
      author: 'ResearchHub Team',
      version: '1.0.0',
      lastModified: new Date()
    },
    usage: {
      usageCount: 0,
      popularity: 0.8,
      rating: 4.7,
      reviews: []
    },
    customization: {
      allowCustomization: true,
      customizableBlocks: ['five-second-test', 'action-recall', 'general-recall'],
      requiredBlocks: ['five-second-test', 'action-recall', 'thank-you-3']
    }
  },

  {
    id: 'nps-feedback-survey',
    name: 'Get Fast NPS Feedback',
    description: 'With this survey template, you\'ll gather valuable, qualitative insights that add context to your net promoter score and help you understand customer satisfaction and brand perception.',
    category: 'feedback-survey',
    categoryType: 'feedback-survey',
    subcategory: 'Customer Satisfaction',
    benefits: [
      'Measure customer loyalty and satisfaction',
      'Understand reasons behind NPS scores',
      'Identify improvement opportunities',
      'Gather actionable customer feedback'
    ],
    whenToUse: 'When you want to measure customer satisfaction and understand the drivers behind customer loyalty and recommendations.',
    insights: [
      'Net Promoter Score and loyalty metrics',
      'Reasons behind satisfaction levels',
      'Feature usage and preferences',
      'Improvement opportunities',
      'Customer sentiment and feedback'
    ],    estimatedTime: '6-10 minutes',
    recommendedParticipants: '50-100 users',
    variables: [COMMON_VARIABLES.PRODUCT, COMMON_VARIABLES.COMPANY],
    templateBlocks: [
      {
        id: 'welcome-4',
        type: 'welcome',
        order: 1,
        settings: {
          title: 'We value your feedback!',
          message: 'Help us improve [PRODUCT] by sharing your experience. This quick survey will take just a few minutes.',
          autoAdvance: false,
          showContinueButton: true
        }
      },
      {
        id: 'nps-score',
        type: 'opinion_scale',
        order: 2,
        settings: {
          question: 'On a scale of 0 to 10, how likely are you to recommend [COMPANY] to a friend or colleague?',
          scaleType: 'number',
          minLabel: 'Not at all likely',
          maxLabel: 'Extremely likely',
          min: 0,
          max: 10,
          required: true
        }
      },
      {
        id: 'nps-reason',
        type: 'open_question',
        order: 3,
        settings: {
          question: 'What is the primary reason for your score?',
          placeholder: 'Please explain your rating...',
          maxLength: 400,
          required: true
        }
      },
      {
        id: 'improvement-suggestion',
        type: 'open_question',
        order: 4,
        settings: {
          question: 'What\'s the one thing we could do to make [PRODUCT] better?',
          placeholder: 'Your suggestion for improvement...',
          maxLength: 300,
          required: false
        }
      },
      {
        id: 'feature-usage',
        type: 'multiple_choice',
        order: 5,
        settings: {
          question: 'Which features do you use the most?',
          options: [
            'Core functionality',
            'Advanced features',
            'Collaboration tools',
            'Reporting and analytics',
            'Mobile features',
            'Integrations'
          ],
          allowMultiple: true,
          required: true
        }
      },
      {
        id: 'missing-features',
        type: 'yes_no',
        order: 6,
        settings: {
          question: 'Is anything missing from your experience?',
          yesLabel: 'Yes, something is missing',
          noLabel: 'No, it meets my needs',
          required: true
        }
      },
      {
        id: 'additional-feedback',
        type: 'open_question',
        order: 7,
        settings: {
          question: 'Any further thoughts or feedback you\'d like to note?',
          placeholder: 'Additional comments...',
          maxLength: 400,
          required: false
        }
      },
      {
        id: 'thank-you-4',
        type: 'thank_you',
        order: 8,
        settings: {
          title: 'Thank you for your valuable feedback!',
          message: 'Your insights help us continue improving [PRODUCT] for customers like you.',
          showSocialShare: true,
          redirectUrl: null
        }
      }
    ],
    metadata: {
      estimatedDuration: 8,
      participantCount: 75,
      difficulty: 'beginner' as const,
      studyTypes: ['survey', 'feedback', 'nps'],
      tags: ['nps', 'customer-satisfaction', 'feedback', 'loyalty'],
      author: 'ResearchHub Team',
      version: '1.0.0',
      lastModified: new Date()
    },
    usage: {
      usageCount: 0,
      popularity: 0.95,
      rating: 4.9,
      reviews: []
    },
    customization: {
      allowCustomization: true,
      customizableBlocks: ['nps-score', 'nps-reason', 'improvement-suggestion', 'feature-usage'],
      requiredBlocks: ['nps-score', 'nps-reason', 'thank-you-4']
    }
  }
];

// Template categories constant for UI
export const TEMPLATE_CATEGORIES = [
  {
    value: 'usability-testing' as const,
    label: 'Usability Testing',
    icon: '🎯',
    description: 'Test user interactions and task completion'
  },
  {
    value: 'content-testing' as const,
    label: 'Content Testing',
    icon: '📝',
    description: 'Test content effectiveness and clarity'
  },
  {
    value: 'feedback-survey' as const,
    label: 'Feedback Survey',
    icon: '💬',
    description: 'Gather opinions and suggestions from users'
  },
  {
    value: 'user-interviews' as const,
    label: 'User Interviews',
    icon: '🎤',
    description: 'Conduct in-depth user interviews'
  },
  {
    value: 'concept-validation' as const,
    label: 'Concept Validation',
    icon: '🧪',
    description: 'Validate ideas and early-stage designs'
  }
];

// Helper function to replace variables in template content
export function replaceTemplateVariables(
  content: string, 
  variables: Record<string, string>
): string {
  let result = content;
  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(`\\[${key}\\]`, 'g');
    result = result.replace(regex, value);
  });
  return result;
}

// Helper function to convert template definition to EnhancedStudyTemplate
function convertTemplateDefinition(template: EnhancedStudyTemplateDefinition): EnhancedStudyTemplate {
  return {
    ...template,
    blocks: convertTemplateBlocks(template.templateBlocks)
  };
}

// Helper function to get templates by category
export function getTemplatesByCategory(category: TemplateCategory): EnhancedStudyTemplate[] {
  return ENHANCED_STUDY_TEMPLATES
    .filter(template => template.categoryType === category)
    .map(convertTemplateDefinition);
}

// Helper function to get template by ID
export function getTemplateById(id: string): EnhancedStudyTemplate | undefined {
  const templateDef = ENHANCED_STUDY_TEMPLATES.find(template => template.id === id);
  return templateDef ? convertTemplateDefinition(templateDef) : undefined;
}

// Function to replace variables in template
export function replaceVariablesInTemplate(
  template: EnhancedStudyTemplateDefinition, 
  variables: Record<string, string>
): EnhancedStudyTemplate {
  const processString = (text: string): string => {
    let result = text;
    Object.entries(variables).forEach(([key, value]) => {
      const placeholder = `[${key}]`;
      result = result.replace(new RegExp(placeholder, 'g'), value);
    });
    return result;
  };

  const processedTemplate = JSON.parse(JSON.stringify(template));
  
  // Replace variables in template name and description
  processedTemplate.name = processString(processedTemplate.name);
  processedTemplate.description = processString(processedTemplate.description);
  
  // Replace variables in template blocks
  processedTemplate.templateBlocks = processedTemplate.templateBlocks.map((block: TemplateBlock) => ({
    ...block,
    settings: {
      ...block.settings,
      title: block.settings.title ? processString(block.settings.title as string) : block.settings.title,
      question: block.settings.question ? processString(block.settings.question as string) : block.settings.question,
      message: block.settings.message ? processString(block.settings.message as string) : block.settings.message,
      instruction: block.settings.instruction ? processString(block.settings.instruction as string) : block.settings.instruction
    }
  }));

  return convertTemplateDefinition(processedTemplate);
}
