# ResearchHub - User Testing Research Platform

ResearchHub is a comprehensive SaaS platform for user testing research, enabling researchers to conduct studies, gather feedback, and analyze user behavior through screen recording, heatmaps, and analytics.

## ✅ PROJECT STATUS: 🚀 DEPLOYMENT READY

**Build Status**: ✅ **0 TypeScript errors** (100% SUCCESS)  
**Deployment Status**: ✅ **PRODUCTION READY** (June 2, 2025)  
**UI Status**: ✅ **Fully Restored** (Complete Tailwind CSS styling operational)  
**Study Creation**: ✅ **Issue Resolved** (Create Study flow working)  
**Admin System**: ✅ **COMPLETE** (Automatic admin account creation)

### 🌐 Ready for Cloud Deployment
- **Railway**: Configuration ready in `railway.toml`
- **Vercel**: Configuration ready in `vercel.json`  
- **Render**: Configuration ready in `render.yaml`
- **GitHub Actions**: CI/CD workflow configured
- **Health Check**: `/api/health` endpoint operational
- **Admin Setup**: Automatic super admin account creation

### 🚀 Quick Deploy Options
[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/template)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)
[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com)

**📋 See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for complete deployment instructions**

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
