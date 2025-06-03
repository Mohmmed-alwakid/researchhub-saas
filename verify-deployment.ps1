# ResearchHub Post-Deployment Verification Script
# Run this after Railway deployment to verify everything is working

param(
    [Parameter(Mandatory=$true)]
    [string]$RailwayUrl
)

Write-Host "🔍 ResearchHub Post-Deployment Verification" -ForegroundColor Cyan
Write-Host "==============================================" -ForegroundColor Cyan
Write-Host ""

# Validate Railway URL format
if (-not ($RailwayUrl -match "^https://.*\.railway\.app$")) {
    Write-Host "❌ Invalid Railway URL format. Expected: https://PROJECT-NAME.railway.app" -ForegroundColor Red
    Write-Host "Example: https://researchhub-backend-abc123.railway.app" -ForegroundColor Yellow
    exit 1
}

Write-Host "🚂 Testing Railway Backend: $RailwayUrl" -ForegroundColor Yellow

# Test Railway backend health
Write-Host ""
Write-Host "1. Testing Railway backend health..." -ForegroundColor Yellow
try {
    $healthUrl = "$RailwayUrl/api/health"
    $response = Invoke-RestMethod -Uri $healthUrl -Method Get -TimeoutSec 10
    
    if ($response.success -eq $true) {
        Write-Host "✅ Railway backend health check: PASSED" -ForegroundColor Green
        Write-Host "   Message: $($response.message)" -ForegroundColor Gray
    } else {
        Write-Host "⚠️  Railway backend health check: UNEXPECTED RESPONSE" -ForegroundColor Yellow
        Write-Host "   Response: $response" -ForegroundColor Gray
    }
} catch {
    Write-Host "❌ Railway backend health check: FAILED" -ForegroundColor Red
    Write-Host "   Error: $_" -ForegroundColor Red
    Write-Host "   Troubleshooting:" -ForegroundColor Yellow
    Write-Host "   - Check Railway deployment logs" -ForegroundColor Gray
    Write-Host "   - Verify environment variables are set" -ForegroundColor Gray
    Write-Host "   - Ensure build completed successfully" -ForegroundColor Gray
}

# Test Vercel frontend
Write-Host ""
Write-Host "2. Testing Vercel frontend..." -ForegroundColor Yellow
try {
    $frontendResponse = Invoke-WebRequest -Uri "https://researchhub-saas.vercel.app" -UseBasicParsing -TimeoutSec 10
    if ($frontendResponse.StatusCode -eq 200) {
        Write-Host "✅ Vercel frontend: ACCESSIBLE" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Vercel frontend returned status: $($frontendResponse.StatusCode)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Vercel frontend: FAILED" -ForegroundColor Red
    Write-Host "   Error: $_" -ForegroundColor Red
}

# Test API connectivity (if backend is working)
Write-Host ""
Write-Host "3. Testing API endpoints..." -ForegroundColor Yellow
try {
    $apiUrl = "$RailwayUrl/api"
    $response = Invoke-RestMethod -Uri $apiUrl -Method Get -TimeoutSec 10
    
    if ($response.success -eq $true) {
        Write-Host "✅ API root endpoint: ACCESSIBLE" -ForegroundColor Green
        Write-Host "   Version: $($response.version)" -ForegroundColor Gray
    } else {
        Write-Host "⚠️  API root endpoint: UNEXPECTED RESPONSE" -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠️  API root endpoint: FAILED" -ForegroundColor Yellow
    Write-Host "   This might be normal if endpoint doesn't exist" -ForegroundColor Gray
}

Write-Host ""
Write-Host "📋 NEXT STEPS" -ForegroundColor Cyan
Write-Host "===============" -ForegroundColor Cyan

if ($response.success -eq $true) {
    Write-Host "✅ Railway backend is working!" -ForegroundColor Green
    Write-Host ""
    Write-Host "4. Update Vercel frontend environment:" -ForegroundColor Yellow
    Write-Host "   a. Go to Vercel dashboard → Your project → Settings → Environment Variables" -ForegroundColor White
    Write-Host "   b. Add: VITE_API_URL = $RailwayUrl/api" -ForegroundColor White
    Write-Host "   c. Redeploy from Deployments tab" -ForegroundColor White
    Write-Host ""
    Write-Host "5. Test end-to-end functionality:" -ForegroundColor Yellow
    Write-Host "   a. Visit: https://researchhub-saas.vercel.app" -ForegroundColor White
    Write-Host "   b. Register a new account" -ForegroundColor White
    Write-Host "   c. Login and create a study" -ForegroundColor White
    Write-Host "   d. Verify data saves to MongoDB" -ForegroundColor White
} else {
    Write-Host "❌ Railway backend needs attention" -ForegroundColor Red
    Write-Host ""
    Write-Host "Troubleshooting steps:" -ForegroundColor Yellow
    Write-Host "1. Check Railway deployment logs" -ForegroundColor White
    Write-Host "2. Verify all environment variables are set" -ForegroundColor White
    Write-Host "3. Ensure MongoDB connection string is correct" -ForegroundColor White
    Write-Host "4. Check build completed successfully" -ForegroundColor White
}

Write-Host ""
Write-Host "📖 Full documentation: FINAL_DEPLOYMENT_CHECKLIST.md" -ForegroundColor Gray
