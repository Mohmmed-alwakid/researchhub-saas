# ResearchHub - User Testing Research Platform

ResearchHub is a comprehensive SaaS platform for user testing research, enabling researchers to conduct studies, gather feedback, and analyze user behavior through screen recording, heatmaps, and analytics.

## ✅ PROJECT STATUS: � PRODUCTION READY

**Build Status**: ✅ **0 TypeScript errors** (100% SUCCESS)  
**Core Features**: ✅ **PRODUCTION READY** (Authentication, Studies, Analytics)  
**Advanced Features**: 🚧 **Coming Soon** (Advanced Analytics, Payments, Recording)  
**Completion**: **100%** Core Platform Ready (June 15, 2025)  
**Documentation**: ✅ **Complete** (PRD, Tech Stack, Guidelines, Security)  

## 📚 Documentation

### Core Project Documents
- **[Product Requirements (PRD)](./docs/PRD.md)** - Complete product vision and requirements
- **[Application Flow](./docs/APP_FLOW.md)** - User journeys and technical flows  
- **[Tech Stack](./docs/TECH_STACK.md)** - Technology decisions and architecture
- **[Frontend Guidelines](./docs/FRONTEND_GUIDELINES.md)** - Development standards and patterns
- **[Backend Structure](./docs/BACKEND_STRUCTURE.md)** - API architecture and patterns
- **[Security Checklist](./docs/SECURITY_CHECKLIST.md)** - Security measures and compliance

### Additional Documentation
- **[Permission System](./docs/PERMISSION_SYSTEM.md)** - Role-based access implementation
- **[TypeScript Report](./docs/TYPESCRIPT_COMPLETION_REPORT.md)** - Migration status
- **[Deployment Status](./docs/FINAL_DEPLOYMENT_STATUS.md)** - Deployment guide
- **[Project Memory Bank](./PROJECT_MEMORY_BANK.md)** - Project history and status  

### 🎯 Core Features (Ready for Production)
- ✅ **User Authentication** - JWT-based auth with refresh tokens
- ✅ **Study Management** - Create, edit, and manage research studies
- ✅ **User Management** - Role-based access (Admin/Researcher/Participant)
- ✅ **Analytics Dashboard** - Essential metrics and basic reporting
- ✅ **Admin Dashboard** - User management and system overview
- ✅ **Responsive UI** - Modern, accessible interface

### 🚧 Advanced Features (Coming Soon)
- 🔄 **Advanced Analytics** - Comprehensive charts and real-time metrics
- 🔄 **Heatmap Analytics** - User interaction heatmaps
- 🔄 **Session Replay** - Video recording and playback
- 🔄 **Payment Integration** - Stripe-based subscription management
- 🔄 **Real-time Features** - Live monitoring and notifications
- 🔄 **Advanced Admin Tools** - System analytics and role permissions

> **Note**: Advanced features display "Coming Soon" banners in production mode. Enable via feature flags for development testing.

## 🚀 Quick Deployment

### Ready for Cloud Deployment
- **Railway**: Configuration ready in `railway.toml`
- **Vercel**: Configuration ready in `vercel.json`  
- **Render**: Configuration ready in `render.yaml`
- **Docker**: Containerization ready with `docker-compose.yml`
- **Health Check**: `/api/health` endpoint operational

### Deploy Now
[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/template)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)
[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com)

**📋 See [docs/FINAL_DEPLOYMENT_STATUS.md](./docs/FINAL_DEPLOYMENT_STATUS.md) for complete deployment instructions**

## 🛡️ Admin Account System

ResearchHub includes an automatic admin account initialization system for secure deployment:

### **Quick Admin Setup** (2 minutes)
1. **Set Environment Variables**:
   ```bash
   ADMIN_EMAIL=admin@yourdomain.com
   ADMIN_PASSWORD=YourSecurePassword123!
   ADMIN_FIRST_NAME=Your
   ADMIN_LAST_NAME=Name
   ADMIN_ORGANIZATION=Your Organization
   ```

2. **Deploy Application** - Admin account created automatically on first startup

3. **Login & Secure** - Change password immediately after first login

