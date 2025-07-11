# ResearchHub - Automated Testing & Monitoring Setup

## 🤖 Automated Testing Framework

This document outlines automated testing tools and monitoring systems to complement manual testing efforts and ensure continuous platform reliability.

## 🎯 Testing Automation Strategy

### 1. **Critical Path Automation (High Priority)**

#### **Authentication Flow Automation**
```javascript
// Playwright test for authentication workflows
const { test, expect } = require('@playwright/test');

test.describe('Authentication System', () => {
  test('Participant login and dashboard access', async ({ page }) => {
    await page.goto('http://localhost:5175/login');
    await page.fill('input[type="email"]', 'abwanwr77+participant@gmail.com');
    await page.fill('input[type="password"]', 'Testtest123');
    await page.click('button:has-text("Sign In")');
    
    // Verify redirect to participant dashboard
    await expect(page).toHaveURL(/.*participant-dashboard/);
    await expect(page.locator('[data-testid="user-role"]')).toContainText('participant');
  });

  test('Researcher login and dashboard access', async ({ page }) => {
    // Similar automation for researcher flow
  });

  test('Admin login and panel access', async ({ page }) => {
    // Similar automation for admin flow
  });
});
```

#### **Study Creation Automation**
```javascript
test.describe('Study Creation Workflow', () => {
  test('Complete study creation from scratch', async ({ page }) => {
    // Login as researcher
    await authenticateAsResearcher(page);
    
    // Navigate to study creation
    await page.click('[data-testid="create-study-button"]');
    
    // Step 1: Study basics
    await page.fill('[data-testid="study-title"]', 'Automated Test Study');
    await page.fill('[data-testid="study-description"]', 'Test description');
    await page.click('[data-testid="next-step"]');
    
    // Step 2: Study settings
    await page.fill('[data-testid="duration"]', '15');
    await page.fill('[data-testid="participants"]', '10');
    await page.click('[data-testid="next-step"]');
    
    // Step 3: Add blocks
    await page.click('[data-testid="add-welcome-block"]');
    await page.click('[data-testid="add-question-block"]');
    await page.click('[data-testid="next-step"]');
    
    // Continue through all steps...
    
    // Verify study creation success
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
  });
});
```

### 2. **Performance Testing Automation**

#### **Load Testing with Artillery**
```yaml
# artillery-load-test.yml
config:
  target: 'http://localhost:5175'
  phases:
    - duration: 300  # 5 minutes
      arrivalRate: 10  # 10 users per second
  defaults:
    headers:
      Content-Type: 'application/json'

scenarios:
  - name: "User Login and Study Browse"
    weight: 60
    flow:
      - post:
          url: "/api/auth?action=login"
          json:
            email: "abwanwr77+participant@gmail.com"
            password: "Testtest123"
      - get:
          url: "/api/studies"
      - think: 5
      - get:
          url: "/api/studies/{{$randomInt(1, 10)}}"

  - name: "Study Creation"
    weight: 30
    flow:
      - post:
          url: "/api/auth?action=login"
          json:
            email: "abwanwr77+Researcher@gmail.com"
            password: "Testtest123"
      - post:
          url: "/api/studies"
          json:
            title: "Load Test Study {{$randomInt(1, 1000)}}"
            description: "Automated load test study"
      - think: 10

  - name: "Admin Operations"
    weight: 10
    flow:
      - post:
          url: "/api/auth?action=login"
          json:
            email: "abwanwr77+admin@gmail.com"
            password: "Testtest123"
      - get:
          url: "/api/admin/users"
      - get:
          url: "/api/admin/analytics"
```

#### **Lighthouse Performance Automation**
```javascript
// lighthouse-performance.js
const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');

async function runLighthouseTests() {
  const chrome = await chromeLauncher.launch({chromeFlags: ['--headless']});
  
  const pages = [
    'http://localhost:5175/',
    'http://localhost:5175/login',
    'http://localhost:5175/app/dashboard',
    'http://localhost:5175/app/studies',
    'http://localhost:5175/app/studies/create'
  ];

  const results = [];
  
  for (const url of pages) {
    const runnerResult = await lighthouse(url, {
      port: chrome.port,
      onlyCategories: ['performance', 'accessibility', 'best-practices']
    });
    
    results.push({
      url,
      performance: runnerResult.lhr.categories.performance.score * 100,
      accessibility: runnerResult.lhr.categories.accessibility.score * 100,
      bestPractices: runnerResult.lhr.categories['best-practices'].score * 100
    });
  }
  
  await chrome.kill();
  return results;
}
```

