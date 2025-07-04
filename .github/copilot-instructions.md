# ResearchHub - Copilot Instructions

<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

## ⚠️ Project Status: ACTIVE DEVELOPMENT - COMPREHENSIVE TESTING FRAMEWORK COMPLETE
**Last Updated**: July 3, 2025  
**Status**: 🚧 Early Development Stage - Professional Study Builder + Comprehensive Testing Framework Implemented  
**Build Status**: ✅ 0 TypeScript errors, Production-Ready Testing Framework Active

## 📋 Project Overview
ResearchHub is an **in-development** SaaS platform for user testing research. Recent major progress includes a complete **Professional Study Builder** with enterprise-grade user experience, enhanced **Study Blocks System** with custom editing interfaces, comprehensive **Template Integration** with detailed previews, and **Interactive Study Preview** for researchers.

### ACTUAL Implementation Status (Current Reality)
- ✅ **Authentication System**: Complete JWT auth with role management
- ✅ **Database**: Supabase with RLS security properly implemented
- ✅ **Professional Study Builder**: Complete 6-step wizard with enterprise-grade UX
- ✅ **Study Blocks System**: 13 block types with custom editing interfaces
- ✅ **Template System**: Enhanced template preview with detailed information
- ✅ **Interactive Study Preview**: Researchers can experience participant view
- ✅ **Block Library**: Predefined block types with descriptions and enhanced UI
- ✅ **Role-Based Access**: Working admin/researcher/participant system
- ✅ **Local Development**: Optimized full-stack development environment
- ✅ **API Endpoints**: Core functionality working with real database
- ✅ **Frontend**: Modern React with TypeScript, production-ready components
- ✅ **Collaboration Features**: Real-time team collaboration fully integrated in Study Builder
- ✅ **Backend APIs**: Collaboration, approval, and comments APIs with WebSocket server
- ✅ **Database Schema**: Collaboration tables and RLS policies ready for production
- ✅ **Comprehensive Testing Framework**: AI-powered automated testing with 0 human testers required
- 🚧 **Production Deployment**: Working but with Vercel function limits

## ✅ Recent Major Achievements (July 3, 2025)
- **Comprehensive Testing Framework**: Complete AI-powered automated testing system implemented
- **Professional Testing Infrastructure**: 0 human testers required, industry-standard quality gates
- **Test Data Generation**: Smart synthetic data with 20+ users, 30+ studies, 75+ applications
- **Multi-Layer Testing**: Performance, security, accessibility, visual, and E2E automated testing
- **Development Cycle Integration**: Daily/weekly/deployment testing cycles with instant feedback
- **Professional Test Reports**: HTML dashboards with actionable insights and trend analysis
- **Study Status Issue Resolution**: Completely fixed status display bug with comprehensive testing
- **Enhanced StudiesPage**: Added multiple refresh mechanisms for real-time data consistency
- **API Verification**: Confirmed backend correctly handles study status field
- **Legacy System Replacement**: Completely replaced old study creation with new Study Builder
- **Professional Study Builder**: Enterprise-grade 6-step wizard matching industry standards
- **Enhanced Template Preview**: Complete template information with block breakdown and usage stats
- **Interactive Study Preview**: Full participant experience preview for researchers
- **Conditional Form Fields**: Smart field display based on study type (duration/audio for interviews only)
- **Optional Research Objectives**: Streamlined form flow with optional objective fields
- **Routing Optimization**: All study creation routes now point to new Study Builder
- **Code Cleanup**: Removed legacy study creation components and unused imports
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
- **Backend Collaboration APIs**: Ready for production deployment (WebSocket server created)
- **Database Migrations**: Collaboration tables ready for production deployment
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
- `/testing` - **NEW**: Comprehensive automated testing framework
- `/tests` - Legacy testing files and interfaces

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

### 🏗️ MANDATORY Development Process (ALL REQUESTS)
**CRITICAL: Follow this process for EVERY request before any implementation**

#### 1. 📋 REQUIREMENTS VALIDATION PHASE
- **STOP**: Check if detailed requirements exist for this request
- **READ**: Review existing requirements document (create if missing)
- **VALIDATE**: Ensure requirements are complete and approved
- **DOCUMENT**: Create requirements.md file following template in `DEVELOPMENT_STANDARDS_FRAMEWORK.md`

#### 2. 🔍 EXISTING CODE ANALYSIS PHASE  
- **SEARCH**: Find all existing implementations related to the request
- **ANALYZE**: Understand current patterns, architecture, and conventions
- **DECISION**: Extend existing code vs. create new (PREFER EXTEND)
- **RULE**: Never create new components when existing ones can be enhanced
- **EXAMPLE**: StudyCreationWizard exists - enhance it, don't replace it

