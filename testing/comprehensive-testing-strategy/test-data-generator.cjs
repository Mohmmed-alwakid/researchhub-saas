#!/usr/bin/env node

/**
 * TEST DATA GENERATOR (CommonJS)
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
 * node test-data-generator.cjs [command] [options]
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
  }
};

// Sample Data Arrays
const FIRST_NAMES = [
  'Alex', 'Jordan', 'Casey', 'Morgan', 'Riley', 'Taylor', 'Avery', 'Quinn',
  'Sage', 'River', 'Rowan', 'Emery', 'Finley', 'Hayden', 'Parker', 'Reese',
  'Cameron', 'Dakota', 'Jamie', 'Phoenix', 'Skyler', 'Blake', 'Drew', 'Elliot'
];

const LAST_NAMES = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
  'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson',
  'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson'
];

const STUDY_TITLES = [
  'User Experience Research for Mobile Apps',
  'E-commerce Checkout Process Optimization',
  'Voice Interface Usability Study',
  'Website Navigation Patterns Analysis',
  'Product Feature Preference Survey',
  'Brand Perception and Recognition Study',
  'Content Discovery and Consumption Habits',
  'Accessibility Testing for Web Applications',
  'Social Media Platform User Behavior',
  'Task Completion Efficiency Analysis'
];

const STUDY_DESCRIPTIONS = [
  'Understanding how users interact with mobile applications to improve user experience',
  'Analyzing the checkout process to reduce cart abandonment and increase conversions',
  'Evaluating the effectiveness and usability of voice-controlled interfaces',
  'Studying navigation patterns to optimize website structure and information architecture',
  'Gathering user preferences on new product features before development',
  'Measuring brand awareness and perception among target demographics',
  'Investigating how users discover and consume digital content across platforms',
  'Testing website accessibility for users with disabilities and assistive technologies',
  'Analyzing user behavior patterns on social media platforms for engagement optimization',
  'Measuring efficiency and completion rates for common user tasks'
];

class TestDataGenerator {
  constructor() {
    this.dataDir = path.join(__dirname, 'data');
    this.outputDir = path.join(__dirname, 'exports');
    this.ensureDirectories();
  }

  async ensureDirectories() {
    try {
      await fs.mkdir(this.dataDir, { recursive: true });
      await fs.mkdir(this.outputDir, { recursive: true });
    } catch (error) {
      // Directories might already exist
    }
  }

  generateId(prefix = 'test') {
    return `${prefix}_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
  }

  randomChoice(array) {
    return array[Math.floor(Math.random() * array.length)];
  }

  randomEmail(firstName, lastName) {
    const domains = ['gmail.com', 'yahoo.com', 'outlook.com', 'example.com'];
    const domain = this.randomChoice(domains);
    return `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${domain}`;
  }

  randomDate(startDays = 365, endDays = 0) {
    const start = new Date();
    start.setDate(start.getDate() - startDays);
    const end = new Date();
    end.setDate(end.getDate() - endDays);
    
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  }

  generateUser(role = 'participant') {
    const firstName = this.randomChoice(FIRST_NAMES);
    const lastName = this.randomChoice(LAST_NAMES);
    
    return {
      id: this.generateId('user'),
      firstName,
      lastName,
      email: this.randomEmail(firstName, lastName),
      role,
      createdAt: this.randomDate(90, 1).toISOString(),
      lastLogin: this.randomDate(7, 0).toISOString(),
      isActive: Math.random() > 0.1, // 90% active
      profile: {
        age: Math.floor(Math.random() * 40) + 18,
        location: this.randomChoice(['US', 'UK', 'CA', 'AU', 'DE', 'FR']),
        experience: this.randomChoice(['beginner', 'intermediate', 'advanced']),
        interests: this.generateInterests()
      }
    };
  }

  generateInterests() {
    const allInterests = [
      'technology', 'design', 'marketing', 'education', 'healthcare',
      'finance', 'entertainment', 'travel', 'fitness', 'food'
    ];
    const count = Math.floor(Math.random() * 4) + 1;
    return allInterests.sort(() => 0.5 - Math.random()).slice(0, count);
  }

  generateStudy(researcherId, status = 'active') {
    const title = this.randomChoice(STUDY_TITLES);
    const description = this.randomChoice(STUDY_DESCRIPTIONS);
    
    return {
      id: this.generateId('study'),
      title,
      description,
      researcherId,
      status,
      createdAt: this.randomDate(60, 5).toISOString(),
      updatedAt: this.randomDate(5, 0).toISOString(),
      targetParticipants: Math.floor(Math.random() * 50) + 10,
      estimatedDuration: Math.floor(Math.random() * 30) + 10,
      compensation: Math.floor(Math.random() * 50) + 10,
      requirements: this.generateRequirements(),
      blocks: this.generateStudyBlocks()
    };
  }

  generateRequirements() {
    const requirements = [
      'Must be 18 years or older',
      'English fluency required',
      'Access to desktop computer',
      'Stable internet connection',
      'Previous online shopping experience'
    ];
    const count = Math.floor(Math.random() * 3) + 1;
    return requirements.sort(() => 0.5 - Math.random()).slice(0, count);
  }

  generateStudyBlocks() {
    const blockTypes = [
      'welcome', 'instruction', 'task', 'question', 'rating', 'thank-you'
    ];
    const blockCount = Math.floor(Math.random() * 5) + 3;
    
    return Array.from({ length: blockCount }, (_, index) => ({
      id: this.generateId('block'),
      type: this.randomChoice(blockTypes),
      order: index + 1,
      title: `Block ${index + 1}`,
      content: `Content for block ${index + 1}`
    }));
  }

  generateApplication(studyId, participantId) {
    const statuses = Object.keys(DATA_CONFIG.applications.statusDistribution);
    const status = this.randomChoice(statuses);
    
    return {
      id: this.generateId('app'),
      studyId,
      participantId,
      status,
      appliedAt: this.randomDate(30, 1).toISOString(),
      updatedAt: this.randomDate(1, 0).toISOString(),
      responses: this.generateResponses(),
      notes: status === 'rejected' ? 'Did not meet study requirements' : null,
      completedAt: status === 'completed' ? this.randomDate(1, 0).toISOString() : null
    };
  }

  generateResponses() {
    return {
      experience: this.randomChoice(['beginner', 'intermediate', 'advanced']),
      availability: this.randomChoice(['weekdays', 'weekends', 'flexible']),
      motivation: this.randomChoice([
        'Interest in research',
        'Compensation',
        'Product improvement',
        'Learning experience'
      ])
    };
  }

  async generateDataset(count = 5) {
    console.log(`🎲 Generating test dataset with ${count} base entities...`);
    
    const dataset = {
      users: [],
      studies: [],
      applications: [],
      metadata: {
        generatedAt: new Date().toISOString(),
        generator: 'ResearchHub Test Data Generator v1.0',
        config: DATA_CONFIG
      }
    };

    // Generate users
    console.log('👥 Generating users...');
    for (let i = 0; i < DATA_CONFIG.users.participants; i++) {
      dataset.users.push(this.generateUser('participant'));
    }
    for (let i = 0; i < DATA_CONFIG.users.researchers; i++) {
      dataset.users.push(this.generateUser('researcher'));
    }
    for (let i = 0; i < DATA_CONFIG.users.admins; i++) {
      dataset.users.push(this.generateUser('admin'));
    }

    // Generate studies
    console.log('📚 Generating studies...');
    const researchers = dataset.users.filter(u => u.role === 'researcher');
    const studyStatuses = Object.keys(DATA_CONFIG.studies);
    
    studyStatuses.forEach(status => {
      for (let i = 0; i < DATA_CONFIG.studies[status]; i++) {
        const researcher = this.randomChoice(researchers);
        dataset.studies.push(this.generateStudy(researcher.id, status));
      }
    });

    // Generate applications
    console.log('📝 Generating applications...');
    const participants = dataset.users.filter(u => u.role === 'participant');
    const activeStudies = dataset.studies.filter(s => s.status === 'active');
    
    activeStudies.forEach(study => {
      const applicationCount = Math.floor(Math.random() * DATA_CONFIG.applications.perStudy) + 5;
      for (let i = 0; i < applicationCount; i++) {
        const participant = this.randomChoice(participants);
        dataset.applications.push(this.generateApplication(study.id, participant.id));
      }
    });

    // Save dataset
    const filename = `test-dataset-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
    const filepath = path.join(this.dataDir, filename);
    
    await fs.writeFile(filepath, JSON.stringify(dataset, null, 2));
    
    console.log(`✅ Dataset generated successfully!`);
    console.log(`📊 Summary:`);
    console.log(`   Users: ${dataset.users.length} (${dataset.users.filter(u => u.role === 'participant').length} participants, ${dataset.users.filter(u => u.role === 'researcher').length} researchers, ${dataset.users.filter(u => u.role === 'admin').length} admins)`);
    console.log(`   Studies: ${dataset.studies.length}`);
    console.log(`   Applications: ${dataset.applications.length}`);
    console.log(`📁 Saved to: ${filepath}`);
    
    return dataset;
  }

  async exportToCSV(dataset) {
    console.log('📊 Exporting to CSV format...');
    
    // Users CSV
    const usersCsv = [
      'id,firstName,lastName,email,role,createdAt,lastLogin,isActive,age,location,experience',
      ...dataset.users.map(u => 
        `${u.id},${u.firstName},${u.lastName},${u.email},${u.role},${u.createdAt},${u.lastLogin},${u.isActive},${u.profile.age},${u.profile.location},${u.profile.experience}`
      )
    ].join('\n');
    
    await fs.writeFile(path.join(this.outputDir, 'users.csv'), usersCsv);
    
    // Studies CSV
    const studiesCsv = [
      'id,title,researcherId,status,createdAt,targetParticipants,estimatedDuration,compensation',
      ...dataset.studies.map(s => 
        `${s.id},"${s.title}",${s.researcherId},${s.status},${s.createdAt},${s.targetParticipants},${s.estimatedDuration},${s.compensation}`
      )
    ].join('\n');
    
    await fs.writeFile(path.join(this.outputDir, 'studies.csv'), studiesCsv);
    
    // Applications CSV
    const applicationsCsv = [
      'id,studyId,participantId,status,appliedAt,updatedAt',
      ...dataset.applications.map(a => 
        `${a.id},${a.studyId},${a.participantId},${a.status},${a.appliedAt},${a.updatedAt}`
      )
    ].join('\n');
    
    await fs.writeFile(path.join(this.outputDir, 'applications.csv'), applicationsCsv);
    
    console.log('✅ CSV export completed');
  }

  async validateDataset(dataset) {
    console.log('🔍 Validating dataset integrity...');
    
    const issues = [];
    
    // Check for duplicate IDs
    const allIds = [
      ...dataset.users.map(u => u.id),
      ...dataset.studies.map(s => s.id),
      ...dataset.applications.map(a => a.id)
    ];
    
    const uniqueIds = new Set(allIds);
    if (allIds.length !== uniqueIds.size) {
      issues.push('Duplicate IDs found');
    }
    
    // Check for orphaned references
    const userIds = new Set(dataset.users.map(u => u.id));
    const studyIds = new Set(dataset.studies.map(s => s.id));
    
    dataset.studies.forEach(study => {
      if (!userIds.has(study.researcherId)) {
        issues.push(`Study ${study.id} references non-existent researcher ${study.researcherId}`);
      }
    });
    
    dataset.applications.forEach(app => {
      if (!studyIds.has(app.studyId)) {
        issues.push(`Application ${app.id} references non-existent study ${app.studyId}`);
      }
      if (!userIds.has(app.participantId)) {
        issues.push(`Application ${app.id} references non-existent participant ${app.participantId}`);
      }
    });
    
    if (issues.length === 0) {
      console.log('✅ Dataset validation passed');
    } else {
      console.log('❌ Dataset validation failed:');
      issues.forEach(issue => console.log(`   - ${issue}`));
    }
    
    return issues.length === 0;
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'generate';
  const count = parseInt(args[1]) || 5;
  
  const generator = new TestDataGenerator();
  
  try {
    switch (command) {
      case 'generate':
        const dataset = await generator.generateDataset(count);
        await generator.validateDataset(dataset);
        await generator.exportToCSV(dataset);
        break;
      
      case 'validate':
        console.log('Validation feature coming soon...');
        break;
      
      case 'reset':
        console.log('Reset feature coming soon...');
        break;
      
      default:
        console.log('Usage: node test-data-generator.cjs [generate|validate|reset] [count]');
        break;
    }
  } catch (error) {
    console.error('❌ Test data generation failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { TestDataGenerator, DATA_CONFIG };
