# 🔍 Railway MongoDB Setup Verification Guide

## 🎯 **Step-by-Step Verification Process**

### **1. Check Railway Project Structure**

In your Railway dashboard, you should see **2 services**:

✅ **Required Services:**
- 📊 **MongoDB Service** (database)
- 🚀 **Backend Service** (your app)

❌ **Common Mistake:**
- Only having MongoDB service without backend service

---

### **2. Verify MongoDB Service Status**

**Go to MongoDB Service:**
- **Status**: Should show "Running" 🟢
- **URL**: Should show internal connection available
- **Memory/CPU**: Should show usage stats

**MongoDB Service Checklist:**
- ✅ Service is "Running"
- ✅ Has internal network connectivity
- ✅ Shows connection string format

---

### **3. Check Backend Service Status** 

**Go to Backend Service:**
- **Status**: Should show "Running" 🟢 or "Failed" 🔴
- **Latest Deployment**: Check if successful
- **Build Logs**: Look for errors
- **Runtime Logs**: Check for connection issues

**If Backend Service is Missing:**
- Click "**+ New Service**"
- Select "**Deploy from GitHub**"
- Choose your repository: `Mohmmed-alwakid/researchhub-saas`

---

### **4. Verify Environment Variables**

**In your Backend Service, check Variables section:**

✅ **Required Variables (7 total):**
```
NODE_ENV=production
MONGODB_URI=mongodb://mongodb.railway.internal:27017/researchhub
JWT_SECRET=f985e9336178c587e7cd17dcbdc2ff6d863c16a45f941ad2daf6dda9b38a54ea5984515fba438420abade63aef243fe2090cd3a0aa19ce37a0f6c955ba11ef004
JWT_REFRESH_SECRET=9c64a633ecac05bf7bf95fbb75d97f87252e7c086c7a7abdb9231fb30362adecf599d5307861c380749166beb221a0e71182a4fa93e0a429513370980d43c79e03
JWT_EXPIRE=7d
JWT_REFRESH_EXPIRE=30d
CLIENT_URL=https://researchhub-saas.vercel.app
```

❌ **Remove if Present:**
- `PORT` (Railway assigns automatically)
- `RAILWAY_ENV_VARS` (local reference only)

---

### **5. Check Deployment Logs**

**In Backend Service > Deployments:**

✅ **Successful Logs Should Show:**
```
🔌 Attempting to connect to MongoDB...
🚀 Server running on 0.0.0.0:XXXX
✅ Connected to MongoDB successfully
🚀 Initializing database...
✅ Database initialization completed
```

❌ **Error Patterns to Look For:**
- `Build failed` - TypeScript compilation issues
- `MongoDB connection failed` - Network/URI issues
- `Health check timeout` - Server not starting
- `Port binding failed` - Port conflicts

---

### **6. Test Backend Health Endpoint**

**Find your Railway backend URL:**
- Go to Backend Service
- Look for "Deployments" or "Settings"
- Find the public URL (e.g., `https://yourapp.railway.app`)

**Test Health Check:**
- Visit: `https://yourapp.railway.app/api/health`
- Should return: `{"status":"ok","uptime":...}`

---

### **7. Verify MongoDB Database Creation**

**After successful backend deployment:**

**Go to MongoDB Service Dashboard:**
- Should see `researchhub` database (not just "test")
- Should see collections: `users`, `studies`, `tasks`, etc.
- Should contain admin user document

**If only "test" database exists:**
- Backend hasn't connected successfully
- Check backend deployment logs for errors

---

## 🚨 **Common Issues & Solutions**

### **Issue 1: Only MongoDB Service Exists**
**Solution:** Deploy your backend service
1. Click "+ New Service"
2. "Deploy from GitHub repo"
3. Select `Mohmmed-alwakid/researchhub-saas`

### **Issue 2: Backend Service Failed**
**Solution:** Check build/runtime logs
- Common causes: TypeScript errors, missing dependencies
- Fix: Review logs, fix code, redeploy

### **Issue 3: MongoDB Shows Only "test" Database**
**Solution:** Backend not connecting properly
- Verify MONGODB_URI is exactly: `mongodb://mongodb.railway.internal:27017/researchhub`
- Check backend logs for connection errors

### **Issue 4: Health Check Fails**
**Solution:** Server not starting properly
- Check PORT variable (should NOT be set)
- Verify start command: `node dist/server/server/index.js`
- Check for runtime errors in logs

---

## ⚡ **Quick Verification Commands**

**1. Test Your Backend URL:**
```
curl https://yourapp.railway.app/api/health
```

**2. Check if MongoDB is Accessible:**
```
# This should be done from within Railway (not locally)
# Your app logs will show MongoDB connection status
```

---

## 🎯 **Next Steps Based on What You Find**

### **Scenario A: Both Services Running, MongoDB Empty**
- Backend deployed but not connecting to MongoDB
- Check MONGODB_URI format
- Review backend runtime logs

### **Scenario B: Only MongoDB Service Exists**
- Deploy backend service from GitHub repo
- Add environment variables
- Monitor deployment

### **Scenario C: Backend Service Failed**
- Check build logs for errors
- Fix TypeScript/dependency issues
- Redeploy

### **Scenario D: Everything Working**
- MongoDB should show `researchhub` database
- Collections should be populated
- Health endpoint should respond

---

## 📋 **Verification Checklist**

Use this checklist to verify your setup:

- [ ] MongoDB service is running
- [ ] Backend service exists and is running
- [ ] 7 environment variables are set correctly
- [ ] No PORT or RAILWAY_ENV_VARS variables
- [ ] Latest deployment succeeded
- [ ] Health endpoint responds: `/api/health`
- [ ] MongoDB shows `researchhub` database
- [ ] Collections are populated with data

---

**After completing this verification, report back what you find at each step!**
