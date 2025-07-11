#!/usr/bin/env node

/**
 * TEST DATA GENERATOR
 * 
 * Generates realistic test data for ResearchHub testing
 * Creates synthetic users, studies, applications, and other test data
 * 
 * Features:
 * - Realistic user profiles with varied demographics
 * - Diverse study scenarios and configurations
 * - Authentic application responses and feedback
 * - Configurable data volume and complexity
 * - Data validation and integrity checks
 * - Export to multiple formats (JSON, CSV, SQL)
 * 
 * Usage:
 * node test-data-generator.js [command] [options]
 * 
 * Commands:
 * - generate: Generate new test data
 * - reset: Reset test data to clean state
 * - validate: Validate existing test data
 * - export: Export test data to files
 */

const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

// Test Data Configuration
const DATA_CONFIG = {
  users: {
    participants: 20,
    researchers: 5,
    admins: 2
  },
  studies: {
    active: 10,
    draft: 5,
    completed: 8,
    archived: 3
  },
  applications: {
    perStudy: 15,
    statusDistribution: {
      pending: 0.3,
      approved: 0.4,
      rejected: 0.2,
      completed: 0.1
    }
  },
  responses: {
    perApplication: 12,
    completionRate: 0.75
  }
};

// Data Templates
const USER_TEMPLATES = {
  firstNames: [
    'Alex', 'Jamie', 'Taylor', 'Jordan', 'Morgan', 'Casey', 'Riley', 'Avery',
    'Skyler', 'Quinn', 'Sage', 'River', 'Phoenix', 'Rowan', 'Finley', 'Reese',
    'Emerson', 'Marlowe', 'Hadley', 'Elliot', 'Kendall', 'Teagan', 'Brynn',
    'Remy', 'Shay', 'Lennox', 'Kai', 'Ari', 'Blake', 'Cameron'
  ],
  lastNames: [
    'Anderson', 'Brown', 'Chen', 'Davis', 'Evans', 'Foster', 'Garcia', 'Hall',
    'Ibrahim', 'Johnson', 'Kim', 'Lopez', 'Miller', 'Nguyen', 'O\'Brien', 'Patel',
    'Quinn', 'Rodriguez', 'Smith', 'Thompson', 'Umar', 'Vega', 'Wilson', 'Xavier',
    'Young', 'Zhang', 'Adams', 'Baker', 'Carter', 'Diaz'
  ],
  domains: [
    'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'icloud.com',
    'protonmail.com', 'fastmail.com', 'zoho.com'
  ],
  locations: [
    'New York, NY', 'Los Angeles, CA', 'Chicago, IL', 'Houston, TX', 'Phoenix, AZ',
    'Philadelphia, PA', 'San Antonio, TX', 'San Diego, CA', 'Dallas, TX', 'San Jose, CA',
    'Austin, TX', 'Jacksonville, FL', 'Fort Worth, TX', 'Columbus, OH', 'Charlotte, NC',
    'San Francisco, CA', 'Indianapolis, IN', 'Seattle, WA', 'Denver, CO', 'Washington, DC',
    'Boston, MA', 'El Paso, TX', 'Nashville, TN', 'Detroit, MI', 'Oklahoma City, OK',
    'Portland, OR', 'Las Vegas, NV', 'Memphis, TN', 'Louisville, KY', 'Baltimore, MD'
  ],
  occupations: [
    'Software Developer', 'Marketing Manager', 'Teacher', 'Nurse', 'Accountant',
    'Designer', 'Engineer', 'Consultant', 'Analyst', 'Sales Representative',
    'Project Manager', 'Writer', 'Researcher', 'Administrator', 'Technician',
    'Coordinator', 'Specialist', 'Assistant', 'Director', 'Supervisor'
  ],
  ages: [22, 25, 28, 31, 34, 37, 40, 43, 46, 49, 52, 55, 58, 61, 64],
  interests: [
    'Technology', 'Health & Wellness', 'Education', 'Travel', 'Food & Cooking',
    'Sports & Fitness', 'Arts & Crafts', 'Music', 'Reading', 'Gaming',
    'Photography', 'Gardening', 'Movies & TV', 'Fashion', 'Finance',
    'Environment', 'Social Causes', 'Entrepreneurship', 'Science', 'History'
  ]
};

