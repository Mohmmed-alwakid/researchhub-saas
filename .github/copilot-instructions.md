# Afkar - AI Coding Agent Instructions

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

## 📋 **REQUIREMENTS ORGANIZATION & STORY ID BEST PRACTICES**

### **Folder Structure (Feature-Based Organization)**
```
docs/requirements/
├── 00_MASTER_INDEX.md              # Central navigation
├── core-platform/                  # Platform foundation stories
│   ├── 02_USER_RESEARCH_ENGINE.md  # UE-001 to UE-999
│   ├── 03_PARTICIPANT_MANAGEMENT.md # PM-001 to PM-999
│   └── 04_STUDY_EXECUTION.md       # SE-001 to SE-999
├── analytics-insights/              # Analytics & reporting
│   └── 05_ANALYTICS_INSIGHTS.md    # AI-001 to AI-999
├── enterprise/                      # Enterprise features
│   ├── 06_ENTERPRISE_FEATURES.md   # EF-001 to EF-999
│   └── 07_INTEGRATIONS_API.md      # IA-001 to IA-999
├── user-experience/                 # User-facing features
│   └── 08_MOBILE_EXPERIENCE.md     # ME-001 to ME-999
├── business/                        # Business operations
│   └── 09_MONETIZATION_BILLING.md  # MB-001 to MB-999
└── user-stories/                    # Cross-referenced stories
    ├── by-role/                     # Organized by user role
    │   ├── researcher/              # Stories for researchers
    │   ├── participant/             # Stories for participants
    │   └── admin/                   # Stories for administrators
    └── by-priority/                 # Organized by priority
        ├── p0-critical/             # P0 stories
        ├── p1-important/            # P1 stories
        └── p2-enhancement/          # P2 stories
```

### **Unique Story ID Convention (MANDATORY)**
```
Format: [PREFIX]-[NUMBER]
Examples:
- UE-001: User Engine Story #1
- PM-047: Participant Management Story #47  
- SE-023: Study Execution Story #23
- AI-012: Analytics Insights Story #12
- EF-008: Enterprise Features Story #8
- IA-015: Integrations API Story #15
- ME-033: Mobile Experience Story #33
- MB-019: Monetization Billing Story #19
```

### **Story ID Prefixes**
| **Prefix** | **Feature Area** | **File** | **Range** |
|------------|------------------|----------|-----------|
| `UE-` | User Research Engine | 02_USER_RESEARCH_ENGINE.md | UE-001 to UE-999 |
| `PM-` | Participant Management | 03_PARTICIPANT_MANAGEMENT.md | PM-001 to PM-999 |
| `SE-` | Study Execution | 04_STUDY_EXECUTION.md | SE-001 to SE-999 |
| `AI-` | Analytics & Insights | 05_ANALYTICS_INSIGHTS.md | AI-001 to AI-999 |
| `EF-` | Enterprise Features | 06_ENTERPRISE_FEATURES.md | EF-001 to EF-999 |
| `IA-` | Integrations & API | 07_INTEGRATIONS_API.md | IA-001 to IA-999 |
| `ME-` | Mobile Experience | 08_MOBILE_EXPERIENCE.md | ME-001 to ME-999 |
| `MB-` | Monetization & Billing | 09_MONETIZATION_BILLING.md | MB-001 to MB-999 |

### **Story Cross-Reference System**
```markdown
#### **Story UE-001: AI-Powered Interview Moderator**
- **Epic**: AI Research Automation
- **Feature Area**: User Research Engine
- **Related Stories**: PM-015 (Quality Scoring), SE-008 (Video Recording)
- **Dependencies**: AI-003 (Sentiment Analysis), EF-012 (SSO Integration)
- **Stakeholders**: Researchers, Product Managers
- **User Roles**: Researcher (primary), Admin (secondary)
```

### **Cross-Role Story Organization**
Stories should be **primarily organized by feature area** but **cross-referenced by role**:

