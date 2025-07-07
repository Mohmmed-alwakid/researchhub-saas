# Vibe-Coder-MCP Troubleshooting Runbook

**Version**: 1.0.0  
**Last Updated**: July 7, 2025  
**Purpose**: Quick reference for common issues and solutions  

---

## 🚨 Emergency Procedures

### System Down - Complete Outage

**Immediate Actions** (Priority 1):

1. **Check System Status**
   ```bash
   curl http://localhost:3003/api/health
   curl https://your-domain.com/api/health
   ```

2. **Verify Services**
   ```bash
   # Check if servers are running
   ps aux | grep node
   netstat -tulpn | grep :3003
   netstat -tulpn | grep :5175
   ```

3. **Restart Services**
   ```bash
   # Kill existing processes
   pkill -f "node.*3003"
   pkill -f "vite.*5175"
   
   # Restart development environment
   npm run dev:fullstack
   ```

4. **Check Logs**
   ```bash
   tail -100 logs/error.log
   tail -100 logs/application.log
   ```

### Database Connection Failure

**Immediate Actions**:

1. **Verify Supabase Status**
   ```bash
   curl "${SUPABASE_URL}/rest/v1/health" \
     -H "apikey: ${SUPABASE_ANON_KEY}"
   ```

2. **Check Environment Variables**
   ```bash
   echo "URL: $SUPABASE_URL"
   echo "Key: $SUPABASE_ANON_KEY"
   ```

3. **Test Database Connection**
   ```bash
   node -e "
   const { createClient } = require('@supabase/supabase-js');
   const client = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
   client.from('users').select('count').then(console.log).catch(console.error);
   "
   ```

---

## 🔧 Common Issues & Solutions

### Authentication Issues

#### Issue: Login/Register Not Working

**Symptoms**:
- Login requests failing
- Token errors in console
- 401/403 responses

**Quick Diagnosis**:
```bash
# Test authentication endpoint
curl -X POST http://localhost:3003/api/auth?action=login \
  -H "Content-Type: application/json" \
  -d '{"email":"abwanwr77+admin@gmail.com","password":"Testtest123"}'
```

**Common Causes & Solutions**:

1. **Environment Variables Missing**
   ```bash
   # Check required variables
   echo $SUPABASE_URL
   echo $SUPABASE_ANON_KEY
   echo $SUPABASE_SERVICE_ROLE_KEY
   
   # If missing, set them:
   export SUPABASE_URL="your-url"
   export SUPABASE_ANON_KEY="your-key"
   ```

2. **CORS Configuration**
   ```javascript
   // Check cors.config.js or api setup
   const corsConfig = {
     origin: ['http://localhost:5175', 'https://your-domain.com'],
     credentials: true
   };
   ```

3. **JWT Token Issues**
   ```bash
   # Check token validity
   node -e "
   const jwt = require('jsonwebtoken');
   const token = 'your-token-here';
   try {
     const decoded = jwt.decode(token);
     console.log('Token valid:', decoded);
   } catch (e) {
     console.log('Token invalid:', e.message);
   }
   "
   ```

#### Issue: User Roles Not Working

**Symptoms**:
- Role-based access failing
- Admin features not accessible
- Permission errors

**Solutions**:

1. **Check User Profile**
   ```sql
   -- In Supabase SQL editor
   SELECT id, email, role FROM profiles WHERE email = 'user@example.com';
   ```

2. **Update Role Manually**
   ```sql
   -- Fix user role
   UPDATE profiles SET role = 'admin' WHERE email = 'abwanwr77+admin@gmail.com';
   UPDATE profiles SET role = 'researcher' WHERE email = 'abwanwr77+Researcher@gmail.com';
   UPDATE profiles SET role = 'participant' WHERE email = 'abwanwr77+participant@gmail.com';
   ```

3. **Test Role-Based Access**
   ```bash
   # Test with admin user
   curl -X GET http://localhost:3003/api/admin/users \
     -H "Authorization: Bearer your-admin-token"
   ```

### Performance Issues

#### Issue: Slow Response Times

**Symptoms**:
- API calls taking >2 seconds
- Frontend loading slowly
- Database queries timing out

**Quick Diagnosis**:
```bash
# Run performance tests
npm run test:performance

# Check system resources
top
free -h
df -h
```

**Solutions**:

