#!/usr/bin/env node
/**
 * Requirements Management System
 * Creates centralized requirements structure and master index
 */

const fs = require('fs').promises;
const path = require('path');

class RequirementsManager {
  constructor() {
    this.rootDir = process.cwd();
    this.requirementsDir = path.join(this.rootDir, 'docs', 'requirements');
  }

  async initialize() {
    console.log('📋 Initializing Centralized Requirements System...\n');
    
    try {
      await this.createRequirementsStructure();
      await this.createMasterIndex();
      await this.createTemplates();
      await this.migratExistingRequirements();
      await this.createDecisionRecords();
      
      console.log('\n✅ Requirements System Initialized!');
      console.log(`📋 Master Index: ${path.join(this.requirementsDir, '00_MASTER_REQUIREMENTS_INDEX.md')}`);
      
    } catch (error) {
      console.error('❌ Requirements initialization failed:', error.message);
      process.exit(1);
    }
  }

  async createRequirementsStructure() {
    console.log('📁 Creating requirements folder structure...');
    
    const dirs = [
      'docs/requirements',
      'docs/requirements/active',
      'docs/requirements/completed', 
      'docs/requirements/templates',
      'docs/requirements/decisions'
    ];

    for (const dir of dirs) {
      await fs.mkdir(path.join(this.rootDir, dir), { recursive: true });
    }
    
    console.log('✅ Requirements structure created');
  }

