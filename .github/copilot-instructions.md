# ResearchHub - Copilot Instructions

## 📖 How to Use This File

This file provides workspace-specific instructions to GitHub Copilot. To enable it:

1. **Enable in VS Code**: 
   - Open Settings (Ctrl+,)
   - Search for "copilot instructions"
   - Enable "GitHub › Copilot › Chat › Code Generation: Use Instruction Files"

2. **Verify it's working**:
   - Copilot will automatically reference these instructions
   - Ask Copilot about ResearchHub features - it should know our architecture
   - Code suggestions should follow our patterns and rules

3. **File location**: Must be in `.github/copilot-instructions.md` (this file)

---

## 🎯 SINGLE SOURCE OF TRUTH
**ALL specifications are in `docs/requirements/` - never contradict this folder.**

## 🚀 Quick Start
```bash
npm run dev:fullstack    # Local development
npm run test:quick       # Run tests
npm run cleanup          # Clean project structure
```

## 📁 Project Architecture
- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS
- **Backend**: Vercel Functions + Supabase
- **Database**: PostgreSQL with RLS policies
- **Auth**: Supabase Auth with JWT tokens

## 🔒 Test Accounts (MANDATORY)
```bash
# Researcher: abwanwr77+Researcher@gmail.com / Testtest123
# Participant: abwanwr77+participant@gmail.com / Testtest123  
# Admin: abwanwr77+admin@gmail.com / Testtest123
```

## 📋 Development Rules
1. **Requirements First**: Check `docs/requirements/` before coding
2. **Extend Don't Replace**: Enhance existing code vs creating new
3. **Local Testing**: Always test with `npm run dev:fullstack`
4. **Clean Structure**: Use proper directories (testing/, docs/, scripts/)

## 🎯 Study-Centric Architecture
- **Main Dashboard** - Research overview
- **Study Page** - Central hub with tabs (builder, participants, results, collaboration)
- **Studies Management** - List/organize studies
- **Analytics** - Cross-study insights
- **Templates** - Template library
- **Integrations** - External tools
- **Account** - Settings & billing
- **API Docs** - Developer resources

## 🧩 Study Creation Flow
1. **Type Selection**: Unmoderated Study OR Moderated Interviews
2. **Template/Scratch**: Use template or start from scratch
3. **4-Step Builder**: Overview → Characteristics → Blocks → Review
4. **Launch**: Publish for participants

## 💻 Code Patterns
```typescript
// API Pattern
export default async function handler(req, res) {
  try {
    // Logic here
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

// React Component Pattern
interface Props {
  data: DataType;
  onUpdate: (data: DataType) => void;
}

export const Component = ({ data, onUpdate }: Props) => {
  // Implementation
};
```

## 🗂️ File Structure Rules
```
docs/requirements/    ← Single source of truth
testing/             ← All tests
scripts/             ← Utilities
database/            ← Migrations
src/                 ← Frontend code
api/                 ← Backend functions
```

## 📝 File Naming Conventions (MANDATORY)

### **Component Naming Rules**
- **Use Clear, Simple Names**: `UserManagement.tsx`, `StudyBuilder.tsx`, `PaymentSettings.tsx`
- **Avoid Confusing Modifiers**: Never use "Advanced", "Enhanced", "Unified", "Creative", etc.
- **One Component Per Feature**: If you need variants, use props/modes within the same component
- **Descriptive Function**: Name should clearly indicate what the component does

### **File Replacement Strategy**
When updating/replacing components:
1. **Keep Original Name**: Update the existing component instead of creating new variants
2. **Temporary Suffix**: If needed during development, use `.temp.tsx` or `.new.tsx`
3. **Replace, Don't Rename**: Replace old component with new implementation
4. **Document Changes**: Update relevant documentation files

### **Examples of Good vs Bad Naming**
```typescript
// ✅ GOOD - Clear, descriptive names
UserManagement.tsx          // Handles all user management
StudyBuilder.tsx           // Builds studies
PaymentDashboard.tsx       // Payment overview
NotificationCenter.tsx     // Notifications hub

// ❌ BAD - Confusing modifiers
AdvancedUserManagement.tsx // What makes it "advanced"?
EnhancedStudyBuilder.tsx   // Enhanced how?
UnifiedPaymentDashboard.tsx // Unified with what?
CreativeNotifications.tsx   // Meaningless modifier
```

