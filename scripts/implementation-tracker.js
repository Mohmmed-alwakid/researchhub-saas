#!/usr/bin/env node

/**
 * ResearchHub Implementation Progress Tracker
 * Tracks implementation of Vibe-Coder-MCP improvements
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROGRESS_FILE = path.join(__dirname, '../completion-tracking.json');

// Define all tasks from the implementation plan
const IMPLEMENTATION_TASKS = {
  'phase1': {
    name: 'Phase 1: Foundation & Structure',
    startDate: '2025-07-06',
    endDate: '2025-07-19',
    tasks: {
      '1.1': {
        name: 'Reorganize directory structure',
        description: 'Create new directory structure following Vibe-Coder-MCP pattern',
        completed: false,
        completedDate: null,
        priority: 'P0'
      },
      '1.2': {
        name: 'Set up configuration management',
        description: 'Create ConfigManager class and centralized config',
        completed: false,
        completedDate: null,
        priority: 'P0'
      },
      '1.3': {
        name: 'Create setup automation',
        description: 'Implement scripts/setup.js for project initialization',
        completed: false,
        completedDate: null,
        priority: 'P0'
      },
      '1.4': {
        name: 'Enhanced package.json scripts',
        description: 'Add new npm scripts for development workflow',
        completed: false,
        completedDate: null,
        priority: 'P0'
      },
      '1.5': {
        name: 'Create Block Registry architecture',
        description: 'Implement BlockRegistry class and block registration system',
        completed: false,
        completedDate: null,
        priority: 'P0'
      },
      '1.6': {
        name: 'Migrate existing blocks to registry',
        description: 'Convert WelcomeScreen and OpenQuestion blocks to new pattern',
        completed: false,
        completedDate: null,
        priority: 'P0'
      },
      '1.7': {
        name: 'Migrate remaining blocks',
        description: 'Convert all 13 block types to registry pattern',
        completed: false,
        completedDate: null,
        priority: 'P0'
      },
      '1.8': {
        name: 'Testing infrastructure setup',
        description: 'Create basic testing framework structure',
        completed: false,
        completedDate: null,
        priority: 'P1'
      },
      '1.9': {
        name: 'Comprehensive testing',
        description: 'Test all migrated functionality and verify no regressions',
        completed: false,
        completedDate: null,
        priority: 'P0'
      },
      '1.10': {
        name: 'Phase 1 review and optimization',
        description: 'Code review, optimization, and Phase 1 completion report',
        completed: false,
        completedDate: null,
        priority: 'P0'
      }
    }
  },
  'phase2': {
    name: 'Phase 2: Core Features & Background Processing',
    startDate: '2025-07-20',
    endDate: '2025-08-02',
    tasks: {
      '2.1': {
        name: 'Implement JobManager',
        description: 'Create JobManager class for background job processing',
        completed: false,
        completedDate: null,
        priority: 'P0'
      },
      '2.2': {
        name: 'Real-time notifications',
        description: 'Implement SSE system and notification service',
        completed: false,
        completedDate: null,
        priority: 'P0'
      },
      '2.3': {
        name: 'Async study creation',
        description: 'Convert study creation to background jobs',
        completed: false,
        completedDate: null,
        priority: 'P0'
      },
      '2.4': {
        name: 'UI enhancements for async operations',
        description: 'Add progress indicators and real-time status updates',
        completed: false,
        completedDate: null,
        priority: 'P0'
      },
      '2.5': {
        name: 'Job queue and prioritization',
        description: 'Implement job queue system with prioritization',
        completed: false,
        completedDate: null,
        priority: 'P1'
      },
      '2.6': {
        name: 'Enhanced error handling',
        description: 'Implement comprehensive error handling and recovery',
        completed: false,
        completedDate: null,
        priority: 'P0'
      },
      '2.7': {
        name: 'System integration',
        description: 'Integrate all Phase 2 features and test workflows',
        completed: false,
        completedDate: null,
        priority: 'P0'
      },
      '2.8': {
        name: 'Phase 2 validation',
        description: 'Comprehensive testing and performance benchmarking',
        completed: false,
        completedDate: null,
        priority: 'P0'
      }
    }
  },
  'phase3': {
    name: 'Phase 3: Quality & Professional Testing',
    startDate: '2025-08-03',
    endDate: '2025-08-17',
    tasks: {
      '3.1': {
        name: 'Automated testing setup',
        description: 'Implement comprehensive testing framework',
        completed: false,
        completedDate: null,
        priority: 'P1'
      },
      '3.2': {
        name: 'Performance and security testing',
        description: 'Add Lighthouse, security scanning, and accessibility testing',
        completed: false,
        completedDate: null,
        priority: 'P1'
      },
      '3.3': {
        name: 'Quality gates implementation',
        description: 'Create automated quality checks and deployment gates',
        completed: false,
        completedDate: null,
        priority: 'P1'
      },
      '3.4': {
        name: 'Documentation and guides',
        description: 'Update documentation and create implementation guides',
        completed: false,
        completedDate: null,
        priority: 'P1'
      },
      '3.5': {
        name: 'Production optimization',
        description: 'Performance optimization and security hardening',
        completed: false,
        completedDate: null,
        priority: 'P1'
      },
      '3.6': {
        name: 'Monitoring and analytics',
        description: 'Implement monitoring systems and performance analytics',
        completed: false,
        completedDate: null,
        priority: 'P2'
      },
      '3.7': {
        name: 'Complete system validation',
        description: 'Full system testing and user acceptance testing',
        completed: false,
        completedDate: null,
        priority: 'P0'
      },
      '3.8': {
        name: 'Project completion',
        description: 'Final documentation and project retrospective',
        completed: false,
        completedDate: null,
        priority: 'P0'
      }
    }
  }
};

class ProgressTracker {
  constructor() {
    this.progressData = this.loadProgress();
  }

  loadProgress() {
    if (fs.existsSync(PROGRESS_FILE)) {
      try {
        return JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf8'));
      } catch (error) {
        console.log('⚠️  Error loading progress file, creating new one');
      }
    }
    return {
      startDate: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      completedTasks: {},
      notes: []
    };
  }

  saveProgress() {
    this.progressData.lastUpdated = new Date().toISOString();
    fs.writeFileSync(PROGRESS_FILE, JSON.stringify(this.progressData, null, 2));
  }

  markCompleted(taskId, notes = '') {
    this.progressData.completedTasks[taskId] = {
      completedDate: new Date().toISOString(),
      notes: notes
    };
    
    // Update the task in IMPLEMENTATION_TASKS
    const [phaseKey, taskKey] = taskId.split('.');
    if (IMPLEMENTATION_TASKS[phaseKey] && IMPLEMENTATION_TASKS[phaseKey].tasks[taskKey]) {
      IMPLEMENTATION_TASKS[phaseKey].tasks[taskKey].completed = true;
      IMPLEMENTATION_TASKS[phaseKey].tasks[taskKey].completedDate = new Date().toISOString();
    }
    
    this.saveProgress();
    console.log(`✅ Marked task ${taskId} as completed`);
    if (notes) console.log(`📝 Notes: ${notes}`);
  }

  addNote(note) {
    this.progressData.notes.push({
      date: new Date().toISOString(),
      note: note
    });
    this.saveProgress();
    console.log(`📝 Added note: ${note}`);
  }

  getPhaseProgress(phaseKey) {
    const phase = IMPLEMENTATION_TASKS[phaseKey];
    if (!phase) return { completed: 0, total: 0, percentage: 0 };

    const tasks = Object.keys(phase.tasks);
    const completed = tasks.filter(taskKey => {
      const taskId = `${phaseKey}.${taskKey}`;
      return this.progressData.completedTasks[taskId];
    }).length;

    return {
      completed,
      total: tasks.length,
      percentage: Math.round((completed / tasks.length) * 100)
    };
  }

  generateReport() {
    console.log('\n🚀 ResearchHub Implementation Progress Report');
    console.log('=' .repeat(50));
    
    let totalTasks = 0;
    let totalCompleted = 0;

    Object.keys(IMPLEMENTATION_TASKS).forEach(phaseKey => {
      const phase = IMPLEMENTATION_TASKS[phaseKey];
      const progress = this.getPhaseProgress(phaseKey);
      
      totalTasks += progress.total;
      totalCompleted += progress.completed;
      
      console.log(`\n📋 ${phase.name}`);
      console.log(`   Progress: ${progress.completed}/${progress.total} (${progress.percentage}%)`);
      console.log(`   Timeline: ${phase.startDate} → ${phase.endDate}`);
      
      if (progress.percentage > 0) {
        const bar = '█'.repeat(Math.floor(progress.percentage / 5)) + 
                   '░'.repeat(20 - Math.floor(progress.percentage / 5));
        console.log(`   Progress: [${bar}] ${progress.percentage}%`);
      }

      // Show next tasks
      const nextTasks = Object.keys(phase.tasks).filter(taskKey => {
        const taskId = `${phaseKey}.${taskKey}`;
        return !this.progressData.completedTasks[taskId];
      }).slice(0, 3);

      if (nextTasks.length > 0) {
        console.log(`   Next tasks:`);
        nextTasks.forEach(taskKey => {
          const task = phase.tasks[taskKey];
          console.log(`     • ${task.name} (${task.priority})`);
        });
      }
    });

    const overallPercentage = Math.round((totalCompleted / totalTasks) * 100);
    console.log(`\n🎯 Overall Progress: ${totalCompleted}/${totalTasks} (${overallPercentage}%)`);
    
    if (this.progressData.notes.length > 0) {
      console.log(`\n📝 Recent Notes:`);
      this.progressData.notes.slice(-3).forEach(note => {
        const date = new Date(note.date).toLocaleDateString();
        console.log(`   ${date}: ${note.note}`);
      });
    }

    console.log(`\n⏰ Last updated: ${new Date(this.progressData.lastUpdated).toLocaleString()}`);
  }

  getCurrentTasks() {
    console.log('\n🎯 Current Priority Tasks');
    console.log('=' .repeat(30));

    // Get P0 tasks that aren't completed yet
    const currentTasks = [];
    
    Object.keys(IMPLEMENTATION_TASKS).forEach(phaseKey => {
      const phase = IMPLEMENTATION_TASKS[phaseKey];
      Object.keys(phase.tasks).forEach(taskKey => {
        const task = phase.tasks[taskKey];
        const taskId = `${phaseKey}.${taskKey}`;
        
        if (!this.progressData.completedTasks[taskId] && task.priority === 'P0') {
          currentTasks.push({
            id: taskId,
            name: task.name,
            description: task.description,
            phase: phase.name
          });
        }
      });
    });

    if (currentTasks.length === 0) {
      console.log('🎉 All P0 tasks completed! Check P1 tasks.');
      return;
    }

    currentTasks.slice(0, 5).forEach((task, index) => {
      console.log(`\n${index + 1}. 📌 ${task.name} (${task.id})`);
      console.log(`   ${task.description}`);
      console.log(`   Phase: ${task.phase}`);
    });

    console.log(`\n💡 To mark a task complete: npm run track-progress complete 1.1 "optional notes"`);
  }
}

// CLI interface
const command = process.argv[2];
const taskId = process.argv[3];
const notes = process.argv[4] || '';

const tracker = new ProgressTracker();

switch (command) {
  case 'report':
    tracker.generateReport();
    break;
    
  case 'current':
    tracker.getCurrentTasks();
    break;
    
  case 'complete':
    if (!taskId) {
      console.log('❌ Please provide task ID (e.g., npm run track-progress complete 1.1)');
      process.exit(1);
    }
    tracker.markCompleted(taskId, notes);
    tracker.generateReport();
    break;
    
  case 'note':
    if (!taskId) {
      console.log('❌ Please provide note text');
      process.exit(1);
    }
    tracker.addNote(taskId);
    break;
    
  default:
    console.log('📋 ResearchHub Progress Tracker');
    console.log('');
    console.log('Commands:');
    console.log('  npm run track-progress report     # Show progress report');
    console.log('  npm run track-progress current    # Show current priority tasks');
    console.log('  npm run track-progress complete 1.1 "notes"  # Mark task complete');
    console.log('  npm run track-progress note "message"        # Add a note');
    console.log('');
    console.log('Example: npm run track-progress complete 1.1 "Directory structure created"');
    break;
}
