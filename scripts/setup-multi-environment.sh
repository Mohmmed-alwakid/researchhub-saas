#!/bin/bash
# 🚀 Multi-Environment Setup Script for ResearchHub
# This script helps you implement the 3-environment Vercel strategy

echo "🚀 ResearchHub Multi-Environment Setup"
echo "====================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if Vercel CLI is installed
check_vercel_cli() {
    if ! command -v vercel &> /dev/null; then
        print_error "Vercel CLI not found. Installing..."
        npm install -g vercel
        if [ $? -eq 0 ]; then
            print_status "Vercel CLI installed successfully"
        else
            print_error "Failed to install Vercel CLI"
            exit 1
        fi
    else
        print_status "Vercel CLI is installed"
    fi
}

# Setup branch structure
setup_branches() {
    print_info "Setting up branch structure..."
    
    # Create staging branch
    git checkout -b staging 2>/dev/null || git checkout staging
    git push -u origin staging 2>/dev/null || echo "Staging branch already exists"
    
    # Create develop branch
    git checkout -b develop 2>/dev/null || git checkout develop
    git push -u origin develop 2>/dev/null || echo "Develop branch already exists"
    
    # Back to main
    git checkout main
    
    print_status "Branch structure ready (main, staging, develop)"
}

# Display environment variables template
show_env_template() {
    echo ""
    print_info "Environment Variables Template"
    echo "You'll need to set these in Vercel for each environment:"
    echo ""
    echo "📋 Required Environment Variables:"
    echo "================================="
    echo "ENVIRONMENT_NAME=production|staging|development"
    echo "SUPABASE_URL=https://your-project.supabase.co"
    echo "SUPABASE_ANON_KEY=your-anon-key"
    echo "SUPABASE_SERVICE_ROLE_KEY=your-service-key"
    echo "NEXT_PUBLIC_APP_URL=https://your-domain.com"
    echo ""
    echo "💡 You'll need 3 separate Supabase projects:"
    echo "- researchhub-production"
    echo "- researchhub-staging"
    echo "- researchhub-development"
}

# Create environment configuration files
create_env_configs() {
    print_info "Creating environment configuration templates..."
    
    # Production environment template
    cat > .env.production.template << 'EOL'
# Production Environment Variables
ENVIRONMENT_NAME=production
SUPABASE_URL=https://prod-project.supabase.co
SUPABASE_ANON_KEY=your_production_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_production_service_key
NEXT_PUBLIC_APP_URL=https://researchhub.com
NODE_ENV=production
EOL

    # Staging environment template
    cat > .env.staging.template << 'EOL'
# Staging Environment Variables
ENVIRONMENT_NAME=staging
SUPABASE_URL=https://staging-project.supabase.co
SUPABASE_ANON_KEY=your_staging_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_staging_service_key
NEXT_PUBLIC_APP_URL=https://staging-researchhub.vercel.app
NODE_ENV=production
EOL

    # Development environment template
    cat > .env.development.template << 'EOL'
# Development Environment Variables
ENVIRONMENT_NAME=development
SUPABASE_URL=https://dev-project.supabase.co
SUPABASE_ANON_KEY=your_development_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_development_service_key
NEXT_PUBLIC_APP_URL=https://dev-researchhub.vercel.app
NODE_ENV=development
EOL

    print_status "Environment templates created (.env.*.template files)"
}

# Update package.json scripts
update_package_scripts() {
    print_info "Updating package.json scripts for multi-environment..."
    
    # Create a backup
    cp package.json package.json.backup
    
    # Note: This would need to be implemented with a proper JSON parser
    # For now, we'll just show what needs to be added
    echo ""
    print_warning "Manual Step Required: Update package.json scripts"
    echo "Add these scripts to your package.json:"
    echo ""
    echo '{
  "scripts": {
    "dev": "echo \"Use: npm run dev:staging or npm run dev:production\"",
    "dev:production": "vercel dev --env=.env.production.local",
    "dev:staging": "vercel dev --env=.env.staging.local", 
    "dev:development": "vercel dev --env=.env.development.local",
    "deploy:staging": "vercel --target staging",
    "deploy:production": "vercel --prod",
    "test:staging": "npm run test -- --baseURL=https://staging-researchhub.vercel.app",
    "test:production": "npm run test -- --baseURL=https://researchhub.com",
    "env:production": "vercel env pull .env.production.local --environment=production",
    "env:staging": "vercel env pull .env.staging.local --environment=preview", 
    "env:development": "vercel env pull .env.development.local --environment=development"
  }
}'
}

