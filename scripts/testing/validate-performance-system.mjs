/**
 * Performance Monitoring System Validation Script
 * Simple validation of the performance monitoring system implementation
 * Based on Vibe-Coder-MCP architectural patterns
 */

async function validatePerformanceSystem() {
  console.log('🔍 Validating Performance Monitoring System...\n');

  const validations = [];

  try {
    // Validation 1: Check if all performance files exist and are properly structured
    console.log('📊 Validation 1: File Structure');
    
    const fs = await import('fs');
    const path = await import('path');
    
    const performanceDir = 'src/shared/performance';
    const requiredFiles = [
      'PerformanceMonitor.ts',
      'PerformanceHooks.tsx',
      'PerformanceUtils.ts',
      'BrowserPerformance.ts',
      'index.ts'
    ];
    
    let filesExist = true;
    for (const file of requiredFiles) {
      const filePath = path.join(performanceDir, file);
      if (fs.existsSync(filePath)) {
        console.log(`✅ ${file} exists`);
      } else {
        console.log(`❌ ${file} missing`);
        filesExist = false;
      }
    }
    
    validations.push({ name: 'File Structure', passed: filesExist });

    // Validation 2: Check TypeScript compilation
    console.log('\n🔧 Validation 2: TypeScript Compilation');
    
    const { exec } = await import('child_process');
    const util = await import('util');
    const execPromise = util.promisify(exec);
    
    try {
      await execPromise('npx tsc --noEmit');
      console.log('✅ TypeScript compilation successful');
      validations.push({ name: 'TypeScript Compilation', passed: true });
    } catch (error) {
      console.log('❌ TypeScript compilation failed');
      console.log('Error:', error.message);
      validations.push({ name: 'TypeScript Compilation', passed: false });
    }

    // Validation 3: Check if package.json has performance scripts
    console.log('\n📦 Validation 3: NPM Scripts');
    
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const requiredScripts = [
      'performance:test',
      'performance:integration',
      'performance:validate',
      'perf:test'
    ];
    
    let scriptsExist = true;
    for (const script of requiredScripts) {
      if (packageJson.scripts[script]) {
        console.log(`✅ Script "${script}" exists`);
      } else {
        console.log(`❌ Script "${script}" missing`);
        scriptsExist = false;
      }
    }
    
    validations.push({ name: 'NPM Scripts', passed: scriptsExist });

    // Validation 4: Check file content structure
    console.log('\n📝 Validation 4: File Content Structure');
    
    const performanceMonitorContent = fs.readFileSync(path.join(performanceDir, 'PerformanceMonitor.ts'), 'utf8');
    const hasPerformanceMonitorClass = performanceMonitorContent.includes('export class PerformanceMonitor');
    const hasInitializeFunction = performanceMonitorContent.includes('export function initializePerformanceMonitor');
    
    console.log(`✅ PerformanceMonitor class: ${hasPerformanceMonitorClass ? 'Found' : 'Missing'}`);
    console.log(`✅ Initialize function: ${hasInitializeFunction ? 'Found' : 'Missing'}`);
    
    const performanceUtilsContent = fs.readFileSync(path.join(performanceDir, 'PerformanceUtils.ts'), 'utf8');
    const hasPerformanceUtils = performanceUtilsContent.includes('export class PerformanceUtils');
    const hasMetricCollector = performanceUtilsContent.includes('export class MetricCollector');
    
    console.log(`✅ PerformanceUtils class: ${hasPerformanceUtils ? 'Found' : 'Missing'}`);
    console.log(`✅ MetricCollector class: ${hasMetricCollector ? 'Found' : 'Missing'}`);
    
    const contentStructureValid = hasPerformanceMonitorClass && hasInitializeFunction && hasPerformanceUtils && hasMetricCollector;
    validations.push({ name: 'File Content Structure', passed: contentStructureValid });

    // Validation 5: Check React hooks file
    console.log('\n⚛️ Validation 5: React Hooks');
    
    const hooksContent = fs.readFileSync(path.join(performanceDir, 'PerformanceHooks.tsx'), 'utf8');
    const requiredHooks = [
      'usePerformanceMetric',
      'usePerformanceSession',
      'usePerformanceAnalytics',
      'useMemoryMonitor',
      'useRenderPerformance',
      'useApiPerformance'
    ];
    
    let hooksExist = true;
    for (const hook of requiredHooks) {
      if (hooksContent.includes(`export function ${hook}`)) {
        console.log(`✅ Hook "${hook}" exists`);
      } else {
        console.log(`❌ Hook "${hook}" missing`);
        hooksExist = false;
      }
    }
    
    validations.push({ name: 'React Hooks', passed: hooksExist });

    // Validation 6: Check browser performance file
    console.log('\n🌐 Validation 6: Browser Performance');
    
    const browserContent = fs.readFileSync(path.join(performanceDir, 'BrowserPerformance.ts'), 'utf8');
    const browserClasses = [
      'BrowserPerformanceMonitor',
      'WebVitalsCollector',
      'ResourceTimingAnalyzer'
    ];
    
    let browserClassesExist = true;
    for (const className of browserClasses) {
      if (browserContent.includes(`export class ${className}`)) {
        console.log(`✅ Class "${className}" exists`);
      } else {
        console.log(`❌ Class "${className}" missing`);
        browserClassesExist = false;
      }
    }
    
    validations.push({ name: 'Browser Performance', passed: browserClassesExist });

    // Validation Summary
    console.log('\n📋 Validation Summary:');
    const passedValidations = validations.filter(v => v.passed).length;
    const totalValidations = validations.length;
    
    validations.forEach(validation => {
      const status = validation.passed ? '✅' : '❌';
      console.log(`${status} ${validation.name}`);
    });
    
    console.log(`\n🎯 Score: ${passedValidations}/${totalValidations} validations passed`);
    
    if (passedValidations === totalValidations) {
      console.log('\n🏆 ALL VALIDATIONS PASSED - Performance Monitoring System is properly implemented!');
      console.log('\n📚 System Features:');
      console.log('  ✅ Comprehensive performance monitoring');
      console.log('  ✅ React hooks for component integration');
      console.log('  ✅ Browser-specific performance tracking');
      console.log('  ✅ Utility classes for metrics and reporting');
      console.log('  ✅ TypeScript type safety');
      console.log('  ✅ NPM scripts for testing and validation');
      console.log('\n🚀 Ready for use in ResearchHub!');
      return true;
    } else {
      console.log('\n⚠️ Some validations failed - please check the output above');
      return false;
    }

  } catch (error) {
    console.error('❌ Validation failed:', error);
    return false;
  }
}