### **Component Organization**
- **Single Responsibility**: One component handles one major feature area
- **Progressive Disclosure**: Use modes/states within component for complexity levels
- **Props for Variants**: Use props to control different behaviors/views
- **Clear Documentation**: Document all modes and features in component comments

## 🚨 Never Create
- Duplicate directories (tests/ when testing/ exists)
- Root directory clutter
- Conflicting documentation
- New components when existing ones can be extended

## 📚 **DOCUMENTATION RULES (MANDATORY)**

### 🚫 **NO NEW DOCUMENTATION FILES**
- **NEVER create new .md files for documentation**
- **ALWAYS update existing documentation instead**
- **UPDATE, don't duplicate**: Enhance current files rather than creating new ones

### 📝 **Documentation Update Strategy**
- **Add to existing sections**: Append new information to relevant existing files
- **Update timestamps**: Modify "Last Updated" dates in existing documents
- **Enhance current content**: Improve existing documentation with new details
- **Use established patterns**: Follow existing documentation structure and format

### 🎯 **Centralized Documentation Locations**
```
✅ UPDATE THESE FILES (don't create new ones):
- README.md (project overview & status)
- .github/copilot-instructions.md (development guide)
- docs/DOCUMENTATION_INDEX.md (master index)
- docs/CHANGELOG.md (project history)
- docs/requirements/ (system specifications)
```

### ⚠️ **Exception Cases (Rare)**
New documentation files are ONLY allowed for:
- **New system requirements**: `docs/requirements/NEW_SYSTEM.md`
- **Test interfaces**: `test-*.html` files for manual testing
- **Archive purposes**: Moving old content to `archive/`

### 🔄 **When You Need to Document Something:**
1. **First**: Check if it fits in existing documentation
2. **Update**: Add new section to existing file
3. **Enhance**: Improve current documentation with new info
4. **Link**: Cross-reference between existing files
5. **Never**: Create a new standalone documentation file

**Goal**: Maintain centralized, minimized documentation that's easy to find and maintain.
- ✅ **Collaboration Features**: Real-time team collaboration fully integrated in Study Builder
- ✅ **Backend APIs**: Collaboration, approval, and comments APIs with WebSocket server
- ✅ **Database Schema**: Collaboration tables and RLS policies ready for production
- ✅ **Comprehensive Testing Framework**: AI-powered automated testing with 0 human testers required
- 🚧 **Production Deployment**: Working but with Vercel function limits

## ✅ Recent Major Achievements (July 17, 2025)
- **Launch Button CORS Fix Complete**: Resolved cross-origin resource sharing issues preventing study creation
- **Study Builder Launch Functionality**: Launch button now fully functional with proper API integration
- **Comprehensive CORS Configuration**: Updated vercel.json with proper headers for all API endpoints
- **Advanced Testing Suite**: Created complete test suite for Launch button validation with 6-step verification
- **API Endpoint Verification**: Confirmed research-consolidated API working with authentication and CORS

## ✅ Recent Major Achievements (July 7, 2025)
- **Vibe-Coder-MCP Implementation Complete**: Full implementation of advanced development enhancement system
- **Production Monitoring System**: Comprehensive monitoring with ProductionMonitor, PerformanceMonitor, HealthCheckService, APMService
- **Analytics & Business Intelligence**: Complete BI platform with KPI tracking, usage analytics, executive dashboards  
- **Advanced Security Framework**: Multi-layer security with SecurityManager, ThreatDetection, and real-time monitoring
- **API Optimization System**: High-performance API layer with caching, batching, circuit breaker patterns
- **Real-time Notification System**: SSE-based notification system for instant communication
- **Professional Testing Framework**: Zero-manual-testing automation with AI-powered test generation
- **Complete Documentation Suite**: Technical documentation, user training, troubleshooting runbooks
- **Project Cleanup & Organization**: Streamlined directory structure with archived legacy files
- **Development Server Optimization**: Fixed import paths and optimized local development workflow

