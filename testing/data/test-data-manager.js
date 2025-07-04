// Test Data Management System
// Generates and manages test data for consistent testing across development cycles

import { testingConfig } from '../config/testing.config.js';

class TestDataManager {
  constructor() {
    this.config = testingConfig;
    this.testData = {
      users: [],
      studies: [],
      blocks: [],
      responses: [],
      applications: []
    };
  }

  // Generate realistic user data
  generateUserData(count = 10) {
    const users = [];
    const roles = ['researcher', 'participant', 'admin'];
    const domains = ['gmail.com', 'yahoo.com', 'outlook.com', 'company.com'];
    
    for (let i = 0; i < count; i++) {
      const firstName = this.generateFirstName();
      const lastName = this.generateLastName();
      const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}+test${i}@${this.randomChoice(domains)}`;
      
      users.push({
        id: `user_${i + 1}`,
        email: email,
        password: 'TestPassword123',
        firstName: firstName,
        lastName: lastName,
        role: this.randomChoice(roles),
        createdAt: this.generateRandomDate(-30, 0), // Within last 30 days
        lastLogin: this.generateRandomDate(-7, 0), // Within last 7 days
        isActive: Math.random() > 0.1, // 90% active
        profile: {
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${firstName}${lastName}`,
          bio: this.generateBio(),
          location: this.generateLocation(),
          experience: this.randomChoice(['beginner', 'intermediate', 'expert']),
          interests: this.generateInterests()
        }
      });
    }
    
    this.testData.users = users;
    return users;
  }

  // Generate realistic study data
  generateStudyData(count = 20) {
    const studies = [];
    const types = ['usability', 'survey', 'interview', 'card-sort', 'tree-test'];
    const statuses = ['draft', 'active', 'completed', 'archived'];
    
    for (let i = 0; i < count; i++) {
      const type = this.randomChoice(types);
      const title = this.generateStudyTitle(type);
      
      studies.push({
        id: `study_${i + 1}`,
        title: title,
        description: this.generateStudyDescription(type),
        type: type,
        status: this.randomChoice(statuses),
        researcherId: this.randomChoice(this.testData.users.filter(u => u.role === 'researcher')).id,
        createdAt: this.generateRandomDate(-60, 0),
        updatedAt: this.generateRandomDate(-30, 0),
        publishedAt: this.generateRandomDate(-20, 0),
        settings: {
          participantLimit: this.randomInt(5, 50),
          duration: this.randomInt(10, 120), // minutes
          incentive: this.randomChoice(['none', 'points', 'gift_card']),
          isPublic: Math.random() > 0.3, // 70% public
          allowAnonymous: Math.random() > 0.5, // 50% allow anonymous
          requireApproval: Math.random() > 0.4 // 60% require approval
        },
        blocks: this.generateStudyBlocks(type),
        analytics: {
          views: this.randomInt(10, 1000),
          applications: this.randomInt(5, 100),
          completions: this.randomInt(2, 50),
          averageTime: this.randomInt(300, 3600) // seconds
        }
      });
    }
    
    this.testData.studies = studies;
    return studies;
  }

  // Generate study blocks based on type
  generateStudyBlocks(studyType) {
    const blockTemplates = {
      usability: [
        { type: 'welcome-screen', title: 'Welcome to our usability study' },
        { type: 'context-screen', title: 'Task instructions' },
        { type: 'five-second-test', title: 'First impression test' },
        { type: 'open-question', title: 'What was your first impression?' },
        { type: 'opinion-scale', title: 'Rate the overall design' },
        { type: 'thank-you', title: 'Thank you for participating' }
      ],
      survey: [
        { type: 'welcome-screen', title: 'Welcome to our survey' },
        { type: 'multiple-choice', title: 'What is your primary role?' },
        { type: 'opinion-scale', title: 'How satisfied are you with our service?' },
        { type: 'open-question', title: 'What improvements would you suggest?' },
        { type: 'yes-no', title: 'Would you recommend us to others?' },
        { type: 'thank-you', title: 'Thank you for your feedback' }
      ],
      interview: [
        { type: 'welcome-screen', title: 'Welcome to our interview' },
        { type: 'context-screen', title: 'Interview guidelines' },
        { type: 'open-question', title: 'Tell us about your background' },
        { type: 'open-question', title: 'What challenges do you face?' },
        { type: 'open-question', title: 'How do you currently solve these problems?' },
        { type: 'thank-you', title: 'Thank you for your insights' }
      ],
      'card-sort': [
        { type: 'welcome-screen', title: 'Welcome to our card sorting study' },
        { type: 'context-screen', title: 'Card sorting instructions' },
        { type: 'card-sort', title: 'Organize these items into categories' },
        { type: 'open-question', title: 'Explain your categorization logic' },
        { type: 'thank-you', title: 'Thank you for participating' }
      ],
      'tree-test': [
        { type: 'welcome-screen', title: 'Welcome to our tree testing study' },
        { type: 'context-screen', title: 'Tree testing instructions' },
        { type: 'tree-test', title: 'Find the information you need' },
        { type: 'opinion-scale', title: 'How easy was it to find the information?' },
        { type: 'thank-you', title: 'Thank you for participating' }
      ]
    };

    const template = blockTemplates[studyType] || blockTemplates.usability;
    return template.map((block, index) => ({
      ...block,
      id: `block_${index + 1}`,
      order: index + 1,
      settings: this.generateBlockSettings(block.type),
      isRequired: block.type !== 'thank-you',
      timeLimit: block.type === 'five-second-test' ? 5 : null
    }));
  }

  // Generate block settings based on type
  generateBlockSettings(blockType) {
    const baseSettings = {
      'welcome-screen': {
        showContinueButton: true,
        autoAdvance: false,
        backgroundColor: '#ffffff'
      },
      'open-question': {
        placeholder: 'Please share your thoughts...',
        minLength: 10,
        maxLength: 500,
        required: true
      },
      'opinion-scale': {
        min: 1,
        max: 5,
        labels: ['Poor', 'Fair', 'Good', 'Very Good', 'Excellent'],
        required: true
      },
      'multiple-choice': {
        options: ['Option A', 'Option B', 'Option C', 'Option D'],
        allowMultiple: false,
        randomizeOrder: true,
        required: true
      },
      'yes-no': {
        yesLabel: 'Yes',
        noLabel: 'No',
        required: true
      },
      'five-second-test': {
        imageUrl: 'https://via.placeholder.com/800x600',
        duration: 5,
        followUpQuestion: 'What do you remember seeing?'
      },
      'card-sort': {
        cards: ['Card 1', 'Card 2', 'Card 3', 'Card 4', 'Card 5'],
        maxCategories: 5,
        allowNewCategories: true
      },
      'tree-test': {
        tree: {
          'Home': {
            'Products': ['Product A', 'Product B'],
            'Services': ['Service A', 'Service B'],
            'About': ['Team', 'History']
          }
        },
        task: 'Find information about Product A'
      }
    };

    return baseSettings[blockType] || {};
  }

  // Generate participant responses
  generateResponseData(studyId, participantId) {
    const study = this.testData.studies.find(s => s.id === studyId);
    if (!study) return [];

    const responses = [];
    
    study.blocks.forEach(block => {
      if (block.type === 'thank-you' || block.type === 'welcome-screen') return;
      
      const response = {
        id: `response_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        studyId: studyId,
        blockId: block.id,
        participantId: participantId,
        blockType: block.type,
        data: this.generateResponseData(block.type),
        timestamp: new Date().toISOString(),
        timeSpent: this.randomInt(5, 300) // seconds
      };
      
      responses.push(response);
    });
    
    return responses;
  }

  // Generate response data based on block type
  generateResponseData(blockType) {
    const responseGenerators = {
      'open-question': () => ({
        text: this.generateOpenQuestionResponse()
      }),
      'opinion-scale': () => ({
        rating: this.randomInt(1, 5),
        comment: Math.random() > 0.7 ? this.generateShortComment() : null
      }),
      'multiple-choice': () => ({
        selected: ['Option A'], // Would be more dynamic in real implementation
        other: null
      }),
      'yes-no': () => ({
        answer: Math.random() > 0.5 ? 'yes' : 'no',
        comment: Math.random() > 0.8 ? this.generateShortComment() : null
      }),
      'five-second-test': () => ({
        recall: this.generateFiveSecondTestRecall(),
        accuracy: this.randomInt(60, 95) // percentage
      }),
      'card-sort': () => ({
        categories: {
          'Category 1': ['Card 1', 'Card 2'],
          'Category 2': ['Card 3', 'Card 4'],
          'Category 3': ['Card 5']
        }
      }),
      'tree-test': () => ({
        path: ['Home', 'Products', 'Product A'],
        success: Math.random() > 0.3,
        timeToFind: this.randomInt(10, 120)
      })
    };

    return responseGenerators[blockType] ? responseGenerators[blockType]() : {};
  }

  // Generate applications
  generateApplicationData(count = 50) {
    const applications = [];
    const statuses = ['pending', 'approved', 'rejected'];
    
    for (let i = 0; i < count; i++) {
      const participant = this.randomChoice(this.testData.users.filter(u => u.role === 'participant'));
      const study = this.randomChoice(this.testData.studies);
      
      applications.push({
        id: `app_${i + 1}`,
        studyId: study.id,
        participantId: participant.id,
        status: this.randomChoice(statuses),
        appliedAt: this.generateRandomDate(-15, 0),
        reviewedAt: Math.random() > 0.3 ? this.generateRandomDate(-10, 0) : null,
        motivation: this.generateApplicationMotivation(),
        qualifications: this.generateQualifications(),
        estimatedTime: this.randomInt(30, 180), // minutes
        availability: this.generateAvailability()
      });
    }
    
    this.testData.applications = applications;
    return applications;
  }

  // Utility methods for data generation
  generateFirstName() {
    const names = ['Alex', 'Jordan', 'Taylor', 'Morgan', 'Casey', 'Riley', 'Avery', 'Quinn', 'Sage', 'River'];
    return this.randomChoice(names);
  }

  generateLastName() {
    const names = ['Smith', 'Johnson', 'Williams', 'Brown', 'Davis', 'Miller', 'Wilson', 'Moore', 'Taylor', 'Anderson'];
    return this.randomChoice(names);
  }

  generateBio() {
    const bios = [
      'UX designer with 5+ years of experience in user research and design.',
      'Product manager passionate about creating user-centered solutions.',
      'Software developer interested in improving user experiences.',
      'Marketing professional with focus on customer insights.',
      'Student studying human-computer interaction.',
      'Freelance consultant helping businesses understand their users.'
    ];
    return this.randomChoice(bios);
  }

  generateLocation() {
    const locations = ['New York, NY', 'San Francisco, CA', 'London, UK', 'Toronto, CA', 'Berlin, DE', 'Sydney, AU'];
    return this.randomChoice(locations);
  }

  generateInterests() {
    const interests = ['UX Design', 'Product Management', 'User Research', 'Data Analysis', 'Psychology', 'Technology'];
    return this.randomChoices(interests, this.randomInt(2, 4));
  }

  generateStudyTitle(type) {
    const titles = {
      usability: [
        'Website Navigation Usability Study',
        'Mobile App User Experience Research',
        'E-commerce Checkout Process Evaluation',
        'Dashboard Interface Usability Testing'
      ],
      survey: [
        'Customer Satisfaction Survey',
        'Product Feedback Collection',
        'Market Research Survey',
        'User Preference Study'
      ],
      interview: [
        'User Needs Discovery Interview',
        'Customer Journey Interview',
        'Product Requirements Interview',
        'User Behavior Interview'
      ],
      'card-sort': [
        'Information Architecture Card Sort',
        'Menu Structure Organization',
        'Content Categorization Study',
        'Navigation Card Sort'
      ],
      'tree-test': [
        'Website Navigation Tree Test',
        'Information Findability Study',
        'Site Structure Evaluation',
        'Navigation Tree Testing'
      ]
    };
    
    return this.randomChoice(titles[type] || titles.usability);
  }

  generateStudyDescription(type) {
    const descriptions = {
      usability: 'Help us improve our user interface by testing key user flows and providing feedback on your experience.',
      survey: 'Share your opinions and experiences to help us better understand our users and improve our services.',
      interview: 'Participate in a one-on-one interview to share your insights and experiences with our product.',
      'card-sort': 'Help us organize information by sorting cards into categories that make sense to you.',
      'tree-test': 'Test our website navigation by finding specific information using our menu structure.'
    };
    
    return descriptions[type] || descriptions.usability;
  }

  generateOpenQuestionResponse() {
    const responses = [
      'The interface is clean and intuitive, but I found the navigation slightly confusing.',
      'Overall good experience, though some buttons could be more prominent.',
      'I like the design, but the loading times could be improved.',
      'The layout is well-organized, but I would prefer more visual hierarchy.',
      'Good functionality, but the mobile experience needs work.',
      'Very user-friendly design with clear call-to-action buttons.'
    ];
    return this.randomChoice(responses);
  }

  generateShortComment() {
    const comments = [
      'Could be better',
      'Needs improvement',
      'Works well',
      'Very satisfied',
      'Meets expectations',
      'Room for improvement'
    ];
    return this.randomChoice(comments);
  }

  generateFiveSecondTestRecall() {
    const recalls = [
      'I remember seeing a blue header with navigation menu',
      'There was a large hero image with text overlay',
      'I saw multiple product cards in a grid layout',
      'The page had a clean white background with colorful buttons',
      'I noticed a prominent call-to-action button in the center'
    ];
    return this.randomChoice(recalls);
  }

  generateApplicationMotivation() {
    const motivations = [
      'I am interested in UX research and would like to contribute to improving user experiences.',
      'I have experience with similar products and can provide valuable insights.',
      'I am passionate about design and user interfaces.',
      'I would like to help improve products that I might use myself.',
      'I enjoy participating in research studies and providing feedback.'
    ];
    return this.randomChoice(motivations);
  }

  generateQualifications() {
    const qualifications = [
      'Regular user of web applications',
      'Experience with mobile apps',
      'Background in design or UX',
      'Comfortable with technology',
      'Previous research participation',
      'Target demographic user'
    ];
    return this.randomChoices(qualifications, this.randomInt(1, 3));
  }

  generateAvailability() {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const times = ['Morning', 'Afternoon', 'Evening'];
    
    return {
      days: this.randomChoices(days, this.randomInt(2, 5)),
      times: this.randomChoices(times, this.randomInt(1, 3)),
      timezone: 'UTC-5'
    };
  }

  // Utility methods
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

  generateRandomDate(daysAgo, daysFuture) {
    const now = new Date();
    const pastDate = new Date(now.getTime() - (daysAgo * 24 * 60 * 60 * 1000));
    const futureDate = new Date(now.getTime() + (daysFuture * 24 * 60 * 60 * 1000));
    
    const randomTime = pastDate.getTime() + Math.random() * (futureDate.getTime() - pastDate.getTime());
    return new Date(randomTime).toISOString();
  }

  // Generate complete test dataset
  generateCompleteTestData() {
    console.log('🎲 Generating complete test dataset...');
    
    // Generate in order (users first, then studies that reference users, etc.)
    const users = this.generateUserData(20);
    const studies = this.generateStudyData(30);
    const applications = this.generateApplicationData(75);
    
    // Generate responses for approved applications
    const responses = [];
    applications
      .filter(app => app.status === 'approved')
      .forEach(app => {
        const studyResponses = this.generateResponseData(app.studyId, app.participantId);
        responses.push(...studyResponses);
      });
    
    this.testData.responses = responses;
    
    console.log(`Generated test data:
    - Users: ${users.length}
    - Studies: ${studies.length}
    - Applications: ${applications.length}
    - Responses: ${responses.length}`);
    
    return this.testData;
  }

  // Export test data to JSON
  exportTestData() {
    const fs = require('fs');
    const path = require('path');
    
    const exportPath = path.join(process.cwd(), 'testing', 'data', 'test-data.json');
    fs.writeFileSync(exportPath, JSON.stringify(this.testData, null, 2));
    console.log(`📁 Test data exported to: ${exportPath}`);
    
    return exportPath;
  }

  // Load test data from JSON
  loadTestData() {
    const fs = require('fs');
    const path = require('path');
    
    const dataPath = path.join(process.cwd(), 'testing', 'data', 'test-data.json');
    if (fs.existsSync(dataPath)) {
      this.testData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
      console.log('📁 Test data loaded from file');
    } else {
      console.log('📁 No test data file found, generating new data...');
      this.generateCompleteTestData();
    }
    
    return this.testData;
  }

  // Reset test data
  resetTestData() {
    this.testData = {
      users: [],
      studies: [],
      blocks: [],
      responses: [],
      applications: []
    };
    console.log('🔄 Test data reset');
  }
}

// CLI Interface
if (import.meta.url === `file://${process.argv[1]}`) {
  const testDataManager = new TestDataManager();
  const action = process.argv[2] || 'generate';
  
  switch (action) {
    case 'generate':
      testDataManager.generateCompleteTestData();
      testDataManager.exportTestData();
      break;
    case 'load':
      testDataManager.loadTestData();
      break;
    case 'reset':
      testDataManager.resetTestData();
      break;
    default:
      console.log('Usage: node test-data-manager.js [generate|load|reset]');
  }
}

export default TestDataManager;