### 3. **API Testing Automation**

#### **Jest API Test Suite**
```javascript
// api-tests.spec.js
const request = require('supertest');
const app = require('../api/server'); // Your API server

describe('API Endpoints', () => {
  let authToken;
  
  beforeAll(async () => {
    // Get authentication token
    const loginResponse = await request(app)
      .post('/api/auth?action=login')
      .send({
        email: 'abwanwr77+Researcher@gmail.com',
        password: 'Testtest123'
      });
    
    authToken = loginResponse.body.session.accessToken;
  });

  describe('Studies API', () => {
    test('GET /api/studies returns study list', async () => {
      const response = await request(app)
        .get('/api/studies')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    test('POST /api/studies creates new study', async () => {
      const studyData = {
        title: 'API Test Study',
        description: 'Created via automated test',
        blocks: [
          { type: 'welcome', content: 'Welcome to the study' }
        ]
      };

      const response = await request(app)
        .post('/api/studies')
        .set('Authorization', `Bearer ${authToken}`)
        .send(studyData)
        .expect(201);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe(studyData.title);
    });
  });

  describe('Authentication API', () => {
    test('POST /api/auth?action=login with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth?action=login')
        .send({
          email: 'abwanwr77+participant@gmail.com',
          password: 'Testtest123'
        })
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.session.accessToken).toBeDefined();
    });

    test('POST /api/auth?action=login with invalid credentials', async () => {
      const response = await request(app)
        .post('/api/auth?action=login')
        .send({
          email: 'invalid@email.com',
          password: 'wrongpassword'
        })
        .expect(401);
      
      expect(response.body.success).toBe(false);
    });
  });
});
```

## 📊 Continuous Monitoring Setup

### 1. **Real-time Health Monitoring**

#### **System Health Dashboard**
```javascript
// health-monitor.js
const express = require('express');
const app = express();

// Health check endpoint
app.get('/api/health', async (req, res) => {
  const healthStatus = {
    timestamp: new Date().toISOString(),
    status: 'healthy',
    checks: {
      database: await checkDatabase(),
      authentication: await checkAuthentication(),
      api: await checkAPIEndpoints(),
      frontend: await checkFrontend()
    },
    metrics: {
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      cpu: process.cpuUsage()
    }
  };

  const hasFailures = Object.values(healthStatus.checks).some(check => !check.healthy);
  
  res.status(hasFailures ? 503 : 200).json(healthStatus);
});

async function checkDatabase() {
  try {
    // Check Supabase connection
    const { data, error } = await supabase.from('profiles').select('id').limit(1);
    return { healthy: !error, latency: Date.now() - start };
  } catch (error) {
    return { healthy: false, error: error.message };
  }
}
```

#### **Performance Metrics Collection**
```javascript
// metrics-collector.js
class MetricsCollector {
  constructor() {
    this.metrics = {
      pageLoads: new Map(),
      apiRequests: new Map(),
      errors: new Map(),
      userSessions: new Map()
    };
  }

  recordPageLoad(page, loadTime) {
    if (!this.metrics.pageLoads.has(page)) {
      this.metrics.pageLoads.set(page, []);
    }
    this.metrics.pageLoads.get(page).push({
      timestamp: Date.now(),
      loadTime
    });
  }

  recordAPIRequest(endpoint, responseTime, status) {
    if (!this.metrics.apiRequests.has(endpoint)) {
      this.metrics.apiRequests.set(endpoint, []);
    }
    this.metrics.apiRequests.get(endpoint).push({
      timestamp: Date.now(),
      responseTime,
      status
    });
  }

  getAveragePageLoadTime(page) {
    const loads = this.metrics.pageLoads.get(page) || [];
    if (loads.length === 0) return 0;
    return loads.reduce((sum, load) => sum + load.loadTime, 0) / loads.length;
  }

  getAPIErrorRate(endpoint) {
    const requests = this.metrics.apiRequests.get(endpoint) || [];
    if (requests.length === 0) return 0;
    const errors = requests.filter(req => req.status >= 400).length;
    return (errors / requests.length) * 100;
  }
}
```

