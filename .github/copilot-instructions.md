# ResearchHub - Copilot Instructions

<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

## ⚠️ Project Status: ACTIVE DEVELOPMENT - MULTI-STEP STUDY CREATION COMPLETE
**Last Updated**: June 23, 2025  
**Status**: 🚧 Early Development Stage - Study Creation Flow & Block System Production Ready  
**Build Status**: ✅ 0 TypeScript errors, Multi-Step Study Creation Complete

## 📋 Project Overview
ResearchHub is an **in-development** SaaS platform for user testing research. Recent major progress includes a complete **Multi-Step Study Creation Flow** with guided modals, enhanced **Study Blocks System** with custom editing interfaces, and comprehensive **Template Integration**.

### ACTUAL Implementation Status (Current Reality)
- ✅ **Authentication System**: Complete JWT auth with role management
- ✅ **Database**: Supabase with RLS security properly implemented
- ✅ **Study Creation Flow**: Multi-step modal system with template integration
- ✅ **Study Blocks System**: 13 block types with custom editing interfaces
- ✅ **Template System**: Browse, preview, and seamlessly apply pre-configured templates
- ✅ **Block Library**: Predefined block types with descriptions and enhanced UI
- ✅ **Role-Based Access**: Working admin/researcher/participant system
- ✅ **Local Development**: Optimized full-stack development environment
- ✅ **API Endpoints**: Core functionality working with real database
- ✅ **Frontend**: Modern React with TypeScript, production-ready components
- 🚧 **Production Deployment**: Working but with Vercel function limits

## ✅ Recent Major Achievements (June 23, 2025)
- **Multi-Step Study Creation**: Complete guided modal flow (type selection → template selection → preview → builder)
- **Enhanced Block Editing**: Custom editing interfaces for 5-Second Test, Open Question, and Simple Input blocks
- **Study Builder Refactor**: Complete TypeScript refactor with StudyBuilderBlock interface and type safety
- **Block Library Enhancement**: Predefined block types with clear descriptions, removed search/categories for cleaner UI
- **Template Integration**: Seamless template preview and block transfer to study builder
- **Automatic Thank You Block**: Logic to always append completion block at end of every study
- **TypeScript Completion**: All 13 block types supported with proper display names and default settings
- **Full Flow Testing**: Verified complete workflow with Playwright automation and local dev server
- **Zero Build Errors**: Clean TypeScript compilation confirmed

## 🚧 In Development (Partial Implementation)
- **Backend Block APIs**: Need to add block template endpoints
- **Block Session Rendering**: For participant experience
- **Advanced Block Features**: AI integration, conditional logic, advanced analytics
- **Template Creation UI**: Visual template builder for researchers  
- **Block Analytics**: Usage patterns and effectiveness metrics
- **Template Marketplace**: Community sharing and collaboration
- **Screen Recording**: Video capture integration
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

## 🤖 MCP (Model Context Protocol) Development Tools
**Available AI-powered development assistance tools:**

### 🎭 Playwright MCP
- **Purpose**: Automated browser testing and UI interaction
- **Capabilities**: 
  - End-to-end testing automation
  - Screenshot capture and visual testing
  - Form filling and user interaction simulation
  - Cross-browser testing support
- **Use Cases**: Testing study creation flows, participant workflows, admin interfaces

### 🗄️ Supabase MCP  
- **Purpose**: Database management and operations
- **Capabilities**:
  - Direct database queries and migrations
  - Table creation and schema management
  - RLS policy testing and validation
  - Real-time data monitoring
- **Use Cases**: Database schema updates, data migrations, security policy testing

### 💾 Memory Bank MCP
- **Purpose**: Project knowledge and context management
- **Capabilities**:
  - Track development progress and decisions
  - Maintain project context across sessions
  - Store implementation notes and learnings
  - Decision logging and architecture documentation
- **Use Cases**: Keeping track of complex feature implementations, architectural decisions

### 🖥️ Desktop Commander MCP
- **Purpose**: File system operations and command execution
- **Capabilities**:
  - File and directory management
  - Code search and editing operations
  - Terminal command execution
  - Multi-file operations
- **Use Cases**: Bulk file operations, code refactoring, project setup tasks

### 📚 Context7 MCP
- **Purpose**: Library documentation and API reference
- **Capabilities**:
  - Real-time documentation lookup
  - API reference and examples
  - Best practices and implementation patterns
  - Framework-specific guidance
- **Use Cases**: Getting up-to-date documentation for React, TypeScript, Supabase, etc.

### 🎯 How to Leverage MCP Tools
1. **Automated Testing**: Use Playwright MCP for comprehensive E2E testing
2. **Database Operations**: Use Supabase MCP for complex migrations and queries
3. **Project Documentation**: Use Memory Bank MCP to track progress and decisions
4. **Code Operations**: Use Desktop Commander MCP for file management tasks
5. **Reference Lookup**: Use Context7 MCP for latest library documentation

