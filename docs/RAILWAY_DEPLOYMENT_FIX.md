# Railway Deployment Fix Guide

## 🚨 Issue: Backend API Routes Not Accessible

**Problem**: Railway deployment is running but API endpoints return 404
**Impact**: Frontend cannot connect to backend
**Priority**: HIGH

## 🔍 Quick Diagnosis

Run this command to verify the issue:
```bash
curl https://researchhub-saas-production.railway.app/api/health
# Expected: JSON health response
# Actual: 404 Not Found
```

## 🛠️ Step-by-Step Fix

### Step 1: Access Railway Dashboard
1. Go to https://railway.app/dashboard
2. Find "ResearchHub" or "researchhub-saas" project
3. Click on the backend service

### Step 2: Check Deployment Logs
Look for these specific errors:
- **Build errors**: TypeScript compilation failures
- **Start errors**: Cannot find module or file
- **Database errors**: MongoDB connection failures
- **Environment errors**: Missing required variables

### Step 3: Verify Environment Variables
Ensure these are set in Railway:
```bash
# Required for backend
NODE_ENV=production
PORT=3002
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-jwt-secret
JWT_REFRESH_SECRET=your-refresh-secret

# Required for frontend integration
CLIENT_URL=https://researchhub-saas.vercel.app
```

### Step 4: Check Build Command
In Railway settings, verify:
- **Build Command**: `npm ci && npm run build`
- **Start Command**: `node dist/server/server/index.js`
- **Health Check Path**: `/health` (not `/api/health`)

### Step 5: Manual Redeploy
If logs show issues:
1. Click "Deploy" button in Railway dashboard
2. Or trigger redeploy with a dummy commit:
   ```bash
   git commit --allow-empty -m "trigger Railway redeploy"
   git push origin main
   ```

## ✅ Verification After Fix

Test these endpoints in order:
```bash
# 1. Basic health (should work)
curl https://researchhub-saas-production.railway.app/health

# 2. Root endpoint (should return JSON)
curl https://researchhub-saas-production.railway.app/

# 3. API health (main test)
curl https://researchhub-saas-production.railway.app/api/health

# 4. Auth endpoint
curl https://researchhub-saas-production.railway.app/api/auth/check
```

Expected responses:
- `/health`: "OK" (text)
- `/`: JSON with API info
- `/api/health`: JSON with database status
- `/api/auth/check`: JSON error (no token provided)

## 🔧 Alternative Solutions

### If Build Process Failed:
1. Check `package.json` scripts are correct
2. Verify `tsconfig.server.json` configuration
3. Ensure `generate-server-package.cjs` exists

### If Start Command Failed:
1. Verify `dist/server/server/index.js` exists after build
2. Check file paths in Railway start command
3. Ensure Node.js version compatibility

### If Database Connection Failed:
1. Verify MongoDB URI is accessible from Railway
2. Check database user permissions
3. Test connection string format

## 📞 Getting Help

If the issue persists:
1. Share Railway deployment logs
2. Check Railway status page: https://status.railway.app
3. Review Railway documentation: https://docs.railway.app

## 🎯 Success Indicators

Deployment is fixed when:
- ✅ All API endpoints return JSON (not 404)
- ✅ Frontend can successfully call backend
- ✅ User authentication flow works
- ✅ Database operations function correctly

---

**Created**: June 15, 2025  
**Status**: Ready for implementation