### 2. **Automated Alerting System**

#### **Alert Configuration**
```javascript
// alert-system.js
class AlertSystem {
  constructor() {
    this.thresholds = {
      pageLoadTime: 3000, // 3 seconds
      apiResponseTime: 2000, // 2 seconds
      errorRate: 1, // 1%
      uptime: 99.9 // 99.9%
    };
    this.alertChannels = ['email', 'slack', 'webhook'];
  }

  checkThresholds(metrics) {
    const alerts = [];

    // Check page load times
    for (const [page, times] of metrics.pageLoads) {
      const avgTime = this.calculateAverage(times);
      if (avgTime > this.thresholds.pageLoadTime) {
        alerts.push({
          type: 'performance',
          severity: 'warning',
          message: `Page ${page} load time ${avgTime}ms exceeds threshold ${this.thresholds.pageLoadTime}ms`
        });
      }
    }

    // Check API response times
    for (const [endpoint, requests] of metrics.apiRequests) {
      const avgResponseTime = this.calculateAverage(requests.map(r => r.responseTime));
      if (avgResponseTime > this.thresholds.apiResponseTime) {
        alerts.push({
          type: 'api_performance',
          severity: 'warning',
          message: `API ${endpoint} response time ${avgResponseTime}ms exceeds threshold`
        });
      }

      const errorRate = this.calculateErrorRate(requests);
      if (errorRate > this.thresholds.errorRate) {
        alerts.push({
          type: 'api_errors',
          severity: 'critical',
          message: `API ${endpoint} error rate ${errorRate}% exceeds threshold`
        });
      }
    }

    return alerts;
  }

  async sendAlert(alert) {
    // Send to configured channels
    for (const channel of this.alertChannels) {
      switch (channel) {
        case 'email':
          await this.sendEmailAlert(alert);
          break;
        case 'slack':
          await this.sendSlackAlert(alert);
          break;
        case 'webhook':
          await this.sendWebhookAlert(alert);
          break;
      }
    }
  }
}
```

### 3. **User Experience Monitoring**

#### **Real User Monitoring (RUM)**
```javascript
// rum-client.js - Client-side monitoring
class RealUserMonitoring {
  constructor() {
    this.startTime = performance.now();
    this.setupEventListeners();
  }

  setupEventListeners() {
    // Page load timing
    window.addEventListener('load', () => {
      this.recordPageLoad();
    });

    // Error tracking
    window.addEventListener('error', (event) => {
      this.recordError({
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack
      });
    });

    // User interactions
    document.addEventListener('click', (event) => {
      this.recordInteraction('click', event.target);
    });

    // API call monitoring
    this.interceptFetch();
  }

  recordPageLoad() {
    const loadTime = performance.now() - this.startTime;
    this.sendMetric({
      type: 'page_load',
      page: window.location.pathname,
      loadTime,
      timestamp: Date.now()
    });
  }

  recordError(error) {
    this.sendMetric({
      type: 'error',
      error,
      page: window.location.pathname,
      userAgent: navigator.userAgent,
      timestamp: Date.now()
    });
  }

  recordInteraction(type, element) {
    this.sendMetric({
      type: 'interaction',
      interactionType: type,
      element: this.getElementSelector(element),
      page: window.location.pathname,
      timestamp: Date.now()
    });
  }

  interceptFetch() {
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const startTime = performance.now();
      try {
        const response = await originalFetch(...args);
        const endTime = performance.now();
        
        this.recordAPICall({
          url: args[0],
          method: args[1]?.method || 'GET',
          status: response.status,
          responseTime: endTime - startTime
        });

        return response;
      } catch (error) {
        this.recordAPICall({
          url: args[0],
          method: args[1]?.method || 'GET',
          error: error.message,
          responseTime: performance.now() - startTime
        });
        throw error;
      }
    };
  }

  async sendMetric(metric) {
    try {
      await fetch('/api/metrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(metric)
      });
    } catch (error) {
      console.error('Failed to send metric:', error);
    }
  }
}

// Initialize monitoring
if (typeof window !== 'undefined') {
  new RealUserMonitoring();
}
```

