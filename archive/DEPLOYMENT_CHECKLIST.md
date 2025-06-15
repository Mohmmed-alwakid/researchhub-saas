# ResearchHub Railway Deployment Checklist

## ✅ Pre-Deployment (Completed)
- [x] Fixed Tailwind CSS configuration
- [x] Verified build process (`npm run build`)
- [x] Tested production build locally
- [x] Railway configuration file exists

## 🔄 MongoDB Atlas Setup (In Progress)
- [ ] Create MongoDB Atlas account/login
- [ ] Create free M0 cluster named "researchhub-cluster"
- [ ] Create database user: "researchhub-user" with secure password
- [ ] Configure network access: 0.0.0.0/0 (allow from anywhere)
- [ ] Get connection string: `mongodb+srv://researchhub-user:<password>@researchhub-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority`

## 🚀 Railway Deployment
- [ ] Sign in to Railway (railway.app)
- [ ] Create new project → "Deploy from GitHub repo"
- [ ] Connect and select ResearchHub repository
- [ ] Configure environment variables:

### Required Environment Variables:
```
NODE_ENV=production
PORT=5000
MONGODB_URI=<your-mongodb-atlas-connection-string>
JWT_SECRET=<generate-secure-secret>
JWT_REFRESH_SECRET=<generate-secure-secret>
JWT_EXPIRE=7d
JWT_REFRESH_EXPIRE=30d
```

### Optional (for full functionality):
```
STRIPE_SECRET_KEY=<your-stripe-secret>
STRIPE_PUBLISHABLE_KEY=<your-stripe-public>
SENDGRID_API_KEY=<your-sendgrid-key>
FROM_EMAIL=noreply@researchhub.com
```

## 🧪 Post-Deployment Testing
- [ ] Check deployment logs for errors
- [ ] Test health endpoint: `https://your-app.railway.app/api/health`
- [ ] Test user registration
- [ ] Test user login
- [ ] Verify API endpoints work
- [ ] Check CORS configuration

## 🔐 Security Tokens Generation
Use these commands to generate secure secrets:
```bash
# For JWT secrets (run these in terminal)
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

## 📋 Notes
- Health check endpoint: `/api/health` (configured in railway.toml)
- Build command: `npm run build`
- Start command: `npm start`
- Restart policy: `on_failure`
