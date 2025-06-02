# ResearchHub Component Structure Guide

**Last Updated**: June 1, 2025  
**Purpose**: Prevent component duplication and maintain consistent architecture

## 🎯 Purpose of This Document

This guide was created after consolidating duplicate pages that were causing maintenance overhead and developer confusion. It establishes clear guidelines for component architecture and prevents future duplication.

## 📋 Consolidation Summary (June 1, 2025)

### Pages Successfully Consolidated

1. **Landing Pages**
   - ❌ Removed: `LandingPage.tsx` (basic version)
   - ✅ Kept: `EnhancedLandingPage.tsx` → Renamed to `LandingPage.tsx`
   - **Reason**: Enhanced version has modern gradients, animations, better visual hierarchy

2. **Login Pages**
   - ❌ Removed: `LoginPage.tsx` (basic version)
   - ✅ Kept: `EnhancedLoginPage.tsx` → Renamed to `LoginPage.tsx`
   - **Reason**: Enhanced version has 2FA support, better animations, modern design
   - **Fix Applied**: Updated navigation from `/app/dashboard` to `/app` for proper role-based routing

3. **Study Builder Pages**
   - ❌ Removed: `StudyBuilderPage.tsx` (basic version)
   - ✅ Kept: `EnhancedStudyBuilderPage.tsx` → Renamed to `StudyBuilderPage.tsx`
   - **Reason**: Enhanced version has drag-drop interface, better UX, more recording options

### Routing Updates

- **Before**: Multiple routes (`/login`, `/enhanced-login`, `/studies/new`, `/studies/new/basic`)
- **After**: Single routes (`/login`, `/studies/new`) using the best version of each component
- **App.tsx**: Updated imports and removed duplicate route definitions

## 🏗️ Component Architecture Guidelines

### 1. Single Source of Truth Principle
- **Rule**: Each functional area should have exactly ONE primary component
- **Example**: One login page, one study builder, one landing page
- **Violation**: Creating `ComponentName.tsx` and `EnhancedComponentName.tsx`

### 2. Component Naming Convention
```
✅ Good:
- LoginPage.tsx
- StudyBuilderPage.tsx
- DashboardPage.tsx

❌ Bad:
- LoginPage.tsx + EnhancedLoginPage.tsx
- BasicStudyBuilder.tsx + AdvancedStudyBuilder.tsx
- LandingPageV1.tsx + LandingPageV2.tsx
```

### 3. Feature Evolution Pattern
When improving an existing component:

```typescript
// Option 1: In-place improvement (Preferred)
// Modify the existing component directly
// File: LoginPage.tsx

// Option 2: Feature flags (For major changes)
// Add feature toggles within the same component
const LoginPage = () => {
  const { enableNewUI } = useFeatureFlags();
  
  return enableNewUI ? <NewLoginUI /> : <LegacyLoginUI />;
};

// Option 3: Temporary parallel development (Last resort)
// If you must create a parallel component:
// 1. Use clear naming: LoginPage.tsx + LoginPageRedesign.tsx
// 2. Set a merge deadline (max 2 weeks)
// 3. Document the plan in this file
// 4. Remove the old version immediately after merge
```

## 📁 File Organization Standards

### Page Structure
```
src/client/pages/
├── auth/
│   ├── LoginPage.tsx           ✅ Primary login (formerly Enhanced)
│   ├── RegisterPage.tsx        ✅ Single version
│   └── ForgotPasswordPage.tsx  ✅ Single version
├── studies/
│   ├── StudyBuilderPage.tsx    ✅ Primary builder (formerly Enhanced)
│   ├── StudiesPage.tsx         ✅ Single version
│   └── StudyDiscoveryPage.tsx  ✅ Single version
├── dashboard/
│   └── DashboardPage.tsx       ✅ Single version
└── LandingPage.tsx             ✅ Primary landing (formerly Enhanced)
```

