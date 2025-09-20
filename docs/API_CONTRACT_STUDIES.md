# API Contract Documentation

## Critical: Studies API Response Format

This document defines the **EXACT** format that the `/api/research-consolidated?action=get-studies` endpoint **MUST** return to prevent the studies page empty state bug.

### ⚠️ CRITICAL ISSUE PREVENTION

**Problem**: On September 20, 2025, we discovered that the API was returning:
```json
{
  "success": true,
  "data": [...],
  "count": 22
}
```

But the frontend expected:
```json
{
  "success": true,
  "studies": [...],
  "pagination": {...}
}
```

**Result**: This mismatch caused the studies page to show "Welcome to Research Hub You haven't created any studies yet" even though there were 22 studies in the database.

### ✅ CORRECT FORMAT (MANDATORY)

The `get-studies` endpoint **MUST** return this exact format:

```typescript
{
  success: true,
  studies: StudyObject[],
  pagination: {
    currentPage: number,
    totalPages: number,
    totalStudies: number,
    hasNext: boolean,
    hasPrev: boolean
  }
}
```

### ❌ INCORRECT FORMATS (WILL CAUSE BUGS)

**Never use these formats:**

```typescript
// ❌ Legacy format (causes empty state bug)
{
  success: true,
  data: StudyObject[],
  count: number
}

// ❌ Missing pagination
{
  success: true,
  studies: StudyObject[]
}

// ❌ Wrong field names
{
  success: true,
  results: StudyObject[],
  meta: {...}
}
```

### 🛡️ PREVENTION MEASURES IMPLEMENTED

1. **Backend Validation**: `validateStudiesResponse()` function in `api/research-consolidated.js`
2. **Frontend Validation**: `validateStudiesResponse()` function in `src/client/types/api-contracts.ts`
3. **TypeScript Interfaces**: Strict type definitions in `api-contracts.ts`
4. **Service Layer Validation**: Enhanced `studies.service.ts` with response validation
5. **Contract Tests**: Automated tests in `testing/api-contract-tests.ts`
6. **Documentation**: This file with clear examples and warnings

### 🧪 Testing the API Contract

To test if the API is returning the correct format:

```javascript
// In browser console
await window.testStudiesAPIContract()
```

Or manually:
```bash
# Replace TOKEN with actual auth token
curl -H "Authorization: Bearer TOKEN" \
     "https://researchhub-saas.vercel.app/api/research-consolidated?action=get-studies"
```

### 🚨 DEPLOYMENT CHECKLIST

Before deploying changes to the studies API:

- [ ] ✅ Response includes `studies` array (not `data`)
- [ ] ✅ Response includes `pagination` object (not `count`)
- [ ] ✅ Pagination has all required fields: `currentPage`, `totalPages`, `totalStudies`, `hasNext`, `hasPrev`
- [ ] ✅ Backend validation passes: `validateStudiesResponse(response)` returns true
- [ ] ✅ Frontend validation passes: No console errors about invalid format
- [ ] ✅ Contract tests pass: `testStudiesAPIContract()` returns success
- [ ] ✅ Studies page displays studies correctly (not empty state)
- [ ] ✅ Dashboard shows correct study count

### 🔧 Code Locations

**Backend Response Format**:
- File: `api/research-consolidated.js`
- Function: `getStudies()`
- Line: ~290-320

**Frontend Type Definitions**:
- File: `src/client/types/api-contracts.ts`
- Interface: `StudiesResponse`

**Frontend Service**:
- File: `src/client/services/studies.service.ts`
- Function: `getStudies()`

**Contract Tests**:
- File: `testing/api-contract-tests.ts`
- Function: `testStudiesAPIContract()`

### 📞 Emergency Response

If the studies page shows empty state again:

1. **Check API Response Format**:
   ```javascript
   fetch('/api/research-consolidated?action=get-studies', {
     headers: { 'Authorization': 'Bearer YOUR_TOKEN' }
   }).then(r => r.json()).then(console.log)
   ```

2. **Run Contract Test**:
   ```javascript
   await window.testStudiesAPIContract()
   ```

3. **Check Console Errors**: Look for validation error messages

4. **Fix Response Format**: Ensure API returns `{studies: [...], pagination: {...}}`

5. **Force Deployment**: Add comment to trigger Vercel redeploy if needed

---

**Last Updated**: September 20, 2025  
**Issue Resolved**: ✅ Complete  
**Prevention Status**: ✅ Multiple safeguards implemented