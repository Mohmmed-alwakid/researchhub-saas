// Predefined onboarding tours for different user roles

export const researcherOnboardingTour = {
  tourId: 'researcher-onboarding',
  steps: [
    {
      id: 'welcome',
      target: '[data-tour="dashboard-overview"]',
      title: 'Welcome to ResearchHub!',
      content: 'This is your researcher dashboard. Here you can see an overview of all your studies, recent activity, and quick actions.',
      position: 'bottom' as const
    },
    {
      id: 'create-study',
      target: '[data-tour="create-study-button"]',
      title: 'Create Your First Study',
      content: 'Click here to start creating a research study. You can choose from templates or build from scratch using our block-based builder.',
      position: 'bottom' as const
    },
    {
      id: 'studies-nav',
      target: '[data-tour="studies-nav"]',
      title: 'Manage Your Studies',
      content: 'Access all your studies here. View active studies, drafts, and completed research projects.',
      position: 'right' as const
    },
    {
      id: 'templates-nav',
      target: '[data-tour="templates-nav"]',
      title: 'Study Templates',
      content: 'Browse pre-configured templates for common research scenarios like usability testing, user interviews, and feedback collection.',
      position: 'right' as const
    },
    {
      id: 'participants-nav',
      target: '[data-tour="participants-nav"]',
      title: 'Participant Management',
      content: 'Review applications, approve participants, and track study completion. Manage your participant pool here.',
      position: 'right' as const
    },
    {
      id: 'help-center',
      target: '[data-tour="help-button"]',
      title: 'Get Help Anytime',
      content: 'Access our comprehensive help center, guides, and tutorials. We\'re here to help you succeed!',
      position: 'left' as const
    }
  ]
};

export const participantOnboardingTour = {
  tourId: 'participant-onboarding',
  steps: [
    {
      id: 'welcome',
      target: '[data-tour="participant-dashboard"]',
      title: 'Welcome to ResearchHub!',
      content: 'This is your participant dashboard. Track your applications, view completed studies, and find new research opportunities.',
      position: 'bottom' as const
    },
    {
      id: 'discover-studies',
      target: '[data-tour="discover-nav"]',
      title: 'Discover Studies',
      content: 'Browse available research studies and find ones that match your interests. Filter by category, duration, and rewards.',
      position: 'right' as const
    },
    {
      id: 'applications',
      target: '[data-tour="my-applications"]',
      title: 'Track Your Applications',
      content: 'View all your study applications in one place. See pending, approved, and completed studies.',
      position: 'bottom' as const
    },
    {
      id: 'profile',
      target: '[data-tour="settings-nav"]',
      title: 'Manage Your Profile',
      content: 'Update your profile information, preferences, and notification settings to get relevant study recommendations.',
      position: 'right' as const
    },
    {
      id: 'help',
      target: '[data-tour="help-button"]',
      title: 'Need Help?',
      content: 'Access our help center for guides on participating in studies and getting the most out of ResearchHub.',
      position: 'left' as const
    }
  ]
};

export const studyBuilderTour = {
  tourId: 'study-builder-tour',
  steps: [
    {
      id: 'overview',
      target: '[data-tour="study-builder-canvas"]',
      title: 'Study Builder Canvas',
      content: 'This is where you build your study. Add blocks, arrange them in order, and configure each block\'s settings.',
      position: 'top' as const
    },
    {
      id: 'block-library',
      target: '[data-tour="add-block-button"]',
      title: 'Add Study Blocks',
      content: 'Click here to open the block library. Choose from 13 different block types including questions, scales, tests, and more.',
      position: 'right' as const
    },
    {
      id: 'drag-drop',
      target: '[data-tour="block-list"]',
      title: 'Reorder Blocks',
      content: 'Drag and drop blocks to change the order of your study. Participants will experience the study in this sequence.',
      position: 'right' as const
    },
    {
      id: 'block-edit',
      target: '[data-tour="block-item"]',
      title: 'Configure Blocks',
      content: 'Click on any block to edit its settings, customize questions, and configure specific behavior.',
      position: 'left' as const
    },
    {
      id: 'preview',
      target: '[data-tour="preview-button"]',
      title: 'Preview Your Study',
      content: 'See exactly what participants will experience. Test the flow and make adjustments before launching.',
      position: 'bottom' as const
    },
    {
      id: 'launch',
      target: '[data-tour="launch-button"]',
      title: 'Launch Your Study',
      content: 'When you\'re ready, click here to launch your study and start collecting valuable research data!',
      position: 'bottom' as const
    }
  ]
};
