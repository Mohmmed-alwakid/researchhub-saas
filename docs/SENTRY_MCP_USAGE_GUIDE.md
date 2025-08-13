/**
 * ResearchHub Sentry Integration Usage Guide
 * How to use Sentry MCP tools for maximum value
 */

# Sentry MCP Tools - Usage Guide for ResearchHub

## 🚀 Quick Start Commands

### **1. Monitor Production Issues**
```bash
# Get real-time error overview
search_issues(
  organizationSlug='afkar',
  naturalLanguageQuery='errors from last 24 hours'
)

# Check specific error details
get_issue_details(
  organizationSlug='afkar',
  issueId='ERROR-ID-HERE'
)
```

### **2. Performance Analysis**
```bash
# Find slow API endpoints
search_events(
  organizationSlug='afkar',
  naturalLanguageQuery='slow API responses over 2 seconds'
)

# Track user behavior patterns
search_events(
  organizationSlug='afkar',
  naturalLanguageQuery='study creation events from last week'
)
```

### **3. AI-Powered Debugging**
```bash
# Get intelligent fix recommendations
analyze_issue_with_seer(
  organizationSlug='afkar',
  issueId='STUDY-BUILDER-ERROR'
)
```

## 🎯 ResearchHub-Specific Use Cases

### **Study Creation Issues**
```bash
# Monitor study creation failures
search_issues(
  organizationSlug='afkar',
  naturalLanguageQuery='study creation failures affecting researchers'
)

# Analyze study builder performance
search_events(
  organizationSlug='afkar',
  naturalLanguageQuery='study builder slow performance over 5 seconds'
)
```

### **Participant Experience Problems**
```bash
# Track participant drop-offs
search_events(
  organizationSlug='afkar',
  naturalLanguageQuery='participant session errors during study completion'
)

# Monitor mobile vs desktop issues
search_issues(
  organizationSlug='afkar',
  naturalLanguageQuery='mobile device errors affecting participants'
)
```

### **API Reliability Monitoring**
```bash
# Check API health across all 12 functions
search_events(
  organizationSlug='afkar',
  naturalLanguageQuery='API errors from authentication or research endpoints'
)

# Monitor database connection issues
search_issues(
  organizationSlug='afkar',
  naturalLanguageQuery='database connection failures in last hour'
)
```

### **Template System Analysis**
```bash
# Track template loading issues
search_events(
  organizationSlug='afkar',
  naturalLanguageQuery='template loading errors or slow performance'
)

# Monitor template usage patterns
search_events(
  organizationSlug='afkar',
  naturalLanguageQuery='template selection and usage from researchers'
)
```

## 🛠️ Development Workflow Integration

### **Daily Development Routine**
```bash
# Morning: Check overnight issues
search_issues(
  organizationSlug='afkar',
  naturalLanguageQuery='critical errors from last 12 hours'
)

# Before deployment: Validate recent changes
search_events(
  organizationSlug='afkar',
  naturalLanguageQuery='errors from test accounts in last 2 hours'
)

# After deployment: Monitor new issues
search_issues(
  organizationSlug='afkar',
  naturalLanguageQuery='new errors after latest deployment'
)
```

### **Feature Development**
```bash
# Before starting: Check related errors
search_issues(
  organizationSlug='afkar',
  naturalLanguageQuery='errors in study builder or related components'
)

# During development: Monitor test account usage
search_events(
  organizationSlug='afkar',
  naturalLanguageQuery='test account errors during development'
)

# Post-development: Validate feature health
search_events(
  organizationSlug='afkar',
  naturalLanguageQuery='feature usage and errors for new functionality'
)
```

## 📊 Advanced Monitoring Patterns

### **Business Intelligence**
```bash
# Track conversion funnel issues
search_events(
  organizationSlug='afkar',
  naturalLanguageQuery='user journey errors from signup to study creation'
)

# Monitor feature adoption
search_events(
  organizationSlug='afkar',
  naturalLanguageQuery='new feature usage and success rates'
)

# Analyze payment processing
search_events(
  organizationSlug='afkar',
  naturalLanguageQuery='payment errors or failures in researcher billing'
)
```

