@echo off
REM 🚀 Multi-Environment Setup Script for ResearchHub (Windows)
REM This script helps you implement the 3-environment Vercel strategy

title ResearchHub Multi-Environment Setup

echo 🚀 ResearchHub Multi-Environment Setup
echo =====================================
echo.

REM Check if Vercel CLI is installed
echo 🔍 Checking Vercel CLI...
vercel --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Vercel CLI not found. Installing...
    npm install -g vercel
    if %errorlevel% neq 0 (
        echo ❌ Failed to install Vercel CLI
        pause
        exit /b 1
    )
    echo ✅ Vercel CLI installed successfully
) else (
    echo ✅ Vercel CLI is installed
)

echo.
echo 🌳 Setting up branch structure...

REM Create staging branch
git checkout -b staging 2>nul || git checkout staging
git push -u origin staging 2>nul || echo ℹ️  Staging branch already exists

REM Create develop branch  
git checkout -b develop 2>nul || git checkout develop
git push -u origin develop 2>nul || echo ℹ️  Develop branch already exists

REM Back to main
git checkout main

echo ✅ Branch structure ready (main, staging, develop)

echo.
echo 📝 Creating environment configuration templates...

REM Production environment template
(
echo # Production Environment Variables
echo ENVIRONMENT_NAME=production
echo SUPABASE_URL=https://prod-project.supabase.co
echo SUPABASE_ANON_KEY=your_production_anon_key
echo SUPABASE_SERVICE_ROLE_KEY=your_production_service_key
echo NEXT_PUBLIC_APP_URL=https://researchhub.com
echo NODE_ENV=production
) > .env.production.template

REM Staging environment template
(
echo # Staging Environment Variables
echo ENVIRONMENT_NAME=staging
echo SUPABASE_URL=https://staging-project.supabase.co
echo SUPABASE_ANON_KEY=your_staging_anon_key
echo SUPABASE_SERVICE_ROLE_KEY=your_staging_service_key
echo NEXT_PUBLIC_APP_URL=https://staging-researchhub.vercel.app
echo NODE_ENV=production
) > .env.staging.template

REM Development environment template
(
echo # Development Environment Variables
echo ENVIRONMENT_NAME=development
echo SUPABASE_URL=https://dev-project.supabase.co
echo SUPABASE_ANON_KEY=your_development_anon_key
echo SUPABASE_SERVICE_ROLE_KEY=your_development_service_key
echo NEXT_PUBLIC_APP_URL=https://dev-researchhub.vercel.app
echo NODE_ENV=development
) > .env.development.template

echo ✅ Environment templates created (.env.*.template files)

echo.
echo 🔧 Creating environment detection utility...

if not exist "api\lib" mkdir "api\lib"

(
echo /**
echo  * Environment Detection Utility
echo  * Provides consistent environment detection across all API functions
echo  */
echo.
echo export const getEnvironment = ^(^) =^> {
echo   const env = process.env.ENVIRONMENT_NAME ^|^| 'development';
echo   const isProduction = env === 'production';
echo   const isStaging = env === 'staging';
echo   const isDevelopment = env === 'development';
echo.  
echo   return {
echo     env,
echo     isProduction,
echo     isStaging,
echo     isDevelopment,
echo     databaseUrl: process.env.SUPABASE_URL,
echo     serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
echo     anonKey: process.env.SUPABASE_ANON_KEY,
echo     appUrl: process.env.NEXT_PUBLIC_APP_URL ^|^| 'http://localhost:3000'
echo   };
echo };
echo.
echo export const envLog = ^(level, message, data = null^) =^> {
echo   const { env, isProduction } = getEnvironment^(^);
echo   
echo   if ^(isProduction ^&^& level === 'debug'^) return;
echo   
echo   const timestamp = new Date^(^).toISOString^(^);
echo   const prefix = `[${env.toUpperCase^(^)}] ${timestamp}`;
echo   
echo   switch ^(level^) {
echo     case 'error':
echo       console.error^(`❌ ${prefix} ERROR:`, message, data^);
echo       break;
echo     case 'warn':
echo       console.warn^(`⚠️  ${prefix} WARN:`, message, data^);
echo       break;
echo     case 'info':
echo       console.info^(`ℹ️  ${prefix} INFO:`, message, data^);
echo       break;
echo     case 'debug':
echo       console.log^(`🔧 ${prefix} DEBUG:`, message, data^);
echo       break;
echo     default:
echo       console.log^(`${prefix}`, message, data^);
echo   }
echo };
) > api\lib\environment.js

