# 🚂 Railway Backend Deployment - DEPLOY NOW!

**✅ Vercel Frontend**: Ready at `researchhub-saas.vercel.app`  
**🎯 Next Step**: Deploy backend to Railway (15 minutes)

---

## 🚀 STEP 1: Deploy to Railway

### A. Go to Railway
**🔗 Click here**: https://railway.app/new

### B. Create Project
1. **Sign in** with your GitHub account
2. **Click**: "Deploy from GitHub repo"  
3. **Select**: `Mohmmed-alwakid/researchhub-saas` repository
4. **Wait**: Railway auto-detects Node.js project

### C. Add Environment Variables
**In Railway Dashboard → Variables tab, add these (copy-paste each line):**

```bash
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://abwanwr77:CFm4JCkjeFpKpzO4@cluster0.ackancs.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=f985e9336178c587e7cd17dcbdc2ff6d863c16a45f941ad2daf6dda9b38a54ea5984515fba438420abade63aef243fe2090cd3a0aa19ce37a0f6c955ba11ef004
JWT_REFRESH_SECRET=9c64a633ecac05bf7bf95fbb75d97f87252e7c086c7a7abdb9231fb30362adecf599d5307861c380749166beb221a0e71182a4fa93e0a429513370980d43c79e03
JWT_EXPIRE=7d
JWT_REFRESH_EXPIRE=30d
CLIENT_URL=https://researchhub-saas.vercel.app
```

### D. Deploy & Get URL
1. **Click**: "Deploy" button
2. **Wait**: Build completes (~8 minutes)
3. **Copy**: Railway URL (e.g. `https://researchhub-backend-abc123.railway.app`)
4. **Test**: Click your URL + `/api/health` (should show success)

---

## 🔗 STEP 2: Connect Frontend to Backend

### A. Update Vercel Environment
1. **Go to**: Vercel Dashboard → Your project → Settings → Environment Variables
2. **Add new variable**:
   ```
   Name: VITE_API_URL
   Value: https://YOUR-RAILWAY-URL.railway.app/api
   ```
   *(Replace YOUR-RAILWAY-URL with actual Railway URL)*

### B. Redeploy Frontend
1. **Go to**: Deployments tab in Vercel
2. **Click**: "Redeploy" on latest deployment
3. **Wait**: ~3 minutes for redeployment

---

## ✅ STEP 3: Verify Success

### Test Complete Stack
1. **Visit**: https://researchhub-saas.vercel.app
2. **Register**: Create a new account
3. **Login**: Test authentication flow
4. **Create Study**: Test study builder functionality

### Quick Health Checks
```powershell
# Test Railway backend (replace with your URL)
curl https://YOUR-RAILWAY-URL.railway.app/api/health

# Test Vercel frontend  
curl https://researchhub-saas.vercel.app
```

---

## 🎯 Expected Results

After completion:
- ✅ **Backend**: Running on Railway with MongoDB
- ✅ **Frontend**: Served by Vercel with global CDN
- ✅ **Database**: MongoDB Atlas connected
- ✅ **Authentication**: JWT tokens working
- ✅ **End-to-End**: Full study creation workflow

---

## 🚨 Need Help?

After Railway deployment, run this verification script:
```powershell
cd d:\MAMP\AfakarM
.\verify-deployment.ps1 -RailwayUrl "https://YOUR-RAILWAY-URL.railway.app"
```

**🚀 Ready? Start with Step 1: https://railway.app/new**