## 🔄 Automated Test Execution Schedule

### **Daily Automated Tests (Runs every 6 hours)**
```yaml
# github-actions-daily.yml
name: Daily Health Checks
on:
  schedule:
    - cron: '0 */6 * * *'  # Every 6 hours
  workflow_dispatch:

jobs:
  health-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm install
      
      - name: Run API health checks
        run: npm run test:api:health
      
      - name: Run authentication tests
        run: npm run test:auth
      
      - name: Run basic functionality tests
        run: npm run test:smoke
      
      - name: Send results to monitoring
        run: npm run monitoring:report
```

### **Weekly Comprehensive Tests**
```yaml
# github-actions-weekly.yml
name: Weekly Comprehensive Testing
on:
  schedule:
    - cron: '0 2 * * 1'  # Every Monday at 2 AM
  workflow_dispatch:

jobs:
  comprehensive-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup test environment
        run: |
          npm install
          npm run dev:build
      
      - name: Run Playwright E2E tests
        run: npm run test:e2e
      
      - name: Run performance tests
        run: npm run test:performance
      
      - name: Run accessibility tests
        run: npm run test:a11y
      
      - name: Run security tests
        run: npm run test:security
      
      - name: Generate test report
        run: npm run test:report
      
      - name: Upload test artifacts
        uses: actions/upload-artifact@v3
        with:
          name: test-results
          path: test-results/
```

## 📈 Monitoring Dashboard Setup

### **Metrics Dashboard Configuration**
```javascript
// dashboard-config.js
const dashboardConfig = {
  widgets: [
    {
      type: 'metric',
      title: 'System Uptime',
      query: 'avg(uptime_seconds)',
      format: 'percentage',
      threshold: { warning: 99, critical: 95 }
    },
    {
      type: 'chart',
      title: 'Page Load Times',
      query: 'avg(page_load_time) by page',
      timeRange: '24h',
      chartType: 'line'
    },
    {
      type: 'chart',
      title: 'API Response Times',
      query: 'avg(api_response_time) by endpoint',
      timeRange: '1h',
      chartType: 'bar'
    },
    {
      type: 'metric',
      title: 'Error Rate',
      query: 'rate(errors_total)',
      format: 'percentage',
      threshold: { warning: 1, critical: 5 }
    },
    {
      type: 'table',
      title: 'Recent Errors',
      query: 'last(errors) limit 10',
      columns: ['timestamp', 'type', 'message', 'user']
    }
  ],
  alerts: [
    {
      name: 'High Error Rate',
      condition: 'error_rate > 1',
      severity: 'warning',
      channels: ['email', 'slack']
    },
    {
      name: 'System Down',
      condition: 'uptime < 99',
      severity: 'critical',
      channels: ['email', 'slack', 'webhook']
    }
  ]
};
```

## 🚀 Implementation Steps

### **Phase 1: Basic Automation (Week 1)**
1. **Set up Playwright for E2E testing**
   ```bash
   npm install @playwright/test
   npx playwright install
   ```

2. **Create critical path tests**
   - Authentication flows
   - Study creation workflow
   - Basic user interactions

3. **Set up API testing with Jest**
   ```bash
   npm install jest supertest
   ```

### **Phase 2: Performance Monitoring (Week 2)**
1. **Implement Lighthouse automation**
2. **Set up load testing with Artillery**
3. **Create performance monitoring dashboard**

### **Phase 3: Production Monitoring (Week 3)**
1. **Deploy Real User Monitoring**
2. **Set up alerting system**
3. **Create comprehensive dashboard**

### **Phase 4: Continuous Integration (Week 4)**
1. **Set up GitHub Actions workflows**
2. **Integrate with monitoring systems**
3. **Establish reporting and review processes**

---

**This automated testing and monitoring framework ensures continuous platform reliability and provides early warning of issues before they impact users.**
