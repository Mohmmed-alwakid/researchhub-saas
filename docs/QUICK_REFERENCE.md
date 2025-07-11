# 🚀 ResearchHub - Quick Reference (Vercel Deployment)

## 🌐 **DEPLOYMENT URLS**
- **Application**: https://researchhub.vercel.app
- **API Health**: https://researchhub.vercel.app/api/health
- **Admin Panel**: https://researchhub.vercel.app/admin

## 📦 **DEVELOPMENT COMMANDS**
```bash
# Install dependencies
npm install

# Start development
npm run dev              # Frontend + API dev servers
npm run dev:client       # Frontend only (Vite)
npm run dev:api         # API only (Vercel dev)

# Build for production
npm run build           # Build frontend
npm run type-check      # TypeScript validation

# Deploy to Vercel
npm run deploy          # Deploy to production
vercel --prod          # Alternative deploy command
```

## ⚙️ **VERCEL COMMANDS**
```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy to production
vercel --prod

# View deployment logs
vercel logs

# Set environment variables
vercel env add VARIABLE_NAME

# List environment variables
vercel env ls
```

## 🗄️ **DATABASE**
- **Provider**: MongoDB Atlas
- **Connection**: External, reliable connection
- **Database**: researchhub
- **Status**: ✅ Connected and working

## 🔐 **ENVIRONMENT VARIABLES**
```bash
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-jwt-secret
JWT_REFRESH_SECRET=your-refresh-secret
CLIENT_URL=https://researchhub.vercel.app
ADMIN_EMAIL=admin@researchhub.app
ADMIN_PASSWORD=SecureAdminPass123!
```

## 📁 **PROJECT STRUCTURE**
```
ResearchHub/
├── src/                 # Frontend (React/TypeScript)
├── api/                 # Backend (Vercel Functions)
├── lib/                 # Shared utilities
├── public/              # Static assets
├── vercel.json          # Vercel configuration
└── package.json         # Dependencies & scripts
```

## 🧪 **TESTING**
```bash
# Test API health
curl https://researchhub.vercel.app/api/health

# Test authentication
curl -X POST https://researchhub.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@researchhub.app","password":"SecureAdminPass123!"}'
```

## 📊 **MONITORING**
- **Vercel Dashboard**: https://vercel.com/dashboard
- **Analytics**: Built-in Vercel analytics
- **Logs**: `vercel logs` command
- **Performance**: Vercel Speed Insights

## 🆘 **TROUBLESHOOTING**
- **Build Issues**: Check `vercel logs`
- **API Issues**: Check function logs in Vercel dashboard
- **Database Issues**: Test MongoDB Atlas connection
- **Environment**: Verify `vercel env ls`

---
**Last Updated**: June 16, 2025 - Vercel Migration Complete ✅