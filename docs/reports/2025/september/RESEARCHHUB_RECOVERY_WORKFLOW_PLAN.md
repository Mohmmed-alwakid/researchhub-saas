# 🚀 RESEARCHHUB RECOVERY WORKFLOW PLAN
**Critical Production Fix Strategy - August 30, 2025**

---

## 📊 DATABASE STATUS ASSESSMENT

### ✅ **Database Configuration Analysis**
- **Platform**: Supabase PostgreSQL (production)
- **Connection**: Hardcoded fallback credentials in APIs
- **URL**: `https://wxpwxzdgdvinlbtnbgdf.supabase.co`
- **Status**: **CONNECTED** (research API returning real data)
- **Migration State**: Comprehensive SQL migrations available
- **Tables**: Foundation schema in place (users, studies, organizations)

### ⚠️ **Database Issues Identified**
1. **Environment Variable Mismatch**: `.env.production` configured for MongoDB, but APIs use Supabase
2. **Hardcoded Credentials**: Production using fallback Supabase keys instead of env vars
3. **Mixed Configuration**: Development uses MongoDB, production uses Supabase
4. **Template Data**: Database connected but templates API timeout suggests query performance issues

---

## 🎯 CRITICAL PATH WORKFLOW (5-Day Sprint)

### **DAY 1: TEMPLATES API TIMEOUT FIX** 🔥
**Priority**: HIGH - Fix templates functionality (Frontend is already working)

#### Morning (4 hours)
1. **Fix Templates API Performance Issue**
   ```bash
   # The frontend is working fine - issue is templates API timeout
   # Focus on optimizing the templates-consolidated.js endpoint
   
   # Test templates API locally
   npm run dev:fullstack
   # Test: http://localhost:3003/api/templates-consolidated?action=get-templates
   ```

2. **Identify Templates Performance Bottleneck**
   - Profile database queries in templates-consolidated.js
   - Check for infinite loops or blocking operations
   - Verify Supabase connection efficiency
   - Test with smaller result sets

#### Afternoon (4 hours)
3. **Implement Templates API Fix**
   - Add query optimization and indexes
   - Implement timeout and fallback handling
   - Add caching for template data
   - Deploy templates API fix

4. **Verification**
   - Test templates API responds within 10 seconds
   - Verify template loading in frontend works
   - Test template selection and creation flows

**Success Criteria**: ✅ Templates API functional, template features work in app

---

### **DAY 2: TEMPLATES API & DATABASE OPTIMIZATION** ⚡
**Priority**: HIGH - Restore full functionality

#### Morning (4 hours)
1. **Fix Templates API Timeout**
   ```javascript
   // Add to templates-consolidated.js
   const TIMEOUT_MS = 10000;
   const controller = new AbortController();
   setTimeout(() => controller.abort(), TIMEOUT_MS);
   
   // Implement database query optimization
   // Add caching for template data
   // Implement fallback to static templates
   ```

2. **Database Query Optimization**
   - Profile slow queries in templates endpoint
   - Add database indexes for template searches
   - Implement query result caching
   - Add connection pooling if needed

#### Afternoon (4 hours)
3. **Environment Variables Cleanup**
   ```bash
   # Vercel Dashboard - Environment Variables
   # Set proper Supabase credentials
   SUPABASE_URL=https://wxpwxzdgdvinlbtnbgdf.supabase.co
   SUPABASE_ANON_KEY=[production_key]
   SUPABASE_SERVICE_ROLE_KEY=[production_service_key]
   
   # Remove MongoDB references from production
   # Clean up environment variable conflicts
   ```

4. **Database Connection Optimization**
   - Verify all APIs use environment variables (not hardcoded)
   - Test all database operations
   - Optimize connection handling

**Success Criteria**: ✅ Templates API responds within 5 seconds, all database operations optimized

---

### **DAY 3: PRODUCTION MONITORING & ERROR HANDLING** 📊
**Priority**: MEDIUM - Prevent future issues

#### Morning (4 hours)
1. **Remove Console Error Suppression**
   ```javascript
   // Remove from main.tsx
   // const suppressPatterns = [...]; // DELETE THIS
   // orig.warn = console.warn; // RESTORE ORIGINAL
   // orig.error = console.error; // RESTORE ORIGINAL
   ```

2. **Implement Proper Error Monitoring**
   - Configure Sentry for production (remove 'disabled' setting)
   - Add error boundaries with meaningful error reporting
   - Implement API error logging
   - Add performance monitoring