1. **Database Optimization**
   ```sql
   -- Check slow queries
   SELECT query, mean_time, calls 
   FROM pg_stat_statements 
   ORDER BY mean_time DESC 
   LIMIT 10;
   
   -- Add missing indexes
   CREATE INDEX CONCURRENTLY idx_studies_user_id ON studies(user_id);
   CREATE INDEX CONCURRENTLY idx_applications_study_id ON applications(study_id);
   ```

2. **API Caching**
   ```typescript
   // Enable caching in API client
   const api = new ApiClient({
     enableCache: true,
     cacheConfig: {
       ttl: 300, // 5 minutes
       maxSize: 100 // 100 MB
     }
   });
   ```

3. **Frontend Optimization**
   ```bash
   # Analyze bundle size
   npm run build:analyze
   
   # Check for large dependencies
   npx bundlephobia@latest analyze package.json
   ```

#### Issue: High Memory Usage

**Symptoms**:
- Node.js process using >1GB RAM
- Out of memory errors
- Slow garbage collection

**Solutions**:

1. **Check Memory Leaks**
   ```bash
   # Monitor memory usage
   node --inspect server.js
   
   # Profile memory
   node --prof server.js
   ```

2. **Optimize Code**
   ```typescript
   // Clear intervals and timeouts
   useEffect(() => {
     const interval = setInterval(() => {}, 1000);
     return () => clearInterval(interval);
   }, []);
   
   // Cleanup event listeners
   useEffect(() => {
     const handler = () => {};
     window.addEventListener('resize', handler);
     return () => window.removeEventListener('resize', handler);
   }, []);
   ```

### Build & Deployment Issues

#### Issue: TypeScript Compilation Errors

**Symptoms**:
- Build failing with TS errors
- Type checking failures
- Missing type definitions

**Quick Diagnosis**:
```bash
# Check TypeScript errors
npx tsc --noEmit

# Check specific file
npx tsc --noEmit src/path/to/file.ts
```

**Solutions**:

1. **Common Type Fixes**
   ```typescript
   // Fix: any type usage
   // Bad
   const data: any = {};
   
   // Good
   interface Data {
     id: string;
     name: string;
   }
   const data: Data = { id: '1', name: 'test' };
   
   // Fix: optional chaining
   // Bad
   const value = data.user.profile.name;
   
   // Good
   const value = data?.user?.profile?.name;
   ```

2. **Missing Dependencies**
   ```bash
   # Install missing types
   npm install --save-dev @types/node
   npm install --save-dev @types/react
   npm install --save-dev @types/react-dom
   ```

3. **TypeScript Configuration**
   ```json
   // tsconfig.json
   {
     "compilerOptions": {
       "strict": true,
       "skipLibCheck": true,
       "moduleResolution": "node"
     },
     "include": ["src/**/*"],
     "exclude": ["node_modules", "dist"]
   }
   ```

#### Issue: Deployment Failures

**Symptoms**:
- Vercel deployment failing
- Build timeouts
- Environment variable issues

**Solutions**:

1. **Check Build Locally**
   ```bash
   # Test production build
   npm run build
   
   # Check build output
   ls -la dist/
   ```

2. **Verify Environment Variables**
   ```bash
   # In Vercel dashboard, check:
   # - SUPABASE_URL
   # - SUPABASE_ANON_KEY
   # - SUPABASE_SERVICE_ROLE_KEY
   
   # Test with Vercel CLI
   vercel env ls
   ```

3. **Function Size Issues**
   ```bash
   # Check function sizes
   vercel functions ls
   
   # Optimize large functions
   # Split into smaller functions
   # Remove unnecessary dependencies
   ```

### Testing Issues

#### Issue: Tests Failing

**Symptoms**:
- Test suite not running
- Browser not launching
- Playwright errors

**Quick Diagnosis**:
```bash
# Run specific test
npm run test:quick

# Run with verbose output
npm run test:quick -- --verbose

# Check Playwright installation
npx playwright --version
```

**Solutions**:

1. **Playwright Setup**
   ```bash
   # Reinstall Playwright
   npx playwright install
   
   # Install browser dependencies
   npx playwright install-deps
   ```

2. **Test Environment Issues**
   ```bash
   # Start test servers
   npm run dev:fullstack
   
   # Wait for servers to be ready
   npx wait-on http://localhost:5175
   npx wait-on http://localhost:3003
   ```

3. **Test Data Issues**
   ```bash
   # Reset test data
   npm run test:data:reset
   
   # Generate fresh test data
   npm run test:data:generate
   ```

---

## 📊 Monitoring & Alerts

### Health Check Endpoints

