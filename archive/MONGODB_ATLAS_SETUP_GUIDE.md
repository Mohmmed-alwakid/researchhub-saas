# 🚀 MongoDB Atlas Setup Guide for ResearchHub

## Step 1: Create MongoDB Atlas Account

1. **Go to MongoDB Atlas**: https://www.mongodb.com/cloud/atlas/register
2. **Sign up** with your email or use Google/GitHub sign-in
3. **Choose the FREE tier** (M0 Sandbox - Perfect for our needs)

## Step 2: Create a New Project

1. After signing in, click **"New Project"**
2. **Project Name**: `ResearchHub Production`
3. Click **"Next"** and **"Create Project"**

## Step 3: Create a Database Cluster

1. Click **"Build a Database"**
2. Choose **"M0 FREE"** tier
3. **Cloud Provider**: Choose AWS (recommended)
4. **Region**: Choose closest to your users (US East is good)
5. **Cluster Name**: `researchhub-cluster`
6. Click **"Create"**

## Step 4: Create Database User

1. When prompted for **"Security Quickstart"**:
   - **Username**: `researchhub`
   - **Password**: `researchhub2025secure` (or generate a secure one)
   - Click **"Create User"**

## Step 5: Network Access

1. **IP Access List**: Click **"Add IP Address"**
2. Click **"Allow Access from Anywhere"** (or add Railway's IPs)
3. Click **"Finish and Close"**

## Step 6: Get Connection String

1. Go to **"Database"** → **"Connect"**
2. Choose **"Connect your application"**
3. **Driver**: Node.js
4. **Version**: 4.1 or later
5. **Copy the connection string** - it looks like:
   ```
   mongodb+srv://researchhub:<password>@researchhub-cluster.xxxxx.mongodb.net/researchhub?retryWrites=true&w=majority
   ```

## Step 7: Replace <password> in Connection String

Replace `<password>` with your actual password:
```
mongodb+srv://researchhub:researchhub2025secure@researchhub-cluster.xxxxx.mongodb.net/researchhub?retryWrites=true&w=majority
```

---

## ⚡ Quick Setup (5 minutes)

If you're familiar with MongoDB Atlas:
1. Create free M0 cluster
2. Create user: `researchhub` / `researchhub2025secure`
3. Allow all IPs for network access
4. Get connection string
5. Share the connection string with me

## 🔒 Security Note

The connection string contains credentials. In production, you'd want:
- Specific IP allowlisting
- Stronger passwords
- Connection from specific networks only

For now, we'll use broad access to get the deployment working, then tighten security.

## 📞 What's Next

Once you have the MongoDB Atlas connection string, I'll:
1. Update the Railway environment variable
2. Restart the service
3. Test the full API functionality
4. Confirm 100% deployment success!

**Estimated time**: 5-10 minutes for Atlas setup + 5 minutes for deployment = **Complete in 15 minutes!**
