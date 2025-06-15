# 🚂 Railway API Token Troubleshooting

**Date**: June 15, 2025  
**Token Provided**: `a35c96ba-9cc1-43de-802c-ff5e7ab53890`  
**Status**: ❌ Not connecting to Railway API

## 🔄 **MCP Testing Results**

**Token Tested**: `a35c96ba-9cc1-43de-802c-ff5e7ab53890`  
**Result**: ❌ `Failed to connect to Railway API: Invalid API token`  
**Error**: Railway MCP authentication failed

### **Possible Issues:**
1. **Token Format**: Railway tokens may need different format/prefix
2. **Permissions**: Token might not have required scopes
3. **Expiration**: Token could be expired or inactive
4. **API Changes**: Railway API authentication might have changed

## 🔍 **Token Verification Steps**

### **Check Token Validity**
1. **Go to**: https://railway.app/account/tokens
2. **Verify the token exists and is active**
3. **Check token permissions** (should have project access)
4. **Copy token again** (ensure no extra spaces/characters)

### **Alternative: Test Token Manually**
```bash
# Test the token with curl (if available)
curl -H "Authorization: Bearer a35c96ba-9cc1-43de-802c-ff5e7ab53890" https://backboard.railway.app/graphql
```

## 🎯 **IMMEDIATE SOLUTION: Manual Fix**

Since we already know the issue, let's fix it manually:

### **Your MongoDB Service**: `researchhub-mongodb` ✅ (CONFIRMED ACTIVE)
### **Problem**: Your API's `MONGODB_URI` environment variable

## 🔧 **MANUAL FIX PROCESS**

### **Step 1: Railway Dashboard Access**
1. Go to https://railway.app/dashboard
2. Find your ResearchHub project
3. You should see:
   - `researchhub-mongodb` service ✅ (Active)
   - Your API service (showing connection errors)

### **Step 2: Check MongoDB Service Variables**
1. Click on `researchhub-mongodb` service
2. Go to "Variables" tab
3. Look for auto-generated variables like:
   - `MONGO_URL`
   - `DATABASE_URL`
   - `MONGODB_URL`
4. Note the exact variable name

### **Step 3: Update API Service**
1. Click on your API service
2. Go to "Variables" tab
3. Find `MONGODB_URI` variable
4. Update it to reference your MongoDB service:

**Try these options (based on what you found in Step 2):**
```bash
# If MongoDB service has MONGO_URL variable:
MONGODB_URI=${{ researchhub-mongodb.MONGO_URL }}/researchhub

# If it has DATABASE_URL:
MONGODB_URI=${{ researchhub-mongodb.DATABASE_URL }}/researchhub

# Direct connection attempt:
MONGODB_URI=mongodb://researchhub-mongodb.railway.internal:27017/researchhub

# Emergency Atlas fallback:
MONGODB_URI=mongodb+srv://abwanwr77:CFm4JCkjeFpKpzO4@cluster0.ackancs.mongodb.net/researchhub?retryWrites=true&w=majority&appName=Cluster0
```

### **Step 4: Deploy and Monitor**
1. Save the environment variable
2. Click "Deploy" to redeploy
3. Monitor deploy logs for:
   ```
   ✅ Connected to MongoDB successfully
   ✅ Database initialization completed
   ```

## 🧪 **TEST YOUR FIX**

After deployment completes:
```bash
# Get your Railway app URL from dashboard, then test:
node verify-mongodb-connection.cjs https://your-railway-url.railway.app
```

## ⏱️ **Expected Time to Fix**
- Find correct variable format: 3 minutes
- Update environment variable: 1 minute
- Redeploy: 5-8 minutes
- Test: 2 minutes
- **Total**: ~15 minutes

## 💡 **Why This Will Work**

Your MongoDB service (`researchhub-mongodb`) is running perfectly ✅  
The only issue is the API can't find it due to incorrect `MONGODB_URI` reference.

---

**🚀 ACTION**: Go to Railway dashboard and follow the manual fix steps above. Your MongoDB connection will work once the environment variable is corrected!
