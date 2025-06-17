# ResearchHub Atlas Deployment Script
# This script will deploy your ResearchHub backend to Railway with MongoDB Atlas

Write-Host "=== ResearchHub Atlas Deployment Script ===" -ForegroundColor Green

# MongoDB Atlas Connection String (from previous check)
$ATLAS_URI = "mongodb+srv://afakar1:afakar123@cluster0.9t1u5.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"

Write-Host "`n1. Connecting to researchhub-backend project..." -ForegroundColor Yellow
railway link researchhub-backend

Write-Host "`n2. Setting up MongoDB Atlas connection..." -ForegroundColor Yellow
railway variables set MONGODB_URI="$ATLAS_URI"

Write-Host "`n3. Setting up other required environment variables..." -ForegroundColor Yellow
railway variables set NODE_ENV=production
railway variables set PORT=3002
railway variables set JWT_SECRET="researchhub-jwt-secret-2025-production"
railway variables set JWT_REFRESH_SECRET="researchhub-refresh-secret-2025-production"

Write-Host "`n4. Checking current variables..." -ForegroundColor Yellow
railway variables

Write-Host "`n5. Deploying the application..." -ForegroundColor Yellow
railway up --detach

Write-Host "`n6. Checking deployment status..." -ForegroundColor Yellow
railway status

Write-Host "`n7. Getting deployment logs..." -ForegroundColor Yellow
railway logs

Write-Host "`n=== Deployment Complete ===" -ForegroundColor Green
Write-Host "Your ResearchHub backend is now deployed with MongoDB Atlas!" -ForegroundColor Green
Write-Host "Check the logs above for any issues." -ForegroundColor Yellow