```
✅ RECOMMENDED: Feature-based primary organization
docs/requirements/core-platform/02_USER_RESEARCH_ENGINE.md
└── Contains: UE-001, UE-002, UE-003... (all User Engine stories)

✅ CROSS-REFERENCE: Role-based secondary organization  
docs/requirements/user-stories/by-role/researcher/
├── researcher-stories-index.md     # Links to UE-001, PM-005, SE-012...
├── researcher-workflows.md         # End-to-end workflows
└── researcher-permissions.md       # Access control requirements

docs/requirements/user-stories/by-role/participant/
├── participant-stories-index.md    # Links to PM-020, SE-003, ME-001...
├── participant-experience.md       # Journey mapping
└── participant-onboarding.md       # Onboarding requirements
```

### **Story Management Best Practices**

#### **1. Story Creation Process**
```bash
# When creating new stories:
1. Check existing story IDs to avoid conflicts
2. Use next available number in sequence (UE-001, UE-002, etc.)
3. Add cross-references to related stories
4. Update role-based indexes
5. Link to relevant epics and features
```

#### **2. Story Template (MANDATORY)**
```markdown
#### **Story [PREFIX]-[NUMBER]: [Clear Story Title]**
- **As a** [User Role]
- **I want** [Functionality]
- **So that** [Business Value]

**Epic**: [Epic Name]
**Feature Area**: [Feature Area Name]
**Related Stories**: [List related story IDs]
**Dependencies**: [List dependent story IDs]
**Stakeholders**: [List stakeholders]
**User Roles**: [Primary role], [Secondary roles]

**Acceptance Criteria:**
- [ ] [Specific, testable criteria]
- [ ] [Include UI/UX requirements]
- [ ] [Include technical requirements]
- [ ] [Include success metrics]

**Priority:** P0/P1/P2 | **Effort:** XS/S/M/L/XL | **Dependencies:** [Story IDs]

---
```

#### **3. Story Lifecycle Management**
- **Draft → Review → Approved → In Development → Testing → Done**
- **Status Tracking**: Use story status in file headers
- **Change Management**: Update related stories when dependencies change
- **Traceability**: Maintain backward/forward links between stories

#### **4. Global Story Registry**
Maintain `docs/requirements/00_MASTER_INDEX.md` with:
```markdown
## 📊 **STORY REGISTRY**

| **Story ID** | **Title** | **Feature Area** | **Priority** | **Status** |
|-------------|-----------|------------------|--------------|------------|
| UE-001 | AI Interview Moderator | User Research | P0 | ✅ Complete |
| PM-001 | Global Recruitment | Participants | P0 | 🔄 In Progress |
| SE-001 | Video Recording | Study Execution | P0 | 📋 Planned |
```

## � **PRODUCTION SITE PRIORITY (MANDATORY)**
**FIRST PRIORITY: Always focus on the live production site unless explicitly told otherwise.**

### **Production Environment (PRIMARY FOCUS)**
- **URL**: https://researchhub-saas.vercel.app
- **Purpose**: LIVE platform for actual users - THIS IS THE PRIORITY
- **Status**: Production deployment - all fixes must work here
- **Access**: Public access, real user traffic

### **Development Environment (SECONDARY)**
- **URL**: http://localhost:5175 (local development only)
- **Purpose**: Development and testing ONLY when specifically requested
- **Usage**: Use ONLY when explicitly asked for local development

### **CRITICAL RULES:**
1. **DEFAULT TO PRODUCTION**: Always assume production site unless told "use local"
2. **TEST ON PRODUCTION**: Apply fixes to production environment
3. **NO SWITCHING**: Don't suggest switching between environments
4. **PRODUCTION FIRST**: All user reports refer to production site
5. **LIVE SITE FOCUS**: Treat production as the primary platform

**When user says "the site" or "the page" - they mean PRODUCTION.**

## �🚀 Essential Commands
```bash
npm run dev:fullstack    # Local development with real Supabase backend
npm run test:quick       # Run tests during development
npm run cleanup          # Clean project structure automatically
```

