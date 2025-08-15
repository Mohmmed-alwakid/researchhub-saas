# 🧠 Afkar - User Research Platform

**Last Updated**: 2025-08-15
**Version**: 1.0.2
**Status**: 🚀 **PRODUCTION READY** - **All Critical Issues Resolved**

## 🎉 Latest Achievements (August 15, 2025)

🎯 **Production Readiness Achieved**: Data persistence + demo data filtering complete
✅ **Database-First Storage**: Studies persist across deployments (no more data loss)
✅ **Demo Data Filtering**: Participants see only legitimate research studies
✅ **Role-Based Access**: Proper filtering for participants, researchers, and admins
✅ **Performance Optimization**: Enhanced API response times and error handling

## 🚀 Quick Start

```bash
# Development
npm run dev:fullstack    # Local development (Frontend: 5175, Backend: 3003)
npm run test:quick       # Run comprehensive testing
npm run cleanup          # Organize project structure

# Testing Accounts (MANDATORY - Use Only These)
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

## 🚀 Deployment

**Production**: https://researchhub-saas-9ep442fsv-mohmmed-alwakids-projects.vercel.app
- ✅ Auto-deploy from `main` branch via Vercel
- ✅ All 12/12 serverless functions operational
- ✅ Database persistence active
- ✅ Demo data filtering enabled

**Local Development**: `npm run dev:fullstack` for fastest development

---

**For detailed development instructions, see `.github/copilot-instructions.md`**