const STUDY_TEMPLATES = {
  types: [
    'User Testing', 'Survey Research', 'Interview Study', 'Focus Group', 'A/B Testing',
    'Usability Testing', 'Market Research', 'Behavioral Study', 'Feedback Collection',
    'Product Evaluation', 'Concept Testing', 'Card Sorting', 'Tree Testing',
    'First Click Testing', '5-Second Test'
  ],
  categories: [
    'Technology', 'Healthcare', 'Education', 'E-commerce', 'Finance', 'Entertainment',
    'Travel', 'Food & Beverage', 'Automotive', 'Real Estate', 'Fashion', 'Sports',
    'Non-profit', 'Government', 'Retail', 'Media', 'Gaming', 'Social Media',
    'B2B Software', 'Mobile Apps'
  ],
  industries: [
    'Technology', 'Healthcare', 'Financial Services', 'Retail', 'Education',
    'Manufacturing', 'Media & Entertainment', 'Government', 'Non-profit',
    'Automotive', 'Real Estate', 'Travel & Hospitality', 'Food & Beverage',
    'Energy', 'Telecommunications', 'Consulting', 'Construction', 'Agriculture',
    'Transportation', 'Pharmaceuticals'
  ],
  objectives: [
    'Improve user experience', 'Increase conversion rates', 'Reduce bounce rate',
    'Enhance navigation', 'Optimize checkout process', 'Validate design concepts',
    'Gather user feedback', 'Test new features', 'Identify pain points',
    'Measure satisfaction', 'Compare alternatives', 'Understand user behavior',
    'Validate assumptions', 'Improve accessibility', 'Reduce task completion time'
  ],
  titles: [
    'Website Usability Study', 'Mobile App Testing', 'Product Feedback Research',
    'User Experience Evaluation', 'Navigation Testing', 'Checkout Process Study',
    'Feature Validation Research', 'Design Concept Testing', 'User Journey Analysis',
    'Accessibility Evaluation', 'Content Strategy Research', 'Information Architecture Study',
    'Interaction Design Testing', 'Voice Interface Study', 'Cross-platform Usability'
  ]
};

const BLOCK_TEMPLATES = {
  types: [
    'welcome', 'open-question', 'opinion-scale', 'simple-input', 'multiple-choice',
    'context-screen', 'yes-no', '5-second-test', 'card-sort', 'tree-test',
    'thank-you', 'image-upload', 'file-upload'
  ],
  questions: {
    'open-question': [
      'What is your overall impression of this website?',
      'How would you describe your experience using this application?',
      'What improvements would you suggest for this product?',
      'What challenges did you face while completing this task?',
      'How does this compare to similar products you\'ve used?'
    ],
    'opinion-scale': [
      'How satisfied are you with this product?',
      'How likely are you to recommend this to a friend?',
      'How easy was it to complete your task?',
      'How would you rate the overall design?',
      'How clear were the instructions?'
    ],
    'simple-input': [
      'What is your age?',
      'How many years of experience do you have?',
      'What is your primary email address?',
      'In what city do you live?',
      'What is your job title?'
    ],
    'multiple-choice': [
      'Which of these best describes your role?',
      'How often do you use similar products?',
      'What device did you use to complete this task?',
      'Which feature is most important to you?',
      'How did you hear about this product?'
    ],
    'yes-no': [
      'Would you use this product again?',
      'Did you find what you were looking for?',
      'Was the checkout process clear?',
      'Would you recommend this to others?',
      'Did you encounter any errors?'
    ]
  }
};

// Data Generator Class
class TestDataGenerator {
  constructor() {
    this.dataDir = path.join(__dirname, 'test-data');
    this.generatedData = {
      users: [],
      studies: [],
      applications: [],
      responses: [],
      blocks: []
    };
  }

  async initialize() {
    await fs.mkdir(this.dataDir, { recursive: true });
  }

  // Utility Functions
  randomChoice(array) {
    return array[Math.floor(Math.random() * array.length)];
  }