#### Afternoon (4 hours)
3. **API Health Monitoring**
   ```javascript
   // Add to each API endpoint
   const startTime = performance.now();
   // ... API logic ...
   const endTime = performance.now();
   console.log(`API ${action} took ${endTime - startTime}ms`);
   ```

4. **Database Health Checks**
   - Add database connectivity checks
   - Implement automatic retry logic
   - Add connection status monitoring
   - Set up alerts for failures

**Success Criteria**: ✅ Real-time error monitoring active, performance metrics visible

---

### **DAY 4: COMPREHENSIVE FEATURE TESTING** 🧪
**Priority**: MEDIUM - Ensure all features work

#### Morning (4 hours)
1. **User Journey Testing**
   ```bash
   # Test all critical user flows
   # 1. User Registration → Login
   # 2. Study Creation → Publishing
   # 3. Participant Application → Study Completion
   # 4. Results Viewing → Data Export
   ```

2. **API Endpoint Validation**
   - Test all 12 deployed functions
   - Verify authentication flows
   - Test study creation/management
   - Validate template system
   - Check payment processing

#### Afternoon (4 hours)
3. **Database Operations Testing**
   - Test all CRUD operations
   - Verify RLS policies work correctly
   - Test user permissions and roles
   - Validate data integrity

4. **Performance Testing**
   - Load test critical endpoints
   - Test with multiple concurrent users
   - Validate response times under load
   - Check memory usage and optimization

**Success Criteria**: ✅ All major features functional, performance within acceptable limits

---

### **DAY 5: OPTIMIZATION & DOCUMENTATION** 📚
**Priority**: LOW - Polish and future-proofing

#### Morning (4 hours)
1. **Performance Optimization**
   - Optimize bundle sizes
   - Implement lazy loading improvements
   - Add caching strategies
   - Optimize database queries

2. **User Experience Improvements**
   - Add proper loading states
   - Improve error messages
   - Optimize mobile responsiveness
   - Add progress indicators

#### Afternoon (4 hours)
3. **Documentation & Runbooks**
   - Create production troubleshooting guide
   - Document environment setup
   - Create incident response procedures
   - Update deployment documentation

4. **Future Maintenance Setup**
   - Set up automated health checks
   - Configure monitoring dashboards
   - Plan regular maintenance schedule
   - Create backup procedures

**Success Criteria**: ✅ Platform optimized, documented, and ready for production use

---

## � CURRENT STATUS ASSESSMENT - CORRECTED

### ✅ **WHAT'S ACTUALLY WORKING WELL**
- **Frontend Application**: ✅ **FULLY FUNCTIONAL** - Site loads correctly, navigation works
- **Core API Infrastructure**: ✅ Health endpoint and research APIs operational  
- **Database Connectivity**: ✅ Supabase connection active, returning real data
- **User Interface**: ✅ React app initializes properly, no loading issues
- **Authentication System**: ✅ Core auth infrastructure operational
- **Deployment Pipeline**: ✅ Vercel deployment successful with proper headers

### ❌ **ONLY ISSUE IDENTIFIED**
1. **Templates API Timeout**: `FUNCTION_INVOCATION_TIMEOUT` on templates endpoint
   - **Status**: ❌ **SINGLE POINT OF FAILURE**
   - **Impact**: Template functionality non-functional, affects study creation
   - **Scope**: Isolated to templates - main app works fine

### 🎯 **REVISED PRIORITY ASSESSMENT**
- **Priority 1**: Fix templates API timeout (only broken feature)
- **Priority 2**: Database query optimization for templates
- **Priority 3**: Add monitoring and optimization
- **Priority 4**: Performance and polish improvements

**Critical Update**: The frontend is working perfectly. This is a **2-day fix** focused only on templates performance.

### **Fix 2: Templates API Timeout**
```javascript
// api/templates-consolidated.js - Add timeout and fallback
export default async function handler(req, res) {
  const startTime = Date.now();
  
  try {
    // Set response timeout
    res.setTimeout(25000); // 25 seconds (under 30s Vercel limit)
    
    // Quick fallback for timeout
    if (req.query.action === 'get-templates') {
      // Try database first
      try {
        const result = await getTemplatesFromDB();
        return res.json(result);
      } catch (dbError) {
        console.warn('DB timeout, using fallback:', dbError);
        // Return static templates immediately
        return res.json({ 
          success: true, 
          templates: FALLBACK_TEMPLATES 
        });
      }
    }
  } catch (error) {
    console.error('Templates API error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Templates temporarily unavailable' 
    });
  }
}
```