**System Health**:
```bash
# Main health check
curl http://localhost:3003/api/health

# Detailed status
curl http://localhost:3003/api/monitoring/status

# Performance metrics
curl http://localhost:3003/api/monitoring/metrics
```

**Response Examples**:

Healthy System:
```json
{
  "status": "healthy",
  "timestamp": "2025-07-07T12:00:00Z",
  "services": {
    "database": "connected",
    "cache": "operational",
    "notifications": "running"
  },
  "performance": {
    "responseTime": 150,
    "memoryUsage": 45,
    "cpuUsage": 12
  }
}
```

Unhealthy System:
```json
{
  "status": "unhealthy",
  "timestamp": "2025-07-07T12:00:00Z",
  "services": {
    "database": "error",
    "cache": "operational",
    "notifications": "running"
  },
  "errors": [
    "Database connection timeout"
  ]
}
```

### Alert Thresholds

**Performance Alerts**:
- Response time > 2 seconds
- Memory usage > 80%
- CPU usage > 90%
- Error rate > 5%

**Security Alerts**:
- Failed login attempts > 10/hour
- Suspicious activity detected
- Rate limit exceeded
- Unauthorized access attempts

**System Alerts**:
- Service downtime > 1 minute
- Database connection lost
- High disk usage > 90%

---

## 🛠️ Recovery Procedures

### Database Recovery

#### Backup and Restore

**Create Backup**:
```bash
# Database dump
supabase db dump --local > backup_$(date +%Y%m%d_%H%M%S).sql

# Export specific tables
supabase db dump --local --schema public --table users > users_backup.sql
```

**Restore from Backup**:
```bash
# Full restore
supabase db reset --db-url "your-backup-url"

# Restore specific table
psql -h localhost -U postgres -d postgres < users_backup.sql
```

#### Data Corruption Recovery

**Check Data Integrity**:
```sql
-- Check for corrupted data
SELECT COUNT(*) FROM users WHERE id IS NULL;
SELECT COUNT(*) FROM studies WHERE created_at > NOW();

-- Verify foreign key constraints
SELECT * FROM applications a 
LEFT JOIN studies s ON a.study_id = s.id 
WHERE s.id IS NULL;
```

**Fix Corrupted Data**:
```sql
-- Remove invalid records
DELETE FROM applications WHERE study_id NOT IN (SELECT id FROM studies);

-- Fix data types
UPDATE users SET created_at = NOW() WHERE created_at IS NULL;
```

### Application Recovery

#### Service Restart

**Graceful Restart**:
```bash
# Stop services gracefully
npm run stop

# Clear caches
rm -rf .next/cache
rm -rf node_modules/.cache

# Restart services
npm run dev:fullstack
```

**Force Restart**:
```bash
# Kill all node processes
pkill -f node

# Clear all caches and tmp files
rm -rf /tmp/npm-*
rm -rf ~/.npm/_cacache

# Fresh start
npm install
npm run dev:fullstack
```

#### Rollback Procedures

**Code Rollback**:
```bash
# Rollback to previous version
git log --oneline -10
git checkout <previous-commit-hash>

# Create rollback branch
git checkout -b rollback-$(date +%Y%m%d)
git push origin rollback-$(date +%Y%m%d)
```

**Database Rollback**:
```bash
# Rollback database migration
supabase migration down

# Restore from backup
supabase db reset --db-url "backup-url"
```

---

## 📋 Escalation Procedures

### Incident Severity Levels

**Level 1 - Critical (15 min response)**:
- Complete system outage
- Security breach
- Data loss
- Payment system failure

**Level 2 - High (1 hour response)**:
- Major feature unavailable
- Performance degradation >50%
- Database connection issues
- Authentication failures

**Level 3 - Medium (4 hours response)**:
- Minor feature issues
- Slow performance <50%
- Non-critical bugs
- UI/UX issues

**Level 4 - Low (24 hours response)**:
- Enhancement requests
- Documentation updates
- Non-urgent optimizations

### Contact Information

**On-Call Rotation**:
```
Primary: Technical Lead
Secondary: Senior Developer
Tertiary: DevOps Engineer
```

**Escalation Chain**:
1. **Level 1**: Immediate team notification
2. **Level 2**: Team lead + stakeholders
3. **Level 3**: Management notification
4. **Level 4**: Executive briefing

---

## 📝 Incident Documentation

### Incident Report Template

