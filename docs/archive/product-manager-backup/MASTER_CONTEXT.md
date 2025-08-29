# 🧠 MASTER CONTEXT - AI KNOWLEDGE BASE

**Date Created**: June 29, 2025  
**Purpose**: Complete project context for consistent AI responses  
**Status**: 🟢 Primary source of truth for all AI interactions

---

## 🎯 PROJECT OVERVIEW

### What is ResearchHub?
**ResearchHub** is a **SaaS platform for user testing research** that allows researchers to create, manage, and analyze user experience studies. Think Maze.co meets UserTesting.com with modern UX and powerful analytics.

### Target Users
- **Researchers**: UX designers, product managers, user researchers
- **Participants**: End users who complete studies and provide feedback
- **Admins**: Platform administrators managing the system

### Core Value Proposition
1. **Easy Study Creation**: Professional study builder with 13 block types
2. **Template Library**: Pre-built study templates for common research scenarios
3. **Real-time Collaboration**: Team collaboration on study design
4. **Rich Analytics**: Detailed insights from participant responses
5. **Professional UX**: Enterprise-grade user experience

---

## 🏗️ TECHNICAL ARCHITECTURE

### Tech Stack
- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS
- **Backend**: Vercel Serverless Functions (Express.js style)
- **Database**: Supabase (PostgreSQL with real-time capabilities)
- **Authentication**: Supabase Auth (JWT tokens + refresh tokens)
- **State Management**: Zustand + React Query
- **Deployment**: Vercel with GitHub auto-deploy

### Development Environment
- **Local Development**: `npm run dev:fullstack` (PREFERRED)
  - Frontend: http://localhost:5175
  - Backend: http://localhost:3003
  - Database: Real Supabase connection
- **Build Status**: ✅ 0 TypeScript errors

### Database Schema (Key Tables)
- `users` - User accounts with role-based access
- `studies` - Study definitions and metadata
- `study_blocks` - Individual study components
- `templates` - Pre-built study templates
- `study_sessions` - Participant sessions
- `collaborations` - Team collaboration data

---

## 🎨 CORE FEATURES (CURRENT STATUS)

### ✅ FULLY IMPLEMENTED
1. **Authentication System**
   - JWT-based auth with role management
   - Researcher/Participant/Admin roles
   - Session management and refresh tokens

2. **Study Builder System**
   - Professional 6-step wizard
   - 13 block types with custom editing interfaces
   - Drag & drop block reordering
   - Template integration

3. **Study Blocks (13 Types)**
   - Welcome Screen, Open Question, Opinion Scale
   - Simple Input, Multiple Choice, Context Screen
   - Yes/No, 5-Second Test, Card Sort
   - Tree Test, Thank You, Image Upload, File Upload

4. **Template System**
   - Enhanced template preview
   - Block breakdown and usage stats
   - Seamless integration with Study Builder

5. **Interactive Study Preview**
   - Researchers can experience participant view
   - Full preview before publishing

6. **Collaboration Features**
   - Real-time team collaboration
   - Comments and approval workflows
   - WebSocket server ready

### 🚧 PARTIALLY IMPLEMENTED
1. **Block Session Rendering** - Participant experience needs completion
2. **Payment Integration** - Stripe planned but not implemented
3. **Advanced Analytics** - Basic framework exists
4. **AI Features** - Framework ready, implementation pending

### ❌ NOT IMPLEMENTED
1. **Template Creation UI** - Visual template builder
2. **Template Marketplace** - Community sharing
3. **Screen Recording** - Video capture integration
4. **Advanced Block Features** - Conditional logic, AI integration

---

## 🎭 USER PERSONAS & USE CASES

### Primary Persona: Sarah - UX Researcher
- **Goal**: Create user testing studies to validate design decisions
- **Pain Points**: Complex tools, slow setup, limited collaboration
- **How ResearchHub Helps**: Fast study creation, professional templates, team collaboration

### Key Use Cases
1. **Unmoderated User Testing**: Create studies with multiple blocks, collect responses
2. **First Impression Testing**: 5-second tests for design validation
3. **Information Architecture**: Card sorting and tree testing
4. **Interview Scheduling**: Moderated interview coordination
5. **Template Reuse**: Save and share study templates across teams

---

## 🎯 BUSINESS MODEL

### Target Market
- **Primary**: Mid-market UX teams (5-50 researchers)
- **Secondary**: Enterprise research teams (50+ researchers)
- **Growth**: Individual researchers and consultants

### Revenue Strategy
- **Freemium Model**: Limited studies for free users
- **Pro Plans**: Unlimited studies, advanced features
- **Enterprise**: Custom solutions, white-label options

### Competitive Positioning
- **vs Maze.co**: Better collaboration, more block types
- **vs UserTesting.com**: More affordable, easier setup
- **vs Optimal Workshop**: Modern UX, integrated workflow

---

## 🛡️ DEVELOPMENT RULES & CONVENTIONS

### Code Quality Standards
- **TypeScript**: 100% type coverage, 0 compilation errors
- **Testing**: Local testing first with provided test accounts
- **Architecture**: Prefer extending existing code over creating new
- **Documentation**: Update all relevant docs with changes

### Test Accounts (MANDATORY - Use Only These)
```
Participant: abwanwr77+participant@gmail.com (Testtest123)
Researcher:  abwanwr77+Researcher@gmail.com (Testtest123)
Admin:       abwanwr77+admin@gmail.com (Testtest123)
```

### Development Workflow
1. **Requirements Phase**: Document requirements before coding
2. **Analysis Phase**: Understand existing code and patterns
3. **Implementation Phase**: Build following approved plan
4. **Testing Phase**: Verify functionality and no regressions

### Anti-Patterns (NEVER DO)
- Create new systems when existing can be enhanced
- Start coding without detailed requirements
- Replace working code instead of extending it
- Break existing functionality

---

## 📊 CURRENT SPRINT PRIORITIES

### Phase 1: Participant Experience (Active)
**Goal**: Complete the core user journey
- Block session rendering for all 13 block types
- Study execution engine
- Response data collection and validation

### Key Success Metrics
- Participant can complete full study end-to-end
- All responses properly saved to database
- Researcher can view participant responses

---

## 🎯 WHY WE MAKE DECISIONS

### Core Principles
1. **User-Centric**: Every feature must solve a real user problem
2. **Enterprise-Ready**: Professional UX and reliability from day one
3. **Collaboration-First**: Teams work together, not in silos
4. **Data-Driven**: Rich analytics inform product decisions
5. **Modern Standards**: Latest tech, best practices, accessibility

### Decision Framework
- **Impact**: How many users benefit?
- **Effort**: Development time and complexity
- **Strategic**: Alignment with long-term vision
- **Technical**: Maintainability and scalability

---

## 🔍 CONTEXT FOR AI RESPONSES

### When I Ask for Features
- Check existing implementation first
- Understand the target user and use case
- Consider business model implications
- Follow established patterns and conventions
- Ensure backward compatibility

### When I Report Bugs
- Analyze root cause systematically
- Check for related issues
- Test fix thoroughly in local environment
- Update relevant documentation

### When I Request Improvements
- Understand current pain points
- Research best practices and competitors
- Design solutions that scale
- Consider user experience impact

---

**This document is the single source of truth for all AI interactions. Refer to this before making any product or technical decisions.**
