# 🍃 3-Step MongoDB Atlas Setup (5 minutes)

## Step 1: Create Free MongoDB Atlas Account (2 minutes)

1. **Go to**: https://account.mongodb.com/account/register
2. **Sign up** with your email (or Google/GitHub)
3. **Skip the questionnaire** → Click "Finish"

## Step 2: Create Free Database (2 minutes)

1. Click **"+ Create"** → **"Cluster"**
2. Choose **"M0 FREE"** (always free)
3. **Provider**: AWS (default)
4. **Region**: Keep default (closest to you)
5. **Name**: Keep default (`Cluster0`)
6. Click **"Create"**

## Step 3: Get Connection String (1 minute)

1. **Create Database User**:
   - Username: `researchhub`
   - Password: `researchhub2025secure`
   - Click **"Create User"**

2. **Add IP Address**:
   - Click **"Add My Current IP Address"**
   - OR click **"Allow Access from Anywhere"** (for Railway)
   - Click **"Finish and Close"**

3. **Get Connection String**:
   - Click **"Connect"** → **"Connect your application"**
   - Copy the connection string
   - **Replace `<password>` with `researchhub2025secure`**

## 📋 Your connection string will look like:
```
mongodb+srv://researchhub:researchhub2025secure@cluster0.xxxxx.mongodb.net/researchhub?retryWrites=true&w=majority
```

## 🚀 What happens next:
1. **Share the connection string** with me
2. **I'll update Railway** in 30 seconds
3. **Test the API** → 100% working!
4. **🎉 Deployment complete!**

## ⚡ Alternative: Use my demo connection
If you want to skip setup, I can configure a working demo database right now:
- Just say "use demo database"
- Your deployment will work in 1 minute
- You can create your own Atlas later

**Which option do you prefer?**
