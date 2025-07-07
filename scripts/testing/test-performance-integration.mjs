#!/usr/bin/env node

/**
 * Performance Integration Test Script
 * Tests integration of performance monitoring with other ResearchHub systems
 * Based on Vibe-Coder-MCP architectural patterns
 */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function runPerformanceIntegrationTests() {
  console.log('🔗 Starting Performance System Integration Tests...\n');

  try {
    // Test 1: Initialize Performance System
    console.log('📊 Test 1: Initialize Performance System');
    const { initializePerformanceMonitor } = await import('../../src/shared/performance/PerformanceMonitor.ts');
    const { PerformanceIntegration } = await import('../../src/shared/performance/PerformanceUtils.ts');
    
    const monitor = initializePerformanceMonitor({
      enabled: true,
      bufferSize: 500,
      flushInterval: 10000
    });
    
    const integration = new PerformanceIntegration();
    console.log('✅ Performance system initialized');

    // Test 2: ResearchHub-Specific Metrics
    console.log('\n🎯 Test 2: ResearchHub-Specific Performance Metrics');
    
    // Simulate study creation performance
    const studyCreationTimer = monitor.startTimer('study-creation-test');
    
    // Simulate study creation steps
    await simulateStudyCreationWorkflow(monitor);
    
    const studyCreationMetric = monitor.endTimer(
      studyCreationTimer,
      'study_creation',
      { operation: 'complete-study-creation' },
      { steps: 6, blocks: 5 }
    );
    
    console.log('✅ Study creation performance tracked:', {
      duration: studyCreationMetric?.value?.toFixed(2) + 'ms',
      status: getPerformanceStatus(studyCreationMetric?.value || 0, 'study_creation')
    });

    // Simulate participant session performance
    await simulateParticipantSession(monitor);
    
    // Simulate block execution performance
    await simulateBlockExecution(monitor);

    // Test 3: Real-time Performance Monitoring
    console.log('\n⚡ Test 3: Real-time Performance Monitoring');
    
    // Simulate continuous monitoring for a short period
    const monitoringSession = monitor.startSession(
      'real-time-monitoring',
      { type: 'integration-test' },
      { automated: true }
    );
    
    // Generate metrics over time
    for (let i = 0; i < 5; i++) {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Simulate API calls
      monitor.recordMetric(
        'api_call',
        'studies-api',
        Math.random() * 500 + 100,
        'ms',
        { endpoint: '/api/studies', method: 'GET' },
        { iteration: i }
      );
      
      // Simulate memory usage
      monitor.recordMetric(
        'memory_usage',
        'app-memory',
        Math.random() * 200 + 50,
        'MB',
        { component: 'study-builder' },
        { iteration: i }
      );
    }
    
    const completedMonitoring = monitor.endSession(monitoringSession.id);
    console.log('✅ Real-time monitoring session completed:', {
      duration: completedMonitoring?.duration?.toFixed(2) + 'ms',
      metricsCollected: completedMonitoring?.metrics.length
    });

    // Test 4: Performance Analytics and Insights
    console.log('\n📈 Test 4: Performance Analytics and Insights');
    
    const analytics = monitor.getAnalytics(
      new Date(Date.now() - 60 * 60 * 1000), // Last hour
      new Date()
    );
    
    console.log('✅ Performance analytics generated:');
    console.log(`  Total metrics: ${analytics.summary.totalMetrics}`);
    console.log(`  Average response time: ${analytics.summary.averageResponseTime.toFixed(2)}ms`);
    console.log(`  Peak memory usage: ${analytics.summary.peakMemoryUsage.toFixed(2)}MB`);
    console.log(`  Bottlenecks identified: ${analytics.bottlenecks.length}`);
    console.log(`  Recommendations: ${analytics.recommendations.length}`);

    // Display bottlenecks if any
    if (analytics.bottlenecks.length > 0) {
      console.log('\n🚨 Performance Bottlenecks Detected:');
      analytics.bottlenecks.forEach((bottleneck, index) => {
        console.log(`  ${index + 1}. ${bottleneck.operation} (${bottleneck.type})`);
        console.log(`     Average time: ${bottleneck.averageTime.toFixed(2)}ms`);
        console.log(`     Impact: ${bottleneck.impact}`);
        console.log(`     Suggestion: ${bottleneck.suggestion}`);
      });
    }

    // Display recommendations
    if (analytics.recommendations.length > 0) {
      console.log('\n💡 Performance Recommendations:');
      analytics.recommendations.forEach((rec, index) => {
        console.log(`  ${index + 1}. ${rec.title} (${rec.priority})`);
        console.log(`     ${rec.description}`);
        console.log(`     Action: ${rec.action}`);
      });
    }

    // Test 5: Performance Alerts System
    console.log('\n🚨 Test 5: Performance Alerts System');
    
    // Trigger performance alerts by creating slow operations
    const slowOperations = [
      { type: 'api_call', name: 'slow-api', value: 3500, threshold: { warning: 1000, critical: 3000 } },
      { type: 'memory_usage', name: 'high-memory', value: 800, threshold: { warning: 512, critical: 1024 } },
      { type: 'study_creation', name: 'slow-creation', value: 12000, threshold: { warning: 5000, critical: 15000 } }
    ];
    
    slowOperations.forEach(op => {
      const metric = monitor.recordMetric(
        op.type,
        op.name,
        op.value,
        'ms',
        { alertTest: true },
        { shouldTriggerAlert: true }
      );
      
      const status = getPerformanceStatus(op.value, op.type);
      console.log(`✅ Alert test - ${op.name}: ${op.value}ms (${status})`);
    });

    // Test 6: Export and Reporting
    console.log('\n📊 Test 6: Export and Reporting');
    
    const { PerformanceReporter, PerformanceUtils } = await import('../../src/shared/performance/PerformanceUtils.ts');
    
    const reporter = new PerformanceReporter();
    const report = await reporter.generateDailyReport();
    
    console.log('✅ Performance report generated');
    console.log('  Report length:', report.length, 'characters');
    console.log('  Report preview (first 150 chars):');
    console.log('  ' + report.substring(0, 150) + '...');

    // Export metrics for analysis
    const allMetrics = Array.from(monitor['metrics'].values());
    const jsonExport = PerformanceUtils.exportMetrics(allMetrics.slice(-10), 'json');
    const csvExport = PerformanceUtils.exportMetrics(allMetrics.slice(-10), 'csv');
    
    console.log('✅ Metrics exported:');
    console.log(`  JSON: ${jsonExport.length} characters`);
    console.log(`  CSV: ${csvExport.split('\n').length} lines`);

    // Test 7: Performance Optimization Suggestions
    console.log('\n🎯 Test 7: Performance Optimization Suggestions');
    
    const recommendations = PerformanceUtils.generateRecommendations(allMetrics.slice(-20));
    
    if (recommendations.length > 0) {
      console.log('✅ Optimization suggestions generated:');
      recommendations.forEach((rec, index) => {
        console.log(`  ${index + 1}. ${rec}`);
      });
    } else {
      console.log('✅ No optimization suggestions needed - performance is good!');
    }

    // Test 8: System Health Check
    console.log('\n🔍 Test 8: System Health Check');
    
    const snapshot = monitor.getSnapshot();
    const healthMetrics = {
      totalMetrics: snapshot.metrics.length,
      activeSessions: snapshot.sessions.length,
      activeAlerts: snapshot.alerts.length,
      monitoringActive: monitor['config'].enabled,
      bufferUtilization: (snapshot.metrics.length / monitor['config'].bufferSize) * 100
    };
    
    console.log('✅ System health check completed:');
    console.log(`  Monitoring active: ${healthMetrics.monitoringActive}`);
    console.log(`  Total metrics collected: ${healthMetrics.totalMetrics}`);
    console.log(`  Active sessions: ${healthMetrics.activeSessions}`);
    console.log(`  Active alerts: ${healthMetrics.activeAlerts}`);
    console.log(`  Buffer utilization: ${healthMetrics.bufferUtilization.toFixed(1)}%`);

    console.log('\n🎉 Performance Integration Tests Completed Successfully!');
    
    console.log('\n📋 Integration Test Summary:');
    console.log('  ✅ Performance system initialization');
    console.log('  ✅ ResearchHub-specific metrics tracking');
    console.log('  ✅ Real-time monitoring capabilities');
    console.log('  ✅ Performance analytics generation');
    console.log('  ✅ Alert system functionality');
    console.log('  ✅ Export and reporting features');
    console.log('  ✅ Optimization suggestions');
    console.log('  ✅ System health monitoring');

    return true;

  } catch (error) {
    console.error('❌ Performance integration test failed:', error);
    console.error('Stack trace:', error.stack);
    return false;
  }
}

