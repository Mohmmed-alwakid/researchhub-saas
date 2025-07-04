// Master Testing Configuration for ResearchHub
// This file centralizes all testing configurations and can be used throughout development cycles

export const testingConfig = {
  // Environment settings
  environments: {
    local: {
      baseUrl: 'http://localhost:5175',
      apiUrl: 'http://localhost:3003',
      database: 'supabase_local'
    },
    staging: {
      baseUrl: 'https://your-staging-url.vercel.app',
      apiUrl: 'https://your-staging-url.vercel.app/api',
      database: 'supabase_staging'
    },
    production: {
      baseUrl: 'https://your-production-url.vercel.app',
      apiUrl: 'https://your-production-url.vercel.app/api',
      database: 'supabase_production'
    }
  },

  // Test user accounts (MANDATORY - use only these)
  testAccounts: {
    participant: {
      email: 'abwanwr77+participant@gmail.com',
      password: 'Testtest123',
      role: 'participant'
    },
    researcher: {
      email: 'abwanwr77+Researcher@gmail.com',
      password: 'Testtest123',
      role: 'researcher'
    },
    admin: {
      email: 'abwanwr77+admin@gmail.com',
      password: 'Testtest123',
      role: 'admin'
    }
  },

  // Test timeouts and settings
  timeouts: {
    default: 10000,
    navigation: 30000,
    api: 5000,
    database: 10000
  },

  // Test data patterns
  testData: {
    studyTitles: [
      'AI Generated Test Study',
      'Usability Testing Research',
      'User Experience Evaluation',
      'Product Feedback Collection',
      'Market Research Survey'
    ],
    studyTypes: ['usability', 'survey', 'interview', 'card-sort'],
    blockTypes: [
      'welcome-screen',
      'open-question',
      'opinion-scale',
      'simple-input',
      'multiple-choice',
      'context-screen',
      'yes-no',
      'five-second-test',
      'card-sort',
      'tree-test',
      'thank-you',
      'image-upload',
      'file-upload'
    ]
  },

  // Performance thresholds
  performance: {
    pageLoadTime: 3000,
    apiResponseTime: 500,
    databaseQueryTime: 1000,
    bundleSize: 1000000 // 1MB
  },

  // Accessibility standards
  accessibility: {
    wcagLevel: 'AA',
    colorContrast: 4.5,
    focusManagement: true,
    keyboardNavigation: true
  },

  // Security test patterns
  security: {
    sqlInjection: ["'; DROP TABLE users; --", "1' OR '1'='1"],
    xss: ["<script>alert('xss')</script>", "javascript:alert('xss')"],
    csrf: true,
    authentication: true
  }
};

export default testingConfig;
