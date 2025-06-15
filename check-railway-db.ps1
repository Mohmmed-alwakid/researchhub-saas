# Railway Database Connection Checker
# PowerShell script to test Railway deployment database connection

param(
    [string]$RailwayUrl = "",
    [switch]$DirectConnection = $false,
    [switch]$Help = $false
)

if ($Help) {
    Write-Host "Railway Database Connection Checker" -ForegroundColor Cyan
    Write-Host "====================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Usage:" -ForegroundColor Yellow
    Write-Host "  .\check-railway-db.ps1 -RailwayUrl https://your-app.railway.app"
    Write-Host ""
    Write-Host "Parameters:" -ForegroundColor Yellow
    Write-Host "  -RailwayUrl      Your Railway deployment URL"
    Write-Host "  -DirectConnection Test direct MongoDB connection (requires local MongoDB URI)"
    Write-Host "  -Help            Show this help message"
    Write-Host ""
    Write-Host "Examples:" -ForegroundColor Green
    Write-Host "  .\check-railway-db.ps1 -RailwayUrl https://researchhub-production.railway.app"
    Write-Host "  .\check-railway-db.ps1 -RailwayUrl https://my-app.railway.app -DirectConnection"
    exit 0
}

Write-Host "🚂 Railway Database Connection Checker" -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor Cyan

# Check if Node.js is available
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js detected: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js not found. Please install Node.js first." -ForegroundColor Red
    exit 1
}

# Get Railway URL if not provided
if (-not $RailwayUrl) {
    $RailwayUrl = Read-Host "Enter your Railway deployment URL (e.g., https://your-app.railway.app)"
}

# Remove trailing slash
$RailwayUrl = $RailwayUrl.TrimEnd('/')

Write-Host ""
Write-Host "🎯 Testing Railway deployment: $RailwayUrl" -ForegroundColor Blue

# Set environment variables for the test
$env:RAILWAY_URL = $RailwayUrl
if ($DirectConnection) {
    $env:TEST_DIRECT_CONNECTION = "true"
}

# Run the database check
try {
    Write-Host ""
    Write-Host "🔍 Running database connection tests..." -ForegroundColor Yellow
    
    node check-railway-database.cjs
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "🎉 All tests passed! Your Railway deployment looks healthy." -ForegroundColor Green
        Write-Host ""
        Write-Host "📊 Next steps:" -ForegroundColor Blue
        Write-Host "  1. Monitor your Railway deployment logs" -ForegroundColor White
        Write-Host "  2. Test your application functionality" -ForegroundColor White
        Write-Host "  3. Set up monitoring for the health endpoint: $RailwayUrl/api/health" -ForegroundColor White
    } else {
        Write-Host ""
        Write-Host "❌ Some tests failed. Check the output above for details." -ForegroundColor Red
        Write-Host ""
        Write-Host "🛠️ Troubleshooting:" -ForegroundColor Yellow
        Write-Host "  1. Check Railway dashboard for service status" -ForegroundColor White
        Write-Host "  2. Verify environment variables in Railway" -ForegroundColor White
        Write-Host "  3. Check Railway service logs for errors" -ForegroundColor White
        Write-Host "  4. Ensure MongoDB service is running" -ForegroundColor White
    }
} catch {
    Write-Host "❌ Failed to run database check: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Clean up environment variables
Remove-Item Env:RAILWAY_URL -ErrorAction SilentlyContinue
Remove-Item Env:TEST_DIRECT_CONNECTION -ErrorAction SilentlyContinue

Write-Host ""
Write-Host "📋 Test completed." -ForegroundColor Cyan
