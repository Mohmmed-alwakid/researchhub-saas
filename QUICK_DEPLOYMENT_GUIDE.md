# 🚀 Quick Cloud Deployment Guide

This guide will help you deploy ResearchHub to the cloud in under 30 minutes using Railway or Heroku.

## 🎯 Option 1: Railway Deployment (Recommended)

### Prerequisites
- GitHub account with this repository
- Railway account (sign up at railway.app)
- MongoDB Atlas account
- Stripe account (for payments)

### Step 1: Database Setup (5 minutes)

1. **Create MongoDB Atlas Cluster**:
   ```
   1. Go to https://cloud.mongodb.com/
   2. Create free cluster
   3. Create database user
   4. Whitelist all IPs (0.0.0.0/0) for now
   5. Get connection string
   ```

2. **Update Connection String**:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/research-hub
   ```

### Step 2: Railway Deployment (10 minutes)

1. **Connect Repository**:
   ```
   1. Go to https://railway.app/
   2. Click "Start a New Project"
   3. Choose "Deploy from GitHub repo"
   4. Select this repository
   ```

2. **Configure Environment Variables**:
   ```bash
   NODE_ENV=production
   PORT=5000
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/research-hub
   JWT_SECRET=super-secret-jwt-key-change-this-in-production
   JWT_REFRESH_SECRET=super-secret-refresh-key-change-this-in-production
   CLIENT_URL=https://your-frontend-domain.railway.app
   
   # Stripe (use test keys initially)
   STRIPE_SECRET_KEY=sk_test_your_test_key
   STRIPE_PUBLISHABLE_KEY=pk_test_your_test_key
   STRIPE_WEBHOOK_SECRET=whsec_test_webhook_secret
   
   # Email (optional for now)
   SENDGRID_API_KEY=optional_for_testing
   FROM_EMAIL=noreply@test.com
   
   # AWS S3 (optional for now)
   AWS_ACCESS_KEY_ID=optional_for_testing
   AWS_SECRET_ACCESS_KEY=optional_for_testing
   AWS_REGION=us-east-1
   AWS_S3_BUCKET=test-bucket
   ```

3. **Deploy Backend**:
   ```bash
   # Railway will automatically detect and build
   # Build Command: npm run build
   # Start Command: npm start
   ```

4. **Deploy Frontend**:
   ```bash
   # Create separate service for frontend
   # Build Command: npm run build:client
   # Start Command: npx serve -s dist -l 3000
   ```

### Step 3: Configure Frontend API URL (5 minutes)

1. **Create Vite environment file**:
   ```bash
   # In root directory
   echo "VITE_API_URL=https://your-backend-domain.railway.app/api" > .env.production
   ```

2. **Update CORS origins in backend**:
   - Add your frontend domain to CORS configuration

### Step 4: Test Deployment (10 minutes)

1. **Test Registration**:
   ```
   1. Open your frontend URL
   2. Try registering a new user
   3. Check database for new user
   ```

2. **Test Login**:
   ```
   1. Login with registered user
   2. Access dashboard
   3. Verify JWT tokens working
   ```

---

## 🎯 Option 2: Heroku Deployment

### Step 1: Install Heroku CLI
```powershell
# Install via npm
npm install -g heroku
```

### Step 2: Create Heroku Apps
```powershell
# Login to Heroku
heroku login

# Create backend app
heroku create your-app-name-api

# Create frontend app  
heroku create your-app-name-client
```

### Step 3: Configure Backend
```powershell
# Set environment variables
heroku config:set NODE_ENV=production --app your-app-name-api
heroku config:set MONGODB_URI="your-mongodb-atlas-url" --app your-app-name-api
heroku config:set JWT_SECRET="your-jwt-secret" --app your-app-name-api
heroku config:set CLIENT_URL="https://your-app-name-client.herokuapp.com" --app your-app-name-api

# Deploy backend
git subtree push --prefix=src/server heroku main
```

### Step 4: Configure Frontend
```powershell
# Set build variables
heroku config:set VITE_API_URL="https://your-app-name-api.herokuapp.com/api" --app your-app-name-client

# Deploy frontend
heroku buildpacks:add heroku/nodejs --app your-app-name-client
git push heroku main
```

---

## 🎯 Option 3: DigitalOcean App Platform

### Step 1: Create App
1. Go to DigitalOcean App Platform
2. Connect GitHub repository
3. Configure as monorepo with 2 services

### Step 2: Configure Services

**Backend Service**:
```yaml
name: api
source_dir: /
github:
  repo: your-username/research-hub
  branch: main
run_command: npm start
build_command: npm run build:server
environment_slug: node-js
instance_count: 1
instance_size_slug: basic-xxs
```

**Frontend Service**:
```yaml
name: client
source_dir: /
github:
  repo: your-username/research-hub
  branch: main
build_command: npm run build:client
environment_slug: node-js
instance_count: 1
instance_size_slug: basic-xxs
```

---

## 🔧 Build Scripts Configuration

Add these scripts to `package.json` if not already present:

```json
{
  "scripts": {
    "build": "npm run build:client && npm run build:server",
    "build:client": "tsc -b && vite build",
    "build:server": "tsc -p tsconfig.server.json",
    "start": "node dist/server/index.js",
    "start:client": "npx serve -s dist -l 3000"
  }
}
```

---

## 🎯 Quick Verification Checklist

After deployment, verify these work:

- [ ] Frontend loads without errors
- [ ] Backend API responds (check /api/health if exists)
- [ ] User registration works
- [ ] User login works
- [ ] Dashboard loads after login
- [ ] Database connections working
- [ ] CORS configured properly

---

## 🚨 Common Issues & Solutions

### Issue: CORS Errors
**Solution**: Update backend CORS configuration with frontend domain

### Issue: Database Connection Failed
**Solution**: Check MongoDB Atlas IP whitelist and connection string

### Issue: 500 Server Errors
**Solution**: Check environment variables and build process

### Issue: Frontend Can't Reach Backend
**Solution**: Verify VITE_API_URL environment variable

---

## 🎉 You're Live!

Once deployed, your ResearchHub application will be accessible via:
- **Frontend**: `https://your-app-name.platform.app`
- **Backend API**: `https://your-api-name.platform.app/api`

Remember to:
1. Set up proper domain names
2. Configure SSL certificates
3. Set up monitoring
4. Plan for production scaling

**Estimated Total Deployment Time**: 20-45 minutes