  randomChoices(array, count) {
    const shuffled = [...array].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

  randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  randomFloat(min, max, decimals = 2) {
    return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
  }

  generateId() {
    return crypto.randomUUID();
  }

  generateDate(daysAgo = 0, daysInFuture = 30) {
    const start = new Date();
    start.setDate(start.getDate() - daysAgo);
    const end = new Date();
    end.setDate(end.getDate() + daysInFuture);
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  }

  // User Generation
  generateUser(role = 'participant') {
    const firstName = this.randomChoice(USER_TEMPLATES.firstNames);
    const lastName = this.randomChoice(USER_TEMPLATES.lastNames);
    const domain = this.randomChoice(USER_TEMPLATES.domains);
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${domain}`;
    
    const baseUser = {
      id: this.generateId(),
      email,
      firstName,
      lastName,
      role,
      status: 'active',
      emailVerified: true,
      createdAt: this.generateDate(90, 0),
      updatedAt: this.generateDate(30, 0),
      lastLoginAt: this.generateDate(7, 0)
    };

    // Add role-specific fields
    if (role === 'participant') {
      return {
        ...baseUser,
        profile: {
          age: this.randomChoice(USER_TEMPLATES.ages),
          location: this.randomChoice(USER_TEMPLATES.locations),
          occupation: this.randomChoice(USER_TEMPLATES.occupations),
          interests: this.randomChoices(USER_TEMPLATES.interests, this.randomInt(3, 6)),
          experience: this.randomChoice(['Beginner', 'Intermediate', 'Advanced', 'Expert']),
          devicePreference: this.randomChoice(['Desktop', 'Mobile', 'Tablet', 'No preference']),
          availability: this.randomChoice(['Weekdays', 'Weekends', 'Evenings', 'Flexible'])
        },
        preferences: {
          notifications: Math.random() > 0.3,
          marketingEmails: Math.random() > 0.5,
          studyReminders: Math.random() > 0.2,
          feedbackRequests: Math.random() > 0.4
        }
      };
    } else if (role === 'researcher') {
      return {
        ...baseUser,
        profile: {
          organization: this.randomChoice([
            'TechCorp Research Lab', 'Innovation Institute', 'Design Studio Plus',
            'User Experience Agency', 'Product Development Co', 'Research Solutions Inc',
            'Digital Strategy Group', 'Human-Centered Design Lab'
          ]),
          title: this.randomChoice([
            'UX Researcher', 'Product Manager', 'Design Lead', 'Research Director',
            'User Experience Designer', 'Product Owner', 'Research Analyst'
          ]),
          industry: this.randomChoice(STUDY_TEMPLATES.industries),
          experience: this.randomChoice(['2-5 years', '5-10 years', '10+ years']),
          specialization: this.randomChoices([
            'Usability Testing', 'User Interviews', 'Survey Research', 'A/B Testing',
            'Analytics', 'Behavioral Research', 'Design Thinking', 'Prototyping'
          ], this.randomInt(2, 4))
        }
      };
    } else if (role === 'admin') {
      return {
        ...baseUser,
        profile: {
          title: 'Platform Administrator',
          department: this.randomChoice(['Engineering', 'Operations', 'Product', 'Support']),
          permissions: [
            'user_management', 'study_management', 'system_configuration',
            'analytics_access', 'support_tools', 'audit_logs'
          ]
        }
      };
    }

    return baseUser;
  }

  generateUsers() {
    console.log('👥 Generating users...');
    
    // Generate participants
    for (let i = 0; i < DATA_CONFIG.users.participants; i++) {
      this.generatedData.users.push(this.generateUser('participant'));
    }

    // Generate researchers
    for (let i = 0; i < DATA_CONFIG.users.researchers; i++) {
      this.generatedData.users.push(this.generateUser('researcher'));
    }

    // Generate admins
    for (let i = 0; i < DATA_CONFIG.users.admins; i++) {
      this.generatedData.users.push(this.generateUser('admin'));
    }

    console.log(`✅ Generated ${this.generatedData.users.length} users`);
  }

  // Study Generation
  generateStudy(status = 'active') {
    const type = this.randomChoice(STUDY_TEMPLATES.types);
    const category = this.randomChoice(STUDY_TEMPLATES.categories);
    const industry = this.randomChoice(STUDY_TEMPLATES.industries);
    const researchers = this.generatedData.users.filter(u => u.role === 'researcher');
    const researcher = this.randomChoice(researchers);

    const study = {
      id: this.generateId(),
      title: this.randomChoice(STUDY_TEMPLATES.titles),
      description: this.generateStudyDescription(type, category),
      type,
      category,
      industry,
      status,
      researcherId: researcher.id,
      researcherName: `${researcher.firstName} ${researcher.lastName}`,
      organization: researcher.profile.organization,
      objectives: this.randomChoices(STUDY_TEMPLATES.objectives, this.randomInt(2, 4)),
      targetAudience: this.generateTargetAudience(),
      compensation: this.generateCompensation(),
      duration: this.generateDuration(),
      requirements: this.generateRequirements(),
      timeline: this.generateTimeline(status),
      blocks: this.generateStudyBlocks(),
      settings: {
        maxParticipants: this.randomInt(20, 100),
        autoApprove: Math.random() > 0.5,
        allowMultipleApplications: Math.random() > 0.8,
        requireScreening: Math.random() > 0.6,
        sendReminders: Math.random() > 0.3
      },
      createdAt: this.generateDate(60, 0),
      updatedAt: this.generateDate(30, 0)
    };

    return study;
  }

  generateStudyDescription(type, category) {
    const descriptions = {
      'User Testing': `We're conducting user testing for a ${category.toLowerCase()} application to understand how users interact with key features and identify areas for improvement.`,
      'Survey Research': `This survey research focuses on ${category.toLowerCase()} preferences and behaviors to inform product development and marketing strategies.`,
      'Interview Study': `We're conducting interviews with ${category.toLowerCase()} users to gain deep insights into their needs, motivations, and pain points.`,
      'Focus Group': `Join our focus group discussion about ${category.toLowerCase()} products and services to share your opinions and experiences.`,
      'A/B Testing': `We're testing different versions of our ${category.toLowerCase()} interface to determine which performs better for users.`
    };

    return descriptions[type] || `Research study focusing on ${category.toLowerCase()} user experience and behavior patterns.`;
  }