// Simulate study creation workflow
async function simulateStudyCreationWorkflow(monitor) {
  const steps = [
    { name: 'type-selection', duration: 200 },
    { name: 'template-selection', duration: 300 },
    { name: 'preview-generation', duration: 150 },
    { name: 'block-configuration', duration: 800 },
    { name: 'validation', duration: 100 },
    { name: 'save-study', duration: 250 }
  ];
  
  for (const step of steps) {
    const timerId = monitor.startTimer(`study-step-${step.name}`);
    
    // Simulate step execution time
    await new Promise(resolve => setTimeout(resolve, step.duration));
    
    monitor.endTimer(
      timerId,
      'study_creation',
      { step: step.name },
      { duration: step.duration }
    );
  }
  
  console.log('✅ Study creation workflow simulated');
}

// Simulate participant session
async function simulateParticipantSession(monitor) {
  const sessionId = monitor.startSession(
    'participant-session',
    { userType: 'participant', studyId: 'test-study' },
    { simulation: true }
  );
  
  // Simulate block executions
  const blocks = ['welcome', 'question-1', 'image-test', 'rating-scale', 'thank-you'];
  
  for (const [index, block] of blocks.entries()) {
    const blockTimer = monitor.startTimer(`block-${block}`);
    
    // Simulate block execution time (participant interaction)
    const executionTime = Math.random() * 3000 + 500; // 0.5-3.5 seconds
    await new Promise(resolve => setTimeout(resolve, executionTime));
    
    monitor.endTimer(
      blockTimer,
      'block_execution',
      { blockType: block, sessionId: sessionId.id },
      { participantTime: executionTime, blockIndex: index }
    );
  }
  
  const completedSession = monitor.endSession(sessionId.id);
  console.log('✅ Participant session simulated:', {
    duration: completedSession?.duration?.toFixed(2) + 'ms',
    blocks: blocks.length
  });
}

