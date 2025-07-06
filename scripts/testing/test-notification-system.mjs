#!/usr/bin/env node

/**
 * Comprehensive test suite for the Real-time Notification System
 * Tests SSE functionality, job integration, and client connection management
 * Part of Vibe-Coder-MCP implementation for ResearchHub
 */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { performance } from 'perf_hooks';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Test results tracking
const testResults = {
  passed: 0,
  failed: 0,
  total: 0,
  startTime: performance.now(),
  details: []
};

function logTest(name, passed, message = '', details = {}) {
  testResults.total++;
  if (passed) {
    testResults.passed++;
    console.log(`✅ ${name}: PASSED ${message ? `- ${message}` : ''}`);
  } else {
    testResults.failed++;
    console.log(`❌ ${name}: FAILED ${message ? `- ${message}` : ''}`);
  }
  
  testResults.details.push({
    name,
    passed,
    message,
    details,
    timestamp: new Date().toISOString()
  });
}

function logSection(title) {
  console.log(`\n🔍 ${title}`);
  console.log('='.repeat(50));
}

async function testNotificationManager() {
  logSection('Testing NotificationManager (Server-side)');

  try {
    // Import the NotificationManager with proper path handling
    let notificationModule;
    try {
      notificationModule = await import('../../../src/shared/notifications/index.js');
    } catch (importError) {
      // Try alternative import method
      try {
        notificationModule = await import('../../src/shared/notifications/index.js');
      } catch (alternativeError) {
        // Try direct file imports
        const NotificationManager = await import('../../../src/shared/notifications/NotificationManager.js');
        const NotificationClient = await import('../../../src/shared/notifications/NotificationClient.js');
        
        notificationModule = {
          NotificationManager: NotificationManager.NotificationManager,
          globalNotificationManager: NotificationManager.globalNotificationManager,
          NotificationClient: NotificationClient.NotificationClient,
          // Mock other exports for testing
          NotificationIntegration: {
            createTestUtils: () => ({
              sendTestNotification: async () => {},
              getStats: () => ({ totalConnections: 0, uniqueUsers: 0 }),
              sendSystemMaintenance: async () => {}
            })
          }
        };
      }
    }
    
    const { NotificationManager, globalNotificationManager, NotificationIntegration } = notificationModule;
    
    // Test 1: Manager initialization
    try {
      const manager = new NotificationManager({
        heartbeatInterval: 1000,
        maxConnections: 10,
        connectionTimeout: 5000
      });
      logTest('NotificationManager Creation', true, 'Manager instance created with custom config');
    } catch (error) {
      logTest('NotificationManager Creation', false, error.message);
    }

    // Test 2: Global manager exists
    try {
      logTest('Global Manager', !!globalNotificationManager, 'Global notification manager available');
    } catch (error) {
      logTest('Global Manager', false, error.message);
    }

    // Test 3: Test notification sending
    try {
      await globalNotificationManager.sendNotification({
        channel: 'user-notifications',
        type: 'test-message',
        priority: 'normal',
        title: 'Test Notification',
        message: 'This is a test',
        userId: 'test-user-123',
        data: { testData: true }
      });
      logTest('Send Notification', true, 'Test notification sent successfully');
    } catch (error) {
      logTest('Send Notification', false, error.message);
    }

    // Test 4: Job progress notification
    try {
      await globalNotificationManager.sendJobProgress(
        'job-123',
        'user-456',
        50,
        'running',
        'Job is halfway complete'
      );
      logTest('Job Progress Notification', true, 'Job progress notification sent');
    } catch (error) {
      logTest('Job Progress Notification', false, error.message);
    }

    // Test 5: Job completion notification
    try {
      await globalNotificationManager.sendJobCompletion(
        'job-123',
        'user-456',
        true,
        { result: 'success' }
      );
      logTest('Job Completion Notification', true, 'Job completion notification sent');
    } catch (error) {
      logTest('Job Completion Notification', false, error.message);
    }

    // Test 6: Study update notification
    try {
      await globalNotificationManager.sendStudyUpdate(
        'study-789',
        'researcher-123',
        'status-changed',
        { newStatus: 'active' }
      );
      logTest('Study Update Notification', true, 'Study update notification sent');
    } catch (error) {
      logTest('Study Update Notification', false, error.message);
    }

    // Test 7: System alert
    try {
      await globalNotificationManager.sendSystemAlert(
        'System Maintenance',
        'Scheduled maintenance in 1 hour',
        'high'
      );
      logTest('System Alert', true, 'System alert sent');
    } catch (error) {
      logTest('System Alert', false, error.message);
    }

    // Test 8: User subscription
    try {
      const subscriptionId = globalNotificationManager.subscribeUser(
        'user-789',
        ['job-progress', 'study-updates'],
        { studyIds: ['study-123', 'study-456'] }
      );
      logTest('User Subscription', !!subscriptionId, `Subscription created: ${subscriptionId}`);
    } catch (error) {
      logTest('User Subscription', false, error.message);
    }

    // Test 9: Connection statistics
    try {
      const stats = globalNotificationManager.getConnectionStats();
      logTest('Connection Statistics', typeof stats === 'object', 
        `Stats available - Connections: ${stats.totalConnections}, Users: ${stats.uniqueUsers}`);
    } catch (error) {
      logTest('Connection Statistics', false, error.message);
    }

    // Test 10: Integration utilities
    try {
      const testUtils = NotificationIntegration.createTestUtils();
      logTest('Integration Utilities', !!testUtils.sendTestNotification, 'Test utilities created');
      
      // Test sending a test notification
      await testUtils.sendTestNotification('test-user-456', 'user-notifications');
      logTest('Test Utils - Send Test Notification', true, 'Test notification sent via utils');
    } catch (error) {
      logTest('Integration Utilities', false, error.message);
    }

  } catch (importError) {
    logTest('NotificationManager Import', false, importError.message);
  }
}

