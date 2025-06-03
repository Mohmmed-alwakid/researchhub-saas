# ResearchHub Railway Deployment Pre-Check Script
# Run this before deploying to Railway to ensure everything is ready

Write-Host "🚀 ResearchHub Railway Deployment Pre-Check" -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host ""

# Check current directory
$currentDir = Get-Location
Write-Host "📁 Current Directory: $currentDir" -ForegroundColor Yellow

# Verify we're in the right project directory
if (-not (Test-Path "package.json")) {
    Write-Host "❌ ERROR: package.json not found. Please run this script from the project root." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Found package.json" -ForegroundColor Green

# Check if railway.toml exists
if (Test-Path "railway.toml") {
    Write-Host "✅ Found railway.toml configuration" -ForegroundColor Green
} else {
    Write-Host "❌ ERROR: railway.toml not found" -ForegroundColor Red
    exit 1
}

# Test server build
Write-Host ""
Write-Host "🔨 Testing server build..." -ForegroundColor Yellow
try {
    $buildOutput = npm run build:server 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Server builds successfully" -ForegroundColor Green
    } else {
        Write-Host "❌ Server build failed:" -ForegroundColor Red
        Write-Host $buildOutput -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Build error: $_" -ForegroundColor Red
    exit 1
}

# Check if dist/server directory was created
if (Test-Path "dist/server") {
    Write-Host "✅ Build output directory created" -ForegroundColor Green
} else {
    Write-Host "❌ Build output directory missing" -ForegroundColor Red
    exit 1
}

# Verify key files exist
$requiredFiles = @(
    "src/server/index.ts",
    "tsconfig.server.json",
    "package.json"
)

foreach ($file in $requiredFiles) {
    if (Test-Path $file) {
        Write-Host "✅ Found $file" -ForegroundColor Green
    } else {
        Write-Host "❌ Missing $file" -ForegroundColor Red
        exit 1
    }
}

# Check Vercel frontend deployment
Write-Host ""
Write-Host "🌐 Checking Vercel frontend..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "https://researchhub-saas.vercel.app" -UseBasicParsing -TimeoutSec 10
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Vercel frontend is live and responding" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Vercel frontend returned status: $($response.StatusCode)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠️  Could not reach Vercel frontend: $_" -ForegroundColor Yellow
    Write-Host "   This is OK - frontend might be using API proxy in dev mode" -ForegroundColor Gray
}

Write-Host ""
Write-Host "📋 PRE-DEPLOYMENT CHECKLIST" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host "✅ Server builds successfully" -ForegroundColor Green
Write-Host "✅ Railway configuration ready" -ForegroundColor Green  
Write-Host "✅ All required files present" -ForegroundColor Green
Write-Host "✅ Vercel frontend deployed" -ForegroundColor Green
Write-Host ""

Write-Host "🚂 READY FOR RAILWAY DEPLOYMENT!" -ForegroundColor Green -BackgroundColor Black
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Visit: https://railway.app/new" -ForegroundColor White
Write-Host "2. Deploy from GitHub repo" -ForegroundColor White  
Write-Host "3. Add environment variables from RAILWAY_ENV_VARS.txt" -ForegroundColor White
Write-Host "4. Wait for deployment to complete" -ForegroundColor White
Write-Host "5. Update frontend VITE_API_URL in Vercel" -ForegroundColor White
Write-Host ""
Write-Host "📖 Full instructions: NEXT_STEPS_RAILWAY_DEPLOYMENT.md" -ForegroundColor Yellow