#### 3. 📝 IMPLEMENTATION PLAN PHASE
- **DESIGN**: Technical approach that builds on existing systems
- **COMPATIBILITY**: Ensure backward compatibility and integration
- **APPROVAL**: Present plan to user before proceeding
- **ENHANCEMENT**: Always prefer enhancement over replacement

#### 4. ✅ QUALITY ASSURANCE PHASE
- **BUILD**: Follow approved plan exactly
- **TEST**: Comprehensive testing including existing functionality
- **DOCUMENT**: Update all relevant documentation
- **VALIDATE**: Ensure no regression in existing features

### 🚫 CRITICAL ANTI-PATTERNS (NEVER DO)
1. **Creating duplicate directories/files**: Never create folders with similar names (e.g., `tests/` when `testing/` exists, `ProductManager/` when `product-manager/` exists)
2. **Root directory pollution**: Don't create temporary, debug, or test files in the root directory
3. **Mixed naming conventions**: Don't mix camelCase, PascalCase, kebab-case, snake_case for similar items
4. **Starting implementation without detailed requirements**
5. **Replacing working code instead of extending it**
6. **Ignoring existing patterns and conventions**
7. **Building without understanding existing architecture**
8. **Creating duplicate functionality**

### 📁 **MANDATORY PROJECT STRUCTURE RULES**

#### **Directory Organization (STRICT)**
```
ALWAYS USE THESE LOCATIONS:
- Testing: testing/ (NEVER create tests/, e2e-tests/, playwright-tests/)
- Documentation: docs/ (NEVER scatter .md files in root)
- Scripts: scripts/ (NEVER put .js utilities in root)
- Database: database/ (NEVER create database-migrations/, db/, etc.)
- Product Management: product-manager/ (NEVER create ProductManager/)
```

#### **File Placement Rules (MANDATORY)**
- **Tests**: ALL tests go in `testing/` with proper subdirectory
- **Documentation**: ALL docs go in `docs/` with proper subdirectory  
- **Reports**: ALL reports go in `docs/reports/` organized by date
- **Debug Scripts**: ALL debug files go in `scripts/debug/`
- **Migration Scripts**: ALL migrations go in `database/migrations/`
- **Test Interfaces**: Manual test files go in `testing/manual/`

#### **Naming Convention Standards (ENFORCED)**
- **Directories**: `kebab-case` (e.g., `product-manager`, `testing`, `database`)
- **Source Files**: `kebab-case.ext` (e.g., `study-builder.tsx`, `api-client.ts`)
- **Documentation**: `SCREAMING_SNAKE_CASE.md` (e.g., `README.md`, `DEPLOYMENT_GUIDE.md`)
- **React Components**: `PascalCase` (e.g., `StudyBuilder`, `UserDashboard`)
- **Functions/Variables**: `camelCase` (e.g., `getUserData`, `studyResults`)
- **Constants**: `SCREAMING_SNAKE_CASE` (e.g., `API_ENDPOINTS`, `DEFAULT_CONFIG`)