  generateTargetAudience() {
    const audiences = [
      'Adults aged 25-45 with online shopping experience',
      'College students and recent graduates',
      'Working professionals in technology',
      'Parents with children under 18',
      'Small business owners and entrepreneurs',
      'Mobile app users aged 18-35',
      'Frequent travelers and vacation planners',
      'Health and wellness enthusiasts',
      'Financial services customers',
      'E-learning platform users'
    ];

    return this.randomChoice(audiences);
  }

  generateCompensation() {
    const amounts = [10, 15, 20, 25, 30, 35, 40, 50, 75, 100];
    const methods = ['PayPal', 'Gift Card', 'Bank Transfer', 'Cash', 'Store Credit'];
    
    return {
      amount: this.randomChoice(amounts),
      method: this.randomChoice(methods),
      currency: 'USD'
    };
  }

  generateDuration() {
    const durations = [
      { estimated: '10-15 minutes', actual: this.randomInt(8, 18) },
      { estimated: '15-20 minutes', actual: this.randomInt(12, 25) },
      { estimated: '20-30 minutes', actual: this.randomInt(18, 35) },
      { estimated: '30-45 minutes', actual: this.randomInt(28, 50) },
      { estimated: '45-60 minutes', actual: this.randomInt(40, 65) }
    ];

    return this.randomChoice(durations);
  }

  generateRequirements() {
    const requirements = [
      'Must be 18 years or older',
      'Previous experience with similar products',
      'Regular internet user',
      'Comfortable using mobile devices',
      'Native English speaker',
      'No prior participation in similar studies',
      'Access to desktop/laptop computer',
      'Stable internet connection',
      'Available for follow-up questions',
      'Willing to share screen during session'
    ];

    return this.randomChoices(requirements, this.randomInt(3, 6));
  }

  generateTimeline(status) {
    const now = new Date();
    const timeline = {};

    if (status === 'draft') {
      timeline.createdAt = this.generateDate(30, 0);
      timeline.expectedLaunch = this.generateDate(0, 14);
    } else if (status === 'active') {
      timeline.createdAt = this.generateDate(45, 0);
      timeline.launchedAt = this.generateDate(30, 0);
      timeline.expectedCompletion = this.generateDate(0, 21);
    } else if (status === 'completed') {
      timeline.createdAt = this.generateDate(90, 0);
      timeline.launchedAt = this.generateDate(75, 0);
      timeline.completedAt = this.generateDate(30, 0);
    } else if (status === 'archived') {
      timeline.createdAt = this.generateDate(120, 0);
      timeline.launchedAt = this.generateDate(105, 0);
      timeline.completedAt = this.generateDate(60, 0);
      timeline.archivedAt = this.generateDate(30, 0);
    }

    return timeline;
  }