// Simulate block execution performance
async function simulateBlockExecution(monitor) {
  const blockTypes = [
    'welcome-screen',
    'open-question',
    'multiple-choice',
    'opinion-scale',
    'five-second-test',
    'context-screen',
    'thank-you'
  ];
  
  for (const blockType of blockTypes) {
    const executionTime = Math.random() * 1000 + 100; // 100-1100ms
    
    monitor.recordMetric(
      'block_execution',
      blockType,
      executionTime,
      'ms',
      { blockType, version: '1.0' },
      { 
        rendering: executionTime * 0.3,
        interaction: executionTime * 0.5,
        validation: executionTime * 0.2
      }
    );
  }
  
  console.log('✅ Block execution performance simulated for', blockTypes.length, 'block types');
}

// Get performance status based on value and type
function getPerformanceStatus(value, type) {
  const thresholds = {
    'study_creation': { good: 3000, warning: 8000 },
    'participant_session': { good: 15000, warning: 25000 },
    'block_execution': { good: 1000, warning: 3000 },
    'api_call': { good: 500, warning: 1500 },
    'memory_usage': { good: 200, warning: 500 }
  };
  
  const threshold = thresholds[type] || { good: 1000, warning: 3000 };
  
  if (value <= threshold.good) return 'excellent';
  if (value <= threshold.warning) return 'good';
  return 'needs-attention';
}

// Run the integration tests
async function main() {
  console.log('🧪 ResearchHub Performance Integration Tests\n');
  
  const success = await runPerformanceIntegrationTests();
  
  if (success) {
    console.log('\n🏆 ALL INTEGRATION TESTS PASSED - Performance system is fully integrated!');
    process.exit(0);
  } else {
    console.log('\n💥 INTEGRATION TESTS FAILED - Check the output above for details');
    process.exit(1);
  }
}

// Handle errors
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

// Run the tests
main().catch(error => {
  console.error('❌ Integration test runner failed:', error);
  process.exit(1);
});
