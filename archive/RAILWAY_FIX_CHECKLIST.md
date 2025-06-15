# ✅ Railway MongoDB Fix - Step-by-Step Checklist

**Date**: June 15, 2025  
**Issue**: `ECONNREFUSED researchhub-mongodb.railway.internal:27017`

## 🎯 **5-MINUTE FIX CHECKLIST**

### **☐ Step 1: Access Railway Dashboard (1 minute)**
1. ☐ Go to https://railway.app/dashboard
2. ☐ Login with your account
3. ☐ Find your ResearchHub project
4. ☐ Click on the project to open it

### **☐ Step 2: Identify MongoDB Service Name (1 minute)**
1. ☐ Look at all service tiles in your project
2. ☐ Find the service with database/MongoDB icon
3. ☐ Note the EXACT service name (e.g., "MongoDB", "Mongo", "database", etc.)
4. ☐ Write down the service name: `_________________`

### **☐ Step 3: Update Environment Variable (2 minutes)**
1. ☐ Click on your API service (the one with Node.js/backend code)
2. ☐ Click "Variables" tab
3. ☐ Find the `MONGODB_URI` variable
4. ☐ Replace the current value with one of these options:

**If MongoDB service name is "MongoDB":**
```
${{ MongoDB.MONGO_URL }}/researchhub
```

**If MongoDB service name is "Mongo":**
```
${{ Mongo.MONGO_URL }}/researchhub
```

**If MongoDB service name is "database":**
```
${{ database.MONGO_URL }}/researchhub
```

**Emergency Atlas fallback:**
```
mongodb+srv://abwanwr77:CFm4JCkjeFpKpzO4@cluster0.ackancs.mongodb.net/researchhub?retryWrites=true&w=majority&appName=Cluster0
```

5. ☐ Click "Save" or "Update"

### **☐ Step 4: Redeploy Service (1 minute)**
1. ☐ Still in your API service, click "Deployments" tab
2. ☐ Click "Deploy" or "Redeploy" button
3. ☐ Wait for deployment to start

### **☐ Step 5: Monitor Deployment Logs (5-8 minutes)**
1. ☐ Click "Deploy Logs" tab
2. ☐ Watch for these success messages:
   - ☐ `🔌 Attempting to connect to MongoDB...`
   - ☐ `✅ Connected to MongoDB successfully`
   - ☐ `✅ Database initialization completed`

### **☐ Step 6: Test Health Endpoint (1 minute)**
1. ☐ Get your Railway app URL (e.g., `https://your-app.railway.app`)
2. ☐ Visit: `https://your-app.railway.app/api/health`
3. ☐ Should see JSON response with `"status": "ok"` and database info

## 🚨 **TROUBLESHOOTING IF STILL FAILING**

### **☐ If deployment still fails:**
1. ☐ Check if MongoDB service is "Active" in Railway dashboard
2. ☐ Try the Atlas fallback URI (emergency option above)
3. ☐ Check Deploy Logs for any other errors

### **☐ If MongoDB service is not found:**
1. ☐ You may need to add MongoDB service to your Railway project
2. ☐ Go to Railway project → "New Service" → "Database" → "MongoDB"
3. ☐ Wait for MongoDB service to deploy
4. ☐ Then update `MONGODB_URI` with the new service name

## 📊 **SUCCESS INDICATORS**

### **✅ Railway Logs Should Show:**
```
🚀 Starting ResearchHub server...
🔌 Attempting to connect to MongoDB...
✅ Connected to MongoDB successfully
🗄️ Database initialization started...
✅ Database initialization completed
🚀 Server running on 0.0.0.0:3002
```

### **✅ Health Endpoint Should Return:**
```json
{
  "status": "ok",
  "success": true,
  "database": {
    "status": "healthy",
    "isConnected": true,
    "readyState": 1
  }
}
```

## ⏱️ **ESTIMATED TIME TO COMPLETE**
- **Total**: 10-15 minutes
- **Critical path**: Finding correct service name (Step 2)
- **Longest wait**: Redeployment (Step 5)

## 📞 **AFTER SUCCESS**
1. ☐ Update frontend to use Railway backend URL
2. ☐ Test full application flow
3. ☐ Monitor Railway usage and logs

---

**🎯 START HERE**: Go to https://railway.app/dashboard and begin Step 1!