## 🏗️ Architecture Overview

### **Core Platform: Study-Centric Research SaaS**
- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS
- **Backend**: 12 Vercel Serverless Functions (consolidated API pattern)
- **Database**: Supabase PostgreSQL with RLS policies
- **Auth**: Supabase Auth with role-based access (researcher/participant/admin)
- **Local Dev**: Express.js proxy server connecting to real Supabase

### **Study Blocks System (Core Feature)**
The platform's unique architecture centers on a **modular block-based study builder**:

```typescript
// Core pattern: Study = Sequence of Blocks
interface StudyBuilderBlock {
  id: string;
  type: 'welcome' | 'open_question' | 'opinion_scale' | 'multiple_choice' | 'context_screen' | 'yes_no' | '5_second_test' | 'card_sort' | 'tree_test' | 'thank_you' | 'image_upload' | 'file_upload' | 'simple_input';
  order: number;
  title: string;
  description: string;
  settings: Record<string, any>;
}
```

**13 Block Types Available:**
1. Welcome Screen, 2. Open Question, 3. Opinion Scale, 4. Simple Input
5. Multiple Choice, 6. Context Screen, 7. Yes/No, 8. 5-Second Test
9. Card Sort, 10. Tree Test, 11. Thank You, 12. Image Upload, 13. File Upload

### **Multi-Step Study Creation Flow**
1. **StudyTypeSelectionModal** → Choose template or scratch
2. **TemplateSelectionModal** → Browse pre-configured block collections  
3. **StudyBuilder** → Drag-drop block arrangement with live editing
4. **Launch** → Publish for participants

## � Critical Development Patterns

### **API Consolidation Pattern**
Due to Vercel's function limits, APIs are consolidated into action-based endpoints:

```javascript
// Pattern: Single file handles multiple actions
export default async function handler(req, res) {
  const { action } = req.query;
  
  switch (action) {
    case 'get-studies': return getStudies(req, res);
    case 'create-study': return createStudy(req, res);
    case 'dashboard-analytics': return getDashboardAnalytics(req, res);
    default: return res.status(400).json({ error: 'Invalid action' });
  }
}
```

**Key Consolidated APIs:**
- `auth-consolidated.js` - Authentication, registration, 2FA
- `research-consolidated.js` - Studies, templates, analytics  
- `payments-consolidated-full.js` - Billing, subscriptions, DodoPay integration
- `study-sessions.js` - Participant study completion workflow

### **Local Development Architecture**
Unique hybrid setup using `scripts/development/local-full-dev.js`:

```javascript
// Express proxy that imports Vercel functions directly
import authHandler from '../../api/auth-consolidated.js';
app.use('/api/auth', authHandler);
// Real Supabase connection + hot reload + function isolation
```

**Why This Matters:** 
- Test with real production database
- Hot reload during development  
- Identical function behavior to production
- No separate local database setup needed

### **Authentication & Role System**
```typescript
// Role-based navigation in AppLayout.tsx
const getNavigationForRole = () => {
  if (userRole === 'participant') return participantNav;
  if (userRole === 'researcher') return researcherNav; 
  if (userRole === 'admin') return adminNav;
}

// Test accounts (MANDATORY - never create new ones):
// Researcher: abwanwr77+Researcher@gmail.com / Testtest123
// Participant: abwanwr77+participant@gmail.com / Testtest123  
// Admin: abwanwr77+admin@gmail.com / Testtest123
```

## � Project Structure Rules

### **Mandatory Directory Organization**
```
docs/requirements/        ← All specifications (single source of truth)
├── 00_MASTER_INDEX.md   ← Central hub with story registry
├── core-platform/       ← Platform foundation (UE, PM, SE stories)
├── analytics-insights/   ← Analytics & reporting (AI stories)  
├── enterprise/          ← Enterprise features (EF, IA stories)
├── user-experience/     ← UX & mobile (ME stories)
├── business/            ← Business operations (MB stories)
└── user-stories/        ← Cross-reference organization
    ├── by-role/         ← Researcher, Participant, Admin views
    └── by-priority/     ← P0, P1, P2 story groupings
testing/                 ← All tests and test interfaces  
scripts/                 ← Development utilities
api/                     ← Vercel serverless functions (12 total)
src/client/              ← React frontend components
database/                ← Migration scripts
```