## ✅ Previous Major Achievements (July 3, 2025)
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
- **Payment Integration**: DodoPayments integration for researcher payments

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

### 🎯 Vibe-Coder-MCP Development Methodologies (Local Implementation)
- **Purpose**: Development process improvements extracted from Vibe-Coder-MCP repository analysis
- **Repository**: https://github.com/freshtechbro/Vibe-Coder-MCP (analyzed for methodologies, NOT connected as external MCP)
- **Status**: ✅ Implemented as local scripts in `scripts/development/`
- **Local Tools Available**:
  - `scripts/development/vibe-coder-patterns.js` - Project structure analysis, task decomposition (RDD), code quality patterns
  - `scripts/development/vibe-coder-testing.js` - Test strategy generation, AI test data, automation templates
  - `scripts/development/vibe-coder-docs.js` - PRD generator, user stories, API docs, architecture documentation
- **Usage**: Run `node scripts/development/vibe-coder-patterns.js analyze` for CLI options
- **Benefits**: Enhanced development workflows, code quality improvement, automated testing, performance optimization

### 🎯 Local Vibe-Coder-MCP Tools Usage Examples

> **Note**: If any script doesn't respond, try the simplified version: `node scripts/development/vibe-coder-patterns-simple.js`

#### Quick Usage
```bash
# Analyze project structure and get improvement suggestions
node scripts/development/vibe-coder-patterns.js analyze

# Generate test strategy for a new feature
node scripts/development/vibe-coder-testing.js strategy "Study Builder Enhancement"

# Generate PRD for a new feature
node scripts/development/vibe-coder-docs.js prd "Advanced Block Types" "Enhanced study block system with AI integration"

# Decompose complex task using RDD methodology
node scripts/development/vibe-coder-patterns.js decompose "Implement real-time collaboration"

# Generate realistic test data
node scripts/development/vibe-coder-testing.js data studies 10
```

#### Available Commands by Tool

**🔧 vibe-coder-patterns.js**
- `analyze` - Analyze project structure and code quality
- `decompose [task]` - Break down complex tasks using RDD methodology  
- `performance` - Generate performance monitoring templates
- `workflows` - Create workflow templates
- `all` - Run all pattern extractions

**🧪 vibe-coder-testing.js**
- `strategy [feature]` - Generate comprehensive test strategy
- `data [entity] [count]` - Generate realistic test data (users, studies, applications)
- `automation [type] [component]` - Generate test automation (playwright, vitest, accessibility)
- `performance` - Generate performance tests
- `all` - Generate complete test suite

**📚 vibe-coder-docs.js**
- `prd [name] [description]` - Generate PRD templates
- `stories [feature]` - Generate user stories for a feature
- `api` - Generate API documentation templates
- `architecture` - Generate technical architecture documentation
- `all` - Generate complete documentation suite

#### Integrated Development Workflow
```bash
# 🚀 Before starting a new feature
node scripts/development/vibe-coder-patterns.js decompose "New Feature Name"
node scripts/development/vibe-coder-testing.js strategy "New Feature Name"
node scripts/development/vibe-coder-docs.js prd "New Feature Name" "Feature description"

# 💻 During development
node scripts/development/vibe-coder-patterns.js analyze
node scripts/development/vibe-coder-testing.js data users 20

# 🚀 Before deployment
node scripts/development/vibe-coder-patterns.js performance
node scripts/development/vibe-coder-testing.js performance
```

#### Generated Output Locations
- **Patterns**: `scripts/development/` (performance checks, workflow templates)
- **Testing**: `testing/data/` (test data), `testing/generated/` (test files)
- **Documentation**: `docs/` (PRDs, architecture), `docs/api/` (API docs)

### 🎯 How to Leverage Available MCP Tools
1. **Automated Testing**: Use Playwright MCP for comprehensive E2E testing
2. **Database Operations**: Use Supabase MCP for complex migrations and queries
3. **Project Documentation**: Use Memory Bank MCP to track progress and decisions
4. **Code Operations**: Use Desktop Commander MCP for file management tasks
5. **Reference Lookup**: Use Context7 MCP for latest library documentation
6. **Local Development Enhancement**: Use local Vibe-Coder-MCP tools for process improvement