### 🔍 **BEFORE CREATING ANY FILE/FOLDER (MANDATORY CHECKS)**
1. **Search existing structure**: Use file_search to check if similar files/folders exist
2. **Check naming conflicts**: Ensure no case variations exist (e.g., don't create `Tests/` if `testing/` exists)
3. **Verify proper location**: Ensure file goes in correct directory according to rules above
4. **Follow conventions**: Use correct naming convention for the file type

### 🧹 **ROOT DIRECTORY RULES (STRICT)**
- **Maximum 20 files** in root directory
- **Only essential files**: package.json, README.md, config files
- **No temporary files**: No debug files, test files, or reports
- **No screenshots**: All images go in appropriate subdirectories
- **No scattered scripts**: All utilities go in `scripts/` subdirectories

### 🤖 **AUTOMATED PROJECT CLEANUP (USE THIS!)**
**Single command to organize entire project structure:**

```bash
# Quick cleanup (recommended)
npm run cleanup

# Preview what will be moved (safe)
npm run cleanup:dry-run

# Detailed output (verbose)
npm run cleanup:verbose

# Interactive cleanup menu
cleanup.bat
```

**The automated cleanup script will:**
- ✅ Move all test files to `testing/` subdirectories
- ✅ Move all reports to `docs/reports/2025/07-july/`
- ✅ Move all screenshots to `testing/screenshots/archive/`
- ✅ Move all debug scripts to `scripts/debug/`
- ✅ Move all migration files to `database/migrations/`
- ✅ Remove empty duplicate directories
- ✅ Validate project structure compliance
- ✅ Generate cleanup summary report

**MANDATORY: Run `npm run cleanup` after creating files to maintain organization!**

### 📝 **TEST RESULT HANDLING (AUTOMATIC)**
When tests fail or need updates:
1. **Immediate Fix**: Fix obvious issues (e.g., brand name mismatches)
2. **Update Tests**: Modify test expectations to match actual application behavior
3. **Document Changes**: Note what was fixed and why
4. **Re-run Validation**: Confirm fixes work
5. **Report Results**: Update success metrics

### 📋 REQUIREMENTS FRAMEWORK
- **See**: `DEVELOPMENT_STANDARDS_FRAMEWORK.md` for complete template
- **Rule**: No coding without approved requirements document
- **Guarantee**: Same requirements = Same output, always
- **Consistency**: Requirements ensure reproducible development outcomes
- **Example**: `STUDY_CREATION_WIZARD_IMPROVEMENTS_REQUIREMENTS.md` shows proper format

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

### 🧪 COMPREHENSIVE TESTING FRAMEWORK (NEW - July 3, 2025)
**Professional-grade automated testing with ZERO human testers required**

#### **Testing Structure**
```
testing/
├── automated/           # AI-powered automated tests
├── performance/         # Lighthouse audits & speed tests
├── security/           # Vulnerability & security scanning
├── accessibility/      # WCAG 2.1 AA compliance
├── visual/            # Cross-browser & regression tests
├── data/              # Test data generation & management
├── config/            # Testing configuration
└── reports/           # Generated test reports
```

#### **Testing Commands (Essential)**
```bash
# Daily Development Testing (2-3 minutes)
npm run test:quick      # Quick smoke tests during development
npm run test:daily      # Comprehensive daily validation

# Weekly Testing (15-20 minutes)
npm run test:weekly     # Full comprehensive test suite

# Pre-Deployment Testing (10-15 minutes)
npm run test:deployment # Go/no-go deployment decision

# Specific Test Types
npm run test:performance # Performance & Lighthouse audits
npm run test:security   # Security vulnerability scanning
npm run test:a11y       # Accessibility compliance testing
npm run test:visual     # Visual regression testing

# Test Data Management
npm run test:data:generate # Create realistic test data
npm run test:data:reset    # Clean test data
```

#### **AI-Powered Testing Features**
- 🤖 **Synthetic User Simulation**: AI generates realistic user behavior patterns
- 🎲 **Smart Test Data**: 20+ users, 30+ studies, 75+ applications with realistic scenarios
- 🔄 **Automated Regression**: Detects issues across all user workflows
- 📊 **Professional Reports**: HTML dashboards with actionable insights
- ⚡ **Performance Monitoring**: Lighthouse scores, API speed, bundle analysis
- 🔒 **Security Scanning**: SQL injection, XSS, authentication vulnerabilities
- ♿ **Accessibility Compliance**: WCAG 2.1 AA automated validation
- 🖼️ **Visual Testing**: Cross-browser, responsive, UI consistency

#### **Testing Cycles for Development**
1. **Before Coding**: `npm run test:smoke` (30 seconds)
2. **During Development**: `npm run test:quick` (2-3 minutes)
3. **Before Commits**: `npm run test:dev` (5 minutes)
4. **Weekly Reviews**: `npm run test:weekly` (15-20 minutes)
5. **Before Deployment**: `npm run test:deployment` (10-15 minutes)

#### **Quality Gates & Standards**
- 🚀 **Deployment Ready Criteria**:
  - ✅ Security: 0 vulnerabilities
  - ⚡ Performance: 90+ Lighthouse score
  - ♿ Accessibility: 95%+ WCAG compliance
  - 🎯 Critical Path: 100% success rate

#### **Test Reports & Monitoring**
- 📊 **Daily Reports**: Quick development feedback
- 📈 **Weekly Reports**: Comprehensive project health
- 🚀 **Deployment Reports**: Go/no-go deployment decisions
- 📋 **Trend Analysis**: Performance and quality trends over time

#### **Benefits for AI Development**
- 💰 **Zero Cost**: No human testers or external services
- 🤖 **AI-Friendly**: Designed for AI development teams
- 🔄 **Fully Automated**: Repeatable throughout development cycles
- 📈 **Professional Quality**: Industry-standard testing practices
- ⚡ **Fast Feedback**: Immediate validation of changes

#### **Integration with Development Workflow**
```bash
# Git hooks integration
git commit   # Automatically runs npm run test:smoke
git push     # Triggers npm run test:quick

# CI/CD integration
deploy       # Runs npm run test:deployment first
```

#### **Test Account Integration**
All testing uses the mandatory 3 test accounts with realistic scenarios:
- **Participant**: Study applications and completion workflows
- **Researcher**: Study creation, management, and results analysis  
- **Admin**: System management and user oversight

**The testing framework ensures professional-grade quality without human testers or user feedback!**

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