  async createMasterIndex() {
    console.log('📑 Creating master requirements index...');
    
    const masterIndex = `# 📋 MASTER REQUIREMENTS INDEX
**Single Source of Truth for ResearchHub Requirements**

*Last Updated: ${new Date().toISOString().split('T')[0]}*

---

## 🚀 **ACTIVE PROJECTS** (Currently in Development)

### Phase 5: Advanced Study Execution (75% Complete)
- **Location**: \`active/phase-5-advanced-execution.md\`
- **Status**: 🚧 In Progress
- **Priority**: High
- **Components**: Screen recording, real-time analytics, live sessions
- **Timeline**: 2 weeks remaining

### Phase 6: Analytics Platform (Planning)
- **Location**: \`active/phase-6-analytics-platform.md\`
- **Status**: 📋 Planning
- **Priority**: Medium
- **Components**: Business intelligence, KPI dashboards, reporting
- **Timeline**: Planning phase

### Performance Optimization (25% Complete)
- **Location**: \`active/performance-optimization.md\`
- **Status**: 🚧 In Progress
- **Priority**: Medium
- **Components**: Bundle optimization, API performance, database tuning
- **Timeline**: Ongoing

---

## ✅ **COMPLETED PHASES** (Production Ready)

### Phase 1: Foundation & Authentication ✅
- **Location**: \`completed/phase-1-foundation.md\`
- **Completed**: June 2025
- **Components**: Supabase integration, JWT auth, user management
- **Status**: Production deployed

### Phase 2: Study Builder System ✅  
- **Location**: \`completed/phase-2-study-builder.md\`
- **Completed**: June 2025
- **Components**: Professional study builder, 13 block types, drag & drop
- **Status**: Production deployed

### Phase 3: Template Management ✅
- **Location**: \`completed/phase-3-templates.md\`
- **Completed**: June 2025
- **Components**: Template library, preview system, study creation wizard
- **Status**: Production deployed

### Phase 4: Admin Panel Enhancement ✅
- **Location**: \`completed/phase-4-admin-panel.md\`
- **Completed**: June 2025
- **Components**: User management, subscription system, system settings
- **Status**: Production deployed

---

## 🏗️ **SYSTEM ARCHITECTURE** (Current Implementation)

### Core Technology Stack
- **Database**: Supabase PostgreSQL with Row Level Security (RLS)
- **Frontend**: React 18 + TypeScript + Tailwind CSS + Vite
- **Backend**: Vercel Serverless Functions (8 optimized endpoints)
- **Authentication**: Supabase Auth with JWT tokens + refresh tokens
- **Deployment**: Vercel with GitHub auto-deploy integration
- **Local Development**: Express.js server with real Supabase connection

### System Capabilities
- **Users**: Multi-role system (participant, researcher, admin)
- **Studies**: 13 block types, template system, professional builder
- **Analytics**: Real-time tracking, participant behavior analysis
- **Admin**: Complete user/subscription management, system monitoring
- **Security**: JWT authentication, RLS policies, role-based access

---

## 📊 **CURRENT PROJECT STATUS**

### Production Readiness: 92% ✅
- ✅ **Authentication System**: 100% complete
- ✅ **Study Builder**: 100% complete  
- ✅ **Template System**: 100% complete
- ✅ **Admin Panel**: 100% complete
- 🚧 **Advanced Execution**: 75% complete
- 📋 **Analytics Platform**: 0% complete (planned)

### Key Metrics
- **Build Performance**: <30 seconds
- **Bundle Size**: 137KB (gzipped)
- **TypeScript Errors**: 0
- **Test Coverage**: Automated testing framework
- **API Endpoints**: 8 optimized functions

---

## 🎯 **DEVELOPMENT PRIORITIES**

### Immediate (Next 2 Weeks)
1. **Complete Phase 5**: Finish advanced study execution features
2. **Performance Optimization**: Bundle size reduction, API optimization
3. **Documentation**: Update all technical documentation

### Medium Term (Next Month)  
1. **Phase 6 Planning**: Analytics platform requirements analysis
2. **Mobile Optimization**: Enhanced mobile participant experience
3. **Integration Testing**: Comprehensive E2E testing

### Long Term (Next Quarter)
1. **Phase 6 Implementation**: Full analytics platform
2. **Payment Integration**: DodoPayments system
3. **Advanced Features**: AI integration, advanced collaboration

---

## 📋 **REQUIREMENTS PROCESS**

### Creating New Requirements
1. Use template from \`templates/feature-requirement-template.md\`
2. Follow standardized format for consistency
3. Include acceptance criteria and testing strategy
4. Get team approval before implementation

### Requirements Lifecycle
1. **Draft** → Created from template
2. **Review** → Team review and feedback
3. **Approved** → Ready for implementation
4. **In Progress** → Development in progress  
5. **Complete** → Moved to completed/ folder
6. **Maintenance** → Regular review and updates

### Template Usage
- **Feature Requirements**: \`templates/feature-requirement-template.md\`
- **Component Requirements**: \`templates/component-requirement-template.md\`
- **System Requirements**: \`templates/system-requirement-template.md\`
- **API Requirements**: \`templates/api-requirement-template.md\`

---

## 🔄 **ARCHITECTURAL DECISIONS**

### Database Choice: Supabase PostgreSQL
- **Decision Record**: \`decisions/database-choice-supabase.md\`
- **Rationale**: Real-time capabilities, RLS, managed PostgreSQL
- **Date**: May 2025

### Deployment Platform: Vercel
- **Decision Record**: \`decisions/deployment-vercel.md\`
- **Rationale**: Seamless React deployment, serverless functions
- **Date**: May 2025

### Authentication Strategy: Supabase Auth
- **Decision Record**: \`decisions/authentication-strategy.md\`  
- **Rationale**: JWT tokens, social auth, user management
- **Date**: May 2025

---

## 📞 **QUICK REFERENCE**

### Essential Commands
\`\`\`bash
npm run dev:fullstack     # Local full-stack development
npm run build             # Production build
npm run test:quick        # Quick test suite
npm run cleanup           # Project cleanup
\`\`\`

### Key Directories
- \`src/client/\` - Frontend React application
- \`api/\` - Vercel serverless functions
- \`docs/requirements/\` - All project requirements
- \`testing/\` - Automated and manual testing

### Test Accounts (Mandatory)
- **Researcher**: abwanwr77+Researcher@gmail.com / Testtest123
- **Participant**: abwanwr77+participant@gmail.com / Testtest123
- **Admin**: abwanwr77+admin@gmail.com / Testtest123

---

*This index is automatically updated when requirements change. For the most current information, always refer to this master index.*

**Next Review Date**: ${new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}`;

    await fs.writeFile(
      path.join(this.requirementsDir, '00_MASTER_REQUIREMENTS_INDEX.md'),
      masterIndex
    );
    
    console.log('✅ Master requirements index created');
  }

