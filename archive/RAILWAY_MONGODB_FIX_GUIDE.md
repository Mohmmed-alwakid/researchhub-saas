# 🚨 Railway MongoDB Connection Fix Guide

**Date**: June 15, 2025  
**Issue**: MongoDB connection failing on Railway deployment  
**Error**: `connect ECONNREFUSED researchhub-mongodb.railway.internal:27017`

## 🔍 **Problem Analysis**

From your Railway logs, I can see:

1. ✅ **API Server**: Starting successfully on port 3002
2. ❌ **MongoDB**: Connection failing to `researchhub-mongodb.railway.internal:27017`
3. ⚠️ **IPv6 Error**: `fd12:e29d:67a1:0:1000:1f:2a28:c6bb:27017` suggests networking issues

## 🛠️ **Immediate Solutions to Try**

### **Solution 1: Check MongoDB Service Name** ⭐ **Most Likely Fix**

The error suggests your MongoDB service might be named `researchhub-mongodb` but Railway expects a different name.

1. **Go to Railway Dashboard** → Your Project
2. **Check MongoDB Service Name** - Look for the actual service name
3. **Update MONGODB_URI** based on actual service name:

```bash
# If your MongoDB service is named "mongodb"
MONGODB_URI=${{ MongoDB.MONGO_URL }}/researchhub

# If your MongoDB service is named "mongo"  
MONGODB_URI=${{ Mongo.MONGO_URL }}/researchhub

# If your MongoDB service has a custom name
MONGODB_URI=${{ YourServiceName.MONGO_URL }}/researchhub
```

### **Solution 2: Use Railway's Auto-Generated MongoDB URL**

Instead of manually constructing the URL, use Railway's generated variable:

1. **In Railway Dashboard** → Your MongoDB service → Variables
2. **Copy the exact `MONGO_URL` variable**
3. **Set in your API service**:
```bash
MONGODB_URI=${{ MongoDB.MONGO_URL }}/researchhub
```

### **Solution 3: Check Service Status**

1. **Railway Dashboard** → Your Project
2. **Verify MongoDB service shows "Active"**
3. **If not active**: Click on MongoDB service → Deploy

### **Solution 4: Alternative - Use MongoDB Atlas**

If Railway MongoDB continues to have issues, switch back to Atlas:

```bash
MONGODB_URI=mongodb+srv://abwanwr77:CFm4JCkjeFpKpzO4@cluster0.ackancs.mongodb.net/researchhub?retryWrites=true&w=majority&appName=Cluster0
```

## 🔧 **Step-by-Step Fix Process**

### **Step 1: Check Current Services**
1. Go to https://railway.app/dashboard
2. Open your project
3. List all services and their names
4. Note the exact MongoDB service name

### **Step 2: Update Environment Variable**
1. Click on your API service
2. Go to Variables tab
3. Update `MONGODB_URI` with correct service reference
4. Save and redeploy

### **Step 3: Monitor Deployment**
1. Go to Deploy Logs tab
2. Watch for: `✅ Connected to MongoDB successfully`
3. Should see database initialization messages

### **Step 4: Test Connection**
```bash
# Test your Railway API health
curl https://your-railway-url.railway.app/api/health
```

## 📋 **Environment Variables Checklist**

Ensure these are correctly set in Railway:

```bash
NODE_ENV=production

# Option A: Railway MongoDB (Recommended)
MONGODB_URI=${{ MongoDB.MONGO_URL }}/researchhub

# Option B: Atlas MongoDB (Backup)
MONGODB_URI=mongodb+srv://abwanwr77:CFm4JCkjeFpKpzO4@cluster0.ackancs.mongodb.net/researchhub?retryWrites=true&w=majority&appName=Cluster0

JWT_SECRET=f985e9336178c587e7cd17dcbdc2ff6d863c16a45f941ad2daf6dda9b38a54ea5984515fba438420abade63aef243fe2090cd3a0aa19ce37a0f6c955ba11ef004

JWT_REFRESH_SECRET=9c64a633ecac05bf7bf95fbb75d97f87252e7c086c7a7abdb9231fb30362adecf599d5307861c380749166beb221a0e71182a4fa93e0a429513370980d43c79e03

CLIENT_URL=https://afakarm.vercel.app

ADMIN_EMAIL=admin@researchhub.com
ADMIN_PASSWORD=AdminPass123!
```

## 🚨 **Quick Emergency Fix**

If you need immediate working deployment:

1. **Switch to MongoDB Atlas** (your existing working connection):
```bash
MONGODB_URI=mongodb+srv://abwanwr77:CFm4JCkjeFpKpzO4@cluster0.ackancs.mongodb.net/researchhub?retryWrites=true&w=majority&appName=Cluster0
```

2. **Redeploy** your Railway service
3. **Test** the health endpoint

## 🔍 **Debugging Commands**

After making changes, test with:

```bash
# Test your Railway deployment
node quick-railway-check.cjs https://your-railway-url.railway.app

# Check detailed status
node check-railway-database.cjs https://your-railway-url.railway.app
```

## ⚡ **Expected Success Logs**

After fixing, you should see in Railway logs:
```
🔌 Attempting to connect to MongoDB...
✅ Connected to MongoDB successfully
🗄️ Database initialization started...
📋 Creating collections...
👤 Creating admin user...
✅ Database initialization completed
```

## 📞 **Next Steps**

1. **Immediate**: Fix the MongoDB connection using Solution 1 or 4
2. **Verify**: Check health endpoint responds with database status
3. **Test**: Ensure frontend can connect to fixed backend
4. **Monitor**: Watch Railway logs for any recurring issues

---

**Remember**: Railway's internal networking requires exact service name matching. Double-check the MongoDB service name in your Railway dashboard!