  generateStudyBlocks() {
    const blockCount = this.randomInt(5, 12);
    const blocks = [];

    // Always start with welcome block
    blocks.push({
      id: this.generateId(),
      type: 'welcome',
      order: 0,
      title: 'Welcome to Our Study',
      description: 'Thank you for participating in our research study.',
      settings: {
        showProgress: true,
        allowSkip: false
      }
    });

    // Add random blocks
    for (let i = 1; i < blockCount - 1; i++) {
      const blockType = this.randomChoice(BLOCK_TEMPLATES.types.filter(t => t !== 'welcome' && t !== 'thank-you'));
      const questions = BLOCK_TEMPLATES.questions[blockType] || [];
      
      blocks.push({
        id: this.generateId(),
        type: blockType,
        order: i,
        title: questions.length > 0 ? this.randomChoice(questions) : `${blockType} Block`,
        description: this.generateBlockDescription(blockType),
        settings: this.generateBlockSettings(blockType)
      });
    }

    // Always end with thank you block
    blocks.push({
      id: this.generateId(),
      type: 'thank-you',
      order: blockCount - 1,
      title: 'Thank You!',
      description: 'Your participation is greatly appreciated.',
      settings: {
        showResults: Math.random() > 0.5,
        allowDownload: Math.random() > 0.7
      }
    });

    return blocks;
  }

  generateBlockDescription(blockType) {
    const descriptions = {
      'open-question': 'Please provide your detailed thoughts and feedback.',
      'opinion-scale': 'Rate your experience on a scale from 1 to 5.',
      'simple-input': 'Please provide the requested information.',
      'multiple-choice': 'Select the option that best applies to you.',
      'yes-no': 'Please answer yes or no to the following question.',
      '5-second-test': 'You\'ll see an image for 5 seconds, then answer questions.',
      'card-sort': 'Organize the cards into categories that make sense to you.',
      'tree-test': 'Find the specified item in the menu structure.'
    };

    return descriptions[blockType] || 'Please complete this section.';
  }

  generateBlockSettings(blockType) {
    const baseSettings = {
      required: Math.random() > 0.2,
      allowSkip: Math.random() > 0.7
    };

    const typeSpecificSettings = {
      'opinion-scale': {
        ...baseSettings,
        scaleType: this.randomChoice(['numeric', 'stars', 'emoji']),
        minValue: 1,
        maxValue: this.randomChoice([5, 7, 10]),
        showLabels: Math.random() > 0.3
      },
      'multiple-choice': {
        ...baseSettings,
        allowMultiple: Math.random() > 0.6,
        randomizeOrder: Math.random() > 0.4,
        showOther: Math.random() > 0.3
      },
      '5-second-test': {
        ...baseSettings,
        displayTime: 5,
        showTimer: Math.random() > 0.5
      },
      'simple-input': {
        ...baseSettings,
        inputType: this.randomChoice(['text', 'number', 'email', 'url', 'date']),
        maxLength: this.randomInt(50, 500)
      }
    };

    return typeSpecificSettings[blockType] || baseSettings;
  }

  generateStudies() {
    console.log('📊 Generating studies...');
    
    const statuses = [
      { status: 'active', count: DATA_CONFIG.studies.active },
      { status: 'draft', count: DATA_CONFIG.studies.draft },
      { status: 'completed', count: DATA_CONFIG.studies.completed },
      { status: 'archived', count: DATA_CONFIG.studies.archived }
    ];

    for (const { status, count } of statuses) {
      for (let i = 0; i < count; i++) {
        this.generatedData.studies.push(this.generateStudy(status));
      }
    }

    console.log(`✅ Generated ${this.generatedData.studies.length} studies`);
  }