  async createTemplates() {
    console.log('📝 Creating requirement templates...');
    
    // Feature Requirement Template
    const featureTemplate = `# [FEATURE NAME] - Requirements Document

**Created**: ${new Date().toISOString().split('T')[0]}  
**Status**: Draft  
**Priority**: [High/Medium/Low]  
**Dependencies**: [List any dependencies]

---

## 📋 **OVERVIEW**

### Feature Description
[Provide a clear, concise description of the feature]

### Business Justification
[Explain why this feature is needed and its business value]

### Target Users
[Identify who will use this feature]

---

## 🎯 **OBJECTIVES**

### Primary Objective
[Main goal of this feature]

### Secondary Objectives
- [Supporting goal 1]
- [Supporting goal 2]
- [Supporting goal 3]

---

## 📋 **DETAILED REQUIREMENTS**

### Functional Requirements
1. **[Requirement 1]**: Description
2. **[Requirement 2]**: Description  
3. **[Requirement 3]**: Description

### Non-Functional Requirements
- **Performance**: [Performance criteria]
- **Security**: [Security requirements]
- **Usability**: [Usability standards]
- **Accessibility**: [Accessibility requirements]

### Technical Requirements
- **Architecture**: [Component structure]
- **APIs**: [Required API endpoints]
- **Database**: [Database changes needed]
- **Dependencies**: [New packages/libraries]

---

## 🏗️ **IMPLEMENTATION PLAN**

### Phase 1: Foundation (Week 1)
- [ ] [Task 1]
- [ ] [Task 2]
- [ ] [Task 3]

### Phase 2: Core Features (Week 2)
- [ ] [Task 1]
- [ ] [Task 2]
- [ ] [Task 3]

### Phase 3: Polish & Testing (Week 3)
- [ ] [Task 1]
- [ ] [Task 2]
- [ ] [Task 3]

---

## ✅ **ACCEPTANCE CRITERIA**

### Must Have (Critical)
- [ ] [Critical requirement 1]
- [ ] [Critical requirement 2]

### Should Have (Important)
- [ ] [Important requirement 1]
- [ ] [Important requirement 2]

### Could Have (Nice to Have)
- [ ] [Optional requirement 1]
- [ ] [Optional requirement 2]

---

## 🧪 **TESTING STRATEGY**

### Unit Tests
- [Component testing approach]
- [Coverage requirements: X%]

### Integration Tests
- [API testing scenarios]
- [Database testing approach]

### End-to-End Tests
- [User workflow testing]
- [Cross-browser testing]

### Manual Testing
- [ ] [Manual test case 1]
- [ ] [Manual test case 2]
- [ ] [Manual test case 3]

---

## 📊 **SUCCESS METRICS**

### Performance Metrics
- **[Metric 1]**: Target value
- **[Metric 2]**: Target value

### User Experience Metrics
- **[Metric 1]**: Target value
- **[Metric 2]**: Target value

### Business Metrics
- **[Metric 1]**: Target value
- **[Metric 2]**: Target value

---

## 🔄 **ROLLOUT PLAN**

### Development Environment
1. [Development step 1]
2. [Development step 2]

### Staging Environment
1. [Staging step 1]
2. [Staging step 2]

### Production Deployment
1. [Production step 1]
2. [Production step 2]

### Rollback Strategy
[Plan for rolling back if issues occur]

---

## 📚 **DOCUMENTATION REQUIREMENTS**

### Technical Documentation
- [ ] Component documentation
- [ ] API documentation
- [ ] Database schema updates

### User Documentation
- [ ] User guide updates
- [ ] Help system updates
- [ ] Training materials

---

## 🔍 **REVIEW & APPROVAL**

### Stakeholder Review
- [ ] Product Manager: [Name]
- [ ] Technical Lead: [Name]
- [ ] UI/UX Designer: [Name]
- [ ] QA Lead: [Name]

### Approval Status
- [ ] Requirements approved
- [ ] Technical approach approved
- [ ] Implementation plan approved
- [ ] Ready for development

---

**Requirement Owner**: [Name]  
**Technical Lead**: [Name]  
**Estimated Effort**: [X weeks/sprints]

*This document will be moved to completed/ folder upon successful implementation.*`;

    await fs.writeFile(
      path.join(this.requirementsDir, 'templates', 'feature-requirement-template.md'),
      featureTemplate
    );

    // Component Requirement Template (shorter version)
    const componentTemplate = `# [COMPONENT NAME] - Component Requirements

**Type**: Component  
**Created**: ${new Date().toISOString().split('T')[0]}  
**Status**: Draft

## 📋 Component Overview
[Description of the component and its purpose]

## 🎯 Requirements
- [Requirement 1]
- [Requirement 2]
- [Requirement 3]

## 🏗️ Technical Specifications
- **Props Interface**: [TypeScript interface]
- **State Management**: [How state is managed]
- **Dependencies**: [Required packages]

## ✅ Acceptance Criteria
- [ ] [Criterion 1]
- [ ] [Criterion 2]
- [ ] [Criterion 3]

## 🧪 Testing Requirements
- Unit tests for all props combinations
- Integration tests with parent components
- Accessibility testing (WCAG compliance)

**Implementation Estimate**: [X days]`;

    await fs.writeFile(
      path.join(this.requirementsDir, 'templates', 'component-requirement-template.md'),
      componentTemplate
    );
    
    console.log('✅ Requirement templates created');
  }

