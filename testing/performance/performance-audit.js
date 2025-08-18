const { chromium } = require('playwright');
const fs = require('fs');

async function performanceAudit() {
  console.log('🚀 Starting ResearchHub Performance Audit...');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // Collect performance metrics
  const metrics = {};
  
  console.log('📊 Testing Page Load Performance...');
  
  // Test main pages
  const pages = [
    { name: 'Homepage', url: 'http://localhost:5175/' },
    { name: 'Login', url: 'http://localhost:5175/login' },
    { name: 'Dashboard', url: 'http://localhost:5175/dashboard' },
    { name: 'Studies', url: 'http://localhost:5175/studies' }
  ];
  
  for (const testPage of pages) {
    console.log(`⏱️ Testing ${testPage.name}...`);
    
    const startTime = Date.now();
    await page.goto(testPage.url, { waitUntil: 'networkidle' });
    const loadTime = Date.now() - startTime;
    
    // Get performance metrics
    const performanceMetrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0];
      return {
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
        firstPaint: performance.getEntriesByType('paint').find(entry => entry.name === 'first-paint')?.startTime || 0,
        firstContentfulPaint: performance.getEntriesByType('paint').find(entry => entry.name === 'first-contentful-paint')?.startTime || 0
      };
    });
    
    metrics[testPage.name] = {
      totalLoadTime: loadTime,
      ...performanceMetrics,
      timestamp: new Date().toISOString()
    };
    
    console.log(`✅ ${testPage.name}: ${loadTime}ms total load time`);
  }
  
  // Test API performance
  console.log('🔗 Testing API Performance...');
  
  const apiTests = [
    { name: 'Health Check', url: 'http://localhost:3003/api/health' },
    { name: 'Auth Status', url: 'http://localhost:3003/api/auth?action=status' }
  ];
  
  for (const api of apiTests) {
    const startTime = Date.now();
    try {
      const response = await fetch(api.url);
      const responseTime = Date.now() - startTime;
      metrics[api.name] = {
        responseTime,
        status: response.status,
        timestamp: new Date().toISOString()
      };
      console.log(`✅ ${api.name}: ${responseTime}ms`);
    } catch (error) {
      console.log(`❌ ${api.name}: Failed - ${error.message}`);
      metrics[api.name] = {
        responseTime: -1,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }
  
  // Save results
  const auditReport = {
    timestamp: new Date().toISOString(),
    platform: 'ResearchHub Local Development',
    metrics,
    recommendations: generateRecommendations(metrics)
  };
  
  const reportPath = 'testing/performance/audit-report-' + new Date().toISOString().split('T')[0] + '.json';
  fs.writeFileSync(reportPath, JSON.stringify(auditReport, null, 2));
  
  console.log('\n📊 PERFORMANCE AUDIT COMPLETE');
  console.log('📁 Report saved to:', reportPath);
  console.log('\n🎯 QUICK ANALYSIS:');
  
  Object.entries(metrics).forEach(([name, data]) => {
    if (data.totalLoadTime) {
      const status = data.totalLoadTime < 3000 ? '✅ GOOD' : data.totalLoadTime < 5000 ? '⚠️ SLOW' : '❌ POOR';
      console.log(`   ${name}: ${data.totalLoadTime}ms ${status}`);
    } else if (data.responseTime) {
      const status = data.responseTime < 500 ? '✅ FAST' : data.responseTime < 1000 ? '⚠️ SLOW' : '❌ POOR';
      console.log(`   ${name}: ${data.responseTime}ms ${status}`);
    }
  });
  
  await browser.close();
  return auditReport;
}

function generateRecommendations(metrics) {
  const recommendations = [];
  
  // Check page load times
  Object.entries(metrics).forEach(([name, data]) => {
    if (data.totalLoadTime && data.totalLoadTime > 3000) {
      recommendations.push({
        type: 'performance',
        page: name,
        issue: `Slow page load: ${data.totalLoadTime}ms`,
        target: '<3000ms',
        priority: 'high'
      });
    }
    
    if (data.responseTime && data.responseTime > 500) {
      recommendations.push({
        type: 'api',
        endpoint: name,
        issue: `Slow API response: ${data.responseTime}ms`,
        target: '<500ms', 
        priority: 'medium'
      });
    }
  });
  
  return recommendations;
}

// Run the audit
if (require.main === module) {
  performanceAudit().catch(console.error);
}

module.exports = { performanceAudit };
