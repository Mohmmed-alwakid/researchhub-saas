# 🚨 RAILWAY MONGODB CONNECTION - EXACT FIX NEEDED

**Date**: June 15, 2025  
**Issue**: MongoDB connection failing on Railway  
**Error**: `connect ECONNREFUSED researchhub-mongodb.railway.internal:27017`

## 🎯 **THE EXACT PROBLEM**

Your Railway API is trying to connect to:
```
researchhub-mongodb.railway.internal:27017
```

But this service name doesn't exist or is incorrect in your Railway project.

## ⚡ **THE EXACT FIX (5 minutes)**

### **Step 1: Go to Railway Dashboard**
1. Open https://railway.app/dashboard
2. Login with your GitHub account (you provided the credentials)
3. Find your ResearchHub project and click it

### **Step 2: Check MongoDB Service**
1. Look at all services in your project
2. Find the MongoDB/Database service (database icon)
3. Note the EXACT service name (e.g., "MongoDB", "Mongo", "database")

### **Step 3: Update Environment Variable**
1. Click on your **API service** (the one showing the error logs)
2. Click **"Variables"** tab
3. Find `MONGODB_URI` variable
4. Replace the current value with:

**If your MongoDB service is named "MongoDB":**
```
${{ MongoDB.MONGO_URL }}/researchhub
```

**If your MongoDB service is named "Mongo":**
```
${{ Mongo.MONGO_URL }}/researchhub
```

**If your MongoDB service is named "database":**
```
${{ database.MONGO_URL }}/researchhub
```

**Emergency Atlas fallback (if Railway MongoDB doesn't work):**
```
mongodb+srv://abwanwr77:CFm4JCkjeFpKpzO4@cluster0.ackancs.mongodb.net/researchhub?retryWrites=true&w=majority&appName=Cluster0
```

### **Step 4: Redeploy**
1. Save the environment variable
2. Click **"Deploy"** to trigger a new deployment
3. Watch the deployment logs

## ✅ **SUCCESS INDICATORS**

You'll know it's fixed when you see in Railway logs:
```
🔌 Attempting to connect to MongoDB...
✅ Connected to MongoDB successfully
🗄️ Database initialization started...
✅ Database initialization completed
```

## 🧪 **TEST YOUR FIX**

After the deployment completes:

1. Get your Railway app URL from the dashboard
2. Test it with:
```bash
node quick-railway-check.cjs https://your-railway-url.railway.app
```

## 🔧 **TROUBLESHOOTING**

### **If you don't see a MongoDB service:**
1. Add one: **New Service** → **Database** → **MongoDB**
2. Wait for it to deploy
3. Use its name in your `MONGODB_URI`

### **If it still fails:**
1. Use the Atlas fallback URI (Option D above)
2. This will work immediately while you troubleshoot Railway

## ⏱️ **TIMELINE**
- **Finding service name**: 2 minutes
- **Updating variable**: 1 minute
- **Redeployment**: 5-8 minutes
- **Testing**: 2 minutes
- **Total**: ~15 minutes

---

**🚀 START NOW**: Go to https://railway.app/dashboard and follow the steps above. This is the exact fix your deployment needs!