### **Component Naming (STRICT)**
- ✅ **Clear, descriptive**: `StudyBuilder.tsx`, `ParticipantDashboard.tsx`
- ❌ **Never use modifiers**: "Advanced", "Enhanced", "Unified", "Creative"
- ✅ **One component per feature**: Use props/modes for variants
- ✅ **Extend existing**: Don't create new when existing can be enhanced

## 🧪 Testing & Validation

### **Development Workflow**
```bash
npm run dev:fullstack  # Start local environment (90% of development)
npm run test:quick     # Run during development  
npm run cleanup        # Auto-organize project structure
```

### **Test Account Rules (MANDATORY)**
- **Only use the 3 designated test accounts** - never create new ones
- **Test locally first** before touching production
- **Use testing/manual/test-*.html** for API validation

## 🚨 Critical Constraints

### **File Management**
- **12 API functions total** - consolidate, don't create new
- **No root directory clutter** - use proper subdirectories
- **No duplicate directories** (e.g., tests/ when testing/ exists)
- **Update documentation, don't create new files**

### **Development Anti-Patterns**  
```typescript
// ❌ DON'T: Create new components for variants
interface AdvancedStudyBuilderProps {}
export const AdvancedStudyBuilder = () => {};

// ✅ DO: Use props for modes
interface StudyBuilderProps {
  mode?: 'basic' | 'advanced';
}
export const StudyBuilder = ({ mode = 'basic' }) => {};
```

## 🎯 Integration Points

### **Study Builder → Block System**
```typescript
// Key integration pattern in StudyBuilder
const [studyBlocks, setStudyBlocks] = useState<StudyBuilderBlock[]>([]);
// DragDropBlockList for ordering
// BlockEditModal for configuration  
// Always append Thank You block automatically
```

### **Template System → Block Collections**
Templates are pre-configured block combinations stored in `api/templates-consolidated.js`:
```javascript
const templates = [
  {
    id: 'usability-basic',
    blocks: [welcomeBlock, contextBlock, taskBlocks, feedbackBlock, thankYouBlock]
  }
];
```

### **Collaboration Features (Real-time)**
- **CollaborationHeader** - Live presence, activity access
- **WebSocket integration** - Real-time study form watching
- **Role-based permissions** - Team collaboration on studies

---

**Last Updated:** September 20, 2025 | **Status:** Production-ready with 12 consolidated APIs

## 🌐 **HYBRID DEVELOPMENT STRATEGY** 

### **Multi-Environment Setup** ✅ **ACTIVE**
1. **Local Development**: 
   - **URL**: http://localhost:5175 (frontend) + http://localhost:3003 (API)
   - **Purpose**: Daily development, rapid iteration, debugging
   - **Command**: `npm run dev:fullstack`
   - **Benefits**: Speed, offline capability, superior debugging

2. **Staging Environment**: 
   - **URL**: https://researchhub-saas-rmwizk1az-mohmmed-alwakids-projects.vercel.app
   - **Purpose**: Team testing, integration validation
   - **Deployment**: Auto-deploy from `staging` branch
   - **Benefits**: Environment parity, team collaboration

3. **Production Environment**: 
   - **URL**: https://researchhub-saas-ca57yz24b-mohmmed-alwakids-projects.vercel.app
   - **Purpose**: Live platform for end users
   - **Deployment**: Auto-deploy from `main` branch
   - **Benefits**: Stable, tested releases

4. **Feature Preview**: 
   - **URL**: Auto-generated URLs for feature branches
   - **Purpose**: Individual feature testing and validation
   - **Deployment**: Auto-deploy on feature branch push
   - **Benefits**: Isolated testing, stakeholder previews