  // Application Generation
  generateApplication(study) {
    const participants = this.generatedData.users.filter(u => u.role === 'participant');
    const participant = this.randomChoice(participants);
    
    const statusOptions = Object.keys(DATA_CONFIG.applications.statusDistribution);
    const status = this.randomChoice(statusOptions);

    return {
      id: this.generateId(),
      studyId: study.id,
      studyTitle: study.title,
      participantId: participant.id,
      participantName: `${participant.firstName} ${participant.lastName}`,
      participantEmail: participant.email,
      status,
      appliedAt: this.generateDate(study.timeline.launchedAt ? 30 : 60, 0),
      ...(status !== 'pending' && { reviewedAt: this.generateDate(20, 0) }),
      ...(status === 'completed' && { completedAt: this.generateDate(10, 0) }),
      responses: status === 'approved' || status === 'completed' ? 
        this.generateApplicationResponses(study) : [],
      feedback: this.generateApplicationFeedback(status),
      metadata: {
        userAgent: this.randomChoice([
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
          'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36'
        ]),
        ipAddress: this.generateIpAddress(),
        referrer: this.randomChoice(['direct', 'search', 'social', 'email', 'referral']),
        device: this.randomChoice(['desktop', 'mobile', 'tablet'])
      }
    };
  }

  generateApplicationResponses(study) {
    const responses = [];
    const shouldComplete = Math.random() < DATA_CONFIG.responses.completionRate;
    const completionRate = shouldComplete ? 1 : Math.random() * 0.8;
    const blocksToComplete = Math.floor(study.blocks.length * completionRate);

    for (let i = 0; i < blocksToComplete; i++) {
      const block = study.blocks[i];
      responses.push({
        blockId: block.id,
        blockType: block.type,
        response: this.generateBlockResponse(block),
        timestamp: this.generateDate(15, 0),
        timeSpent: this.randomInt(5, 120) // seconds
      });
    }

    return responses;
  }

  generateBlockResponse(block) {
    switch (block.type) {
      case 'open-question':
        return {
          text: this.generateOpenQuestionResponse()
        };
      
      case 'opinion-scale':
        return {
          rating: this.randomInt(1, block.settings.maxValue || 5),
          comment: Math.random() > 0.7 ? this.generateShortComment() : null
        };
      
      case 'simple-input':
        return {
          value: this.generateSimpleInputValue(block.settings.inputType)
        };
      
      case 'multiple-choice':
        return {
          selected: block.settings.allowMultiple ? 
            this.randomChoices(['Option A', 'Option B', 'Option C', 'Option D'], this.randomInt(1, 3)) :
            this.randomChoice(['Option A', 'Option B', 'Option C', 'Option D'])
        };
      
      case 'yes-no':
        return {
          answer: this.randomChoice(['yes', 'no']),
          comment: Math.random() > 0.8 ? this.generateShortComment() : null
        };
      
      case '5-second-test':
        return {
          responses: [
            'I remember seeing the main navigation menu',
            'There was a large hero image',
            'The color scheme was blue and white'
          ].slice(0, this.randomInt(1, 3))
        };
      
      default:
        return {
          completed: true,
          timestamp: new Date().toISOString()
        };
    }
  }

  generateOpenQuestionResponse() {
    const responses = [
      'The interface is intuitive and easy to navigate. I particularly liked the clean design and clear call-to-action buttons.',
      'Overall good experience, but I had some trouble finding the search function. Maybe make it more prominent?',
      'The checkout process was smooth and straightforward. I appreciated the progress indicator.',
      'Some pages loaded a bit slowly, but the content was helpful and well-organized.',
      'Great visual design! The colors and typography work well together. Navigation could be improved.',
      'I found everything I was looking for quickly. The site structure makes sense.',
      'The mobile experience was excellent. Everything worked as expected on my phone.',
      'Product descriptions were detailed and helpful. Images were high quality.',
      'The registration process was simple and didn\'t ask for too much information.',
      'I liked the personalized recommendations. They seemed relevant to my interests.'
    ];

    return this.randomChoice(responses);
  }

  generateShortComment() {
    const comments = [
      'Could be better', 'Works well', 'Needs improvement', 'Very satisfied',
      'Somewhat confusing', 'Easy to use', 'Impressive design', 'Good overall',
      'Minor issues', 'Exceeded expectations', 'Room for improvement', 'Well done'
    ];

    return this.randomChoice(comments);
  }

