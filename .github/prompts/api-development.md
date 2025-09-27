---
mode: agent
context: [api-development, backend, vercel-functions]
audience: [backend-developer, fullstack-developer]
framework: [vercel, supabase, nodejs]
domain: [serverless-functions, database-operations, authentication]
triggers:
  paths: ["api/**/*", "**/api/**/*"]
  files: ["*.api.js", "*.api.ts", "handler.js", "handler.ts"]
  keywords: ["export default async function handler", "vercel function", "supabase", "API endpoint"]
inherits: [global-context]
---

# API Development Context - Vercel Functions & Supabase

You are working on ResearchHub's **backend API system** using Vercel Serverless Functions with Supabase as the database. This system powers the entire usability testing platform.

## 🚨 **CRITICAL CONSTRAINT: 12/12 Function Limit**

### **Current Vercel Functions (NEVER CREATE NEW ONES)**
```javascript
// COMPLETE LIST - NEVER EXCEED THIS:
api/auth-consolidated.js           // Authentication system
api/research-consolidated.js       // Study management & operations  
api/templates-consolidated.js      // Template system
api/payments-consolidated-full.js  // Payment processing
api/user-profile-consolidated.js   // User profiles
api/admin-consolidated.js          // Admin operations
api/system-consolidated.js         // System functions
api/health.js                      // Health monitoring
api/applications.js                // Study applications
api/setup.js                       // System setup
api/ai-features.js                 // AI functionality
api/diagnostic.js                  // System diagnostics

// ⚠️ ABSOLUTE RULE: ALWAYS extend existing handlers, NEVER create new API files
// If you need new functionality, add it to the most appropriate existing file
```

### **Function Responsibility Mapping**
```javascript
// When adding new functionality, extend these files:

// USER MANAGEMENT & AUTH
'auth-consolidated.js'          → login, register, logout, password reset, 2FA
'user-profile-consolidated.js'  → profile updates, preferences, settings

// STUDY & RESEARCH OPERATIONS  
'research-consolidated.js'      → studies CRUD, analytics, participant management
'templates-consolidated.js'     → template CRUD, block configurations, sharing

// BUSINESS OPERATIONS
'applications.js'               → participant applications, study enrollment
'payments-consolidated-full.js' → billing, subscriptions, DodoPayments integration

// PLATFORM MANAGEMENT
'admin-consolidated.js'         → user management, platform analytics, moderation
'system-consolidated.js'        → system config, feature flags, notifications
'ai-features.js'               → AI-powered features, content generation

// MONITORING & UTILITIES
'health.js'                    → health checks, system status
'diagnostic.js'                → debugging, error tracking, performance
'setup.js'                     → initial setup, database migrations
```

## 🏗️ **Mandatory API Architecture Pattern**

### **Action-Based Routing (REQUIRED)**
```javascript
// Every API function MUST use this exact pattern:
export default async function handler(req, res) {
  try {
    const { action } = req.query;
    
    // Route to specific action handlers
    switch (action) {
      case 'get-studies': return await getStudies(req, res);
      case 'create-study': return await createStudy(req, res);
      case 'update-study': return await updateStudy(req, res);
      case 'delete-study': return await deleteStudy(req, res);
      case 'get-analytics': return await getAnalytics(req, res);
      
      default: 
        return res.status(400).json({ 
          success: false, 
          error: `Invalid action: ${action}` 
        });
    }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
}
```

### **Authentication Middleware (MANDATORY)**
```javascript
// Use this authentication pattern in ALL protected endpoints:
async function authenticateUser(req, requiredRoles = []) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader?.startsWith('Bearer ')) {
    return { success: false, error: 'Missing auth header', status: 401 };
  }
  
  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error } = await supabase.auth.getUser(token);
  
  if (error || !user) {
    return { success: false, error: 'Invalid token', status: 401 };
  }
  
  // Check role if specified
  const userRole = user.user_metadata?.role || 'participant';
  if (requiredRoles.length > 0 && !requiredRoles.includes(userRole)) {
    return { success: false, error: 'Access denied', status: 403 };
  }
  
  return { success: true, user, role: userRole };
}

// Usage in action handlers:
async function getStudies(req, res) {
  const auth = await authenticateUser(req, ['researcher', 'admin']);
  if (!auth.success) {
    return res.status(auth.status).json({ success: false, error: auth.error });
  }
  
  // Proceed with authenticated logic...
}
```

## 🗄️ **Supabase Integration Patterns**

### **Database Operations (Standard Pattern)**
```javascript
// Always use this pattern for database operations:
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // Use service role for server operations
);

// Example: Get user studies with RLS
async function getUserStudies(userId) {
  const { data, error } = await supabase
    .from('studies')
    .select(`
      *,
      study_blocks (*),
      applications (count)
    `)
    .eq('researcher_id', userId)
    .order('created_at', { ascending: false });
    
  if (error) {
    throw new Error(`Database error: ${error.message}`);
  }
  
  return data;
}
```