### **Performance Optimization**
```bash
# Identify bottlenecks
search_events(
  organizationSlug='afkar',
  naturalLanguageQuery='performance issues over 3 seconds response time'
)

# Mobile performance analysis
search_events(
  organizationSlug='afkar',
  naturalLanguageQuery='mobile performance issues or slow loading'
)

# Database optimization opportunities
search_events(
  organizationSlug='afkar',
  naturalLanguageQuery='database query performance over 1 second'
)
```

## 🚨 Alert Response Procedures

### **Critical Error Response**
```bash
# Step 1: Get error overview
get_issue_details(organizationSlug='afkar', issueId='CRITICAL-ERROR-ID')

# Step 2: Get AI analysis
analyze_issue_with_seer(organizationSlug='afkar', issueId='CRITICAL-ERROR-ID')

# Step 3: Check impact scope
search_events(
  organizationSlug='afkar',
  naturalLanguageQuery='similar errors affecting multiple users'
)

# Step 4: Monitor fix deployment
search_issues(
  organizationSlug='afkar',
  naturalLanguageQuery='new errors after hotfix deployment'
)
```

### **Performance Degradation Response**
```bash
# Identify source
search_events(
  organizationSlug='afkar',
  naturalLanguageQuery='slow performance issues in last 30 minutes'
)

# Check specific endpoints
search_events(
  organizationSlug='afkar',
  naturalLanguageQuery='API endpoint performance over acceptable thresholds'
)

# Monitor improvement
search_events(
  organizationSlug='afkar',
  naturalLanguageQuery='performance metrics after optimization'
)
```

## 🎯 Team Collaboration

### **Developer Handoffs**
```bash
# Document known issues
search_issues(
  organizationSlug='afkar',
  naturalLanguageQuery='open issues assigned to development team'
)

# Share context for fixes
get_issue_details(organizationSlug='afkar', issueId='ISSUE-FOR-HANDOFF')
```

### **QA/Testing Integration**
```bash
# Pre-release validation
search_issues(
  organizationSlug='afkar',
  naturalLanguageQuery='issues found during QA testing phase'
)

# Test environment monitoring
search_events(
  organizationSlug='afkar',
  naturalLanguageQuery='test account errors during QA validation'
)
```

## 📈 Reporting and Analytics

### **Weekly Reports**
```bash
# Error trend analysis
search_issues(
  organizationSlug='afkar',
  naturalLanguageQuery='error trends and patterns from last 7 days'
)

# Performance summary
search_events(
  organizationSlug='afkar',
  naturalLanguageQuery='performance metrics and improvements last week'
)

# User impact assessment
search_events(
  organizationSlug='afkar',
  naturalLanguageQuery='user-affecting errors and resolution time'
)
```

### **Monthly Business Reviews**
```bash
# Platform reliability metrics
search_events(
  organizationSlug='afkar',
  naturalLanguageQuery='uptime and reliability metrics for monthly review'
)

# Feature success analysis
search_events(
  organizationSlug='afkar',
  naturalLanguageQuery='feature adoption and error rates monthly summary'
)

# Growth impact assessment
search_events(
  organizationSlug='afkar',
  naturalLanguageQuery='scaling issues and performance under load'
)
```

## 🔧 Pro Tips for Maximum Value

### **1. Context-Rich Queries**
- Always include time frames: "in last 24 hours", "from last week"
- Specify user types: "affecting researchers", "participant errors"
- Include severity: "critical errors", "high priority issues"

### **2. Correlation Analysis**
- Look for patterns: "errors during peak hours"
- Check relationships: "deployment correlation with errors"
- Monitor trends: "increasing error rates in specific features"

### **3. Proactive Monitoring**
- Set up regular checks: Daily, weekly, monthly routines
- Monitor business metrics: Conversion rates, user satisfaction
- Track performance: Response times, success rates

### **4. Documentation Integration**
- Copy useful queries for team sharing
- Document resolution steps for future reference
- Create runbooks for common issue patterns

---

**Result**: Your team now has a comprehensive guide for leveraging Sentry MCP tools to maintain world-class reliability and performance for ResearchHub!