### **Hybrid Development Best Practices**
- ✅ **Local First**: Use local development for daily work (90% of time)
- ✅ **Cloud Validate**: Use cloud environments for testing (10% of time)
- ✅ **Staging Approval**: Always test in staging before production
- ✅ **Environment Parity**: Cloud testing ensures production compatibility
- ❌ **Avoid**: Direct production testing of unfinished features
- ❌ **Avoid**: Skipping staging validation

### **Branch Strategy & Merge Guidelines**
- **main**: Production-ready code only (deploy to production)
- **vibe-coder-implementation**: ✅ COMPLETED & MERGED - Successfully merged to main (August 11, 2025)
- **Feature branches**: Small, focused features (create PR → preview → test → merge)
- **Development workflow**: Local → Feature branch → Preview/Staging → Main (Production)
- **Best practice**: Smaller, targeted branches instead of large implementation branches

### **Completed Merge Process (August 11, 2025)**
```bash
# Successfully completed merge process
git checkout main
git pull origin main                    # Got latest
git merge vibe-coder-implementation     # Merged completed work
git push origin main                    # Deployed to production
git branch -D vibe-coder-implementation # Cleaned up branch
```

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

## ✅ Recent Major Achievements (August 11, 2025)
- **Complete 404 Error Resolution**: Fixed all critical API endpoints preventing platform functionality
- **Wallet API Implementation**: Created complete wallet system with authentication and CORS support
- **Applications API Deployment**: Implemented participant study applications management
- **Password Reset Functionality**: Added forgot password API with Supabase integration
- **Vercel Function Optimization**: Achieved perfect 12/12 function limit usage with zero waste
- **Production Platform 100% Operational**: All user workflows functional without errors

## ✅ Previous Major Achievements (July 17, 2025)
- **Launch Button CORS Fix Complete**: Resolved cross-origin resource sharing issues preventing study creation
- **Study Builder Launch Functionality**: Launch button now fully functional with proper API integration
- **Comprehensive CORS Configuration**: Updated vercel.json with proper headers for all API endpoints
- **Advanced Testing Suite**: Created complete test suite for Launch button validation with 6-step verification
- **API Endpoint Verification**: Confirmed research-consolidated API working with authentication and CORS
## ✅ Previous Major Achievements (July 3, 2025)
- **Vibe-Coder-MCP Implementation Complete**: Full implementation of advanced development enhancement system
- **Complete Project Restructuring**: Successfully migrated from vibe-coder-implementation branch to main
- **Production Monitoring System**: Comprehensive monitoring with ProductionMonitor, PerformanceMonitor, HealthCheckService, APMService  
- **Advanced Security Framework**: Multi-layer security with SecurityManager, ThreatDetection, and real-time monitoring
- **API Optimization System**: High-performance API layer with caching, batching, circuit breaker patterns
- **Real-time Notification System**: SSE-based notification system for instant communication
- **Professional Testing Framework**: Zero-manual-testing automation with AI-powered test generation
- **Complete Documentation Suite**: Technical documentation, user training, troubleshooting runbooks
- **Project Cleanup & Organization**: Streamlined directory structure with archived legacy files
- **Development Server Optimization**: Fixed import paths and optimized local development workflow

## ✅ Previous Major Achievements (July 7, 2025)
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
- **Backend Block Session Rendering**: For participant experience
- **Advanced Block Features**: AI integration, conditional logic, advanced analytics
- **Template Creation UI**: Visual template builder for researchers  
- **Block Analytics**: Usage patterns and effectiveness metrics
- **Template Marketplace**: Community sharing and collaboration
- **Screen Recording**: Video capture integration
- **Payment Integration**: DodoPayments integration for researcher payments

## 🎯 **CURRENT DEVELOPMENT STATUS**