**These MCP tools plus local development tools provide AI-powered assistance for complex development tasks, making development more efficient and reducing manual work.**

## 🎯 Complete Development Workflow Integration

### 🚀 Start-to-Finish Development Process
```bash
# 1. Initialize new feature development
node scripts/development/vibe-coder-patterns.js decompose "New Feature Name"
node scripts/development/vibe-coder-docs.js prd "New Feature Name" "Description"

# 2. Set up development environment
npm run dev:fullstack
npm run cleanup  # Ensure clean project structure

# 3. Generate comprehensive test strategy
node scripts/development/vibe-coder-testing.js strategy "New Feature Name"
node scripts/development/vibe-coder-testing.js data users 20

# 4. During development - continuous quality checks
node scripts/development/vibe-coder-patterns.js analyze
npm run test:quick

# 5. Pre-deployment validation
node scripts/development/vibe-coder-patterns.js performance
npm run test:deployment

# 6. Generate documentation updates
node scripts/development/vibe-coder-docs.js stories "New Feature Name"
node scripts/development/vibe-coder-docs.js api
```

### 🎯 How Local Tools Integrate with MCP Tools
1. **Planning Phase**: Local docs tools + Memory Bank MCP for requirements
2. **Development Phase**: Local patterns tools + Desktop Commander MCP for coding
3. **Testing Phase**: Local testing tools + Playwright MCP for validation
4. **Database Phase**: Local performance tools + Supabase MCP for optimization
5. **Documentation Phase**: Local docs tools + Context7 MCP for reference

## 🛠️ Additional Development Methodology References (Optional)

### 🎯 External Development Patterns from Vibe-Coder-MCP (For Future Extraction)
For additional advanced development methodologies, developers can reference the external Vibe-Coder-MCP repository for more patterns and approaches that could be extracted in the future:

**Development Methodologies Available for Future Extraction (not yet implemented locally):**
- **Advanced Code Analysis**: Multi-language codebase analysis (35+ languages supported)  
- **Advanced Task Management**: More sophisticated AI-native task management patterns
- **Extended Documentation Standards**: Additional documentation automation patterns
- **Advanced Testing Methodologies**: More comprehensive testing automation frameworks
- **Performance Optimization**: Extended monitoring and optimization pattern libraries
- **Advanced Workflow Automation**: Complex development workflow orchestration patterns
- **Project Structure**: Additional project organization and file management standards
- **Quality Assurance**: Extended code quality validation and improvement methodologies

**Future Implementation Approach:**
1. **Identify Gaps**: Determine which methodologies would benefit ResearchHub development
2. **Extract Methodologies**: Analyze repository for specific development patterns needed
3. **Adapt to ResearchHub**: Implement patterns suitable for ResearchHub's architecture
4. **Local Implementation**: Build additional tools and processes without external API dependencies
5. **Continuous Improvement**: Refine processes based on ResearchHub's specific needs

**Potential Benefits for Future Development:**
- **Extended Process Improvement**: More comprehensive development workflows and automation
- **Advanced Code Quality**: Extended code analysis and validation methodologies  
- **Enhanced Testing**: Additional testing patterns and automation frameworks
- **Performance Optimization**: More sophisticated performance monitoring and optimization tools
- **Documentation Standards**: Extended documentation and process improvement capabilities
- **Team Productivity**: Additional streamlined development processes and workflow automation

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

# DodoPayments (Required for researcher payments)
DODOPAYMENTS_API_KEY=your_api_key
DODOPAYMENTS_SECRET_KEY=your_secret_key
DODOPAYMENTS_WEBHOOK_SECRET=your_webhook_secret

# Optional (for full features)
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

### 🧪 Testing Interfaces Available
- **`test-launch-button-complete.html`**: Comprehensive 6-step Launch button validation suite
- **`test-launch-fix.html`**: Basic Launch button testing interface
- **`test-enhanced-review-step.html`**: Review step testing interface
- **`test-study-builder-improvements.html`**: Study builder functionality tests
- **`test-header-consistency.html`**: Header component testing
- **`test-admin-functionality.js`**: Admin system testing script

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