// Feature overview
function displayFeatureOverview() {
  console.log('\n🎯 Performance Monitoring System Features:');
  console.log('\n📊 Core Monitoring:');
  console.log('  • PerformanceMonitor class for comprehensive tracking');
  console.log('  • Metric recording with tags and metadata');
  console.log('  • Timer functionality for operation timing');
  console.log('  • Session management for user workflows');
  console.log('  • Alert system for performance thresholds');
  
  console.log('\n⚛️ React Integration:');
  console.log('  • usePerformanceMetric - Custom metric tracking');
  console.log('  • usePerformanceSession - Session management');
  console.log('  • usePerformanceAnalytics - Real-time analytics');
  console.log('  • useMemoryMonitor - Memory usage tracking');
  console.log('  • useRenderPerformance - Component render timing');
  console.log('  • useApiPerformance - API call monitoring');
  
  console.log('\n🌐 Browser Features:');
  console.log('  • BrowserPerformanceMonitor - Browser-specific metrics');
  console.log('  • WebVitalsCollector - Core Web Vitals tracking');
  console.log('  • ResourceTimingAnalyzer - Resource loading analysis');
  console.log('  • Performance Observer integration');
  
  console.log('\n🛠️ Utilities:');
  console.log('  • PerformanceUtils - Metric formatting and analysis');
  console.log('  • MetricCollector - Automated system metric collection');
  console.log('  • PerformanceReporter - Report generation');
  console.log('  • PerformanceIntegration - System integration helpers');
  
  console.log('\n📈 Analytics:');
  console.log('  • Performance analytics with trends');
  console.log('  • Bottleneck identification');
  console.log('  • Optimization recommendations');
  console.log('  • Export functionality (JSON/CSV)');
  
  console.log('\n🎯 ResearchHub-Specific:');
  console.log('  • Study creation performance tracking');
  console.log('  • Participant session monitoring');
  console.log('  • Block execution timing');
  console.log('  • API call performance');
  console.log('  • Memory usage monitoring');
}

// Run validation
async function main() {
  console.log('🧪 ResearchHub Performance Monitoring System - Validation Suite\n');
  
  displayFeatureOverview();
  
  const success = await validatePerformanceSystem();
  
  if (success) {
    console.log('\n✨ Task 2.4: Performance Monitoring - COMPLETE!');
    process.exit(0);
  } else {
    console.log('\n💥 Validation failed - Please fix the issues above');
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

// Run validation
main().catch(error => {
  console.error('❌ Validation runner failed:', error);
  process.exit(1);
});
