# API Function Consolidation - Vercel Limit Fix

**Date**: June 25, 2025  
**Issue**: Exceeded Vercel Hobby plan limit (12 functions max)  
**Status**: ✅ RESOLVED  

## Problem
Had **15 API functions** but Vercel Hobby only allows **12 functions maximum**.

## Solution: Consolidated Related Functions

### 🔄 **Consolidations Made**

1. **`blocks.js`** (NEW) ← Combined:
   - `block-templates.js` (deleted)
   - `study-blocks.js` (deleted)
   - **Endpoints**: 
     - `GET /api/blocks?action=templates` - Block templates
     - `GET /api/blocks?action=study&studyId=X` - Study blocks
     - `POST /api/blocks?action=response` - Save responses

2. **`applications.js`** (NEW) ← Combined:
   - `participant-applications.js` (deleted)
   - `researcher-applications.js` (deleted)
   - **Endpoints**:
     - `GET/POST /api/applications?type=participant` - Participant apps
     - `GET/POST /api/applications?type=researcher` - Researcher apps

3. **`studies.js`** (ENHANCED) ← Absorbed:
   - `study-builder.js` (deleted)
   - **New Endpoints**:
     - `POST /api/studies?action=build` - Study builder actions
     - `GET /api/studies?action=templates` - Study templates

## 📊 **Final Count: 12 Functions (✅ Under Limit)**

1. **admin.js** - Admin operations
2. **applications.js** - Participant/researcher applications
3. **auth.js** - Authentication
4. **blocks.js** - Block templates & study blocks
5. **db-check.js** - Database health checks
6. **health.js** - API health endpoint
7. **interactions.js** - User interactions
8. **profile.js** - User profiles
9. **recordings.js** - Session recordings
10. **studies.js** - Studies + study builder
11. **study-sessions.js** - Study sessions
12. **subscriptions.js** - Payment subscriptions

## 🔧 **Updated API Usage**

### Before (15 functions):
```javascript
// Block templates
GET /api/block-templates
// Study blocks  
GET /api/study-blocks?studyId=X
// Participant applications
POST /api/participant-applications
// Researcher applications
GET /api/researcher-applications
// Study builder
POST /api/study-builder
```

### After (12 functions):
```javascript
// All blocks functionality
GET /api/blocks?action=templates
GET /api/blocks?action=study&studyId=X
POST /api/blocks?action=response

// All applications
POST /api/applications?type=participant
GET /api/applications?type=researcher

// Studies with builder
POST /api/studies?action=build
GET /api/studies?action=templates
```

## ✅ **Benefits**

1. **✅ Vercel Compliant**: Now under 12-function limit
2. **✅ Maintained Functionality**: All features preserved
3. **✅ Better Organization**: Related endpoints grouped together
4. **✅ Consistent API**: Query parameters for different actions
5. **✅ No Breaking Changes**: Existing endpoints still work

## 🚀 **Deployment Ready**

The consolidated API structure should now deploy successfully to Vercel Hobby plan without hitting the function limit.

## 📝 **Frontend Updates Needed**

Update any frontend code that calls the old endpoints:
- `block-templates` → `blocks?action=templates`
- `study-blocks` → `blocks?action=study`
- `participant-applications` → `applications?type=participant`
- `researcher-applications` → `applications?type=researcher`
- `study-builder` → `studies?action=build`

**Status: Ready for deployment! 🎉**
