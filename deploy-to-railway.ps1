# Railway Deployment Script for ResearchHub
# Project ID: 95c09b83-e303-4e20-9906-524cce66fc3b
# API Service ID: b6d5be6d-c0a6-41df-8de1-246041664847
# MongoDB Service ID: a5167c02-6c3d-4a91-9c11-46a828ea0976

Write-Host "🚀 Starting Railway Deployment for ResearchHub..." -ForegroundColor Green

# Install Railway CLI if not already installed
Write-Host "📦 Checking Railway CLI..." -ForegroundColor Yellow
if (!(Get-Command railway -ErrorAction SilentlyContinue)) {
    Write-Host "Installing Railway CLI..." -ForegroundColor Yellow
    npm install -g @railway/cli
} else {
    Write-Host "✅ Railway CLI already installed" -ForegroundColor Green
}

# Set Railway API Token
Write-Host "🔑 Setting Railway API Token..." -ForegroundColor Yellow
$env:RAILWAY_TOKEN = "54e8862b-42ee-451a-8aa7-6daf0379a515"

# Link to Railway project
Write-Host "🔗 Linking to Railway project..." -ForegroundColor Yellow
railway link 95c09b83-e303-4e20-9906-524cce66fc3b

# Set environment variables for the API service
Write-Host "⚙️ Setting environment variables..." -ForegroundColor Yellow

# Core environment variables
railway variables set NODE_ENV=production --service=b6d5be6d-c0a6-41df-8de1-246041664847
railway variables set PORT=3002 --service=b6d5be6d-c0a6-41df-8de1-246041664847
railway variables set HOST=0.0.0.0 --service=b6d5be6d-c0a6-41df-8de1-246041664847

# JWT secrets (using strong generated secrets for production)
railway variables set JWT_SECRET="rh_jwt_prod_$(Get-Random)_$(Get-Date -Format 'yyyyMMddHHmmss')" --service=b6d5be6d-c0a6-41df-8de1-246041664847
railway variables set JWT_REFRESH_SECRET="rh_refresh_prod_$(Get-Random)_$(Get-Date -Format 'yyyyMMddHHmmss')" --service=b6d5be6d-c0a6-41df-8de1-246041664847

# CORS settings
railway variables set CLIENT_URL="https://afakarm.vercel.app" --service=b6d5be6d-c0a6-41df-8de1-246041664847
railway variables set CORS_ORIGIN="https://afakarm.vercel.app" --service=b6d5be6d-c0a6-41df-8de1-246041664847

# Get MongoDB connection URL from the database service
Write-Host "🗄️ Getting MongoDB connection URL..." -ForegroundColor Yellow
$mongoUrl = railway variables get DATABASE_URL --service=a5167c02-6c3d-4a91-9c11-46a828ea0976
if ($mongoUrl) {
    railway variables set MONGODB_URI=$mongoUrl --service=b6d5be6d-c0a6-41df-8de1-246041664847
    Write-Host "✅ MongoDB URL configured" -ForegroundColor Green
} else {
    Write-Host "⚠️ MongoDB URL not found, using fallback" -ForegroundColor Yellow
    railway variables set MONGODB_URI="mongodb://mongo:27017/researchhub" --service=b6d5be6d-c0a6-41df-8de1-246041664847
}

# Deploy the service
Write-Host "🚀 Deploying API service..." -ForegroundColor Yellow
railway up --service=b6d5be6d-c0a6-41df-8de1-246041664847

Write-Host "✅ Deployment initiated! Check Railway dashboard for progress." -ForegroundColor Green
Write-Host "📊 Project URL: https://railway.app/project/95c09b83-e303-4e20-9906-524cce66fc3b" -ForegroundColor Cyan
