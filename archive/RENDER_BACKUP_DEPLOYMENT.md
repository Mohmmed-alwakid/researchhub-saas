# Quick Render Deployment Setup

## 🚀 Render.com Alternative Deployment

Since Railway is experiencing issues, here's a quick setup for Render:

### 1. **Create Render Account**
- Go to https://render.com
- Sign in with GitHub
- Connect your repository: `Mohmmed-alwakid/researchhub-saas`

### 2. **Create Web Service**
- Click "New +" → "Web Service"
- Connect GitHub repository
- Configure:
  ```
  Name: researchhub-backend
  Environment: Node
  Build Command: npm install && npm run build:server
  Start Command: node dist/server/server/index.js
  ```

### 3. **Environment Variables**
Add these in Render dashboard:
```
NODE_ENV=production
JWT_SECRET=your-jwt-secret-here
JWT_REFRESH_SECRET=your-refresh-secret-here
CLIENT_URL=https://researchhub-saas.vercel.app
MONGODB_URI=your-mongodb-connection-string
ADMIN_EMAIL=admin@researchhub.com
ADMIN_PASSWORD=SecureAdminPass123!
```

### 4. **Domain Configuration**
- Render will provide: `https://researchhub-backend.onrender.com`
- Update Vercel environment variable `VITE_API_URL` to this URL

### 5. **Health Check**
- Render automatically uses `/` endpoint for health checks
- Our server is already configured for this

## 🔧 Render Configuration File (render.yaml)

```yaml
services:
  - type: web
    name: researchhub-backend
    env: node
    buildCommand: npm install && npm run build:server
    startCommand: node dist/server/server/index.js
    envVars:
      - key: NODE_ENV
        value: production
      - key: CLIENT_URL
        value: https://researchhub-saas.vercel.app
```

## ⚡ Quick Deploy to Render

1. Create `render.yaml` in project root
2. Push to GitHub
3. Connect repository in Render dashboard
4. Service will auto-deploy

## 🎯 Why Render vs Railway

**Render Advantages:**
- ✅ More reliable deployment process
- ✅ Better error reporting and logs
- ✅ Free tier with 512MB RAM
- ✅ Built-in health checks
- ✅ Simpler configuration

**Railway Advantages:**
- ✅ More generous free tier (8GB RAM)
- ✅ Better for databases
- ❌ Current deployment issues

## 📊 Estimated Setup Time

- **Render Setup**: 10-15 minutes
- **Environment Variables**: 5 minutes
- **Testing**: 5 minutes
- **Total**: ~20-30 minutes

This provides a reliable fallback while we investigate Railway issues.
