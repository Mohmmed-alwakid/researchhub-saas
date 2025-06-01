#!/bin/bash

# 🚀 ResearchHub Deployment Verification Script
echo "🚀 ResearchHub Deployment Verification"
echo "======================================"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print status
print_status() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ $2${NC}"
    else
        echo -e "${RED}❌ $2${NC}"
        exit 1
    fi
}

print_info() {
    echo -e "${YELLOW}🔍 $1${NC}"
}

# 1. Check Node.js version
print_info "Checking Node.js version..."
node --version
print_status $? "Node.js is installed"

# 2. Install dependencies
print_info "Installing dependencies..."
npm install --silent
print_status $? "Dependencies installed"

# 3. TypeScript compilation check
print_info "Checking TypeScript compilation..."
npx tsc --noEmit
print_status $? "Client TypeScript compilation successful"

print_info "Checking Server TypeScript compilation..."
npx tsc -p tsconfig.server.json --noEmit
print_status $? "Server TypeScript compilation successful"

# 4. Build client
print_info "Building client..."
npm run build:client > /dev/null 2>&1
print_status $? "Client build successful"

# 5. Build server
print_info "Building server..."
npm run build:server > /dev/null 2>&1
print_status $? "Server build successful"

# 6. Start server in background and test health endpoint
print_info "Starting server for health check..."
npm run start &
SERVER_PID=$!

# Wait for server to start
sleep 5

# Test health endpoint
print_info "Testing health endpoint..."
HEALTH_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3002/api/health)

if [ "$HEALTH_RESPONSE" = "200" ]; then
    print_status 0 "Health check endpoint working"
else
    print_status 1 "Health check endpoint failed (HTTP $HEALTH_RESPONSE)"
fi

# Stop the server
kill $SERVER_PID > /dev/null 2>&1

echo ""
echo "🎉 ResearchHub is ready for deployment!"
echo ""
echo "Next steps:"
echo "1. Set up environment variables on your cloud platform"
echo "2. Connect to MongoDB Atlas database"
echo "3. Deploy using GitHub Actions or manual deployment"
echo ""
echo "📚 See DEPLOYMENT_GUIDE.md for detailed instructions"
