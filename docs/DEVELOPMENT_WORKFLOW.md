# 🔄 DEVELOPMENT WORKFLOW GUIDE

## 🎯 **HYBRID DEVELOPMENT STRATEGY**

We use a **hybrid approach** combining the speed of local development with the confidence of cloud testing.

### 🏠 **Local Development** (Primary - 90% of daily work)
- **Fastest iteration**: Instant hot reload, no network latency
- **Superior debugging**: Full browser dev tools, console access
- **Cost-effective**: No cloud usage during development
- **Offline capable**: Works without internet connection

### ☁️ **Cloud Development** (Validation - 10% for testing)
- **Environment parity**: Same infrastructure as production
- **Team collaboration**: Shared environments for testing
- **Production confidence**: Validation before deployment
- **Automatic deployment**: Push code, get instant environments

---

## 📋 **DAILY DEVELOPMENT WORKFLOW**

### 1. **Start Development** (Local)
```bash
# Start local development environment
npm run dev:fullstack
# OR
npm run dev

# Opens:
# Frontend: http://localhost:5175
# Backend: http://localhost:3003
```

### 2. **Feature Development** (Local)
```bash
# Create feature branch
git checkout -b feature/your-feature-name

# Develop locally with hot reload
# Make changes, test immediately
# Use browser dev tools for debugging
```

### 3. **Feature Testing** (Cloud)
```bash
# Push for cloud testing
git push origin feature/your-feature-name

# Automatic preview deployment creates:
# https://researchhub-saas-[hash]-feature-name.vercel.app
# Test with production-like environment
```

### 4. **Team Review** (Staging)
```bash
# Merge to staging for team testing
git checkout staging
git merge feature/your-feature-name
git push origin staging

# Updates staging environment:
# https://researchhub-saas-rmwizk1az-mohmmed-alwakids-projects.vercel.app
```

### 5. **Production Release** (Production)
```bash
# After staging approval
git checkout main
git merge staging
git push origin main

# Updates production:
# https://researchhub-saas-ca57yz24b-mohmmed-alwakids-projects.vercel.app
```

---

## 🛠️ **AVAILABLE COMMANDS**

### 💻 **Local Development Commands**
```bash
npm run dev:fullstack    # Full local environment (recommended)
npm run dev              # Standard React + API development
npm run dev:client       # Frontend only
npm run dev:server       # Backend only
npm run dev:clean        # Console error reducer
npm run dev:status       # Development status check
```

### ☁️ **Cloud Development Commands**
```bash
npm run dev:cloud        # Vercel cloud development
npm run deploy:staging   # Deploy to staging environment
npm run deploy:production # Deploy to production environment
```

### 🧪 **Testing Commands**
```bash
npm run test:quick       # Quick local testing
npm run test:staging     # Test against staging environment
npm run test:production  # Test against production environment
npm run test:daily       # Daily development testing
npm run test:weekly      # Comprehensive weekly testing
```

### 🔧 **Debug Commands**
```bash
npm run debug:start      # Debug mode with full logging
npm run debug:research   # Research-specific debugging
npm run debug:performance # Performance debugging
npm run debug:console    # Console output analysis
npm run debug:all        # Complete debug report
```

---

## 🌍 **ENVIRONMENT OVERVIEW**

### 🏠 **Local Environment**
- **URL**: http://localhost:5175 (frontend) + http://localhost:3003 (API)
- **Database**: Production Supabase (for data consistency)
- **Purpose**: Daily development, rapid iteration
- **Speed**: Instant hot reload, immediate feedback
- **Best for**: Feature development, debugging, rapid prototyping

### 🧪 **Development Environment** (Feature Branches)
- **URL**: Auto-generated preview URLs (https://researchhub-saas-[hash].vercel.app)
- **Database**: Production Supabase
- **Purpose**: Feature validation, individual testing
- **Deployment**: Automatic on feature branch push
- **Best for**: Feature testing, stakeholder previews

### 🔄 **Staging Environment**
- **URL**: https://researchhub-saas-rmwizk1az-mohmmed-alwakids-projects.vercel.app
- **Database**: Production Supabase (or staging database if configured)
- **Purpose**: Team testing, integration validation
- **Deployment**: Automatic on staging branch push
- **Best for**: Team collaboration, pre-production testing

### 🚀 **Production Environment**
- **URL**: https://researchhub-saas-ca57yz24b-mohmmed-alwakids-projects.vercel.app
- **Database**: Production Supabase
- **Purpose**: Live platform for end users
- **Deployment**: Automatic on main branch push
- **Best for**: Stable releases, user access

---

## 🎯 **WHEN TO USE EACH ENVIRONMENT**

### Use **Local Development** for:
- ✅ Daily feature development
- ✅ Rapid prototyping and experimentation
- ✅ Debugging with browser dev tools
- ✅ Initial testing and validation
- ✅ UI/UX iteration and design changes

### Use **Cloud Environments** for:
- ✅ Environment parity testing
- ✅ Team collaboration and reviews
- ✅ Stakeholder demonstrations
- ✅ Pre-production validation
- ✅ Performance testing with real infrastructure

### Use **Staging** specifically for:
- ✅ Integration testing
- ✅ Team approval workflows
- ✅ User acceptance testing
- ✅ Final validation before production
- ✅ Training and documentation

### Use **Production** for:
- ✅ Live user access
- ✅ Real user research studies
- ✅ Production monitoring and analytics
- ✅ Stable feature releases only

---

## 🔍 **TROUBLESHOOTING**

### Local Development Issues:
```bash
# Clear local cache
npm run cleanup

# Restart development server
npm run dev:fullstack

# Check ports
netstat -ano | findstr ":5175\|:3003"
```

### Cloud Deployment Issues:
```bash
# Check deployment status
vercel ls

# Check environment variables
vercel env ls

# Redeploy manually
npm run deploy:staging
```

### Database Connection Issues:
- Verify Supabase project is active
- Check environment variables
- Validate database URL format

---

## 🏆 **BEST PRACTICES**

### Development Best Practices:
1. **Start local**: Always begin with `npm run dev:fullstack`
2. **Test early**: Push to feature branches for cloud validation
3. **Collaborate in staging**: Use staging for team testing
4. **Deploy confidently**: Only merge to main after staging approval

### Git Workflow Best Practices:
1. **Feature branches**: Create from `develop` or `staging`
2. **Descriptive commits**: Use conventional commit messages
3. **Small changes**: Keep feature branches focused and small
4. **Test before merge**: Always test in staging before production

### Environment Best Practices:
1. **Local first**: Use local for development speed
2. **Cloud validate**: Use cloud for environment parity
3. **Staging approval**: Always test in staging before production
4. **Production stability**: Only deploy thoroughly tested features

---

**This hybrid approach gives you the best of both worlds: local development speed with cloud deployment confidence!**