### 🎯 Current Development Priorities (July 18, 2025)
1. **Adaptive Test Coverage Implementation**: Comprehensive testing framework that evolves with code changes
2. **Backend block API support**: Add endpoints for block templates and management
3. **Block session rendering**: Implement participant experience for all block types
4. **Advanced block features**: AI integration, conditional logic, analytics
5. **Template creation UI**: Visual template builder for researchers
6. **Enhanced CORS configuration**: Extend to production deployment
7. **Maintain test account integrity**: Keep roles correct for testing

## 🧪 **ADAPTIVE TESTING STRATEGY (NEW - July 18, 2025)**
**Revolutionary approach to maintain 100% test coverage as codebase evolves**

### **Core Concept: Self-Evolving Test Suite**
- 🤖 **AI-Powered Test Generation**: Automatically generates tests for new features and code changes
- 🔄 **Change Detection**: Monitors codebase and requirements for modifications
- 📊 **Intelligent Coverage**: Ensures comprehensive coverage across all scenarios
- ⚡ **Zero-Maintenance Testing**: Tests update themselves as code evolves

### **Implementation Components**
```javascript
// Adaptive Testing Architecture
const adaptiveTestingSystem = {
  changeDetection: 'Monitor file system for code/requirement changes',
  testGeneration: 'Auto-generate tests for detected changes',
  coverageTracking: 'Ensure 100% scenario coverage maintained',
  optimization: 'Continuously improve test suite efficiency'
};
```

### **Test Coverage Matrix**
- ✅ **User Workflows**: Complete researcher/participant/admin journeys
- ✅ **API Testing**: All endpoints with edge cases and error conditions
- ✅ **UI/UX Testing**: Cross-browser, responsive, accessibility compliance
- ✅ **Security Testing**: Input validation, authentication, data protection
- ✅ **Performance Testing**: Load, stress, endurance scenarios
- ✅ **Integration Testing**: Database, external services, real-time features

### **Adaptive Testing Commands**
```bash
# Development workflow with automatic test generation
npm run test:adaptive        # Run adaptive test suite
npm run test:generate        # Generate tests for recent changes
npm run test:coverage        # Comprehensive coverage analysis
npm run test:optimize        # Optimize and enhance test suite

# Change detection and monitoring
npm run test:watch           # Monitor for changes and auto-generate tests
npm run test:analyze         # Analyze code changes and suggest tests
npm run test:validate        # Validate test coverage completeness
```

### **Smart Test Generation Features**
- 🎯 **Scenario-Based**: Generates tests based on user workflows and business logic
- 🔍 **Code Analysis**: Analyzes new code to identify test requirements
- 📋 **Template-Driven**: Uses intelligent templates for common testing patterns
- 🧠 **Learning System**: Improves test quality based on historical data

### **Key Benefits**
- 🚀 **Zero Test Maintenance**: Tests automatically update with code changes
- 📈 **100% Coverage**: Ensures all scenarios are covered as system grows
- ⚡ **Fast Feedback**: Immediate test generation for new features
- 🎯 **Quality Assurance**: Catches issues before they reach production
- 💡 **Developer-Friendly**: Invisible testing that just works

### **Integration with Development Workflow**
```bash
# Git hooks automatically trigger test generation
git commit    # Generates tests for modified code
git push      # Runs adaptive test suite validation

# Feature development workflow  
1. Developer writes new feature
2. AI detects code changes
3. Tests automatically generated
4. Coverage validated and maintained
5. Quality assured before deployment
```

## 🏆 Local Development Benefits
- ⚡ **Ultra-fast iteration**: No deployment cycle needed
- 🔄 **Real-time testing**: Using actual Supabase database
- 🛠️ **Complete environment**: Frontend + Backend + Database locally
- 🐛 **Easy debugging**: Console logs and immediate feedback
- 📊 **Production parity**: Same data and behavior as production

**Use `npm run dev:fullstack` for the fastest development experience!**
