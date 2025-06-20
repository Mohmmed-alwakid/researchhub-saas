# ResearchHub - Copilot Instructions

<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

## ⚠️ Project Status: ACTIVE DEVELOPMENT - ENHANCED STUDY BUILDER COMPLETE
**Last Updated**: June 20, 2025  
**Status**: 🚧 Early Development Stage - Study Builder UX Enhancement Complete  
**Build Status**: ✅ 0 TypeScript errors, Enhanced Study Builder Production Ready

## 📋 Project Overview
ResearchHub is an **in-development** SaaS platform for user testing research. Recent major progress includes a complete Study Builder UX enhancement with modern UI components and workflow.

### ACTUAL Implementation Status (Current Reality)
- ✅ **Authentication System**: Complete JWT auth with role management
- ✅ **Database**: Supabase with RLS security properly implemented
- ✅ **Study Builder**: ENHANCED - Complete UX overhaul with modern features
- ✅ **Role-Based Access**: Working admin/researcher/participant system
- ✅ **Local Development**: Optimized full-stack development environment
- ✅ **API Endpoints**: Core functionality working with real database
- ✅ **Frontend**: Modern React with TypeScript, production-ready components
- 🚧 **Production Deployment**: Working but with Vercel function limits

## ✅ Recent Major Achievements (June 2025)
- **Study Builder UX Enhancement**: Complete overhaul with modern UI/UX
- **Task Library Modal**: Browse and search task templates
- **Drag-and-Drop Interface**: Reorder tasks with smooth animations  
- **Template Preview System**: Preview task details before adding
- **Real-time Validation**: Instant feedback on form inputs
- **Progress Indicators**: Visual progress tracking
- **Conditional Recording Options**: Dynamic options based on study type
- **Task Editing Modal**: Complete task editing interface (UI ready)

## 🚧 In Development (Partial Implementation)
- **Screen Recording**: UI implemented, backend integration pending
- **Analytics Processing**: Mock data, needs real analytics implementation
- **Session Replay**: Frontend ready, video processing needed
- **Task Editing Backend**: UI complete, needs API integration
- **Payment Integration**: Stripe integration planned

## 🛠️ Tech Stack (Current)
- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS
- **Backend**: Vercel Serverless Functions (Express.js style)
- **Database**: Supabase (PostgreSQL with real-time capabilities)
- **Authentication**: Supabase Auth (JWT tokens + refresh tokens)
- **UI Components**: Custom component library with accessibility
- **State Management**: Zustand + React Query
- **Deployment**: Vercel with GitHub auto-deploy
- **Local Development**: Express.js local server with real Supabase connection

## 📁 File Organization (Current)
- `/src/client` - React frontend components and pages
- `/api` - Vercel serverless functions (consolidated)
- `/src/shared` - Shared types and utilities
- `/docs` - Comprehensive project documentation
- `/local-*` - Local development environment files
- `/tests` - Testing files and interfaces

## 🔧 Development Environment

### 🚀 LOCAL DEVELOPMENT (RECOMMENDED)
**Full-stack local environment with real Supabase database connection:**

```bash
# Start complete local development environment (RECOMMENDED)
npm run dev:fullstack
# This starts:
# - Frontend (React/Vite): http://localhost:5175
# - Backend (Express API): http://localhost:3003  
# - Connected to: Real Supabase production database
# - Hot reload: Enabled for both frontend and backend
```

### Port Configuration (Updated June 18, 2025)
- **Local Frontend**: `http://localhost:5175` (Vite dev server)
- **Local Backend API**: `http://localhost:3003` (Express API with real Supabase)
- **Production Frontend**: `https://your-vercel-app.vercel.app`
- **Production API**: `https://your-vercel-app.vercel.app/api/*`

### Essential Commands
```bash
# Local Development (FASTEST - use this!)
npm run dev:fullstack  # Complete local environment with real DB

# Individual local servers
npm run dev:client     # Frontend only (proxies to local backend)
npm run dev:local      # Backend API only

# Legacy commands (slower)
npm run dev           # Uses Vercel dev (slower)
npm run dev:api       # Vercel functions locally

# Production build
npm run build         # Build frontend for production

# TypeScript validation
npx tsc --noEmit      # Should return 0 errors
```

### 🧪 Local Testing Tools
- **Full-stack test interface**: `local-fullstack-test.html`
- **Admin/auth test interface**: `local-admin-fix.html`
- **API-only test interface**: `auth-test.html`

## 💻 Code Conventions & Best Practices

