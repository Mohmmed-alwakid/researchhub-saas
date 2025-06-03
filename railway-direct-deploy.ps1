# Railway Direct Deployment Script
# Using the API directly to deploy ResearchHub

Write-Host "🚀 Railway Direct API Deployment for ResearchHub" -ForegroundColor Green
Write-Host "Project ID: 95c09b83-e303-4e20-9906-524cce66fc3b" -ForegroundColor Cyan
Write-Host "API Service ID: b6d5be6d-c0a6-41df-8de1-246041664847" -ForegroundColor Cyan
Write-Host "MongoDB Service ID: a5167c02-6c3d-4a91-9c11-46a828ea0976" -ForegroundColor Cyan

# Check if the current directory has the project files
Write-Host "📂 Verifying project structure..." -ForegroundColor Yellow
if (Test-Path "src/server/index.ts") {
    Write-Host "✅ Backend server files found" -ForegroundColor Green
} else {
    Write-Host "❌ Backend server files not found in current directory" -ForegroundColor Red
}

if (Test-Path "package.json") {
    Write-Host "✅ Package.json found" -ForegroundColor Green
} else {
    Write-Host "❌ Package.json not found" -ForegroundColor Red
}

if (Test-Path "railway.toml") {
    Write-Host "✅ Railway configuration found" -ForegroundColor Green
} else {
    Write-Host "❌ Railway configuration not found" -ForegroundColor Red
}

# Check the latest commit
Write-Host "📝 Checking Git status..." -ForegroundColor Yellow
git log --oneline -1
git status --porcelain

Write-Host "🔗 Railway Project URLs:" -ForegroundColor Cyan
Write-Host "Dashboard: https://railway.app/project/95c09b83-e303-4e20-9906-524cce66fc3b" -ForegroundColor White
Write-Host "API Service: https://railway.app/project/95c09b83-e303-4e20-9906-524cce66fc3b/service/b6d5be6d-c0a6-41df-8de1-246041664847" -ForegroundColor White
Write-Host "MongoDB Service: https://railway.app/project/95c09b83-e303-4e20-9906-524cce66fc3b/service/a5167c02-6c3d-4a91-9c11-46a828ea0976" -ForegroundColor White

Write-Host "⚠️ Manual Steps Required:" -ForegroundColor Yellow
Write-Host "1. Go to: https://railway.app/project/95c09b83-e303-4e20-9906-524cce66fc3b/service/b6d5be6d-c0a6-41df-8de1-246041664847" -ForegroundColor White
Write-Host "2. Click 'Connect Repo' and select the aymaneids/afakarm repository" -ForegroundColor White
Write-Host "3. Set the following environment variables:" -ForegroundColor White
Write-Host "   - NODE_ENV=production" -ForegroundColor Gray
Write-Host "   - PORT=3002" -ForegroundColor Gray
Write-Host "   - HOST=0.0.0.0" -ForegroundColor Gray
Write-Host "   - MONGODB_URI=mongodb://researchhub-mongodb.railway.internal:27017/researchhub" -ForegroundColor Gray
Write-Host "   - JWT_SECRET=your-strong-jwt-secret" -ForegroundColor Gray
Write-Host "   - JWT_REFRESH_SECRET=your-strong-refresh-secret" -ForegroundColor Gray
Write-Host "   - CLIENT_URL=https://afakarm.vercel.app" -ForegroundColor Gray
Write-Host "   - CORS_ORIGIN=https://afakarm.vercel.app" -ForegroundColor Gray
Write-Host "4. In Settings, set:" -ForegroundColor White
Write-Host "   - Build Command: npm ci && npm run build:server" -ForegroundColor Gray
Write-Host "   - Start Command: node dist/server/server/index.js" -ForegroundColor Gray
Write-Host "   - Health Check Path: /health" -ForegroundColor Gray
Write-Host "5. Click 'Deploy'" -ForegroundColor White

Write-Host "🎯 Expected Deployment Results:" -ForegroundColor Green
Write-Host "- Health check should pass at /health endpoint" -ForegroundColor White
Write-Host "- API should be accessible at your Railway domain" -ForegroundColor White
Write-Host "- MongoDB connection should be established" -ForegroundColor White
