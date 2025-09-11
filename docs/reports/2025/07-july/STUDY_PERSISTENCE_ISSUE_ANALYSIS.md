# 🔧 Study Persistence Issue - Root Cause & Solution

## 📊 Current Status: ISSUE IDENTIFIED AND PARTIALLY FIXED

### ✅ **Fixes Completed:**
1. **API Proxy Fix**: Fixed `/api/studies` proxy to properly call `research-consolidated.js`
2. **Enhanced JWT Parsing**: Added comprehensive JWT token parsing with multiple fallback methods
3. **Better Debug Logging**: Added detailed logging to track user ID extraction
4. **Improved User Association**: Enhanced study creation to properly associate with user ID

### ❌ **Root Cause Identified:**
**JWT Token Parsing Failure**: The Supabase client in the API is not properly validating JWT tokens, causing fallback to default "test-user" ID.

## 🔍 **Evidence:**

### **Test Results:**
- ✅ **Authentication**: Successfully obtains JWT token with user ID `4c3d798b-2975-4ec4-b9e2-c6f128b8a066`
- ✅ **Study Creation**: Studies are created successfully with all required fields
- ❌ **User Association**: Created studies use "test-user" instead of real JWT user ID
- ❌ **Study Retrieval**: Studies don't appear in user's dashboard because of wrong user association

### **API Test Commands:**
```powershell
# 1. Authentication (✅ Works)
$response = Invoke-RestMethod -Uri "http://localhost:3003/api/auth?action=login" -Method POST -ContentType "application/json" -Body (@{email="abwanwr77+Researcher@gmail.com";password="Testtest123"} | ConvertTo-Json)
$token = $response.session.access_token
$userId = $response.user.id  # Expected: 4c3d798b-2975-4ec4-b9e2-c6f128b8a066

# 2. Study Creation (⚠️ Partially Works)
$studyData = @{title="Test Study";description="Test";type="usability";status="active";target_participants=3;blocks=@()} | ConvertTo-Json
$result = Invoke-RestMethod -Uri "http://localhost:3003/api/studies?action=create-study" -Method POST -ContentType "application/json" -Headers @{Authorization="Bearer $token"} -Body $studyData
# ISSUE: $result.study.creator_id shows "test-user" instead of actual user ID

# 3. Study Retrieval (❌ Fails)
$studies = Invoke-RestMethod -Uri "http://localhost:3003/api/studies?action=get-studies" -Method GET -Headers @{Authorization="Bearer $token"}
# ISSUE: Returns empty array because studies are not associated with correct user ID
```

## 🎯 **Next Steps Required:**

### **1. Fix Supabase Client Configuration (CRITICAL)**
**File**: `api/research-consolidated.js`
**Issue**: Supabase client may not be properly configured to validate JWT tokens
**Solution**: 
- Verify `SUPABASE_URL` and `SUPABASE_ANON_KEY` environment variables
- Test direct Supabase JWT validation
- Add environment variable debugging

### **2. Implement Manual JWT Decode as Primary Method**
**Issue**: Supabase JWT validation is failing, need reliable fallback
**Solution**: Use manual JWT decode as primary method instead of fallback
```javascript
// Decode JWT manually to extract user info
const payload = JSON.parse(atob(token.split('.')[1]));
userId = payload.sub;
userRole = payload.user_metadata?.role || 'participant';
```

### **3. Add Environment Variable Debugging**
**Solution**: Add logging to verify Supabase configuration:
```javascript
console.log('Supabase URL:', process.env.SUPABASE_URL ? 'Present' : 'Missing');
console.log('Supabase Key:', process.env.SUPABASE_ANON_KEY ? 'Present' : 'Missing');
```

### **4. Test User Association After Fix**
**Verification Steps**:
1. Create study with fixed JWT parsing
2. Verify `creator_id` matches actual user ID
3. Retrieve studies and confirm study appears in list
4. Test on production environment

## 📋 **Implementation Priority:**

1. **HIGH**: Fix JWT parsing to extract real user ID (30 minutes)
2. **HIGH**: Test and verify user association works (15 minutes)  
3. **MEDIUM**: Test on production environment (15 minutes)
4. **LOW**: Add comprehensive error handling (15 minutes)

## 🎉 **Expected Outcome:**

After implementing the JWT parsing fix:
- ✅ Studies will be properly associated with authenticated users
- ✅ Created studies will appear in researcher's dashboard
- ✅ User-specific study filtering will work correctly
- ✅ Production platform will resolve the persistence issue

**Total Time Estimate**: 1-2 hours for complete resolution

---

**Current Status**: Ready to implement JWT parsing fix and complete the persistence solution.