### Component Reuse Strategy
```
src/client/components/
├── common/           # Shared UI components
├── auth/            # Authentication-specific components
├── dashboard/       # Dashboard-specific components
└── studies/         # Study-specific components
```

## 🔄 Authentication Flow (Fixed)

### Login Navigation Pattern
```typescript
// ✅ Correct: Let RoleBasedRedirect handle routing
const handleLogin = async () => {
  // ... authentication logic
  navigate('/app'); // RoleBasedRedirect will route based on user role
};

// ❌ Incorrect: Direct dashboard navigation
const handleLogin = async () => {
  // ... authentication logic
  navigate('/app/dashboard'); // Bypasses role-based routing
};
```

### Role-Based Routing Logic
```typescript
// In RoleBasedRedirect component:
switch (user.role) {
  case 'participant':
    navigate('/app/participant-dashboard');
    break;
  case 'researcher':
  case 'admin':
  case 'super_admin':
  default:
    navigate('/app/dashboard');
    break;
}
```

## ⚠️ Prevention Guidelines

### Before Creating a New Page Component
1. **Check if similar component exists**: Search codebase for similar functionality
2. **Consider extension**: Can existing component be enhanced instead?
3. **Review this guide**: Ensure you're following established patterns
4. **Document your decision**: If creating new component, document why in this file

### Code Review Checklist
- [ ] No duplicate page components created
- [ ] Routing uses single primary version of each page
- [ ] Authentication flow uses `/app` navigation pattern
- [ ] New components follow naming conventions
- [ ] Documentation updated if architecture changes

## 📊 Component Inventory (Current)

### Page Components Status
| Component | Status | Location | Notes |
|-----------|--------|----------|-------|
| LandingPage | ✅ Consolidated | `/pages/LandingPage.tsx` | Formerly Enhanced version |
| LoginPage | ✅ Consolidated | `/pages/auth/LoginPage.tsx` | Formerly Enhanced version |
| StudyBuilderPage | ✅ Consolidated | `/pages/studies/StudyBuilderPage.tsx` | Formerly Enhanced version |
| RegisterPage | ✅ Single version | `/pages/auth/RegisterPage.tsx` | No duplicates |
| DashboardPage | ✅ Single version | `/pages/dashboard/DashboardPage.tsx` | No duplicates |
| StudiesPage | ✅ Single version | `/pages/studies/StudiesPage.tsx` | No duplicates |

### Shared Components
| Component | Status | Location | Notes |
|-----------|--------|----------|-------|
| AuthGuard | ✅ Single version | `/components/auth/AuthGuard.tsx` | Route protection |
| ProtectedRoute | ✅ Single version | `/components/auth/ProtectedRoute.tsx` | Role-based access |
| RoleBasedRedirect | ✅ Single version | `App.tsx` (inline) | Handles user routing |

## 🚀 Future Development Guidelines

### When to Create Multiple Versions
1. **A/B Testing**: Temporary parallel versions for user testing
2. **Major Redesigns**: Short-term parallel development (max 2 weeks)
3. **Role-Specific UIs**: Different components for different user roles

### Naming Convention for Temporary Duplicates
```
ComponentName.tsx           # Current production version
ComponentNameRedesign.tsx   # New version under development
ComponentNameExperiment.tsx # A/B testing version
```

### Mandatory Documentation for Duplicates
When creating temporary duplicates, add entry here:
```markdown
### Temporary Duplicate: [Component Name]
- **Created**: [Date]
- **Purpose**: [Reason for duplicate]
- **Merge Deadline**: [Date - max 2 weeks]
- **Owner**: [Developer responsible]
- **Tracking**: [Issue/ticket number]
```

## 📞 Support

If you need to create a duplicate component and are unsure about the approach:
1. Review this guide thoroughly
2. Check with team lead or senior developer
3. Document your decision in this file
4. Set clear merge timeline

---

**Remember**: This guide exists because duplicate components caused confusion and maintenance overhead. When in doubt, extend existing components rather than creating new ones.