**These MCP tools provide AI-powered assistance for complex development tasks, making development more efficient and reducing manual work.**

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
- `docs/STUDY_BLOCKS_SYSTEM.md` - Complete study blocks architecture and implementation
- `docs/TEMPLATE_SYSTEM.md` - Template management and usage system  
- `docs/STUDY_BLOCKS_IMPLEMENTATION_PROGRESS.md` - Current implementation status and roadmap
- `docs/DOCUMENTATION_INDEX.md` - Comprehensive documentation index
- `PROJECT_STATUS_REALITY_CHECK.md` - Accurate current project status
- `FEATURE_GAP_ANALYSIS.md` - Detailed feature implementation review
- `REALISTIC_DEVELOPMENT_ROADMAP.md` - Actual development timeline
- `DEVELOPMENT_BEST_PRACTICES.md` - Detailed best practices guide
- `TESTING_RULES_MANDATORY.md` - Testing account rules
- `PROJECT_MEMORY_BANK.md` - Updated project history (false claims removed)

## 🧩 Study Blocks System Architecture

### Core Concepts
- **Study** = Sequential collection of blocks that guide participants through research
- **Block** = Self-contained component with specific purpose (welcome, questions, images, ratings)
- **Template** = Pre-configured collections of blocks for common research scenarios

### Available Block Types (13 Total)
1. **Welcome Screen** - Study introduction and participant onboarding
2. **Open Question** - Qualitative data collection with AI follow-up
3. **Opinion Scale** - Quantitative ratings (numerical, stars, emotions)
4. **Simple Input** - Structured data (text, number, date, email)
5. **Multiple Choice** - Single/multiple selection with custom options
6. **Context Screen** - Instructions and transitional information
7. **Yes/No** - Binary decisions with icon/emotion displays
8. **5-Second Test** - First impression and memory testing
9. **Card Sort** - Information architecture and categorization
10. **Tree Test** - Navigation and findability evaluation
11. **Thank You** - Study completion and appreciation message
12. **Image Upload** - Visual content collection from participants
13. **File Upload** - Document and file collection from participants

### Multi-Step Study Creation Flow
ResearchHub now features a comprehensive guided study creation experience:

1. **Study Type Selection** - Choose between "Start from Scratch" or "Use a Template"
2. **Template Selection** - Browse and select from pre-configured study templates
3. **Template Preview** - Preview template blocks and understand the study structure
4. **Study Builder** - Customize blocks, add new blocks, and finalize the study

### Enhanced Block Library
- **Predefined Block Types**: Curated list of 13 block types with clear descriptions
- **Custom Editing Interfaces**: Specialized editing forms for complex blocks (5-Second Test, Open Question, Simple Input)
- **Automatic Thank You Block**: Every study automatically includes a completion block
- **Drag & Drop Ordering**: Intuitive block reordering with visual feedback
- **Block Insertion Logic**: New blocks are inserted before the Thank You block

### Technical Implementation
```typescript
// StudyBuilder interface for type safety
interface StudyBuilderBlock {
  id: string;
  type: BlockType;
  order: number;
  title: string;
  description: string;
  settings: Record<string, any>;
}

// Block helpers for consistent behavior
const getBlockDisplayName = (type: BlockType): string => { /* ... */ }
const getDefaultBlockDescription = (type: BlockType): string => { /* ... */ }
const getDefaultBlockSettings = (type: BlockType): Record<string, any> => { /* ... */ }
```

### Block Development Guidelines
- **Modularity**: Each block is self-contained and reusable
- **Type Safety**: Full TypeScript interfaces for all block types  
- **Accessibility**: WCAG compliance for all blocks
- **Analytics**: Built-in interaction and timing tracking
- **Conditional Logic**: Support for branching and personalization
- **Custom Editing**: Specialized interfaces for complex block configuration

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
1. **Backend block API support**: Add endpoints for block templates and management
2. **Block session rendering**: Implement participant experience for all block types
3. **Advanced block features**: AI integration, conditional logic, analytics
4. **Template creation UI**: Visual template builder for researchers
5. **Maintain test account integrity**: Keep roles correct for testing

## 🏆 Local Development Benefits
- ⚡ **Ultra-fast iteration**: No deployment cycle needed
- 🔄 **Real-time testing**: Using actual Supabase database
- 🛠️ **Complete environment**: Frontend + Backend + Database locally
- 🐛 **Easy debugging**: Console logs and immediate feedback
- 📊 **Production parity**: Same data and behavior as production

**Use `npm run dev:fullstack` for the fastest development experience!**