echo ✅ Environment utility created (api\lib\environment.js)

echo.
echo 📋 Creating deployment workflow guide...

(
echo # 🚀 Multi-Environment Deployment Guide
echo.
echo ## 🌍 Environment URLs
echo - **Production**: https://researchhub.com
echo - **Staging**: https://staging-researchhub.vercel.app  
echo - **Development**: https://dev-researchhub.vercel.app
echo - **Feature Branches**: https://feature-name-researchhub.vercel.app
echo.
echo ## 🔄 Development Workflow
echo.
echo ### 1. Feature Development
echo ```bash
echo git checkout develop
echo git checkout -b feature/your-feature-name
echo # Develop and test - auto-deploys to unique URL
echo git push origin feature/your-feature-name
echo ```
echo.
echo ### 2. Staging Testing
echo ```bash
echo git checkout develop
echo git merge feature/your-feature-name
echo git push origin develop
echo # Auto-deploys to staging environment
echo ```
echo.
echo ### 3. Production Release
echo ```bash
echo git checkout main
echo git merge develop  
echo git push origin main
echo # Auto-deploys to production
echo ```
echo.
echo ## 📊 Required Package.json Scripts
echo ```json
echo {
echo   "scripts": {
echo     "dev": "echo 'Use: npm run dev:staging or npm run dev:production'",
echo     "dev:production": "vercel dev --env=.env.production.local",
echo     "dev:staging": "vercel dev --env=.env.staging.local",
echo     "dev:development": "vercel dev --env=.env.development.local",
echo     "deploy:staging": "vercel --target staging",
echo     "deploy:production": "vercel --prod",
echo     "test:staging": "npm run test -- --baseURL=https://staging-researchhub.vercel.app",
echo     "test:production": "npm run test -- --baseURL=https://researchhub.com"
echo   }
echo }
echo ```
) > DEPLOYMENT_WORKFLOW.md

echo ✅ Deployment workflow guide created

echo.
echo 📋 Environment Variables Template
echo You'll need to set these in Vercel for each environment:
echo.
echo Required Environment Variables:
echo ================================
echo ENVIRONMENT_NAME=production^|staging^|development
echo SUPABASE_URL=https://your-project.supabase.co
echo SUPABASE_ANON_KEY=your-anon-key
echo SUPABASE_SERVICE_ROLE_KEY=your-service-key
echo NEXT_PUBLIC_APP_URL=https://your-domain.com
echo.
echo 💡 You'll need 3 separate Supabase projects:
echo - researchhub-production
echo - researchhub-staging  
echo - researchhub-development

echo.
echo ✅ Multi-environment setup completed!
echo.
echo 📋 Next Steps:
echo 1. Create 3 Supabase projects (production, staging, development)
echo 2. Configure environment variables in Vercel dashboard
echo 3. Update package.json scripts as shown above
echo 4. Test deployments to all environments
echo 5. Set up monitoring and alerts
echo.
echo ⚠️  Important: Configure environment variables in Vercel before first deployment
echo Visit: https://vercel.com/dashboard → Your Project → Settings → Environment Variables
echo.
echo 🌐 Vercel Dashboard: https://vercel.com/dashboard
echo 📚 Documentation: docs\VERCEL_MULTI_ENVIRONMENT_STRATEGY.md

pause