### Database & API Patterns
```javascript
// Supabase client usage
import { createClient } from '@supabase/supabase-js';
const supabase = createClient(supabaseUrl, supabaseKey);

// API endpoint pattern (Vercel functions)
export default async function handler(req, res) {
  try {
    // Your logic here
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}
```

### Authentication Patterns
```typescript
// Frontend auth service pattern
const response = await fetch('/api/auth?action=login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
});

// Backend auth validation
const { data: { user }, error } = await supabase.auth.getUser(token);
```

### React Component Patterns
```tsx
// Preferred: Functional components with TypeScript
interface ComponentProps {
  data: DataType;
  onUpdate: (data: DataType) => void;
}

export const Component = ({ data, onUpdate }: ComponentProps) => {
  // Implementation
};
```

### Error Handling
```typescript
// API responses - always use this pattern
try {
  const response = await apiCall();
  return { success: true, data: response };
} catch (error) {
  console.error('Operation failed:', error);
  return { success: false, error: 'User-friendly message' };
}
```

## 🔐 Security Implementation
- **Database Security**: Supabase RLS (Row Level Security) policies
- **Authentication**: Supabase Auth with JWT tokens
- **API Security**: Token validation on all protected endpoints
- **Input Validation**: Zod schemas on client + server
- **CORS**: Configured for multiple origins

## 🚀 Deployment Configuration

### Environment Variables Required
```bash
# Supabase (Required)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-key

# Optional (for full features)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
```

### Vercel Configuration
- **Functions**: 8 optimized endpoints (under 12 function limit)
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

## 🧪 Testing Strategy

### Local Testing (FASTEST)
```bash
npm run dev:fullstack  # Start local environment
# Open http://localhost:5175 for frontend
# Test API at http://localhost:3003/api/*
# Use local test interfaces for specific testing
```

### Test Accounts (MANDATORY - Use Only These)
```bash
# Participant
Email: abwanwr77+participant@gmail.com
Password: Testtest123
Role: participant

# Researcher  
Email: abwanwr77+Researcher@gmail.com
Password: Testtest123
Role: researcher

# Admin
Email: abwanwr77+admin@gmail.com
Password: Testtest123
Role: admin
```

### Production Testing
- **Health Check**: `/api/health` endpoint for monitoring
- **Database Check**: `/api/db-check` endpoint
- **Authentication Flow**: Complete login/register/refresh cycle

## 📚 Key Documentation References
- `PROJECT_STATUS_REALITY_CHECK.md` - Accurate current project status
- `FEATURE_GAP_ANALYSIS.md` - Detailed feature implementation review
- `REALISTIC_DEVELOPMENT_ROADMAP.md` - Actual development timeline
- `DEVELOPMENT_BEST_PRACTICES.md` - Detailed best practices guide
- `TESTING_RULES_MANDATORY.md` - Testing account rules
- `PROJECT_MEMORY_BANK.md` - Updated project history (false claims removed)

## ⚠️ Important Development Rules

### 🚀 Local Development First
1. **Always develop locally first**: Use `npm run dev:fullstack`
2. **Test thoroughly locally**: Before pushing to production
3. **Use real database**: Local environment connects to Supabase
4. **Hot reload**: Both frontend and backend restart automatically

### 🔒 Testing Rules (MANDATORY)
1. **Only use the 3 test accounts**: No creating new accounts
2. **Correct roles**: Ensure each account has the right role
3. **Local testing first**: Test everything locally before production
4. **Use test interfaces**: Utilize provided test HTML files

### 📝 Git Workflow
```bash
# Feature development
git checkout develop
git checkout -b feature/your-feature
# ... develop locally with npm run dev:fullstack ...
git commit -m "feat: description"
git push origin feature/your-feature

# Deployment
git checkout main
git merge develop  
git push origin main  # Auto-deploys to Vercel
```

### 🎯 Current Development Priorities
1. **Continue using local development**: Fastest iteration cycle
2. **Maintain test account integrity**: Keep roles correct
3. **Test all flows locally**: Before production deployment
4. **Document new features**: Update this file when adding features

## 🏆 Local Development Benefits
- ⚡ **Ultra-fast iteration**: No deployment cycle needed
- 🔄 **Real-time testing**: Using actual Supabase database
- 🛠️ **Complete environment**: Frontend + Backend + Database locally
- 🐛 **Easy debugging**: Console logs and immediate feedback
- 📊 **Production parity**: Same data and behavior as production

**Use `npm run dev:fullstack` for the fastest development experience!**
