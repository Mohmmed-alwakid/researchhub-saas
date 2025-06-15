# Railway Environment Variables Setup Guide

## 🚨 CRITICAL: Railway Deployment Fix Required

**Issue**: Railway is not running our application - only showing default Railway response
**Cause**: Missing or incorrect environment variables, build failure, or start command issue

## ✅ Required Environment Variables for Railway

Copy these **exact** variables into Railway dashboard:

### 1. Core Application Settings
```bash
NODE_ENV=production
PORT=3002
HOST=0.0.0.0
```

### 2. Database Configuration
```bash
MONGODB_URI=mongodb+srv://abwanwr77:CFm4JCkjeFpKpzO4@cluster0.ackancs.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
```

### 3. Authentication Secrets
```bash
JWT_SECRET=f985e9336178c587e7cd17dcbdc2ff6d863c16a45f941ad2daf6dda9b38a54ea5984515fba438420abade63aef243fe2090cd3a0aa19ce37a0f6c955ba11ef004
JWT_REFRESH_SECRET=9c64a633ecac05bf7bf95fbb75d97f87252e7c086c7a7abdb9231fb30362adecf599d5307861c380749166beb221a0e71182a4fa93e0a429513370980d43c79e03
JWT_EXPIRE=7d
JWT_REFRESH_EXPIRE=30d
```

### 4. Frontend Integration
```bash
CLIENT_URL=https://researchhub-saas.vercel.app
```

### 5. Optional (Stripe - for payment features)
```bash
STRIPE_SECRET_KEY=sk_live_your_production_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_live_your_production_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_production_webhook_secret
```

## 🔧 Step-by-Step Railway Dashboard Fix

### Step 1: Access Railway Dashboard
1. Go to: https://railway.app/dashboard
2. Find your "ResearchHub" project (or similar name)
3. Click on the backend service

### Step 2: Check Current Status
Look for these indicators:
- **Status**: Should be "Active" or "Running"
- **Deployment**: Check latest deployment status
- **Build Logs**: Look for any error messages

### Step 3: Verify Environment Variables
1. Click "Variables" tab
2. Add ALL the environment variables listed above
3. Make sure PORT=3002 (not 5000)
4. Ensure NODE_ENV=production

### Step 4: Check Build Configuration
1. Go to "Settings" tab
2. Verify:
   - **Build Command**: `npm ci && npm run build`
   - **Start Command**: `node dist/server/server/index.js`
   - **Health Check Path**: `/health` (updated)

### Step 5: Trigger Redeploy
**Option A**: From Railway Dashboard
- Click "Deploy" button
- Wait for build to complete

**Option B**: From Command Line
```bash
git add railway.toml
git commit -m "fix: update Railway health check path and redeploy"
git push origin main
```

## 🔍 What to Look for in Logs

### Build Logs (should show):
```
✅ npm ci completed
✅ npm run build:client completed  
✅ npm run build:server completed
✅ dist/server/server/index.js created
```

### Runtime Logs (should show):
```
🚀 Starting ResearchHub server...
📊 Node.js version: v20.x.x
📊 Environment: production
📊 Port: 3002
🔌 Attempting to connect to MongoDB...
✅ MongoDB connected successfully
🚀 Server running on 0.0.0.0:3002
```

### Error Logs (watch for):
```
❌ MongoDB connection failed
❌ Cannot find module 'dist/server/server/index.js'
❌ Environment variable X is required
❌ Port 3002 is already in use
```

## ✅ Verification Commands

After fixing Railway, test these:

```bash
# 1. Basic health (should return "OK")
curl https://researchhub-saas-production.railway.app/health

# 2. Root endpoint (should return JSON, not ASCII art)
curl https://researchhub-saas-production.railway.app/

# 3. API health (should return JSON with database status)
curl https://researchhub-saas-production.railway.app/api/health

# 4. API routes (should return JSON, not 404)
curl https://researchhub-saas-production.railway.app/api/auth/check
```

## 🎯 Success Indicators

✅ **Fixed when you see**:
- Root endpoint returns JSON (not ASCII art)
- `/api/health` returns JSON health data
- `/api/auth/check` returns JSON error (expected without token)
- Runtime logs show "Server running on 0.0.0.0:3002"

## 🚨 If Still Not Working

### Common Issues:
1. **Wrong PORT**: Railway auto-assigns PORT, but we set it to 3002
2. **Missing MONGODB_URI**: Database connection fails
3. **Build Path Wrong**: dist/server/server/index.js doesn't exist
4. **Start Command Wrong**: Node can't find the file

### Get Help:
1. Share Railway deployment logs with the exact error messages
2. Verify all environment variables are exactly as listed above
3. Check Railway status page: https://status.railway.app

---

**🎯 PRIORITY**: Fix environment variables first, then redeploy
**⏰ ETA**: 10-15 minutes after following this guide
**📞 Support**: Railway docs at https://docs.railway.app
