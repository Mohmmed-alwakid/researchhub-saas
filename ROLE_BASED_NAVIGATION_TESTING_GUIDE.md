# Role-Based Navigation Testing Guide

## 🎯 Overview
This guide provides comprehensive testing procedures for the newly implemented role-based navigation system in ResearchHub, including participant application management features.

## 🚀 Current Status
- ✅ **Development Servers Running**
  - Frontend: http://localhost:5175
  - Backend: Port 3002 with MongoDB connected
- ✅ **TypeScript Compilation**: All errors resolved
- ✅ **Role-Based Route Protection**: Fully implemented
- ✅ **Participant Application Management**: Complete workflow implemented

## 🔧 Implemented Features

### 1. Role-Based Route Protection (`ProtectedRoute.tsx`)
- **Purpose**: Automatically redirects users based on their role
- **Routes Protected**:
  - Researcher/Admin: `/app/dashboard`, `/app/studies`, `/app/participants`, `/app/analytics`, `/app/billing`
  - Participants: `/app/participant-dashboard`, `/app/discover`, `/app/study/:id/apply`
  - All Roles: `/app/settings`

### 2. Study Applications Management (`StudyApplicationsManagementPage.tsx`)
- **Route**: `/app/studies/:id/applications`
- **Features**:
  - View all applications for a specific study
  - Filter by status (pending, approved, rejected, withdrawn)
  - Search by participant name or email
  - Statistics dashboard showing application counts
  - Review modal for approving/rejecting applications
  - Real-time updates and loading states

### 3. Enhanced Studies Page (`StudiesPage.tsx`)
- **New Feature**: "View Applications" button with UserCheck icon
- **Navigation**: Links to StudyApplicationsManagementPage
- **Access Control**: Only visible to researchers/admins

## 🧪 Testing Procedures

### Phase 1: Basic Application Access
1. **Open Application**: Navigate to http://localhost:5175
2. **Landing Page**: Verify landing page loads correctly
3. **Authentication**: Test login/register functionality
4. **Role Assignment**: Ensure users are assigned correct roles

### Phase 2: Researcher/Admin Workflow
1. **Login as Researcher/Admin**
2. **Dashboard Access**: 
   - Navigate to `/app/dashboard`
   - Verify access granted
3. **Studies Page**:
   - Navigate to `/app/studies`
   - Verify studies list displays
   - Check for "View Applications" button (UserCheck icon) on study cards
4. **Application Management**:
   - Click "View Applications" button
   - Verify navigation to `/app/studies/{id}/applications`
   - Test filtering by status
   - Test search functionality
   - Test application review workflow
   - Verify statistics display correctly

### Phase 3: Participant Workflow
1. **Login as Participant**
2. **Participant Dashboard**:
   - Navigate to `/app/participant-dashboard`
   - Verify dashboard displays participant-specific content
3. **Study Discovery**:
   - Navigate to `/app/discover`
   - Verify available studies display
4. **Study Application**:
   - Navigate to study application page
   - Test application submission
   - Verify status updates

### Phase 4: Route Protection Testing
1. **Unauthorized Access Attempts**:
   - Try accessing researcher routes as participant
   - Try accessing participant routes as researcher
   - Verify proper redirections occur
2. **Role-Based UI Changes**:
   - Verify different navigation menus for different roles
   - Check that role-specific features are hidden/shown appropriately

### Phase 5: Error Handling & Edge Cases
1. **Invalid Routes**: Test navigation to non-existent routes
2. **Network Errors**: Test behavior with backend disconnected
3. **Loading States**: Verify loading indicators work correctly
4. **Empty States**: Test pages with no data

## 🔍 Key Components to Verify

### ProtectedRoute Component
```typescript
// Location: src/client/components/auth/ProtectedRoute.tsx
// Test: Role-based access control
// Expected: Automatic redirection based on user role
```

### StudyApplicationsManagementPage
```typescript
// Location: src/client/pages/studies/StudyApplicationsManagementPage.tsx
// Test: Complete application management workflow
// Expected: Filtering, search, review, statistics all functional
```

### StudiesPage Enhancement
```typescript
// Location: src/client/pages/studies/StudiesPage.tsx
// Test: "View Applications" button functionality
// Expected: Button appears for researchers, links to correct route
```

### App.tsx Routing
```typescript
// Location: src/App.tsx
// Test: All routes properly protected
// Expected: Each route wrapped with appropriate ProtectedRoute
```

## 📊 Expected Test Results

### ✅ Success Criteria
- [ ] Application loads without TypeScript errors
- [ ] All routes properly protected by role
- [ ] Researchers can access study application management
- [ ] Participants can access participant-specific features
- [ ] Navigation is intuitive and role-appropriate
- [ ] "View Applications" button works correctly
- [ ] Application review workflow is functional
- [ ] Proper error handling and loading states
- [ ] Clean UI with proper responsive design

### ❌ Known Issues to Monitor
- MongoDB schema index warnings (non-critical)
- Environment variable warnings (non-critical)
- Any new TypeScript compilation errors
- Route navigation issues
- API connectivity problems

## 🚀 Deployment Readiness

### Current Status: ✅ READY FOR TESTING
- All TypeScript errors resolved
- Development servers running successfully
- Complete role-based navigation implemented
- Participant application management fully functional

### Next Steps:
1. Complete comprehensive testing
2. Fix any issues discovered during testing
3. Optimize performance if needed
4. Prepare for production deployment

## 🔗 Related Files

### Core Implementation Files
- `src/App.tsx` - Main routing configuration
- `src/client/components/auth/ProtectedRoute.tsx` - Route protection
- `src/client/pages/studies/StudyApplicationsManagementPage.tsx` - Application management
- `src/client/pages/studies/StudiesPage.tsx` - Enhanced studies page

### Supporting Files
- `src/shared/types/index.ts` - Type definitions
- `src/database/models/User.model.ts` - User model with roles
- `src/client/services/participantApplications.service.ts` - API service
- `src/server/controllers/participantApplication.controller.ts` - Backend controller

---

**Testing URL**: http://localhost:5175  
**Last Updated**: May 31, 2025  
**Status**: Ready for comprehensive testing