### **Test Accounts** (Development)
- **Admin**: `testadmin@test.com` / `AdminPassword123!`
- **Researcher**: `testresearcher@test.com` / `Password123!`
- **Participant**: `testparticipant@test.com` / `Password123!`

📋 **See [ADMIN_SETUP_GUIDE.md](./ADMIN_SETUP_GUIDE.md) for complete admin setup instructions**

## 🎚️ Feature Flags

ResearchHub uses feature flags to control access to incomplete features, ensuring production deployments only show fully functional features.

### Production Mode (Default)
All advanced features are disabled by default and show "Coming Soon" messages:
- Advanced Analytics Dashboard
- Heatmap Analytics  
- Session Replay
- Payment/Subscription Management
- System Analytics
- Role & Permission Manager

### Development Mode
Enable incomplete features for testing by setting environment variables:

```bash
# Enable specific features for development testing
VITE_ENABLE_ADVANCED_ANALYTICS=true
VITE_ENABLE_HEATMAP_ANALYTICS=true
VITE_ENABLE_SESSION_REPLAY=true
VITE_ENABLE_SUBSCRIPTION_MANAGEMENT=true
VITE_ENABLE_SYSTEM_ANALYTICS=true
VITE_ENABLE_ROLE_PERMISSION_MANAGER=true
```

### Feature Status
- ✅ **Ready**: Authentication, Studies, Basic Analytics, Admin Dashboard
- 🚧 **Development**: Advanced Analytics (65% complete, mock data)
- 🚧 **Planning**: Payment Integration, Real-time Features
- 📋 **See [PRODUCTION_READINESS_AUDIT_REPORT.md](./PRODUCTION_READINESS_AUDIT_REPORT.md) for detailed status**

## 🏗️ Development Setup

### Prerequisites
- Node.js 18+ 
- MongoDB (local or Atlas)
- Git

### Quick Start
```bash
# Clone repository
git clone https://github.com/yourusername/researchhub.git
cd researchhub

# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Edit .env with your configuration

# Start development servers
npm run dev  # Both frontend (5175) and backend (3002)

# Or start individually
npm run dev:client    # Frontend only
npm run dev:server    # Backend only
```

### Development URLs
- **Frontend**: http://localhost:5175
- **Backend API**: http://localhost:3002/api
- **Health Check**: http://localhost:3002/api/health
- **Admin Test**: Open `ADMIN_LOGIN_TEST.html` in browser

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS
- **Backend**: Express.js + TypeScript + MongoDB + Mongoose
- **Authentication**: JWT tokens + refresh tokens
- **Real-time**: Socket.io for live features
- **Payments**: Stripe integration
- **Storage**: AWS S3 for file uploads
- **Email**: SendGrid for notifications
- **Deployment**: Docker + GitHub Actions

## 🔗 Documentation

- **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)** - Complete deployment instructions
- **[ADMIN_SETUP_GUIDE.md](./ADMIN_SETUP_GUIDE.md)** - Admin account configuration
- **[PROJECT_MEMORY_BANK.md](./PROJECT_MEMORY_BANK.md)** - Complete project history
- **[QUICK_REFERENCE.md](./QUICK_REFERENCE.md)** - Essential commands and URLs

## 📞 Support

- **Health Check**: `/api/health` endpoint for monitoring
- **Test Files**: `ADMIN_LOGIN_TEST.html` for admin verification
- **Logs**: Check deployment logs for admin account creation
- **Issues**: GitHub Issues for bug reports and feature requests

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config({
  extends: [
    // Remove ...tseslint.configs.recommended and replace with this
    ...tseslint.configs.recommendedTypeChecked,
    // Alternatively, use this for stricter rules
    ...tseslint.configs.strictTypeChecked,
    // Optionally, add this for stylistic rules
    ...tseslint.configs.stylisticTypeChecked,
  ],
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config({
  plugins: {
    // Add the react-x and react-dom plugins
    'react-x': reactX,
    'react-dom': reactDom,
  },
  rules: {
    // other rules...
    // Enable its recommended typescript rules
    ...reactX.configs['recommended-typescript'].rules,
    ...reactDom.configs.recommended.rules,
  },
})
```