```markdown
# Incident Report #[ID]

**Date**: [YYYY-MM-DD]
**Time**: [HH:MM UTC]
**Severity**: [1-4]
**Status**: [Open/Resolved/Closed]

## Summary
Brief description of the incident.

## Timeline
- **HH:MM** - Issue detected
- **HH:MM** - Investigation started
- **HH:MM** - Root cause identified
- **HH:MM** - Fix implemented
- **HH:MM** - Issue resolved

## Root Cause
Detailed explanation of what caused the issue.

## Resolution
Steps taken to resolve the issue.

## Prevention
Measures to prevent similar incidents.

## Follow-up Actions
- [ ] Action item 1
- [ ] Action item 2
```

### Post-Incident Review

**Required for Level 1-2 Incidents**:

1. **Incident Timeline Analysis**
2. **Root Cause Analysis**
3. **Resolution Effectiveness**
4. **Prevention Strategies**
5. **Process Improvements**

---

## 🔍 Diagnostic Commands

### Quick System Check

```bash
#!/bin/bash
# quick-check.sh - System health diagnostic

echo "=== Vibe-Coder-MCP System Check ==="
echo "Date: $(date)"
echo

# Check processes
echo "--- Running Processes ---"
ps aux | grep -E "(node|npm)" | grep -v grep

# Check ports
echo -e "\n--- Port Status ---"
netstat -tulpn | grep -E "(3003|5175)"

# Check health endpoints
echo -e "\n--- Health Checks ---"
curl -s http://localhost:3003/api/health || echo "API health check failed"
curl -s http://localhost:5175 > /dev/null && echo "Frontend accessible" || echo "Frontend check failed"

# Check disk space
echo -e "\n--- Disk Space ---"
df -h | grep -E "(/$|/tmp)"

# Check memory
echo -e "\n--- Memory Usage ---"
free -h

# Check logs for errors
echo -e "\n--- Recent Errors ---"
tail -20 logs/error.log 2>/dev/null || echo "No error log found"

echo -e "\n=== Check Complete ==="
```

### Performance Diagnostic

```bash
#!/bin/bash
# performance-check.sh - Performance diagnostic

echo "=== Performance Diagnostic ==="

# API response times
echo "--- API Response Times ---"
time curl -s http://localhost:3003/api/health > /dev/null

# Database query performance
echo -e "\n--- Database Performance ---"
node -e "
const start = Date.now();
const { createClient } = require('@supabase/supabase-js');
const client = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
client.from('users').select('count').then(() => {
  console.log('DB query time:', Date.now() - start, 'ms');
}).catch(console.error);
"

# Memory usage
echo -e "\n--- Memory Usage ---"
ps aux | grep node | awk '{sum+=$6} END {print "Total Node.js memory:", sum/1024, "MB"}'

# CPU usage
echo -e "\n--- CPU Usage ---"
top -bn1 | grep "Cpu(s)" | awk '{print "CPU usage:", $2}' | cut -d'%' -f1
```

---

## 📚 Quick Reference

### Important File Locations

```
Configuration:
- .env.local - Environment variables
- package.json - Dependencies and scripts
- tsconfig.json - TypeScript configuration
- vite.config.ts - Vite configuration

Logs:
- logs/application.log - Application logs
- logs/error.log - Error logs
- logs/access.log - API access logs

Scripts:
- scripts/vibe-coder/ - Vibe-Coder-MCP scripts
- local-*.html - Local testing interfaces

Documentation:
- docs/vibe-coder/ - Vibe-Coder-MCP docs
- README.md - Project overview
```

### Useful Commands

```bash
# Development
npm run dev:fullstack    # Start full development environment
npm run dev:client       # Frontend only
npm run dev:local        # Backend only

# Testing
npm run test:quick       # Quick tests (2-3 min)
npm run test:weekly      # Full tests (15-20 min)
npm run test:performance # Performance tests

# Deployment
npm run build           # Production build
npm run deploy          # Deploy to production

# Diagnostics
npx tsc --noEmit       # TypeScript check
npm audit              # Security audit
npm run health-check   # System health
```

### Test Account Credentials

```bash
# Admin
Email: abwanwr77+admin@gmail.com
Password: Testtest123
Role: admin

# Researcher
Email: abwanwr77+Researcher@gmail.com
Password: Testtest123
Role: researcher

# Participant
Email: abwanwr77+participant@gmail.com
Password: Testtest123
Role: participant
```

---

*This troubleshooting runbook is part of the Vibe-Coder-MCP documentation. Keep it updated with new issues and solutions as they are discovered.*
