#!/bin/bash

# AUTOMATED DEPLOYMENT PREVENTION SYSTEM
# Prevents broken API deployments by checking critical components

echo "🔍 Pre-deployment API Health Check..."

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if environment variables are set
echo "📋 Checking environment variables..."

if [ -z "$SUPABASE_URL" ]; then
    echo -e "${RED}❌ SUPABASE_URL not set${NC}"
    echo "Please set SUPABASE_URL environment variable"
    echo "Run: vercel env add SUPABASE_URL production"
    exit 1
else
    echo -e "${GREEN}✅ SUPABASE_URL configured${NC}"
fi

if [ -z "$SUPABASE_ANON_KEY" ]; then
    echo -e "${RED}❌ SUPABASE_ANON_KEY not set${NC}"
    echo "Please set SUPABASE_ANON_KEY environment variable"
    echo "Run: vercel env add SUPABASE_ANON_KEY production"
    exit 1
else
    echo -e "${GREEN}✅ SUPABASE_ANON_KEY configured${NC}"
fi

if [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
    echo -e "${YELLOW}⚠️  SUPABASE_SERVICE_ROLE_KEY not set (optional)${NC}"
else
    echo -e "${GREEN}✅ SUPABASE_SERVICE_ROLE_KEY configured${NC}"
fi

# Check critical API files exist
echo "📁 Checking API files..."

if [ ! -f "api/research-consolidated.js" ]; then
    echo -e "${RED}❌ research-consolidated.js missing${NC}"
    exit 1
else
    echo -e "${GREEN}✅ research-consolidated.js exists${NC}"
fi

if [ ! -f "api/health.js" ]; then
    echo -e "${RED}❌ health.js missing${NC}"
    exit 1
else
    echo -e "${GREEN}✅ health.js exists${NC}"
fi

# Check package.json has required dependencies
echo "📦 Checking dependencies..."

if ! grep -q "@supabase/supabase-js" package.json; then
    echo -e "${RED}❌ @supabase/supabase-js not in dependencies${NC}"
    echo "Run: npm install @supabase/supabase-js"
    exit 1
else
    echo -e "${GREEN}✅ Supabase dependency found${NC}"
fi

# Check syntax of critical API files
echo "🔧 Checking API syntax..."

# Use Node.js to check syntax
if node -c api/research-consolidated.js 2>/dev/null; then
    echo -e "${GREEN}✅ research-consolidated.js syntax OK${NC}"
else
    echo -e "${RED}❌ research-consolidated.js syntax error${NC}"
    node -c api/research-consolidated.js
    exit 1
fi

echo -e "${GREEN}🎉 All checks passed! Safe to deploy.${NC}"
echo ""
echo "🚀 Deploying to production..."

# Deploy to Vercel
vercel --prod --yes

echo ""
echo "🔍 Post-deployment health check..."

# Wait a moment for deployment to be ready
sleep 10

# Check if API is responding
if curl -f -s "https://researchhub-saas.vercel.app/api/health" > /dev/null; then
    echo -e "${GREEN}✅ API health check passed${NC}"
else
    echo -e "${RED}❌ API health check failed${NC}"
    echo "🔧 Check deployment logs and environment variables"
    exit 1
fi

echo -e "${GREEN}🎉 Deployment successful and verified!${NC}"