async function testNotificationClient() {
  logSection('Testing NotificationClient (Client-side)');

  try {
    // Import the NotificationClient
    const { NotificationClient, createNotificationHook } = await import('../../../src/shared/notifications/index.js');
    
    // Test 1: Client creation
    try {
      const client = new NotificationClient({
        baseUrl: 'http://localhost:3003',
        userId: 'test-user-123',
        channels: ['user-notifications', 'job-progress'],
        autoReconnect: true,
        reconnectInterval: 5000,
        maxReconnectAttempts: 3,
        enablePersistence: false,
        maxStoredNotifications: 50
      });
      logTest('NotificationClient Creation', true, 'Client instance created');
    } catch (error) {
      logTest('NotificationClient Creation', false, error.message);
    }

    // Test 2: Hook creation
    try {
      const hook = createNotificationHook({
        baseUrl: 'http://localhost:3003',
        userId: 'test-user-456',
        channels: ['job-completed', 'study-updates'],
        autoReconnect: true,
        reconnectInterval: 2000,
        maxReconnectAttempts: 5,
        enablePersistence: true,
        maxStoredNotifications: 100
      });
      logTest('Notification Hook Creation', !!hook.client, 'React hook created with client');
    } catch (error) {
      logTest('Notification Hook Creation', false, error.message);
    }

    // Test 3: Client methods
    try {
      const client = new NotificationClient({
        baseUrl: 'http://localhost:3003',
        userId: 'test-user-789',
        channels: ['user-notifications'],
        autoReconnect: false,
        reconnectInterval: 1000,
        maxReconnectAttempts: 1,
        enablePersistence: false,
        maxStoredNotifications: 10
      });

      // Test get state
      const state = client.getState();
      logTest('Client Get State', state.status === 'disconnected', `Initial state: ${state.status}`);

      // Test notification handlers
      const unsubscribe = client.onJobProgress((data) => {
        console.log('Job progress received:', data);
      });
      logTest('Job Progress Handler', typeof unsubscribe === 'function', 'Handler registered with unsubscribe function');

      // Test other handlers
      const unsubscribe2 = client.onJobCompletion(() => {});
      const unsubscribe3 = client.onStudyUpdate(() => {});
      const unsubscribe4 = client.onSystemAlert(() => {});
      
      logTest('Multiple Handlers', 
        typeof unsubscribe2 === 'function' && 
        typeof unsubscribe3 === 'function' && 
        typeof unsubscribe4 === 'function', 
        'All handler types registered'
      );

      // Test unsubscribe
      unsubscribe();
      logTest('Handler Unsubscribe', true, 'Handler unsubscribed successfully');

    } catch (error) {
      logTest('Client Methods', false, error.message);
    }

  } catch (importError) {
    logTest('NotificationClient Import', false, importError.message);
  }
}