### **Production Ready Platform**
- **Status**: AI integration complete, production stable
- **Version**: 1.0.3 with React 18.2.0
- **AI Features**: 5 AI-powered features operational
- **Architecture**: 12/12 Vercel functions optimally used

## 🤖 **n8n WORKFLOW AUTOMATION**

You are an expert in n8n automation software using n8n-MCP tools. Your role is to design, build, and validate n8n workflows with maximum accuracy and efficiency for ResearchHub development tasks.

### **Core Workflow Process**

1. **ALWAYS start new conversation with**: `tools_documentation()` to understand best practices and available tools.

2. **Discovery Phase** - Find the right nodes:
   - Think deeply about user request and the logic you are going to build to fulfill it. Ask follow-up questions to clarify the user's intent, if something is unclear. Then, proceed with the rest of your instructions.
   - `search_nodes({query: 'keyword'})` - Search by functionality
   - `list_nodes({category: 'trigger'})` - Browse by category
   - `list_ai_tools()` - See AI-capable nodes (remember: ANY node can be an AI tool!)

3. **Configuration Phase** - Get node details efficiently:
   - `get_node_essentials(nodeType)` - Start here! Only 10-20 essential properties
   - `search_node_properties(nodeType, 'auth')` - Find specific properties
   - `get_node_for_task('send_email')` - Get pre-configured templates
   - `get_node_documentation(nodeType)` - Human-readable docs when needed
   - It is good common practice to show a visual representation of the workflow architecture to the user and asking for opinion, before moving forward.

4. **Pre-Validation Phase** - Validate BEFORE building:
   - `validate_node_minimal(nodeType, config)` - Quick required fields check
   - `validate_node_operation(nodeType, config, profile)` - Full operation-aware validation
   - Fix any validation errors before proceeding

5. **Building Phase** - Create the workflow:
   - Use validated configurations from step 4
   - Connect nodes with proper structure
   - Add error handling where appropriate
   - Use expressions like $json, $node["NodeName"].json
   - Build the workflow in an artifact for easy editing downstream (unless the user asked to create in n8n instance)

6. **Workflow Validation Phase** - Validate complete workflow:
   - `validate_workflow(workflow)` - Complete validation including connections
   - `validate_workflow_connections(workflow)` - Check structure and AI tool connections
   - `validate_workflow_expressions(workflow)` - Validate all n8n expressions
   - Fix any issues found before deployment

7. **Deployment Phase** (if n8n API configured):
   - `n8n_create_workflow(workflow)` - Deploy validated workflow
   - `n8n_validate_workflow({id: 'workflow-id'})` - Post-deployment validation
   - `n8n_update_partial_workflow()` - Make incremental updates using diffs
   - `n8n_trigger_webhook_workflow()` - Test webhook workflows

### **ResearchHub-Specific Workflows**

#### **Priority Automation Workflows**
1. **Fix React Context Errors** - Automatically detect and fix React createContext issues
2. **Deployment Validation** - Test all APIs, database, auth before production deploy
3. **Documentation Consolidation** - Scan, merge, and organize duplicate documentation
4. **Study Cycle Testing** - Complete end-to-end study creation and participation testing
5. **Project Cleanup** - Organize files, remove duplicates, maintain structure

#### **Common ResearchHub Triggers**
- **File changes** in React components → Check for React errors
- **Git commits** → Run deployment validation
- **Documentation updates** → Check for duplicates and consolidate
- **Production deployments** → Run full test suite
- **Error detection** → Apply known fixes automatically

### **Key Automation Insights**

- **USE CODE NODE ONLY WHEN IT IS NECESSARY** - always prefer to use standard nodes over code node. Use code node only when you are sure you need it.
- **VALIDATE EARLY AND OFTEN** - Catch errors before they reach deployment
- **USE DIFF UPDATES** - Use n8n_update_partial_workflow for 80-90% token savings
- **ANY node can be an AI tool** - not just those with usableAsTool=true
- **Pre-validate configurations** - Use validate_node_minimal before building
- **Post-validate workflows** - Always validate complete workflows before deployment
- **Focus on RepeatFix** - Automate solutions for problems that occur multiple times