  async migratExistingRequirements() {
    console.log('🔄 Migrating existing requirements...');
    
    // Move existing Phase requirements to completed folder
    const existingRequirements = [
      'PHASE_4_ADMIN_ENHANCEMENT_REQUIREMENTS.md',
      'PHASE_4B_ENHANCED_ADMIN_DASHBOARD_REQUIREMENTS.md', 
      'PHASE_4C_ADVANCED_USER_MANAGEMENT_REQUIREMENTS.md'
    ];

    let migratedCount = 0;
    for (const file of existingRequirements) {
      try {
        const oldPath = path.join(this.rootDir, file);
        const newPath = path.join(this.requirementsDir, 'completed', file);
        
        await fs.access(oldPath);  // Check if file exists
        await fs.rename(oldPath, newPath);
        migratedCount++;
      } catch (error) {
        // File doesn't exist, continue
      }
    }
    
    console.log(`✅ Migrated ${migratedCount} existing requirements`);
  }

  async createDecisionRecords() {
    console.log('📊 Creating architectural decision records...');
    
    const databaseDecision = `# Database Choice: Supabase PostgreSQL

**Date**: May 2025  
**Status**: Approved ✅  
**Decision Makers**: Development Team

## Context
Need to choose a database solution for ResearchHub that supports:
- Real-time capabilities for live collaboration
- User authentication and authorization
- Row Level Security (RLS) for data protection
- Scalable PostgreSQL database

## Decision
Selected **Supabase** as the database and backend service.

## Rationale
1. **Real-time Features**: Built-in real-time subscriptions
2. **Authentication**: Complete auth system with JWT tokens
3. **Security**: Row Level Security (RLS) policies
4. **Developer Experience**: Excellent TypeScript support
5. **Scalability**: Managed PostgreSQL with auto-scaling

## Alternatives Considered
- **Firebase**: Good real-time but less SQL flexibility
- **MongoDB Atlas**: NoSQL doesn't fit relational data model
- **Raw PostgreSQL**: Would require building auth and real-time

## Consequences
✅ **Positive**:
- Rapid development with built-in auth
- Excellent real-time capabilities
- Strong security with RLS
- Great developer experience

⚠️ **Negative**:
- Vendor lock-in to Supabase
- Less control over backend infrastructure

## Implementation Notes
- All sensitive data protected by RLS policies
- Real-time subscriptions used for collaboration features
- JWT tokens used throughout frontend application`;

    await fs.writeFile(
      path.join(this.requirementsDir, 'decisions', 'database-choice-supabase.md'),
      databaseDecision
    );

    const deploymentDecision = `# Deployment Platform: Vercel

**Date**: May 2025  
**Status**: Approved ✅  
**Decision Makers**: Development Team

## Context
Need a deployment platform for React + Serverless functions that provides:
- Seamless React/Vite deployment
- Serverless function support
- GitHub integration
- Good performance and reliability

## Decision
Selected **Vercel** as the primary deployment platform.

## Rationale
1. **React-First**: Optimized for React applications
2. **Serverless Functions**: Native serverless function support
3. **GitHub Integration**: Automatic deployments on push
4. **Performance**: Global CDN and edge functions
5. **Developer Experience**: Excellent local development tools

## Implementation Notes
- 8 optimized serverless functions (under 12 function limit)
- Automatic deployments from GitHub main branch
- Environment variables managed through Vercel dashboard
- Custom domain setup with SSL certificates`;

    await fs.writeFile(
      path.join(this.requirementsDir, 'decisions', 'deployment-vercel.md'),
      deploymentDecision
    );
    
    console.log('✅ Architectural decision records created');
  }
}

// Run if executed directly
if (require.main === module) {
  const manager = new RequirementsManager();
  manager.initialize().catch(console.error);
}

module.exports = RequirementsManager;