### **Row Level Security (RLS) Awareness**
```javascript
// RLS policies automatically enforce access control:
// - Researchers can only see their own studies
// - Participants can only see studies they've applied to
// - Admin can see all records

// When using service role key, RLS is bypassed, so implement manual checks:
async function getStudyWithPermission(studyId, userId, userRole) {
  let query = supabase.from('studies').select('*').eq('id', studyId);
  
  // Apply role-based filtering when using service role
  if (userRole === 'researcher') {
    query = query.eq('researcher_id', userId);
  } else if (userRole === 'participant') {
    // Participants can only see public studies they've applied to
    query = query.eq('status', 'published');
  }
  // Admin can access all studies (no additional filter)
  
  const { data, error } = await query.single();
  
  if (error) {
    throw new Error(`Access denied or study not found: ${error.message}`);
  }
  
  return data;
}
```

### **Transaction Patterns**
```javascript
// Use transactions for multi-table operations:
async function createStudyWithBlocks(studyData, blocks, userId) {
  const { data: study, error: studyError } = await supabase
    .from('studies')
    .insert({
      ...studyData,
      researcher_id: userId,
      created_at: new Date().toISOString()
    })
    .select()
    .single();
    
  if (studyError) throw new Error(`Study creation failed: ${studyError.message}`);
  
  // Add blocks with study reference
  const blocksWithStudyId = blocks.map(block => ({
    ...block,
    study_id: study.id,
    created_at: new Date().toISOString()
  }));
  
  const { error: blocksError } = await supabase
    .from('study_blocks')
    .insert(blocksWithStudyId);
    
  if (blocksError) {
    // Rollback study creation
    await supabase.from('studies').delete().eq('id', study.id);
    throw new Error(`Block creation failed: ${blocksError.message}`);
  }
  
  return study;
}
```

## 🔐 **Security & Validation Patterns**

### **Input Validation (REQUIRED)**
```javascript
// Always validate input data:
function validateStudyInput(studyData) {
  const errors = [];
  
  if (!studyData.title?.trim()) {
    errors.push('Study title is required');
  }
  
  if (!studyData.description?.trim()) {
    errors.push('Study description is required');
  }
  
  if (!['unmoderated', 'moderated'].includes(studyData.type)) {
    errors.push('Invalid study type');
  }
  
  if (studyData.title && studyData.title.length > 200) {
    errors.push('Study title must be less than 200 characters');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

// Usage:
async function createStudy(req, res) {
  const validation = validateStudyInput(req.body);
  if (!validation.isValid) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: validation.errors
    });
  }
  
  // Proceed with creation...
}
```

### **Rate Limiting Pattern**
```javascript
// Implement rate limiting for resource-intensive operations:
const rateLimitMap = new Map();

function checkRateLimit(userId, action, limitPer5Min = 10) {
  const key = `${userId}-${action}`;
  const now = Date.now();
  const windowStart = now - (5 * 60 * 1000); // 5 minutes ago
  
  if (!rateLimitMap.has(key)) {
    rateLimitMap.set(key, []);
  }
  
  const requests = rateLimitMap.get(key);
  
  // Remove old requests
  const recentRequests = requests.filter(time => time > windowStart);
  
  if (recentRequests.length >= limitPer5Min) {
    return { allowed: false, retryAfter: Math.ceil((recentRequests[0] - windowStart) / 1000) };
  }
  
  recentRequests.push(now);
  rateLimitMap.set(key, recentRequests);
  
  return { allowed: true };
}
```

## 📊 **Study Management API Patterns**

### **Study CRUD Operations**
```javascript
// research-consolidated.js patterns:

async function getStudies(req, res) {
  const auth = await authenticateUser(req, ['researcher', 'admin']);
  if (!auth.success) {
    return res.status(auth.status).json({ success: false, error: auth.error });
  }
  
  const { page = 1, limit = 10, status, search } = req.query;
  const offset = (page - 1) * limit;
  
  let query = supabase
    .from('studies')
    .select(`
      *,
      applications (count),
      study_blocks (count)
    `)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);
    
  // Apply role-based filtering
  if (auth.role === 'researcher') {
    query = query.eq('researcher_id', auth.user.id);
  }
  
  // Apply filters
  if (status) query = query.eq('status', status);
  if (search) query = query.ilike('title', `%${search}%`);
  
  const { data, error, count } = await query;
  
  if (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
  
  return res.status(200).json({
    success: true,
    data: {
      studies: data,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / limit)
      }
    }
  });
}
```