### **Validation Strategy**

#### **Before Building:**
1. validate_node_minimal() - Check required fields
2. validate_node_operation() - Full configuration validation
3. Fix all errors before proceeding

#### **After Building:**
1. validate_workflow() - Complete workflow validation
2. validate_workflow_connections() - Structure validation
3. validate_workflow_expressions() - Expression syntax check

#### **After Deployment:**
1. n8n_validate_workflow({id}) - Validate deployed workflow
2. n8n_list_executions() - Monitor execution status
3. n8n_update_partial_workflow() - Fix issues using diffs

### **Important Rules**

- ALWAYS validate before building
- ALWAYS validate after building
- NEVER deploy unvalidated workflows
- USE diff operations for updates (80-90% token savings)
- STATE validation results clearly
- FIX all errors before proceeding
- **AUTOMATE REPETITIVE RESEARCHHUB TASKS** - Focus on developer pain points

## 🛠️ **VERCEL FUNCTION MANAGEMENT (CRITICAL)**

### **Current Function Usage: 12/12 (PERFECTLY OPTIMIZED)**
The platform uses exactly 12 serverless functions (Vercel's free tier limit):

1. **api/health.js** - System monitoring and health checks
2. **api/auth-consolidated.js** - Complete authentication system
3. **api/research-consolidated.js** - Study management and operations
4. **api/setup.js** - System setup and configuration
5. **api/templates-consolidated.js** - Template management system
6. **api/payments-consolidated-full.js** - Payment processing
7. **api/user-profile-consolidated.js** - User profile management
8. **api/system-consolidated.js** - Core system functions
9. **api/admin-consolidated.js** - Administrative operations
10. **api/wallet.js** - Wallet functionality (matches frontend expectations)
11. **api/password.js** - Password reset and management
12. **api/applications.js** - Study applications management

### **Function Management Rules**
- **NO NEW FUNCTIONS**: Adding any new function will exceed the 12 limit
- **Consolidation Required**: New features must be added to existing functions
- **Optimization Priority**: Always choose extending existing APIs over creating new ones

### **If New Functionality Needed**
1. **First Choice**: Add to existing consolidated functions
2. **Second Choice**: Replace less critical functions
3. **Last Resort**: Upgrade to Vercel Pro plan for more functions
- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS
- **Backend**: Vercel Serverless Functions (12/12 optimally used)
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
### 🎯 Available Development Tools

**Automated Testing**: MCP Playwright for E2E testing
**Database Operations**: Supabase MCP for complex queries  
**Project Analysis**: Local vibe-coder tools in `scripts/development/`
**Documentation**: Context7 MCP for API reference

#### Quick Tool Usage
```bash
# Project analysis and improvement
node scripts/development/vibe-coder-patterns.js analyze

# Generate test data
node scripts/development/vibe-coder-testing.js data users 20

# Development workflow
npm run dev:fullstack  # Start development
npm run test:quick     # Run tests
npm run cleanup        # Organize project
```
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
- `docs/requirements/00_MASTER_INDEX.md` - Central hub with story registry and navigation
- `docs/requirements/core-platform/` - Platform foundation requirements (UE, PM, SE)
- `docs/requirements/user-stories/by-role/` - Role-based story organization
- `docs/STUDY_BLOCKS_SYSTEM.md` - Complete study blocks architecture and implementation
- `docs/TEMPLATE_SYSTEM.md` - Template management and usage system  
- `docs/STUDY_BLOCKS_IMPLEMENTATION_PROGRESS.md` - Current implementation status and roadmap
- `docs/DOCUMENTATION_INDEX.md` - Comprehensive documentation index
- `FINAL_404_ERRORS_RESOLVED_COMPLETE.md` - Latest deployment status and API fixes
- `test-complete-api-suite.html` - Comprehensive API testing suite
- `DEVELOPMENT_BEST_PRACTICES.md` - Detailed best practices guide
- `TESTING_RULES_MANDATORY.md` - Testing account rules
- `PROJECT_MEMORY_BANK.md` - Updated project history

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

### 🧪 **Testing Framework**

#### **Essential Testing Commands**
```bash
npm run test:quick       # Daily development testing
npm run test:weekly      # Comprehensive validation
npm run test:deployment  # Pre-deployment checks
npm run cleanup          # Organize project structure
```

#### **Test Accounts (MANDATORY - Use Only These)**
- **Researcher**: `abwanwr77+Researcher@gmail.com` / `Testtest123`
- **Participant**: `abwanwr77+participant@gmail.com` / `Testtest123`
- **Admin**: `abwanwr77+admin@gmail.com` / `Testtest123`

#### **Testing Rules**
1. **Use designated test accounts only** - Never create new accounts
2. **Test locally first** - Use `npm run dev:fullstack`
3. **Validate on production** - Ensure fixes work on live site
4. **Use test interfaces** - Leverage provided HTML test files

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

## 🎯 **DEVELOPMENT ENVIRONMENT STRATEGY**

### **PRODUCTION-FIRST APPROACH (UPDATED - August 15, 2025)**
Following user feedback, the development strategy has been updated to prioritize the production environment:

1. **Production Environment (PRIMARY FOCUS)**
   - **Purpose**: LIVE platform for actual users - THIS IS THE PRIORITY
   - **URL**: https://researchhub-saas.vercel.app
   - **Deployment**: Vercel (auto-deploy from main branch)
   - **Database**: Production Supabase
   - **Status**: 100% operational with all APIs working
   - **Rule**: Default testing and debugging environment

2. **Local Development Environment (SECONDARY)**
   - **Purpose**: Development ONLY when specifically requested
   - **URL**: http://localhost:5175 (frontend) + http://localhost:3003 (API)
   - **Database**: Production Supabase (shared for consistency)
   - **Command**: `npm run dev:fullstack`
   - **Usage**: Use ONLY when explicitly asked for local development

3. **Vercel Preview Environments** (Available for special cases)
   - **Purpose**: Branch-specific testing when needed
   - **Auto-created**: For each PR/branch push
   - **URL Pattern**: https://researchhub-saas-[hash]-mohmmed-alwakids-projects.vercel.app
   - **Best for**: Feature validation before production merge

### **UPDATED Workflow Rules (MANDATORY)**
- **DEFAULT TO PRODUCTION**: Always assume production site unless told "use local"
- **TEST ON PRODUCTION**: Apply fixes and test on production environment
- **NO ENVIRONMENT SWITCHING**: Don't suggest switching between environments
- **PRODUCTION FIRST**: All user reports refer to production site unless specified
- **LIVE SITE FOCUS**: Treat production as the primary platform for all operations

### **Production Deployment Rules**
- **Direct testing encouraged**: Test fixes directly on production environment
- **Immediate feedback**: Use production for real-time validation
- **Rollback capability**: Vercel provides instant rollback if issues occur
- **User experience**: Focus on actual user-facing environment

### **Branch Strategy**
- **main**: Production-ready code only
- **feature branches**: Small, focused features (merge after testing)
- **vibe-coder-implementation**: ✅ COMPLETED - Ready for merge to main
- **Next**: Create smaller, focused branches for individual features
1. **Production monitoring and optimization**: Enhance performance and user experience
2. **Advanced block features**: AI integration, conditional logic, analytics
3. **Template creation UI**: Visual template builder for researchers
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

## 🏆 Local Development Benefits
- ⚡ **Ultra-fast iteration**: No deployment cycle needed
- 🔄 **Real-time testing**: Using actual Supabase database
- 🛠️ **Complete environment**: Frontend + Backend + Database locally
- 🐛 **Easy debugging**: Console logs and immediate feedback
- 📊 **Production parity**: Same data and behavior as production

**Use `npm run dev:fullstack` for the fastest development experience!**