### **Fix 3: Environment Variables**
```bash
# Vercel Dashboard - Add these environment variables:
SUPABASE_URL=https://wxpwxzdgdvinlbtnbgdf.supabase.co
SUPABASE_ANON_KEY='PLACEHOLDER_SUPABASE_SERVICE_ROLE_KEY'.
SUPABASE_SERVICE_ROLE_KEY='PLACEHOLDER_SUPABASE_SERVICE_ROLE_KEY'.
NODE_ENV=production
```

---

## 📊 DATABASE MIGRATION CHECKLIST

### **Current Database Status**: ✅ FUNCTIONAL
- [x] Supabase connection active
- [x] Basic tables created (users, studies)
- [x] Authentication working
- [x] Data retrieval functional
- [ ] Performance optimized
- [ ] All migrations applied
- [ ] Proper indexing implemented

### **Required Database Actions**

#### **Immediate (Day 2)**
1. **Apply Performance Indexes**
   ```sql
   -- Add to Supabase SQL Editor
   CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_studies_creator_id ON studies(creator_id);
   CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_studies_status ON studies(status);
   CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_templates_category ON templates(category);
   CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_study_applications_study_id ON study_applications(study_id);
   ```

2. **Optimize Template Queries**
   ```sql
   -- Add template search optimization
   CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_templates_search ON templates USING gin(to_tsvector('english', name || ' ' || description));
   ```

#### **Short-term (Day 3-4)**
3. **Verify RLS Policies**
   ```sql
   -- Check all Row Level Security policies are active
   SELECT schemaname, tablename, policyname, roles, cmd, qual 
   FROM pg_policies 
   WHERE schemaname = 'public';
   ```

4. **Data Integrity Checks**
   ```sql
   -- Verify data consistency
   SELECT COUNT(*) as total_users FROM auth.users;
   SELECT COUNT(*) as total_studies FROM studies;
   SELECT COUNT(*) as total_templates FROM templates;
   ```

---

## 🎯 SUCCESS METRICS

### **Day 1 Success Criteria**
- [ ] Production site loads (not stuck on "Loading page...")
- [ ] Users can access login/registration
- [ ] Basic navigation functional
- [ ] No critical JavaScript errors

### **Day 2 Success Criteria**
- [ ] Templates API responds < 10 seconds
- [ ] All database operations optimized
- [ ] Environment variables properly configured
- [ ] All APIs use env vars (not hardcoded values)

### **Day 3 Success Criteria**
- [ ] Real error monitoring active
- [ ] Performance metrics visible
- [ ] Database health checks implemented
- [ ] Console errors no longer suppressed

### **Day 4 Success Criteria**
- [ ] Complete user registration → study creation → participation flow working
- [ ] All 12 API functions validated
- [ ] Performance within acceptable ranges
- [ ] No critical bugs identified

### **Day 5 Success Criteria**
- [ ] Platform optimized for production use
- [ ] Documentation updated
- [ ] Monitoring dashboards configured
- [ ] Incident response procedures documented

---

## ⚠️ RISK MITIGATION

### **High-Risk Areas**
1. **Templates API**: Current timeout issue could recur
   - **Mitigation**: Implement comprehensive fallback system
   - **Monitoring**: Add performance alerts

2. **Database Performance**: Unoptimized queries may cause slowdowns
   - **Mitigation**: Apply all necessary indexes
   - **Monitoring**: Query performance tracking

3. **Environment Variables**: Mismatch between dev/prod configurations
   - **Mitigation**: Audit and standardize all environment settings
   - **Monitoring**: Environment validation checks

### **Rollback Plan**
- Keep current working research API as fallback
- Maintain static template fallbacks
- Document all changes for quick reversal
- Test rollback procedures before implementing fixes

---

## 📞 DAILY CHECKPOINT MEETINGS

### **Daily Standup Format**
- **Yesterday**: What was completed
- **Today**: What will be worked on
- **Blockers**: Any issues preventing progress
- **Metrics**: Current platform health status

### **End-of-Day Reports**
- **Functionality Status**: What's working/broken
- **Performance Metrics**: Response times, error rates
- **User Impact**: Can users access the platform?
- **Next Day Priority**: Most critical task for tomorrow

---

**Timeline**: 5 days (August 30 - September 3, 2025)  
**Primary Goal**: Restore full production functionality  
**Success Definition**: Users can complete end-to-end workflows without errors  
**Risk Level**: Medium (good architecture, specific issues to fix)
