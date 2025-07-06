# GitHub Configuration for ResearchHub

[![GitHub](https://img.shields.io/badge/GitHub-ResearchHub-blue)](https://github.com/Mohmmed-alwakid/researchhub-saas)
[![Issues](https://img.shields.io/github/issues/Mohmmed-alwakid/researchhub-saas)](https://github.com/Mohmmed-alwakid/researchhub-saas/issues)
[![Pull Requests](https://img.shields.io/github/issues-pr/Mohmmed-alwakid/researchhub-saas)](https://github.com/Mohmmed-alwakid/researchhub-saas/pulls)

This directory contains GitHub-specific configuration and documentation for the ResearchHub project.

## 📁 Directory Contents

### Core Configuration Files

- **`copilot-instructions.md`** - Primary AI assistant instructions ⭐
- **`copilot-development-guide.md`** - Development patterns and workflows
- **`copilot-api-reference.md`** - API endpoint documentation
- **`copilot-troubleshooting.md`** - Common issues and solutions
- **`copilot-testing-deployment.md`** - Testing and deployment guides

### GitHub Workflows

- **`workflows/deploy.yml`** - Main deployment pipeline
- **`workflows/deploy-simple.yml`** - Simplified deployment workflow

## 🤖 AI Assistant Integration

### GitHub Copilot

GitHub Copilot automatically reads `copilot-instructions.md` for context-aware code suggestions. The file contains:

- Project structure and architecture
- Coding conventions and patterns
- Current feature implementation status
- Development environment setup

### Chat Integration

Use these files with AI chat assistants:

```bash
@copilot What's the current API structure according to the reference?
@copilot How do I troubleshoot build errors?
@copilot Show me the development workflow for new features.
```

## 🔄 Workflows

### Deployment Pipeline

**Main Workflow** (`deploy.yml`):
- Triggers on push to `main` branch
- Runs TypeScript compilation check
- Builds production assets
- Deploys to Vercel
- Runs post-deployment health checks

**Simple Workflow** (`deploy-simple.yml`):
- Basic build and deploy process
- Faster execution for quick fixes

### Local Development Integration

```bash
# Check workflows locally
act -l                    # List available workflows
act push                  # Simulate push event locally
```

## 📝 Contributing Guidelines

### Pull Request Process

1. **Fork and Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Local Development**
   ```bash
   npm run dev:fullstack     # Test locally first
   ```

3. **Quality Checks**
   ```bash
   npx tsc --noEmit          # TypeScript check
   npm run build             # Production build
   ```

4. **Submit PR**
   - Use descriptive titles
   - Include testing notes
   - Reference related issues

### Issue Templates

**Bug Report Template:**
```markdown
## Bug Description
Brief description of the issue

## Steps to Reproduce
1. Go to...
2. Click on...
3. Observe...

## Expected Behavior
What should happen

## Actual Behavior
What actually happens

## Environment
- OS: [e.g., Windows 11]
- Browser: [e.g., Chrome 120]
- Node.js: [e.g., 18.17.0]
```

**Feature Request Template:**
```markdown
## Feature Description
Brief description of the proposed feature

## Use Case
Why is this feature needed?

## Implementation Ideas
How might this be implemented?

## Additional Context
Any other context or screenshots
```

## 🔐 Security

### Secrets Management

Required secrets for GitHub Actions:

```bash
SUPABASE_URL              # Supabase project URL
SUPABASE_ANON_KEY         # Public anon key
SUPABASE_SERVICE_ROLE_KEY # Service role key (sensitive)
VERCEL_TOKEN              # Vercel deployment token
```

### Security Best Practices

- Never commit sensitive environment variables
- Use GitHub secrets for deployment credentials
- Regularly rotate API keys and tokens
- Review dependencies for vulnerabilities

## 📊 Project Metrics

### Build Status

- **TypeScript**: 0 errors maintained
- **Build Time**: ~8-10 seconds
- **Bundle Size**: ~550KB (gzipped: ~144KB)
- **Dependencies**: 118 packages

### Development Metrics

- **Local Start Time**: ~3-5 seconds
- **Hot Reload**: <1 second
- **Test Account Login**: Working
- **API Response Time**: <100ms local

## 🚀 Deployment Status

### Production Environment

- **Platform**: Vercel
- **Domain**: Auto-generated Vercel domain
- **CDN**: Global edge network
- **SSL**: Automatic HTTPS

### Environment Variables

```bash
# Required for production
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Optional for full features
# DodoPayments (Required for researcher payments)
DODOPAYMENTS_API_KEY=your_api_key
DODOPAYMENTS_SECRET_KEY=your_secret_key
DODOPAYMENTS_WEBHOOK_SECRET=your_webhook_secret
```

## 🛠️ Maintenance

### Regular Tasks

- **Weekly**: Review and update dependencies
- **Monthly**: Security audit and key rotation
- **Release**: Update version tags and changelogs
- **Feature**: Update API documentation

### Documentation Updates

When to update these files:
- ✅ New API endpoints added
- ✅ Development workflow changes
- ✅ New troubleshooting scenarios discovered
- ✅ Project structure modifications
- ✅ New features implemented

---

**Last Updated**: June 20, 2025  
**Maintainer**: Development Team  
**Status**: ✅ Active Development