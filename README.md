# 🧠 Afkar - User Research Platform

**Last Updated**: 2025-08-15
**Version**: 1.1.0
**Status**: 🚀 **PRODUCTION READY** - **Multi-Environment Strategy Active**

## 🎉 Latest Achievements (August 15, 2025)

🌍 **Multi-Environment Strategy**: Production, Staging, Development environments live
✅ **Environment Parity**: Eliminated "local vs production" deployment discrepancies
🚀 **Professional Pipeline**: Feature → Staging → Production deployment workflow
🔄 **Hybrid Development**: Local development + Cloud testing for optimal productivity
📦 **Automatic Deployments**: Branch-based deployments with instant preview URLs

## � Previous Achievements (August 15, 2025)

🎯 **Production Readiness Achieved**: Data persistence + demo data filtering complete
✅ **Database-First Storage**: Studies persist across deployments (no more data loss)
✅ **Demo Data Filtering**: Participants see only legitimate research studies
✅ **Role-Based Access**: Proper filtering for participants, researchers, and admins
✅ **Performance Optimization**: Enhanced API response times and error handling

## 🚀 Quick Start

### 💻 **Local Development** (Daily Work - Fastest)
```bash
npm run dev:fullstack    # Local development (Frontend: 5175, Backend: 3003)
npm run dev              # Standard React + API development
npm run test:quick       # Run comprehensive testing
```

### ☁️ **Cloud Development** (Environment Testing)
```bash
# Feature Testing
git checkout -b feature/your-feature
git push origin feature/your-feature  # Auto-creates preview URL

# Staging Testing  
git checkout staging
git push origin staging  # Deploys to staging environment

# Production Release
git checkout main
git push origin main     # Deploys to production
```

### 🧪 **Testing Accounts** (MANDATORY - Use Only These)
```bash
# Researcher: abwanwr77+Researcher@gmail.com / Testtest123
# Participant: abwanwr77+participant@gmail.com / Testtest123  
# Admin: abwanwr77+admin@gmail.com / Testtest123
```

## 📁 Project Structure

- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS

- **Backend**: Vercel Functions + Supabase

- **Database**: PostgreSQL with RLS policies + persistent storage
- **Auth**: Supabase Auth with JWT tokens + role-based access

## 🎯 Core Features

✅ **Study Creation**: 6-step wizard with 13 block types
✅ **Data Persistence**: Studies persist across deployments (database-first storage)
✅ **Demo Data Filtering**: Participants see only legitimate research studies
✅ **Role-Based Access**: Different views for participants, researchers, and admins
✅ **Participant Management**: Application & approval workflow
✅ **Real-time Collaboration**: Team collaboration features
✅ **Analytics**: Comprehensive study results analysis
✅ **Payment Integration**: DodoPayments for participant compensation

## � Data Quality & Security

🎯 **Demo Data Filtering**: 
- Participants see only real, legitimate research studies
- Demo/test studies automatically filtered out
- Admins can access all studies for debugging

🔐 **Role-Based Access**:
- **Participants**: Clean study listings with legitimate research only
- **Researchers**: See only their own studies
- **Admins**: Full access including demo data for system management

## �📚 Documentation

- **Development Guide**: `.github/copilot-instructions.md` (Single source of truth)
- **Demo Filtering**: `docs/DEMO_DATA_FILTERING_SYSTEM.md`
- **Improvements**: `docs/IMPROVEMENT_SUGGESTIONS_NEXT_STEPS.md`
- **Current Status**: `PROJECT_STATUS_2025-08-15.md`
- **API Documentation**: `docs/` directory
- **Testing Guide**: `testing/` directory

## 🧪 Testing

```bash
npm run test:daily      # Daily development testing
npm run test:weekly     # Comprehensive weekly validation
npm run test:deployment # Pre-deployment checks
```

**Zero-maintenance automated testing** with AI-powered validation.

🔬 **Manual Testing**: `testing/manual/test-demo-data-filtering.html` for filtering validation

## 🚀 Deployment & Environments

### 🌍 **Multi-Environment Strategy**
- **Production**: https://researchhub-saas-ca57yz24b-mohmmed-alwakids-projects.vercel.app
  - ✅ Auto-deploy from `main` branch
  - ✅ Production database with real user data
  - ✅ All 12/12 serverless functions operational
  
- **Staging**: https://researchhub-saas-rmwizk1az-mohmmed-alwakids-projects.vercel.app
  - ✅ Auto-deploy from `staging` branch  
  - ✅ Team testing and validation environment
  - ✅ Safe testing before production releases
  
- **Development**: Auto-generated preview URLs for feature branches
  - ✅ Individual feature testing
  - ✅ Automatic preview deployments
  - ✅ Isolated development environments

### 💻 **Local Development**: `npm run dev:fullstack` for fastest daily development

---

**For detailed development instructions, see `.github/copilot-instructions.md`**