### **Block Management Integration**
```javascript
// When updating studies, handle blocks atomically:
async function updateStudyWithBlocks(req, res) {
  const auth = await authenticateUser(req, ['researcher']);
  if (!auth.success) {
    return res.status(auth.status).json({ success: false, error: auth.error });
  }
  
  const { studyId } = req.query;
  const { study, blocks } = req.body;
  
  // Verify study ownership
  const existingStudy = await getStudyWithPermission(studyId, auth.user.id, auth.role);
  
  // Update study metadata
  const { error: studyError } = await supabase
    .from('studies')
    .update({
      ...study,
      updated_at: new Date().toISOString()
    })
    .eq('id', studyId);
    
  if (studyError) {
    return res.status(500).json({ success: false, error: studyError.message });
  }
  
  // Replace all blocks (simpler than differential updates)
  await supabase.from('study_blocks').delete().eq('study_id', studyId);
  
  if (blocks && blocks.length > 0) {
    const blocksWithMeta = blocks.map((block, index) => ({
      ...block,
      study_id: studyId,
      order: index,
      created_at: new Date().toISOString()
    }));
    
    const { error: blocksError } = await supabase
      .from('study_blocks')
      .insert(blocksWithMeta);
      
    if (blocksError) {
      return res.status(500).json({ success: false, error: blocksError.message });
    }
  }
  
  return res.status(200).json({ success: true });
}
```

## 💳 **Payment Integration (DodoPayments)**

### **Payment Handling Pattern**
```javascript
// payments-consolidated-full.js patterns:
import crypto from 'crypto';

async function processPayment(req, res) {
  const auth = await authenticateUser(req, ['researcher']);
  if (!auth.success) {
    return res.status(auth.status).json({ success: false, error: auth.error });
  }
  
  const { amount, currency = 'USD', studyId } = req.body;
  
  try {
    // Create DodoPayments payment intent
    const paymentData = {
      amount: amount * 100, // Convert to cents
      currency,
      metadata: {
        user_id: auth.user.id,
        study_id: studyId,
        platform: 'researchhub'
      }
    };
    
    const response = await fetch('https://api.dodopayments.com/v1/payment-intents', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.DODOPAYMENTS_SECRET_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(paymentData)
    });
    
    const paymentIntent = await response.json();
    
    if (!response.ok) {
      throw new Error(paymentIntent.message || 'Payment creation failed');
    }
    
    // Store payment record
    await supabase.from('payments').insert({
      user_id: auth.user.id,
      study_id: studyId,
      amount,
      currency,
      payment_intent_id: paymentIntent.id,
      status: 'pending'
    });
    
    return res.status(200).json({
      success: true,
      data: {
        client_secret: paymentIntent.client_secret,
        payment_intent_id: paymentIntent.id
      }
    });
    
  } catch (error) {
    console.error('Payment processing error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Payment processing failed' 
    });
  }
}
```

## 🔍 **Error Handling & Monitoring**

### **Structured Error Response**
```javascript
// Always use consistent error response format:
function createErrorResponse(error, statusCode = 500) {
  return {
    success: false,
    error: error.message || 'An unexpected error occurred',
    timestamp: new Date().toISOString(),
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  };
}

// Usage:
catch (error) {
  console.error('API Error:', error);
  
  // Determine appropriate status code
  let statusCode = 500;
  if (error.message.includes('not found')) statusCode = 404;
  if (error.message.includes('unauthorized')) statusCode = 401;
  if (error.message.includes('validation')) statusCode = 400;
  
  return res.status(statusCode).json(createErrorResponse(error, statusCode));
}
```

### **Health Check Implementation**
```javascript
// health.js - Monitor system components:
export default async function handler(req, res) {
  const checks = {
    database: false,
    auth: false,
    storage: false,
    timestamp: new Date().toISOString()
  };
  
  try {
    // Test database connection
    const { error: dbError } = await supabase.from('studies').select('count').single();
    checks.database = !dbError;
    
    // Test auth service
    const { error: authError } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1 });
    checks.auth = !authError;
    
    // Test storage
    const { error: storageError } = await supabase.storage.listBuckets();
    checks.storage = !storageError;
    
    const allHealthy = Object.values(checks).every(check => check === true || typeof check === 'string');
    
    return res.status(allHealthy ? 200 : 503).json({
      success: allHealthy,
      status: allHealthy ? 'healthy' : 'unhealthy',
      checks
    });
    
  } catch (error) {
    return res.status(503).json({
      success: false,
      status: 'error',
      error: error.message,
      checks
    });
  }
}
```

---

## 💡 **API Development Best Practices:**

1. **NEVER create new API functions** - Always extend existing consolidated handlers
2. **Use action-based routing** - Single function, multiple actions via query parameter
3. **Implement authentication** - Protect all endpoints with proper role checking
4. **Validate all inputs** - Never trust client data without validation
5. **Use consistent error responses** - Standard format across all endpoints
6. **Implement rate limiting** - Protect against abuse and overuse
7. **Log errors properly** - Use console.error for server-side debugging
8. **Test with designated accounts** - Never create new test accounts
9. **Respect RLS policies** - Understand when RLS applies vs service role usage
10. **Handle transactions carefully** - Ensure data consistency across related operations

Remember: The API layer is the backbone of ResearchHub's usability testing platform - reliability and security are paramount!