  generateSimpleInputValue(inputType) {
    switch (inputType) {
      case 'number':
        return this.randomInt(1, 100);
      case 'email':
        return `user${this.randomInt(1, 1000)}@example.com`;
      case 'url':
        return `https://example${this.randomInt(1, 100)}.com`;
      case 'date':
        return this.generateDate(365, 0).toISOString().split('T')[0];
      default:
        return this.randomChoice([
          'Software Engineer', 'Marketing Manager', 'Product Designer',
          'Data Analyst', 'Project Manager', 'UX Researcher'
        ]);
    }
  }

  generateApplicationFeedback(status) {
    const feedback = {
      rating: null,
      comment: null,
      wouldRecommend: null
    };

    if (status === 'completed') {
      feedback.rating = this.randomInt(3, 5);
      feedback.wouldRecommend = Math.random() > 0.3;
      
      if (Math.random() > 0.4) {
        const comments = [
          'Great study, well organized and clear instructions.',
          'Interesting questions, made me think about my usage patterns.',
          'Quick and easy to complete, compensation was fair.',
          'Good variety of question types kept it engaging.',
          'Would participate in similar studies in the future.'
        ];
        feedback.comment = this.randomChoice(comments);
      }
    }

    return feedback;
  }

  generateIpAddress() {
    return `${this.randomInt(1, 255)}.${this.randomInt(1, 255)}.${this.randomInt(1, 255)}.${this.randomInt(1, 255)}`;
  }

  generateApplications() {
    console.log('📝 Generating applications...');
    
    const activeStudies = this.generatedData.studies.filter(s => s.status === 'active' || s.status === 'completed');
    
    for (const study of activeStudies) {
      const applicationCount = this.randomInt(
        Math.floor(DATA_CONFIG.applications.perStudy * 0.5),
        DATA_CONFIG.applications.perStudy
      );
      
      for (let i = 0; i < applicationCount; i++) {
        this.generatedData.applications.push(this.generateApplication(study));
      }
    }

    console.log(`✅ Generated ${this.generatedData.applications.length} applications`);
  }

  // Data Export Functions
  async exportData() {
    console.log('💾 Exporting test data...');
    
    // Export individual data types
    for (const [type, data] of Object.entries(this.generatedData)) {
      const filename = `${type}.json`;
      const filepath = path.join(this.dataDir, filename);
      await fs.writeFile(filepath, JSON.stringify(data, null, 2));
      console.log(`✅ Exported ${data.length} ${type} to ${filename}`);
    }

    // Export combined data
    const combinedPath = path.join(this.dataDir, 'combined.json');
    await fs.writeFile(combinedPath, JSON.stringify(this.generatedData, null, 2));
    console.log(`✅ Exported combined data to combined.json`);

    // Export summary
    const summary = {
      generatedAt: new Date().toISOString(),
      counts: {
        users: this.generatedData.users.length,
        studies: this.generatedData.studies.length,
        applications: this.generatedData.applications.length,
        responses: this.generatedData.applications.reduce((sum, app) => sum + app.responses.length, 0)
      },
      breakdown: {
        usersByRole: this.getUsersByRole(),
        studiesByStatus: this.getStudiesByStatus(),
        applicationsByStatus: this.getApplicationsByStatus()
      }
    };

    const summaryPath = path.join(this.dataDir, 'summary.json');
    await fs.writeFile(summaryPath, JSON.stringify(summary, null, 2));
    console.log(`✅ Exported summary to summary.json`);

    return summary;
  }

  getUsersByRole() {
    const roleCount = {};
    this.generatedData.users.forEach(user => {
      roleCount[user.role] = (roleCount[user.role] || 0) + 1;
    });
    return roleCount;
  }

  getStudiesByStatus() {
    const statusCount = {};
    this.generatedData.studies.forEach(study => {
      statusCount[study.status] = (statusCount[study.status] || 0) + 1;
    });
    return statusCount;
  }

  getApplicationsByStatus() {
    const statusCount = {};
    this.generatedData.applications.forEach(app => {
      statusCount[app.status] = (statusCount[app.status] || 0) + 1;
    });
    return statusCount;
  }

