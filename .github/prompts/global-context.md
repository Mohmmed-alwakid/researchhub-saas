---
mode: agent
context: [global, researchhub, architecture]
audience: [developer, senior-developer]
framework: [react, typescript, supabase, vercel]
domain: [usability-testing, user-research, saas-platform]
triggers:
  paths: ["**/*.tsx", "**/*.ts", "**/*.js", "api/**/*"]
  always_active: true
---

# ResearchHub Global Development Context

You are working on **ResearchHub**, a comprehensive usability testing platform competing with Maze.co, designed to help researchers create, manage, and analyze user research studies.

## 🏗️ **Core Architecture**

### **Technology Stack**
- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS
- **Backend**: 12 Vercel Serverless Functions (CRITICAL: 12/12 limit reached)
- **Database**: Supabase PostgreSQL with Row Level Security (RLS)
- **Authentication**: Supabase Auth with JWT tokens
- **State Management**: Zustand + React Query for data fetching
- **UI Components**: Custom component library with accessibility focus

### **Deployment & Environments**
- **Production**: https://researchhub-saas.vercel.app (PRIMARY FOCUS)
- **Local Development**: `npm run dev:fullstack` (http://localhost:5175 + :3003)
- **Database**: Production Supabase (shared for consistency)
- **Vercel Functions**: Auto-deploy from main branch

## 🧩 **ResearchHub's Unique Value Proposition**

### **Study-Centric Platform**
ResearchHub is built around a **modular block-based study builder system** that enables researchers to create comprehensive usability testing studies:

```typescript
// Core Study Architecture
interface StudyBuilderBlock {
  id: string;
  type: BlockType; // 13 available block types
  order: number;
  title: string;
  description: string;
  settings: Record<string, unknown>;
}

// 13 Block Types for Comprehensive User Research:
type BlockType = 
  | 'welcome'           // Study introduction & participant onboarding
  | 'open_question'     // Qualitative feedback collection
  | 'opinion_scale'     // SUS scores, satisfaction ratings (1-10)
  | 'simple_input'      // User data collection (text/number/date)
  | 'multiple_choice'   // Task completion, preference selection
  | 'context_screen'    // Task instructions & scenario setup
  | 'yes_no'           // Binary usability decisions
  | '5_second_test'    // First impression & memory testing
  | 'card_sort'        // Information architecture testing
  | 'tree_test'        // Navigation & findability testing
  | 'thank_you'        // Study completion & debriefing
  | 'image_upload'     // Visual prototype testing
  | 'file_upload'      // Document/asset collection
```

### **Competitive Positioning**
- **vs Maze.co**: More flexible block system, AI-powered study generation
- **vs UserTesting**: Focus on unmoderated studies with moderated interview options
- **vs Lookback**: Comprehensive template library with study builder flexibility

## 🔐 **Authentication & Role System**

### **Three User Roles**
```typescript
type UserRole = 'researcher' | 'participant' | 'admin';

// Role-based access patterns:
// - Researcher: Creates studies, manages participants, analyzes results
// - Participant: Discovers studies, applies, completes sessions
// - Admin: Platform administration, user management, analytics
```

### **MANDATORY Test Accounts (NEVER create new ones)**
```javascript
const TEST_ACCOUNTS = {
  researcher: { email: 'abwanwr77+Researcher@gmail.com', password: 'Testtest123' },
  participant: { email: 'abwanwr77+participant@gmail.com', password: 'Testtest123' },
  admin: { email: 'abwanwr77+admin@gmail.com', password: 'Testtest123' }
};
```

## 🚨 **CRITICAL CONSTRAINTS (ALWAYS RESPECT)**

### **API Function Limit - 12/12 USED**
```javascript
// CURRENT VERCEL FUNCTIONS (NEVER CREATE NEW ONES):
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

// ⚠️ CRITICAL RULE: ALWAYS extend existing handlers, NEVER create new API files
```

### **API Pattern (MANDATORY)**
```javascript
// All APIs use action-based routing:
export default async function handler(req, res) {
  try {
    const { action } = req.query;
    
    switch (action) {
      case 'get-studies': return await getStudies(req, res);
      case 'create-study': return await createStudy(req, res);
      default: return res.status(400).json({ 
        success: false, 
        error: 'Invalid action' 
      });
    }
  } catch (error) {
    return res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
}
```

## 📁 **Project Structure Rules (ENFORCED)**

### **Directory Organization**
```
✅ CORRECT LOCATIONS:
- Tests: testing/ (never create tests/, e2e-tests/, etc.)
- Docs: docs/ (never scatter .md files in root)
- Scripts: scripts/ (never put .js utilities in root)
- API: api/ (12 consolidated handlers only)
- Components: src/client/components/
- Database: database/migrations/

❌ NEVER CREATE:
- Duplicate directories (tests/ when testing/ exists)
- Root directory clutter (debug files, screenshots)
- New API functions (extend existing consolidated handlers)
- Files with confusing modifiers ("Advanced", "Enhanced", etc.)
```

### **Component Naming Standards**
```typescript
// ✅ CORRECT - Clear, descriptive names
StudyBuilder.tsx          // Main study creation interface
ParticipantDashboard.tsx  // Participant overview
PaymentSettings.tsx       // Payment configuration

// ❌ INCORRECT - Confusing modifiers
AdvancedStudyBuilder.tsx  // What makes it "advanced"?
EnhancedDashboard.tsx     // Enhanced how?
CreativeComponents.tsx    // Meaningless modifier
```

## 🧪 **Development Workflow**

### **Local Development (PREFERRED)**
```bash
npm run dev:fullstack    # Start local environment (Frontend:5175 + Backend:3003)
npm run test:quick       # Run comprehensive testing
npm run cleanup          # Auto-organize project structure
```

### **Testing Rules**
- **Use designated test accounts only** - Never create new accounts
- **Test locally first** - Use `npm run dev:fullstack`
- **Validate on production** - Ensure fixes work on live site
- **Follow test interfaces** - Use provided HTML test files

## 🎯 **Code Quality Standards**

### **TypeScript Patterns**
```typescript
// Preferred component pattern
interface ComponentProps {
  data: DataType;
  onUpdate: (data: DataType) => void;
  className?: string;
}

export const Component: React.FC<ComponentProps> = ({ 
  data, 
  onUpdate, 
  className = '' 
}) => {
  // Implementation with proper TypeScript types
};
```

### **Error Handling Pattern**
```typescript
// API responses - always use this structure
try {
  const response = await apiCall();
  return { success: true, data: response };
} catch (error) {
  console.error('Operation failed:', error);
  return { success: false, error: 'User-friendly message' };
}
```

### **Database Operations**
```typescript
// Supabase operations with RLS
const { data, error } = await supabase
  .from('studies')
  .select('*')
  .eq('researcher_id', user.id); // RLS automatically enforces access

if (error) {
  return { success: false, error: error.message };
}
```

## 🚀 **Study Creation Flow**

### **Multi-Step Study Builder Process**
1. **Study Type Selection** - Unmoderated Study vs Moderated Interviews
2. **Template Selection** - Use template or start from scratch  
3. **Template Preview** - Preview template blocks and structure
4. **Study Builder** - Customize blocks, add new blocks, finalize

### **Block Development Patterns**
```typescript
// Block helpers for consistent behavior
const getBlockDisplayName = (type: BlockType): string => { /* ... */ }
const getDefaultBlockDescription = (type: BlockType): string => { /* ... */ }
const getDefaultBlockSettings = (type: BlockType): Record<string, any> => { /* ... */ }

// Always append Thank You block automatically
const ensureThankYouBlock = (blocks: StudyBuilderBlock[]) => {
  const hasThankYou = blocks.some(block => block.type === 'thank_you');
  if (!hasThankYou) {
    blocks.push(createThankYouBlock());
  }
};
```

## 📊 **Success Metrics & Analytics**

### **Platform KPIs**
- **Study Creation Rate**: Studies created per researcher per month
- **Participant Engagement**: Completion rates and session quality
- **Template Usage**: Most popular templates and block combinations
- **User Retention**: Researcher return rates and platform stickiness

### **Technical Metrics**
- **Performance**: Page load times, API response times
- **Error Rates**: System errors and user-reported issues
- **Scalability**: Concurrent users and system capacity

---

## 💡 **When Writing Code, Always Remember:**

1. **ResearchHub is a usability testing platform** - Focus on user research workflows
2. **Respect the 12 API function limit** - Extend existing APIs, never create new ones
3. **Use designated test accounts** - Never create new test accounts
4. **Follow the block-based architecture** - Everything revolves around study blocks
5. **Prioritize researcher and participant experience** - These are the primary users
6. **Maintain production stability** - Changes must not break the live platform
7. **Follow established patterns** - Consistency is key for maintainability

ResearchHub's success depends on providing researchers with powerful, intuitive tools for creating comprehensive usability studies while ensuring participants have smooth, engaging experiences completing those studies.