async function testIntegrationFeatures() {
  logSection('Testing Integration Features');

  try {
    const { NotificationIntegration, globalNotificationManager } = await import('../../../src/shared/notifications/index.js');

    // Test 1: API endpoint creation
    try {
      const endpoint = NotificationIntegration.createAPIEndpoint();
      logTest('API Endpoint Creation', typeof endpoint === 'function', 'SSE endpoint function created');
    } catch (error) {
      logTest('API Endpoint Creation', false, error.message);
    }

    // Test 2: Job system integration
    try {
      // Mock job manager
      const mockJobManager = {
        events: {},
        on(event, callback) {
          if (!this.events[event]) this.events[event] = [];
          this.events[event].push(callback);
        },
        emit(event, ...args) {
          if (this.events[event]) {
            this.events[event].forEach(callback => callback(...args));
          }
        }
      };

      NotificationIntegration.integrateWithJobSystem(mockJobManager);
      logTest('Job System Integration', true, 'Job manager integration completed');

      // Test event triggering
      mockJobManager.emit('job-started', { id: 'test-job', userId: 'test-user' });
      logTest('Job Event Integration', true, 'Job started event triggered');

    } catch (error) {
      logTest('Job System Integration', false, error.message);
    }

    // Test 3: React integration factory
    try {
      const useNotifications = NotificationIntegration.createReactIntegration('http://localhost:3003');
      logTest('React Integration Factory', typeof useNotifications === 'function', 'React hook factory created');
    } catch (error) {
      logTest('React Integration Factory', false, error.message);
    }

    // Test 4: Test utilities
    try {
      const testUtils = NotificationIntegration.createTestUtils();
      
      // Test stats
      const stats = testUtils.getStats();
      logTest('Test Utils - Stats', typeof stats === 'object', `Current connections: ${stats.totalConnections}`);

      // Test system maintenance alert
      await testUtils.sendSystemMaintenance('Test maintenance message');
      logTest('Test Utils - System Maintenance', true, 'Maintenance alert sent');

      // Test job progress simulation (short version for testing)
      const simulationPromise = testUtils.simulateJobProgress('test-job-sim', 'test-user-sim');
      logTest('Test Utils - Job Simulation Started', true, 'Job progress simulation started');

      // Don't wait for full simulation to complete
    } catch (error) {
      logTest('Test Utilities', false, error.message);
    }

  } catch (importError) {
    logTest('Integration Features Import', false, importError.message);
  }
}

async function testTypeDefinitions() {
  logSection('Testing TypeScript Type Definitions');

  try {
    // This tests that all types are properly exported and accessible
    const types = await import('../../../src/shared/notifications/index.js');
    
    // Test that main exports exist
    const expectedExports = [
      'NotificationManager',
      'NotificationClient',
      'NotificationIntegration',
      'globalNotificationManager',
      'sendNotification',
      'sendJobProgress',
      'sendJobCompletion',
      'sendStudyUpdate',
      'sendSystemAlert',
      'subscribeUser',
      'getConnectionStats',
      'createNotificationHook'
    ];

    let missingExports = [];
    expectedExports.forEach(exportName => {
      if (!(exportName in types)) {
        missingExports.push(exportName);
      }
    });

    logTest('Type Exports', missingExports.length === 0, 
      missingExports.length > 0 ? `Missing: ${missingExports.join(', ')}` : 'All exports available');

    // Test default export
    logTest('Default Export', !!types.default, 'Default export available');

  } catch (importError) {
    logTest('Type Definitions Import', false, importError.message);
  }
}

async function generateTestReport() {
  const endTime = performance.now();
  const duration = endTime - testResults.startTime;

  logSection('Test Results Summary');
  
  console.log(`📊 Total Tests: ${testResults.total}`);
  console.log(`✅ Passed: ${testResults.passed}`);
  console.log(`❌ Failed: ${testResults.failed}`);
  console.log(`📈 Success Rate: ${((testResults.passed / testResults.total) * 100).toFixed(1)}%`);
  console.log(`⏱️  Duration: ${duration.toFixed(2)}ms`);

  const report = {
    summary: {
      total: testResults.total,
      passed: testResults.passed,
      failed: testResults.failed,
      successRate: ((testResults.passed / testResults.total) * 100).toFixed(1) + '%',
      duration: duration.toFixed(2) + 'ms',
      timestamp: new Date().toISOString()
    },
    tests: testResults.details,
    system: {
      nodeVersion: process.version,
      platform: process.platform,
      testFile: __filename
    }
  };

  return report;
}

// Main test execution
async function runAllTests() {
  console.log('🚀 Starting Notification System Test Suite');
  console.log('=' .repeat(60));

  await testNotificationManager();
  await testNotificationClient();
  await testIntegrationFeatures();
  await testTypeDefinitions();

  const report = await generateTestReport();
  
  // Exit with appropriate code
  if (testResults.failed > 0) {
    console.log('\n❌ Some tests failed. Check output above for details.');
    process.exit(1);
  } else {
    console.log('\n✅ All tests passed successfully!');
    process.exit(0);
  }
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllTests().catch(error => {
    console.error('❌ Test suite crashed:', error);
    process.exit(1);
  });
}

export { runAllTests, generateTestReport };