# Create environment detection utility
create_env_utility() {
    print_info "Creating environment detection utility..."
    
    mkdir -p api/lib
    
    cat > api/lib/environment.js << 'EOL'
/**
 * Environment Detection Utility
 * Provides consistent environment detection across all API functions
 */

export const getEnvironment = () => {
  const env = process.env.ENVIRONMENT_NAME || 'development';
  const isProduction = env === 'production';
  const isStaging = env === 'staging';
  const isDevelopment = env === 'development';
  
  return {
    env,
    isProduction,
    isStaging,
    isDevelopment,
    databaseUrl: process.env.SUPABASE_URL,
    serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    anonKey: process.env.SUPABASE_ANON_KEY,
    appUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  };
};

export const getEnvironmentConfig = () => {
  const { env, isProduction, isStaging } = getEnvironment();
  
  return {
    // Logging level
    logLevel: isProduction ? 'error' : 'debug',
    
    // Enable debug features
    enableDebug: !isProduction,
    
    // Database connection settings
    enableDemoData: isDevelopment,
    
    // Performance settings
    enableCaching: isProduction || isStaging,
    cacheTimeout: isProduction ? 300 : 60, // 5min prod, 1min staging
    
    // Security settings
    enableCORS: !isProduction,
    corsOrigin: isProduction ? 'https://researchhub.com' : '*',
    
    // Feature flags
    enableNewFeatures: isDevelopment || isStaging
  };
};

// Environment-specific logging
export const envLog = (level, message, data = null) => {
  const { env, isProduction } = getEnvironment();
  
  if (isProduction && level === 'debug') return;
  
  const timestamp = new Date().toISOString();
  const prefix = `[${env.toUpperCase()}] ${timestamp}`;
  
  switch (level) {
    case 'error':
      console.error(`❌ ${prefix} ERROR:`, message, data);
      break;
    case 'warn':
      console.warn(`⚠️  ${prefix} WARN:`, message, data);
      break;
    case 'info':
      console.info(`ℹ️  ${prefix} INFO:`, message, data);
      break;
    case 'debug':
      console.log(`🔧 ${prefix} DEBUG:`, message, data);
      break;
    default:
      console.log(`${prefix}`, message, data);
  }
};
EOL

    print_status "Environment utility created (api/lib/environment.js)"
}

# Create deployment workflow
create_deployment_guide() {
    print_info "Creating deployment workflow guide..."
    
    cat > DEPLOYMENT_WORKFLOW.md << 'EOL'
# 🚀 Deployment Workflow Guide

## 🔄 Development Workflow

### 1. Feature Development
```bash
# Start new feature
git checkout develop
git pull origin develop
git checkout -b feature/your-feature-name

# Develop and test
# Automatic deployment to: https://feature-your-feature-name-researchhub.vercel.app

# Push changes
git add .
git commit -m "feat: your feature description"
git push origin feature/your-feature-name
```

### 2. Integration Testing
```bash
# Merge to develop for staging testing
git checkout develop
git merge feature/your-feature-name
git push origin develop

# Automatic deployment to: https://dev-researchhub.vercel.app
# Test thoroughly in staging environment
```

### 3. Production Release
```bash
# Merge to main for production
git checkout main
git merge develop
git push origin main

# Automatic deployment to: https://researchhub.com
# Monitor deployment and verify functionality
```

## 🛠️ Environment Commands

### Development
```bash
npm run dev:development    # Local development with dev environment
npm run test:development   # Test against development environment
```

### Staging
```bash
npm run dev:staging        # Local development with staging environment
npm run deploy:staging     # Manual staging deployment
npm run test:staging       # Test against staging environment
```

### Production
```bash
npm run dev:production     # Local development with production environment
npm run deploy:production  # Manual production deployment
npm run test:production    # Test against production environment
```

## 📊 Environment URLs

- **Production**: https://researchhub.com
- **Staging**: https://staging-researchhub.vercel.app
- **Development**: https://dev-researchhub.vercel.app
- **Feature Branches**: https://feature-name-researchhub.vercel.app

## 🔒 Environment Variables

Each environment has its own set of variables:
- Production: Real data, live integrations
- Staging: Copy of production data (anonymized)
- Development: Test data, demo content

## ✅ Pre-deployment Checklist

### Before Staging
- [ ] All tests pass locally
- [ ] Feature works with development data
- [ ] No console errors
- [ ] Mobile responsive

### Before Production  
- [ ] Staging tests pass
- [ ] Performance acceptable
- [ ] Security review complete
- [ ] Database migrations tested
- [ ] Rollback plan ready

## 🚨 Emergency Procedures

### Rollback Production
```bash
# Quick rollback to previous deployment
vercel rollback --prod

# Or rollback to specific deployment
vercel rollback <deployment-url> --prod
```

### Emergency Hotfix
```bash
# Create hotfix branch from main
git checkout main
git checkout -b hotfix/critical-fix

# Make minimal fix
# Test thoroughly
# Deploy directly to production if critical
```
EOL

    print_status "Deployment workflow guide created (DEPLOYMENT_WORKFLOW.md)"
}

# Main execution
main() {
    echo "Starting multi-environment setup..."
    echo ""
    
    # Run setup steps
    check_vercel_cli
    setup_branches
    create_env_configs
    create_env_utility
    update_package_scripts
    create_deployment_guide
    show_env_template
    
    echo ""
    print_status "Multi-environment setup completed!"
    echo ""
    print_info "Next Steps:"
    echo "1. Create 3 Supabase projects (production, staging, development)"
    echo "2. Configure environment variables in Vercel dashboard"
    echo "3. Update package.json scripts as shown above"
    echo "4. Test deployments to all environments"
    echo "5. Set up monitoring and alerts"
    echo ""
    print_warning "Important: Configure environment variables in Vercel before first deployment"
    echo "Visit: https://vercel.com/dashboard → Your Project → Settings → Environment Variables"
}

# Run the script
main "$@"