  // Data Validation
  async validateData() {
    console.log('🔍 Validating test data...');
    
    const issues = [];

    // Validate users
    const userEmails = new Set();
    this.generatedData.users.forEach(user => {
      if (userEmails.has(user.email)) {
        issues.push(`Duplicate email: ${user.email}`);
      }
      userEmails.add(user.email);

      if (!user.id || !user.email || !user.firstName || !user.lastName) {
        issues.push(`Invalid user data: ${user.id}`);
      }
    });

    // Validate studies
    this.generatedData.studies.forEach(study => {
      if (!study.id || !study.title || !study.researcherId) {
        issues.push(`Invalid study data: ${study.id}`);
      }

      const researcher = this.generatedData.users.find(u => u.id === study.researcherId);
      if (!researcher) {
        issues.push(`Study ${study.id} references non-existent researcher: ${study.researcherId}`);
      }
    });

    // Validate applications
    this.generatedData.applications.forEach(app => {
      if (!app.id || !app.studyId || !app.participantId) {
        issues.push(`Invalid application data: ${app.id}`);
      }

      const study = this.generatedData.studies.find(s => s.id === app.studyId);
      if (!study) {
        issues.push(`Application ${app.id} references non-existent study: ${app.studyId}`);
      }

      const participant = this.generatedData.users.find(u => u.id === app.participantId);
      if (!participant) {
        issues.push(`Application ${app.id} references non-existent participant: ${app.participantId}`);
      }
    });

    if (issues.length === 0) {
      console.log('✅ All data validation checks passed');
    } else {
      console.log(`❌ Found ${issues.length} validation issues:`);
      issues.forEach(issue => console.log(`   • ${issue}`));
    }

    return issues;
  }

  // Main Generation Method
  async generateAll() {
    console.log('🎲 Generating comprehensive test data...');
    console.log('═'.repeat(60));

    await this.initialize();
    
    this.generateUsers();
    this.generateStudies();
    this.generateApplications();
    
    const summary = await this.exportData();
    const issues = await this.validateData();

    console.log('\n📊 GENERATION SUMMARY');
    console.log('═'.repeat(60));
    console.log(`👥 Users: ${summary.counts.users}`);
    console.log(`📊 Studies: ${summary.counts.studies}`);
    console.log(`📝 Applications: ${summary.counts.applications}`);
    console.log(`💬 Responses: ${summary.counts.responses}`);
    console.log(`🔍 Validation Issues: ${issues.length}`);
    console.log('═'.repeat(60));

    return summary;
  }

  async reset() {
    console.log('🗑️  Resetting test data...');
    
    try {
      await fs.rmdir(this.dataDir, { recursive: true });
      await this.initialize();
      console.log('✅ Test data reset complete');
    } catch (error) {
      console.error('❌ Error resetting test data:', error.message);
    }
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'generate';
  
  const generator = new TestDataGenerator();
  
  switch (command) {
    case 'generate':
      await generator.generateAll();
      break;
      
    case 'reset':
      await generator.reset();
      break;
      
    case 'validate':
      await generator.initialize();
      // Load existing data if available
      try {
        const combinedPath = path.join(generator.dataDir, 'combined.json');
        const existingData = JSON.parse(await fs.readFile(combinedPath, 'utf-8'));
        generator.generatedData = existingData;
        await generator.validateData();
      } catch (error) {
        console.log('⚠️  No existing data found to validate');
      }
      break;
      
    case 'export':
      await generator.initialize();
      try {
        const combinedPath = path.join(generator.dataDir, 'combined.json');
        const existingData = JSON.parse(await fs.readFile(combinedPath, 'utf-8'));
        generator.generatedData = existingData;
        await generator.exportData();
      } catch (error) {
        console.log('⚠️  No existing data found to export');
      }
      break;
      
    default:
      console.log('🎲 Test Data Generator');
      console.log('');
      console.log('Available commands:');
      console.log('  generate  # Generate new test data');
      console.log('  reset     # Reset test data to clean state');
      console.log('  validate  # Validate existing test data');
      console.log('  export    # Export test data to files');
      console.log('');
      console.log('Usage: node test-data-generator.js [command]');
  }
}

// Export for use as module
module.exports = { TestDataGenerator, DATA_CONFIG };

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}
