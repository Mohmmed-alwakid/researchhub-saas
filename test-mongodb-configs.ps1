# Railway MongoDB Connection Tester
# Tests different MongoDB URI configurations for Railway

param(
    [string]$RailwayUrl = "",
    [switch]$Help = $false
)

if ($Help) {
    Write-Host "Railway MongoDB Connection Tester" -ForegroundColor Cyan
    Write-Host "==================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "This script helps test different MongoDB configurations for Railway"
    Write-Host ""
    Write-Host "Usage: .\test-mongodb-configs.ps1 -RailwayUrl https://your-app.railway.app"
    exit 0
}

Write-Host "🔧 Railway MongoDB Configuration Tester" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan

if (-not $RailwayUrl) {
    $RailwayUrl = Read-Host "Enter your Railway deployment URL"
}

# Remove trailing slash
$RailwayUrl = $RailwayUrl.TrimEnd('/')

Write-Host ""
Write-Host "🎯 Testing Railway deployment: $RailwayUrl" -ForegroundColor Blue

# Test current configuration
Write-Host ""
Write-Host "📊 Current Configuration Test" -ForegroundColor Yellow
Write-Host "-----------------------------" -ForegroundColor Yellow

try {
    node quick-railway-check.cjs $RailwayUrl
} catch {
    Write-Host "❌ Current configuration test failed" -ForegroundColor Red
}

Write-Host ""
Write-Host "💡 MongoDB Configuration Recommendations" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green

Write-Host ""
Write-Host "1. Check Railway Dashboard:" -ForegroundColor Blue
Write-Host "   • Go to https://railway.app/dashboard" -ForegroundColor White
Write-Host "   • Open your project" -ForegroundColor White
Write-Host "   • Check MongoDB service name and status" -ForegroundColor White

Write-Host ""
Write-Host "2. Common MongoDB URI Patterns:" -ForegroundColor Blue
Write-Host "   Option A: " -ForegroundColor Yellow -NoNewline
Write-Host "MONGODB_URI=" -ForegroundColor White -NoNewline
Write-Host "`${{ MongoDB.MONGO_URL }}/researchhub" -ForegroundColor Green

Write-Host "   Option B: " -ForegroundColor Yellow -NoNewline
Write-Host "MONGODB_URI=" -ForegroundColor White -NoNewline
Write-Host "`${{ Mongo.MONGO_URL }}/researchhub" -ForegroundColor Green

Write-Host "   Option C: " -ForegroundColor Yellow -NoNewline
Write-Host "MONGODB_URI=" -ForegroundColor White -NoNewline
Write-Host "`${{ YourServiceName.MONGO_URL }}/researchhub" -ForegroundColor Green

Write-Host ""
Write-Host "3. Atlas Fallback (Emergency):" -ForegroundColor Blue
Write-Host "   MONGODB_URI=" -ForegroundColor White -NoNewline
Write-Host "mongodb+srv://abwanwr77:CFm4JCkjeFpKpzO4@cluster0.ackancs.mongodb.net/researchhub?retryWrites=true&w=majority" -ForegroundColor Green

Write-Host ""
Write-Host "🔧 Steps to Fix:" -ForegroundColor Red
Write-Host "1. Check MongoDB service name in Railway dashboard" -ForegroundColor White
Write-Host "2. Update MONGODB_URI environment variable" -ForegroundColor White  
Write-Host "3. Redeploy your Railway service" -ForegroundColor White
Write-Host "4. Run this test again: .\test-mongodb-configs.ps1 -RailwayUrl $RailwayUrl" -ForegroundColor White

Write-Host ""
Write-Host "📊 Health Check URL: $RailwayUrl/api/health" -ForegroundColor Cyan

Write-Host ""
Write-Host "💻 Want to test after making changes?" -ForegroundColor Yellow
$testAgain = Read-Host "Press 'y' to test again, or any key to exit"

if ($testAgain -eq 'y' -or $testAgain -eq 'Y') {
    Write-Host ""
    Write-Host "🔄 Testing again..." -ForegroundColor Blue
    node quick-railway-check.cjs $RailwayUrl
}

Write-Host ""
Write-Host "✅ Testing completed." -ForegroundColor Green
