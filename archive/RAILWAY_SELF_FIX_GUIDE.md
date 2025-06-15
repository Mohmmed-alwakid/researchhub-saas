# 🚂 Railway MongoDB Connection Self-Fix Guide

**Date**: June 15, 2025  
**For**: ResearchHub Railway Deployment

## 🎯 **STEP 1: Find Your Correct Railway URL**

Your Railway app URL from the logs shows it's running, but we need the correct public URL.

### **A. Check Railway Dashboard**
1. Go to https://railway.app/dashboard
2. Login with your GitHub account
3. Find your ResearchHub project
4. Click on your API service
5. Look for the "Domain" or "Public URL" - it should be something like:
   - `https://your-service-name.railway.app`
   - `https://researchhub-api-production-abb267f.up.railway.app`

### **B. Test Your Railway URL**
Once you have the correct URL, test it:
```bash
node quick-railway-check.cjs https://YOUR-ACTUAL-RAILWAY-URL.railway.app
```

## 🔧 **STEP 2: Fix MongoDB Connection (THE MAIN ISSUE)**

Based on your logs, the exact problem is:
```
❌ connect ECONNREFUSED researchhub-mongodb.railway.internal:27017
```

### **Fix Process:**

1. **Railway Dashboard** → Your Project → Your API Service → Variables tab

2. **Find `MONGODB_URI` variable and update it:**

   **Current (Broken):**
   ```
   mongodb://researchhub-mongodb.railway.internal:27017/researchhub
   ```

   **Try These Fixes (One at a time):**
   
   **Option A - Standard Railway MongoDB:**
   ```
   ${{ MongoDB.MONGO_URL }}/researchhub
   ```
   
   **Option B - Alternative service name:**
   ```
   ${{ Mongo.MONGO_URL }}/researchhub
   ```
   
   **Option C - Database service:**
   ```
   ${{ database.MONGO_URL }}/researchhub
   ```
   
   **Option D - Emergency Atlas fallback:**
   ```
   mongodb+srv://abwanwr77:CFm4JCkjeFpKpzO4@cluster0.ackancs.mongodb.net/researchhub?retryWrites=true&w=majority&appName=Cluster0
   ```

3. **Save the variable and redeploy**

4. **Monitor deployment logs for:**
   ```
   ✅ Connected to MongoDB successfully
   ✅ Database initialization completed
   ```

## 🔍 **STEP 3: Verify MongoDB Service Exists**

In Railway Dashboard → Your Project:

1. **Check all services listed**
2. **Look for MongoDB/Database service**
3. **Note the exact service name**
4. **Ensure it's "Active" status**

If you don't see a MongoDB service:
1. Click "New Service" → "Database" → "MongoDB"
2. Wait for it to deploy
3. Use the new service name in your `MONGODB_URI`

## 📊 **STEP 4: Test The Fix**

After making changes:

1. **Wait for deployment to complete**
2. **Test health endpoint:**
   ```bash
   # Replace with your actual Railway URL
   node quick-railway-check.cjs https://your-app.railway.app
   ```
3. **Should see database status: "healthy"**

## 🚨 **COMMON RAILWAY URL PATTERNS**

Your Railway URL might be:
- `https://researchhub-api.railway.app`
- `https://researchhub-api-production.railway.app`
- `https://web-production-XXXX.up.railway.app`
- `https://api-production-XXXX.up.railway.app`

## ⚡ **QUICK EMERGENCY FIX**

If you need immediate working deployment:

1. **Use Atlas MongoDB** (your working connection):
   ```
   MONGODB_URI=mongodb+srv://abwanwr77:CFm4JCkjeFpKpzO4@cluster0.ackancs.mongodb.net/researchhub?retryWrites=true&w=majority&appName=Cluster0
   ```

2. **This will work immediately** while you figure out Railway MongoDB

## 📋 **SUCCESS CHECKLIST**

- [ ] Found correct Railway URL
- [ ] Accessed Railway dashboard
- [ ] Located MongoDB service (or created one)
- [ ] Updated MONGODB_URI environment variable
- [ ] Redeployed service
- [ ] Verified logs show "Connected to MongoDB successfully"
- [ ] Health endpoint returns database status "healthy"

## 🔗 **USEFUL COMMANDS**

```bash
# Test after fixing
node quick-railway-check.cjs https://your-railway-url.railway.app

# Comprehensive test
node check-railway-database.cjs https://your-railway-url.railway.app

# Interactive troubleshooting
.\test-mongodb-configs.ps1
```

---

**🎯 START**: Go to https://railway.app/dashboard and find your correct app URL, then follow the MongoDB connection fix steps above!
