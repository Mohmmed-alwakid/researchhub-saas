# 🚀 ResearchHub Cloud Deployment Guide

## ✅ Deployment Status: PRODUCTION READY
**All TypeScript errors fixed** | **Builds successful** | **Ready for deployment**

---

## 🎯 Quick Deploy Options

### Option 1: 🚂 Railway (Recommended)
[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/template)

**Setup Steps:**
1. Fork this repository to your GitHub account
2. Visit [Railway.app](https://railway.app/) and sign up with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your forked `ResearchHub` repository
5. Railway will auto-detect the configuration from `railway.toml`

**Environment Variables to Set:**
```bash
NODE_ENV=production
PORT=3002
MONGODB_URI=mongodb+srv://your-cluster.mongodb.net/researchhub
JWT_SECRET=your-super-secure-jwt-secret-key-here
JWT_REFRESH_SECRET=your-super-secure-refresh-secret-key-here
CLIENT_URL=https://your-app-name.railway.app
```

### Option 2: ▲ Vercel
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

**Setup Steps:**
1. Visit [Vercel.com](https://vercel.com/) and sign up with GitHub  
2. Click "New Project" → Import your GitHub repository
3. Vercel will auto-detect the configuration from `vercel.json`
4. Add the environment variables in the Vercel dashboard

### Option 3: 🎨 Render
[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com)

**Setup Steps:**
1. Visit [Render.com](https://render.com/) and sign up with GitHub
2. Click "New" → "Web Service" → Connect your GitHub repository  
3. Render will auto-detect the configuration from `render.yaml`
4. Add environment variables in the Render dashboard

---

## 🔧 Environment Variables Required

### Core Variables (Required)
```bash
NODE_ENV=production
PORT=3002
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/researchhub
JWT_SECRET=generate-a-strong-secret-key-here
JWT_REFRESH_SECRET=generate-another-strong-secret-key-here
CLIENT_URL=https://your-deployed-app-url.com
```

### Optional Features
```bash
# Stripe Payments (for subscription features)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...

# AWS S3 (for file uploads)
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_BUCKET_NAME=your-s3-bucket-name
```

---

## 🗄️ Database Setup (MongoDB Atlas)

### Quick Setup:
1. Visit [MongoDB Atlas](https://cloud.mongodb.com/)
2. Create a free cluster
3. Create a database user
4. Whitelist all IP addresses (0.0.0.0/0) for cloud deployment
5. Copy the connection string and set as `MONGODB_URI`

### Connection String Format:
```
mongodb+srv://username:password@cluster-name.xxxxx.mongodb.net/researchhub?retryWrites=true&w=majority
```

---

## 🔐 Security Setup

### Generate JWT Secrets:
```bash
# Run these commands to generate secure secrets
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Use the output as your `JWT_SECRET` and `JWT_REFRESH_SECRET`

---

## ✅ Deployment Verification

### After deployment, test these endpoints:

**Health Check:**
```bash
curl https://your-app-url.com/api/health
# Should return: {"status":"ok","timestamp":"...","version":"1.0.0"}
```

**API Status:**
```bash
curl https://your-app-url.com/api/status
# Should return API information
```

**Frontend:**
```bash
# Visit in browser:
https://your-app-url.com
# Should show the ResearchHub login page
```

---

## 🚀 GitHub Actions Auto-Deployment

This repository includes GitHub Actions workflow (`.github/workflows/deploy.yml`) that:

✅ **Runs on every push to main branch**  
✅ **Tests TypeScript compilation**  
✅ **Builds both client and server**  
✅ **Deploys to multiple platforms simultaneously**  
✅ **Provides deployment status notifications**

### Required GitHub Secrets:
Add these in your repository settings → Secrets and variables → Actions:

```bash
# Railway
RAILWAY_TOKEN=your-railway-token

# Vercel  
VERCEL_TOKEN=your-vercel-token
VERCEL_ORG_ID=your-vercel-org-id
VERCEL_PROJECT_ID=your-vercel-project-id

# Render
RENDER_SERVICE_ID=your-render-service-id
RENDER_API_KEY=your-render-api-key
```

---

## 🛠️ Manual Deployment Commands

### Build & Test Locally:
```bash
# Install dependencies
npm install

# TypeScript check (should show 0 errors)
npx tsc --noEmit
npx tsc -p tsconfig.server.json --noEmit

# Build both client and server
npm run build

# Start production server
npm run start

# Test health endpoint
curl http://localhost:3002/api/health
```

### Docker Deployment:
```bash
# Build and run with Docker
docker build -t researchhub .
docker run -p 3002:3002 researchhub
```

---

## 📊 Monitoring & Logs

### Health Check Endpoint:
- **URL**: `/api/health`
- **Returns**: `{"status":"ok","timestamp":"...","version":"1.0.0"}`
- **Use for**: Platform health checks and monitoring

### Log Monitoring:
- Railway: Built-in logs in dashboard
- Vercel: Function logs in dashboard  
- Render: Service logs in dashboard

---

## 🎯 Production Checklist

- [x] ✅ All TypeScript errors fixed (0 errors)
- [x] ✅ Client build successful  
- [x] ✅ Server build successful
- [x] ✅ Health check endpoint working
- [x] ✅ Environment variables configured
- [x] ✅ Database connection tested
- [x] ✅ Authentication flow verified
- [x] ✅ GitHub Actions workflow configured
- [x] ✅ Multiple deployment platforms ready

## 📞 Support

**Deployment Issues?**
1. Check the GitHub Actions logs for build errors
2. Verify all environment variables are set correctly
3. Test the health endpoint after deployment
4. Check platform-specific logs for runtime errors

**Quick Links:**
- [Railway Docs](https://docs.railway.app/)
- [Vercel Docs](https://vercel.com/docs)
- [Render Docs](https://render.com/docs)
- [MongoDB Atlas Docs](https://docs.atlas.mongodb.com/)

---

🎉 **ResearchHub is now ready for production deployment!**
